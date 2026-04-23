import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { constantTimeEqual } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";

const SETTINGS_KEY = "admin:settings";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const raw = await redis.get<string>(SETTINGS_KEY);
  if (!raw) return NextResponse.json({});

  return NextResponse.json(safeParse<Record<string, unknown>>(raw, {}));
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const body = await req.json();

  // Merge with existing settings
  const raw = await redis.get<string>(SETTINGS_KEY);
  const existing = safeParse<Record<string, unknown>>(raw, {});
  const merged = { ...existing, ...body };

  await redis.set(SETTINGS_KEY, JSON.stringify(merged));
  return NextResponse.json({ ok: true });
}
