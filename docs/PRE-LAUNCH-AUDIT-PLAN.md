# Pre-Launch Audit — PRD & Execution Plan

**Status:** Awaiting go signal
**Owner:** Raul (decision-maker), Claude Code (executor)
**Estimated duration:** 4–6 hours of focused work, spread over 1–2 days with check-ins between phases.
**Final deliverable:** `docs/PRE-LAUNCH-AUDIT-REPORT-2026-05.md` with before/after data and recommended next steps.

---

## 1. Goal

Make yeschapter.com **objectively safer, faster, and more robust** before traffic scales — without breaking a single existing feature.

## 2. Non-Goals

- New features (anything not on the prior backlog stays off this audit)
- Visual redesign
- Refactoring for its own sake
- Stack migrations, framework upgrades, or database changes
- Marketing copy edits

## 3. Constraints (non-negotiable)

1. **Zero regression.** Every feature working today must work after every phase.
2. **No silent breaking changes.** Every fix lands as a clearly-named commit; every commit builds clean.
3. **No security loosening to make a test pass.** If a finding suggests "this endpoint is too strict," I document it and ask — never relax it unilaterally.
4. **No production data destruction.** Redis remains untouched. No DROP-equivalent commands. Test data is throwaway.
5. **No env var changes without explicit approval.** I can flag what to set, but you set it in Vercel.
6. **Branch hygiene.** Direct atomic commits to `master` (matches your existing pattern). Each commit message states the phase and what was changed.

## 4. Methodology

1. **Phase-based.** 14 phases run sequentially. Each phase has explicit entry + exit criteria.
2. **Baseline → diff → verify.** For every category: capture baseline data → make changes → re-test → compare → only then move on.
3. **Build between meaningful changes.** `npm run build` after every code edit that could affect compilation.
4. **At most one commit per phase.** Skipped if the phase was read-only.
5. **Status update between phases.** I'll surface findings to you and pause if anything material needs a decision.

## 5. Quality Gates (every phase must pass before moving on)

- `npm run build` exits clean
- Lighthouse delta is positive or neutral for the 5 key pages
- No new console errors introduced on any page tested
- Playwright walk-through of the three critical flows (pledge / support / contact) still completes end-to-end

## 6. Tools I'll Use

| Tool | What for |
|---|---|
| Bash (curl, openssl, dig, `npm audit`) | Direct probes against live site + dependency scan |
| Lighthouse CLI (`npx lighthouse`) | Performance, accessibility, SEO scores |
| Grep / Read | Code-level review |
| Playwright + bundled Chromium | Browser-based testing — DOM, console, network, viewport, JS execution, form flows |
| `security-review` skill | Diff review of any fixes I make |
| `simplify` skill | Code quality pass after fixes |

## 7. Phases

### Phase 0 — Baseline Capture *(read-only, ~15 min)*

**Goal:** Snapshot current state so we can prove improvement.

**Deliverables:**
- Screenshots of 10 key pages at 3 viewports (375×667, 768×1024, 1920×1080)
- Lighthouse scores (Perf / A11y / SEO / Best Practices) for: `/`, `/trail-map`, `/pledge`, `/support`, `/journal`, `/donors`, `/the-cause`, `/foundations`, `/transparency`, `/contact`
- Console error inventory across all public routes
- Network waterfall snapshot for the homepage
- Current `npm run build` output (bundle sizes per route)

**Exit:** All baseline data captured to local files. No code changes.

---

### Phase 1 — API Endpoint Authentication Audit *(read + small fixes, ~30 min)*

**Goal:** Every `/api/*` route either has correct auth or has a documented reason not to.

**Method:**
1. Read every file under `src/app/api/`
2. For each route, identify intended access tier: `public` / `magic-link` / `admin` / `cron`
3. Curl each endpoint without auth, confirm correct rejection (401 / 403 / 404)
4. Curl with wrong auth → confirm rejection
5. Flag anything returning 200 when it shouldn't

**Fixes (if needed):** Add missing `requireAdminAuth` / `requireCronAuth` checks. No new endpoints.

**Exit:** A documented table mapping every route → required auth tier → verified behavior.

---

### Phase 2 — Secrets, Headers, Cookies *(read + small fixes, ~20 min)*

**Goal:** No secret leaks. Production-correct security headers. Cookie flags hardened.

