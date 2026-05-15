import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { safeParse } from "@/lib/redis-safe";
import { COUNTRY_CENTERS } from "@/lib/country-centers";
import type { PledgeRecord, CountryAggregate } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * GET /api/pledges/countries
 *
 * Aggregates confirmed pledgers by country and returns one entry per
 * country that:
 *   - has at least one pledger
 *   - has a matching country-center coordinate in COUNTRY_CENTERS
 *
 * Countries missing from COUNTRY_CENTERS are silently skipped — easy to
 * add as new pledger countries appear. The endpoint never emits zero-
 * count entries (those wouldn't render a pin anyway, but we don't even
 * include them in the response).
 *
 * Powers the new flag-pin layer on the PLEDGERS tab of the trail map.
 */
export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ countries: [] });
  }

  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || [])
      .map((item) => safeParse<PledgeRecord | null>(item, null))
      .filter((r): r is PledgeRecord => r !== null);

    // Tally by country code. Uppercase the code so "us" and "US" merge
    // cleanly — Vercel returns uppercase but legacy records or manually
    // imported data might not.
    const counts = new Map<string, number>();
    for (const r of records) {
      if (!r.country) continue;
      const code = r.country.toUpperCase().trim();
      if (!code) continue;
      counts.set(code, (counts.get(code) || 0) + 1);
    }

    const countries: CountryAggregate[] = [];
    for (const [code, count] of counts) {
      const center = COUNTRY_CENTERS[code];
      if (!center) {
        // Country center not in our lookup. Skip silently — the map
        // simply won't show a pin for them. The pledger still counts
        // toward the headline pledger total (different endpoint).
        continue;
      }
      countries.push({
        code,
        name: center.name,
        count,
        lat: center.lat,
        lng: center.lng,
      });
    }

    // Sort descending by count so any future pin-rendering layer that
    // wants to layer biggest-on-top has the ordering for free.
    countries.sort((a, b) => b.count - a.count);

    return NextResponse.json(
      { countries },
      {
        // Pledger admissions are slow and admin-driven; a short edge cache
        // is fine. Country aggregate changes infrequently.
        headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
      }
    );
  } catch (err) {
    console.error("Failed to aggregate countries:", err);
    return NextResponse.json({ countries: [] });
  }
}
