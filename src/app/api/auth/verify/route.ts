import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") || "/my-pledge";

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
