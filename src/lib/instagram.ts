/**
 * Instagram scraper via Apify
 *
 * Uses the public `apify/instagram-scraper` actor — no Meta/Facebook developer
 * account, no OAuth, no API review needed. Paul's Instagram just needs to be public.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. You create a free Apify account and configure a Task pointing at Paul's profile.
 * 2. Apify runs the scraper on their own daily schedule (configured in Apify console).
 * 3. Our Vercel cron (/api/automation/instagram-sync, daily) fetches the last completed
 *    dataset from Apify and caches it in Redis. This fetch completes in < 1 second —
 *    no timeout risk on any Vercel plan.
 * 4. The public /api/instagram route reads from Redis. CDN-cached for 5 min.
 *
 * REQUIRED ENV VARS
 * ─────────────────
 * APIFY_API_TOKEN      – API token from apify.com → Settings → Integrations
 * APIFY_TASK_ID        – Task ID (see setup guide below)
 *
 * APIFY SETUP (one-time, ~3 minutes)
 * ────────────────────────────────────
 * 1. Sign up at apify.com (free tier is enough)
 * 2. Go to Actors → search "Instagram Scraper" → open apify/instagram-scraper
 * 3. Click "Save as my task" → name it "YesChapter Instagram"
 * 4. In the task input, set:
 *      directUrls: ["https://www.instagram.com/yeschapter/"]
 *      resultsType: "posts"
 *      resultsLimit: 12
 * 5. Click Schedules → New schedule → every day at 12:00 UTC → Save
 * 6. Click Start to run it once manually right now
 * 7. Copy the Task ID from the URL (looks like: aBcDeFgH1234)
 * 8. Add APIFY_API_TOKEN and APIFY_TASK_ID to your Vercel environment variables
 *
 * REDIS KEYS
 * ──────────
 * instagram:posts       JSON array of InstagramPost[]
 * instagram:last_sync   ms timestamp of last successful cache write
 */

import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstagramPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  /** Image URL — for VIDEO posts this is the thumbnail */
  mediaUrl: string;
  permalink: string;
  caption: string;
  timestamp: string; // ISO 8601
}

export interface InstagramSyncResult {
  posts: InstagramPost[];
  synced: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Redis
// ---------------------------------------------------------------------------

const POSTS_KEY = "instagram:posts";
const LAST_SYNC_KEY = "instagram:last_sync";

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getCachedPosts(): Promise<InstagramPost[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(POSTS_KEY);
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function cachePosts(posts: InstagramPost[]): Promise<void> {
  const redis = getRedis();
  await redis.set(POSTS_KEY, JSON.stringify(posts));
  await redis.set(LAST_SYNC_KEY, String(Date.now()));
}

// ---------------------------------------------------------------------------
// Apify fetch
// ---------------------------------------------------------------------------

// Shape of items returned by apify/instagram-scraper v3+
interface ApifyInstagramItem {
  id?: string;
  shortCode?: string;
  type?: string;           // "Image" | "Video" | "Sidecar"
  url?: string;            // permalink
  displayUrl?: string;     // image or thumbnail URL
  videoUrl?: string | null;
  caption?: string;
  timestamp?: string;
}

function mapApifyItem(item: ApifyInstagramItem): InstagramPost | null {
  const id = item.id ?? item.shortCode;
  if (!id) return null;

  const permalink =
    item.url ??
    (item.shortCode
      ? `https://www.instagram.com/p/${item.shortCode}/`
      : null);
  if (!permalink) return null;

  // For VIDEO posts Apify provides displayUrl as the thumbnail
  const mediaUrl = item.displayUrl ?? "";
  if (!mediaUrl) return null;

  let mediaType: InstagramPost["mediaType"] = "IMAGE";
  if (item.type === "Video") mediaType = "VIDEO";
  else if (item.type === "Sidecar") mediaType = "CAROUSEL_ALBUM";

  return {
    id,
    mediaType,
    mediaUrl,
    permalink,
    caption: item.caption ?? "",
    timestamp: item.timestamp ?? new Date().toISOString(),
  };
}

/**
 * Fetch the latest dataset items from the last completed Apify task run.
 * This is a simple GET — Apify does all the heavy lifting on their end.
 */
async function fetchFromApify(limit = 12): Promise<InstagramPost[]> {
  const token = process.env.APIFY_API_TOKEN;
  const taskId = process.env.APIFY_TASK_ID;

  if (!token || !taskId) {
    throw new Error(
      "APIFY_API_TOKEN and APIFY_TASK_ID must be set. See src/lib/instagram.ts for setup instructions."
    );
  }

  const url = new URL(
    `https://api.apify.com/v2/actor-tasks/${taskId}/runs/last/dataset/items`
  );
  url.searchParams.set("token", token);
  url.searchParams.set("status", "SUCCEEDED");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    "id,shortCode,type,url,displayUrl,videoUrl,caption,timestamp"
  );

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify API error (${res.status}): ${body}`);
  }

  const items: ApifyInstagramItem[] = await res.json();
  const posts = items.map(mapApifyItem).filter((p): p is InstagramPost => p !== null);
  return posts;
}

// ---------------------------------------------------------------------------
// Public sync (called by cron)
// ---------------------------------------------------------------------------

export async function syncInstagramPosts(): Promise<InstagramSyncResult> {
  try {
    const posts = await fetchFromApify(12);

    if (posts.length === 0) {
      // Apify task may not have run yet — don't overwrite existing cache
      return { posts: await getCachedPosts(), synced: 0 };
    }

    await cachePosts(posts);
    return { posts, synced: posts.length };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("Instagram sync failed:", error);
    // Return whatever is in cache so the site still works
    return { posts: await getCachedPosts(), synced: 0, error };
  }
}
