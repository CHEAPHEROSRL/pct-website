import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/security";
import { syncInstagramPosts } from "@/lib/instagram";

/**
 * POST /api/automation/instagram-sync
 *
 * Called daily by Vercel Cron at 14:00 UTC — after Apify's own daily scrape
 * (which is scheduled at 12:00 UTC in the Apify console) has had time to finish.
 *
 * This route does ONE thing: fetch the last completed Apify dataset and write
 * it to Redis. It completes in < 1 second regardless of Vercel plan.
 *
 * Protected by CRON_SECRET.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const result = await syncInstagramPosts();

  if (result.error && result.synced === 0) {
    console.error("Instagram sync error:", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, synced: result.synced });
}
