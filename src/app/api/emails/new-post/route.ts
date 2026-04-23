import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sendNewPost } from "@/lib/email";
import { getSetting } from "@/lib/settings";
import type { PledgeRecord } from "@/lib/types";
import { constantTimeEqual } from "@/lib/security";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

// POST /api/emails/new-post — Send notification to all subscribers about a new journal post
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const { postId, postTitle, postExcerpt, postSlug, dayNumber } = await request.json();

    if (!postTitle || !postSlug) {
      return NextResponse.json({ error: "Missing post details" }, { status: 400 });
    }

    // Deduplication — don't send twice for the same post
    const sentKey = `emails:newpost:${postId || postSlug}`;
    const alreadySent = await redis.get(sentKey);
    if (alreadySent) {
      return NextResponse.json({ success: true, skipped: true, reason: "Already sent for this post" });
    }

    // Mark as sending immediately to prevent duplicates
    await redis.set(sentKey, "sending", { ex: 86400 * 7 }); // 7-day TTL

    // Collect all email recipients (deduplicated)
    const recipients = new Map<string, { name: string; unsubscribeToken?: string }>();

    // 1. Pledgers with emailPreference "all"
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    for (const record of records) {
      if (!record.email) continue;
      if (record.emailPreference && record.emailPreference !== "all") continue;
      const email = record.email.toLowerCase().trim();
      recipients.set(email, {
        name: record.anonymous ? "Friend" : record.name,
        unsubscribeToken: record.unsubscribeToken,
      });
    }

    // 2. Waitlist subscribers
    const waitlistEmails = await redis.smembers("waitlist:emails");
    for (const wEmail of waitlistEmails || []) {
      const email = (wEmail as string).toLowerCase().trim();
      if (recipients.has(email)) continue;

      // Look up the waitlist-specific unsubscribe token so the footer link
      // lets them unsubscribe (GDPR / CAN-SPAM compliance).
      let unsubscribeToken: string | undefined;
      try {
        const meta = await redis.hgetall(`waitlist:meta:${email}`);
        const metaTyped = (meta || {}) as Record<string, string>;
        unsubscribeToken = metaTyped.unsubscribeToken || undefined;
      } catch {
        // Non-fatal — old waitlist entries may not have a token yet.
        // The unsubscribe page itself falls back to the "enter your email"
        // form when no token is present.
      }

      recipients.set(email, {
        name: "Friend",
        unsubscribeToken,
      });
    }

    // Calculate day number if not provided
    const hikeStart = await getSetting("hikeStartDate", "HIKE_START_DATE");
    const day = dayNumber || (hikeStart
      ? Math.max(1, Math.ceil((Date.now() - new Date(hikeStart).getTime()) / (1000 * 60 * 60 * 24)))
      : 1);

    // Send to all recipients
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [email, { name, unsubscribeToken }] of recipients) {
      const result = await sendNewPost(
        email,
        name,
        postTitle,
        postExcerpt || "",
        postSlug,
        day,
        unsubscribeToken
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
        if (errors.length < 5) errors.push(`${email}: ${result.error || "Unknown"}`);
      }

      // Rate limit: 1s delay every 10 emails
      if ((sent + failed) % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Update sent key with result
    await redis.set(sentKey, JSON.stringify({ sent, failed, timestamp: Date.now() }), { ex: 86400 * 30 });

    return NextResponse.json({
      success: true,
      sent,
      failed,
      totalRecipients: recipients.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("New post email failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
