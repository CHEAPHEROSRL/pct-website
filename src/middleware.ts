import { NextRequest, NextResponse } from "next/server";

// ----------------------------------------------------------------------------
// Pages that should be hidden from the public but visible to admins
// ----------------------------------------------------------------------------
//
// Any path in this list is redirected to "/" for visitors who are NOT
// authenticated as admin. Admins (anyone with the `pct-admin-session`
// cookie) can still view the pages for editing/preview purposes.
//
// To hide a new page, just add its path here. No redirect entry in
// next.config.ts needed — this middleware handles the redirect conditionally.
//
// Note: we match EXACT paths here, not prefixes. If you want to hide a
// whole section (e.g. /sponsor-agreement and all sub-pages), add each
// path individually or change the check to `.startsWith()`.
// ----------------------------------------------------------------------------
const ADMIN_ONLY_PATHS = new Set<string>([
  "/press-kit",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_ONLY_PATHS.has(pathname)) {
    // Bypass for logged-in admins — they can view the page for editing
    const adminCookie = request.cookies.get("pct-admin-session");
    if (!adminCookie?.value) {
      // Visitor without admin session — send them home
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
