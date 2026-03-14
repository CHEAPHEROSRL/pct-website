import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sendHonorConfirmation, sendActionVerification } from "@/lib/email";
import type { PledgeRecord } from "@/lib/types";
import {
  RATE_LIMITS,
  sanitizeEmail,
  generateEmailVerifyToken,
  consumeEmailVerifyToken,
} from "@/lib/security";
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

// GET — Retrieve honor status + pledge summary for a pledger
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.honorAction(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const rawEmail = req.nextUrl.searchParams.get("email");
  const email = rawEmail ? sanitizeEmail(rawEmail) : null;
  if (!email) {
    return NextResponse.json({ error: "Valid email parameter required" }, { status: 400 });
  }

  try {
    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json({ error: "No pledge found for this email" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;

    const honoredCount = (await redis.get<number>("pledgers:honored_count")) || 0;
    const pledgerCount = (await redis.get<number>("pledgers:count")) || 0;
    const totalPledged = (await redis.get<number>("pledgers:total_pledged")) || 0;

    return NextResponse.json({
      pledge: {
        id: record.id,
        name: record.anonymous ? "Anonymous" : record.name,
        amount: record.amount,
        interval: record.interval,
        totalPledge: record.totalPledge,
        honored: !!record.honored,
        honoredAt: record.honoredAt || null,
      },
      community: {
        honoredCount,
        pledgerCount,
        totalPledged,
        honorRate: pledgerCount > 0 ? Math.round((honoredCount / pledgerCount) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("Failed to fetch honor status:", err);
    return NextResponse.json({ error: "Failed to retrieve honor status" }, { status: 500 });
  }
}

// POST — Request to mark pledge as honored (sends verification email, or processes verified token)
export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.honorAction(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email: rawEmail, verifyToken } = body;

    const email = sanitizeEmail(rawEmail || "");
    if (!email) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json({ error: "No pledge found for this email" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (record.honored) {
      return NextResponse.json({
        success: true,
        message: "Pledge already marked as honored",
        honoredAt: record.honoredAt,
      });
    }

    // Step 1: If no verifyToken, send a verification email
    if (!verifyToken) {
      const token = await generateEmailVerifyToken(redis, email, "honor", 86400); // 24h for honor
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      const verifyUrl = `${siteUrl}/api/honor/verify?token=${token}`;
      const name = record.anonymous ? "Friend" : record.name;

      sendActionVerification(
        email,
        name,
        "Confirm Honor",
        `You're marking your $${record.totalPledge.toFixed(2)} pledge as honored. Click to confirm.`,
        verifyUrl
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        pending: true,
        message: "Check your email to confirm you've honored your pledge.",
      });
    }

    // Step 2: If verifyToken provided, validate and process
    const verifiedEmail = await consumeEmailVerifyToken(redis, verifyToken, "honor");
    if (!verifiedEmail || verifiedEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
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

    // Send honor confirmation email
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

    return NextResponse.json({
      success: true,
      message: "Thank you for honoring your pledge!",
      honoredAt: record.honoredAt,
    });
  } catch (err) {
    console.error("Failed to mark pledge as honored:", err);
    return NextResponse.json({ error: "Failed to update honor status" }, { status: 500 });
  }
}
