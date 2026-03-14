import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getStripe } from "@/lib/stripe";
import { avatarColor } from "@/lib/donor-utils";
import { GIFT_ESTIMATES } from "@/lib/gift-estimates";
import { snapToTrail } from "@/lib/trail";
import type { SupportRecord } from "@/lib/types";
import type Stripe from "stripe";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const redis = getRedis();
  if (!stripe || !redis) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const meta = session.metadata || {};
    const isTrailSupport = meta.type === "trail_support";

    // Use separate Redis key namespaces for trail support vs legacy
    const prefix = isTrailSupport ? "supporters" : "donors";

    // Idempotency: skip if already processed
    const alreadyProcessed = await redis.get<string>(`${prefix}:processed:${session.id}`);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true });
    }

    const amountDollars = (session.amount_total || 0) / 100;
    const displayName = meta.anonymous === "true"
      ? "Anonymous"
      : `${meta.firstName || ""} ${meta.lastName || ""}`.trim() || "Supporter";

    // Capture Paul's trail position at time of gift
    let trailLat: number | undefined;
    let trailLng: number | undefined;
    let trailMile: number | undefined;
    if (isTrailSupport) {
      try {
        const locRaw = await redis.get<string>("location:current");
        if (locRaw) {
          const loc = typeof locRaw === "string" ? JSON.parse(locRaw) : locRaw;
          if (loc.lat && loc.lng) {
            trailLat = loc.lat;
            trailLng = loc.lng;
            const snap = snapToTrail(loc.lat, loc.lng);
            trailMile = Math.round(snap.miles);
          }
        }
      } catch {
        // Non-critical — gift is still recorded without position
      }
    }

    const record: SupportRecord = {
      id: session.id,
      name: displayName,
      email: meta.email || session.customer_email || "",
      amount: amountDollars,
      message: isTrailSupport ? (meta.message || meta.giftTitle || "Trail support gift") : (meta.message || ""),
      anonymous: meta.anonymous === "true",
      color: avatarColor(meta.email || session.customer_email || session.id),
      giftTitle: meta.giftTitle || null,
      createdAt: Date.now(),
      trailLat,
      trailLng,
      trailMile,
    };

    await redis.lpush(`${prefix}:list`, JSON.stringify(record));
    await redis.incr(`${prefix}:count`);
    await redis.incrbyfloat(`${prefix}:total`, amountDollars);

    const currentLargest = (await redis.get<number>(`${prefix}:largest`)) || 0;
    if (amountDollars > currentLargest) {
      await redis.set(`${prefix}:largest`, amountDollars);
    }

    // Track per-gift-type counts for progress bars
    if (isTrailSupport && meta.giftTitle && meta.giftTitle in GIFT_ESTIMATES) {
      await redis.incr(`supporters:gift-count:${meta.giftTitle}`);
    }

    await redis.set(`${prefix}:processed:${session.id}`, "1", { ex: 60 * 60 * 24 * 30 });
  }

  return NextResponse.json({ received: true });
}
