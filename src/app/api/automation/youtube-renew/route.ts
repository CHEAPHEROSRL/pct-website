import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { subscribeToChannel } from "@/lib/youtube";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const EXPIRY_KEY = "youtube:subscription:expiry";
const TWO_DAYS_MS = 2 * 86400 * 1000;
const TEN_DAYS_MS = 10 * 86400 * 1000;

/**
 * GET /api/automation/youtube-renew
 *
 * Cron job to auto-renew the YouTube PubSubHubbub subscription.
 * Runs daily. Renews if expiry is missing or < 2 days away.
 */
export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  try {
    // Check current expiry
    const expiry = await redis.get<number>(EXPIRY_KEY);
    const now = Date.now();

    if (expiry && expiry - now > TWO_DAYS_MS) {
      // Still has more than 2 days left, no renewal needed
      return NextResponse.json({
        renewed: false,
        reason: "Subscription still valid",
        expiresAt: new Date(expiry).toISOString(),
        expiresIn: `${Math.round((expiry - now) / 86400000)} days`,
      });
    }

    // Need to renew — get channel ID
    const { getSetting } = await import("@/lib/settings");
    const channelId = await getSetting("youtubeChannelId", "YOUTUBE_CHANNEL_ID");

    if (!channelId) {
      return NextResponse.json(
        { error: "No YouTube channel ID configured" },
        { status: 400 }
      );
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://yeschapter.com"}/api/webhooks/youtube`;

    const success = await subscribeToChannel(channelId, callbackUrl);

    if (success) {
      const newExpiry = now + TEN_DAYS_MS;
      await redis.set(EXPIRY_KEY, newExpiry);

      // Log renewal
      await redis.lpush(
        "automation:log",
        JSON.stringify({
          type: "youtube-subscription-renewed",
          channelId,
          callbackUrl,
          expiresAt: new Date(newExpiry).toISOString(),
          timestamp: now,
        })
      );

      return NextResponse.json({
        renewed: true,
        channelId,
        callbackUrl,
        expiresAt: new Date(newExpiry).toISOString(),
      });
    }

    // Log failure
    await redis.lpush(
      "automation:log",
      JSON.stringify({
        type: "youtube-subscription-renewal-failed",
        channelId,
        timestamp: now,
      })
    );

    return NextResponse.json(
      { error: "Subscription renewal failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("YouTube subscription renewal error:", error);
    return NextResponse.json(
      { error: "Internal error during renewal" },
      { status: 500 }
    );
  }
}
