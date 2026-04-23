import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getTemplateById } from "@/lib/email-templates";
import { constantTimeEqual } from "@/lib/security";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

const NOTES_KEY = "admin:email-notes";

/**
 * GET /api/admin/email-notes
 *   Returns all notes as a Record<templateId, string>.
 *
 * PUT /api/admin/email-notes
 *   Body: { templateId: string, note: string }
 *   Saves (or overwrites) the note for that template. An empty string
 *   removes the note.
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ notes: {} });
  }

  try {
    const raw = await redis.get<string>(NOTES_KEY);
    const notes =
      raw && typeof raw === "string"
        ? (JSON.parse(raw) as Record<string, string>)
        : raw && typeof raw === "object"
          ? (raw as Record<string, string>)
          : {};
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("Failed to read email notes:", err);
    return NextResponse.json({ notes: {} });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage unavailable" },
      { status: 503 }
    );
  }

  let body: { templateId?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { templateId, note } = body;

  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json(
      { error: "Missing templateId" },
      { status: 400 }
    );
  }

  if (typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string (empty string to clear)" },
      { status: 400 }
    );
  }

  // Validate the template actually exists
  if (!getTemplateById(templateId)) {
    return NextResponse.json(
      { error: `Unknown templateId: ${templateId}` },
      { status: 400 }
    );
  }

  // Cap note length so a bad client can't blow up Redis
  const trimmed = note.slice(0, 5000);

  try {
    const raw = await redis.get<string>(NOTES_KEY);
    const existing: Record<string, string> =
      raw && typeof raw === "string"
        ? JSON.parse(raw)
        : raw && typeof raw === "object"
          ? (raw as Record<string, string>)
          : {};

    if (trimmed.trim() === "") {
      delete existing[templateId];
    } else {
      existing[templateId] = trimmed;
    }

    await redis.set(NOTES_KEY, JSON.stringify(existing));
    return NextResponse.json({ ok: true, notes: existing });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to save note: ${message}` },
      { status: 500 }
    );
  }
}
