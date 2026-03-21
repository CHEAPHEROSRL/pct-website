import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) {
      timingSafeEqual(ab, ab);
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const users = [
    { name: process.env.SITE_USER_1 ?? "", pass: process.env.SITE_PASS_1 ?? "" },
    { name: process.env.SITE_USER_2 ?? "", pass: process.env.SITE_PASS_2 ?? "" },
  ];

  const match = users.find(
    (u) =>
      u.name &&
      safeCompare(username.toLowerCase(), u.name.toLowerCase()) &&
      safeCompare(password, u.pass)
  );

  if (!match) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Return the admin auth token so the frontend can use it for API calls
  const adminToken = process.env.ADMIN_AUTH_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, token: adminToken, user: match.name });
}
