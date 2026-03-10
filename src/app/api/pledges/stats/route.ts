import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { PledgeRecord, PledgePublic, PledgeStats } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const fallbackStats: PledgeStats = {
  pledgerCount: 0,
  totalPledged: 0,
  averagePledge: 0,
  totalBoosts: 0,
};

const cacheHeaders = {
  "Cache-Control": "s-maxage=15, stale-while-revalidate=30",
};

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { stats: fallbackStats, topPledgers: [] },
      { headers: cacheHeaders }
    );
  }

  try {
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
    const totalPledged = (await redis.get<number>("pledgers:total_pledged")) || 0;

    // Get all pledgers for leaderboard
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    // Sort by totalPledge descending
    records.sort((a, b) => b.totalPledge - a.totalPledge);

    // Count total boosts
    let totalBoosts = 0;
    for (const r of records) {
      totalBoosts += r.boosts?.length || 0;
    }

    const stats: PledgeStats = {
      pledgerCount,
      totalPledged: Math.round(totalPledged * 100) / 100,
      averagePledge: pledgerCount > 0 ? Math.round((totalPledged / pledgerCount) * 100) / 100 : 0,
      totalBoosts,
    };

    // Top 20 pledgers (public info only)
    const topPledgers: PledgePublic[] = records.slice(0, 20).map((r) => ({
      name: r.anonymous ? "Anonymous" : r.name,
      rate: `$${r.amount}/${r.interval === 1 ? "mi" : r.interval + "mi"}`,
      totalPledge: Math.round(r.totalPledge * 100) / 100,
      boostCount: r.boosts?.length || 0,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(
      { stats, topPledgers },
      { headers: cacheHeaders }
    );
  } catch (err) {
    console.error("Failed to fetch pledge stats:", err);
    return NextResponse.json(
      { stats: fallbackStats, topPledgers: [] },
      { headers: cacheHeaders }
    );
  }
}
