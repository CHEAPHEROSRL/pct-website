import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/security";
import type { PledgeRecord } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// GET — Retrieve current email preferences by unsubscribe token
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.unsubscribe(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const email = await redis.get<string>(`unsub:${token}`);
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    const hash = (await import("crypto")).createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
    const raw = await redis.get<string>(`pledger:${hash}`);
    if (!raw) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({
      name: record.anonymous ? "Pledger" : record.name,
      emailPreference: record.emailPreference || "all",
    });
  } catch (err) {
    console.error("Failed to fetch preferences:", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// PUT — Update email preferences
export async function PUT(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.unsubscribe(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { token, preference } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }
    if (!["all", "milestones", "finish"].includes(preference)) {
      return NextResponse.json({ error: "Preference must be 'all', 'milestones', or 'finish'" }, { status: 400 });
    }

    const email = await redis.get<string>(`unsub:${token}`);
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    const hash = (await import("crypto")).createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
    const raw = await redis.get<string>(`pledger:${hash}`);
    if (!raw) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;
    record.emailPreference = preference;
    record.updatedAt = Date.now();

    await redis.set(`pledger:${hash}`, JSON.stringify(record));

    // Update list entry
    const list = await redis.lrange<string>("pledgers:list", 0, -1);
    for (let i = 0; i < list.length; i++) {
      const item: PledgeRecord = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
      if (item.id === hash) {
        await redis.lset("pledgers:list", i, JSON.stringify(record));
        break;
      }
    }

    return NextResponse.json({
      success: true,
      emailPreference: record.emailPreference,
    });
  } catch (err) {
    console.error("Failed to update preferences:", err);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
