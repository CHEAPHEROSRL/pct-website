/**
 * GET  /api/comments        — list comments (public, cached 60s)
 * POST /api/comments        — create comment (requires session + must have pledge)
 * DELETE /api/comments?id=  — delete own comment (requires session)
 *
 * Redis keys:
 *   comments:list            — Redis list of JSON PledgerComment[], newest first
 *   comments:by-pledge:{id} — Set of comment IDs for rate-limiting (1 per pledger)
 */

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { sanitizeText, rateLimit } from "@/lib/security";
import type { PledgerComment } from "@/lib/types";
import crypto from "crypto";

const MAX_COMMENTS = 200;
const MAX_BODY_LENGTH = 300;
const COMMENTS_KEY = "comments:list";

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

async function requirePledgerSession(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const session = await getSession(sessionId);
  if (!session || !session.pledgeId) return null;
  return session;
}

export async function GET() {
  const redis = getRedis();
  const raw = await redis.lrange<string>(COMMENTS_KEY, 0, 49); // last 50
  const comments: PledgerComment[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );
  return NextResponse.json(
    { comments },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } }
  );
}

export async function POST(req: NextRequest) {
  // Rate limit: 3 comments per hour per IP
  const limited = await rateLimit(req, "comments", 3, "1 h");
  if (limited) return limited;

  const session = await requirePledgerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in and have an active pledge to comment." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const rawBody: string = body.body ?? "";
  if (!rawBody.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  const sanitized = sanitizeText(rawBody, MAX_BODY_LENGTH);

  // Check if this pledger already commented recently (one comment per 10 minutes)
  const redis = getRedis();
  const lastCommentKey = `comments:last:${session.pledgeId}`;
  const lastAt = await redis.get<number>(lastCommentKey);
  if (lastAt && Date.now() - lastAt < 10 * 60 * 1000) {
    return NextResponse.json(
      { error: "Please wait a few minutes before commenting again." },
      { status: 429 }
    );
  }

  const comment: PledgerComment = {
    id: crypto.randomUUID(),
    pledgeId: session.pledgeId!,
    name: session.name,
    displayName: session.name,
    body: sanitized,
    createdAt: Date.now(),
  };

  await redis.lpush(COMMENTS_KEY, JSON.stringify(comment));
  await redis.ltrim(COMMENTS_KEY, 0, MAX_COMMENTS - 1);
  await redis.set(lastCommentKey, Date.now(), { ex: 600 }); // 10 min cooldown

  return NextResponse.json({ ok: true, comment });
}

export async function DELETE(req: NextRequest) {
  const session = await requirePledgerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("id");
  if (!commentId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const redis = getRedis();
  const raw = await redis.lrange<string>(COMMENTS_KEY, 0, -1);
  const comments: PledgerComment[] = (raw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );

  const target = comments.find((c) => c.id === commentId);
  if (!target) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (target.pledgeId !== session.pledgeId) {
    return NextResponse.json({ error: "Cannot delete another user's comment" }, { status: 403 });
  }

  // Remove the one entry
  await redis.lrem(COMMENTS_KEY, 1, JSON.stringify(target));
  return NextResponse.json({ ok: true });
}