**Method:**
- Grep source + built JS (`.next/`) for token-shaped patterns: `sk_`, `pk_`, `AKIA`, `KV_REST_API_TOKEN`, hex strings of admin-token length
- Curl `https://yeschapter.com` and inspect response headers (`Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`)
- For every cookie the site sets, verify `HttpOnly` + `Secure` + `SameSite`

**Fixes (if needed):** Add missing headers (Next.js `headers()` config). Tighten cookie flags. Patch any leaked literal.

---

### Phase 3 — Webhook Signature Verification *(code review, ~15 min)*

**Goal:** Stripe + YouTube webhook endpoints reject forged requests.

**Method:**
- Read `src/app/api/webhooks/stripe/route.ts` and `src/app/api/webhooks/youtube/route.ts`
- Verify HMAC signature checking is present, constant-time, and rejects on mismatch before any side effects
- Test with malformed signature payload via curl

**Fixes (if needed):** Add or correct signature verification. Reject before parsing body.

---

### Phase 4 — Dependency Vulnerabilities *(~15 min)*

**Goal:** No High or Critical CVE in production deps.

**Method:** `npm audit` → categorize findings. Fix Critical/High. Document Low/Moderate.

**Exit:** All Critical/High either patched or documented with mitigation.

---

### Phase 5 — Email DNS *(read-only, ~10 min)*

**Goal:** SPF / DKIM / DMARC correctly configured for the sending domain (`dreamingforaliving.com` is the actual sender per `EMAIL_FROM`).

**Method:** `dig TXT dreamingforaliving.com`, `dig TXT default._domainkey.dreamingforaliving.com`, `dig TXT _dmarc.dreamingforaliving.com`.

**Note:** Read-only from my side. Any DNS changes need to be made by you in the registrar/Cloudflare. I'll produce the exact records to add if there are gaps.

---

### Phase 6 — Performance: Lighthouse + Bundle Analysis *(~30 min)*

**Goal:** Identify slow pages, oversized bundles, easy wins.

**Method:**
- `npx lighthouse https://yeschapter.com/{page} --only-categories=performance --form-factor=mobile` for each key page
- Inspect `npm run build` output for any route bundle > 200 KB
- Playwright network waterfall on the homepage — flag slow third-party calls
- Check that all `<img>` use Next.js `<Image>` for automatic optimization

**Fixes (if needed):** Convert raw `<img>` to `<Image>`. Lazy-load below-fold imports. Defer non-critical third-party scripts. Add `loading="lazy"` where applicable.

---

### Phase 7 — Accessibility *(~20 min)*

**Goal:** Lighthouse a11y >= 90 on key pages. Keyboard navigation works through critical flows.

**Method:**
- Lighthouse a11y audit per page
- Playwright keyboard-only navigation through pledge form + support form + contact form
- Color contrast spot-check on `--text-muted` text against `--bg-warm` background
- Verify all images have `alt` attributes

**Fixes (if needed):** Add missing `alt` text. Adjust low-contrast text colors. Add focus indicators where missing. Add `aria-label` to icon-only buttons.

---

### Phase 8 — Functional Flow Testing *(~30 min)*

**Goal:** End-to-end verification of critical user flows.

