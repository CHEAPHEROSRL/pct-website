import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireAdminAuth } from "@/lib/security";

/**
 * GET /api/admin/youtube-subscription
 *
 * Returns the current state of the PubSubHubbub subscription that listens
 * for new uploads on Paul's YouTube channel.
 *
 * Redis key `youtube:subscription:expiry` is a Unix timestamp (ms) set when
 * /api/automation/subscribe successfully registers the subscription. The
 * youtube-renew cron (daily 09:00 UTC) re-subscribes when this gets close
 * to expiring (PubSubHubbub leases last ~10 days).
 *
 * Used by the admin Settings → YouTube panel to show:
 *   - Whether we have an active subscription
 *   - When it expires
 *   - Whether the renew cron has been running
 *
 * The actual SUBSCRIBE action lives at POST /api/automation/subscribe —
 * this endpoint is read-only.
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { hasSubscription: false, error: "Storage not configured" },
      { status: 503 }
    );
  }

  const expiry = await redis.get<number>("youtube:subscription:expiry");

  if (!expiry || typeof expiry !== "number") {
    return NextResponse.json({
      hasSubscription: false,
      webhookSecretConfigured: !!process.env.YOUTUBE_WEBHOOK_SECRET,
    });
  }

  const now = Date.now();
  const expired = expiry < now;
  const msRemaining = expiry - now;
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));

  return NextResponse.json({
    hasSubscription: true,
    expiry,
    expiryIso: new Date(expiry).toISOString(),
    expired,
    daysRemaining,
    webhookSecretConfigured: !!process.env.YOUTUBE_WEBHOOK_SECRET,
  });
}
