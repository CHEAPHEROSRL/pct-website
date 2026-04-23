import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireCronAuth } from "@/lib/security";
import { sendHonorReminder } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";

export const maxDuration = 60;

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Honor reminder drip: sends follow-up emails to pledgers who haven't honored yet.
// Schedule: daily check. Sends at day 5 and day 14 after Paul finishes.
// The "finish" near-finish email (variant: "finish") counts as day 0.

export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    // Check if the finish email has been sent (meaning Paul completed the trail)
    const sentFinish = (await redis.smembers("emails:near_finish:sent")) || [];
    if (!sentFinish.includes("finish")) {
      return NextResponse.json({
        success: true,
        message: "Paul hasn't finished yet — no honor reminders to send",
      });
    }

    // Check which honor reminders have been sent
    const sentHonor = (await redis.smembers("emails:honor:sent")) || [];

    // Get the finish timestamp (when the finish email was sent)
    let finishTimestamp = await redis.get<number>("emails:finish_timestamp");
    if (!finishTimestamp) {
      // If not set, set it now (first time this cron runs after finish)
      finishTimestamp = Date.now();
      await redis.set("emails:finish_timestamp", finishTimestamp);
    }

    const daysSinceFinish = Math.floor((Date.now() - finishTimestamp) / (1000 * 60 * 60 * 24));

    // Determine which reminder to send
    type HonorVariant = "day5" | "day14";
    let variant: HonorVariant | null = null;

    if (daysSinceFinish >= 14 && !sentHonor.includes("day14")) {
      variant = "day14";
    } else if (daysSinceFinish >= 5 && !sentHonor.includes("day5")) {
      variant = "day5";
    }

    if (!variant) {
      return NextResponse.json({
        success: true,
        message: `Day ${daysSinceFinish} since finish — no honor reminder due`,
        daysSinceFinish,
      });
    }

    // Get community stats
    const honoredCount = (await redis.get<number>("pledgers:honored_count")) || 0;
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;

    // Get all pledgers
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const allRecords: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    // Per-record dedup set. If the cron times out mid-loop and Vercel retries
    // from scratch, already-sent record IDs are in this set so we skip them.
    // Without this, every retry re-sent the entire batch up to the timeout
    // point, producing duplicate honor emails.
    const perRecordKey = `emails:honor:${variant}:sent_ids`;
    const alreadySentIds = new Set((await redis.smembers(perRecordKey)) || []);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const record of allRecords) {
      if (!record.email) continue;

      // Skip pledgers who already honored
      if (record.honored) {
        skipped++;
        continue;
      }

      // Skip pledgers already emailed in a previous (possibly partial) run
      if (alreadySentIds.has(record.id)) {
        skipped++;
        continue;
      }

      const finalTotal = (record.amount * 2650) / record.interval;

      const result = await sendHonorReminder(
        record.email,
        record.anonymous ? "Friend" : record.name,
        variant,
        finalTotal,
        record.amount,
        record.interval,
        honoredCount,
        pledgerCount
      );

      if (result.success) {
        sent++;
        // Mark this pledger as sent BEFORE the next send, so a mid-loop
        // timeout doesn't cost us this record. SADD is idempotent.
        await redis.sadd(perRecordKey, record.id);
      } else {
        failed++;
      }

      // Rate limit
      if (sent % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Mark this reminder variant as fully sent (skips future cron runs for
    // this variant unless the variant-level flag is manually cleared).
    // Only mark complete if nothing failed — a partial batch should retry.
    if (failed === 0) {
      await redis.sadd("emails:honor:sent", variant);
    }

    return NextResponse.json({
      success: true,
      variant,
      daysSinceFinish,
      sent,
      failed,
      skipped,
      total: allRecords.length,
    });
  } catch (err) {
    console.error("Honor reminder failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
