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

const fallbackSupporters: SupporterPublic[] = [
  { name: "Robert Williams", amount: "$1,000", amountNum: 1000, date: "Feb 15, 2026", message: "Bought Paul new boots and a resupply box. Walk strong!", color: "#3D7A5A" },
  { name: "Anonymous", amount: "$150", amountNum: 150, date: "Feb 12, 2026", message: "Trail Boots", color: "#5B8EA6" },
  { name: "Dr. Amanda Brooks", amount: "$75", amountNum: 75, date: "Feb 10, 2026", message: "Resupply Box — keep walking, Paul!", color: "#C45C26" },
  { name: "James O\u2019Connor", amount: "$25", amountNum: 25, date: "Feb 8, 2026", message: "Camp Night", color: "#7B6B8E" },
  { name: "Sarah Mitchell", amount: "$15", amountNum: 15, date: "Feb 5, 2026", message: "Trail Meal — you\u2019re an inspiration.", color: "#A68B5B" },
  { name: "Tom & Lisa Park", amount: "$100", amountNum: 100, date: "Feb 1, 2026", message: "Rest Day — cheering for you from Oregon!", color: "#6B8E7B" },
];

const fallbackStats: SupportStats = {
  totalGifts: 2450,
  supporterCount: 34,
  averageGift: 72,
  largestGift: 1000,
};

const fallbackGiftCounts: Record<string, number> = {
  "A Trail Meal": 12,
  "Hiking Socks": 3,
  "A Night at Camp": 8,
  "A Resupply Box": 4,
  "A Rest Day in Town": 2,
  "Trail Boots": 1,
};

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
