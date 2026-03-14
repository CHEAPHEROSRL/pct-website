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

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const description = giftTitle
    ? `Trail support gift: ${giftTitle}`
    : `Trail support gift — $${amountNum}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
