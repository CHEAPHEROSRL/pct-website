import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { PledgeRecord } from "@/lib/types";
import { sendPledgeConfirmation } from "@/lib/email";
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

// POST — Register a new pledge
export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email, name, amount, interval, anonymous, message, city, country, lat, lng } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount < 0.01 || amount > 100) {
      return NextResponse.json({ error: "Amount must be between $0.01 and $100" }, { status: 400 });
    }
    if (![1, 10, 100].includes(interval)) {
      return NextResponse.json({ error: "Interval must be 1, 10, or 100" }, { status: 400 });
    }

    const hash = emailHash(email);
    const key = `pledger:${hash}`;

    // Check if pledger already exists
    const existing = await redis.get<string>(key);
    if (existing) {
      const record: PledgeRecord = typeof existing === "string" ? JSON.parse(existing) : existing;
      return NextResponse.json({
        error: "A pledge already exists for this email",
        pledge: {
          rate: `$${record.amount}/${record.interval === 1 ? "mi" : record.interval + "mi"}`,
          totalPledge: record.totalPledge,
          createdAt: record.createdAt,
        },
      }, { status: 409 });
    }

    const totalPledge = (amount * TOTAL_MILES) / interval;

    const record: PledgeRecord = {
      id: hash,
      email: email.toLowerCase().trim(),
      name: (name || "Anonymous").trim().slice(0, 100),
      amount,
      interval,
      totalPledge,
      anonymous: !!anonymous,
      boosts: [],
      message: typeof message === "string" && message.trim() ? message.trim().slice(0, 280) : undefined,
      city: typeof city === "string" ? city.trim().slice(0, 100) : undefined,
      country: typeof country === "string" ? country.trim().slice(0, 100) : undefined,
      lat: typeof lat === "number" && lat >= -90 && lat <= 90 ? lat : undefined,
      lng: typeof lng === "number" && lng >= -180 && lng <= 180 ? lng : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store pledger record
    await redis.set(key, JSON.stringify(record));

    // Add to list (for leaderboard)
    await redis.lpush("pledgers:list", JSON.stringify(record));

    // Update aggregates
    await redis.incr("pledgers:count");
    await redis.incrbyfloat("pledgers:total_pledged", totalPledge);

    // Send confirmation email (fire-and-forget)
    const rate = `$${amount}/${interval === 1 ? "mi" : interval + "mi"}`;
    sendPledgeConfirmation(record.email, record.name, rate, totalPledge).catch(() => {});

    return NextResponse.json({
      success: true,
      pledge: {
        id: record.id,
        name: record.anonymous ? "Anonymous" : record.name,
        rate: `$${amount}/${interval === 1 ? "mi" : interval + "mi"}`,
        totalPledge,
        createdAt: record.createdAt,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Failed to create pledge:", err);
    return NextResponse.json({ error: "Failed to register pledge" }, { status: 500 });
  }
}

// GET — Retrieve a pledger's profile by email
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

    return NextResponse.json({
      pledge: {
        id: record.id,
        name: record.anonymous ? "Anonymous" : record.name,
        amount: record.amount,
        interval: record.interval,
        totalPledge: record.totalPledge,
        boosts: record.boosts,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (err) {
    console.error("Failed to fetch pledge:", err);
    return NextResponse.json({ error: "Failed to retrieve pledge" }, { status: 500 });
  }
}

// PUT — Update pledge amount (increase / boost)
export async function PUT(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email, addAmount, challengeId, challengeTitle } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    if (typeof addAmount !== "number" || addAmount <= 0 || addAmount > 100) {
      return NextResponse.json({ error: "Add amount must be between $0.01 and $100" }, { status: 400 });
    }

    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json({ error: "No pledge found for this email" }, { status: 404 });
    }

    const record: PledgeRecord = typeof raw === "string" ? JSON.parse(raw) : raw;
    const oldTotal = record.totalPledge;

    // Apply boost
    record.amount += addAmount;
    record.totalPledge = (record.amount * TOTAL_MILES) / record.interval;
    record.updatedAt = Date.now();

    if (challengeId) {
      record.boosts.push({
        challengeId,
        challengeTitle: challengeTitle || "Manual increase",
        addedAmount: addAmount,
        addedAt: Date.now(),
      });
    }

    // Save updated record
    await redis.set(key, JSON.stringify(record));

    // Update aggregate total
    const totalDiff = record.totalPledge - oldTotal;
    await redis.incrbyfloat("pledgers:total_pledged", totalDiff);

    // Update list entry (replace old record)
    const list = await redis.lrange<string>("pledgers:list", 0, -1);
    for (let i = 0; i < list.length; i++) {
      const item: PledgeRecord = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
      if (item.id === hash) {
        await redis.lset("pledgers:list", i, JSON.stringify(record));
        break;
      }
    }

    return NextResponse.json({
      success: true,
      pledge: {
        id: record.id,
        amount: record.amount,
        interval: record.interval,
        totalPledge: record.totalPledge,
        boosts: record.boosts,
        updatedAt: record.updatedAt,
      },
    });
  } catch (err) {
    console.error("Failed to update pledge:", err);
    return NextResponse.json({ error: "Failed to update pledge" }, { status: 500 });
  }
}
