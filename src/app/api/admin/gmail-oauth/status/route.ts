import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { constantTimeEqual } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";

/**
 * GET /api/admin/gmail-oauth/status
 *
 * Returns whether Gmail sending is currently connected and, if so, which
 * Google account granted the permission.
 *
 * Shape:
 *   { connected: false, reason: "no-client-id" | "no-client-secret" | "no-refresh-token" }
 *   { connected: true, email: "paul@dreamingforaliving.com", connectedAt: "2026-04-22T..." }
 *
 * Used by the admin UI to render either:
 *   - a "Connect Gmail Account" button (not connected), OR
 *   - a "Connected as <email>" panel with a Disconnect button (connected)
 */

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read credentials + connection status. Prefer Redis over env vars because
  // that's where the OAuth callback writes the refresh token.
  const redis = getRedis();
  let settings: Record<string, string | boolean> = {};
  if (redis) {
    const raw = await redis.get<string>("admin:settings");
    settings = safeParse<Record<string, string | boolean>>(raw, {});
  }

  const clientId = process.env.GMAIL_CLIENT_ID || settings.gmailClientId || "";
  const clientSecret =
    process.env.GMAIL_CLIENT_SECRET || settings.gmailClientSecret || "";
  const refreshToken =
    process.env.GMAIL_REFRESH_TOKEN || settings.gmailRefreshToken || "";

  if (!clientId) {
    return NextResponse.json({
      connected: false,
      reason: "no-client-id",
      clientIdPresent: false,
      clientSecretPresent: !!clientSecret,
    });
  }
  if (!clientSecret) {
    return NextResponse.json({
      connected: false,
      reason: "no-client-secret",
      clientIdPresent: true,
      clientSecretPresent: false,
    });
  }
  if (!refreshToken) {
    return NextResponse.json({
      connected: false,
      reason: "no-refresh-token",
      clientIdPresent: true,
      clientSecretPresent: true,
    });
  }

  // gmailTokenValid is set to false by lib/email.ts when a send fails with
  // invalid_grant (token revoked / expired). Default is true when unset so
  // existing deployments behave normally until the first failure lands.
  const tokenValid = settings.gmailTokenValid !== false;

  return NextResponse.json({
    connected: true,
    email: settings.gmailConnectedEmail || "unknown",
    connectedAt: settings.gmailConnectedAt || null,
    clientIdPresent: true,
    clientSecretPresent: true,
    tokenValid,
    tokenInvalidAt: tokenValid ? null : settings.gmailTokenInvalidAt || null,
  });
}
