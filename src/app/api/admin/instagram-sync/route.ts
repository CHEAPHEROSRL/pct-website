import { NextRequest, NextResponse } from "next/server";
import { syncInstagramPosts } from "@/lib/instagram";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_AUTH_TOKEN;
}

/**
 * POST /api/admin/instagram-sync
 *
 * Admin-triggered Instagram sync. Same logic as the daily cron job at
 * /api/automation/instagram-sync but gated by ADMIN_AUTH_TOKEN instead of
 * CRON_SECRET so it can be called from the admin panel.
 *
 * Triggers a fresh Apify scrape, waits up to 45s, then caches to Redis.
 * Returns the number of posts synced.
 */

// Allow up to 60s (Vercel Hobby cap) — Apify scrape + fetch + Redis write
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncInstagramPosts();

  if (result.error && result.synced === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        cachedCount: result.posts.length,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    synced: result.synced,
    totalCached: result.posts.length,
  });
}
