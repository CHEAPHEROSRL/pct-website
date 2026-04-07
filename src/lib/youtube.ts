interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string; // "asr" = auto-generated
  name?: { simpleText?: string };
}

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const ANDROID_CLIENT_VERSION = "20.10.38";
const ANDROID_USER_AGENT = `com.google.android.youtube/${ANDROID_CLIENT_VERSION} (Linux; U; Android 14)`;

/**
 * Fetch caption tracks via YouTube's InnerTube API using the Android client.
 * This bypasses IP-signed URL restrictions and reliably returns caption metadata
 * for both manual and auto-generated (ASR) captions.
 */
async function fetchCaptionTracksInnerTube(videoId: string): Promise<CaptionTrack[]> {
  try {
    const res = await fetch(INNERTUBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ANDROID_USER_AGENT,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: ANDROID_CLIENT_VERSION,
          },
        },
        videoId,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    return Array.isArray(tracks) ? tracks : [];
  } catch {
    return [];
  }
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
    const res = await fetch(baseUrl, {
      headers: { "User-Agent": ANDROID_USER_AGENT },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    if (!xml) return null;

    const parts: string[] = [];

    // Modern format: <p t="..." d="..."><s>word</s>...</p>
    const pRegex = /<p\s+t="\d+"\s+d="\d+"[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(xml)) !== null) {
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

    // Legacy format: <text start="..." dur="...">content</text>
    if (parts.length === 0) {
      const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
      let tMatch;
      while ((tMatch = textRegex.exec(xml)) !== null) {
        const line = tMatch[1].replace(/<[^>]+>/g, "").trim();
        if (line) parts.push(decodeEntities(line));
      }
    }

    if (parts.length === 0) return null;
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
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
 * Extract transcript/captions from a YouTube video.
 * Uses YouTube's InnerTube API with the Android client, which works for both
 * manual and auto-generated captions on virtually any video that has captions.
 */
export async function getTranscript(videoId: string): Promise<string | null> {
  const tracks = await fetchCaptionTracksInnerTube(videoId);
  if (tracks.length === 0) return null;

  // Prefer manual English, then auto-generated English, then any English variant, then any track
  const sorted = [...tracks].sort((a, b) => scoreTrack(b) - scoreTrack(a));

  for (const track of sorted) {
    const text = await fetchCaptionText(track.baseUrl);
    if (text && text.length > 20) return text;
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
