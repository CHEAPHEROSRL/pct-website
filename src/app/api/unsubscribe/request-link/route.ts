import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/security";
import type { PledgeRecord } from "@/lib/types";

/**
 * POST /api/unsubscribe/request-link
 *
 * Fallback path for when a user lands on /unsubscribe WITHOUT a token
 * (e.g. they typed the URL manually, their email client stripped query
 * params, or they're a waitlist subscriber whose email went out before
 * tokens existed).
 *
 * Body: { email: string }
 *
 * Behaviour:
 *   1. If the email belongs to a pledger AND has a stored unsubscribeToken,
 *      send an email with the proper unsubscribe link.
 *   2. If the email belongs to a waitlist subscriber AND has a stored
 *      waitlist unsubscribe token, send an email with the link.
 *   3. If the email has NO stored token (legacy waitlist entry pre-token),
 *      generate one on the fly, persist it, then send the link.
 *   4. If the email is in neither system — we STILL return { ok: true }
 *      without sending. This is deliberate: it prevents an attacker from
 *      using this endpoint to enumerate which emails are subscribed.
 *
 * Rate limited to prevent email bombing.
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function hashEmail(email: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto
    .createHash("sha256")
    .update(email.toLowerCase().trim())
    .digest("hex")
    .slice(0, 16);
}

export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.unsubscribe(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body.email || "").trim().toLowerCase();
  if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Always return the same "ok" response shape regardless of whether the
  // email exists in our system — prevents subscriber-list enumeration.
  const genericOk = NextResponse.json({
    ok: true,
    message:
      "If an account exists for that email, we've sent a manage-subscription link to it. Check your inbox (and spam folder).",
  });

  try {
    // 1. Check pledger system first
    const pledgerHash = await hashEmail(raw);
    const pledgerRaw = await redis.get<string>(`pledger:${pledgerHash}`);
    if (pledgerRaw) {
      const record: PledgeRecord =
        typeof pledgerRaw === "string" ? JSON.parse(pledgerRaw) : pledgerRaw;
      if (record.unsubscribeToken) {
        await sendRecoveryLink(
          raw,
          record.anonymous ? "Pledger" : record.name,
          record.unsubscribeToken
        );
        return genericOk;
      }
    }

    // 2. Check waitlist system
    const isInWaitlist = await redis.sismember("waitlist:emails", raw);
    const meta = await redis.hgetall(`waitlist:meta:${raw}`);
    const metaTyped = (meta || {}) as Record<string, string>;

    if (isInWaitlist || metaTyped.email) {
      let token = metaTyped.unsubscribeToken;
      if (!token) {
        // Legacy waitlist entry — generate a token on the fly
        const { randomBytes } = await import("crypto");
        token = randomBytes(24).toString("hex");
        await redis.set(`waitlist:token:${token}`, raw);
        await redis.hset(`waitlist:meta:${raw}`, {
          email: raw,
          unsubscribeToken: token,
          signedUpAt: metaTyped.signedUpAt || new Date().toISOString(),
        });
      }
      await sendRecoveryLink(raw, "Friend", token);
      return genericOk;
    }

    // 3. Not in any system — return generic OK (anti-enumeration)
    return genericOk;
  } catch (err) {
    console.error("request-link failed:", err);
    // Still return generic OK to keep the contract consistent —
    // we don't want to leak "this email exists" via error responses.
    return genericOk;
  }
}

/**
 * Send the recovery email with the unsubscribe link.
 * Keeps it minimal — HTML inline, no header images.
 */
async function sendRecoveryLink(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
  const unsubUrl = `${site}/unsubscribe?token=${token}`;

  const subject = "Manage your YesChapter email subscription";
  const html = `
    <div style="max-width: 560px; margin: 0 auto; font-family: Georgia, serif; color: #1C1C1C;">
      <div style="background: #1C1F1A; padding: 20px 32px;">
        <p style="margin: 0; font-size: 14px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">YESCHAPTER</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 22px;">Hi ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #5C5C5C;">
          You asked to manage your YesChapter email subscription. Click the link below to update your preferences or unsubscribe.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${unsubUrl}" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 2px;">MANAGE SUBSCRIPTION &rarr;</a>
        </div>
        <p style="font-size: 12px; color: #8C8A87; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #D9D7D4; padding-top: 16px;">
          If you didn&apos;t request this, you can safely ignore this email. This link is specific to your subscription.
        </p>
        <p style="font-size: 11px; color: #8C8A87; margin: 8px 0 0; word-break: break-all;">
          Or copy this URL: <span style="color: #3D7A5A;">${unsubUrl}</span>
        </p>
      </div>
      <div style="background: #1C1F1A; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #FFFFFF44;">
          <a href="${site}" style="color: #FFFFFF66; text-decoration: none;">yeschapter.com</a>
        </p>
      </div>
    </div>
  `;

  // Import inline to avoid circular deps at module load
  const { google } = await import("googleapis");
  const { getSetting } = await import("@/lib/settings");

  const clientId =
    process.env.GMAIL_CLIENT_ID ||
    (await getSetting("gmailClientId", "GMAIL_CLIENT_ID"));
  const clientSecret =
    process.env.GMAIL_CLIENT_SECRET ||
    (await getSetting("gmailClientSecret", "GMAIL_CLIENT_SECRET"));
  const refreshToken =
    process.env.GMAIL_REFRESH_TOKEN ||
    (await getSetting("gmailRefreshToken", "GMAIL_REFRESH_TOKEN"));

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("Gmail not configured — recovery link email skipped");
    return;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const from =
    process.env.EMAIL_FROM ||
    (await getSetting("emailFrom", "EMAIL_FROM")) ||
    "YesChapter <paul@yeschapter.com>";

  const message = [
    `To: ${email}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  const rawMsg = Buffer.from(message).toString("base64url");
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMsg },
  });
}
