import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { consumeEmailVerifyToken, RATE_LIMITS } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";
import { sendPledgeConfirmation, sendCommunityMilestone } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const TOTAL_MILES = 2650;

const PLEDGER_THRESHOLDS = [25, 50, 100, 200, 500, 1000];
const TOTAL_THRESHOLDS = [5000, 10000, 25000, 50000, 100000];

// GET /api/pledges/verify?token=xxx — Confirm a pending pledge via email link
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Verification token required" }, { status: 400 });
  }

  try {
    // Consume the token — returns the pending pledge key if valid
    const pendingKey = await consumeEmailVerifyToken(redis, token, "pledge");
    if (!pendingKey) {
      // Redirect to a friendly page instead of JSON error
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      return NextResponse.redirect(
        `${siteUrl}/pledge/verify?status=expired`
      );
    }

    // Get the pending pledge data
    const pendingRaw = await redis.get<string>(pendingKey);
    if (!pendingRaw) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      return NextResponse.redirect(
        `${siteUrl}/pledge/verify?status=expired`
      );
    }

    const pendingRecord = safeParse<PledgeRecord | null>(pendingRaw, null);
    if (!pendingRecord) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
    }

    // Check if pledge already exists (e.g., double-click on verify link)
    const liveKey = `pledger:${pendingRecord.id}`;
    const existing = await redis.get<string>(liveKey);
    if (existing) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      return NextResponse.redirect(
        `${siteUrl}/pledge/verify?status=already`
      );
    }

    // Move from pending to live
    await redis.set(liveKey, JSON.stringify(pendingRecord));
    await redis.lpush("pledgers:list", JSON.stringify(pendingRecord));
    await redis.incr("pledgers:count");
    await redis.incrbyfloat("pledgers:total_pledged", pendingRecord.totalPledge);

    // Store unsubscribe token mapping
    if (pendingRecord.unsubscribeToken) {
      await redis.set(`unsub:${pendingRecord.unsubscribeToken}`, pendingRecord.email);
    }

    // Clean up pending record
    await redis.del(pendingKey);

    // Send confirmation email (fire-and-forget)
    const rate = `$${pendingRecord.amount}/${pendingRecord.interval === 1 ? "mi" : pendingRecord.interval + "mi"}`;
    sendPledgeConfirmation(
      pendingRecord.email,
      pendingRecord.name,
      rate,
      pendingRecord.totalPledge
    ).catch(() => {});

    // Check community milestones
    const newCount = (await redis.get<number>("pledgers:count")) || 0;
    const newTotal = (await redis.get<number>("pledgers:total_pledged")) || 0;
    checkCommunityMilestones(redis, newCount, newTotal).catch(() => {});

    // Redirect to success page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
    return NextResponse.redirect(
      `${siteUrl}/pledge/verify?status=success&name=${encodeURIComponent(pendingRecord.anonymous ? "Friend" : pendingRecord.name)}&total=${pendingRecord.totalPledge}`
    );
  } catch (err) {
    console.error("Pledge verification failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// Community milestone check (same as in pledges/route.ts)
async function checkCommunityMilestones(redis: Redis, pledgerCount: number, totalPledged: number) {
  const sentSet = (await redis.smembers("emails:community:sent")) || [];

  for (const threshold of PLEDGER_THRESHOLDS) {
    const key = `pledgers:${threshold}`;
    if (pledgerCount >= threshold && !sentSet.includes(key)) {
      await sendCommunityMilestoneToAll(redis, "pledgers", threshold, pledgerCount, totalPledged);
      await redis.sadd("emails:community:sent", key);
      break;
    }
  }

  for (const threshold of TOTAL_THRESHOLDS) {
    const key = `total:${threshold}`;
    if (totalPledged >= threshold && !sentSet.includes(key)) {
      await sendCommunityMilestoneToAll(redis, "total", threshold, pledgerCount, totalPledged);
      await redis.sadd("emails:community:sent", key);
      break;
    }
  }
}

async function sendCommunityMilestoneToAll(
  redis: Redis,
  variant: "pledgers" | "total" | "countries",
  value: number,
  pledgerCount: number,
  totalPledged: number
) {
  const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
  const records: PledgeRecord[] = (rawList || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  let sent = 0;
  for (const record of records) {
    if (!record.email) continue;
    if (record.emailPreference && record.emailPreference !== "all") continue;

    await sendCommunityMilestone(
      record.email,
      record.anonymous ? "Friend" : record.name,
      variant,
      value,
      pledgerCount,
      totalPledged,
      record.unsubscribeToken
    );
    sent++;
    if (sent % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
