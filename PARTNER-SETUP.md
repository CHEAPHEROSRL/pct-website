# Coding Partner Setup Guide — PCT Website

Welcome! This guide will get you set up to work on the **Paul Barry PCT 2026** website using VS Code and Claude Code.

---

## Prerequisites

- A computer running Windows, macOS, or Linux
- A Claude account with an active subscription (Pro, Team, or Enterprise) OR Anthropic API access
- Git installed on your machine
- Node.js 18+ installed (download from https://nodejs.org)

---

## Step-by-Step Setup

### 1. Install VS Code

1. Go to https://code.visualstudio.com
2. Download the installer for your operating system
3. Run the installer with default settings
4. Open VS Code after installation

### 2. Install the Claude Code Extension

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open Extensions
3. Search for **"Claude Code"** by Anthropic
4. Click **Install**
5. After installing, you'll see a Claude icon in the left sidebar

### 3. Sign In to Claude

1. Click the Claude icon in the VS Code sidebar
2. Follow the sign-in prompts to connect your Claude account
3. Once signed in, you're ready to use Claude Code in any project

### 4. Clone the Repository

Open a terminal (inside or outside VS Code) and run:

```bash
git clone <REPO_URL>
cd pct-website
```

Then open the project in VS Code:

```bash
code .
```

### 5. Install Dependencies

In the VS Code terminal (`Ctrl+`` to open):

```bash
npm install
```

### 6. Start the Dev Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to see the website.

### 7. Start Working with Claude

1. Open the Claude Code panel in VS Code
2. Claude will automatically read the `CLAUDE.md` file and understand the entire project
3. You can ask Claude to work on any task from the action plan, or describe what you want to build

---

## Project Quick Reference

### Commands

| Command         | What it does               |
|-----------------|---------------------------|
| `npm run dev`   | Start dev server (port 3000) |
| `npm run build` | Production build           |
| `npm run start` | Serve production build     |
| `npm run lint`  | Run ESLint                 |

### Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Full project docs, conventions, and action plan |
| `src/app/globals.css` | Color palette (CSS variables), font classes |
| `src/app/layout.tsx` | Root layout (metadata, font imports) |
| `src/app/page.tsx` | Home page |
| `src/components/Header.tsx` | Shared site header |
| `src/components/Footer.tsx` | Shared site footer |
| `src/components/MobileNav.tsx` | Mobile navigation menu |
| `src/components/TrailMapView.tsx` | Interactive Leaflet trail map |

### Pages

| URL | File | Description |
|-----|------|-------------|
| `/` | `src/app/page.tsx` | Home — hero, stats, journey, cause, donors, journal, CTA |
| `/trail-map` | `src/app/trail-map/page.tsx` | Interactive map with trail progress |
| `/the-cause` | `src/app/the-cause/page.tsx` | Paul's story and cancer prevention |
| `/journal` | `src/app/journal/page.tsx` | Blog/vlog entries |
| `/donors` | `src/app/donors/page.tsx` | Donor wall |
| `/donate` | `src/app/donate/page.tsx` | Donation form |

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--burnt-orange` | `#C45C26` | Primary accent, CTAs, active states |
| `--forest-green` | `#3D7A5A` | Secondary accent, success, amounts |
| `--bg-dark` | `#1C1F1A` | Dark sections, footer |
| `--bg-warm` | `#F4F1EC` | Warm background sections |
| `--bg-white` | `#FFFFFF` | White sections |
| `--bg-card` | `#FDFCFA` | Card backgrounds |
| `--text-primary` | `#1C1C1C` | Main text |
| `--text-secondary` | `#5C5C5C` | Secondary text |
| `--text-muted` | `#8C8A87` | Muted/helper text |

### Fonts

- **`font-heading`** — Source Serif 4 (serif) — use for headings and body text
- **`font-label`** — Barlow Semi Condensed (sans-serif) — use for labels, buttons, UI elements

### Rules

- Always use CSS variables for colors (e.g., `var(--burnt-orange)`), never hardcode hex
- Use `lucide-react` for icons
- Use Next.js `<Image>` for images, `<Link>` for internal links
- Use the shared `<Header>` and `<Footer>` components on all pages

---

## Current Action Plan

See `CLAUDE.md` for the full action plan. Summary:

1. **Phase 1** — Replace duplicated inline headers/footers on sub-pages with shared components
2. **Phase 2** — Clean up stray files in project root
3. **Phase 3** — Remove unused default assets

You can tell Claude: *"Work on Task 1.1 from the action plan"* and it will know exactly what to do.

---

## Need Help?

- Read `CLAUDE.md` for full project documentation
- Ask Claude Code any question about the codebase
- Run `npm run dev` and check http://localhost:3000 to see your changes live
