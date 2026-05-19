import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/security";
import { bulkEmailsEnabled } from "@/lib/email";

/**
 * POST /api/admin/email-cron-trigger
 *
 * Body: { which: "welcome" | "weekly" | "milestone" | "honor" }
 *
 * Manually triggers one of the four email-cron endpoints on demand. Used
 * by the "Send Now" buttons in admin Settings → Email Crons.
 *
 * Mechanics: forwards the request server-side to the underlying cron
 * endpoint (/api/emails/{which}) with:
 *   - CRON_SECRET in Authorization (so requireCronAuth on the target accepts it)
 *   - ?bypassStandby=1 query param (so the target ignores the standby flag)
 *
 * Layered protection stays intact:
 *   - EMAILS_ENABLED env var is still respected (master gate)
 *   - Per-pledger dedup keys (welcome:day1:<id>, weekly:wN:sent_ids, etc.)
 *     still prevent double-sends — clicking "Send Now" twice in a row will
 *     skip everyone already sent
 *   - Standby flag itself is NOT touched; subsequent Vercel cron runs stay
 *     paused if standby is still on
 */

export const maxDuration = 60;

const ALLOWED = new Set(["welcome", "weekly", "milestone", "honor"]);

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  if (!bulkEmailsEnabled()) {
    return NextResponse.json(
      {
        error:
          "Bulk emails are paused. Set EMAILS_ENABLED=true in Vercel env and redeploy first.",
      },
      { status: 503 }
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET env var is not configured." },
      { status: 500 }
    );
  }

  let body: { which?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const which = body.which;
  if (typeof which !== "string" || !ALLOWED.has(which)) {
    return NextResponse.json(
      { error: `Missing or invalid 'which'. Allowed: ${[...ALLOWED].join(", ")}` },
      { status: 400 }
    );
  }

  // Forward to the cron endpoint. Vercel needs an absolute URL for
  // server-side fetch (relative paths fail outside the browser).
  const origin = req.nextUrl.origin;
  const target = `${origin}/api/emails/${which}?bypassStandby=1`;

  try {
    const res = await fetch(target, {
      method: "GET", // All four cron endpoints accept GET (it's what Vercel sends)
      headers: { Authorization: `Bearer ${cronSecret}` },
    });

    // Pass the underlying status + body straight through so the UI can
    // surface the same dedup-skipped / partial-failure detail the cron
    // would have.
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, which, response: data }, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Fetch failed",
      },
      { status: 502 }
    );
  }
}
