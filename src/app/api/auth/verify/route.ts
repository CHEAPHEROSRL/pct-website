import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";
const DEFAULT_REDIRECT = "/my-pledge";

/**
 * Only allow same-site, relative-path redirects after magic-link login.
 *
 * Rejects anything that could steer the browser off-site:
 *   "//evil.com"    — protocol-relative, browsers treat as external
 *   "/\\evil.com"   — backslash variant some browsers normalise
 *   "http://..."    — absolute URL
 *   "javascript:..."— scheme-based payload
 *   not starting with "/" — relative to current dir, unsafe
 */
function sanitizeRedirect(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_REDIRECT;
  return raw;
}

/**
 * GET handler — used by direct URL paste / older links. Does NOT consume the
 * token. Just bounces to the /auth/verify PAGE which renders a "Sign In"
 * button. The user must click that button to actually consume the token.
 *
 * Why no auto-consume on GET: email link previewers (Gmail, Outlook ATP,
 * corporate spam filters) follow links to scan for malware. Many of them run
 * JS and would have followed the previous auto-redirect, burning the
 * one-time token before the real user could click. The new flow requires
 * an explicit user click on the rendered button — scanners don't simulate
 * clicks, so the token survives until the user actually arrives.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = sanitizeRedirect(req.nextUrl.searchParams.get("redirect"));

  if (!token) {
    return NextResponse.redirect(`${SITE}/auth/verify?error=missing`);
  }

  // Send the user to the verify page; the page renders a Sign In button
  // that POSTs back here to actually consume the token.
  const target = new URL(`${SITE}/auth/verify`);
  target.searchParams.set("token", token);
  if (redirect !== DEFAULT_REDIRECT) target.searchParams.set("redirect", redirect);
  return NextResponse.redirect(target.toString());
}

/**
 * POST handler — the actual token-consuming endpoint. Only reachable after
 * the user clicks the Sign In button on /auth/verify. Returns JSON with
 * the redirect target so the client-side JS can navigate.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { token?: string; redirect?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, reason: "bad-request" }, { status: 400 });
  }

  const token = body.token;
  const redirect = sanitizeRedirect(body.redirect);

  if (!token) {
    return NextResponse.json({ success: false, reason: "missing-token" }, { status: 400 });
  }

  const email = await consumeMagicToken(token);
  if (!email) {
    return NextResponse.json({ success: false, reason: "expired" }, { status: 400 });
  }

  const session = await createSession(email);

  const opts = sessionCookieOptions();
  const res = NextResponse.json({ success: true, redirect });
  res.cookies.set({
    ...opts,
    name: SESSION_COOKIE,
    value: session.sessionId,
  });

  return res;
}
