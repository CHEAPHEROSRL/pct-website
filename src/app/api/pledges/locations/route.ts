import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { PledgeRecord, PledgerLocation } from "@/lib/types";
import { isMessagePublic } from "@/lib/pledge-store";

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
      { locations: [], countryCount: 0, pledgerCount: 0 },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  }

  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const locations: PledgerLocation[] = [];
    // Two distinct country sets: one that counts every country mentioned on
    // any pledge (used for the "X COUNTRIES" tab counter — represents real
    // global reach) and one we don't actually need separately for now. The
    // geolocated-only filter on the locations array is what feeds the
    // individual pins on the world-view map; the headline counts should
    // reflect ALL pledgers, not just the subset with lat/lng.
    const countries = new Set<string>();

    for (const r of records) {
      // Pin on the world map requires lat/lng — keep that filter
      if (typeof r.lat === "number" && typeof r.lng === "number") {
        locations.push({
          name: r.anonymous ? "Anonymous" : r.name,
          // Respect the pledger's choice here too. This endpoint published the
          // message unconditionally, so without this an opt-out on the form
          // would still leak onto the trail map pins.
          message: isMessagePublic(r) ? r.message : undefined,
          city: r.city || "Unknown",
          country: r.country || "Unknown",
          lat: r.lat,
          lng: r.lng,
          avatar: r.avatar,
        });
      }
      // Country counter: any record with a country field counts. Pledges
      // without geolocation (ip-api rate-limited, etc.) can still have a
      // country if it was passed through some other path; we don't want to
      // arbitrarily hide them from the headline count.
      if (r.country) countries.add(r.country);
    }

    return NextResponse.json(
      {
        locations,
        countryCount: countries.size,
        // Headline pledger count = every confirmed pledger in the list,
        // regardless of whether we have geolocation for them. The trail-map
        // UI's "X PLEDGERS" counter was previously locations.length, which
        // silently dropped to 0 anytime ip-api.com rate-limited us.
        pledgerCount: records.length,
      },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("Failed to fetch pledge locations:", err);
    return NextResponse.json({ locations: [], countryCount: 0, pledgerCount: 0 });
  }
}
