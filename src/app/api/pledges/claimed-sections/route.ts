import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { safeParse } from "@/lib/redis-safe";
import { RATE_LIMITS } from "@/lib/security";
import { trailSections } from "@/lib/trail";
import { readSponsors } from "@/lib/sponsors";
import type { PledgeRecord } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

interface SectionSample {
  name: string;
  avatar?: string;
}

/**
 * Wire shape for trail-map pins. Lat/lng/name are resolved server-side so the
 * client can render directly without a second lookup. `id` is opaque to the
 * client — used only as a React key.
 */
interface ClaimedSectionEntry {
  id: string;
  name: string;
  miles: number;
  lat: number;
  lng: number;
  count: number;
  samples: SectionSample[];
  sponsor?: {
    companyName: string;
    logoUrl: string;
    websiteUrl?: string;
  };
}

// GET /api/pledges/claimed-sections — public, feeds the trail-map pin layer.
//
// Returns one entry per:
//   • named PCT section claimed by ≥1 pledger (with sponsor merged in if any)
//   • named PCT section with a sponsor but no pledger claims yet (count: 0)
//   • custom-location sponsor (never has pledger claims by design)
//
// Sample list is up to 5 pledger names+avatars for the tooltip, most-recent
// first. Anonymous pledgers always surface as "Anonymous".
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ sections: [] });
  }

  try {
    const [rawList, sponsors] = await Promise.all([
      redis.lrange<string>("pledgers:list", 0, -1),
      readSponsors(),
    ]);

    // Group pledger claims by section ID. Records are most-recent first because
    // lpush is used on insert — slice(0,5) gives the freshest samples.
    const grouped = new Map<string, PledgeRecord[]>();
    for (const raw of rawList || []) {
      const record = safeParse<PledgeRecord | null>(raw, null);
      if (!record?.claimedSection) continue;
      if (!trailSections.some((s) => s.id === record.claimedSection)) continue;
      const arr = grouped.get(record.claimedSection) || [];
      arr.push(record);
      grouped.set(record.claimedSection, arr);
    }

    const namedSponsorMap = new Map<string, (typeof sponsors)[number]>();
    const customSponsors: typeof sponsors = [];
    for (const s of sponsors) {
      if (s.sectionId) namedSponsorMap.set(s.sectionId, s);
      else if (s.customLocation) customSponsors.push(s);
    }

    const out: ClaimedSectionEntry[] = [];

    // 1. Named sections claimed by pledgers (with sponsor overlay if any)
    for (const [sectionId, records] of grouped) {
      const section = trailSections.find((s) => s.id === sectionId)!;
      const sponsor = namedSponsorMap.get(sectionId);
      out.push({
        id: sectionId,
        name: section.name,
        miles: section.miles,
        lat: section.lat,
        lng: section.lng,
        count: records.length,
        samples: records.slice(0, 5).map((r) => ({
          name: r.anonymous ? "Anonymous" : r.name,
          avatar: r.avatar,
        })),
        sponsor: sponsor
          ? { companyName: sponsor.companyName, logoUrl: sponsor.logoUrl, websiteUrl: sponsor.websiteUrl }
          : undefined,
      });
    }

    // 2. Named sections that have a sponsor but no pledger claims yet
    for (const [sectionId, sponsor] of namedSponsorMap) {
      if (grouped.has(sectionId)) continue;
      const section = trailSections.find((s) => s.id === sectionId);
      if (!section) continue;
      out.push({
        id: sectionId,
        name: section.name,
        miles: section.miles,
        lat: section.lat,
        lng: section.lng,
        count: 0,
        samples: [],
        sponsor: { companyName: sponsor.companyName, logoUrl: sponsor.logoUrl, websiteUrl: sponsor.websiteUrl },
      });
    }

    // 3. Custom-location sponsors (always sponsor-only, no pledger claims)
    for (const sponsor of customSponsors) {
      const loc = sponsor.customLocation!;
      out.push({
        id: `custom-${sponsor.id}`,
        name: loc.name,
        miles: loc.miles,
        lat: loc.lat,
        lng: loc.lng,
        count: 0,
        samples: [],
        sponsor: { companyName: sponsor.companyName, logoUrl: sponsor.logoUrl, websiteUrl: sponsor.websiteUrl },
      });
    }

    return NextResponse.json(
      { sections: out },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("Failed to compute claimed sections:", err);
    return NextResponse.json({ sections: [] });
  }
}
