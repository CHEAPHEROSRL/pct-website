import { getSubtitles } from "youtube-caption-extractor";

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
 * Uses youtube-caption-extractor (free, no API key needed).
 */
export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    const subtitles = await getSubtitles({ videoID: videoId, lang: "en" });

    if (!subtitles || subtitles.length === 0) return null;

    // Join all subtitle segments into a continuous transcript
    return subtitles.map((s: { text: string }) => s.text).join(" ");
  } catch {
    return null;
  }
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
