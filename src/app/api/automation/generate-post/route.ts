import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getVideoTranscript, extractVideoId } from "@/lib/youtube";
import {
  generateBlogPost,
  generateBlogPostPair,
  shouldSplitIntoTwoPosts,
} from "@/lib/blog-generator";
import { getMileForDay } from "@/lib/day-mileage";
import type { JournalPost } from "@/lib/types";
import { constantTimeEqual } from "@/lib/security";

/**
 * Resolve the trail mile a new post should be anchored at.
 * 1. Try the day-mileage lookup table
 * 2. Fall back to the current simulated mile from admin settings
 * 3. Fall back to 0 if neither is available
 */
async function resolveMileMarker(redis: Redis, dayNumber: number): Promise<number> {
  const fromTable = getMileForDay(dayNumber);
  if (fromTable !== null) return fromTable;

  try {
    const settingsRaw = await redis.get<string>("admin:settings");
    if (settingsRaw) {
      const settings =
        typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : settingsRaw;
      const currentMile = parseFloat(settings?.currentMile);
      if (!isNaN(currentMile)) return currentMile;
    }
  } catch {
    // ignore
  }
  return 0;
}

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
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
 * POST /api/automation/generate-post
 *
 * Manually trigger blog post generation from a YouTube video URL.
 * Requires admin auth. Used from the admin panel.
 *
 * Body: {
 *   videoUrl: string,       // YouTube URL
 *   dayNumber?: number,     // Override day number (defaults to calculated)
 *   split?: boolean,        // Force split into 2 posts
 *   publish?: boolean       // Auto-publish (default: false = draft)
 * }
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const {
    videoUrl,
    dayNumber: dayNumOverride,
    split,
    publish,
    force,
    extraThoughts,
    regenerationInstructions,
    improvementPills,
    overwriteId,
  } = body;

  if (!videoUrl) {
    return NextResponse.json(
      { error: "Missing videoUrl" },
      { status: 400 }
    );
  }

  // Regeneration mode: if overwriteId is set, look up the existing post
  // so we can pass its body as previousBody and replace it in-place after.
  let existingPost: JournalPost | null = null;
  let allPosts: JournalPost[] = [];
  if (overwriteId) {
    const raw = await redis.lrange<string>("journal:posts", 0, -1);
    allPosts = (raw || []).map((s) =>
      typeof s === "string" ? JSON.parse(s) : s
    );
    existingPost = allPosts.find((p) => p.id === overwriteId) || null;
    if (!existingPost) {
      return NextResponse.json(
        { error: "Post to regenerate not found" },
        { status: 404 }
      );
    }
  }

  // Dedup check — skip if force=true OR we're regenerating an existing post
  if (!force && !overwriteId) {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      const processed = await redis.get(`yt:processed:${videoId}`);
      if (processed === "done" || processed === "done-split") {
        return NextResponse.json(
          {
            error: "This video has already been processed. Use force=true to regenerate.",
            alreadyProcessed: true,
          },
          { status: 409 }
        );
      }
    }
  }

  // Extract transcript
  const video = await getVideoTranscript(videoUrl);
  if (!video) {
    return NextResponse.json(
      {
        error:
          "Could not extract transcript. If the video was just uploaded, wait 10-30 minutes for YouTube to auto-generate captions and try again. If captions are disabled in YouTube Studio, enable them under Subtitles → Settings.",
      },
      { status: 422 }
    );
  }

  // Calculate day number — when overwriting, prefer the existing post's day
  const { getSetting } = await import("@/lib/settings");
  const hikeStart = await getSetting("hikeStartDate", "HIKE_START_DATE");
  const dayNumber =
    dayNumOverride ??
    existingPost?.dayNumber ??
    (hikeStart
      ? Math.ceil(
          (Date.now() - new Date(hikeStart).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 1);

  // When regenerating, never split — always single post
  const shouldSplit = overwriteId
    ? false
    : (split ?? shouldSplitIntoTwoPosts(video.transcript));
  const now = Date.now();
  const createdPosts: JournalPost[] = [];

  // Build options to pass to the generator
  const generatorOpts = {
    extraThoughts: extraThoughts || undefined,
    regenerationInstructions: regenerationInstructions || undefined,
    improvementPills: Array.isArray(improvementPills) ? improvementPills : undefined,
    previousBody: existingPost?.body || undefined,
    // When regenerating, tell the asset pool dedup filter NOT to count
    // the current post's images as "used" (we're about to overwrite them).
    excludePostId: overwriteId || undefined,
  };

  if (shouldSplit) {
    const pair = await generateBlogPostPair(video, dayNumber, generatorOpts);
    if (!pair) {
      return NextResponse.json(
        { error: "Blog post generation failed. Try again." },
        { status: 500 }
      );
    }

    const mileMarker1 = await resolveMileMarker(redis, dayNumber);
    const mileMarker2 = await resolveMileMarker(redis, dayNumber + 2);

    const post1: JournalPost = {
      id: generateId(),
      title: pair.post1.title,
      slug: slugify(pair.post1.title),
      dayNumber,
      date: new Date().toISOString().split("T")[0],
      body: pair.post1.body,
      excerpt: pair.post1.excerpt,
      coverImage: video.thumbnailUrl,
      images: [],
      youtubeUrl: video.videoUrl,
      tags: pair.post1.tags,
      published: publish ?? false,
      createdAt: now,
      updatedAt: now,
      mileMarker: mileMarker1,
    };

    const post2: JournalPost = {
      id: generateId(),
      title: pair.post2.title,
      slug: slugify(pair.post2.title),
      dayNumber: dayNumber + 2,
      date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      body: pair.post2.body,
      excerpt: pair.post2.excerpt,
      coverImage: video.thumbnailUrl,
      images: [],
      youtubeUrl: video.videoUrl,
      tags: pair.post2.tags,
      published: false, // Second post always starts as draft
      createdAt: now + 1,
      updatedAt: now + 1,
      mileMarker: mileMarker2,
    };

    await redis.lpush("journal:posts", JSON.stringify(post1));
    await redis.lpush("journal:posts", JSON.stringify(post2));

    // Store Instagram captions
    await redis.set(
      `instagram:caption:${post1.id}`,
      pair.post1.instagramCaption,
    );
    await redis.set(
      `instagram:caption:${post2.id}`,
      pair.post2.instagramCaption,
    );

    createdPosts.push(post1, post2);
  } else {
    const generated = await generateBlogPost(video, dayNumber, generatorOpts);
    if (!generated) {
      return NextResponse.json(
        { error: "Blog post generation failed. Try again." },
        { status: 500 }
      );
    }

    if (overwriteId && existingPost) {
      // Regeneration: replace the existing post in-place. Preserve id,
      // date, published state, createdAt, day number, and any media the
      // editor may have added since the original generation.
      //
      // Slug handling:
      //   - If the post is still a DRAFT, update the slug to match the new
      //     title (no public URL exists yet, so this is safe).
      //   - If the post is PUBLISHED, keep the old slug — changing it would
      //     break any inbound links, social shares, or search index entries.
      const titleChanged = existingPost.title !== generated.title;
      const newSlug =
        titleChanged && !existingPost.published
          ? slugify(generated.title)
          : existingPost.slug;

      const updated: JournalPost = {
        ...existingPost,
        title: generated.title,
        slug: newSlug,
        body: generated.body,
        excerpt: generated.excerpt,
        tags: generated.tags,
        // Don't change: id, date, dayNumber, published, createdAt,
        // coverImage (might have been edited), images, youtubeUrl
        updatedAt: now,
      };

      // Rewrite the journal:posts list with the updated entry
      const newAll = allPosts.map((p) => (p.id === overwriteId ? updated : p));
      await redis.del("journal:posts");
      if (newAll.length > 0) {
        await redis.rpush(
          "journal:posts",
          ...newAll.map((p) => JSON.stringify(p))
        );
      }

      // Refresh Instagram caption
      await redis.set(
        `instagram:caption:${updated.id}`,
        generated.instagramCaption,
      );

      createdPosts.push(updated);
    } else {
      // Normal create flow
      const mileMarker = await resolveMileMarker(redis, dayNumber);
      const post: JournalPost = {
        id: generateId(),
        title: generated.title,
        slug: slugify(generated.title),
        dayNumber,
        date: new Date().toISOString().split("T")[0],
        body: generated.body,
        excerpt: generated.excerpt,
        coverImage: video.thumbnailUrl,
        images: [],
        youtubeUrl: video.videoUrl,
        tags: generated.tags,
        published: publish ?? false,
        createdAt: now,
        updatedAt: now,
        mileMarker,
      };

      await redis.lpush("journal:posts", JSON.stringify(post));

      // Store Instagram caption
      await redis.set(
        `instagram:caption:${post.id}`,
        generated.instagramCaption,
      );

      createdPosts.push(post);
    }
  }

  return NextResponse.json({
    success: true,
    videoTitle: video.title,
    postsCreated: createdPosts.length,
    regenerated: !!overwriteId,
    posts: createdPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      tags: p.tags,
      published: p.published,
      // For regeneration, also return body/excerpt/slug so the editor can refresh
      body: overwriteId ? p.body : undefined,
      excerpt: overwriteId ? p.excerpt : undefined,
      // slug is always in the base shape but call it out for clarity
    })),
  });
}
