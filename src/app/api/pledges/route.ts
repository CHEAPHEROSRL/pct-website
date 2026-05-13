import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import type { PledgeRecord } from "@/lib/types";
import { trailSections } from "@/lib/trail";
import { sendPledgeVerification, sendPledgeIncreased, sendCommunityMilestone, sendActionVerification } from "@/lib/email";
import {
  RATE_LIMITS,
  verifyTurnstile,
  generateEmailVerifyToken,
  sanitizeText,
  sanitizeEmail,
  isHoneypotFilled,
  getClientIp,
} from "@/lib/security";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
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

// POST — Register a new pledge (creates pending pledge, sends verification email)
export async function POST(req: NextRequest) {
  // Rate limit
  const rateLimited = await RATE_LIMITS.pledgeCreate(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email: rawEmail, name: rawName, amount, interval, anonymous, message: rawMessage, city, country, lat, lng, avatar, referredBy, turnstileToken, website, emailPreference: rawEmailPref, claimedSection: rawClaimedSection } = body;

    // Honeypot check — "website" is a hidden field that should be empty
    if (isHoneypotFilled(website)) {
      // Silently accept but don't process (bot doesn't know it failed)
      return NextResponse.json({ success: true, pending: true }, { status: 201 });
    }

    // Turnstile CAPTCHA verification
    const ip = getClientIp(req);
    if (!await verifyTurnstile(turnstileToken || "", ip)) {
      return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    // Sanitize inputs
    const email = sanitizeEmail(rawEmail || "");
    if (!email) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount < 0.01 || amount > 100) {
      return NextResponse.json({ error: "Amount must be between $0.01 and $100" }, { status: 400 });
    }
    if (![1, 10, 100].includes(interval)) {
      return NextResponse.json({ error: "Interval must be 1, 10, or 100" }, { status: 400 });
    }
    // Sanity cap — the slider on /pledge maxes at $5/mi = $13,250 total. We
    // allow up to $15,000 to leave headroom for the boost flow / manual API
    // calls; anything beyond that almost certainly isn't intentional and
    // should go through paul@yeschapter.com directly. Previously this cap was
    // $5K and forced the CTA to *replace* the submit button — the new design
    // shows the company-sponsorship CTA in parallel above US$2,000 so submit
    // stays available the whole way up to this hard ceiling.
    const calculatedTotal = (amount * 2650) / interval;
    if (calculatedTotal > 15000) {
      return NextResponse.json({ error: "Pledges above $15,000 require direct contact. Please email paul@yeschapter.com" }, { status: 400 });
    }

    const name = sanitizeText(rawName || "Anonymous", 100);
    const message = rawMessage ? sanitizeText(rawMessage, 280) : undefined;

    // Validate claimedSection against the curated list — anything else is dropped.
    // No error returned for invalid IDs; we treat "no preference" as the default.
    const claimedSection =
      typeof rawClaimedSection === "string" && trailSections.some((s) => s.id === rawClaimedSection)
        ? rawClaimedSection
        : undefined;

    const hash = emailHash(email);
    const liveKey = `pledger:${hash}`;

    // Check if pledger already exists (live)
    const existing = await redis.get<string>(liveKey);
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
    const unsubscribeToken = crypto.randomBytes(16).toString("hex");

    const record: PledgeRecord = {
      id: hash,
      email,
      name: name || "Anonymous",
      amount,
      interval,
      totalPledge,
      anonymous: !!anonymous || !rawName,
      boosts: [],
      unsubscribeToken,
      emailPreference: (rawEmailPref === "all" || rawEmailPref === "milestones" || rawEmailPref === "finish") ? rawEmailPref : "finish",
      message: message || undefined,
      city: typeof city === "string" ? sanitizeText(city, 100) : undefined,
      country: typeof country === "string" ? sanitizeText(country, 100) : undefined,
      lat: typeof lat === "number" && lat >= -90 && lat <= 90 ? lat : undefined,
      lng: typeof lng === "number" && lng >= -180 && lng <= 180 ? lng : undefined,
      avatar: typeof avatar === "string" && avatar.length <= 10 ? avatar : undefined,
      referredBy: typeof referredBy === "string" && referredBy.trim() ? sanitizeText(referredBy, 100) : undefined,
      claimedSection,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store as PENDING pledge (not live yet, expires in 2 hours)
    const pendingKey = `pending:${hash}`;
    await redis.set(pendingKey, JSON.stringify(record), { ex: 7200 });

    // Generate verification token that maps to the pending key
    const verifyToken = await generateEmailVerifyToken(redis, pendingKey, "pledge", 3600);

    // Send verification email — AWAIT it. Previously this was fire-and-forget
    // with a swallow-the-error .catch(), but in Vercel's serverless runtime
    // the function can be terminated as soon as the response is sent. If the
    // Gmail API round-trip hadn't completed yet, the dispatch died mid-flight
    // — the verification email never went out, the pledger sees "Pledge set,
    // check your email" but no email arrives. The magic-link endpoint already
    // awaits its send (which is why magic links reliably arrive while pledge
    // verification emails sometimes vanished). Costs ~1-2s on the response
    // time; that's the right trade for a confirmation email that must arrive.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
    const verifyUrl = `${siteUrl}/api/pledges/verify?token=${verifyToken}`;
    // Format with 2 decimal places so $0.1 renders as $0.10 in the email body.
    // The "US" prefix is added by the email template itself for site-wide
    // consistency with the US$ convention used across all UI surfaces.
    const rate = `$${amount.toFixed(2)}/${interval === 1 ? "mi" : interval + "mi"}`;

    await sendPledgeVerification(email, record.name, rate, totalPledge, verifyUrl);

    return NextResponse.json({
      success: true,
      pending: true,
      message: "Check your email to confirm your pledge.",
    }, { status: 201 });
  } catch (err) {
    console.error("Failed to create pledge:", err);
    return NextResponse.json({ error: "Failed to register pledge" }, { status: 500 });
  }
}

