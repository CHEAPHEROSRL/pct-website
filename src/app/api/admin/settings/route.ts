import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

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
  return !!token && token === process.env.ADMIN_AUTH_TOKEN;
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

  const settings = typeof raw === "string" ? JSON.parse(raw) : raw;
  return NextResponse.json(settings);
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
  const existing = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : {};
  const merged = { ...existing, ...body };

  await redis.set(SETTINGS_KEY, JSON.stringify(merged));
  return NextResponse.json({ ok: true });
}
