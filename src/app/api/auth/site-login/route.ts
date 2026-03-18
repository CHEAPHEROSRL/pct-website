import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) {
      // Still run comparison on same-length buffers to avoid timing leak
      timingSafeEqual(ab, ab);
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SITE_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const users = [
    { name: process.env.SITE_USER_1 ?? "", pass: process.env.SITE_PASS_1 ?? "" },
    { name: process.env.SITE_USER_2 ?? "", pass: process.env.SITE_PASS_2 ?? "" },
  ];

  const match = users.find(
    (u) => u.name && safeCompare(username.toLowerCase(), u.name.toLowerCase()) && safeCompare(password, u.pass)
  );

  if (!match) {
    // Small delay to slow brute force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ sub: match.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(new TextEncoder().encode(secret));

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
