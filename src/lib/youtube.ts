import { getSetting } from "./settings";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string; // "asr" = auto-generated
  name?: { simpleText?: string };
}

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

interface ClientStrategy {
  name: string;
  userAgent: string;
  context: { client: { clientName: string; clientVersion: string; [key: string]: unknown } };
}

// Multiple client strategies to try — different clients have different success rates
// from datacenter IPs (Vercel/AWS). Order matters: try the most reliable first.
const CLIENT_STRATEGIES: ClientStrategy[] = [
  {
    name: "IOS",
    userAgent: "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X;)",
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "19.45.4",
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        osName: "iPhone",
        osVersion: "18.1.0.22B83",
      },
    },
  },
  {
    name: "ANDROID",
    userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38",
        androidSdkVersion: 34,
        osName: "Android",
        osVersion: "14",
      },
    },
  },
  {
    name: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
    userAgent:
      "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    context: {
      client: {
        clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        clientVersion: "2.0",
      },
    },
  },
  {
    name: "WEB",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20241201.00.00",
      },
    },
  },
];

/**
 * Fetch caption tracks via YouTube's InnerTube API.
 * Tries multiple client strategies (iOS, Android, TVHTML5, Web) since YouTube
 * treats requests from datacenter IPs (Vercel/AWS) differently than residential IPs.
 */
