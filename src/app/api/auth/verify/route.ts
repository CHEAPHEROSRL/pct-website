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
function sanitizeRedirect(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_REDIRECT;
  return raw;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = sanitizeRedirect(req.nextUrl.searchParams.get("redirect"));

  if (!token) {
    return NextResponse.redirect(`${SITE}/auth/verify?error=missing`);
  }

  const email = await consumeMagicToken(token);
  if (!email) {
    return NextResponse.redirect(`${SITE}/auth/verify?error=expired`);
  }

  const session = await createSession(email);

  const opts = sessionCookieOptions();
  const res = NextResponse.redirect(`${SITE}${redirect}`);
  res.cookies.set({
    ...opts,
    name: SESSION_COOKIE,
    value: session.sessionId,
  });

  return res;
}
