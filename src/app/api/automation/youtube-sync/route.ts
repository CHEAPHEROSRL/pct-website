import { NextRequest, NextResponse } from "next/server";
import { syncYoutubeVideos } from "@/lib/youtube-feed";

async function handle(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videos = await syncYoutubeVideos();
  return NextResponse.json({ ok: true, count: videos.length });
}

// Vercel Cron always calls GET. The endpoint also accepts POST for manual /
// admin triggers. Earlier the endpoint only exported POST, so the daily
// cron silently returned 405 and never actually ran — fixed by adding
// the GET shim that delegates to the same handler.
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
