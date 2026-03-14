import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/security";
import type { ChallengeRecord, ChallengeCommitment } from "@/lib/types";
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

// POST — Pre-commit a boost for the active challenge
export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.challengeCommit(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email, boostAmount } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    if (typeof boostAmount !== "number" || boostAmount <= 0 || boostAmount > 100) {
      return NextResponse.json({ error: "Boost amount must be $0.01–$100" }, { status: 400 });
    }

    // Verify pledger exists
    const hash = emailHash(email);
    const pledgerRaw = await redis.get<string>(`pledger:${hash}`);
    if (!pledgerRaw) {
      return NextResponse.json({ error: "No pledge found for this email. Pledge first!" }, { status: 404 });
    }
    const pledger = typeof pledgerRaw === "string" ? JSON.parse(pledgerRaw) : pledgerRaw;

    // Verify active challenge exists
    const activeRaw = await redis.get<string>("challenge:active");
    if (!activeRaw) {
      return NextResponse.json({ error: "No active challenge right now" }, { status: 404 });
    }
    const challenge: ChallengeRecord =
      typeof activeRaw === "string" ? JSON.parse(activeRaw) : activeRaw;

    // Check if pledger already committed to this challenge
    const existingCommitments = await redis.lrange<string>(
      `challenge:${challenge.id}:commitments`,
      0,
      -1
    );
    for (const raw of existingCommitments || []) {
      const c = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (c.pledgerId === hash) {
        return NextResponse.json(
          { error: "You already committed a boost for this challenge" },
          { status: 409 }
        );
      }
    }

    const commitment: ChallengeCommitment = {
      pledgerId: hash,
      pledgerName: pledger.anonymous ? "Anonymous" : pledger.name,
      challengeId: challenge.id,
      boostAmount,
      committedAt: Date.now(),
    };

    await redis.lpush(`challenge:${challenge.id}:commitments`, JSON.stringify(commitment));

    // Update commitment count on active challenge
    challenge.commitmentCount += 1;
    await redis.set("challenge:active", JSON.stringify(challenge));

    return NextResponse.json({
      success: true,
      message: `Boost of $${boostAmount.toFixed(2)} committed! If Paul succeeds, your pledge will increase.`,
      commitment: {
        challengeTitle: challenge.title,
        boostAmount,
        committedAt: commitment.committedAt,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Failed to commit boost:", err);
    return NextResponse.json({ error: "Failed to commit boost" }, { status: 500 });
  }
}
