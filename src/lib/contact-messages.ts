import { Redis } from "@upstash/redis";
import { safeParse } from "./redis-safe";
import type { ContactMessage } from "./types";

// Redis-backed contact-form inbox. Each message lives in its own key so we
// can patch status flags atomically. An index list holds IDs newest-first.
//
// Key layout:
//   contact:msg:<id>     — JSON ContactMessage (90-day TTL)
//   contact:msgs:list    — Redis list of IDs, LPUSHed on create. No TTL,
//                          but we filter out expired entries at read time
//                          (MGET returns null for missing keys).

const MSG_KEY = (id: string) => `contact:msg:${id}`;
const LIST_KEY = "contact:msgs:list";
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function createMessage(msg: ContactMessage): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis not configured");
  await redis.set(MSG_KEY(msg.id), JSON.stringify(msg), { ex: TTL_SECONDS });
  await redis.lpush(LIST_KEY, msg.id);
}

export async function getMessage(id: string): Promise<ContactMessage | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string>(MSG_KEY(id));
  if (!raw) return null;
  return safeParse<ContactMessage | null>(raw, null);
}

/**
 * Update fields on an existing message. Returns the updated record or null
 * if the message was already gone (expired). Uses a read-modify-write
 * because Upstash doesn't support partial JSON patches; the read-write
 * window is small and admin writes are serialised by humans, so the race
 * window is acceptable.
 */
export async function updateMessage(
  id: string,
  patch: Partial<Pick<ContactMessage, "readAt" | "repliedAt" | "deliveryStatus" | "sendError">>
): Promise<ContactMessage | null> {
  const redis = getRedis();
  if (!redis) return null;
  const existing = await getMessage(id);
  if (!existing) return null;
  const updated: ContactMessage = { ...existing, ...patch };
  await redis.set(MSG_KEY(id), JSON.stringify(updated), { ex: TTL_SECONDS });
  return updated;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const deleted = await redis.del(MSG_KEY(id));
  // Best-effort remove from the index list. lrem(0, id) removes all matches.
  // If the key was already missing from the list (e.g. expired by TTL), this
  // is a no-op — no error to handle.
  await redis.lrem(LIST_KEY, 0, id);
  return deleted > 0;
}

/**
 * List messages newest-first, fetching the full record for each. Skips IDs
 * that have expired (their msg key returned null) so the caller never sees
 * holes in the result. `limit` caps the fetch — the admin UI uses 200 to
 * cover ~all messages without pagination given expected volume.
 */
export async function listMessages(limit: number = 200): Promise<ContactMessage[]> {
  const redis = getRedis();
  if (!redis) return [];
  const ids = await redis.lrange<string>(LIST_KEY, 0, limit - 1);
  if (!ids || ids.length === 0) return [];

  // mget returns the raw stored strings in the same order. Some may be null
  // (expired); filter those and parse the rest.
  const raws = await redis.mget<(string | null)[]>(...ids.map(MSG_KEY));
  const out: ContactMessage[] = [];
  for (const raw of raws || []) {
    if (!raw) continue;
    const parsed = safeParse<ContactMessage | null>(raw, null);
    if (parsed) out.push(parsed);
  }
  return out;
}
