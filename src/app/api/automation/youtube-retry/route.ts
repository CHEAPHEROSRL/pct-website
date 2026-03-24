import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { getTranscript, getVideoTitle } from "@/lib/youtube";
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

const MAX_RETRIES = 3;

interface PendingTranscript {
  videoId: string;
  title: string;
  channelId: string;
  retryCount: number;
  addedAt: number;
}

/**
 * GET /api/automation/youtube-retry
 *
 * Cron job to retry transcript extraction for videos that had no captions
 * available when first processed. Runs every 2 hours.
 */
export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  try {
    // Get all pending items
    const pendingRaw = await redis.lrange("yt:pending-transcripts", 0, -1);
    if (!pendingRaw || pendingRaw.length === 0) {
      return NextResponse.json({ processed: 0, message: "No pending transcripts" });
    }

    const results: { videoId: string; status: string }[] = [];
    const remaining: string[] = [];

    for (const raw of pendingRaw) {
      const item: PendingTranscript =
        typeof raw === "string" ? JSON.parse(raw) : (raw as PendingTranscript);

      // Try to get transcript
      const transcript = await getTranscript(item.videoId);

      if (!transcript) {
        if (item.retryCount + 1 >= MAX_RETRIES) {
          // Max retries reached — give up
          await redis.lpush(
            "automation:log",
            JSON.stringify({
              type: "youtube-transcript-retry-failed",
              videoId: item.videoId,
              title: item.title,
              retries: item.retryCount + 1,
              timestamp: Date.now(),
            })
          );
          results.push({ videoId: item.videoId, status: "failed-max-retries" });
        } else {
          // Re-queue with incremented retry count
          remaining.push(
            JSON.stringify({
              ...item,
              retryCount: item.retryCount + 1,
            })
          );
          results.push({ videoId: item.videoId, status: `retry-${item.retryCount + 1}` });
        }
        continue;
      }

      // Transcript found — generate blog post
      const processedKey = `yt:processed:${item.videoId}`;

      // Check dedup
      const alreadyDone = await redis.get(processedKey);
      if (alreadyDone === "done" || alreadyDone === "done-split") {
        results.push({ videoId: item.videoId, status: "already-processed" });
        continue;
      }

      await redis.set(processedKey, "processing", { ex: 86400 });

      const { getSetting } = await import("@/lib/settings");
      const hikeStart = await getSetting("hikeStartDate", "HIKE_START_DATE");
      const dayNumber = hikeStart
        ? Math.ceil(
            (Date.now() - new Date(hikeStart).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 1;

      const videoUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
      const title = item.title || (await getVideoTitle(item.videoId));

      const videoTranscript = {
        videoId: item.videoId,
        title,
        transcript,
        thumbnailUrl,
        videoUrl,
      };

      const isSplit = shouldSplitIntoTwoPosts(transcript);
      const now = Date.now();

      if (isSplit) {
        const pair = await generateBlogPostPair(videoTranscript, dayNumber);
        if (!pair) {
          await redis.set(processedKey, "generation-failed", { ex: 86400 });
          results.push({ videoId: item.videoId, status: "generation-failed" });
          continue;
        }

        const post1: JournalPost = {
          id: generateId(),
          title: pair.post1.title,
          slug: slugify(pair.post1.title),
          dayNumber,
          date: new Date().toISOString().split("T")[0],
          body: pair.post1.body,
          excerpt: pair.post1.excerpt,
          coverImage: thumbnailUrl,
          images: [],
          youtubeUrl: videoUrl,
          tags: pair.post1.tags,
          published: false,
          createdAt: now,
          updatedAt: now,
        };

        const post2: JournalPost = {
          id: generateId(),
          title: pair.post2.title,
          slug: slugify(pair.post2.title),
          dayNumber: dayNumber + 2,
          date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
          body: pair.post2.body,
          excerpt: pair.post2.excerpt,
          coverImage: thumbnailUrl,
          images: [],
          youtubeUrl: videoUrl,
          tags: pair.post2.tags,
          published: false,
          createdAt: now + 1,
          updatedAt: now + 1,
        };

        await redis.lpush("journal:posts", JSON.stringify(post1));
        await redis.lpush("journal:posts", JSON.stringify(post2));

        await redis.set(`instagram:caption:${post1.id}`, pair.post1.instagramCaption);
        await redis.set(`instagram:caption:${post2.id}`, pair.post2.instagramCaption);

        await redis.set(processedKey, "done-split", { ex: 2592000 });
        results.push({ videoId: item.videoId, status: "split-posts-created" });
      } else {
        const generated = await generateBlogPost(videoTranscript, dayNumber);
        if (!generated) {
          await redis.set(processedKey, "generation-failed", { ex: 86400 });
          results.push({ videoId: item.videoId, status: "generation-failed" });
          continue;
        }

        const post: JournalPost = {
          id: generateId(),
          title: generated.title,
          slug: slugify(generated.title),
          dayNumber,
          date: new Date().toISOString().split("T")[0],
          body: generated.body,
          excerpt: generated.excerpt,
          coverImage: thumbnailUrl,
          images: [],
          youtubeUrl: videoUrl,
          tags: generated.tags,
          published: false,
          createdAt: now,
          updatedAt: now,
        };

        await redis.lpush("journal:posts", JSON.stringify(post));
        await redis.set(`instagram:caption:${post.id}`, generated.instagramCaption);

        await redis.set(processedKey, "done", { ex: 2592000 });
        results.push({ videoId: item.videoId, status: "post-created" });
      }

      await redis.lpush(
        "automation:log",
        JSON.stringify({
          type: "youtube-transcript-retry-success",
          videoId: item.videoId,
          title,
          retryCount: item.retryCount + 1,
          timestamp: now,
        })
      );
    }

    // Replace the pending list with only the items that still need retrying
    await redis.del("yt:pending-transcripts");
    if (remaining.length > 0) {
      await redis.rpush("yt:pending-transcripts", ...remaining);
    }

    return NextResponse.json({
      processed: pendingRaw.length,
      results,
      stillPending: remaining.length,
    });
  } catch (error) {
    console.error("YouTube transcript retry error:", error);
    return NextResponse.json(
      { error: "Internal error during retry processing" },
      { status: 500 }
    );
  }
}
