import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  parseYouTubeNotification,
  getTranscript,
  getVideoTitle,
} from "@/lib/youtube";
import {
  generateBlogPost,
  generateBlogPostPair,
  shouldSplitIntoTwoPosts,
} from "@/lib/blog-generator";
import type { JournalPost } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Title-only slugs collide. "Day 1: Campo" and "Day-1 Campo" both slugify
 * to "day-1-campo", and the second video overwrites the first in the
 * journal. Appending a short chunk of the post id breaks the tie
 * deterministically while keeping the slug readable.
 */
function slugWithId(title: string, id: string): string {
  const base = slugify(title);
  const shortId = id.slice(0, 6);
  return base ? `${base}-${shortId}` : shortId;
}

/**
 * GET — YouTube PubSubHubbub verification challenge.
 * YouTube sends a GET request to verify we own the callback URL.
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = request.nextUrl.searchParams.get("hub.verify_token");

  // Verify the token if we have one configured
  const expectedToken = process.env.YOUTUBE_WEBHOOK_SECRET;
  if (expectedToken && verifyToken !== expectedToken) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Return the challenge to confirm subscription
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("OK", { status: 200 });
}

/**
 * POST — Receive YouTube PubSubHubbub notification when a new video is uploaded.
 * Automatically extracts transcript, generates blog post(s), and saves as draft.
 */
export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  // Read the XML body
  const xml = await request.text();

  // Parse the notification
  const videoInfo = parseYouTubeNotification(xml);
  if (!videoInfo) {
    return new NextResponse("Invalid notification", { status: 400 });
  }

  // Verify this is from our channel (if configured)
  const { getSetting } = await import("@/lib/settings");
  const expectedChannel = await getSetting("youtubeChannelId", "YOUTUBE_CHANNEL_ID");
  if (expectedChannel && videoInfo.channelId !== expectedChannel) {
    return new NextResponse("Not our channel", { status: 200 });
  }

  // Check if we already processed this video (deduplication)
  const processedKey = `yt:processed:${videoInfo.videoId}`;
  const alreadyProcessed = await redis.get(processedKey);
  if (alreadyProcessed) {
    return new NextResponse("Already processed", { status: 200 });
  }

  // Mark as processing immediately to avoid duplicates
  await redis.set(processedKey, "processing", { ex: 86400 }); // 24h TTL

  try {
    // Fetch transcript
    const transcript = await getTranscript(videoInfo.videoId);
    if (!transcript) {
      // Store that we tried but no transcript was available
      await redis.set(processedKey, "no-transcript", { ex: 86400 });

      // Add to pending transcripts list for retry cron
      await redis.lpush(
        "yt:pending-transcripts",
        JSON.stringify({
          videoId: videoInfo.videoId,
          title: videoInfo.title,
          channelId: videoInfo.channelId,
          retryCount: 0,
          addedAt: Date.now(),
        })
      );

      // Save a log entry so admin knows
      await redis.lpush(
        "automation:log",
        JSON.stringify({
          type: "youtube-no-transcript",
          videoId: videoInfo.videoId,
          title: videoInfo.title,
          timestamp: Date.now(),
          message: "Queued for transcript retry",
        })
      );

      return new NextResponse("No transcript available — queued for retry", { status: 200 });
    }

    // Calculate current day number
    const hikeStart = await getSetting("hikeStartDate", "HIKE_START_DATE");
    const dayNumber = hikeStart
      ? Math.ceil(
          (Date.now() - new Date(hikeStart).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 1;

    const videoUrl = `https://www.youtube.com/watch?v=${videoInfo.videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoInfo.videoId}/hqdefault.jpg`;

    const videoTranscript = {
      videoId: videoInfo.videoId,
      title: videoInfo.title || (await getVideoTitle(videoInfo.videoId)),
      transcript,
      thumbnailUrl,
      videoUrl,
    };

    // Decide single vs. split post
    const isSplit = shouldSplitIntoTwoPosts(transcript);
    const now = Date.now();

    if (isSplit) {
      // Generate two posts
      const pair = await generateBlogPostPair(videoTranscript, dayNumber);
      if (!pair) {
        await redis.set(processedKey, "generation-failed", { ex: 86400 });
        return new NextResponse("Generation failed", { status: 500 });
      }

      // Post 1: draft (admin reviews before publishing)
      const post1Id = generateId();
      const post1: JournalPost = {
        id: post1Id,
        title: pair.post1.title,
        slug: slugWithId(pair.post1.title, post1Id),
        dayNumber,
        date: new Date().toISOString().split("T")[0],
        body: pair.post1.body,
        excerpt: pair.post1.excerpt,
        coverImage: thumbnailUrl,
        images: [],
        youtubeUrl: videoUrl,
        tags: pair.post1.tags,
        published: false, // Draft — admin reviews first
        createdAt: now,
        updatedAt: now,
      };

      // Post 2: draft, scheduled for later
      const post2Id = generateId();
      const post2: JournalPost = {
        id: post2Id,
        title: pair.post2.title,
        slug: slugWithId(pair.post2.title, post2Id),
        dayNumber: dayNumber + 2,
        date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        body: pair.post2.body,
        excerpt: pair.post2.excerpt,
        coverImage: thumbnailUrl,
        images: [],
        youtubeUrl: videoUrl,
        tags: pair.post2.tags,
        published: false, // Draft — admin reviews first
        createdAt: now + 1, // Slightly later so ordering is clear
        updatedAt: now + 1,
      };

      await redis.lpush("journal:posts", JSON.stringify(post1));
      await redis.lpush("journal:posts", JSON.stringify(post2));

      // Store Instagram captions for later use
      await redis.set(
        `instagram:caption:${post1.id}`,
        pair.post1.instagramCaption,
      );
      await redis.set(
        `instagram:caption:${post2.id}`,
        pair.post2.instagramCaption
      );

      // Log success
      await redis.lpush(
        "automation:log",
        JSON.stringify({
          type: "youtube-split-posts",
          videoId: videoInfo.videoId,
          postIds: [post1.id, post2.id],
          timestamp: now,
        })
      );

      await redis.set(processedKey, "done-split", { ex: 2592000 });
    } else {
      // Generate single post
      const generated = await generateBlogPost(videoTranscript, dayNumber);
      if (!generated) {
        await redis.set(processedKey, "generation-failed", { ex: 86400 });
        return new NextResponse("Generation failed", { status: 500 });
      }

      const postId = generateId();
      const post: JournalPost = {
        id: postId,
        title: generated.title,
        slug: slugWithId(generated.title, postId),
        dayNumber,
        date: new Date().toISOString().split("T")[0],
        body: generated.body,
        excerpt: generated.excerpt,
        coverImage: thumbnailUrl,
        images: [],
        youtubeUrl: videoUrl,
        tags: generated.tags,
        published: false, // Draft — admin reviews first
        createdAt: now,
        updatedAt: now,
      };

      await redis.lpush("journal:posts", JSON.stringify(post));

      // Store Instagram caption
      await redis.set(
        `instagram:caption:${post.id}`,
        generated.instagramCaption
      );

      // Log success
      await redis.lpush(
        "automation:log",
        JSON.stringify({
          type: "youtube-single-post",
          videoId: videoInfo.videoId,
          postId: post.id,
          timestamp: now,
        })
      );

      await redis.set(processedKey, "done", { ex: 2592000 });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    await redis.set(processedKey, "error", { ex: 3600 }); // 1h TTL so retry is possible
    console.error("YouTube webhook processing error:", error);
    return new NextResponse("Processing error", { status: 500 });
  }
}