**Method (Playwright):**
- Homepage → click "Pledge per mile" → fill form → submit → verify confirmation screen
- Homepage → click "Buy Paul a meal" → support form → fill → reach Stripe checkout (don't complete payment)
- Footer → contact form → fill → submit → verify success state
- Magic-link request → enter email → verify success screen
- Journal navigation → open a post → return to listing
- Trail map → verify map renders, marker visible, sidebar interactive

**Exit:** Each flow either completes or fails with a documented finding.

---

### Phase 9 — Cross-Viewport Rendering *(~15 min)*

**Goal:** Every key page renders correctly at 5 viewport sizes.

**Method:** Playwright at 375×667 (iPhone SE), 390×844 (iPhone 13), 768×1024 (iPad), 1280×800 (laptop), 1920×1080 (desktop). Screenshot each. Visual review for layout breaks.

**Fixes (if needed):** Tailwind class adjustments where layout breaks. Should be small CSS-level patches only.

---

### Phase 10 — SEO *(~15 min)*

**Goal:** Every public page has unique title, meta description, Open Graph + Twitter Card tags. `sitemap.xml` lists all live pages. `robots.txt` blocks admin paths.

**Method:**
- Playwright DOM inspection: extract `<title>`, `<meta name="description">`, `og:*`, `twitter:*` per page
- Curl `/sitemap.xml` and verify it includes every live route, excludes admin
- Curl `/robots.txt` and verify admin routes are disallowed

**Fixes (if needed):** Add missing metadata via Next.js `generateMetadata` per page.

---

### Phase 11 — Known Outstanding Bugs *(~30 min)*

**Goal:** Close out the items we already know about.

1. **React #418 hydration error on `/admin`** — Playwright to reproduce, identify the offending component, patch.
2. **401 race on `/api/admin/settings`** during admin auto-login — sequence the fetch after token is available.
3. **Missing `last_sent` timestamps** on welcome / milestone / honor cron endpoints — add the `redis.set` calls so the admin Email Crons panel doesn't show "Never sent" forever.

---

### Phase 12 — Regression Sweep *(~20 min)*

**Goal:** Confirm none of the phases above broke anything.

**Method:**
- Re-run Phase 8 (functional flows)
- Re-run Phase 6 Lighthouse on the 5 key pages — verify scores match or improved baseline
- Re-run Phase 0 console-error capture — confirm no new errors
- Re-run `npm run build` — confirm clean

---

### Phase 13 — Final Deliverable *(~15 min)*

**Goal:** Produce the comprehensive audit report.

**Output:** `docs/PRE-LAUNCH-AUDIT-REPORT-2026-05.md` containing:
- Executive summary (TL;DR — what we found, what we fixed, what's left)
- Per-phase findings table (severity, file:line, fix status)
- Before/after Lighthouse scores
- Screenshot pairs showing visual diffs for any UI fix
- Outstanding items requiring user action (DNS, env vars, anything I can't do)
- Recommended cadence for re-running parts of this audit (monthly? quarterly?)

---

## 8. Decision Points (when I'll pause and ask you)

I'll work through each phase autonomously but will pause and explicitly ask before:
- Any 🔴 finding that needs more than a 5-line patch
- Any change touching authentication, OAuth, or webhook signature handling
- Any DNS or Vercel env var change recommendation
- If a Lighthouse improvement would require touching more than 5 files
- If any phase would push beyond its estimated time budget by 50%+

## 9. What's NOT covered (true limits)

These three categories cannot be fully verified from this terminal — I'll flag them in the final report so you know what's still owed:

1. **Real iOS Safari behavior** — Chromium ≠ WebKit. I can simulate mobile viewports but iOS-specific bugs need a real iPhone.
2. **Inbound email tests** — anything Mail-Tester-style needs an inbox to receive an email. I'll guide you through running these manually (~5 min total).
3. **True penetration testing** — I can run scripted attempts but I'm not a creative human red-teamer. For a high-stakes site I'd recommend hiring a pen-tester separately; the audit below is best-in-class for "no budget" but doesn't replace one.

## 10. Per-Phase Reporting Format

After each phase, I'll send you a structured update:

```
PHASE N — [Name]
Status: PASS / PASS-WITH-FIXES / BLOCKED / FAIL
Findings: [count by severity]
Fixes applied: [commit hashes]
Time taken: [actual vs estimated]
Notes / decisions for you: [if any]
```

## 11. Total Plan At-A-Glance

| Phase | Name | Time | Type |
|---|---|---|---|
| 0 | Baseline | 15 min | Read |
| 1 | API auth audit | 30 min | Read + fixes |
| 2 | Secrets / headers / cookies | 20 min | Read + fixes |
| 3 | Webhook signatures | 15 min | Read + fixes |
| 4 | Dependencies | 15 min | Read + fixes |
| 5 | Email DNS | 10 min | Read |
| 6 | Performance | 30 min | Read + fixes |
| 7 | Accessibility | 20 min | Read + fixes |
| 8 | Functional flows | 30 min | Read |
| 9 | Cross-viewport | 15 min | Read + small fixes |
| 10 | SEO | 15 min | Read + fixes |
| 11 | Known bugs | 30 min | Fixes |
| 12 | Regression sweep | 20 min | Read |
| 13 | Final report | 15 min | Write |
| | **TOTAL** | **~4 h 40 min** | |

---

## 12. Ready State

Before commencing I need:
1. **Your go signal** ("yes, start with Phase 0").
2. **Optional:** the `ADMIN_AUTH_TOKEN` value so I can test logged-in admin flows in Phase 8. If you'd rather not share it, I'll skip those parts and document.
3. **Confirmation that direct-to-master commits are fine** (matches your existing pattern). If you'd rather I work on a branch, say so and I'll use `audit/pre-launch-2026-05`.

That's it.
