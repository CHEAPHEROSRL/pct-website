import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment processing not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { amount, firstName, lastName, email, message, anonymous } = body;

  const amountNum = Number(amount);
  if (!amountNum || amountNum < 1 || amountNum > 50000) {
    return NextResponse.json(
      { error: "Invalid donation amount" },
      { status: 400 }
    );
  }

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation — Paul Barry PCT Walk for Cancer",
              description: `$${amountNum} donation to support cancer research and prevention`,
            },
            unit_amount: amountNum * 100,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        firstName,
        lastName,
        email,
        message: (message || "").slice(0, 500),
        anonymous: anonymous ? "true" : "false",
      },
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/cancelled`,
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
