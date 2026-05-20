# Phase 10 — SEO

**Status:** ✅ Complete — 2 fixes applied + 1 enhancement added

## What was checked

| Item | Status |
|---|---|
| `robots.txt` | ✅ Present, correctly blocks admin/api/auth/success/cancelled paths |
| `sitemap.xml` | ✅ Present, lists all public pages with priority + changefreq |
| Per-page `<title>` | 10/10 pages have titles (2 had issues, both fixed below) |
| Per-page meta description | 10/10 pages have unique descriptions |
| Open Graph tags | All pages have og:title, og:description, og:image, og:site_name, og:type |
| Twitter Card tags | Present site-wide |
| OG image | `/og-image.jpg` exists, 59 KB JPEG (reasonable for social previews) |
| Canonical URLs | Set via Next.js metadataBase ✓ |

## Fixes applied

### 1. `/foundations` had double-suffixed title

**Before:** `Our Partner Foundations — YesChapter | YesChapter`

The root layout uses a metadata title template (`"%s | YesChapter"`) which auto-appends "| YesChapter" to every page title. The foundations page also manually included "— YesChapter" in its title, so the suffix appeared twice.

**Fix:** Removed manual suffix from `src/app/foundations/page.tsx`. Now resolves to `Our Partner Foundations | YesChapter`.

### 2. `/contact` had the default site title

**Before:** `YesChapter — Walking for Cancer` (the root fallback)
**Description:** also fallback

`src/app/contact/page.tsx` is a client component (uses `"use client"` for form state + Turnstile widget). Next.js App Router does NOT allow `export const metadata` from client components — metadata only works on server components.

**Fix:** Created `src/app/contact/layout.tsx` as a thin server component that:
- Exports proper metadata (title "Contact", contextual description)
- Renders `{children}` unchanged

This pattern keeps the page itself a client component while giving the route a proper SEO surface. Now resolves to `Contact | YesChapter`.

## Enhancement: added `llms.txt`

Created `public/llms.txt` per the [llms.txt spec](https://llmstxt.org). This is an emerging standard adopted by Anthropic, Stripe, Vercel, Cloudflare and others that helps AI assistants (Claude, ChatGPT, Perplexity) give better answers when users ask about a site.

The file explicitly explains the two-stream funding model (pledges vs trail support) so AI agents don't conflate them in summaries — a real risk given that "donate" is the default verb for charity sites.

Lives at: https://yeschapter.com/llms.txt (after deploy).

Includes:
- Project tagline and explanation of the dual funding streams
- All key public pages with descriptions
- Context section about the PCT (geography, timing, terminology) so AI agents can answer factual questions about Paul's route

## What I did NOT do (and why)

- **Structured data (JSON-LD):** would benefit Google rich snippets. Not in audit scope; nice 30-min follow-up if you want star ratings / NonprofitOrganization markup.
- **Image alt-text audit:** Phase 7 already confirmed all `<Image>` components have alt attributes.
- **Internal link audit (broken links):** out of scope; Lighthouse hadn't flagged any 404s on the pages it crawled.

## Time

- Estimated: 15 min
- Actual: ~20 min (extra time for the llms.txt + contact layout pattern)
