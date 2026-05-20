import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/security";
import { syncInstagramPosts } from "@/lib/instagram";

/**
 * POST /api/automation/instagram-sync
 *
 * Called daily by Vercel Cron at 14:00 UTC. Triggers a fresh Apify scrape,
 * waits up to 45s for it to finish, then caches the results in Redis.
 *
 * Why we trigger the scrape ourselves: Instagram's CDN URLs are signed
 * with a ~7-day expiry. If Apify scraped 8+ days ago, the URLs in the
 * last dataset are already dead. Triggering a fresh scrape per cron run
 * guarantees the URLs we cache are valid.
 *
 * Protected by CRON_SECRET.
 */

// Allow up to 60s (Vercel Hobby cap) — Apify scrape + fetch + Redis write
export const maxDuration = 60;

async function handle(req: NextRequest): Promise<NextResponse> {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const result = await syncInstagramPosts();

  if (result.error && result.synced === 0) {
    console.error("Instagram sync error:", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, synced: result.synced });
}

// Vercel Cron always calls GET. The endpoint also accepts POST so the same
// route can be triggered by curl / admin scripts. Earlier the endpoint only
// exported POST, so the daily cron silently returned 405 and never actually
// ran — fixed by adding the GET shim that delegates to the same handler.
export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}
