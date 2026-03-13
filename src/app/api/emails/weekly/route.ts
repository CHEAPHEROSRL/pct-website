import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sendWeeklyUpdate } from "@/lib/email";
import { snapToTrail, metersToFeet } from "@/lib/trail";
import type { PledgeRecord, GpsPoint, JournalPost } from "@/lib/types";

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
  // Auth: only allow Vercel Cron or manual trigger with secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Send to each pledger
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const record of records) {
      if (!record.email) continue;

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
      } else {
        failed++;
        if (errors.length < 5) errors.push(result.error || "Unknown");
      }

      // Rate limit: small delay between sends to stay within Resend limits
      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Store last send timestamp
    await redis.set("emails:weekly:last_sent", Date.now());
    await redis.set("emails:weekly:last_week", weekNumber);

    return NextResponse.json({
      success: true,
      weekNumber,
      milesWalked,
      sent,
      failed,
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
