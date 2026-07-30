import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";
import { sendPledgeReminder } from "@/lib/email";
import { UNCONFIRMED_KEY } from "@/lib/pledge-store";
import {
  isReminderDue,
  issueFreshVerifyUrl,
  MAX_REMINDERS,
} from "@/lib/pledge-reminders";
import type { UnconfirmedPledge } from "@/lib/types";

/**
 * Daily reminder run for pledges that were started but never confirmed.
 *
 * Paul asked for reminders that keep going until people confirm. They taper
 * and stop after MAX_REMINDERS — see lib/pledge-reminders for why an
 * unbounded loop would be self-defeating.
 *
 * Deliberately NOT behind bulkEmailsEnabled() or the STANDBY flag. Those exist
 * to stop mass blasts to the whole pledger list surprising anyone; this only
 * ever emails someone who personally submitted the pledge form and hasn't
 * finished, which is the same class as the verification email itself. Putting
 * it behind a flag that currently defaults to off would mean it silently never
 * ran, which is exactly the bug being fixed.
 *
 * Protected by CRON_SECRET.
 */

// Vercel Hobby ceiling. Each pledger costs one Gmail round trip, and the
// unconfirmed list is small, but the cap keeps a long list from being killed
// mid-run — anyone missed is simply picked up by tomorrow's run.
export const maxDuration = 60;

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const raw = await redis.hgetall<Record<string, string>>(UNCONFIRMED_KEY);
  const entries = Object.values(raw || {})
    .map((v) => safeParse<UnconfirmedPledge | null>(v, null))
    .filter((v): v is UnconfirmedPledge => v !== null);

  const result = { checked: entries.length, sent: 0, expired: 0, skipped: 0, failed: 0 };

  for (const entry of entries) {
    if (entry.expired || !isReminderDue(entry)) {
      result.skipped++;
      continue;
    }

    // Their pending record is gone, so no link can be minted. Flag it once so
    // admin can show "needs to pledge again" and we stop retrying forever.
    const verifyUrl = await issueFreshVerifyUrl(redis, entry.id);
    if (!verifyUrl) {
      await redis.hset(UNCONFIRMED_KEY, {
        [entry.id]: JSON.stringify({ ...entry, expired: true }),
      });
      result.expired++;
      continue;
    }

    const attempt = (entry.reminderCount ?? 0) + 1;
    const sendResult = await sendPledgeReminder(
      entry.email,
      entry.name,
      entry.rate,
      entry.totalPledge,
      verifyUrl,
      attempt,
      MAX_REMINDERS
    );

    if (!sendResult.success) {
      // Don't increment the counter on failure, so a transient Gmail problem
      // costs a day rather than one of their four reminders.
      result.failed++;
      continue;
    }

    const updated: UnconfirmedPledge = {
      ...entry,
      reminderCount: attempt,
      lastReminderAt: Date.now(),
      lastSentAt: Date.now(),
      sendCount: entry.sendCount + 1,
    };
    await redis.hset(UNCONFIRMED_KEY, { [entry.id]: JSON.stringify(updated) });
    result.sent++;
  }

  return NextResponse.json({ ok: true, ...result });
}

// Vercel Cron issues GET. Exporting POST only is what silently broke the
// Instagram and YouTube syncs for months — they returned 405 every day. Both
// verbs delegate to the same handler so a manual curl works too.
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}
