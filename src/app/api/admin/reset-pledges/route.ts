import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_TOKEN;
}

// POST /api/admin/reset-pledges — Clear all pledge data (admin only)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }

  try {
    // Delete pledge counters
    await redis.del("pledgers:count");
    await redis.del("pledgers:total_pledged");
    await redis.del("pledgers:list");

    // Delete individual pledge records (pledger:* keys)
    const keys = await redis.keys("pledger:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Delete pending pledges
    const pendingKeys = await redis.keys("pledge:pending:*");
    if (pendingKeys.length > 0) {
      await redis.del(...pendingKeys);
    }

    return NextResponse.json({ success: true, message: "All pledge data cleared" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset pledges", details: String(error) },
      { status: 500 }
    );
  }
}
