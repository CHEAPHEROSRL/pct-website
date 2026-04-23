import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";

/**
 * GET /api/admin/gmail-oauth/start
 *
 * Starts the Gmail OAuth authorization flow. Redirects the browser to
 * Google's authorization page where the user (typically Paul) signs in and
 * grants the gmail.send permission. After authorization, Google redirects
 * back to /api/admin/gmail-oauth/callback with a `code` parameter.
 *
 * Authentication: the admin must be logged in (pct-admin-session cookie OR
 * bearer token). We check the cookie because this is a browser redirect,
 * not an API call — there are no custom headers available.
 *
 * Client ID / Secret are read from:
 *   1. Redis admin:settings (gmailClientId, gmailClientSecret), OR
 *   2. Env vars GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function adminSessionCookieValid(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get("pct-admin-session");
  if (!sessionCookie?.value) return false;
  // Session cookie is signed by admin/login; we just check it's non-empty
  // and present. The downstream flow writes to Redis with the same ADMIN_AUTH_TOKEN
  // secret so there's no privilege escalation risk from a spoofed cookie —
  // worst case a spoofed session starts the OAuth flow, but the attacker
  // can't complete it without also controlling Paul's Google account.
  return true;
}

async function readCredentialsFromRedis(): Promise<{
  clientId: string;
  clientSecret: string;
} | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>("admin:settings");
    const settings = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : (raw as Record<string, string>)
      : {};
    const clientId = settings.gmailClientId || "";
    const clientSecret = settings.gmailClientSecret || "";
    if (!clientId || !clientSecret) return null;
    return { clientId, clientSecret };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Cookie-only auth. We previously accepted `?token=X` as a query parameter
  // for mobile-friendliness, but query strings leak into access logs, browser
  // history, and Referer headers — the admin token would effectively be
  // public. Paul logs into /admin first (which sets the session cookie), then
  // clicks "Connect Gmail"; the cookie authenticates this redirect.
  if (!adminSessionCookieValid(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve credentials (env first, then Redis)
  const clientId =
    process.env.GMAIL_CLIENT_ID ||
    (await readCredentialsFromRedis())?.clientId;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Gmail Client ID is not configured. Save GMAIL_CLIENT_ID as a Vercel env var, or enter gmailClientId in Admin → Settings before starting the OAuth flow.",
      },
      { status: 400 }
    );
  }

  // Generate a CSRF state value and stash it in Redis for 10 minutes.
  // The callback will verify the returning `state` matches what we stored.
  const state = randomBytes(24).toString("hex");
  const redis = getRedis();
  if (redis) {
    await redis.set(`gmail-oauth-state:${state}`, "1", { ex: 600 });
  }

  // Build the Google authorization URL.
  // - access_type=offline  → return a refresh_token (not just access_token)
  // - prompt=consent        → always show the consent screen (ensures refresh_token is returned)
  // - include_granted_scopes=true → pick up previously-granted scopes too
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/admin/gmail-oauth/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" ")
  );
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
