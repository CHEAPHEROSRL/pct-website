import { Redis } from "@upstash/redis";
import { safeParse } from "./redis-safe";
import type { SponsorRecord } from "./trail";

// Redis-backed sponsor list, managed via /admin → Sponsors. Single-key storage
// (one JSON array) is fine here — sponsor count is in the single digits, the
// list is rarely written, and a flat array reads back atomically without
// requiring extra keys for indexing.

const SPONSORS_KEY = "sponsors:all";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function readSponsors(): Promise<SponsorRecord[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.get<string>(SPONSORS_KEY);
  if (!raw) return [];
  const arr = safeParse<SponsorRecord[] | null>(raw, null);
  return Array.isArray(arr) ? arr : [];
}

export async function writeSponsors(sponsors: SponsorRecord[]): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis not configured");
  await redis.set(SPONSORS_KEY, JSON.stringify(sponsors));
}

/**
 * Upsert a sponsor by section id (named) or custom location id. Used by the
 * admin POST endpoint so callers don't have to do the read-modify-write
 * themselves. If a sponsor already exists for the same sectionId, it's
 * replaced (one sponsor per section rule). For custom locations, each entry
 * is unique by id — no replacement logic.
 */
export async function upsertSponsor(record: SponsorRecord): Promise<SponsorRecord[]> {
  const list = await readSponsors();
  let next: SponsorRecord[];
  if (record.sectionId) {
    next = list.filter((s) => s.sectionId !== record.sectionId);
    next.push(record);
  } else {
    next = list.filter((s) => s.id !== record.id);
    next.push(record);
  }
  await writeSponsors(next);
  return next;
}

export async function removeSponsor(id: string): Promise<SponsorRecord[]> {
  const list = await readSponsors();
  const next = list.filter((s) => s.id !== id);
  await writeSponsors(next);
  return next;
}

export async function getSponsorBySectionId(sectionId: string): Promise<SponsorRecord | undefined> {
  const list = await readSponsors();
  return list.find((s) => s.sectionId === sectionId);
}
