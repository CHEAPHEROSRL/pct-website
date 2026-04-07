import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { JournalPost, JournalPostPublic } from "@/lib/types";
import { getMileForDay } from "@/lib/day-mileage";

/**
 * Resolve a default mile marker for a new manually-created post.
 * Same logic as the auto-generator: try the day-mileage table, fall back
 * to current simulated mile, fall back to 0.
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
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
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

export async function GET(request: NextRequest) {
  const redis = getRedis();
  const wantsAll = request.nextUrl.searchParams.get("all") === "true";
  const admin = checkAuth(request);

  if (wantsAll) {
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!redis) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
    });
  }

  const raw = await redis.lrange<string>("journal:posts", 0, -1);
  const posts: JournalPost[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  if (wantsAll) {
    return NextResponse.json(posts);
  }

  // Admins see drafts too (with isDraft flag); public only sees published
  const visible = posts
    .filter((p) => admin || p.published)
    .sort((a, b) => b.dayNumber - a.dayNumber)
    .map((p): JournalPostPublic & { isDraft?: boolean } => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      dayNumber: p.dayNumber,
      date: p.date,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      youtubeUrl: p.youtubeUrl,
      tags: p.tags,
      mileMarker: p.mileMarker,
      ...(admin && !p.published ? { isDraft: true } : {}),
    }));

  const headers: Record<string, string> = admin
    ? { "Cache-Control": "no-store" }
    : { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" };

  return NextResponse.json(visible, { headers });
}

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
  const { title, dayNumber, date, body: postBody } = body;

  if (!title || !dayNumber || !date || !postBody) {
    return NextResponse.json(
      { error: "Missing required fields: title, dayNumber, date, body" },
      { status: 400 }
    );
  }

  const now = Date.now();
  const excerpt =
    body.excerpt ||
    postBody
      .replace(/[#*_~`>\-\[\]()!]/g, "")
      .slice(0, 200)
      .trim();

  const dayNum = Number(dayNumber);
  const mileMarker =
    typeof body.mileMarker === "number"
      ? body.mileMarker
      : await resolveMileMarker(redis, dayNum);

  const post: JournalPost = {
    id: generateId(),
    title,
    slug: slugify(title),
    dayNumber: dayNum,
    date,
    body: postBody,
    excerpt,
    coverImage: body.coverImage || "",
    images: body.images || [],
    youtubeUrl: body.youtubeUrl || "",
    tags: body.tags || ["BLOG"],
    published: body.published ?? false,
    createdAt: now,
    updatedAt: now,
    mileMarker,
  };

  await redis.lpush("journal:posts", JSON.stringify(post));

  // Trigger new-post email if published immediately
  if (post.published) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
    fetch(`${siteUrl}/api/emails/new-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({
        postId: post.id,
        postTitle: post.title,
        postExcerpt: post.excerpt,
        postSlug: post.slug,
        dayNumber: post.dayNumber,
      }),
    }).catch((err) => console.error("Failed to trigger new-post email:", err));
  }

  return NextResponse.json(post, { status: 201 });
}

export async function PUT(request: NextRequest) {
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
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  const raw = await redis.lrange<string>("journal:posts", 0, -1);
  const posts: JournalPost[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existing = posts[index];
  const updated: JournalPost = {
    ...existing,
    title: body.title ?? existing.title,
    slug: body.title ? slugify(body.title) : existing.slug,
    dayNumber: body.dayNumber ?? existing.dayNumber,
    date: body.date ?? existing.date,
    body: body.body ?? existing.body,
    excerpt: body.excerpt ?? existing.excerpt,
    coverImage: body.coverImage ?? existing.coverImage,
    images: body.images ?? existing.images,
    youtubeUrl: body.youtubeUrl ?? existing.youtubeUrl,
    tags: body.tags ?? existing.tags,
    published: body.published ?? existing.published,
    mileMarker: typeof body.mileMarker === "number" ? body.mileMarker : existing.mileMarker,
    updatedAt: Date.now(),
  };

  posts[index] = updated;

  // Rewrite the list
  await redis.del("journal:posts");
  if (posts.length > 0) {
    await redis.rpush(
      "journal:posts",
      ...posts.map((p) => JSON.stringify(p))
    );
  }

  // Trigger new-post email notification when publishing for the first time
  if (updated.published && !existing.published) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
    fetch(`${siteUrl}/api/emails/new-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({
        postId: updated.id,
        postTitle: updated.title,
        postExcerpt: updated.excerpt,
        postSlug: updated.slug,
        dayNumber: updated.dayNumber,
      }),
    }).catch((err) => console.error("Failed to trigger new-post email:", err));
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
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

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  const raw = await redis.lrange<string>("journal:posts", 0, -1);
  const posts: JournalPost[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await redis.del("journal:posts");
  if (filtered.length > 0) {
    await redis.rpush(
      "journal:posts",
      ...filtered.map((p) => JSON.stringify(p))
    );
  }

  return NextResponse.json({ success: true });
}
