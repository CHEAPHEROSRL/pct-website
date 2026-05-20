# Phase 2 — Secrets / Headers / Cookies

**Status:** ✅ Complete — 1 fix applied (security headers added)

## 1. Secrets in source / client bundle

**Method:** grep for `sk-`, `sk_test_`, `sk_live_`, `AKIA`, `AIza`, long hex strings, Upstash URLs, Vercel KV token prefixes — across both `src/` and the built `.next/static/` chunks.

**Result:** ✅ Clean.
- Two matches for `sk-` in `src/app/admin/page.tsx` were `placeholder="sk-..."` and `placeholder="sk-ant-..."` — input field placeholders, not real keys.
- Zero matches in built chunks for real Stripe / OpenAI / Anthropic / Google / Upstash patterns.

## 2. Security headers on production

**Before:**
- ✅ `Strict-Transport-Security: max-age=63072000` (HSTS, 2-year, from Vercel)
- ❌ Missing `X-Frame-Options`
- ❌ Missing `X-Content-Type-Options`
- ❌ Missing `Referrer-Policy`
- ❌ Missing `Permissions-Policy`
- ❌ Missing `Content-Security-Policy`

**After patch (in `next.config.ts`):**
- `X-Frame-Options: SAMEORIGIN` — blocks external iframe embedding (clickjacking), allows admin's own email-preview iframes
- `X-Content-Type-Options: nosniff` — stops MIME-sniff attacks
- `Referrer-Policy: strict-origin-when-cross-origin` — prevents leaking full URLs across origins
- `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), geolocation=(self), fullscreen=(self)` — disables sensors the site doesn't use; keeps geolocation for /tracker page and fullscreen for trail-map zoom

**Content-Security-Policy: NOT YET APPLIED.** Reasoning:
- Next.js inlines bootstrap scripts. CSP without `unsafe-inline` for scripts breaks Next entirely.
- CSP with `unsafe-inline` is largely cosmetic (still allows XSS via inline injection).
- Doing CSP correctly requires per-request nonces — a deeper refactor.
- Recommended approach: Phase-14-style follow-up. Roll out CSP report-only first, watch the report endpoint for a week, then promote to enforced once we know nothing breaks. **Out of scope for this audit; flagged in final report.**

## 3. Cookie hardening

Every cookie set by the site uses correct flags:

| Cookie | Set by | HttpOnly | Secure (prod) | SameSite | Path |
|---|---|---|---|---|---|
| `pct-admin-session` | `admin/auth`, `admin/login`, `admin/refresh-cookie` | ✅ | ✅ | `lax` | `/` |
| `site-auth` | `auth/site-login` | ✅ | ✅ | `lax` | `/` |
| Pledger session (SESSION_COOKIE) | `auth/verify`, `pledges/verify`, `auth/logout` (via `sessionCookieOptions()` in `src/lib/auth.ts`) | ✅ | ✅ | `lax` | `/` |

`SameSite=lax` is deliberately chosen (not `strict`) — documented in code comments because magic-link verification involves a cross-site top-level navigation (email-client → site), which `strict` would break. `lax` still blocks cross-site POST/PUT/DELETE, which is the actual CSRF attack surface.

## 4. Other findings worth flagging

- `Server: Vercel` is leaked in every response. Minor info-disclosure, low severity. Not changing — Vercel doesn't expose this as configurable, and the disclosure cost is negligible.
- `X-Powered-By` is correctly absent (Next.js typically suppresses this).

## After-deploy verification

After Vercel picks up the next push, run:
```
curl -sI https://www.yeschapter.com/ | grep -iE "x-frame|x-content|referrer|permissions"
```
…and confirm all four headers are present.

## Time

- Estimated: 20 min
- Actual: ~25 min
