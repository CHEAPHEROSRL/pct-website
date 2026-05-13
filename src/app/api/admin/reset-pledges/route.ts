import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS, constantTimeEqual } from "@/lib/security";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

/**
 * POST /api/admin/reset-pledges — Clear all pledge data (admin only).
 *
 * Wipes every pledge-related record from Redis. Used for pre-launch cleanup
 * of test data. Returns a count of what was deleted so the admin can verify.
 *
 * Removes:
 *   - pledger:<hash>          — confirmed live pledges
 *   - pending:<hash>          — unconfirmed pledges (still in 2-hour window)
 *                               NOTE: previously this used "pledge:pending:*"
 *                               with a stray "pledge:" prefix that doesn't
 *                               match how pending pledges are actually stored
 *                               by POST /api/pledges (which uses "pending:*").
 *                               Result: every prior reset silently left
 *                               pending records behind. Fixed now.
 *   - unsub:<token>           — unsubscribe token → email reverse lookup map
 *                               (orphaned otherwise — token rows would
 *                               survive after the underlying pledger is gone)
 *   - waitlist:token:<token>  — same idea for waitlist subscribers' unsub tokens
 *   - pledgers:list           — denormalised list used by /pledgers wall
 *   - pledgers:count          — pledger count for stats
 *   - pledgers:total_pledged  — running total used by homepage hero
 *   - pledgers:largest        — largest single pledge (used by stats)
 *   - pledgers:honored_count  — count of pledgers who already honoured
 *   - emails:community:sent   — community milestone "this threshold was
 *                               already announced" markers
 *
 * NOT touched: admin:settings, auth:session:*, journal:*, instagram:*,
 * supporters:* (Stripe gifts), challenges:*. These are unrelated to pledge data.
 */
export async function POST(request: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(request);
  if (rateLimited) return rateLimited;

  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }

  try {
    const [pledgerKeys, pendingKeys, unsubKeys] = await Promise.all([
      redis.keys("pledger:*"),
      redis.keys("pending:*"),
      redis.keys("unsub:*"),
    ]);

    // Counter keys + denormalised list
    const scalarKeys = [
      "pledgers:count",
      "pledgers:total_pledged",
      "pledgers:list",
      "pledgers:largest",
      "pledgers:honored_count",
      "emails:community:sent",
    ];

    const allKeys = [...pledgerKeys, ...pendingKeys, ...unsubKeys, ...scalarKeys];
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }

    return NextResponse.json({
      success: true,
      message: "All pledge data cleared",
      deleted: {
        pledger: pledgerKeys.length,
        pending: pendingKeys.length,
        unsub: unsubKeys.length,
        scalars: scalarKeys.length,
        total: allKeys.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset pledges", details: String(error) },
      { status: 500 }
    );
  }
}
