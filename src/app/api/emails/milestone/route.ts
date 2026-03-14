import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { sendMilestoneReached, sendPreMilestoneNudge, sendNearFinish } from "@/lib/email";
import { snapToTrail } from "@/lib/trail";
import type { PledgeRecord, GpsPoint } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Milestone definitions
const MILESTONES = [
  { miles: 500, name: "Paul Hit 500 Miles!", description: "Through the scorching deserts of Southern California — five hundred miles walked for cancer." },
  { miles: 1000, name: "Paul Hit 1,000 Miles!", description: "From the Mexican border through the deserts of Southern California and into the Sierra Nevada — one thousand miles walked for cancer." },
  { miles: 1325, name: "Halfway There!", description: "1,325 miles down, 1,325 to go. From Mexico to the middle of the trail — halfway to Canada, halfway to honoring every pledge." },
  { miles: 2000, name: "Paul Hit 2,000 Miles!", description: "Two thousand miles through California, Oregon, and into Washington. The finish line is in sight." },
  { miles: 2650, name: "Paul Reached Canada!", description: "2,650 miles. From the Mexican border to Manning Park, Canada. Every single step for cancer research, patient support, and prevention." },
];

// State crossings
const STATE_CROSSINGS = [
  { miles: 1690, name: "Paul Crossed Into Oregon!", description: "After 1,690 miles through the length of California, Paul has crossed into Oregon. New state, new mountains, same mission." },
  { miles: 2147, name: "Paul Crossed Into Washington!", description: "Oregon conquered! Paul has crossed the Bridge of the Gods into Washington — the final state on the Pacific Crest Trail." },
];

const ALL_MILESTONES = [...MILESTONES, ...STATE_CROSSINGS].sort((a, b) => a.miles - b.miles);

// Pre-milestone nudge thresholds (sent when Paul is within 50mi of these milestones)
const NUDGE_MILESTONES = [
  { miles: 500, name: "500 Miles" },
  { miles: 1000, name: "1,000 Miles" },
  { miles: 1325, name: "Halfway" },
  { miles: 2000, name: "2,000 Miles" },
  { miles: 2650, name: "Canada" },
];

// Near-finish email thresholds (special 3-email sequence)
const NEAR_FINISH = [
  { miles: 2450, variant: "200mi" as const },
  { miles: 2550, variant: "100mi" as const },
  { miles: 2650, variant: "finish" as const },
];

async function getMilesFromGps(redis: Redis): Promise<number> {
  const currentRaw = await redis.get<string>("location:current");
  if (!currentRaw) return 0;
  const current: GpsPoint =
    typeof currentRaw === "string" ? JSON.parse(currentRaw) : currentRaw;
  const { miles } = snapToTrail(current.lat, current.lng);
  return Math.round(miles * 10) / 10;
}

// GET: Vercel Cron calls this to auto-check milestones from GPS
export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const currentMiles = await getMilesFromGps(redis);
  const milestoneResult = await sendMilestoneEmails(redis, currentMiles);
  const nudgeResult = await sendNudgeEmails(redis, currentMiles);
  const nearFinishResult = await sendNearFinishEmails(redis, currentMiles);

  const combined = await milestoneResult.json();
  const nudge = await nudgeResult.json();
  const nearFinish = await nearFinishResult.json();

  return NextResponse.json({
    milestones: combined,
    nudges: nudge,
    nearFinish: nearFinish,
  });
}

