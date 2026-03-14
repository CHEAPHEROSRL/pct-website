import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { consumeEmailVerifyToken, RATE_LIMITS } from "@/lib/security";
import { sendHonorConfirmation } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";
import crypto from "crypto";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function emailHash(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
}

// GET /api/honor/verify?token=xxx — Confirm honor via email link
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
    const email = await consumeEmailVerifyToken(redis, token, "honor");
    if (!email) {
      return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
    }

    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (record.honored) {
      return NextResponse.redirect(`${siteUrl}/my-pledge?honored=already`);
    }

    // Mark as honored
    record.honored = true;
    record.honoredAt = Date.now();
    record.updatedAt = Date.now();

    await redis.set(key, JSON.stringify(record));
    await redis.incr("pledgers:honored_count");

    // Update list entry
    const list = await redis.lrange<string>("pledgers:list", 0, -1);
    for (let i = 0; i < list.length; i++) {
      const item: PledgeRecord = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
      if (item.id === hash) {
        await redis.lset("pledgers:list", i, JSON.stringify(record));
        break;
      }
    }

    // Send confirmation email
    const honoredCount = (await redis.get<number>("pledgers:honored_count")) || 0;
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
    const honorRate = pledgerCount > 0 ? Math.round((honoredCount / pledgerCount) * 100) : 0;
    sendHonorConfirmation(
      record.email,
      record.anonymous ? "Friend" : record.name,
      record.totalPledge,
      honoredCount,
      pledgerCount,
      honorRate,
      record.unsubscribeToken
    ).catch(() => {});

    return NextResponse.redirect(`${siteUrl}/my-pledge?honored=true`);
  } catch (err) {
    console.error("Honor verification failed:", err);
    return NextResponse.redirect(`${siteUrl}/pledge/verify?status=expired`);
  }
}
