import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { JournalPost } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
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

  const raw = await redis.lrange<string>("journal:posts", 0, -1);
  const posts: JournalPost[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  const post = posts.find((p) => p.slug === slug && p.published);

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
  };

  // Find prev/next posts for navigation
  const published = posts
    .filter((p) => p.published)
    .sort((a, b) => a.dayNumber - b.dayNumber);
  const currentIndex = published.findIndex((p) => p.slug === slug);

  const prevPost =
    currentIndex > 0
      ? {
          slug: published[currentIndex - 1].slug,
          title: published[currentIndex - 1].title,
          dayNumber: published[currentIndex - 1].dayNumber,
        }
      : null;
  const nextPost =
    currentIndex < published.length - 1
      ? {
          slug: published[currentIndex + 1].slug,
          title: published[currentIndex + 1].title,
          dayNumber: published[currentIndex + 1].dayNumber,
        }
      : null;

  return NextResponse.json(
    { post: publicPost, prevPost, nextPost },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
