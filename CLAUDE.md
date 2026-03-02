# Paul Barry PCT 2026 — Walking for Cancer

## Project Overview

Personal website for Paul Barry's 2026 Pacific Crest Trail (PCT) thru-hike fundraiser. Paul is walking 2,650 miles from Mexico to Canada to raise awareness and funds for cancer research, patient support, and prevention — in honor of both his parents who he lost to cancer.

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

## Current State & Known Issues

All data is currently hardcoded/static. There is no backend, CMS, database, or payment integration yet.

---

## Action Plan: Fix Notable Observations

### Phase 1: Use Shared Header/Footer on All Pages

**Problem:** Only the home page (`/`) uses the shared `<Header>` and `<Footer>` components. The other 5 pages duplicate the header and footer markup inline, which causes inconsistency and makes updates painful.

**Fix each page one by one:**

#### Task 1.1 — Fix `/the-cause` page
- Remove the inline `<header>` block (lines 10-28)
- Import and use `<Header />` component instead
- Remove the inline `<footer>` block (lines 153-161)
- Import and use `<Footer />` component instead
- Pass appropriate props to Header if needed for active nav highlighting

#### Task 1.2 — Fix `/donate` page
- Remove the inline `<header>` block (lines 9-27)
- Import and use `<Header />` component instead
- Remove the inline `<footer>` block (lines 147-153)
- Import and use `<Footer />` component instead

#### Task 1.3 — Fix `/donors` page
- Remove the inline `<header>` block (lines 18-36)
- Import and use `<Header />` component instead
- Remove the inline `<footer>` block (lines 151-162)
- Import and use `<Footer />` component instead

#### Task 1.4 — Fix `/journal` page
- Remove the inline `<header>` block (lines 10-28)
- Import and use `<Header />` component instead
- Remove the inline `<footer>` block (lines 133-144)
- Import and use `<Footer />` component instead

#### Task 1.5 — Fix `/trail-map` page
- Remove the inline `<header>` block (lines 21-39)
- Import and use `<Header />` component instead
- Remove the inline `<footer>` block (lines 122-130)
- Import and use `<Footer />` component instead

#### Task 1.6 — Update Header component for active nav state
- Add `activeItem` prop to `<Header>` to highlight the current page in navigation
- Mirror the pattern already used in `<MobileNav>` (which accepts `activeItem`)
- Pass `activeItem` from `<MobileNav>` through `<Header>` so each page only sets it once

### Phase 2: Clean Up Stray Root Files

**Problem:** `globals.css` and `layout.tsx` exist in the project root (outside `src/`). These are leftover copies and are tracked by git as untracked files.

#### Task 2.1 — Delete stray root files
- Verify `globals.css` (root) is a copy of `src/app/globals.css`
- Verify `layout.tsx` (root) is a copy of `src/app/layout.tsx`
- Delete both root copies

### Phase 3: Remove Unused Default Assets

**Problem:** The `public/` folder still has default Next.js SVGs (file.svg, globe.svg, next.svg, vercel.svg, window.svg) that are not referenced anywhere.

#### Task 3.1 — Remove unused public assets
- Confirm none of the SVGs are referenced in any source file
- Delete all 5 default SVG files from `public/`

### Phase 4: Future Improvements (Not Yet Actionable)

These are noted for future phases and are NOT part of the current action plan:

- Integrate real payment processing (Stripe) on the donate page
- Connect to a CMS or database for journal entries and donor data
- Add individual journal entry pages (`/journal/[slug]`)
- Add real social media links
- Add SEO metadata per page
- Add loading states and error boundaries
