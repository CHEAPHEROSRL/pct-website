import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { sendWelcomeDay1, sendWelcomeDay3, bulkEmailsEnabled } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";

// Max Vercel Hobby tier duration. Without this, the cron is killed at 30s,
// Vercel retries from scratch, and pledgers already-sent receive the
// email again on the second run. 60s covers hundreds of emails comfortably.
export const maxDuration = 60;

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Welcome drip: sends Day 1 (24hrs) and Day 3 (72hrs) emails to new pledgers.
// Schedule: every 6 hours to catch pledgers in the right time windows.

export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  if (!bulkEmailsEnabled()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "bulk emails disabled — set EMAILS_ENABLED=true in Vercel env to enable",
    });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const now = Date.now();
    const HOUR = 1000 * 60 * 60;

    // Get all pledgers
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const allRecords: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;

    let day1Sent = 0;
    let day3Sent = 0;
    let skipped = 0;

    for (const record of allRecords) {
      if (!record.email) continue;
      // Only "all" preference gets welcome drip
      if (record.emailPreference && record.emailPreference !== "all") {
        skipped++;
        continue;
      }

      const hoursSincePledge = (now - record.createdAt) / HOUR;

      // Day 1 email: between 20-28 hours after pledge
      if (hoursSincePledge >= 20 && hoursSincePledge < 28) {
        const sentKey = `emails:welcome:day1:${record.id}`;
        const alreadySent = await redis.get(sentKey);
        if (!alreadySent) {
          const rate = `$${record.amount.toFixed(2)}/${record.interval === 1 ? "mi" : record.interval + "mi"}`;
          const result = await sendWelcomeDay1(
            record.email,
            record.anonymous ? "Friend" : record.name,
            rate,
            record.totalPledge,
            pledgerCount,
            record.unsubscribeToken
          );
          if (result.success) {
            await redis.set(sentKey, "1", { ex: 86400 * 7 }); // Expire after 7 days
            day1Sent++;
          }
        }
      }

      // Day 3 email: between 68-76 hours after pledge
      if (hoursSincePledge >= 68 && hoursSincePledge < 76) {
        const sentKey = `emails:welcome:day3:${record.id}`;
        const alreadySent = await redis.get(sentKey);
        if (!alreadySent) {
          const result = await sendWelcomeDay3(
            record.email,
            record.anonymous ? "Friend" : record.name,
            pledgerCount,
            record.unsubscribeToken
          );
          if (result.success) {
            await redis.set(sentKey, "1", { ex: 86400 * 7 });
            day3Sent++;
          }
        }
      }

      // Rate limit
      if ((day1Sent + day3Sent) % 10 === 0 && (day1Sent + day3Sent) > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      day1Sent,
      day3Sent,
      skipped,
      total: allRecords.length,
    });
  } catch (err) {
    console.error("Welcome drip failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
