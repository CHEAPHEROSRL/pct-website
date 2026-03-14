import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireAdminAuth } from "@/lib/security";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * GET /api/admin/media — List all pending media submissions
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    // Get all supporter records to find those with media
    const rawList = await redis.lrange<string>("supporters:list", 0, -1);
    if (!rawList || rawList.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const records = rawList.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    interface MediaItem {
      sessionId: string;
      name: string;
      amount: number;
      giftTitle: string;
      mediaUrl?: string;
      videoUrl?: string;
      mediaApproved?: string;
      uploadedAt?: string;
    }

    // Check for media on each record
    const items: MediaItem[] = [];
    await Promise.all(
      records.map(async (r: { id: string; name: string; amount: number; giftTitle: string }) => {
        const media = await redis.hgetall<Record<string, string>>(`supporters:media:${r.id}`);
        if (!media || Object.keys(media).length === 0) return;
        items.push({
          sessionId: r.id,
          name: r.name,
          amount: r.amount,
          giftTitle: r.giftTitle,
          mediaUrl: media.mediaUrl,
          videoUrl: media.videoUrl,
          mediaApproved: media.mediaApproved,
          uploadedAt: media.uploadedAt,
        });
      })
    );

    // Sort: unapproved first, then by upload time
    items.sort((a, b) => {
      const aApproved = a.mediaApproved === "true";
      const bApproved = b.mediaApproved === "true";
      if (aApproved !== bApproved) return aApproved ? 1 : -1;
      return Number(b.uploadedAt || 0) - Number(a.uploadedAt || 0);
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Failed to list media:", err);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

/**
 * POST /api/admin/media — Approve or reject a media submission
 * Body: { sessionId: string, action: "approve" | "reject" }
 */
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const { sessionId, action } = await request.json();

    if (!sessionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const key = `supporters:media:${sessionId}`;
    const exists = await redis.exists(key);
    if (!exists) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (action === "approve") {
      await redis.hset(key, { mediaApproved: "true" });
    } else {
      // Reject = delete the media record
      await redis.del(key);
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error("Media moderation failed:", err);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
