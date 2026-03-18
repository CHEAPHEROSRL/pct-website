import { NextRequest, NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }

  const res = NextResponse.json({ success: true });
  // Expire the cookie
  res.cookies.set({
    ...sessionCookieOptions(0),
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
  });
  return res;
}
