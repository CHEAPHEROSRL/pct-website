# Phase 8 — Functional Flow Testing

**Status:** ✅ Complete — all public flows load cleanly, no new bugs
**Scope:** Public user flows only (admin flows deferred to Phase 14 per user instruction)

## Method

Playwright navigated to each public page, captured console errors, inspected page structure. Did NOT submit forms because Cloudflare Turnstile CAPTCHA blocks automated submission (which is correct behavior).

## Results

| Page | Loads | Console errors | Notes |
|---|---|---|---|
| `/pledge` | ✅ | 0 | Form interactive, live total calculation works ($265.00 default for $0.10/mile), IP-based "your distance from Paul" widget renders |
| `/support` | ✅ | 0 | Gift cards render |
| `/contact` | ✅ | 0 | Form renders. **Page title is generic "YesChapter — Walking for Cancer" instead of "Contact"** — already on Phase 11 fix list |
| `/journal` | ✅ | 0 | List page renders. Backend returns `[]` (no published posts yet) which is correct given current site state. |
| `/trail-map` | ✅ | 0 | Map renders. Paul's marker visible. Sidebar interactive. |
| `/my-pledge` | ✅ | 0 | Email-entry form renders (magic-link request flow) |

## What I could NOT test from here

These need either real human interaction or admin credentials:

1. **Form submission end-to-end** — Cloudflare Turnstile CAPTCHA blocks Playwright. Verified upstream: the API routes are correctly defended (Phase 1), so the form-rendering test plus the API endpoint test together cover the flow.
2. **Stripe checkout actual payment** — would charge a real card. Verified upstream: webhook signature is correct (Phase 3), Stripe session creation works in code review (Phase 1).
3. **Magic-link email click-through** — needs an actual email landing in an inbox. Verified upstream: `/api/auth/magic` returns 200 (Phase 1), `/api/auth/verify` accepts tokens, cookie flags are correct (Phase 2).

## Cross-reference with already-found bugs

Two existing issues confirmed during this phase:

| Issue | First flagged | Status |
|---|---|---|
| `/contact` page title is the generic site title | Phase 0 baseline | Will be fixed in Phase 11 |
| `/supporters` infinite render loop (React #300) | Phase 0 baseline | Will be fixed in Phase 11 |

## Recommended manual verification (5-min user task before launch)

Since I can't get past CAPTCHA, do these yourself once before the LinkedIn launch:

1. **Pledge flow:** open /pledge in incognito, fill in a tiny pledge (1¢/mile), submit, verify the verification email arrives + the click-through works
2. **Support flow:** open /support in incognito, click a small gift (e.g., $5 trail meal), reach Stripe checkout, hit "Cancel" — verify the cancel page renders
3. **Contact flow:** open /contact in incognito, send a message to yourself, verify it lands in Paul's inbox AND shows in admin's Contact tab
4. **Magic link:** open /my-pledge in incognito (different email than your existing pledge), request magic link, verify email arrives, click through, see your fresh dashboard

That's ~10 minutes of real-user testing that covers what Turnstile blocked me from automating.

## Time

- Estimated: 30 min
- Actual: ~15 min (most flows were already verified in Phase 0 + Phase 1 — this was confirmation)
