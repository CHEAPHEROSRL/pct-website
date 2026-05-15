import { NextRequest, NextResponse } from "next/server";
import { generateAdminSession, requireAdminAuth } from "@/lib/security";

/**
 * POST /api/admin/refresh-cookie
 *
 * Re-issues the `pct-admin-session` cookie for an admin who's already
 * authenticated via Bearer token. Solves a real footgun: the admin SPA
 * stores the admin token in localStorage and auto-logs-in on page load
 * via that token, but auto-login NEVER hits the password form — so the
 * cookie set during the original interactive login can quietly:
 *
 *   - expire (24h max-age)
 *   - get reset to old sameSite attributes after a config change
 *   - get stripped by browser privacy settings
 *
 * When that happens, API calls keep working (Bearer header is fine) but
 * any <a href> navigation to an admin endpoint (Gmail OAuth start, the
 * pledge diagnostic dump, etc.) fails with 401 because those routes
 * have no way to read the Bearer header.
 *
 * This endpoint accepts the same auth surface as the rest of admin
 * (Bearer OR cookie via requireAdminAuth) and just re-sets the cookie
 * with the current sameSite/maxAge policy. The admin SPA calls it on
 * mount whenever auto-login succeeds, keeping the cookie permanently
 * fresh as long as the admin is using the site.
 */
export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  const adminToken = process.env.ADMIN_AUTH_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const sessionValue = generateAdminSession(adminToken);
  const response = NextResponse.json({ ok: true, refreshed: true });
  response.cookies.set("pct-admin-session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours, same as /api/admin/auth + /api/admin/login
  });
  return response;
}
