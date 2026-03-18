import { NextResponse } from "next/server";
import { getCachedVideos } from "@/lib/youtube-feed";

export async function GET() {
  const videos = await getCachedVideos();
  return NextResponse.json(
    { videos },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
  );
}
