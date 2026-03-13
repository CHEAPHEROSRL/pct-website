import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
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

// GET — Retrieve honor status + pledge summary for a pledger
export async function GET(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
  }

  try {
    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json({ error: "No pledge found for this email" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Get community honor stats
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

// POST — Mark a pledge as honored
export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
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

    // Send honor confirmation email (fire-and-forget)
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
