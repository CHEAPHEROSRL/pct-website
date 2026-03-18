import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/site-login",
  "/api/auth/site-login",
  "/_next",
  "/favicon.ico",
  "/images",
  "/public",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("site-auth")?.value;
  const secret = process.env.SITE_JWT_SECRET;

  if (!secret) {
    // If no secret configured, allow through (dev/setup mode)
    return NextResponse.next();
  }

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      // Invalid/expired token — fall through to redirect
    }
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/site-login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
