# YesChapter — Pre-Launch Audit Report

**Date:** 2026-05-20
**Auditor:** Claude (Opus 4.7, 1M context) at Raul's direction
**Scope:** Full 14-phase pre-launch audit per [PRE-LAUNCH-AUDIT-PLAN.md](../PRE-LAUNCH-AUDIT-PLAN.md)
**Site:** https://www.yeschapter.com — Next.js 16 / TypeScript / Tailwind v4 / Leaflet
**Total time:** ~4-5 hours of focused work across one working session

---

## TL;DR

**The site is in good shape for launch.** No critical security holes, no exposed secrets, all admin/cron endpoints correctly auth-gated, all webhooks signature-verified, all cookies hardened. Real bugs found were two app-breaking issues (a React infinite-render loop on `/supporters` and two Vercel crons that silently never ran) — both fixed.

13 of 14 phases complete. The 14th (admin flow testing) needs you to share the new `ADMIN_AUTH_TOKEN`.

### What got materially better
- 🔴 **Two Vercel crons were silently never firing** — `instagram-sync` and `youtube-sync` only exported POST handlers but Vercel Cron calls GET. Fixed.
- 🔴 **`/supporters` had a React #300 infinite-render loop** that spammed the console and stressed the browser. Root cause: Rules-of-Hooks violation. Fixed.
- 🔴 **Four high-severity Next.js CVEs** (middleware auth bypass + cache poisoning) closed by `npm audit fix --force` bumping next.js 16.1.6 → 16.2.6.
- 🟡 Three more high-severity dependency CVEs (picomatch x2, protocol-buffers-schema) closed.
- 🟡 Five missing security response headers added (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — HSTS was already there).
- 🟡 ADMIN_AUTH_TOKEN rotated (and APIFY token, by user action). Old tokens in git history are now dead.
- 🟡 Footer text contrast fixed (was 3.04 ratio, now 9.2 — WCAG AA pass).
- 🟢 `/contact` and `/foundations` page titles fixed.
- 🟢 Added `public/llms.txt` so AI assistants describe the project accurately (especially the dual funding model).
- 🟢 Per-cron `last_sent` timestamps now recorded by welcome / milestone / honor (was only weekly).
- 🟢 401 race during admin auto-login fixed.

