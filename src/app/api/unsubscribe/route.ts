import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/security";
import type { PledgeRecord } from "@/lib/types";

/**
 * Unsubscribe / email-preferences API.
 *
 * Handles TWO kinds of tokens:
 *   - Pledger tokens: resolved via `unsub:<token>` → email → `pledger:<hash>`
 *   - Waitlist tokens: resolved via `waitlist:token:<token>` → email →
 *     `waitlist:meta:<email>`
 *
 * Pledgers have a preference tier (all / milestones / finish) they can toggle.
 * Waitlist subscribers don't have tiers — they're either subscribed or not.
 * Full unsubscribe for a waitlist entry REMOVES them from `waitlist:emails`
 * so the new-post cron stops sending to them.
 */

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

type SubscriberType = "pledger" | "waitlist";

interface ResolvedToken {
  type: SubscriberType;
  email: string;
}

/**
 * Resolve an unsubscribe token to the subscriber it belongs to.
 * Checks pledger tokens first (more common), then waitlist.
 */
async function resolveToken(
  redis: Redis,
  token: string
): Promise<ResolvedToken | null> {
  // Pledger tokens
  const pledgerEmail = await redis.get<string>(`unsub:${token}`);
  if (pledgerEmail) return { type: "pledger", email: pledgerEmail };

  // Waitlist tokens
  const waitlistEmail = await redis.get<string>(`waitlist:token:${token}`);
  if (waitlistEmail) return { type: "waitlist", email: waitlistEmail };

  return null;
}

// ---------------------------------------------------------------------------
// GET — Retrieve current subscription info by unsubscribe token
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.unsubscribe(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const resolved = await resolveToken(redis, token);
    if (!resolved) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    if (resolved.type === "pledger") {
      const hash = (await import("crypto"))
        .createHash("sha256")
        .update(resolved.email.toLowerCase().trim())
        .digest("hex")
        .slice(0, 16);
      const raw = await redis.get<string>(`pledger:${hash}`);
      if (!raw) {
        return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
      }
      const record: PledgeRecord =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      return NextResponse.json({
        type: "pledger",
        name: record.anonymous ? "Pledger" : record.name,
        email: resolved.email,
        emailPreference: record.emailPreference || "all",
      });
    }

    // waitlist
    const isSubscribed = await redis.sismember(
      "waitlist:emails",
      resolved.email
    );
    return NextResponse.json({
      type: "waitlist",
      name: "Friend",
      email: resolved.email,
      subscribed: !!isSubscribed,
    });
  } catch (err) {
    console.error("Failed to fetch preferences:", err);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT — Update preferences (pledger) or unsubscribe (waitlist)
// ---------------------------------------------------------------------------
//
// Body:
//   Pledger:  { token, preference: "all" | "milestones" | "finish" }
//   Waitlist: { token, preference: "unsubscribe" }  (only valid action)
//
// ---------------------------------------------------------------------------
export async function PUT(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.unsubscribe(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { token, preference } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const resolved = await resolveToken(redis, token);
    if (!resolved) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    if (resolved.type === "pledger") {
      if (!["all", "milestones", "finish"].includes(preference)) {
        return NextResponse.json(
          { error: "Preference must be 'all', 'milestones', or 'finish'" },
          { status: 400 }
        );
      }

      const hash = (await import("crypto"))
        .createHash("sha256")
        .update(resolved.email.toLowerCase().trim())
        .digest("hex")
        .slice(0, 16);
      const raw = await redis.get<string>(`pledger:${hash}`);
      if (!raw) {
        return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
      }

      const record: PledgeRecord =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      record.emailPreference = preference;
      record.updatedAt = Date.now();

      await redis.set(`pledger:${hash}`, JSON.stringify(record));

      // Update list entry
      const list = await redis.lrange<string>("pledgers:list", 0, -1);
      for (let i = 0; i < list.length; i++) {
        const item: PledgeRecord =
          typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
        if (item.id === hash) {
          await redis.lset("pledgers:list", i, JSON.stringify(record));
          break;
        }
      }

      return NextResponse.json({
        success: true,
        type: "pledger",
        emailPreference: record.emailPreference,
      });
    }

    // waitlist — only "unsubscribe" is valid
    if (preference !== "unsubscribe") {
      return NextResponse.json(
        { error: "Waitlist subscribers can only unsubscribe" },
        { status: 400 }
      );
    }

    // Remove from the waitlist set — the cron job iterates this set, so
    // removing here means they stop receiving new-post emails.
    await redis.srem("waitlist:emails", resolved.email);

    // Keep the meta record so we have a history + the token still resolves
    // (in case they click an old link we want to show "you're unsubscribed")
    // but mark it as unsubscribed.
    await redis.hset(`waitlist:meta:${resolved.email}`, {
      unsubscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      type: "waitlist",
      subscribed: false,
    });
  } catch (err) {
    console.error("Failed to update preferences:", err);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
