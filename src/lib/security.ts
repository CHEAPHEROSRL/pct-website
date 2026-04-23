import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import crypto from "crypto";

/**
 * Constant-time string comparison for secrets.
 *
 * Plain `===` leaks timing info: the engine exits the comparison loop early
 * at the first mismatched byte, so over enough requests an attacker can
 * extract the secret byte-by-byte from response-time variance.
 *
 * We short-circuit on unequal length (the length of our secrets is already
 * public/fixed, so that's not a leak) and then use Node's crypto.timingSafeEqual
 * which compares every byte regardless of where mismatches occur.
 *
 * Safe when either side is undefined/null — returns false.
 */
export function constantTimeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// ---------------------------------------------------------------------------
// Rate Limiting (Upstash Redis-backed)
// ---------------------------------------------------------------------------

let _rateLimitRedis: Redis | null = null;
function getRateLimitRedis(): Redis | null {
  if (_rateLimitRedis) return _rateLimitRedis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _rateLimitRedis = new Redis({ url, token });
  return _rateLimitRedis;
}

// Pre-built rate limiters for different API tiers
const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, requests: number, window: string): Ratelimit | null {
  const redis = getRateLimitRedis();
  if (!redis) return null;

  const key = `${name}:${requests}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"s" | "m" | "h" | "d"}`),
        prefix: `ratelimit:${name}`,
      })
    );
  }
  return limiters.get(key)!;
}

/**
 * Get client IP from request headers (works behind Vercel/Cloudflare proxies)
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Apply rate limiting. Returns null if allowed, or a 429 response if blocked.
 */
export async function rateLimit(
  req: NextRequest,
  name: string,
  requests: number,
  window: string
): Promise<NextResponse | null> {
  const limiter = getLimiter(name, requests, window);
  if (!limiter) return null; // No Redis = allow (dev mode)

  const ip = getClientIp(req);
  const result = await limiter.limit(ip);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.reset / 1000 - Date.now() / 1000)),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }
  return null;
}

// Preset rate limit configurations
export const RATE_LIMITS = {
  /** Pledge creation: 5 per hour per IP */
  pledgeCreate: (req: NextRequest) => rateLimit(req, "pledge-create", 5, "1 h"),
  /** Pledge lookup: 20 per minute per IP */
  pledgeLookup: (req: NextRequest) => rateLimit(req, "pledge-lookup", 20, "1 m"),
  /** Pledge boost: 10 per hour per IP */
  pledgeBoost: (req: NextRequest) => rateLimit(req, "pledge-boost", 10, "1 h"),
  /** Honor actions: 10 per hour per IP */
  honorAction: (req: NextRequest) => rateLimit(req, "honor-action", 10, "1 h"),
  /** Unsubscribe token lookups: 10 per minute per IP */
  unsubscribe: (req: NextRequest) => rateLimit(req, "unsubscribe", 10, "1 m"),
  /** Support/gift checkout: 10 per hour per IP */
  support: (req: NextRequest) => rateLimit(req, "support", 10, "1 h"),
  /** General API: 60 per minute per IP */
  general: (req: NextRequest) => rateLimit(req, "general", 60, "1 m"),
  /** Challenge commit: 10 per hour per IP */
  challengeCommit: (req: NextRequest) => rateLimit(req, "challenge-commit", 10, "1 h"),
};

// ---------------------------------------------------------------------------
// Cloudflare Turnstile Verification
// ---------------------------------------------------------------------------

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if valid, false otherwise.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail-closed in production. A missing secret in prod means the captcha
    // is silently bypassed for every submission — that's how spam floods
    // happen. In dev we still allow through for local iteration.
    if (process.env.NODE_ENV === "production") {
      console.error("TURNSTILE_SECRET_KEY is not set in production — refusing to bypass CAPTCHA");
      return false;
    }
    console.warn("TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification (dev only)");
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Email Verification Tokens
// ---------------------------------------------------------------------------

