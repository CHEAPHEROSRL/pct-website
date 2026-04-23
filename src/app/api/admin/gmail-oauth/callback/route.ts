import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/**
 * GET /api/admin/gmail-oauth/callback
 *
 * Handles the redirect back from Google after the user grants (or denies)
 * the gmail.send permission.
 *
 * 1. Validates `state` against the one we stashed in /start (CSRF check)
 * 2. Exchanges the `code` for access + refresh tokens via Google's token endpoint
 * 3. Identifies which Google account consented (for display in the admin UI)
 * 4. Writes the refresh_token + connected-account metadata to Redis under
 *    admin:settings (gmailRefreshToken, gmailConnectedEmail, gmailConnectedAt)
 * 5. Redirects the browser back to /admin with a success or error flash
 *
 * If Google returns an `error` parameter (user clicked Deny, or consent
 * screen was misconfigured), we just redirect back to /admin with the
 * error displayed in the URL for the admin UI to surface.
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
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

function redirectBack(origin: string, flash: Record<string, string>) {
  const url = new URL(`${origin}/admin`);
  Object.entries(flash).forEach(([k, v]) => url.searchParams.set(k, v));
  url.hash = "#emails"; // Jump to the Emails tab area (or we'll just use it as a hint)
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  // ── Google returned an error (e.g. user clicked Deny) ─────────────
  if (oauthError) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason:
        oauthError === "access_denied"
          ? "You cancelled the authorization. No changes were made."
          : `Google returned: ${oauthError}`,
    });
  }

  if (!code || !state) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason: "Missing code or state parameter from Google.",
    });
  }

  // ── Validate CSRF state ───────────────────────────────────────────
  const redis = getRedis();
  if (!redis) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason: "Redis not configured — cannot validate state.",
    });
  }

  const stored = await redis.get<string>(`gmail-oauth-state:${state}`);
  if (!stored) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason:
        "The authorization session expired or is invalid. Please start over.",
    });
  }
  // One-time use
  await redis.del(`gmail-oauth-state:${state}`);

  // ── Resolve client credentials ────────────────────────────────────
  const creds = {
    clientId:
      process.env.GMAIL_CLIENT_ID ||
      (await readCredentialsFromRedis())?.clientId ||
      "",
    clientSecret:
      process.env.GMAIL_CLIENT_SECRET ||
      (await readCredentialsFromRedis())?.clientSecret ||
      "",
  };

  if (!creds.clientId || !creds.clientSecret) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason:
        "Gmail Client ID or Secret are not configured. Save them in Admin → Settings first.",
    });
  }

  // ── Exchange the code for tokens ──────────────────────────────────
  const redirectUri = `${origin}/api/admin/gmail-oauth/callback`;

  let tokenResponse: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    });

    tokenResponse = await tokenRes.json();
  } catch (err) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason: `Failed to reach Google token endpoint: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    });
  }

  if (tokenResponse.error) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason: `Google rejected the token exchange: ${
        tokenResponse.error_description || tokenResponse.error
      }`,
    });
  }

  if (!tokenResponse.refresh_token) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason:
        "Google did not return a refresh token. Usually means the user already granted consent before — try disconnecting first, then reconnecting, and make sure 'prompt=consent' is in the authorization URL.",
    });
  }

  // ── Identify which account just consented (for display) ───────────
  // Google's userinfo endpoint returns { email, name, ... }
  let connectedEmail = "unknown";
  if (tokenResponse.access_token) {
    try {
      const userinfoRes = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      );
      if (userinfoRes.ok) {
        const userinfo = await userinfoRes.json();
        if (typeof userinfo.email === "string") {
          connectedEmail = userinfo.email;
        }
      }
    } catch {
      // Non-fatal — we have the token, just don't know who it belongs to
    }
  }

  // ── Save to Redis admin:settings ──────────────────────────────────
  try {
    const raw = await redis.get<string>("admin:settings");
    const settings: Record<string, string | boolean | null> = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : (raw as Record<string, string>)
      : {};

    settings.gmailRefreshToken = tokenResponse.refresh_token;
    settings.gmailConnectedEmail = connectedEmail;
    settings.gmailConnectedAt = new Date().toISOString();
    // Reset the token-invalid flag if this reconnect is recovering from a
    // previous invalid_grant failure. Status endpoint defaults unset to valid,
    // but being explicit here prevents any stale "invalid" banner from
    // lingering after a successful reconnect.
    settings.gmailTokenValid = true;
    settings.gmailTokenInvalidAt = null;

    await redis.set("admin:settings", JSON.stringify(settings));
  } catch (err) {
    return redirectBack(origin, {
      gmailOauth: "error",
      gmailOauthReason: `Got the token from Google but failed to save it: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    });
  }

  // ── Done ──────────────────────────────────────────────────────────
  return redirectBack(origin, {
    gmailOauth: "success",
    gmailOauthEmail: connectedEmail,
  });
}
