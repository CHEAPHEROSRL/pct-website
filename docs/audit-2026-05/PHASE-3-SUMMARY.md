# Phase 3 — Webhook Signature Verification

**Status:** ✅ Complete — 1 endpoint perfect, 1 endpoint has 2 documented (low-severity) findings

## 1. Stripe webhook — `/api/webhooks/stripe`

✅ **Textbook-correct implementation.** Specifically:

| Check | Status |
|---|---|
| Raw body via `request.text()` (not `.json()`) before signature check | ✅ |
| `stripe-signature` header presence verified | ✅ |
| `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET` | ✅ |
| Signature failures return 400 BEFORE processing | ✅ |
| Idempotency via `event.id` (Stripe's recommendation) | ✅ |
| Idempotency marker uses NX + 30-day TTL | ✅ |
| Marker skipped for unpaid events (handles async payment) | ✅ |

**No changes needed.**

## 2. YouTube PubSubHubbub webhook — `/api/webhooks/youtube`

### ✅ GET (verification challenge)

Validates `hub.verify_token` against `YOUTUBE_WEBHOOK_SECRET` — but only if the secret is configured.

### ⚠️ FINDING 1: GET fails OPEN when `YOUTUBE_WEBHOOK_SECRET` is unset

```ts
if (expectedToken && verifyToken !== expectedToken) {
  return new NextResponse("Forbidden", { status: 403 });
}
```

When `expectedToken` is falsy (env var unset), ANY `verify_token` (including empty) passes — meaning anyone can subscribe arbitrary channels to this webhook URL.

**Severity:** 🟡 Low — even if a hostile party subscribes a different channel, the POST handler (next section) filters by channel ID and rejects everything that isn't Paul's channel.

**Status of fix:** Becomes a non-issue once Raul finishes adding `YOUTUBE_WEBHOOK_SECRET` to Vercel (that step is in his current task list). After that, this finding closes itself.

**Optional hardening:** Could be made fail-CLOSED in production (`if (!expectedToken) return 503`). Not doing now because Raul is mid-setup and a fail-closed change would brick the in-progress subscribe flow until he finishes setting the env var. Worth revisiting after the secret is live.

### ⚠️ FINDING 2: POST does not verify the `X-Hub-Signature` header

PubSubHubbub specifies that publishers (Google in this case) sign every notification with HMAC-SHA1 (or SHA256) of the body using the subscription secret, in the `X-Hub-Signature` header. The current POST handler does NOT verify this header.

**What protects the endpoint instead:**
- Channel-ID check (line 95): `if (expectedChannel && videoInfo.channelId !== expectedChannel) return 200 "Not our channel"`
- Idempotency via `yt:processed:<videoId>` key
- All AI-generated posts saved as `published: false` (drafts), never auto-published

**Severity:** 🟡 Low — worst case an attacker who knows the public channel ID could POST forged XML payloads to inject draft posts into Paul's admin queue. The drafts are not visible to visitors and Paul reviews before publishing. Mild griefing potential, not a data breach.

**Optional hardening (recommended for after the secret is live):**
1. Read `X-Hub-Signature` from request headers
2. Compute `HMAC-SHA1(YOUTUBE_WEBHOOK_SECRET, raw_body)` and compare via `constantTimeEqual`
3. Reject on mismatch

This is a ~15-line patch but I'm flagging only (not patching now) because:
- Risk is low (drafts only, no payment, no PII)
- Requires the secret to be live first
- Needs verification post-deploy that Google's signing format matches what we expect (sha1 vs sha256)

### ✅ POST defense in depth (what's already there)

| Layer | Status |
|---|---|
| Channel-ID filter — rejects videos from other channels | ✅ |
| Idempotency on videoId — prevents double-generation on Google's retries | ✅ |
| All generated posts marked `published: false` — drafts, not auto-live | ✅ |
| No transcript = queue for retry (no spam loop) | ✅ |

## Carry forward to final report

Both YouTube findings are documented in the final audit report as **post-secret-setup hardening tasks**:
1. Make GET fail-closed when `YOUTUBE_WEBHOOK_SECRET` is unset in production
2. Add `X-Hub-Signature` HMAC verification on POST

Both can be implemented together as a single follow-up commit once the secret is in env. Estimated effort: 20 min code + testing.

## Time

- Estimated: 15 min
- Actual: ~15 min