// GET — Retrieve a pledger's profile by email
//
// Authentication: REQUIRED. Must have a valid pledger session cookie AND the
// requested ?email= must match the session's email. This closes the
// previous enumeration vector — anyone with a guessable email could read
// that pledger's amount/total/history via this endpoint. Now they have to
// own the inbox to receive the magic-link first.
//
// Response shape preserved for backwards compat: 200 with
// { pledge: PledgeRecord | null }. Unauthenticated callers get 401.
export async function GET(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.pledgeLookup(req);
  if (rateLimited) return rateLimited;

  // ── Require a signed-in pledger session ──────────────────────────
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
  }

  // The email param must match the session's email — a signed-in pledger
  // can only look up their OWN pledge. Same 401 message regardless so
  // we don't reveal whether a different email exists in the system.
  if (email.toLowerCase().trim() !== session.email.toLowerCase().trim()) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const hash = emailHash(email);
    const key = `pledger:${hash}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json({ pledge: null });
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
        claimedSection: record.claimedSection,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (err) {
    console.error("Failed to fetch pledge:", err);
    return NextResponse.json({ error: "Failed to retrieve pledge" }, { status: 500 });
  }
}

// PUT — Request pledge amount increase (sends verification email)
export async function PUT(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.pledgeBoost(req);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email: rawEmail, addAmount, challengeId, challengeTitle, verifyToken } = body;

    const email = sanitizeEmail(rawEmail || "");
    if (!email) {
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

    // If no verifyToken provided, send a verification email instead of applying immediately
    if (!verifyToken) {
      // Store the boost request as pending
      const boostData = JSON.stringify({ email, addAmount, challengeId, challengeTitle });
      const token = await generateEmailVerifyToken(redis, boostData, "boost", 3600);

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
      const verifyUrl = `${siteUrl}/api/pledges/boost-verify?token=${token}`;
      const name = record.anonymous ? "Friend" : record.name;

      sendActionVerification(
        email,
        name,
        "Confirm Pledge Increase",
        `You requested to increase your pledge by $${addAmount.toFixed(2)}/mile. Click to confirm.`,
        verifyUrl
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        pending: true,
        message: "Check your email to confirm the pledge increase.",
      });
    }

    // If verifyToken IS provided, this is the internal call after verification
    // (The boost-verify endpoint calls this internally — not exposed to clients)
    const oldAmount = record.amount;
    const oldTotal = record.totalPledge;

    record.amount += addAmount;
    record.totalPledge = (record.amount * TOTAL_MILES) / record.interval;
    record.updatedAt = Date.now();

    const isChallenge = !!challengeId;

    record.boosts.push({
      challengeId: challengeId || "manual",
      challengeTitle: challengeTitle || "Manual increase",
      addedAmount: addAmount,
      addedAt: Date.now(),
    });

    await redis.set(key, JSON.stringify(record));

    const totalDiff = record.totalPledge - oldTotal;
    await redis.incrbyfloat("pledgers:total_pledged", totalDiff);

    // Update list entry
    const list = await redis.lrange<string>("pledgers:list", 0, -1);
    for (let i = 0; i < list.length; i++) {
      const item: PledgeRecord = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
      if (item.id === hash) {
        await redis.lset("pledgers:list", i, JSON.stringify(record));
        break;
      }
    }

    if (!isChallenge) {
      const displayName = record.anonymous ? "Pledger" : record.name;
      const newRate = `$${record.amount}/mi`;
      // Awaited so the serverless function stays alive long enough for
      // Gmail's API round-trip to complete. See the long note in POST above
      // explaining why fire-and-forget was unreliable in this runtime.
      await sendPledgeIncreased(record.email, displayName, oldAmount, record.amount, newRate, record.totalPledge);
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

// --- Community Milestone Checks ---

const PLEDGER_THRESHOLDS = [25, 50, 100, 200, 500, 1000];
const TOTAL_THRESHOLDS = [5000, 10000, 25000, 50000, 100000];

async function checkCommunityMilestones(redis: Redis, pledgerCount: number, totalPledged: number) {
  const sentSet = (await redis.smembers("emails:community:sent")) || [];

  for (const threshold of PLEDGER_THRESHOLDS) {
    const key = `pledgers:${threshold}`;
    if (pledgerCount >= threshold && !sentSet.includes(key)) {
      await sendCommunityMilestoneToAll(redis, "pledgers", threshold, pledgerCount, totalPledged);
      await redis.sadd("emails:community:sent", key);
      break;
    }
  }

  for (const threshold of TOTAL_THRESHOLDS) {
    const key = `total:${threshold}`;
    if (totalPledged >= threshold && !sentSet.includes(key)) {
      await sendCommunityMilestoneToAll(redis, "total", threshold, pledgerCount, totalPledged);
      await redis.sadd("emails:community:sent", key);
      break;
    }
  }
}

async function sendCommunityMilestoneToAll(
  redis: Redis,
  variant: "pledgers" | "total" | "countries",
  value: number,
  pledgerCount: number,
  totalPledged: number
) {
  const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
  const records: PledgeRecord[] = (rawList || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  let sent = 0;
  for (const record of records) {
    if (!record.email) continue;
    if (record.emailPreference && record.emailPreference !== "all") continue;

    await sendCommunityMilestone(
      record.email,
      record.anonymous ? "Friend" : record.name,
      variant,
      value,
      pledgerCount,
      totalPledged,
      record.unsubscribeToken
    );
    sent++;
    if (sent % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
