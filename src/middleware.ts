import { NextResponse } from "next/server";

// Site-wide auth gate is disabled — the waitlist popup + blur now
// protects site content until launch. Re-enable by restoring the
// JWT check from git history if needed.

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
