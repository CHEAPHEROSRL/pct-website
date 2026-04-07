import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { JournalPost } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = isAdmin(request);

  const raw = await redis.lrange<string>("journal:posts", 0, -1);
  const posts: JournalPost[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  // Admins can see drafts; public can only see published
  const post = posts.find((p) => p.slug === slug && (admin || p.published));

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const publicPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    dayNumber: post.dayNumber,
    date: post.date,
    body: post.body,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    images: post.images,
    youtubeUrl: post.youtubeUrl,
    tags: post.tags,
    isDraft: !post.published,
  };

  // Find prev/next posts for navigation (admins navigate among all posts, public among published only)
  const navigable = posts
    .filter((p) => admin || p.published)
    .sort((a, b) => a.dayNumber - b.dayNumber);
  const currentIndex = navigable.findIndex((p) => p.slug === slug);

  const prevPost =
    currentIndex > 0
      ? {
          slug: navigable[currentIndex - 1].slug,
          title: navigable[currentIndex - 1].title,
          dayNumber: navigable[currentIndex - 1].dayNumber,
        }
      : null;
  const nextPost =
    currentIndex < navigable.length - 1
      ? {
          slug: navigable[currentIndex + 1].slug,
          title: navigable[currentIndex + 1].title,
          dayNumber: navigable[currentIndex + 1].dayNumber,
        }
      : null;

  // Don't cache when admin is viewing — they see drafts that change frequently
  const headers: Record<string, string> = admin
    ? { "Cache-Control": "no-store" }
    : { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" };

  return NextResponse.json(
    { post: publicPost, prevPost, nextPost },
    { headers }
  );
}
