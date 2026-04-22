import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/**
 * POST /api/admin/gmail-oauth/disconnect
 *
 * Revokes the stored refresh token at Google and removes the connection
 * metadata from Redis. After this, the website can't send emails until
 * someone reconnects.
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
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 503 }
    );
  }

  // Read current token so we can revoke it at Google
  let refreshToken = "";
  let settings: Record<string, string> = {};
  try {
    const raw = await redis.get<string>("admin:settings");
    if (raw) {
      settings =
        typeof raw === "string"
          ? JSON.parse(raw)
          : (raw as Record<string, string>);
      refreshToken = settings.gmailRefreshToken || "";
    }
  } catch {
    // If we can't read settings, just fall through to no-op revoke
  }

  // Ask Google to revoke the token. Non-fatal if this fails — we still
  // want to clear our local copy.
  let revokeOk = true;
  let revokeError: string | null = null;
  if (refreshToken) {
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      if (!res.ok) {
        revokeOk = false;
        revokeError = `Google revoke endpoint returned ${res.status}`;
      }
    } catch (err) {
      revokeOk = false;
      revokeError = err instanceof Error ? err.message : "network error";
    }
  }

  // Clear local state regardless of revoke result
  try {
    delete settings.gmailRefreshToken;
    delete settings.gmailConnectedEmail;
    delete settings.gmailConnectedAt;
    await redis.set("admin:settings", JSON.stringify(settings));
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Failed to clear local settings: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    revokedAtGoogle: revokeOk,
    revokeError,
  });
}
