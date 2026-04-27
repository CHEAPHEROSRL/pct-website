import { Redis } from "@upstash/redis";
import crypto from "crypto";
import type { AuthSession } from "./types";

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days in seconds
const MAGIC_TTL = 60 * 15; // 15 minutes in seconds
const SESSION_COOKIE = "pct-session";

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL!;
  const token = process.env.KV_REST_API_TOKEN!;
  _redis = new Redis({ url, token });
  return _redis;
}

// ---------------------------------------------------------------------------
// Magic token
// ---------------------------------------------------------------------------

/**
 * Generate a magic link token for the given email.
 * Stores email → token mapping in Redis with 15-min TTL.
 * Returns the token (to be embedded in the magic link URL).
 */
export async function generateMagicToken(email: string): Promise<string> {
  const redis = getRedis();
  const token = crypto.randomBytes(32).toString("hex");
  await redis.set(`auth:magic:${token}`, email.toLowerCase().trim(), {
    ex: MAGIC_TTL,
  });
  return token;
}

/**
 * Consume a magic token. Returns the email if valid, null if expired/used.
 * One-time use — deletes the token from Redis.
 *
 * Uses atomic GETDEL so two concurrent consumes can't both succeed (e.g.
 * if a user double-clicks the "Sign In" button before the first request
 * completes). Previously this was a separate GET + DEL with a race
 * window between them.
 */
export async function consumeMagicToken(token: string): Promise<string | null> {
  const redis = getRedis();
  const key = `auth:magic:${token}`;
  const email = await redis.getdel<string>(key);
  return email ?? null;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * Create a new session for the given email, looked up from Redis pledge data.
 * Returns the session object (sessionId included).
 */
export async function createSession(email: string): Promise<AuthSession> {
  const redis = getRedis();
  const sessionId = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  // Look up pledge record to get name and pledgeId
  let name = "";
  let pledgeId: string | null = null;

  try {
    const pledgeKey = `pledge:email:${email}`;
    const id = await redis.get<string>(pledgeKey);
    if (id) {
      pledgeId = id;
      const record = await redis.get<{ name?: string }>(`pledge:${id}`);
      if (record?.name) name = record.name;
    }
  } catch {
    // Non-fatal — session still created
  }

  const session: AuthSession = {
    sessionId,
    email,
    name,
    pledgeId,
    createdAt: now,
    expiresAt: now + SESSION_TTL * 1000,
  };

  await redis.set(`auth:session:${sessionId}`, JSON.stringify(session), {
    ex: SESSION_TTL,
  });

  return session;
}

/**
 * Get an active session by sessionId. Returns null if not found / expired.
 */
export async function getSession(sessionId: string): Promise<AuthSession | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`auth:session:${sessionId}`);
  if (!raw) return null;
  try {
    const session: AuthSession = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Date.now() > session.expiresAt) {
      await redis.del(`auth:session:${sessionId}`);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Delete a session (logout).
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`auth:session:${sessionId}`);
}

// ---------------------------------------------------------------------------
// Cookie helpers (for API routes — Next.js server-side only)
// ---------------------------------------------------------------------------

export { SESSION_COOKIE };

export function sessionCookieOptions(maxAge: number = SESSION_TTL) {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // `lax` is deliberate here, not a mistake. Pledgers authenticate via
    // magic links clicked from their email inbox — a cross-site top-level
    // navigation. `strict` would cause the browser to drop the newly-set
    // cookie on the verify-endpoint's redirect to /my-pledge, leaving the
    // user in a "not logged in" state immediately after logging in.
    // `lax` still blocks cookies on cross-site POST/PUT/DELETE, which is
    // where the real CSRF risk would be. Admin session uses `strict`
    // because it has no cross-site-navigation flow.
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
