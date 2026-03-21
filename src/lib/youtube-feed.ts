/**
 * YouTube channel feed — fetches latest videos via the public RSS feed.
 * No API key or quota needed. YouTube exposes a free Atom feed for every channel.
 *
 * Redis keys:
 *   youtube:videos   — JSON array of YoutubeVideo[], newest first
 *   youtube:last_sync — Unix timestamp of last successful sync
 */

import { Redis } from "@upstash/redis";

export interface YoutubeVideo {
  id: string;           // YouTube video ID (e.g. "dQw4w9WgXcQ")
  title: string;
  description: string;
  publishedAt: string;  // ISO 8601
  thumbnailUrl: string; // hqdefault thumbnail (always exists)
  videoUrl: string;     // https://www.youtube.com/watch?v=...
  channelTitle: string;
}

const CACHE_KEY = "youtube:videos";
const SYNC_KEY = "youtube:last_sync";
const RSS_URL = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Extract text between two XML tags (first match only) */
function extractTag(xml: string, tag: string): string {
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  if (start === -1) return "";
  const contentStart = xml.indexOf(">", start) + 1;
  const end = xml.indexOf(close, contentStart);
  if (end === -1) return "";
  return xml.slice(contentStart, end).trim();
}

/** Extract an XML attribute value */
function extractAttr(xml: string, tag: string, attr: string): string {
  const tagStart = xml.indexOf(`<${tag}`);
  if (tagStart === -1) return "";
  const tagEnd = xml.indexOf(">", tagStart);
  const tagStr = xml.slice(tagStart, tagEnd);
  const attrIdx = tagStr.indexOf(`${attr}="`);
  if (attrIdx === -1) return "";
  const valStart = attrIdx + attr.length + 2;
  const valEnd = tagStr.indexOf('"', valStart);
  return tagStr.slice(valStart, valEnd);
}

/** Parse YouTube Atom RSS feed XML into YoutubeVideo[] */
function parseRss(xml: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  // Split into <entry> blocks
  const parts = xml.split("<entry>");
  parts.shift(); // remove everything before first <entry>

  for (const part of parts) {
    const block = part.split("</entry>")[0];

    const videoId = extractTag(block, "yt:videoId");
    if (!videoId) continue;

    const title = extractTag(block, "title")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const description = extractTag(block, "media:description")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .slice(0, 300); // trim long descriptions

    const publishedAt = extractTag(block, "published");
    const thumbnailUrl = extractAttr(block, "media:thumbnail", "url") ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const channelTitle = extractTag(block, "name"); // <author><name>

    videos.push({
      id: videoId,
      title,
      description,
      publishedAt,
      thumbnailUrl,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      channelTitle: channelTitle || "YesChapter",
    });
  }

  return videos;
}

/** Fetch latest videos from YouTube RSS and save to Redis */
export async function syncYoutubeVideos(): Promise<YoutubeVideo[]> {
  const { getSetting } = await import("./settings");
  const channelId = await getSetting("youtubeChannelId", "YOUTUBE_CHANNEL_ID");
  if (!channelId) throw new Error("YouTube Channel ID not configured. Set it in Admin → Settings.");

  const res = await fetch(RSS_URL(channelId), {
    headers: { "User-Agent": "YesChapter/1.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`YouTube RSS fetch failed: ${res.status}`);

  const xml = await res.text();
  const videos = parseRss(xml);

  const redis = getRedis();
  if (redis && videos.length > 0) {
    await redis.set(CACHE_KEY, JSON.stringify(videos));
    await redis.set(SYNC_KEY, Date.now());
  }

  return videos;
}

/** Return cached videos from Redis (or empty array if not synced yet) */
export async function getCachedVideos(): Promise<YoutubeVideo[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await redis.get<string>(CACHE_KEY);
  if (!raw) return [];
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as YoutubeVideo[]);
  } catch {
    return [];
  }
}
