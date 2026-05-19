import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireAdminAuth } from "@/lib/security";
import { bulkEmailsEnabled } from "@/lib/email";

/**
 * GET /api/admin/email-cron-status
 *   Returns the standby flag + last-sent timestamps for each cron-driven
 *   email blast, plus the master EMAILS_ENABLED kill-switch state.
 *
 * POST /api/admin/email-cron-status
 *   Body: { standby: boolean }
 *   Flips the standby flag instantly (no redeploy needed). When standby is
 *   true, all four email crons return early without sending. When false,
 *   they run as scheduled (and still respect per-pledger dedup keys).
 *
 * The flag lives in Redis (key: emails:cron:standby) so Paul can toggle
 * it on/off without a deploy cycle. Defaults to standby=true on a fresh
 * deploy (see isEmailCronStandby in src/lib/email.ts).
 *
 * Both routes require admin auth (Bearer or pct-admin-session cookie).
 */

const STANDBY_KEY = "emails:cron:standby";

interface LastSentInfo {
  ts?: number;
  weekNumber?: number;
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readLastSent(redis: Redis): Promise<{
  welcome: LastSentInfo;
  weekly: LastSentInfo;
  milestone: LastSentInfo;
  honor: LastSentInfo;
}> {
  const [weeklyTs, weeklyWeek, welcomeTs, milestoneTs, honorTs] = await Promise.all([
    redis.get<number>("emails:weekly:last_sent"),
    redis.get<number>("emails:weekly:last_week"),
    redis.get<number>("emails:welcome:last_sent"),
    redis.get<number>("emails:milestone:last_sent"),
    redis.get<number>("emails:honor:last_sent"),
  ]);

  return {
    welcome: { ts: welcomeTs ?? undefined },
    weekly: { ts: weeklyTs ?? undefined, weekNumber: weeklyWeek ?? undefined },
    milestone: { ts: milestoneTs ?? undefined },
    honor: { ts: honorTs ?? undefined },
  };
}

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const raw = await redis.get<string | boolean>(STANDBY_KEY);
  // Default = standby true (fail-safe). Matches isEmailCronStandby.
  const standby = !(raw === false || raw === "false");

  const lastSent = await readLastSent(redis);

  return NextResponse.json({
    standby,
    bulkEmailsEnabled: bulkEmailsEnabled(),
    lastSent,
    crons: [
      { id: "welcome", name: "Welcome drip (Day 1 + Day 3)", schedule: "Every 6 hours" },
      { id: "weekly", name: "Weekly update", schedule: "Mondays at 15:00 UTC" },
      { id: "milestone", name: "Milestone alerts (reached / pre-milestone / near-finish)", schedule: "Daily at 09:00 UTC" },
      { id: "honor", name: "Honor reminders (Day 5 + Day 14)", schedule: "Daily at 12:00 UTC" },
    ],
  });
}

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  let body: { standby?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.standby !== "boolean") {
    return NextResponse.json(
      { error: "Body must include { standby: boolean }" },
      { status: 400 }
    );
  }

  // Store as a literal string so the read path matches isEmailCronStandby's
  // "false"/false check exactly. Stringifying keeps the value human-readable
  // in Redis CLI / Upstash console.
  await redis.set(STANDBY_KEY, body.standby ? "true" : "false");

  return NextResponse.json({ ok: true, standby: body.standby });
}