### What's outstanding (user action items)
See [Action items for Raul](#action-items-for-raul) section below.

### What was deliberately deferred
See [Deferred items](#deferred-items-with-reasons) section below.

---

## Findings by category

### 🔐 Security

| Area | Status |
|---|---|
| API endpoint authentication | ✅ All 72 routes correctly tiered (admin / cron / webhook / token / public). All admin/cron endpoints reject unauth requests. |
| Secrets in source | ✅ No hardcoded secrets in source or `.next/static` build output. |
| Security headers | ✅ Added X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy. HSTS already present. CSP deferred (rollout requires nonces). |
| Cookies | ✅ Every cookie uses HttpOnly + Secure-in-prod + SameSite=lax + Path=/. lax is deliberate for magic-link cross-site navigations. |
| Webhook signature verification | ✅ Stripe: textbook-correct. YouTube: 2 documented low-severity follow-ups (GET fail-open + missing X-Hub-Signature). |
| Dependency vulnerabilities | ✅ 7 of 9 CVEs fixed. 2 moderate postcss CVEs remain — non-exploitable in this app; the suggested "fix" would downgrade Next.js to v9. |
| Token rotation | ✅ ADMIN_AUTH_TOKEN rotated and verified. APIFY token rotated by user. Upstash KV REST token skipped (Marketplace integration locks rotation; risk contained). |

### ⚡ Performance

| Area | Status |
|---|---|
| Baseline Lighthouse (mobile) | Performance 73-83, A11y 93-98, Best Practices 96-100, SEO 100 |
| LCP | Weak across all pages (3.8s-6.8s). Worst on `/trail-map` (Leaflet inherent cost). |
| CLS | Excellent (<0.07 everywhere). |
| Top opportunity | **Apex→www redirect costs ~784ms** on every cold visit. User action — Vercel domain config. |
| Bundle size | 1MB shared chunk — typical for React 19 + Tailwind + Leaflet + Stripe stack. No quick wins. |

### ♿ Accessibility

| Area | Status |
|---|---|
| Lighthouse a11y scores | ✅ All pages at 93-98. Fixed Footer contrast issue should push to 95-100. |
| Color contrast | ✅ Footer fixed (was 3.04 ratio, now ~9.2). All other text passed. |
| Missing `<main>` landmark | 🟡 Documented. Per-page fix (one-char change per page). Defer to focused PR. |
| Keyboard navigation | ⏭️ Manual user check needed for nuances Lighthouse can't simulate. |

### 📧 Email DNS

| Domain | SPF | DKIM | DMARC |
|---|---|---|---|
| dreamingforaliving.com (actual sender) | ✅ | ❌ MISSING | ❌ MISSING |
| yeschapter.com (brand domain) | ✅ | ❌ MISSING | ❌ MISSING |

**Action item:** Enable DKIM in Google Admin for dreamingforaliving.com + publish the generated TXT record. Add DMARC TXT records to both domains. ~20 min total. Detailed walkthrough in [PHASE-5-SUMMARY.md](PHASE-5-SUMMARY.md).

### 🔍 SEO

| Area | Status |
|---|---|
| robots.txt | ✅ Correctly blocks admin/api/auth/success/cancelled |
| sitemap.xml | ✅ Lists all public pages with priorities |
| Per-page title + description | ✅ All 10 pages have unique metadata (2 broken pages fixed) |
| Open Graph + Twitter Cards | ✅ Full set on every page |
| OG image | ✅ Exists at `/og-image.jpg` (59 KB) |
| llms.txt | ✅ Added — explicitly explains dual funding model to AI agents |

### 🧪 Functional flows

All 6 public flows render cleanly with no console errors:
- `/pledge` (form interactive, live total calc)
- `/support` (gift cards)
- `/contact` (form renders, title fixed)
- `/journal` (list page; empty list = correct given current state)
- `/trail-map` (Leaflet renders, Paul's marker visible)
- `/my-pledge` (magic-link request form)

Full form submission flows blocked by Cloudflare Turnstile (correctly) — manual verification by user covers what Playwright can't.

---

## Bugs fixed this session

| # | Severity | Bug | Fix commit |
|---|---|---|---|
| 1 | 🔴 | Two Vercel crons (instagram-sync + youtube-sync) silently never fired — only exported POST, Vercel Cron calls GET | `e177307` |
| 2 | 🔴 | React #300 infinite render loop on `/supporters` — useMemo after early conditional return | `a627ebc` |
| 3 | 🔴 | Four high-severity Next.js CVEs (middleware bypass, cache poisoning) | `37344a1` |
| 4 | 🟡 | Three more high-severity dep CVEs (picomatch x2, protocol-buffers-schema) | `37344a1` |
| 5 | 🟡 | Missing security headers (X-Frame-Options, X-Content-Type, Referrer-Policy, Permissions-Policy) | `37344a1` |
| 6 | 🟡 | Footer text contrast 3.04 → 9.2 | `a627ebc` |
| 7 | 🟡 | 401 race on `/api/admin/settings` during admin auto-login | `a627ebc` |
| 8 | 🟢 | `/contact` page title was generic — added server-component layout.tsx | `a627ebc` |
| 9 | 🟢 | `/foundations` title had double "YesChapter" suffix | `a627ebc` |
| 10 | 🟢 | Three of 4 email crons never recorded `last_sent` timestamp | `a627ebc` |
| 11 | 🟢 | Added `public/llms.txt` for AI agent context | `a627ebc` |
| 12 | 🟢 | `.claude/settings.local.json` was tracked in git (contained tokens) — untracked + gitignored | `793b75b` |

---

## Action items for Raul

These need YOU because they involve DNS, Vercel config, or external services I can't reach.

### 🔴 Critical (do before serious traffic / LinkedIn launch)

1. **Enable DKIM for dreamingforaliving.com in Google Workspace Admin**
   - https://admin.google.com → Apps → Google Workspace → Gmail → Authenticate email
   - Generate, then publish the TXT record at DNS host
   - Verify with `nslookup -type=TXT google._domainkey.dreamingforaliving.com 8.8.8.8`

2. **Add DMARC TXT records** to BOTH `dreamingforaliving.com` AND `yeschapter.com`
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:paul@dreamingforaliving.com; pct=100`
   - Start with `p=none` (monitor only). Tighten to `p=quarantine` after a week of reports.

3. **Verify live deploy reflects the audit fixes** once Vercel build completes. Run the [verification commands in PHASE-12-SUMMARY.md](PHASE-12-SUMMARY.md). Key checks:
   - `curl -sI https://www.yeschapter.com/llms.txt` returns 200
   - `curl -sI https://www.yeschapter.com/` shows new X-Frame-Options etc
   - Open `/supporters` in browser, check no React #300 in console

### 🟡 High-value (worth doing this week)

4. **Vercel apex → www domain config** — make `yeschapter.com` (apex) primary, OR keep `www` and accept the 784ms redirect penalty. Detail in [PHASE-6-SUMMARY.md](PHASE-6-SUMMARY.md).

5. **Manual mobile testing on real iPhone** — 5 flows (pledge, support, contact, magic link, trail map zoom). Covers iOS Safari quirks Chromium can't simulate.

6. **Test email pipeline end-to-end** by submitting a tiny test pledge from ciocanraul@gmail.com → verify verification email arrives → click → reach dashboard.

### 🟢 Nice-to-have (this month)

7. **Save GitHub 2FA recovery codes** somewhere offline (https://github.com/settings/auth/recovery-codes).

8. **Add `<main>` landmark** to each page (one-char change per page, ~30 min focused PR).

9. **Roll out Content-Security-Policy** in report-only mode first. Requires nonces — touches Next.js's bootstrap. ~1-2 hour focused work.

10. **Eventually rotate the Upstash KV REST token** — only matters if you add collaborators or make the repo public. The current accepted residual risk holds as long as you stay solo + private.

---

## Deferred items (with reasons)

| Item | Why deferred | When to revisit |
|---|---|---|
| React #418 hydration error on `/admin` | Cosmetic; couldn't pinpoint exact element without un-minified React dev mode | When admin gets new features (you'll notice during dev) |
| Content-Security-Policy header | Requires per-request nonces — Next.js bootstrap inlines scripts; without nonces, `unsafe-inline` is cosmetic | After launch; rollout via report-only first |
| `<main>` landmark per page | Mechanical edit, low risk, but touches ~12 pages | Focused 30-min PR after launch |
| YouTube webhook X-Hub-Signature HMAC | Mitigated by channel-ID filter + drafts-only; needs YOUTUBE_WEBHOOK_SECRET live first | After webhook secret in env |
| Upstash KV REST token rotation | Vercel Marketplace integration locks rotation without disconnect/reconnect dance | Only if collaborators added or repo made public |
| Removing `@anthropic-ai/sdk` dep | Saves few hundred KB; requires removing dual-provider code paths in blog-generator.ts | Anytime, low-priority cleanup |

---

## What's NOT covered by this audit (true limits)

These genuinely cannot be done from my terminal:

1. **Real iOS Safari behavior** — Chromium simulating mobile ≠ actual iPhone Safari. iOS-specific bugs (safe-area, momentum scroll, sticky-positioning) need real-device test.
2. **Receiving emails** — Mail-Tester scoring needs an inbox to receive emails for analysis. Use https://mail-tester.com manually for a quick deliverability score after DKIM + DMARC are live.
3. **True penetration testing** — Scripted attack attempts in Phase 1 are not a substitute for a human pen-tester thinking creatively about novel attack vectors. For a high-stakes site I'd recommend a separate paid engagement. This audit is best-in-class for "no-budget" but doesn't replace one.
4. **Admin flow testing** — Pending Phase 14 (needs you to share ADMIN_AUTH_TOKEN).

---

## Phase-by-phase summaries

Detailed per-phase findings live in this folder:

- [Phase 0 — Baseline](baseline/PHASE-0-SUMMARY.md)
- [Phase 1 — API auth audit](PHASE-1-SUMMARY.md)
- [Phase 2 — Secrets / headers / cookies](PHASE-2-SUMMARY.md)
- [Phase 3 — Webhook signatures](PHASE-3-SUMMARY.md)
- [Phase 4 — Dependency CVEs](PHASE-4-SUMMARY.md)
- [Phase 5 — Email DNS](PHASE-5-SUMMARY.md)
- [Phase 6 — Performance](PHASE-6-SUMMARY.md)
- [Phase 7 — Accessibility](PHASE-7-SUMMARY.md)
- [Phase 8 — Functional flows](PHASE-8-SUMMARY.md)
- [Phase 9 — Cross-viewport](PHASE-9-SUMMARY.md)
- [Phase 10 — SEO](PHASE-10-SUMMARY.md)
- [Phase 11 — Known bugs](PHASE-11-SUMMARY.md)
- [Phase 12 — Regression verification queue](PHASE-12-SUMMARY.md)

---

## Recommended cadence going forward

| Activity | When |
|---|---|
| `npm audit fix` | After every package upgrade; or monthly |
| Lighthouse run on `/` and `/trail-map` | After any UI change to those pages; baseline monthly |
| Re-check security headers via `curl -sI` | After any next.config.ts change |
| `nslookup` SPF/DKIM/DMARC | Quarterly + after any email infrastructure change |
| Token rotation (ADMIN_AUTH_TOKEN, APIFY) | Annually + immediately if anomalous activity seen |
| Full audit (this kind of pass) | 6 months from now, or before a major launch / press push |

---

## Files added this audit

```
docs/PRE-LAUNCH-AUDIT-PLAN.md           # The PRD that guided this audit
docs/audit-2026-05/
  ├── PRE-LAUNCH-AUDIT-REPORT-2026-05.md  # ← this file
  ├── baseline/
  │   ├── PHASE-0-SUMMARY.md
  │   ├── build-output.txt
  │   ├── console/                         # per-page console error captures
  │   ├── lighthouse/                       # baseline Lighthouse JSON for 5 key pages
  │   ├── network/                          # homepage network waterfall
  │   └── screenshots/
  │       ├── desktop/                       # 10 pages at 1920×1080
  │       ├── mobile/                        # 5 pages at 375×667
  │       └── tablet/                        # (empty — deferred from Phase 9)
  ├── npm-audit-raw.json                    # full npm audit output
  ├── PHASE-1-SUMMARY.md
  ├── PHASE-2-SUMMARY.md
  ├── PHASE-3-SUMMARY.md
  ├── PHASE-4-SUMMARY.md
  ├── PHASE-5-SUMMARY.md
  ├── PHASE-6-SUMMARY.md
  ├── PHASE-7-SUMMARY.md
  ├── PHASE-8-SUMMARY.md
  ├── PHASE-9-SUMMARY.md
  ├── PHASE-10-SUMMARY.md
  ├── PHASE-11-SUMMARY.md
  └── PHASE-12-SUMMARY.md
public/llms.txt                          # AI-agent context file
```

---

**End of report.**
