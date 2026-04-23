import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * GET /api/support/verify?session_id=X
 *
 * Verifies that a Stripe Checkout session ID is real, belongs to us, and
 * that the associated payment succeeded. Called by /support/success on mount
 * so the page doesn't render a congratulations message for anyone who
 * crafts a URL with a fake `?session_id=...`.
 *
 * Returns:
 *   { valid: true, giftTitle, amount } when the session is real + paid
 *   { valid: false }                    otherwise
 *
 * We never leak the raw Stripe object — only the two fields the success
 * page needs. Unverified requests silently get valid: false.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ valid: false });
  }

  // Basic format guard: Stripe session IDs always start with "cs_" and
  // don't contain unusual characters. Rejecting obviously-malformed IDs
  // saves us a Stripe API round trip per bogus request.
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ valid: false });
  }

  const stripe = getStripe();
  if (!stripe) {
    // Stripe unconfigured in this environment; don't leak that info
    return NextResponse.json({ valid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ valid: false });
    }
    const meta = session.metadata || {};
    return NextResponse.json({
      valid: true,
      giftTitle: meta.giftTitle || null,
      amount: (session.amount_total || 0) / 100,
    });
  } catch {
    // Session not found, belongs to a different Stripe account, or Stripe is down
    return NextResponse.json({ valid: false });
  }
}
