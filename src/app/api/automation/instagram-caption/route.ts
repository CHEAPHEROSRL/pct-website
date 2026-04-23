import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { constantTimeEqual } from "@/lib/security";

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

/**
 * GET /api/automation/instagram-caption?postId={id}
 *
 * Retrieve the auto-generated Instagram caption for a journal post.
 * Used in the admin panel for easy copy-paste to Instagram.
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json(
      { error: "Missing postId parameter" },
      { status: 400 }
    );
  }

  const caption = await redis.get<string>(`instagram:caption:${postId}`);

  if (!caption) {
    return NextResponse.json(
      { error: "No caption found for this post" },
      { status: 404 }
    );
  }

  return NextResponse.json({ postId, caption });
}
