import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { sendWeeklyUpdate, bulkEmailsEnabled, isEmailCronStandby } from "@/lib/email";
import { snapToTrail, metersToFeet } from "@/lib/trail";
import type { PledgeRecord, GpsPoint, JournalPost } from "@/lib/types";

export const maxDuration = 60;

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Vercel Cron calls GET every Monday at 8am PT (0 15 * * 1 UTC)
export async function GET(request: NextRequest) {
  return handleWeeklySend(request);
}

// POST for manual trigger
export async function POST(request: NextRequest) {
  return handleWeeklySend(request);
}

async function handleWeeklySend(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  if (!bulkEmailsEnabled()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "bulk emails disabled — set EMAILS_ENABLED=true in Vercel env to enable",
    });
  }

  // STANDBY gate. ?bypassStandby=1 is set by the admin "Send Now" trigger so
  // Paul can fire the blast on demand even while standby is on (the cron
  // schedule stays paused). Anyone calling this without bypassStandby is
  // either the Vercel scheduler or a manual curl with CRON_SECRET — both
  // legitimately governed by standby.
  const bypassStandby = request.nextUrl.searchParams.get("bypassStandby") === "1";
  if (!bypassStandby && (await isEmailCronStandby())) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "email crons in STANDBY — flip the switch in admin Settings → Email Crons",
    });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    // Get current trail position
    const currentRaw = await redis.get<string>("location:current");
    let milesWalked = 0;
    let elevation = 2915;
    let nearestLocation = "Campo";

    if (currentRaw) {
      const current: GpsPoint =
        typeof currentRaw === "string" ? JSON.parse(currentRaw) : currentRaw;
      const trail = snapToTrail(current.lat, current.lng);
      milesWalked = Math.round(trail.miles * 10) / 10;
      elevation = current.altitude !== null ? metersToFeet(current.altitude) : trail.elevationFt;
      nearestLocation = trail.nearestName;
    }

    // Calculate day and week number
    const hikeStart = new Date(process.env.HIKE_START_DATE || "2026-03-28");
    const now = new Date();
    const dayNumber = Math.max(1, Math.ceil((now.getTime() - hikeStart.getTime()) / (1000 * 60 * 60 * 24)));
    const weekNumber = Math.max(1, Math.ceil(dayNumber / 7));

    // Get pledger count
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;

    // Get latest journal entry for excerpt
    let journalExcerpt: string | undefined;
    let journalSlug: string | undefined;
    const journalRaw = await redis.lrange<string>("journal:posts", 0, 0);
    if (journalRaw && journalRaw.length > 0) {
      const post: JournalPost =
        typeof journalRaw[0] === "string" ? JSON.parse(journalRaw[0]) : journalRaw[0];
      if (post.published && post.excerpt) {
        journalExcerpt = post.excerpt.slice(0, 200);
        journalSlug = post.slug;
      }
    }

    // Get all pledgers
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    // Per-record dedup for THIS week. The weekly cron runs once per week, and
    // if it times out Vercel retries from scratch. Without this set, every
    // retry re-sends the full batch up to the timeout, producing duplicate
    // "Week 6 update" emails. The set is keyed by week number so next week's
    // run starts fresh.
    const perRecordKey = `emails:weekly:w${weekNumber}:sent_ids`;
    const alreadySentIds = new Set((await redis.smembers(perRecordKey)) || []);

    // Send to each pledger
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of records) {
      if (!record.email) continue;
      // Respect email preferences — weekly is "all" level only
      if (record.emailPreference && record.emailPreference !== "all") continue;

      // Skip pledgers already emailed in this week's run (including previous
      // partial runs that got killed by the timeout)
      if (alreadySentIds.has(record.id)) {
        skipped++;
        continue;
      }

      const result = await sendWeeklyUpdate(
        record.email,
        record.anonymous ? "Friend" : record.name,
        weekNumber,
        record.amount,
        record.interval,
        milesWalked,
        dayNumber,
        Math.round(elevation),
        pledgerCount,
        nearestLocation,
        journalExcerpt,
        journalSlug
      );

      if (result.success) {
        sent++;
        // Mark sent BEFORE the next send so a mid-loop timeout doesn't
        // re-send this pledger on retry
        await redis.sadd(perRecordKey, record.id);
      } else {
        failed++;
        if (errors.length < 5) errors.push(result.error || "Unknown");
      }

      // Rate limit: small delay between sends to stay within Resend limits
      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Expire the per-record set after 30 days to keep Redis tidy. By then
    // the next ~4 weeks of runs will have happened; nothing should need to
    // reference this old set.
    await redis.expire(perRecordKey, 60 * 60 * 24 * 30);

    // Store last send timestamp
    await redis.set("emails:weekly:last_sent", Date.now());
    await redis.set("emails:weekly:last_week", weekNumber);

    return NextResponse.json({
      success: true,
      weekNumber,
      milesWalked,
      sent,
      failed,
      skipped,
      total: records.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Weekly email cron failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
