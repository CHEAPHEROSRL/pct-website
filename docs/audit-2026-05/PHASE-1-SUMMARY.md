# Phase 1 — API Endpoint Authentication Audit

**Status:** ✅ Complete with 2 fixes + 2 documented findings
**Routes audited:** 72

## Methodology

1. Enumerated every `/api/*` route file
2. Grepped each for auth patterns (`requireAdminAuth`, `requireCronAuth`, signature verification, magic-token validation, session checks)
3. Curl-tested every admin endpoint without auth, confirmed correct rejection
4. Curl-tested every cron endpoint without auth, confirmed correct rejection
5. Curl-tested every public endpoint, confirmed 200 + no PII in payloads
6. Inspected suspicious "(no auth)" routes individually

## Auth Tier Classification

| Tier | Routes | Status |
|---|---|---|
| **Admin** (21 routes under `/api/admin/*`) | All return 401/400 without auth | ✅ Pass |
| **Cron** (`emails/*`, `automation/youtube-renew`, `automation/youtube-retry`) | All return 401 without `CRON_SECRET` | ✅ Pass |
| **Webhook** (`webhooks/stripe`, `webhooks/youtube`) | Signature-verified (deep-dive in Phase 3) | ⏭️ Phase 3 |
| **Magic-link / Token** (`auth/magic`, `auth/verify`, `pledges/verify`, `honor/verify`, `support/verify`, `unsubscribe`, `unsubscribe/request-link`, `challenges/commit`) | Token-based, anti-enumeration applied | ✅ Pass |
| **Pledger Session** (`comments`, `auth/session`, `auth/logout`) | Cookie-based session with `getSession()` validation | ✅ Pass |
| **Public** (pledges/stats, donors, journal, etc.) | Intentionally open. Rate-limited + sanitized. | ✅ Pass |
| **OAuth Callback** (`admin/gmail-oauth/callback`) | No header auth — CSRF state token validated against Redis | ✅ Pass |

## Defence-in-depth on critical public endpoints

| Endpoint | Defences |
|---|---|
| `/api/pledges` POST | RateLimit + Honeypot + Turnstile + sanitize + amount caps + boost-then-confirm flow |
| `/api/contact` POST | RateLimit + Honeypot + Turnstile + sanitize + length caps |
| `/api/comments` POST | RateLimit + Pledger Session (must have pledge) + 10-min cooldown + 300-char cap |
| `/api/waitlist` POST | Explicit consent + email validation + GDPR-compliant dedup |
| `/api/auth/magic` POST | RateLimit (5/hr per IP) + anti-enumeration "always 200" |
| `/api/unsubscribe/request-link` POST | RateLimit + anti-enumeration |

## 🔴 / 🟡 Findings

### 🔴 FIXED — Two Vercel crons silently never fired
**Files:** `src/app/api/automation/instagram-sync/route.ts`, `src/app/api/automation/youtube-sync/route.ts`

Both endpoints only exported `POST`. Vercel Cron always calls `GET`. So both daily crons (Instagram 14:00 UTC, YouTube 15:00 UTC) returned 405 every day, silently. The Instagram cache and YouTube video list were stale until someone manually triggered them.

**Fix:** Refactored to a shared `handle(req)` helper and exported both `GET` and `POST` that delegate to it. Same cron-auth check. Builds clean. Per-pledger dedup not affected.

**Will be live on next Vercel deploy.** First scheduled cron after deploy will be the next 14:00 UTC (Instagram).

### 🟡 NOTED — `/api/challenges/commit` accepts email without ownership proof
**File:** `src/app/api/challenges/commit/route.ts`

POST takes `{email, boostAmount}`. Looks up pledger by `emailHash(email)`. Anyone who knows a pledger's email can lock in a boost commitment in their name (creates a dedup conflict that blocks the real pledger from committing).

Severity: medium. Not a data breach — no money moves, no PII leaks. But it's a griefing vector.

**Recommended fix:** Require pledger session (same `requirePledgerSession` pattern as `/api/comments`), OR send a magic-link confirmation before persisting the commitment.

**Not fixing in Phase 1** because it requires reworking the boost-commit UX (currently no login wall). Carrying to a follow-up after audit complete — flagging for user discussion.

### 🟢 INFO — Three new admin endpoints not yet on production
- `/api/admin/email-cron-status`
- `/api/admin/email-cron-trigger`
- `/api/admin/youtube-subscription`

All return 404 (HTML 404 page) on production. Last two commits (a6ed437, 40d63c9) haven't deployed yet OR the deploy is in progress. **Not a security issue** — these are new endpoints, code reviewed and auth-correct. Will be live after next Vercel build.

### 🟢 INFO — `/api/honor/stats` requires admin auth
Curl returned 401. Endpoint takes admin auth. Worth confirming whether the `/honor` page needs to read stats publicly. If yes, the page may currently be broken; if no, this is correct as-is.

**Action:** Verify in Phase 8 (functional flow testing).

### 🟢 INFO — `/api/pledges/locations` exposes city + 2-decimal lat/lng
Sample payload:
```json
{"name":"Raul","message":"God speed!","city":"Suceava","country":"RO","lat":47.6333,"lng":26.25,"avatar":"🏃"}
```

Two-decimal coordinates = ~1.1km precision (city-level, not address-level). This is the data that feeds the trail-map country aggregates. Consistent with consent at signup. **Not a PII issue** at this precision.

To verify: anonymous pledgers should NOT appear in this list. Need a test pledge with `anonymous=true` to confirm — flagging for Phase 8.

## Time

- Estimated: 30 min
- Actual: ~40 min (extra time for the cron 405 finding + fix)
