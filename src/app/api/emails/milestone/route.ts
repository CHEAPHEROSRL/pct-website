import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sendMilestoneReached } from "@/lib/email";
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
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const currentMiles = await getMilesFromGps(redis);
  return sendMilestoneEmails(redis, currentMiles);
}

// POST: Manual trigger with explicit miles
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const currentMiles = body.miles as number;

    if (typeof currentMiles !== "number" || currentMiles < 0) {
      return NextResponse.json({ error: "Invalid miles" }, { status: 400 });
    }

    return sendMilestoneEmails(redis, currentMiles);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
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

    // Get community stats
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
    const totalPledged = (await redis.get<number>("pledgers:total_pledged")) || 0;

    // Get country count from pledger locations
    const rawLocList = await redis.lrange<string>("pledgers:list", 0, -1);
    const allRecords: PledgeRecord[] = (rawLocList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
    const countries = new Set<string>();
    for (const r of allRecords) {
      if (r.country) countries.add(r.country);
    }

    // Send for the most recent milestone only (avoid spamming)
    const milestone = toSend[toSend.length - 1];

    let sent = 0;
    let failed = 0;

    for (const record of allRecords) {
      if (!record.email) continue;

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
        countries.size
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

