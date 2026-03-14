import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMITS, generateAdminSession } from "@/lib/security";

// POST /api/admin/login — Authenticate admin and set HTTP-only cookie
export async function POST(req: NextRequest) {
  const rateLimited = await RATE_LIMITS.general(req);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const { token } = body;

    const adminToken = process.env.ADMIN_AUTH_TOKEN;
    if (!adminToken) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (!token || token !== adminToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sessionValue = generateAdminSession(adminToken);

    const response = NextResponse.json({ success: true });
    response.cookies.set("pct-admin-session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE /api/admin/login — Logout (clear cookie)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("pct-admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
