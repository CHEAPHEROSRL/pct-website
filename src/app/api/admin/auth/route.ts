import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateAdminSession } from "@/lib/security";

function safeCompare(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) {
      timingSafeEqual(ab, ab);
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const users = [
    { name: process.env.SITE_USER_1 ?? "", pass: process.env.SITE_PASS_1 ?? "" },
    { name: process.env.SITE_USER_2 ?? "", pass: process.env.SITE_PASS_2 ?? "" },
  ];

  const match = users.find(
    (u) =>
      u.name &&
      safeCompare(username.toLowerCase(), u.name.toLowerCase()) &&
      safeCompare(password, u.pass)
  );

  if (!match) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Return the admin auth token so the frontend can use it for API calls
  const adminToken = process.env.ADMIN_AUTH_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  // Two parallel auth surfaces share this login:
  //
  //   1. Bearer token (returned in the JSON body) — admin SPA stores it in
  //      localStorage and sends it as `Authorization: Bearer ...` on its
  //      API calls. Works because XHR/fetch can attach arbitrary headers.
  //
  //   2. pct-admin-session cookie (set below) — used by endpoints that the
  //      browser navigates to directly via <a href>, not via fetch.
  //      Specifically /api/admin/gmail-oauth/start, which redirects to
  //      Google's consent screen. <a href> navigations can't attach a
  //      Bearer header, and the prior "?token=X" query-param workaround
  //      was removed in commit 2505ee0 because query strings leak into
  //      access logs, browser history, and Referer headers.
  //
  // Setting the cookie here means a single login covers both surfaces.
  // The cookie has the same daily HMAC rotation that requireAdminAuth in
  // lib/security validates.
  const sessionValue = generateAdminSession(adminToken);
  const response = NextResponse.json({ ok: true, token: adminToken, user: match.name });
  response.cookies.set("pct-admin-session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}
