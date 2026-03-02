# Stripe Donation Setup — Step-by-Step Guide

A step-by-step guide to connecting Stripe so the PCT website can accept real donations.

---

## Table of Contents

1. [Create a Stripe Account](#step-1-create-a-stripe-account)
2. [Get Your API Keys](#step-2-get-your-api-keys)
3. [Create a Webhook Endpoint](#step-3-create-a-webhook-endpoint)
4. [Add Environment Variables to Vercel](#step-4-add-environment-variables-to-vercel)
5. [Redeploy the Site](#step-5-redeploy-the-site)
6. [Test with a Fake Card](#step-6-test-with-a-fake-card)
7. [Go Live with Real Payments](#step-7-go-live-with-real-payments)
8. [Custom Domain Notes](#step-8-custom-domain-notes)
9. [Troubleshooting](#troubleshooting)

---

## Step 1: Create a Stripe Account

1. Go to **https://dashboard.stripe.com/register**
2. Enter your email, full name, and a password
3. Verify your email address
4. You'll land on the Stripe Dashboard — you're now in **test mode** (orange "Test mode" badge in the top bar)

You do NOT need to complete identity verification yet. Test mode works immediately.

---

## Step 2: Get Your API Keys

1. In the Stripe Dashboard, click **"Developers"** in the top navigation
2. Click **"API keys"** in the left sidebar
3. You'll see two keys:
   - **Publishable key**: starts with `pk_test_...` (we don't need this one)
   - **Secret key**: starts with `sk_test_...` — click **"Reveal test key"** to see it
4. **Copy the Secret key** and save it somewhere safe (you'll need it in Step 4)

> **Important**: Never share the Secret key publicly. It allows full access to your Stripe account.

---

## Step 3: Create a Webhook Endpoint

The webhook tells our website when a payment is completed, so we can record the donation.

1. In the Stripe Dashboard, click **"Developers"** in the top navigation
2. Click **"Webhooks"** in the left sidebar
3. Click **"Add endpoint"**
4. Fill in:
   - **Endpoint URL**: `https://pct-website-iota.vercel.app/api/webhooks/stripe`
     - If using a custom domain: `https://paulbarry.com/api/webhooks/stripe`
   - **Description** (optional): "PCT Website donation webhook"
5. Under **"Select events to listen to"**, click **"Select events"**
6. Search for `checkout.session.completed` and check the box
7. Click **"Add events"**
8. Click **"Add endpoint"**

Now you need the signing secret:

9. On the webhook endpoint page, find **"Signing secret"**
10. Click **"Reveal"** to see it — it starts with `whsec_...`
11. **Copy this signing secret** (you'll need it in Step 4)

---

## Step 4: Add Environment Variables to Vercel

1. Go to the **Vercel Dashboard** → your `pct-website` project
2. Click **"Settings"** tab → **"Environment Variables"** in the left sidebar
3. Add two new variables:

| Name | Value | Environments |
|------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (from Step 2) | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Step 3) | Production, Preview, Development |

4. Click **"Save"** for each one

You should now have these environment variables in total:
- `KV_REST_API_URL` (from Redis setup)
- `KV_REST_API_TOKEN` (from Redis setup)
- `TRACKER_AUTH_TOKEN` (from GPS tracker setup)
- `HIKE_START_DATE` (from GPS tracker setup)
- `STRIPE_SECRET_KEY` (just added)
- `STRIPE_WEBHOOK_SECRET` (just added)

---

## Step 5: Redeploy the Site

The new environment variables only take effect after a redeploy.

1. Go to the **"Deployments"** tab in your Vercel project
2. Find the latest deployment
3. Click the **three dots** (⋮) menu on the right
4. Click **"Redeploy"**
5. Wait for the deployment to finish (about 1 minute)

---

## Step 6: Test with a Fake Card

Now let's verify everything works end-to-end.

### Make a Test Donation

1. Open **https://pct-website-iota.vercel.app/donate**
2. Select an amount (e.g., $50)
3. Fill in:
   - First Name: `Test`
   - Last Name: `Donor`
   - Email: your real email (Stripe sends a test receipt)
4. Click **"DONATE $50"**
5. You'll be redirected to Stripe's checkout page
6. Use this **test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date (e.g., `12/30`)
   - CVC: any 3 digits (e.g., `123`)
   - ZIP: any 5 digits (e.g., `10001`)
7. Click **"Pay"**
8. You should be redirected to the **Thank You** page

### Verify the Donation Was Recorded

1. Open **https://pct-website-iota.vercel.app/donors**
2. Your test donation should appear in the donor list (may take up to 30 seconds)
3. In the Stripe Dashboard, go to **"Payments"** — you should see the test payment

### Other Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 3220` | Requires 3D Secure authentication |

---

## Step 7: Go Live with Real Payments

When you're ready to accept real money:

1. In the Stripe Dashboard, click **"Activate your account"** or go to **Settings → Account details**
2. Complete identity verification:
   - Business information (individual/sole proprietor is fine)
   - Personal details
   - Bank account for payouts
3. Once activated, go to **Developers → API keys**
4. Toggle off **"Test mode"** (or switch to the live view)
5. Copy the **live Secret key** (starts with `sk_live_...`)
6. Create a **new webhook** for the live environment:
   - Same URL: `https://your-domain.com/api/webhooks/stripe`
   - Same event: `checkout.session.completed`
   - Copy the new signing secret
7. Update the environment variables in Vercel:
   - Replace `STRIPE_SECRET_KEY` with the live key (`sk_live_...`)
   - Replace `STRIPE_WEBHOOK_SECRET` with the new live signing secret
8. Redeploy

> **Tip**: You can test everything thoroughly in test mode first. Only switch to live keys when you're confident everything works.

---

## Step 8: Custom Domain Notes

If you move the site to a custom domain like `paulbarry.com`:

1. The donate flow works automatically — it uses relative URLs
2. **Update the webhook endpoint** in Stripe Dashboard:
   - Go to Developers → Webhooks
   - Edit the endpoint URL from `https://pct-website-iota.vercel.app/api/webhooks/stripe` to `https://paulbarry.com/api/webhooks/stripe`
   - Or create a new endpoint and delete the old one
3. No code changes needed
4. The same `STRIPE_SECRET_KEY` and Redis store work regardless of domain

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Payment processing not configured" | Missing `STRIPE_SECRET_KEY` | Add the env var in Vercel and redeploy |
| Redirected to Stripe but get an error | Invalid Secret key | Double-check the key starts with `sk_test_` or `sk_live_` |
| Payment succeeds but donor doesn't appear | Webhook not firing | Check Stripe Dashboard → Developers → Webhooks → click your endpoint → check "Attempts" for errors |
| Webhook shows "signature verification failed" | Wrong `STRIPE_WEBHOOK_SECRET` | Re-copy the signing secret from the webhook endpoint page |
| Webhook shows 503 error | Redis not configured | Make sure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set |
| Donations show on donors page but stats are wrong | Redis data out of sync | This self-corrects as new donations come in |
| Old hardcoded donors still showing | No real donations yet | The fallback data shows until at least one real donation is processed |

### Checking Webhook Delivery

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your endpoint
3. Click **"Attempts"** tab
4. You can see every webhook attempt, whether it succeeded or failed, and the response body

### Checking Redis Data

You can verify donor data is stored by calling the API directly:
```
https://pct-website-iota.vercel.app/api/donors
```
This returns JSON with the current donors list and stats.

---

## How the Payment Flow Works

```
1. User fills out the donate form on the website
2. Clicks "DONATE" → website calls POST /api/donate
3. Our server creates a Stripe Checkout Session
4. User is redirected to Stripe's hosted payment page
5. User enters card details and pays
6. Stripe redirects user back to /donate/success (thank you page)
7. Stripe sends a webhook to POST /api/webhooks/stripe
8. Our server verifies the webhook signature
9. Donation is stored in Redis (donor name, amount, message, etc.)
10. The /donors page and donate sidebar show the new donation
```

All card data is handled by Stripe — it never touches our server. This means zero PCI compliance burden.