/**
 * Generate a time-limited email verification token.
 * Stored in Redis with TTL.
 */
export async function generateEmailVerifyToken(
  redis: Redis,
  email: string,
  purpose: string,
  ttlSeconds: number = 3600 // 1 hour default
): Promise<string> {
  const token = crypto.randomBytes(24).toString("hex");
  const key = `verify:${purpose}:${token}`;
  await redis.set(key, email.toLowerCase().trim(), { ex: ttlSeconds });
  return token;
}

/**
 * Validate and consume an email verification token.
 * Returns the email if valid, null otherwise. Token is deleted after use.
 */
export async function consumeEmailVerifyToken(
  redis: Redis,
  token: string,
  purpose: string
): Promise<string | null> {
  const key = `verify:${purpose}:${token}`;
  const email = await redis.get<string>(key);
  if (!email) return null;
  await redis.del(key); // One-time use
  return email;
}

/**
 * Check (but don't consume) a verification token.
 */
export async function checkEmailVerifyToken(
  redis: Redis,
  token: string,
  purpose: string
): Promise<string | null> {
  const key = `verify:${purpose}:${token}`;
  return await redis.get<string>(key);
}

// ---------------------------------------------------------------------------
// Input Sanitization
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags and common XSS patterns from user input.
 * Also normalizes whitespace.
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Strip inline event handlers
    .replace(/data:/gi, "") // Strip data: protocol
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]*>/g, "") // Strip again after entity decode
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate and sanitize an email address.
 */
export function sanitizeEmail(input: string): string | null {
  const email = input.toLowerCase().trim();
  // Basic format check + length limit
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) return null;
  return email;
}

// ---------------------------------------------------------------------------
// Honeypot Validation
// ---------------------------------------------------------------------------

/**
 * Check honeypot field. If it's filled, the submission is from a bot.
 * Returns true if the request should be REJECTED (bot detected).
 */
export function isHoneypotFilled(value: unknown): boolean {
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
}

// ---------------------------------------------------------------------------
// CRON Auth (mandatory)
// ---------------------------------------------------------------------------

/**
 * Validate cron secret. Returns a 401 response if invalid, null if OK.
 * Unlike the old optional check, this REQUIRES CRON_SECRET to be set.
 */
export function requireCronAuth(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set!");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (!constantTimeEqual(authHeader, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // Auth passed
}

// ---------------------------------------------------------------------------
// Admin Auth Helpers
// ---------------------------------------------------------------------------

const ADMIN_COOKIE_NAME = "pct-admin-session";

/**
 * Generate a signed session token from the admin auth token.
 */
export function generateAdminSession(adminToken: string): string {
  const hmac = crypto.createHmac("sha256", adminToken);
  hmac.update(adminToken + ":" + Math.floor(Date.now() / (1000 * 60 * 60 * 24))); // Rotates daily
  return hmac.digest("hex");
}

/**
 * Validate admin auth from either cookie or bearer token (backwards compat).
 * Returns null if authorized, or a 401 response if not.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const adminToken = process.env.ADMIN_AUTH_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Check bearer token first (API calls)
  const authHeader = req.headers.get("authorization");
  if (constantTimeEqual(authHeader, `Bearer ${adminToken}`)) {
    return null; // Authorized
  }

  // Check session cookie
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionCookie && constantTimeEqual(sessionCookie, generateAdminSession(adminToken))) {
    return null; // Authorized
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// ---------------------------------------------------------------------------
// Audit Logging
// ---------------------------------------------------------------------------

/**
 * Log an admin action to Redis for audit trail.
 */
export async function auditLog(
  redis: Redis,
  action: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const entry = {
      action,
      ...details,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };
    await redis.lpush("audit:log", JSON.stringify(entry));
    // Keep last 1000 entries
    await redis.ltrim("audit:log", 0, 999);
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
