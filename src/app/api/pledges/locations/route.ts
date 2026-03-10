import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { PledgeRecord, PledgerLocation } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { locations: [], countryCount: 0 },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  }

  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const locations: PledgerLocation[] = [];
    const countries = new Set<string>();

    for (const r of records) {
      if (typeof r.lat === "number" && typeof r.lng === "number") {
        locations.push({
          name: r.anonymous ? "Anonymous" : r.name,
          city: r.city || "Unknown",
          country: r.country || "Unknown",
          lat: r.lat,
          lng: r.lng,
        });
        if (r.country) countries.add(r.country);
      }
    }

    return NextResponse.json(
      { locations, countryCount: countries.size },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("Failed to fetch pledge locations:", err);
    return NextResponse.json({ locations: [], countryCount: 0 });
  }
}
