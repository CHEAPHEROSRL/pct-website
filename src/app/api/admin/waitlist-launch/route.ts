import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  bulkEmailsEnabled,
  sendWaitlistLaunchA,
  sendWaitlistLaunchB,
  sendWaitlistLaunchC,
} from "@/lib/email";
import { requireAdminAuth } from "@/lib/security";

/**
 * POST /api/admin/waitlist-launch
 *
 * One-shot blast: sends the chosen launch-invite variant (A, B, or C) to
 * every email in `waitlist:emails`. Guards (in order):
 *
 *   1. Admin auth (Bearer or cookie).
 *   2. `EMAILS_ENABLED=true` kill-switch — same gate as every other bulk
 *      blast (`/api/emails/new-post`, weekly cron, etc.).
 *   3. Redis lock `waitlist:launch:sent` — locks ALL THREE variants once
 *      ANY of them has been sent. Choosing variant ≠ doing variant; the
 *      lock is shared because conceptually this email is "the launch
 *      announcement," not "an A/B test."
 *
 * Lock payload (JSON):
 *   { sending: true } while in flight,
 *   { variant, sent, failed, sentAt } after completion.
 *
 * GET /api/admin/waitlist-launch returns the current lock state + the
 * current waitlist recipient count so the admin UI can show "Already sent
 * to N at <date>" or "Ready to send to N recipients."
 *
 * Rate-limiting: same pattern as new-post — 1s pause every 10 sends so
 * Gmail's per-second send quota (~100/s) is never threatened.
 */

export const maxDuration = 60;

const LOCK_KEY = "waitlist:launch:sent";
const WAITLIST_SET = "waitlist:emails";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

interface LockPayload {
  sending?: boolean;
  variant?: "A" | "B" | "C";
  sent?: number;
  failed?: number;
  sentAt?: number;
  totalRecipients?: number;
}

async function readLock(redis: Redis): Promise<LockPayload | null> {
  const raw = await redis.get<string | LockPayload>(LOCK_KEY);
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as LockPayload;
    } catch {
      // Legacy / non-JSON values — treat as "locked, unknown details"
      return { sending: false };
    }
  }
  return raw as LockPayload;
}

async function getWaitlistEmails(redis: Redis): Promise<string[]> {
  const raw = await redis.smembers(WAITLIST_SET);
  return (raw || [])
    .map((e) => (e as string).toLowerCase().trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const [lock, emails] = await Promise.all([
    readLock(redis),
    getWaitlistEmails(redis),
  ]);

  return NextResponse.json({
    recipientCount: emails.length,
    bulkEmailsEnabled: bulkEmailsEnabled(),
    lock,
  });
}

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  if (!bulkEmailsEnabled()) {
    return NextResponse.json(
      {
        error:
          "Bulk emails are paused. Set EMAILS_ENABLED=true in Vercel env and redeploy to enable.",
        skipped: true,
      },
      { status: 503 }
    );
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  let body: { variant?: string; confirm?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const variant = body.variant;
  if (variant !== "A" && variant !== "B" && variant !== "C") {
    return NextResponse.json(
      { error: "Missing or invalid variant. Use 'A', 'B', or 'C'." },
      { status: 400 }
    );
  }

  // Confirmation phrase — caller MUST send `confirm: "SEND"` to avoid
  // accidental triggers (e.g. someone curl-ing the endpoint without realising
  // it actually mails the entire waitlist).
  if (body.confirm !== "SEND") {
    return NextResponse.json(
      { error: "Confirmation missing. Include { confirm: \"SEND\" } in the body." },
      { status: 400 }
    );
  }

  // One-shot lock check. Any non-null lock = already used (sending or done).
  const existingLock = await readLock(redis);
  if (existingLock) {
    return NextResponse.json(
      {
        error: existingLock.sending
          ? "A launch blast is currently in flight. Wait for it to finish."
          : `Launch blast has already been sent (variant ${existingLock.variant ?? "?"}, ${existingLock.sent ?? "?"} recipients).`,
        lock: existingLock,
      },
      { status: 409 }
    );
  }

  const emails = await getWaitlistEmails(redis);
  if (emails.length === 0) {
    return NextResponse.json(
      { error: "No waitlist subscribers to send to." },
      { status: 400 }
    );
  }

  // Acquire the lock IMMEDIATELY. Any concurrent POST will hit the 409 above.
  await redis.set(
    LOCK_KEY,
    JSON.stringify({ sending: true, variant, totalRecipients: emails.length } as LockPayload)
  );

  const sender =
    variant === "A"
      ? sendWaitlistLaunchA
      : variant === "B"
      ? sendWaitlistLaunchB
      : sendWaitlistLaunchC;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    // Per-recipient unsubscribe token lookup (footer link). Non-fatal if
    // missing — the unsubscribe page falls back to an email-entry form.
    let unsubscribeToken: string | undefined;
    try {
      const meta = await redis.hgetall(`waitlist:meta:${email}`);
      const metaTyped = (meta || {}) as Record<string, string>;
      unsubscribeToken = metaTyped.unsubscribeToken || undefined;
    } catch {
      unsubscribeToken = undefined;
    }

    const result = await sender(email, unsubscribeToken);
    if (result.success) {
      sent++;
    } else {
      failed++;
      if (errors.length < 5) {
        errors.push(`${email}: ${result.error ?? "unknown"}`);
      }
    }

    // 1s pause every 10 sends — keeps us well under Gmail's per-second quota.
    if ((sent + failed) % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Finalize the lock with the result. NO TTL — the lock is permanent
  // (this email is meant to go out exactly once in the project's lifetime).
  const finalLock: LockPayload = {
    variant,
    sent,
    failed,
    totalRecipients: emails.length,
    sentAt: Date.now(),
  };
  await redis.set(LOCK_KEY, JSON.stringify(finalLock));

  return NextResponse.json({
    success: true,
    sent,
    failed,
    totalRecipients: emails.length,
    variant,
    errors: errors.length > 0 ? errors : undefined,
  });
}
