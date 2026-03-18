import { NextRequest, NextResponse } from "next/server";
import { syncYoutubeVideos } from "@/lib/youtube-feed";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videos = await syncYoutubeVideos();
  return NextResponse.json({ ok: true, count: videos.length });
}
