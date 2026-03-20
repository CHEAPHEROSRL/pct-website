import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

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
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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

    // Add to a Redis set (deduplicates automatically)
    await redis.sadd("waitlist:emails", trimmed);
    // Also store signup timestamp
    await redis.hset(`waitlist:meta:${trimmed}`, {
      email: trimmed,
      signedUpAt: new Date().toISOString(),
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
