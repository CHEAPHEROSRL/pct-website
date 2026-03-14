import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { SupportRecord, SupportGiftLocation } from "@/lib/types";
import { formatDate } from "@/lib/donor-utils";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const fallbackLocations: SupportGiftLocation[] = [
  { giftTitle: "A Trail Meal", name: "Sarah M.", amount: 15, lat: 33.35, lng: -116.70, trailMile: 100, date: "Mar 30, 2026" },
  { giftTitle: "Trail Boots", name: "Robert W.", amount: 150, lat: 33.47, lng: -116.72, trailMile: 120, date: "Apr 2, 2026" },
  { giftTitle: "A Night at Camp", name: "Anonymous", amount: 25, lat: 33.82, lng: -116.83, trailMile: 180, date: "Apr 8, 2026" },
  { giftTitle: "A Resupply Box", name: "James K.", amount: 75, lat: 34.18, lng: -117.30, trailMile: 280, date: "Apr 15, 2026" },
  { giftTitle: "Hiking Socks", name: "Lisa P.", amount: 20, lat: 34.68, lng: -118.25, trailMile: 450, date: "Apr 25, 2026" },
  { giftTitle: "A Rest Day in Town", name: "Tom H.", amount: 100, lat: 34.82, lng: -118.52, trailMile: 520, date: "May 1, 2026" },
  { giftTitle: "A Trail Meal", name: "Dr. Amanda B.", amount: 15, lat: 36.02, lng: -118.08, trailMile: 700, date: "May 15, 2026" },
  { giftTitle: "A Resupply Box", name: "Emily C.", amount: 75, lat: 36.74, lng: -118.40, trailMile: 840, date: "May 22, 2026" },
];

const cacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
};

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ locations: fallbackLocations }, { headers: cacheHeaders });
  }

  try {
    const rawList = await redis.lrange<string>("supporters:list", 0, -1);

    if (!rawList || rawList.length === 0) {
      return NextResponse.json({ locations: fallbackLocations }, { headers: cacheHeaders });
    }

    const records: SupportRecord[] = rawList.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    // Filter to records with trail coordinates
    // Filter to records with trail coordinates
    const geoRecords = records.filter((r) => r.trailLat != null && r.trailLng != null);

    // Batch-fetch media data for these records
    const mediaMap = new Map<string, Record<string, string>>();
    const mediaPipeline = geoRecords.map(async (r) => {
      const media = await redis.hgetall(`supporters:media:${r.id}`);
      if (media && Object.keys(media).length > 0) {
        mediaMap.set(r.id, media as Record<string, string>);
      }
    });
    await Promise.all(mediaPipeline);

    const locations: SupportGiftLocation[] = geoRecords.map((r) => {
      const media = mediaMap.get(r.id);
      const approved = media?.mediaApproved === "true";
      return {
        giftTitle: r.giftTitle || "Custom Gift",
        name: r.anonymous ? "Anonymous" : r.name,
        amount: r.amount,
        lat: r.trailLat!,
        lng: r.trailLng!,
        trailMile: r.trailMile ?? 0,
        date: formatDate(r.createdAt),
        message: r.message !== r.giftTitle ? r.message : undefined,
        mediaUrl: approved ? (media?.mediaUrl as string) : undefined,
        videoUrl: approved ? (media?.videoUrl as string) : undefined,
      };
    });

    // If no geolocated gifts yet, return fallback for demo
    if (locations.length === 0) {
      return NextResponse.json({ locations: fallbackLocations }, { headers: cacheHeaders });
    }

    return NextResponse.json({ locations }, { headers: cacheHeaders });
  } catch (err) {
    console.error("Failed to fetch gift locations:", err);
    return NextResponse.json({ locations: fallbackLocations }, { headers: cacheHeaders });
  }
}
