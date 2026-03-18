import { NextRequest, NextResponse } from "next/server";
import { generateMagicToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { sanitizeEmail } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/security";
import { Redis } from "@upstash/redis";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 5 magic links per hour per IP
  const limited = await rateLimit(req, "magic-link", 5, "1 h");
  if (limited) return limited;

  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = sanitizeEmail(body.email || "");
  if (!email) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Look up name from pledge record if not provided
  let name = body.name?.trim() || "";
  if (!name) {
    const redis = getRedis();
    if (redis) {
      try {
        const pledgeId = await redis.get<string>(`pledge:email:${email}`);
        if (pledgeId) {
          const record = await redis.get<{ name?: string }>(`pledge:${pledgeId}`);
          if (record?.name) name = record.name;
        }
      } catch {
        // Non-fatal
      }
    }
  }

  const token = await generateMagicToken(email);
  const magicUrl = `${SITE}/auth/verify?token=${token}`;

  await sendMagicLink(email, magicUrl, name || undefined);

  // Always return success — don't reveal whether email exists
  return NextResponse.json({ success: true });
}