async function fetchCaptionTracksInnerTube(videoId: string): Promise<CaptionTrack[]> {
  for (const strategy of CLIENT_STRATEGIES) {
    try {
      const res = await fetch(INNERTUBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": strategy.userAgent,
          "X-YouTube-Client-Name": strategy.context.client.clientName,
          "X-YouTube-Client-Version": strategy.context.client.clientVersion,
        },
        body: JSON.stringify({
          context: strategy.context,
          videoId,
        }),
      });

      if (!res.ok) {
        console.warn(`[transcript] ${strategy.name} HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const playability = data?.playabilityStatus?.status;
      if (playability && playability !== "OK") {
        console.warn(`[transcript] ${strategy.name} playability: ${playability} (${data?.playabilityStatus?.reason || "no reason"})`);
        continue;
      }

      const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks) && tracks.length > 0) {
        console.log(`[transcript] ${strategy.name} found ${tracks.length} caption track(s)`);
        return tracks;
      }
      console.warn(`[transcript] ${strategy.name} returned no caption tracks`);
    } catch (err) {
      console.warn(`[transcript] ${strategy.name} threw:`, err instanceof Error ? err.message : err);
    }
  }
  return [];
}

/**
 * Decode HTML entities in caption text.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

/**
 * Fetch captions from a track URL and convert to plain text.
 * Handles both modern (timedtext format=3 with <p>/<s> tags) and legacy XML formats.
 */
async function fetchCaptionText(baseUrl: string): Promise<string | null> {
  try {
    // Force JSON3 format which is more reliable than the default
    const url = baseUrl.includes("&fmt=") ? baseUrl : `${baseUrl}&fmt=json3`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) {
      console.warn(`[transcript] caption fetch HTTP ${res.status}`);
      return null;
    }
    const body = await res.text();
    if (!body) {
      console.warn(`[transcript] caption fetch returned empty body`);
      return null;
    }

    const parts: string[] = [];

    // JSON3 format: { events: [{ segs: [{ utf8: "word" }, ...] }, ...] }
    if (body.trimStart().startsWith("{")) {
      try {
        const json = JSON.parse(body);
        if (Array.isArray(json?.events)) {
          for (const ev of json.events) {
            if (!Array.isArray(ev?.segs)) continue;
            const line = ev.segs.map((s: { utf8?: string }) => s.utf8 || "").join("").trim();
            if (line) parts.push(decodeEntities(line));
          }
        }
      } catch {
        // fall through to XML parsing
      }
    }

    // Modern XML format: <p t="..." d="..."><s>word</s>...</p>
    if (parts.length === 0) {
      const pRegex = /<p\s+t="\d+"\s+d="\d+"[^>]*>([\s\S]*?)<\/p>/g;
      let pMatch;
      while ((pMatch = pRegex.exec(body)) !== null) {
        const inner = pMatch[1];
        const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
        let lineParts = "";
        let sMatch;
        while ((sMatch = sRegex.exec(inner)) !== null) {
          lineParts += sMatch[1];
        }
        const line = (lineParts || inner.replace(/<[^>]+>/g, "")).trim();
        if (line) parts.push(decodeEntities(line));
      }
    }

    // Legacy XML format: <text start="..." dur="...">content</text>
    if (parts.length === 0) {
      const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
      let tMatch;
      while ((tMatch = textRegex.exec(body)) !== null) {
        const line = tMatch[1].replace(/<[^>]+>/g, "").trim();
        if (line) parts.push(decodeEntities(line));
      }
    }

    if (parts.length === 0) {
      console.warn(`[transcript] caption body parsed to 0 lines (length: ${body.length}, first 100: ${body.substring(0, 100)})`);
      return null;
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch (err) {
    console.warn(`[transcript] fetchCaptionText threw:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export interface VideoInfo {
  videoId: string;
  title: string;
  channelId: string;
  publishedAt: string;
}

export interface VideoTranscript {
  videoId: string;
  title: string;
  transcript: string;
  thumbnailUrl: string;
  videoUrl: string;
}

/**
 * Extract video ID from various YouTube URL formats.
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch video title from YouTube oEmbed API (no API key required).
 */
export async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return `Video ${videoId}`;
    const data = await res.json();
    return data.title || `Video ${videoId}`;
  } catch {
    return `Video ${videoId}`;
  }
}

/**
 * Fetch transcript via Apify's pintostudio/youtube-transcript-scraper actor.
 * Apify uses residential proxies that bypass YouTube's datacenter IP restrictions,
 * so this works reliably from Vercel where direct InnerTube calls fail.
 */
async function fetchTranscriptApify(videoId: string): Promise<string | null> {
  const token = await getSetting("apifyApiToken", "APIFY_API_TOKEN");
  if (!token) {
    console.warn("[transcript] Apify token not configured");
    return null;
  }

  try {
    // Synchronous run-and-get-results endpoint — waits for the actor to finish
    const url = `https://api.apify.com/v2/acts/pintostudio~youtube-transcript-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        targetLanguage: "en",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[transcript] Apify HTTP ${res.status}: ${body.substring(0, 200)}`);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[transcript] Apify returned empty dataset`);
      return null;
    }

    // The actor's output shape varies — try several common shapes
    for (const item of data) {
      // Shape 1: { transcript: "full text" }
      if (typeof item?.transcript === "string" && item.transcript.length > 20) {
        return item.transcript;
      }
      // Shape 2: { transcript: [{ text }, ...] }
      if (Array.isArray(item?.transcript)) {
        const text = item.transcript
          .map((s: { text?: string }) => s?.text || "")
          .join(" ")
          .trim();
        if (text.length > 20) return text;
      }
      // Shape 3: { data: [{ text }, ...] }
      if (Array.isArray(item?.data)) {
        const text = item.data
          .map((s: { text?: string }) => s?.text || "")
          .join(" ")
          .trim();
        if (text.length > 20) return text;
      }
      // Shape 4: { text: "..." }
      if (typeof item?.text === "string" && item.text.length > 20) {
        return item.text;
      }
    }

    // Last resort: if dataset is an array of segment objects directly
    if (data.every((d) => typeof d?.text === "string")) {
      const text = data.map((d) => d.text).join(" ").trim();
      if (text.length > 20) return text;
    }

    console.warn(`[transcript] Apify response shape unrecognized: ${JSON.stringify(data[0]).substring(0, 200)}`);
    return null;
  } catch (err) {
    console.warn("[transcript] Apify fetch threw:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Extract transcript/captions from a YouTube video.
 *
 * Strategy:
 * 1. Try YouTube's InnerTube API directly (free, fast). Works from residential
 *    IPs but often blocked from Vercel/AWS datacenter IPs.
 * 2. Fall back to Apify's youtube-transcript-scraper actor, which uses
 *    residential proxies and bypasses YouTube's datacenter blocking.
 */
export async function getTranscript(videoId: string): Promise<string | null> {
  // Strategy 1: Direct InnerTube (free)
  const tracks = await fetchCaptionTracksInnerTube(videoId);
  if (tracks.length > 0) {
    const sorted = [...tracks].sort((a, b) => scoreTrack(b) - scoreTrack(a));
    for (const track of sorted) {
      const text = await fetchCaptionText(track.baseUrl);
      if (text && text.length > 20) {
        console.log("[transcript] success via InnerTube");
        return text;
      }
    }
    console.warn("[transcript] InnerTube found tracks but couldn't fetch caption text");
  }

  // Strategy 2: Apify fallback (uses paid credits but reliable from Vercel)
  console.log("[transcript] falling back to Apify");
  const apifyText = await fetchTranscriptApify(videoId);
  if (apifyText) {
    console.log("[transcript] success via Apify");
    return apifyText;
  }

  return null;
}

function scoreTrack(track: CaptionTrack): number {
  let score = 0;
  if (track.languageCode === "en") score += 100;
  else if (track.languageCode?.startsWith("en")) score += 50;
  // Manual captions preferred over auto-generated
  if (track.kind !== "asr") score += 10;
  return score;
}

/**
 * Get full video info + transcript for blog generation.
 */
export async function getVideoTranscript(
  videoUrl: string
): Promise<VideoTranscript | null> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return null;

  const [title, transcript] = await Promise.all([
    getVideoTitle(videoId),
    getTranscript(videoId),
  ]);

  if (!transcript) return null;

  return {
    videoId,
    title,
    transcript,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Parse YouTube PubSubHubbub (WebSub) notification XML.
 * Returns video info if it's a new video upload.
 */
export function parseYouTubeNotification(xml: string): VideoInfo | null {
  try {
    // Extract video ID
    const videoIdMatch = xml.match(
      /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/
    );
    if (!videoIdMatch) return null;

    // Extract channel ID
    const channelIdMatch = xml.match(
      /<yt:channelId>([a-zA-Z0-9_-]+)<\/yt:channelId>/
    );

    // Extract title
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/g);
    // Second <title> is the video title (first is feed title)
    const videoTitle =
      titleMatch && titleMatch.length > 1
        ? titleMatch[1].replace(/<\/?title>/g, "")
        : "";

    // Extract published date
    const publishedMatch = xml.match(/<published>([^<]+)<\/published>/);

    return {
      videoId: videoIdMatch[1],
      title: videoTitle,
      channelId: channelIdMatch?.[1] || "",
      publishedAt: publishedMatch?.[1] || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Subscribe to YouTube PubSubHubbub notifications for a channel.
 * Call this once to start receiving webhook notifications.
 */
export async function subscribeToChannel(
  channelId: string,
  callbackUrl: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      "hub.callback": callbackUrl,
      "hub.topic": `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`,
      "hub.verify": "async",
      "hub.mode": "subscribe",
      "hub.verify_token": process.env.YOUTUBE_WEBHOOK_SECRET || "",
      "hub.lease_seconds": "864000", // 10 days
    });

    const res = await fetch("https://pubsubhubbub.appspot.com/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return res.status === 202 || res.status === 204;
  } catch {
    return false;
  }
}
