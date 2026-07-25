import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { RATE_LIMITS, sanitizeText } from "@/lib/security";

export async function POST(request: NextRequest) {
  const rateLimited = await RATE_LIMITS.support(request);
  if (rateLimited) return rateLimited;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment processing not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { amount, giftTitle, firstName, message, anonymous } = body;

  const amountNum = Number(amount);
  if (!amountNum || amountNum < 1 || amountNum > 10000) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  // A request without an Origin header must never send a paying customer to
  // localhost after checkout — fall back to the real site like the rest of
  // the codebase does.
  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://yeschapter.com";
  const description = giftTitle
    ? `Trail support gift: ${giftTitle}`
    : `Trail support gift — $${amountNum}`;

  try {
    // payment_method_types is deliberately omitted: Stripe then offers every
    // method enabled in the dashboard (Apple Pay, Google Pay, Link), which
    // matters because most gift traffic arrives on mobile from social.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Trail Support — YesChapter",
              description,
            },
            unit_amount: amountNum * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "trail_support",
        giftTitle: giftTitle || "Custom Amount",
        amount: String(amountNum),
        firstName: firstName ? sanitizeText(String(firstName), 50) : "",
        message: message ? sanitizeText(String(message), 200) : "",
        anonymous: anonymous ? "true" : "false",
      },
      success_url: `${origin}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/support/cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
