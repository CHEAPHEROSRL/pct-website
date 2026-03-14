import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { consumeEmailVerifyToken, RATE_LIMITS } from "@/lib/security";
import { sendPledgeIncreased } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";
import crypto from "crypto";

const TOTAL_MILES = 2650;

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function emailHash(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
}

// GET /api/pledges/boost-verify?token=xxx — Confirm a pledge increase via email link
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

  try {
    const boostDataStr = await consumeEmailVerifyToken(redis, token, "boost");
    if (!boostDataStr) {
      return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
    }

    const boostData = JSON.parse(boostDataStr);
    const { email, addAmount, challengeId, challengeTitle } = boostData;

    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;
    const oldAmount = record.amount;
    const oldTotal = record.totalPledge;

    // Apply the increase
    record.amount += addAmount;
    record.totalPledge = (record.amount * TOTAL_MILES) / record.interval;
    record.updatedAt = Date.now();

    record.boosts.push({
      challengeId: challengeId || "manual",
      challengeTitle: challengeTitle || "Manual increase",
      addedAmount: addAmount,
      addedAt: Date.now(),
    });

    await redis.set(key, JSON.stringify(record));

    const totalDiff = record.totalPledge - oldTotal;
    await redis.incrbyfloat("pledgers:total_pledged", totalDiff);

    // Update list entry
    const list = await redis.lrange<string>("pledgers:list", 0, -1);
    for (let i = 0; i < list.length; i++) {
      const item: PledgeRecord = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
      if (item.id === hash) {
        await redis.lset("pledgers:list", i, JSON.stringify(record));
        break;
      }
    }

    // Send confirmation
    if (!challengeId) {
      const displayName = record.anonymous ? "Pledger" : record.name;
      const newRate = `$${record.amount}/mi`;
      sendPledgeIncreased(record.email, displayName, oldAmount, record.amount, newRate, record.totalPledge).catch(() => {});
    }

    return NextResponse.redirect(
      `${siteUrl}/my-pledge?boosted=true&added=${addAmount}`
    );
  } catch (err) {
    console.error("Boost verification failed:", err);
    return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
  }
}