// POST: Manual trigger with explicit miles
export async function POST(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const currentMiles = body.miles as number;

    if (typeof currentMiles !== "number" || currentMiles < 0) {
      return NextResponse.json({ error: "Invalid miles" }, { status: 400 });
    }

    const milestoneResult = await sendMilestoneEmails(redis, currentMiles);
    const nudgeResult = await sendNudgeEmails(redis, currentMiles);
    const nearFinishResult = await sendNearFinishEmails(redis, currentMiles);

    const combined = await milestoneResult.json();
    const nudge = await nudgeResult.json();
    const nearFinish = await nearFinishResult.json();

    return NextResponse.json({
      milestones: combined,
      nudges: nudge,
      nearFinish: nearFinish,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// Helper to load pledger records + community stats
async function loadPledgerData(redis: Redis) {
  const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
  const totalPledged = (await redis.get<number>("pledgers:total_pledged")) || 0;
  const rawLocList = await redis.lrange<string>("pledgers:list", 0, -1);
  const allRecords: PledgeRecord[] = (rawLocList || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
  const countries = new Set<string>();
  for (const r of allRecords) {
    if (r.country) countries.add(r.country);
  }
  return { pledgerCount, totalPledged, allRecords, countryCount: countries.size };
}

async function sendMilestoneEmails(redis: Redis, currentMiles: number) {
  try {
    // Check which milestones have been sent already
    const sentMilestones = (await redis.smembers("emails:milestones:sent")) || [];

    // Find milestones that should trigger
    const toSend = ALL_MILESTONES.filter(
      (m) => currentMiles >= m.miles && !sentMilestones.includes(String(m.miles))
    );

    if (toSend.length === 0) {
      return NextResponse.json({ success: true, message: "No new milestones to send", sent: 0 });
    }

    const { pledgerCount, totalPledged, allRecords, countryCount } = await loadPledgerData(redis);

    // Send for the most recent milestone only (avoid spamming)
    const milestone = toSend[toSend.length - 1];

    let sent = 0;
    let failed = 0;

    for (const record of allRecords) {
      if (!record.email) continue;
      // Milestones sent to "all" + "milestones" preference tiers
      if (record.emailPreference === "finish") continue;

      const result = await sendMilestoneReached(
        record.email,
        record.anonymous ? "Friend" : record.name,
        milestone.name,
        milestone.description,
        record.amount,
        record.interval,
        milestone.miles,
        pledgerCount,
        totalPledged,
        countryCount
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limit
      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Mark all triggered milestones as sent
    for (const m of toSend) {
      await redis.sadd("emails:milestones:sent", String(m.miles));
    }

    return NextResponse.json({
      success: true,
      milestone: milestone.name,
      milestoneMiles: milestone.miles,
      sent,
      failed,
      total: allRecords.length,
    });
  } catch (err) {
    console.error("Milestone email failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Pre-milestone nudge emails — sent when Paul is within 50mi of a milestone but hasn't reached it yet
async function sendNudgeEmails(redis: Redis, currentMiles: number) {
  try {
    const sentNudges = (await redis.smembers("emails:nudges:sent")) || [];

    // Find nudge-eligible milestones: within 50mi but not yet reached, nudge not already sent
    const toNudge = NUDGE_MILESTONES.filter(
      (m) =>
        currentMiles >= m.miles - 50 &&
        currentMiles < m.miles &&
        !sentNudges.includes(String(m.miles))
    );

    if (toNudge.length === 0) {
      return NextResponse.json({ success: true, message: "No nudges to send", sent: 0 });
    }

    const { pledgerCount, allRecords } = await loadPledgerData(redis);

    // Send for the nearest upcoming milestone only
    const nudge = toNudge[0];

    let sent = 0;
    let failed = 0;

    for (const record of allRecords) {
      if (!record.email) continue;
      // Nudges are "all" preference level only
      if (record.emailPreference && record.emailPreference !== "all") continue;

      const result = await sendPreMilestoneNudge(
        record.email,
        record.anonymous ? "Friend" : record.name,
        nudge.name,
        nudge.miles,
        currentMiles,
        record.amount,
        record.interval,
        pledgerCount
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Mark nudge as sent
    for (const n of toNudge) {
      await redis.sadd("emails:nudges:sent", String(n.miles));
    }

    return NextResponse.json({
      success: true,
      nudge: nudge.name,
      nudgeMiles: nudge.miles,
      sent,
      failed,
    });
  } catch (err) {
    console.error("Nudge email failed:", err);
    return NextResponse.json({ error: "Nudge email failed" }, { status: 500 });
  }
}

// Near-finish email sequence — special 3-email sequence for the final 200 miles
async function sendNearFinishEmails(redis: Redis, currentMiles: number) {
  try {
    const sentFinish = (await redis.smembers("emails:near_finish:sent")) || [];

    // Find triggered near-finish thresholds
    const toSend = NEAR_FINISH.filter(
      (nf) =>
        currentMiles >= nf.miles &&
        !sentFinish.includes(nf.variant)
    );

    if (toSend.length === 0) {
      return NextResponse.json({ success: true, message: "No near-finish emails to send", sent: 0 });
    }

    const { pledgerCount, totalPledged, allRecords } = await loadPledgerData(redis);

    // Send the most recent triggered variant only
    const trigger = toSend[toSend.length - 1];

    let sent = 0;
    let failed = 0;

    for (const record of allRecords) {
      if (!record.email) continue;
      // Near-finish emails sent to ALL preference tiers (everyone needs to know Paul finished)

      const finalTotal = (record.amount * 2650) / record.interval;

      const result = await sendNearFinish(
        record.email,
        record.anonymous ? "Friend" : record.name,
        trigger.variant,
        record.amount,
        record.interval,
        currentMiles,
        finalTotal,
        pledgerCount,
        totalPledged
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Mark all triggered variants as sent
    for (const nf of toSend) {
      await redis.sadd("emails:near_finish:sent", nf.variant);
    }

    return NextResponse.json({
      success: true,
      variant: trigger.variant,
      sent,
      failed,
    });
  } catch (err) {
    console.error("Near-finish email failed:", err);
    return NextResponse.json({ error: "Near-finish email failed" }, { status: 500 });
  }
}

