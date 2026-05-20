# Phase 0 — Baseline Summary

**Captured:** 2026-05-19
**Status:** ✅ Complete

## Build

- `npm run build` exits clean
- 2 deprecation warnings (non-blocking):
  - Multiple lockfiles (workspace root inference)
  - `middleware` file convention deprecated → use `proxy` in Next.js 16+

## Lighthouse Scores (Mobile)

| Page | Performance | A11y | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 83 | 95 | 100 | 100 |
| `/trail-map` | **73** | 98 | 96 | 100 |
| `/pledge` | 83 | 94 | 100 | 100 |
| `/journal` | 79 | 94 | 100 | 100 |
| `/supporters` | 78 | 93 | 96 | 100 |

**Targets after Phase 6/7:** Performance ≥ 90, A11y ≥ 95 across all pages.

## Core Web Vitals (Mobile)

| Page | LCP (s) | CLS | TBT (ms) | FCP (s) |
|---|---|---|---|---|
| `/` | 4.15 | 0.000 | 56 | 2.37 |
| `/trail-map` | **6.77** | 0.000 | 73 | 2.42 |
| `/pledge` | 3.81 | 0.063 | 170 | 2.34 |
| `/journal` | 4.78 | 0.000 | 25 | 2.59 |
| `/supporters` | 4.88 | 0.069 | 73 | 2.36 |

**LCP is the weak metric** — Google considers > 4s "Poor". Trail-map is the worst at 6.77s (likely Leaflet map load). All pages need LCP work.

CLS is excellent everywhere (< 0.1 target). TBT excellent (< 200ms). FCP slightly slow (~ 2.4s; target < 1.8s).

## Top Perf Opportunity (Homepage)

- **Avoid multiple page redirects — saves ~784ms.** Confirmed: `https://yeschapter.com/` issues a 307 to `https://www.yeschapter.com/`. Every cold visit eats this.
  - **Fix location:** Vercel → Settings → Domains. Make apex the primary (or eliminate the redirect chain). User action required — I cannot modify Vercel config from here.

## Console Errors Found

| Page | Error | Severity |
|---|---|---|
| `/supporters` (via `/donors`) | **React #300** — "Maximum update depth exceeded" (infinite render loop) | 🔴 New bug — adding to Phase 11 |
| `/admin` | React #418 — hydration mismatch (known) | 🟡 Already on Phase 11 list |

All other captured pages had no errors at warning+ level.

## Page Title Bug Found

`/contact` page title is the default `YesChapter — Walking for Cancer` instead of a unique title. SEO finding — Phase 10.

## Routes Captured (Desktop screenshots)

All 10 saved in `docs/audit-2026-05/baseline/screenshots/desktop/`:
`home`, `trail-map`, `pledge`, `support`, `journal`, `donors` (redirected to `/supporters`), `the-cause`, `foundations`, `transparency`, `contact`.

Tablet + mobile screenshots deferred to Phase 9 (cross-viewport rendering) — that's where they're the deliverable, not baseline.

## What I Did NOT Capture in Baseline

These move to dedicated phases later:
- Full network waterfall analysis (Phase 6)
- Bundle size analysis (Phase 6)
- API endpoint inventory + auth status (Phase 1)
- Security header inventory (Phase 2)
- Multi-viewport screenshots (Phase 9)

## Carried Forward

**Phase 11 additions:**
- 🔴 NEW: Fix React #300 infinite-render on `/supporters`
- (already on list): React #418 on `/admin`
- (already on list): 401 race on `/api/admin/settings`
- (already on list): missing `last_sent` for 3 of 4 email crons

**Phase 10 additions:**
- `/contact` page title fix

**User action items (carried to final report):**
- Vercel domain config: eliminate apex → www redirect chain (~784ms perf win)

## Time

- Estimated: 15 min
- Actual: ~20 min (includes one path-resolution detour and Lighthouse install)
