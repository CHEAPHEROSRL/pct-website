import { NextRequest, NextResponse } from "next/server";
import { sendNewPost } from "@/lib/email";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_AUTH_TOKEN;
}

/**
 * POST /api/emails/test
 *
 * Send a single test "new post" email to a specific address. Used to verify
 * the Gmail OAuth setup is working without spamming real subscribers.
 *
 * Body: { to: string, postTitle?: string, postExcerpt?: string, postSlug?: string }
 *
 * The recipient is taken ONLY from the `to` field — the waitlist and pledger
 * lists are ignored. This route exists specifically for verification.
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const to: string = body.to;
    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Missing 'to' field" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const postTitle = body.postTitle || "Test: The Night Before the PCT";
    const postExcerpt =
      body.postExcerpt ||
      "This is a test email from the YesChapter admin panel to verify that the email notification system is working correctly. If you received this, the Gmail OAuth setup is good to go.";
    const postSlug = body.postSlug || "test-post";
    const dayNumber: number = typeof body.dayNumber === "number" ? body.dayNumber : 0;

    const result = await sendNewPost(
      to,
      "Test User",
      postTitle,
      postExcerpt,
      postSlug,
      dayNumber,
      undefined // no unsubscribe token for tests
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Email send failed — check Vercel logs for details",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
    });
  } catch (err) {
    console.error("Test email failed:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
