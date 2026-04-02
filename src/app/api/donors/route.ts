import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { SupportRecord, SupporterPublic, SupportStats } from "@/lib/types";
import { formatDate } from "@/lib/donor-utils";
import { GIFT_TITLES } from "@/lib/gift-estimates";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const fallbackSupporters: SupporterPublic[] = [];

const fallbackStats: SupportStats = {
  totalGifts: 0,
  supporterCount: 0,
  averageGift: 0,
  largestGift: 0,
};

const fallbackGiftCounts: Record<string, number> = {};

const cacheHeaders = {
  "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
};

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { supporters: fallbackSupporters, stats: fallbackStats, giftCounts: fallbackGiftCounts },
      { headers: cacheHeaders }
    );
  }

  try {
    const rawList = await redis.lrange<string>("supporters:list", 0, -1);
    const totalGifts = (await redis.get<number>("supporters:total")) || 0;
    const supporterCount = (await redis.get<number>("supporters:count")) || 0;
    const largestGift = (await redis.get<number>("supporters:largest")) || 0;

    if (!rawList || rawList.length === 0) {
      return NextResponse.json(
        { supporters: fallbackSupporters, stats: fallbackStats, giftCounts: fallbackGiftCounts },
        { headers: cacheHeaders }
      );
    }

    const records: SupportRecord[] = rawList.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const supporters: SupporterPublic[] = records.map((r) => ({
      name: r.anonymous ? "Anonymous" : r.name,
      amount: r.amount >= 1000 ? `$${r.amount.toLocaleString("en-US")}` : `$${r.amount}`,
      amountNum: r.amount,
      date: formatDate(r.createdAt),
      message: r.giftTitle || r.message,
      color: r.color,
    }));

    const stats: SupportStats = {
      totalGifts,
      supporterCount,
      averageGift: supporterCount > 0 ? Math.round(totalGifts / supporterCount) : 0,
      largestGift,
    };

    // Fetch per-gift-type counts
    const giftCountKeys = GIFT_TITLES.map((t) => `supporters:gift-count:${t}`);
    const rawCounts = await redis.mget<(number | null)[]>(...giftCountKeys);
    const giftCounts: Record<string, number> = {};
    GIFT_TITLES.forEach((title, i) => {
      giftCounts[title] = rawCounts[i] ?? 0;
    });

    return NextResponse.json({ supporters, stats, giftCounts }, { headers: cacheHeaders });
  } catch (err) {
    console.error("Failed to fetch supporters:", err);
    return NextResponse.json(
      { supporters: fallbackSupporters, stats: fallbackStats, giftCounts: fallbackGiftCounts },
      { headers: cacheHeaders }
    );
  }
}
