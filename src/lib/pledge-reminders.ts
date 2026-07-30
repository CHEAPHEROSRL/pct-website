import { Redis } from "@upstash/redis";
import { generateEmailVerifyToken } from "./security";
import { PENDING_TTL_SECONDS, VERIFY_TOKEN_TTL_SECONDS } from "./pledge-store";

/**
 * Confirmation reminders for pledges that were started but never finished.
 *
 * Paul: "Can we please set up email reminders that keep going until they
 * confirm?" — after his friend Karina worked out independently that the
 * missing pledgers simply hadn't clicked the confirmation link.
 *
 * "Keep going until they confirm" with no ceiling would be a spam machine:
 * it wrecks sender reputation for everyone, including the pledgers who DID
 * confirm and still want Paul's updates, and it's unkind to someone who has
 * quietly decided not to pledge after all. So reminders taper and then stop,
 * with the leftovers surfaced in the admin Pledgers tab for a personal nudge
 * from Paul, which will convert better than a fifth automated email anyway.
 *
 * Gaps are measured from the last email we sent them, so a manual resend from
 * the admin also pushes the next automated reminder back — Paul chasing
 * someone by hand can't collide with the cron chasing them too.
 */

/** Days to wait after the previous email before sending reminder N+1. */
export const REMINDER_GAP_DAYS = [1, 2, 4, 7];

/** Hard ceiling. After this many reminders we stop and leave it to Paul. */
export const MAX_REMINDERS = REMINDER_GAP_DAYS.length;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Is this pledger due a reminder right now?
 *
 * `lastSentAt` covers the original verification email and every later resend,
 * so the first reminder lands one day after they submitted the form rather
 * than one day after some other clock.
 */
export function isReminderDue(
  entry: { lastSentAt: number; reminderCount?: number },
  now: number = Date.now()
): boolean {
  const sent = entry.reminderCount ?? 0;
  if (sent >= MAX_REMINDERS) return false;
  const gapDays = REMINDER_GAP_DAYS[sent];
  return now - entry.lastSentAt >= gapDays * DAY_MS;
}

/**
 * Mint a fresh confirmation link for a pending pledge.
 *
 * Returns null when the pending record has expired — there's genuinely nothing
 * left to confirm, and we refuse to invent an amount and interval we no longer
 * hold. Callers should surface that rather than pretending a link was sent.
 *
 * Refreshes the pending record's TTL first so the link can never outlive the
 * pledge it points at. That also means the window rolls forward while we're
 * actively reminding, instead of the record expiring mid-sequence.
 */
export async function issueFreshVerifyUrl(
  redis: Redis,
  pledgeId: string
): Promise<string | null> {
  const pendingKey = `pending:${pledgeId}`;
  const pending = await redis.get<string>(pendingKey);
  if (!pending) return null;

  await redis.expire(pendingKey, PENDING_TTL_SECONDS);
  const token = await generateEmailVerifyToken(
    redis,
    pendingKey,
    "pledge",
    VERIFY_TOKEN_TTL_SECONDS
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
  return `${siteUrl}/api/pledges/verify?token=${token}`;
}
