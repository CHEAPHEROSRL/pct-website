import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { safeParse } from "@/lib/redis-safe";
import { RATE_LIMITS } from "@/lib/security";
import type { PledgeRecord } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// GET /api/pledges/section-counts — public, returns { counts: { [sectionId]: number } }
//
// Powers the "X pledgers" badge next to each row in the section picker on the
// pledge form, and the cluster sizes on the trail map. Counts only confirmed
// (live) pledgers — pending pledges are excluded so an unconfirmed claim
// doesn't inflate a section's apparent popularity.
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ counts: {} });
  }

  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const counts: Record<string, number> = {};

    for (const raw of rawList || []) {
      const record = safeParse<PledgeRecord | null>(raw, null);
      if (!record?.claimedSection) continue;
      counts[record.claimedSection] = (counts[record.claimedSection] || 0) + 1;
    }

    return NextResponse.json({ counts });
  } catch (err) {
    console.error("Failed to compute section counts:", err);
    return NextResponse.json({ counts: {} });
  }
}
