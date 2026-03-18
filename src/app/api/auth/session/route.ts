import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ session: null });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ session: null });
  }

  // Return safe subset — never send sessionId to client
  return NextResponse.json({
    session: {
      email: session.email,
      name: session.name,
      pledgeId: session.pledgeId,
      expiresAt: session.expiresAt,
    },
  });
}
