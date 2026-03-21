import { NextRequest, NextResponse } from "next/server";
import { subscribeToChannel } from "@/lib/youtube";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
}

/**
 * POST /api/automation/subscribe
 *
 * Subscribe to YouTube PubSubHubbub notifications for the configured channel.
 * Must be called once to start receiving webhook notifications, then every 10 days
 * to renew the subscription (or set up a cron job).
 *
 * Body: { channelId?: string } (defaults to YOUTUBE_CHANNEL_ID env var)
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { getSetting } = await import("@/lib/settings");
  const channelId =
    body.channelId || await getSetting("youtubeChannelId", "YOUTUBE_CHANNEL_ID");

  if (!channelId) {
    return NextResponse.json(
      { error: "No channel ID provided. Set it in Admin → Settings or pass channelId in body." },
      { status: 400 }
    );
  }

  // Build the callback URL from the request origin
  const origin = request.headers.get("x-forwarded-host")
    ? `https://${request.headers.get("x-forwarded-host")}`
    : request.nextUrl.origin;
  const callbackUrl = `${origin}/api/webhooks/youtube`;

  const success = await subscribeToChannel(channelId, callbackUrl);

  if (success) {
    return NextResponse.json({
      success: true,
      channelId,
      callbackUrl,
      message: "Subscription request sent. YouTube will verify the callback URL shortly.",
      renewBefore: new Date(Date.now() + 9 * 86400000).toISOString(),
    });
  }

  return NextResponse.json(
    { error: "Subscription request failed. Check the channel ID and try again." },
    { status: 500 }
  );
}
