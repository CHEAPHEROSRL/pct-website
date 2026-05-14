import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";
import {
  RATE_LIMITS,
  verifyTurnstile,
  sanitizeText,
  sanitizeEmail,
  isHoneypotFilled,
  getClientIp,
} from "@/lib/security";
import { createMessage, updateMessage } from "@/lib/contact-messages";
import type { ContactMessage } from "@/lib/types";
import crypto from "crypto";

// POST /api/contact — public, sends a message to Paul.
//
// Stacked defences (same pattern as the pledge form):
//   1. Rate limit per IP   — RATE_LIMITS.general (60/min)
//   2. Honeypot field      — silent-accept if filled (bot doesn't know it lost)
//   3. Turnstile           — fail-closed in prod when configured
//   4. Server-side sanitize — sanitizeText / sanitizeEmail
//   5. Length caps         — enforced after sanitize, not just on the client
//
// Every valid submission is persisted to Redis (90-day TTL) so it shows up
// in the admin Contact tab regardless of whether the Gmail dispatch
// succeeded. The notification email goes to paul@yeschapter.com with
// Reply-To set to the submitter — so Paul replies via Gmail and the
// admin tab is just for tracking / audit / "mark as replied".
export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const { name: rawName, email: rawEmail, subject: rawSubject, message: rawMessage, turnstileToken, website } = body;

    // Honeypot — return success but don't process. Bot has no signal we caught it.
    // We also DO NOT persist or send anything for honeypot submissions; the goal
    // is to silently swallow them.
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

    const message = sanitizeText(rawMessage || "", 2000);
    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    // Generate ID first so it can flow into the email link AND the storage
    // key. ID is short (16 hex chars) — Redis-key-safe, URL-safe.
    const id = crypto.randomBytes(8).toString("hex");

    // Optimistically persist as "sent" before dispatching. If the email
    // dispatch fails below we'll patch the record to "failed". This ordering
    // ensures the admin always sees every submission, even ones that died
    // mid-dispatch — Paul can then follow up manually.
    const record: ContactMessage = {
      id,
      name,
      email,
      subject,
      message,
      createdAt: Date.now(),
      deliveryStatus: "sent",
    };
    try {
      await createMessage(record);
    } catch (err) {
      // Storage failure is rare but possible (Redis down). Don't block the
      // user — try to send the email anyway. If THAT also fails, surface
      // the original error to the user; otherwise they get a successful
      // submit and we just lose the audit record.
      console.error("Contact message store failed:", err);
    }

    const result = await sendContactNotification(name, email, subject, message, id);

    if (!result.success) {
      // Patch the persisted record so the admin tab shows this as failed.
      // If the original store also failed, this no-ops cleanly.
      await updateMessage(id, {
        deliveryStatus: "failed",
        sendError: result.error || "unknown",
      }).catch(() => {});
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
