import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS, sanitizeText } from "@/lib/security";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const rateLimited = await RATE_LIMITS.support(request);
  if (rateLimited) return rateLimited;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const youtubeUrl = formData.get("youtubeUrl") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Verify the session was processed (gift exists)
    const processed = await redis.get<string>(`supporters:processed:${sessionId}`);
    if (!processed) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 404 });
    }

    // Check if media was already uploaded for this session
    const existingMedia = await redis.hgetall(`supporters:media:${sessionId}`);
    if (existingMedia && Object.keys(existingMedia).length > 0) {
      return NextResponse.json({ error: "Media already uploaded for this gift" }, { status: 409 });
    }

    const mediaData: Record<string, string> = {};

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, and WebP images are allowed" },
          { status: 400 }
        );
      }
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Image must be under 5MB" },
          { status: 400 }
        );
      }

      const ext = imageFile.type.split("/")[1] === "jpeg" ? "jpg" : imageFile.type.split("/")[1];
      const filename = `support-gifts/${sessionId}.${ext}`;

      const blob = await put(filename, imageFile, {
        access: "public",
        addRandomSuffix: false,
      });

      mediaData.mediaUrl = blob.url;
      mediaData.mediaType = "image";
    }

    // Handle YouTube URL
    if (youtubeUrl) {
      const cleaned = sanitizeText(youtubeUrl, 200);
      // Basic YouTube URL validation
      if (
        cleaned.includes("youtube.com/watch") ||
        cleaned.includes("youtu.be/") ||
        cleaned.includes("youtube.com/shorts")
      ) {
        mediaData.videoUrl = cleaned;
        if (!mediaData.mediaType) {
          mediaData.mediaType = "video_link";
        }
      }
    }

    if (Object.keys(mediaData).length === 0) {
      return NextResponse.json({ error: "No media provided" }, { status: 400 });
    }

    // Store media data linked to the session — pending admin approval
    mediaData.mediaApproved = "false";
    mediaData.uploadedAt = String(Date.now());

    await redis.hset(`supporters:media:${sessionId}`, mediaData);

    return NextResponse.json({
      success: true,
      mediaUrl: mediaData.mediaUrl || null,
      videoUrl: mediaData.videoUrl || null,
    });
  } catch (err) {
    console.error("Media upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
