import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { JournalPost, JournalPostPublic } from "@/lib/types";

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

  if (wantsAll) {
    if (!checkAuth(request)) {
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

  // Public: only published posts, sorted by dayNumber desc
  const published: JournalPostPublic[] = posts
    .filter((p) => p.published)
    .sort((a, b) => b.dayNumber - a.dayNumber)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      dayNumber: p.dayNumber,
      date: p.date,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      youtubeUrl: p.youtubeUrl,
      tags: p.tags,
    }));

  return NextResponse.json(published, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
  });
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

  const post: JournalPost = {
    id: generateId(),
    title,
    slug: slugify(title),
    dayNumber: Number(dayNumber),
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
  };

  await redis.lpush("journal:posts", JSON.stringify(post));

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
