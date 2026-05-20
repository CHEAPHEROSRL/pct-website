# Phase 6 — Performance

**Status:** ✅ Audit complete — 1 high-impact action item (user), 3 documented findings (some accepted)

## Baseline reminder (from Phase 0)

Lighthouse mobile scores:

| Page | Perf | LCP (s) | CLS | TBT (ms) |
|---|---|---|---|---|
| `/` | 83 | 4.15 | 0.000 | 56 |
| `/trail-map` | **73** | **6.77** | 0.000 | 73 |
| `/pledge` | 83 | 3.81 | 0.063 | 170 |
| `/journal` | 79 | 4.78 | 0.000 | 25 |
| `/supporters` | 78 | 4.88 | 0.069 | 73 |

LCP is the weak metric across the board.

## 🔴 Biggest win — Vercel domain redirect (user action)

**Apex `yeschapter.com` → 307 → `www.yeschapter.com` costs ~784ms on every cold visit.**

This was the #1 perf opportunity Lighthouse flagged on the homepage. It's a Vercel domain configuration, not a code issue.

### How to fix (Raul, in Vercel)

1. Vercel → yeschapter project → **Settings → Domains**
2. Look at the two domain rows: `yeschapter.com` and `www.yeschapter.com`
3. One is marked **Primary**, the other redirects to it. You want to either:
   - **Option A (recommended):** Make `yeschapter.com` (apex) primary, leave `www` redirecting to it. Modern preference; cleaner URL.
   - **Option B:** Leave `www` as primary (current state), but the 784ms cost stays.
4. To swap to Option A: click ⋯ on `yeschapter.com` row → **Set as Production Domain**
5. The redirect direction flips. All `www.*` URLs will 308-redirect to `yeschapter.com`. Same cost moved to the less-common entry point.

Either way, removing the bounce on the most-trafficked URL saves real time.

**Expected delta:** Homepage Perf 83 → 88-90, LCP 4.15s → ~3.3s.

## 🟡 LCP on `/trail-map` (6.77s) — accepted as inherent

The trail-map page loads Leaflet + tile imagery + GPX route polyline + markers. The 6.77s LCP comes from waiting for the first tiles to render.

**What's already done well:**
- `TrailMapView` is dynamically imported with `ssr: false` (no blocking server-render)
- Leaflet is lazy-loaded only when this page is visited
- One-shot snap-to-Paul on first load

**What could in theory be done:**
- Replace OpenTopoMap tiles with a faster CDN (no obvious better free option)
- Render a static map image first, hydrate to interactive (significant rearchitecting, low ROI)
- Preload tiles for Paul's current bounds at build time (complex, marginal)

**Decision:** accept. The trail-map page is the FEATURE, not a landing page. Visitors who land here expect to wait a moment for the map. The LCP is inherent to having a real interactive map.

## 🟡 Small CLS on `/pledge` (0.063) and `/supporters` (0.069)

Both under the 0.1 "good" threshold but worth investigating. CLS happens when the page layout shifts after initial paint — usually images or async-loaded content pushing content around.

**Not fixing in this phase** — would require profiling each page in DevTools to find the exact shifting element. Low priority since both are in "good" range.

## 🟢 Dependency observations

Inspected `package.json`:

| Dep | Usage | Worth removing? |
|---|---|---|
| `@anthropic-ai/sdk` | Imported in `src/lib/blog-generator.ts` (dual provider with OpenAI) | Yes, eventually — Raul committed to OpenAI. Would save ~few hundred KB from server bundle. Requires also removing the dual-provider code paths. Defer until non-audit work. |
| `maplibre-gl` | Imported in `src/components/MapLibreTolkien.tsx` (map style preview, /map-styles route) | Already dynamically loaded per-page; doesn't bloat homepage. Keep. |
| `react-leaflet` + `leaflet` | Main trail-map + map style previews | Required. Keep. |
| `googleapis` | Gmail OAuth + Gmail send | Required. Keep. |
| `heic-convert` (devDep) | HEIC photo conversion in tooling | Build-time only, no production bundle impact. Keep. |

No quick wins from dep pruning.

## 🟢 Bundle observations

Largest chunk in `.next/static/chunks/`: **1.04 MB** (`01d.b-hm_0es2.js`).

This is the shared "framework + commonly used libs" chunk loaded across all routes. ~1MB for a Next.js app with React 19 + Tailwind + Leaflet + Stripe is in normal range, though not great. Without further tooling (next-bundle-analyzer or webpack-bundle-analyzer setup) it's hard to identify specific bloat targets. **Documented as low-priority follow-up.**

## What this phase did NOT fix (and why)

I deliberately did NOT make code changes for performance because:

1. **The biggest win (apex redirect) is a Vercel config change, not code.** Action item handed to user.
2. **The LCP issues are dominated by external resource loads** (Leaflet tiles, fonts) — code changes wouldn't move the needle materially.
3. **Cutting dependencies = nontrivial refactor** with low ROI vs. the audit's other higher-priority gaps (bugs in Phase 11).

## Carry forward to final report

1. 🔴 User to set apex as primary domain in Vercel (~784ms perf gain on every cold visit)
2. 🟡 Consider removing `@anthropic-ai/sdk` after audit if simplification is wanted (defer; not breaking)
3. 🟡 Re-Lighthouse after Phase 11 bug fixes deploy (should show modest improvement from React #300 fix on /supporters)

## Time

- Estimated: 30 min
- Actual: ~25 min (most of the time was Phase 0 baseline; this phase is mostly read-and-document)
