import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { DonationRecord, DonorPublic, DonationStats } from "@/lib/types";
import { formatDate } from "@/lib/donor-utils";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const fallbackDonors: DonorPublic[] = [
  { name: "Robert Williams", amount: "$1,000", amountNum: 1000, date: "Feb 15, 2026", message: "Go Paul! My father fought cancer for 3 years. Walk strong.", color: "#3D7A5A" },
  { name: "Anonymous", amount: "$2,000", amountNum: 2000, date: "Feb 12, 2026", message: "In memory of Susan. Keep walking.", color: "#5B8EA6" },
  { name: "Dr. Amanda Brooks", amount: "$750", amountNum: 750, date: "Feb 10, 2026", message: "As an oncologist, this cause is close to my heart.", color: "#C45C26" },
  { name: "James O\u2019Connor", amount: "$500", amountNum: 500, date: "Feb 8, 2026", message: "Walk on, brother. The world needs more people like you.", color: "#7B6B8E" },
  { name: "Sarah Mitchell", amount: "$250", amountNum: 250, date: "Feb 5, 2026", message: "For my mom, a 5-year survivor. You\u2019re an inspiration.", color: "#A68B5B" },
  { name: "Tom & Lisa Park", amount: "$300", amountNum: 300, date: "Feb 1, 2026", message: "We\u2019re cheering for you from Oregon!", color: "#6B8E7B" },
];

const fallbackStats: DonationStats = {
  totalRaised: 12450,
  donorCount: 47,
  averageDonation: 265,
  largestDonation: 2000,
  goalAmount: 50000,
};

const cacheHeaders = {
  "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
};

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { donors: fallbackDonors, stats: fallbackStats },
      { headers: cacheHeaders }
    );
  }

  try {
    const rawList = await redis.lrange<string>("donors:list", 0, -1);
    const totalRaised = (await redis.get<number>("donors:total_raised")) || 0;
    const donorCount = (await redis.get<number>("donors:count")) || 0;
    const largestDonation = (await redis.get<number>("donors:largest")) || 0;

    if (!rawList || rawList.length === 0) {
      return NextResponse.json(
        { donors: fallbackDonors, stats: fallbackStats },
        { headers: cacheHeaders }
      );
    }

    const records: DonationRecord[] = rawList.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const donors: DonorPublic[] = records.map((r) => ({
      name: r.anonymous ? "Anonymous" : r.name,
      amount: r.amount >= 1000 ? `$${r.amount.toLocaleString("en-US")}` : `$${r.amount}`,
      amountNum: r.amount,
      date: formatDate(r.createdAt),
      message: r.message,
      color: r.color,
    }));

    const stats: DonationStats = {
      totalRaised,
      donorCount,
      averageDonation: donorCount > 0 ? Math.round(totalRaised / donorCount) : 0,
      largestDonation,
      goalAmount: 50000,
    };

    return NextResponse.json({ donors, stats }, { headers: cacheHeaders });
  } catch (err) {
    console.error("Failed to fetch donors:", err);
    return NextResponse.json(
      { donors: fallbackDonors, stats: fallbackStats },
      { headers: cacheHeaders }
    );
  }
}
