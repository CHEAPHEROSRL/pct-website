/**
 * Blog asset pool — gathers images that can be embedded inline in
 * AI-generated blog posts.
 *
 * Three sources:
 *   1. Latest Instagram posts (from Redis cache, populated by Apify)
 *   2. Latest YouTube video thumbnails (from Redis cache)
 *   3. Curated local hiking photos in /public/images/hiking/
 *
 * The AI gets a numbered list with short descriptions and is told to use
 * `![n](pool)` placeholders. We then post-process: validate the IDs are real,
 * replace them with proper markdown image syntax pointing at our image proxy
 * (for IG) or direct URLs (for YouTube/local), and wrap each in a figure
 * with caption + clickable link to the source.
 *
 * The "always clickable, with caption" requirement is implemented in the
 * markdown renderer (img -> figure with caption + anchor wrap), not here —
 * here we just produce well-formed markdown with title attributes.
 */

import { Redis } from "@upstash/redis";
import type { InstagramPost } from "./instagram";
import type { YoutubeVideo } from "./youtube-feed";

export interface BlogAsset {
  /** Stable ID used in the AI prompt placeholder, e.g. "ig-1", "yt-1", "local-1" */
  id: string;
  /** Public URL the renderer should use as the image source */
  src: string;
  /** Short human description for the AI to choose by */
  description: string;
  /**
   * Caption that will be rendered under the image. Falls back to the
   * description if not set.
   */
  caption: string;
  /** Optional URL to wrap the image in (Instagram permalink, YouTube watch URL) */
  linkUrl?: string;
  /** Source type — used by the renderer to optionally style differently */
  source: "instagram" | "youtube" | "local";
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Curated local images. Each entry's `description` MUST literally describe
 * what is visible in the image — not what we wish it depicted. The AI uses
 * the description to choose images that fit the surrounding paragraph.
 *
 * The `caption` is what readers will see under the image. Keep captions
 * generic enough that they're true regardless of which paragraph the image
 * lands next to. Never claim a specific day, location, or event that the
 * post might contradict.
 *
 * If you add a new entry, OPEN THE IMAGE FIRST and describe what's actually
 * in it. Filenames lie.
 */
const LOCAL_IMAGES: Omit<BlogAsset, "id">[] = [
  {
    src: "/images/hiking/20220822_134051.jpg",
    description:
      "Alpine lake surrounded by pine trees with rocky shore, mountains and partly cloudy sky in the background",
    caption: "Stillness at an alpine lake.",
    source: "local",
  },
  {
    src: "/images/hiking/20220823_123521.jpg",
    description:
      "Paul standing next to the wooden Pacific Crest Trail southern terminus monument at the Mexican border fence in Campo, blue sky overhead",
    caption: "The southern terminus at Campo — where the PCT begins.",
    source: "local",
  },
  {
    src: "/images/hiking/20230821_165432.jpg",
    description:
      "Looking straight up into a tall redwood forest canopy from the ground, sunlight filtering through the trees",
    caption: "Looking up through the trees.",
    source: "local",
  },
  {
    src: "/images/hiking/20230903_090215.jpg",
    description:
      "Selfie of Paul on a dirt trail wearing a cap and sunglasses, with a hydration vest and trees in the background",
    caption: "On the trail.",
    source: "local",
  },
  {
    src: "/images/hiking/20240128_110150.jpg",
    description:
      "Hiker with trekking poles standing on a rocky overlook with mountains and clouds in the distance",
    caption: "Pausing to take it in.",
    source: "local",
  },
  {
    src: "/images/hiking/20250802_160435.jpg",
    description:
      "Paul standing on a rocky mountain summit holding a hand-painted sign that reads 'Mt. Baldy'",
    caption: "Summit of Mt. Baldy.",
    source: "local",
  },
  {
    src: "/images/hiking/20260201_123623.jpg",
    description:
      "Paul sitting in tall green grass on a hillside on a sunny day, wearing a cap and flannel shirt",
    caption: "A green hillside in the spring sun.",
    source: "local",
  },
  {
    src: "/images/hiking/FB_IMG_1771991299919.jpg",
    description:
      "Paul silhouetted on a hillside trail at golden hour, holding trekking poles, cloudy sky overhead with city lights faintly visible in the distance",
    caption: "Golden hour on the trail.",
    source: "local",
  },
  {
    src: "/images/hiking/FB_IMG_1771992929191.jpg",
    description:
      "Paul standing on rocky boulders at a mountain summit holding a summit log book, with a wooden trail marker beside him and blue sky behind",
    caption: "Signing a summit log.",
    source: "local",
  },
];

/**
 * Minimum number of assets we want available after dedup filtering.
 * If filtering would leave fewer than this, we fall back to the unfiltered pool.
 * 6 = enough variety for the AI to pick 1–3 distinct images.
 */
const MIN_POOL_SIZE_AFTER_DEDUP = 6;

interface JournalPostShape {
  id: string;
  body: string;
}

/**
 * Scan all existing journal posts (excluding `excludePostId`) and return the
 * set of asset IDs from `pool` whose `src` URL appears in any post body.
 *
 * This is how we deduplicate inline images across posts: an asset is "used"
 * if any other post has already embedded it.
 */
async function collectUsedAssetIds(
  pool: BlogAsset[],
  excludePostId?: string
): Promise<Set<string>> {
  const used = new Set<string>();
  const redis = getRedis();
  if (!redis || pool.length === 0) return used;

  try {
    const raw = await redis.lrange<string>("journal:posts", 0, -1);
    const posts: JournalPostShape[] = (raw || [])
      .map((s) => (typeof s === "string" ? JSON.parse(s) : s))
      .filter((p): p is JournalPostShape => !!p && typeof p.body === "string");

    // Concatenate all bodies (excluding the one being regenerated) into a
    // single haystack to avoid an O(posts × pool) loop.
    const haystack = posts
      .filter((p) => p.id !== excludePostId)
      .map((p) => p.body)
      .join("\n\n");

    if (!haystack) return used;

    for (const asset of pool) {
      // The src URL is unique per asset and is what gets baked into the
      // markdown after resolveAssetPlaceholders runs. If it appears in any
      // existing post body, the asset is considered used.
      if (haystack.includes(asset.src)) {
        used.add(asset.id);
      }
    }
  } catch (err) {
    console.warn("collectUsedAssetIds failed:", err);
  }

  return used;
}

/**
 * Build the asset pool that the AI can choose from when writing a blog post.
 * Reads Instagram and YouTube caches from Redis (no Apify call here — fast).
 *
 * If `excludePostId` is provided, the asset pool is filtered to exclude
 * images already used in OTHER existing posts. This prevents the AI from
 * picking the same images that are already in use elsewhere on the site.
 * If filtering would leave too few assets, the unfiltered pool is returned
 * (with a console warning) so generation never fails for lack of images.
 *
 * Returns up to ~25 assets total: 8 IG, 5 YouTube, 9 local.
 */
export async function buildAssetPool(excludePostId?: string): Promise<BlogAsset[]> {
  const assets: BlogAsset[] = [];
  const redis = getRedis();

  // 1. Local hiking photos (always available)
  LOCAL_IMAGES.forEach((img, i) => {
    assets.push({
      ...img,
      id: `local-${i + 1}`,
    });
  });

  if (!redis) return assets;

  // 2. Instagram posts
  try {
    const raw = await redis.get<string>("instagram:posts");
    if (raw) {
      const posts: InstagramPost[] =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      const igAssets = posts.slice(0, 8).map((p, i): BlogAsset => {
        const truncated =
          p.caption.length > 100 ? p.caption.slice(0, 100).trim() + "…" : p.caption;
        return {
          id: `ig-${i + 1}`,
          // Always proxy IG CDN URLs through our origin to bypass CORP
          src: `/api/instagram/image?url=${encodeURIComponent(p.mediaUrl)}`,
          description:
            truncated ||
            (p.mediaType === "VIDEO"
              ? "Instagram video"
              : p.mediaType === "CAROUSEL_ALBUM"
                ? "Instagram carousel"
                : "Instagram photo"),
          caption: truncated || "From Instagram.",
          linkUrl: p.permalink,
          source: "instagram",
        };
      });
      assets.push(...igAssets);
    }
  } catch (err) {
    console.warn("buildAssetPool: failed to load instagram posts:", err);
  }

  // 3. YouTube video thumbnails
  try {
    const raw = await redis.get<string>("youtube:videos");
    if (raw) {
      const videos: YoutubeVideo[] =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      const ytAssets = videos.slice(0, 5).map((v, i): BlogAsset => {
        const truncated =
          v.title.length > 100 ? v.title.slice(0, 100).trim() + "…" : v.title;
        return {
          id: `yt-${i + 1}`,
          src: v.thumbnailUrl,
          description: truncated,
          caption: truncated,
          linkUrl: v.videoUrl,
          source: "youtube",
        };
      });
      assets.push(...ytAssets);
    }
  } catch (err) {
    console.warn("buildAssetPool: failed to load youtube videos:", err);
  }

  // Dedup pass: remove assets already used in other posts (when we know the
  // current post id we're regenerating, so we don't filter out our own usage).
  // Soft fallback: if filtering leaves too few assets to be useful, return
  // the unfiltered pool so generation never fails.
  try {
    const usedIds = await collectUsedAssetIds(assets, excludePostId);
    if (usedIds.size > 0) {
      const filtered = assets.filter((a) => !usedIds.has(a.id));
      if (filtered.length >= MIN_POOL_SIZE_AFTER_DEDUP) {
        console.log(
          `[asset-dedup] filtered ${usedIds.size} used asset(s) from pool: ${filtered.length} remaining`
        );
        return filtered;
      }
      console.warn(
        `[asset-dedup] dedup would leave only ${filtered.length} assets (< ${MIN_POOL_SIZE_AFTER_DEDUP}); using full pool of ${assets.length}`
      );
    }
  } catch (err) {
    console.warn("buildAssetPool: dedup failed, returning full pool:", err);
  }

  return assets;
}

/**
 * Format the asset pool as a numbered list the AI can read in the prompt.
 *
 * IMPORTANT: descriptions are intentionally NOT included. The AI should
 * pick images "blind" using only the source category. This prevents the
 * model from being misled by inaccurate human-curated descriptions and
 * also prevents it from writing fabricated alt text claiming specifics
 * about scenes it can't actually see.
 *
 * The site renders inline images WITHOUT captions for the same reason.
 */
export function formatAssetPoolForPrompt(assets: BlogAsset[]): string {
  if (assets.length === 0) return "(no assets available)";

  // Group by source so the AI can reason about availability per category
  const byCat: Record<string, string[]> = {};
  for (const a of assets) {
    const label =
      a.source === "instagram"
        ? "Instagram posts (recent — captions are Paul's own)"
        : a.source === "youtube"
          ? "YouTube video thumbnails (link to the full video)"
          : "Generic hiking photos from Paul's photo library";
    if (!byCat[label]) byCat[label] = [];
    byCat[label].push(a.id);
  }

  return Object.entries(byCat)
    .map(([label, ids]) => `- ${label}: ${ids.join(", ")}`)
    .join("\n");
}

/**
 * After AI generation, walk the body and replace placeholder image syntax
 * (`![any alt](pool:ig-1)` or `![any alt](pool:local-3)`) with proper markdown
 * pointing at the real URL, with the caption embedded as the title attribute
 * (which our renderer reads to render <figcaption>).
 *
 * Also drops any pool: references that don't match a real asset (AI hallucinations).
 */
export function resolveAssetPlaceholders(body: string, pool: BlogAsset[]): string {
  if (!body) return body;
  const byId = new Map(pool.map((a) => [a.id, a]));

  // Match: ![alt text](pool:any-id "optional caption")
  const re = /!\[([^\]]*)\]\(pool:([a-z0-9-]+)(?:\s+"([^"]*)")?\)/gi;

  return body.replace(re, (_full, alt, id, customCaption) => {
    const asset = byId.get(id.toLowerCase());
    if (!asset) {
      // Hallucinated reference — drop it entirely
      return "";
    }

    const caption =
      (customCaption && customCaption.trim()) ||
      asset.caption ||
      asset.description;

    // Embed the link URL in the title attribute prefixed with "url:" so the
    // markdown renderer can split it out and wrap the figure in an anchor.
    // Format: "<caption>||<linkUrl>"  (|| separator chosen because it's rare
    // in normal text and never appears in URLs)
    const titleParts = [caption];
    if (asset.linkUrl) titleParts.push(asset.linkUrl);
    const title = titleParts.join("||").replace(/"/g, '\\"');

    return `![${alt || caption}](${asset.src} "${title}")`;
  });
}
