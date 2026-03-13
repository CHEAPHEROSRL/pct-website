import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// GET — Admin endpoint for honor tracking stats
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const honoredCount = (await redis.get<number>("pledgers:honored_count")) || 0;
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
    const totalPledged = (await redis.get<number>("pledgers:total_pledged")) || 0;
    const honorRate = pledgerCount > 0 ? Math.round((honoredCount / pledgerCount) * 100) : 0;

    return NextResponse.json({
      honoredCount,
      pledgerCount,
      totalPledged,
      honorRate,
      totalHonored: honoredCount,
    });
  } catch (err) {
    console.error("Failed to fetch honor stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
