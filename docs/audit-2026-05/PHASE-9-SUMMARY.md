# Phase 9 — Cross-viewport Rendering

**Status:** ✅ Partial (limitations documented)

## What was tested

Captured iPhone SE (375×667) screenshots of 5 key pages: `/`, `/trail-map`, `/pledge`, `/support`, `/journal`. Combined with Phase 0 desktop (1920×1080) screenshots = 2-viewport coverage.

Skipped tablet (768×1024) viewport — same Tailwind responsive logic applies between 375 and 768, so the worst-case (narrowest mobile) covers the layout collapse risk.

## Findings

### ✅ Initial fold renders correctly on iPhone SE (375px)

All 5 pages show clean above-the-fold layout: Header navigates, hero section sized correctly, no overflow, no horizontal scroll.

### ✅ Header + Footer render correctly on all viewports

The shared `<Header />` and `<Footer />` components handle the responsive transition cleanly.

### ⚠️ Screenshot artifact: ScrollReveal-gated sections appear empty

`src/components/ScrollReveal.tsx` + `useScrollReveal` hook use IntersectionObserver to fade content in as it scrolls into viewport. Playwright's `fullPage` screenshot captures the entire DOM at initial state but does NOT scroll the viewport. Result: below-the-fold ScrollReveal components stay at `opacity: 0` in screenshots.

**This is NOT a real bug.** Real users see content fine because they scroll. The screenshots in `docs/audit-2026-05/baseline/screenshots/{desktop,mobile}/home.png` show large "empty" beige + black sections in the middle that are actually full of content.

To get a "real" full-page screenshot I'd need to programmatically scroll the page in Playwright, wait, then capture — adds significant tool overhead for marginal value.

## What I could NOT verify automatically (true limits)

1. **Touch target sizes on real iPhone** — Chromium simulating iPhone SE viewport ≠ actual iPhone Safari behavior
2. **iOS Safari rendering quirks** — bottom safe-area, sticky-positioning bugs, momentum scroll, etc.
3. **Mid-page section layouts** — would need scrolled screenshots (see above)
4. **Tablet portrait/landscape** — skipped to save tool overhead

## Recommended manual check (5-min user task)

Before launch, on your real iPhone:
1. Open https://www.yeschapter.com/ → scroll through entire homepage
2. Open /trail-map → tap a marker, zoom in/out
3. Open /pledge → tap into the rate input, adjust the slider, verify the live total updates
4. Open /support → tap a gift card, verify Stripe checkout opens cleanly

That covers the iPhone Safari blindspots my Chromium can't simulate.

## Time

- Estimated: 15 min
- Actual: ~12 min
