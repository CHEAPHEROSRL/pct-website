import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getStripe } from "@/lib/stripe";
import { avatarColor } from "@/lib/donor-utils";
import { GIFT_ESTIMATES } from "@/lib/gift-estimates";
import { snapToTrail } from "@/lib/trail";
import { safeParse } from "@/lib/redis-safe";
import { sendGiftAlert, sendGiftFailureAlert } from "@/lib/email";
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

    // Don't set the idempotency marker for unpaid events. Async payment
    // methods (e.g. bank transfers) can fire this event before payment lands;
    // the follow-up "checkout.session.async_payment_succeeded" event (a
    // different event.id) carries the paid state. Setting a marker here
    // would block that legitimate follow-up.
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    // This Stripe account is shared with Paul's other business, which runs its
    // own live integration (Payment Links / Checkout) on the same account.
    // Stripe fans every matching event out to every subscribed endpoint, so
    // that business's sales arrive here too. Only trail support gifts belong
    // in this site's data — drop everything else rather than filing an
    // unrelated customer's name and email under "donors".
    if (session.metadata?.type !== "trail_support") {
      return NextResponse.json({ received: true, ignored: true });
    }

    // Idempotency: key on event.id (Stripe's own recommendation), set NX at
    // the TOP of processing. If the marker already exists, another delivery
    // of this event is in flight or has already completed — we return early
    // without side effects. Marker has a 30-day TTL, long enough to outlast
    // all Stripe retries. Per product decision, we favour "stuck permanently
    // on partial failure" (requires manual Redis clear) over "auto-healing
    // with possible duplicate entries" — duplicate supporters on the wall
    // are worse than a single stuck event that an admin notices and clears.
    const idempotencyKey = `stripe:event:${event.id}`;
    const acquired = await redis.set(idempotencyKey, "1", { nx: true, ex: 60 * 60 * 24 * 30 });
    if (!acquired) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Everything from here writes state. It is wrapped so that a failure
    // after the payment has already been taken cannot pass silently: the
    // supporter has been charged by this point, so a dropped record is money
    // received for nothing visible.
    try {
      const meta = session.metadata || {};
      const isTrailSupport = meta.type === "trail_support";

      // Use separate Redis key namespaces for trail support vs legacy
      const prefix = isTrailSupport ? "supporters" : "donors";

      const amountDollars = (session.amount_total || 0) / 100;
      const displayName = meta.anonymous === "true"
        ? "Anonymous"
        : `${meta.firstName || ""} ${meta.lastName || ""}`.trim() || "Supporter";

      // Checkout only populates `customer_email` when it was pre-filled at
      // session creation — we don't pre-fill it, so the address the buyer
      // actually typed arrives in `customer_details.email`.
      const email = meta.email || session.customer_details?.email || session.customer_email || "";

      // Capture Paul's trail position at time of gift
      let trailLat: number | undefined;
      let trailLng: number | undefined;
      let trailMile: number | undefined;
      if (isTrailSupport) {
        const locRaw = await redis.get<string>("location:current");
        const loc = safeParse<{ lat?: number; lng?: number } | null>(locRaw, null);
        if (loc && loc.lat && loc.lng) {
          trailLat = loc.lat;
          trailLng = loc.lng;
          const snap = snapToTrail(loc.lat, loc.lng);
          trailMile = Math.round(snap.miles);
        }
      }

      const record: SupportRecord = {
        id: session.id,
        name: displayName,
        email,
        amount: amountDollars,
        message: isTrailSupport ? (meta.message || meta.giftTitle || "Trail support gift") : (meta.message || ""),
        anonymous: meta.anonymous === "true",
        color: avatarColor(email || session.id),
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

      // Unlocks the optional photo/video upload on /support/success.
      // /api/support/media requires this marker, so media can only ever attach
      // to a gift we actually recorded. TTL outlasts any realistic delay
      // between paying and coming back to add a photo.
      if (isTrailSupport) {
        await redis.set(`supporters:processed:${session.id}`, "1", {
          ex: 60 * 60 * 24 * 90,
        });
      }

      // Tell Paul. Nothing did this before, so a gift could be paid for and
      // sit unseen until the buyer emailed to ask whether it had arrived.
      // Awaited, because Vercel can freeze the function the moment we respond
      // and kill an in-flight Gmail request. Failure to send must never fail
      // the webhook: the gift is already safely recorded above, and returning
      // an error would make Stripe retry an event we have fully processed.
      if (isTrailSupport) {
        try {
          const supporterCount = (await redis.get<number>("supporters:count")) || 0;
          const totalGifts = Number(await redis.get("supporters:total")) || 0;
          await sendGiftAlert(
            record.giftTitle,
            record.name,
            record.email,
            record.amount,
            meta.message || "",
            record.trailMile,
            supporterCount,
            totalGifts
          );
        } catch (err) {
          console.error("Gift recorded but alert email failed:", err);
        }
      }
    } catch (err) {
      // The marker stays claimed, so Stripe's retries will short-circuit and
      // this gift will not self-heal. Make it loud instead of silent, and
      // include the session id so it can be reconciled by hand.
      const reason = err instanceof Error ? err.message : String(err);
      console.error("Failed to record paid gift:", session.id, reason);
      await redis
        .lpush(
          "supporters:failed",
          JSON.stringify({ sessionId: session.id, amount: (session.amount_total || 0) / 100, reason, at: Date.now() })
        )
        .catch(() => {});
      await sendGiftFailureAlert(session.id, (session.amount_total || 0) / 100, reason).catch(() => {});
      return NextResponse.json({ received: true, recorded: false }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
