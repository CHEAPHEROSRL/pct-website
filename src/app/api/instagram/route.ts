import { NextRequest, NextResponse } from "next/server";
import { getCachedPosts } from "@/lib/instagram";

/**
 * GET /api/instagram
 *
 * Returns the cached Instagram posts from Redis.
 * CDN-cached for 5 minutes — force-revalidated after each daily sync.
 * Returns an empty array (not an error) when no posts are cached yet.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const posts = await getCachedPosts();
    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/instagram error:", err);
    return NextResponse.json({ posts: [] });
  }
}
