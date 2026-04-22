import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, consent } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Explicit consent required (GDPR-style freely-given consent).
    // The client-side checkbox must be ticked; we also gate server-side.
    if (consent !== true) {
      return NextResponse.json(
        {
          error:
            "Please tick the box confirming you agree to receive email updates.",
        },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: "Storage unavailable" },
        { status: 503 }
      );
    }

    // Check whether this email already exists in the waitlist — if so,
    // we preserve the existing unsubscribe token so old footers still work.
    const existingMeta = await redis.hgetall(`waitlist:meta:${trimmed}`);
    const existing = (existingMeta || {}) as Record<string, string>;
    let unsubscribeToken = existing.unsubscribeToken;

    if (!unsubscribeToken) {
      // Generate a new one and create a reverse-lookup so /api/unsubscribe
      // can resolve it back to this email in O(1).
      unsubscribeToken = randomBytes(24).toString("hex");
      await redis.set(`waitlist:token:${unsubscribeToken}`, trimmed);
    }

    // Add to the Redis set (deduplicates automatically)
    await redis.sadd("waitlist:emails", trimmed);
    // Store / refresh metadata
    await redis.hset(`waitlist:meta:${trimmed}`, {
      email: trimmed,
      signedUpAt: existing.signedUpAt || new Date().toISOString(),
      consent: "true",
      consentAt: existing.consentAt || new Date().toISOString(),
      unsubscribeToken,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  // Single email metadata lookup
  const emailParam = request.nextUrl.searchParams.get("email");
  if (emailParam) {
    const meta = await redis.hgetall(`waitlist:meta:${emailParam}`);
    if (!meta) {
      return NextResponse.json({ email: emailParam, signedUpAt: "" });
    }
    return NextResponse.json(meta);
  }

  // Full list
  const emails = await redis.smembers("waitlist:emails");

  // Fetch all metadata in parallel
  const detailed = await Promise.all(
    emails.map(async (email: string) => {
      const meta = await redis.hgetall(`waitlist:meta:${email}`);
      return {
        email,
        signedUpAt: (meta as Record<string, string>)?.signedUpAt || "",
      };
    })
  );

  // Sort newest first
  detailed.sort((a, b) => (b.signedUpAt || "").localeCompare(a.signedUpAt || ""));

  return NextResponse.json({ count: detailed.length, emails: detailed });
}
