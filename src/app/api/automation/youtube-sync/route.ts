import { NextRequest, NextResponse } from "next/server";
import { syncYoutubeVideos } from "@/lib/youtube-feed";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videos = await syncYoutubeVideos();
  return NextResponse.json({ ok: true, count: videos.length });
}
