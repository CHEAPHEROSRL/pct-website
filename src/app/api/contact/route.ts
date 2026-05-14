import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sendContactNotification } from "@/lib/email";
import {
  RATE_LIMITS,
  verifyTurnstile,
  sanitizeText,
  sanitizeEmail,
  isHoneypotFilled,
  getClientIp,
} from "@/lib/security";
import crypto from "crypto";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// POST /api/contact — public, sends a message to Paul.
//
// Stacked defences (same pattern as the pledge form):
//   1. Rate limit per IP   — RATE_LIMITS.general (60/min)
//   2. Honeypot field      — silent-accept if filled (bot doesn't know it lost)
//   3. Turnstile           — fail-closed in prod when configured
//   4. Server-side sanitize — sanitizeText / sanitizeEmail
//   5. Length caps         — enforced after sanitize, not just on the client
//
// On Gmail dispatch failure (token expired etc.) we fall back to a Redis
// queue so the message isn't lost. The queue auto-expires in 7 days; if it
// ever starts filling up regularly that's our signal to surface it in admin.
export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const { name: rawName, email: rawEmail, subject: rawSubject, message: rawMessage, turnstileToken, website } = body;

    // Honeypot — return success but don't process. Bot has no signal we caught it.
    if (isHoneypotFilled(website)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Turnstile CAPTCHA verification
    const ip = getClientIp(req);
    if (!await verifyTurnstile(turnstileToken || "", ip)) {
      return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    const email = sanitizeEmail(rawEmail || "");
    if (!email) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const name = sanitizeText(rawName || "", 100);
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const subject = sanitizeText(rawSubject || "", 120);
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    // Message: 2000 char cap matching the form's client-side counter. Anything
    // longer is almost certainly accidental copy-paste or spam.
    const message = sanitizeText(rawMessage || "", 2000);
    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    const result = await sendContactNotification(name, email, subject, message);

    if (!result.success) {
      // Gmail dispatch failed (token expired, API outage, etc.). Park the
      // message in Redis so Paul can recover it once the email side is back.
      // 7-day TTL is enough for Paul to spot the issue and re-send.
      const redis = getRedis();
      if (redis) {
        const id = crypto.randomBytes(8).toString("hex");
        await redis.set(
          `contact:queue:${id}`,
          JSON.stringify({
            id,
            name,
            email,
            subject,
            message,
            attemptedAt: Date.now(),
            sendError: result.error || "unknown",
          }),
          { ex: 60 * 60 * 24 * 7 }
        );
      }
      // Return user-friendly error — they retried already if it was their fault.
      return NextResponse.json(
        { error: "We couldn't deliver your message right now, but we've saved it. Try again in a few minutes, or email paul@yeschapter.com directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
