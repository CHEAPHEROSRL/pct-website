# Stripe Setup Guide — YesChapter Trail Support

## Overview
Stripe is used exclusively for **trail support gifts** (meals, boots, hostel nights, etc.) sent directly to Paul.
Pledges for cancer foundations do NOT go through Stripe.

---

## Step 1 — Get your Stripe test keys

1. Go to https://dashboard.stripe.com → make sure the toggle says **Test mode**
2. Click **Developers** → **API keys**
3. Copy:
   - **Secret key** — starts with `sk_test_...` ← required for the backend
   - (Publishable key `pk_test_...` — save for reference, not used server-side)

---

## Step 2 — Create `.env.local`

Create `.env.local` in the project root (`c:\Users\User\Documents\pct-website\`):

```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

> `.env.local` is gitignored — never commit real keys.

---

## Step 3 — Set up the Stripe webhook

### Option A — Local testing with Stripe CLI
1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook signing secret printed in the terminal → paste as `STRIPE_WEBHOOK_SECRET`
4. Run `npm run dev` and test a payment

### Option B — Live Vercel webhook (for production)
1. Stripe dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://yeschapter.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET`

---

## Step 4 — Add env vars to Vercel

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
3. Redeploy for changes to take effect

---

## Step 5 — Switch to live keys (when ready)

1. In Stripe dashboard, turn **Test mode OFF**
2. Get live keys (`sk_live_...`)
3. Create a new live webhook endpoint for `https://yeschapter.com/api/webhooks/stripe`
4. Update both env vars in Vercel with the live values
5. Redeploy

---

## Key files
- `src/app/api/support/route.ts` — Creates Stripe checkout sessions
- `src/app/api/webhooks/stripe/route.ts` — Handles Stripe webhook events
- `src/lib/stripe.ts` — Stripe client initialisation
- `src/app/support/page.tsx` — Support page with gift cards
- `src/app/support/success/page.tsx` — Post-payment thank you page
- `src/app/support/cancelled/page.tsx` — Cancelled payment page

## Test card numbers
- Success: `4242 4242 4242 4242` (any future date, any CVC)
- Declined: `4000 0000 0000 0002`
