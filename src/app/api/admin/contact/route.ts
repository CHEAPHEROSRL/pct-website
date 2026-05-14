import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security";
import {
  listMessages,
  getMessage,
  updateMessage,
  deleteMessage,
} from "@/lib/contact-messages";

// GET /api/admin/contact            — list all (newest-first, max 200)
// GET /api/admin/contact?id=<id>    — single message; auto-marks as read
// PATCH /api/admin/contact?id=<id>  — patch status (body: { repliedAt?, readAt? })
// DELETE /api/admin/contact?id=<id> — remove
//
// All four require admin auth (cookie or bearer token via requireAdminAuth).
// The admin tab in /admin/page.tsx is the only client of this.

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");

  // Single-message fetch — also auto-marks the message as read on first open.
  // This is the same pattern Gmail uses: clicking a thread implicitly reads it.
  if (id) {
    const msg = await getMessage(id);
    if (!msg) {
      return NextResponse.json({ error: "Message not found or expired" }, { status: 404 });
    }
    if (!msg.readAt) {
      const updated = await updateMessage(id, { readAt: Date.now() });
      return NextResponse.json({ message: updated || msg });
    }
    return NextResponse.json({ message: msg });
  }

  // List view
  const messages = await listMessages(200);
  return NextResponse.json({ messages });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    // Only allow the two fields Paul can flip from the UI. Anything else
    // (deliveryStatus, sendError, name, message, etc.) is read-only.
    const patch: { repliedAt?: number; readAt?: number } = {};
    if (body.repliedAt === null || typeof body.repliedAt === "number") {
      patch.repliedAt = body.repliedAt;
    }
    if (body.readAt === null || typeof body.readAt === "number") {
      patch.readAt = body.readAt;
    }

    const updated = await updateMessage(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Message not found or expired" }, { status: 404 });
    }
    return NextResponse.json({ message: updated });
  } catch (err) {
    console.error("Failed to update contact message:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  const ok = await deleteMessage(id);
  if (!ok) {
    return NextResponse.json({ error: "Message not found or already deleted" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
