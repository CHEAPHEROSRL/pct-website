# YesChapter — Walking for Cancer

## Project Overview

Personal website for Paul Barry's 2026 Pacific Crest Trail (PCT) thru-hike fundraiser (yeschapter.com). Paul is walking 2,650 miles from Mexico to Canada to raise awareness and funds for cancer research, patient support, and prevention — in honor of both his parents who he lost to cancer.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Icons:** lucide-react
- **Map:** Leaflet + react-leaflet (OpenTopoMap tiles)
- **Fonts:** Source Serif 4 (heading/body), Barlow Semi Condensed (labels/UI)
- **Package manager:** npm

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (metadata, fonts, global CSS)
│   ├── globals.css         # CSS variables, Tailwind import, base styles
│   ├── page.tsx            # Home page (hero, stats, journey, cause, donors, journal, CTA)
│   ├── trail-map/page.tsx  # Interactive Leaflet map + sidebar with trail sections
│   ├── the-cause/page.tsx  # Paul's story, cancer prevention tips, donation breakdown
│   ├── journal/page.tsx    # Blog/vlog listing with filters and card grid
│   ├── donors/page.tsx     # Donor wall with search/sort and table/cards
│   └── donate/page.tsx     # Donation form with progress sidebar
├── components/
│   ├── Header.tsx          # Shared site header (logo, nav, donate CTA)
│   ├── Footer.tsx          # Shared site footer (nav columns, social, copyright)
│   ├── MobileNav.tsx       # Mobile hamburger menu (client component)
│   └── TrailMapView.tsx    # Leaflet map component (client, dynamic import)
public/
├── file.svg, globe.svg, next.svg, vercel.svg, window.svg  # Default Next.js assets (unused)
```

## Design System (CSS Variables)

```css
--bg-card: #FDFCFA        --bg-dark: #1C1F1A
--bg-warm: #F4F1EC         --bg-white: #FFFFFF
--border-subtle: #D9D7D4   --burnt-orange: #C45C26
--burnt-orange-light: #FEF3EC
--forest-green: #3D7A5A    --forest-green-light: #E8F0EB
--text-muted: #8C8A87      --text-primary: #1C1C1C
--text-secondary: #5C5C5C  --text-white: #FFFFFF
--warm-stone: #EBE8E3
```

## Typography

- **Headings/body:** `font-heading` = Source Serif 4 (serif)
- **Labels/UI:** `font-label` = Barlow Semi Condensed (sans-serif)

## Navigation Routes

| Route        | Label       | Description                        |
|-------------|-------------|-------------------------------------|
| `/`          | The Journey | Home/landing page                   |
| `/trail-map` | Trail Map   | Interactive map with trail progress |
| `/the-cause` | The Cause   | Paul's story and cancer prevention  |
| `/journal`   | Journal     | Blog/vlog entries from the trail    |
| `/donors`    | Donors      | Donor wall and recognition          |
| `/donate`    | Donate      | Donation form and impact info       |

## Coding Conventions

- Use Tailwind utility classes for all styling
- Use CSS variables (e.g., `var(--burnt-orange)`) for the color palette — do NOT hardcode hex values
- Use `font-heading` for headings and body text, `font-label` for labels and UI elements
- Use `lucide-react` for all icons
- Use Next.js `<Image>` for all images, `<Link>` for all internal navigation
- Components are in `src/components/`, pages use Next.js App Router conventions in `src/app/`
- All pages should use the shared `<Header />` and `<Footer />` components

## Funding Model — CRITICAL RULE

The website has TWO completely separate money streams. They must NEVER be conflated:

### Stream 1: Pledges for Cancer Foundations (the main cause)
- Paul does **NOT collect any money** for the foundations
- Visitors make **pledges** (per-mile or flat) — these are **promises**, not payments
- Pledges are honored **at the end of Paul's hike**
- When honored, pledgers pay **directly to the foundations' bank accounts**
- Paul **never touches, handles, or routes** foundation money
- The website is a **pledge tracker**, not a payment processor for foundations
- Pages: `/pledge`, `/pledgers`, `/my-pledge`

### Stream 2: Trail Support for Paul (direct gifts)
- Visitors can buy Paul a meal, boots, hostel night, or gear
- This is the **only place on the site where actual money changes hands**
- These are personal gifts to keep Paul on the trail — Stripe payment processing applies here
- Pages: `/support`, `/support/success`, `/support/cancelled`

### Language Rules
- "Pledge" = promise to donate to foundations later (no money now)
- "Support" / "Gift" = direct trail support for Paul (real payment)
- NEVER say "donate" when referring to foundation pledges
- NEVER show "$ raised" or "fundraising progress" for pledges — they're commitments, not collected funds
- The word "donation" should ONLY appear in context of trail support gifts or when describing what pledgers will eventually do at the end (donate directly to foundations)

---

## Current State

Most backend features (journal CMS, location tracking, pledge tracking, challenges) are implemented with API routes and Redis/KV storage. Stripe is integrated for donations but needs to be moved from the `/donate` flow to the `/support` flow.

---

## Action Plan: Funding Model Alignment

### Phase A: Move Stripe Payment Flow from Donate → Support

**Problem:** The Stripe checkout integration currently lives in `/donate` (foundation donations) but should only exist for trail support gifts on `/support`. The `/support` page has TODO placeholders where Stripe integration should be.

#### Task A.1 — Create `/api/support/route.ts`
- Copy the Stripe session creation logic from `/api/donate/route.ts`
- Change product name from "Donation — YesChapter Walk for Cancer" to "Trail Support Gift — YesChapter"
- Change description to reflect trail support (e.g., "Gift: Trail Meal for Paul")
- Set `success_url` to `/support/success?session_id={CHECKOUT_SESSION_ID}`
- Set `cancel_url` to `/support/cancelled`
- Accept gift title/description in request body for the Stripe line item

#### Task A.2 — Wire up `/support` page to Stripe
- Replace the TODO placeholders in gift card buttons with actual Stripe checkout redirect
- POST to `/api/support` with amount, gift title, and optional donor info
- Redirect to the Stripe checkout URL returned by the API

#### Task A.3 — Create `/support/success/page.tsx`
- Thank the user for supporting Paul on the trail
- Show what they bought (meal, boots, etc.)
- Link to pledge page ("Want to support the cause too? Pledge per mile")

#### Task A.4 — Create `/support/cancelled/page.tsx`
- Gentle cancellation message for trail support
- Link back to support page and pledge page

#### Task A.5 — Update Stripe webhook
- Modify `/api/webhooks/stripe/route.ts` to distinguish between support gifts and any legacy donations
- Store support gifts as "supporters" not "donors"

### Phase B: Remove/Replace the Donate Page

**Problem:** `/donate` is a full foundation donation form with Stripe payment. This contradicts the funding model — Paul doesn't collect foundation money.

#### Task B.1 — Replace `/donate/page.tsx`
- Replace with a "Choose How to Help" routing page with two clear paths:
  - **Pledge Per Mile** → links to `/pledge` (promise for foundations)
  - **Support Paul on the Trail** → links to `/support` (direct gift)
- OR simply redirect to `/pledge`

#### Task B.2 — Remove `/donate/success` and `/donate/cancelled`
- These are replaced by `/support/success` and `/support/cancelled`
- Keep the old routes as redirects for any existing Stripe sessions in flight

#### Task B.3 — Remove or repurpose `/api/donate/route.ts`
- Once support flow is live, the donate API is no longer needed
- Keep as redirect to `/api/support` or remove entirely

### Phase C: Fix the Donors Page

**Problem:** `/donors` shows "DONOR WALL" with "$12,450 raised of $50,000 goal" — implies collected foundation money.

#### Task C.1 — Repurpose as Trail Supporters Wall
- Rename "Donor Wall" → "Trail Supporters"
- Remove "$X raised of $Y goal" fundraising progress language
- Show trail support gifts: "Sarah bought Paul a trail meal", "James gifted new boots"
- Remove "AVERAGE DONATION" and "LARGEST DONATION" stats
- Replace with supporter-appropriate stats: total supporters, gifts given
- Update nav label from "Donors" to "Supporters"

### Phase D: Fix Language Across All Pages

#### Task D.1 — Home page (`/page.tsx`)
- Change "$50K FUNDRAISING GOAL" → "$50K PLEDGE GOAL" or "PLEDGE TARGET"
- Change "Every donation fuels another mile" → "Every pledge brings us closer to the goal"
- Change "$12,450 raised of $50,000 goal" → "$12,450 pledged toward $50,000 goal"
- Change "Fund the Fight Against Cancer" → "Join the Fight Against Cancer"
- Change donor card section to reference pledgers or trail supporters
- Change "VIEW ALL 47 DONORS" → link to pledgers
- Update CTA buttons to point to `/pledge` and `/support`

#### Task D.2 — Footer (`Footer.tsx`)
- Change "every pledge and donation goes directly to the cause" → "every pledge goes directly to the cause. Paul takes nothing."
- Change "Support Paul" link text if needed

#### Task D.3 — The Cause page (`/the-cause/page.tsx`)
- Change "WHERE YOUR DONATION GOES" → "WHERE YOUR PLEDGE GOES"
- Change "raise funds" → "raise awareness and pledges"
- Change "Every donation, no matter how small" → "Every pledge, no matter how small"
- Change CTA to point to `/pledge`

#### Task D.4 — Foundations page (`/foundations/page.tsx`)
- Change "receiving 100% of YesChapter donations" → "receiving 100% of YesChapter pledges"
- Change "WHERE YOUR MONEY GOES" → "WHERE YOUR PLEDGE GOES"
- Change "Every dollar you donate" → "Every dollar you pledge"
- Change "donations are divided equally" → "pledges are divided equally"
- Change "DONATE NOW" → "PLEDGE NOW" and link to `/pledge`

#### Task D.5 — Transparency page (`/transparency/page.tsx`)
- Major rewrite: remove all language about collecting donations through Stripe
- Explain the pledge model: visitors commit, Paul hikes, pledgers donate directly to foundations at the end
- Keep the 50/50 split explanation and foundation partnership details
- Remove "funds held in Stripe account" and "transferred monthly" language
- Add explanation of trail support as the separate, direct-gift stream

#### Task D.6 — Donate success/cancelled pages
- Update language to reflect trail support, not foundation donations
- These pages will be moved to `/support/success` and `/support/cancelled` in Phase A

#### Task D.7 — Header navigation
- Change "Donors" nav label → "Supporters" (or "Pledgers")
- Ensure PLEDGE NOW button remains prominent

### Phase E: Future Improvements

- Connect to a CMS or database for journal entries
- Add real social media links
- Add SEO metadata per page
- Add loading states and error boundaries
