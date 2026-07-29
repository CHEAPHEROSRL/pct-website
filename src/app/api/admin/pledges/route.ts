import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireAdminAuth, generateEmailVerifyToken } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";
import { sendPledgeVerification } from "@/lib/email";
import {
  UNCONFIRMED_KEY,
  PENDING_TTL_SECONDS,
  VERIFY_TOKEN_TTL_SECONDS,
} from "@/lib/pledge-store";
import type { PledgeRecord, UnconfirmedPledge } from "@/lib/types";

/**
 * Admin pledger management.
 *
 * Exists because of a real question from Paul: "How do I find those who have
 * told me they pledged but are not appearing?" A pledge only becomes real when
 * the pledger clicks the link in their confirmation email, and until now
 * anyone who didn't click simply vanished — nothing in the admin listed
 * pledgers at all, confirmed or otherwise.
 *
 *   GET    — confirmed pledgers + everyone who never confirmed
 *   POST   — { id } resend the confirmation email to one unconfirmed pledger
 *   DELETE — ?id= remove someone from the chase list without pledging them
 *
 * DELETE only ever touches the follow-up list. It cannot delete a real pledge;
 * there's no path here that writes to pledger:* or pledgers:list.
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readUnconfirmed(redis: Redis): Promise<UnconfirmedPledge[]> {
  const raw = await redis.hgetall<Record<string, string>>(UNCONFIRMED_KEY);
  if (!raw) return [];
  return Object.values(raw)
    .map((v) => safeParse<UnconfirmedPledge | null>(v, null))
    .filter((v): v is UnconfirmedPledge => v !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const [rawList, unconfirmed] = await Promise.all([
      redis.lrange<string>("pledgers:list", 0, -1),
      readUnconfirmed(redis),
    ]);

    const confirmed = (rawList || [])
      .map((item) => safeParse<PledgeRecord | null>(item, null))
      .filter((r): r is PledgeRecord => r !== null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        rate: `$${r.amount.toFixed(2)}/${r.interval === 1 ? "mi" : r.interval + "mi"}`,
        totalPledge: r.totalPledge,
        anonymous: r.anonymous,
        city: r.city,
        country: r.country,
        message: r.message,
        createdAt: r.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // A pledger who confirmed on a second attempt can leave a stale row behind
    // if the hdel ever failed. Filter defensively so admin never shows someone
    // as "needs chasing" when they're already on the wall.
    const confirmedIds = new Set(confirmed.map((c) => c.id));
    const stillWaiting = unconfirmed.filter((u) => !confirmedIds.has(u.id));

    return NextResponse.json({
      confirmed,
      unconfirmed: stillWaiting,
      counts: {
        confirmed: confirmed.length,
        unconfirmed: stillWaiting.length,
      },
    });
  } catch (err) {
    console.error("Failed to load pledges for admin:", err);
    return NextResponse.json({ error: "Failed to load pledges" }, { status: 500 });
  }
}

/** POST { id } — resend the confirmation email to one unconfirmed pledger. */
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const { id } = await request.json().catch(() => ({ id: undefined }));
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const entry = safeParse<UnconfirmedPledge | null>(
      await redis.hget<string>(UNCONFIRMED_KEY, id),
      null
    );
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // The pending record may have expired since they first submitted, in which
    // case there's nothing for a fresh token to point at. Rebuilding the pledge
    // from the follow-up list would mean inventing an interval and amount we
    // didn't keep, so be honest: tell Paul to ask them to pledge again.
    const pendingKey = `pending:${id}`;
    const pending = await redis.get<string>(pendingKey);
    if (!pending) {
      return NextResponse.json(
        {
          error:
            "Their pledge details have expired, so there's nothing left to confirm. Ask them to fill in the pledge form again.",
        },
        { status: 409 }
      );
    }

    // Refresh the record's own TTL too, so the new link can't outlive it.
    await redis.expire(pendingKey, PENDING_TTL_SECONDS);

    const token = await generateEmailVerifyToken(
      redis,
      pendingKey,
      "pledge",
      VERIFY_TOKEN_TTL_SECONDS
    );
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
    const verifyUrl = `${siteUrl}/api/pledges/verify?token=${token}`;

    const result = await sendPledgeVerification(
      entry.email,
      entry.name,
      entry.rate,
      entry.totalPledge,
      verifyUrl
    );
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Email failed to send" },
        { status: 502 }
      );
    }

    const updated: UnconfirmedPledge = {
      ...entry,
      lastSentAt: Date.now(),
      sendCount: entry.sendCount + 1,
    };
    await redis.hset(UNCONFIRMED_KEY, { [id]: JSON.stringify(updated) });

    return NextResponse.json({ ok: true, entry: updated });
  } catch (err) {
    console.error("Failed to resend pledge verification:", err);
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }
}

/** DELETE ?id= — drop someone from the chase list. Never touches a real pledge. */
export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await redis.hdel(UNCONFIRMED_KEY, id);
  return NextResponse.json({ ok: true });
}
