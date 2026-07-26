import { NextRequest, NextResponse } from "next/server";
import { getCachedPosts } from "@/lib/instagram";

/**
 * GET /api/instagram
 *
 * Returns the cached Instagram posts from Redis.
 * Returns an empty array (not an error) when no posts are cached yet.
 *
 * Cached at the edge for 60s. This used to be 300s and claimed to be
 * "force-revalidated after each daily sync" — nothing ever did that, so after
 * an admin-triggered sync the gallery kept serving the previous response for
 * up to five minutes. With an explicit s-maxage on a route handler,
 * revalidatePath() doesn't purge Vercel's edge cache, so the honest fix is a
 * short TTL: a sync becomes visible within a minute, at a worst case of one
 * function invocation per minute.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const posts = await getCachedPosts();
    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/instagram error:", err);
    return NextResponse.json({ posts: [] });
  }
}
