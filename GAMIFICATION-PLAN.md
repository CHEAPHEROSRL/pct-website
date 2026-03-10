# Gamification & Pledge Management System

> Status: **PLANNING** — Design in Pencil first, then implement after confirmation.

## Overview

Paul wants to create time-boxed trail challenges that drive pledger engagement. When Paul completes a challenge (e.g., "40 miles in 24 hours"), pledgers can increase their pledge. This requires persistent pledge storage, pledger profiles, a challenge system, and a communication layer.

## Current State (What Exists)

| System | Status | Notes |
|--------|--------|-------|
| Pledge calculator | Frontend only | Pledge amounts vanish on browser close |
| Pledge storage | **NONE** | Emails collected but never saved |
| User profiles | **NONE** | No accounts, no authentication |
| Challenge system | **NONE** | No gamification exists |
| Email notifications | **NONE** | No email service integrated |
| Upstash Redis | Active | Used for donors, journal, GPS |
| Stripe | Active | Used for donations |
| GPS tracking | Active | Real-time trail snapping, auto mile counting |

**Critical gap:** Pledges are lost when the tab closes. No way to contact pledgers later.

---

## Architecture

### Storage: Upstash Redis

All data stored in Redis (consistent with existing architecture):

```
# Pledger records
pledger:{email-hash}           -> JSON { id, email, name, amount, interval,
                                         totalPledge, boosts: [...], createdAt, updatedAt }
pledgers:list                  -> list of pledger record JSONs
pledgers:count                 -> integer
pledgers:total_pledged         -> float

# Challenges
challenge:active               -> JSON { id, title, description, targetMiles,
                                         startMile, deadline, status, createdAt }
challenge:history              -> list of past challenge JSONs
challenge:{id}:boosts          -> list of boost records for this challenge
challenge:{id}:commitments     -> list of pre-commitments before challenge resolves

# Stats
pledgers:boost_count           -> total number of pledge boosts across all challenges
```

### Authentication: Email-Based (No Passwords)

- Pledger enters email on `/pledge` -> pledge stored with email hash as key
- To view profile at `/my-pledge` -> enter email -> 6-digit code sent (or magic link)
- Code valid for 10 minutes, stored in Redis: `verify:{email-hash}` -> code
- Simple, no passwords, no OAuth complexity

### Email: Resend (recommended) or Postmark

Transactional emails only:
1. **Pledge confirmation** — "Your pledge of $0.10/mile is registered"
2. **Challenge started** — "Paul just started a 24-hour challenge..."
3. **Challenge result** — "Paul did it! Your pledge has been boosted"
4. **Final email** — "Paul reached Canada! Time to donate your $265 total"

---

## Implementation Phases

### Phase 0: Pledge Backend (P0 — nothing works without this)

**New API routes:**
- `POST /api/pledges` — Register pledge (email, name, amount, interval)
- `GET /api/pledges?email=` — Get pledger profile (requires email verification)
- `PUT /api/pledges` — Update pledge amount (boost)
- `GET /api/pledges/stats` — Public aggregate stats

**Changes to existing:**
- Update `/pledge` page form to POST to `/api/pledges` on submit
- Show confirmation with stored data, not just local state

### Phase 1: My Pledge Profile Page

**New page: `/my-pledge`**
- Enter email to look up pledge
- See: current pledge rate, total if Paul finishes, running total based on current miles
- See: pledge history (original + all boosts)
- See: active challenge status
- CTA: "Increase My Pledge"

### Phase 2: Challenge System

**Admin panel additions (new tab):**
- Create challenge: title, description, target miles, duration
- Start/stop challenge manually
- Auto-resolution: compares Paul's GPS miles at challenge start vs now

**New API routes:**
- `POST /api/challenges` — Admin creates challenge
- `GET /api/challenges` — Get active + recent challenges (public)
- `PUT /api/challenges/{id}` — Update status

**Frontend:**
- **Challenge Banner** (shown on all pages when challenge is active)
  - Countdown timer
  - Miles progress bar (auto-updates from GPS)
  - "Boost your pledge if Paul makes it" CTA
- **Challenge card** on homepage
- **Challenge history** on `/my-pledge`

### Phase 3: Pledge Boost Mechanic

**Flow:**
1. Challenge is active -> pledger visits site -> sees banner
2. Pledger clicks "I'll boost if Paul does it"
3. Enters boost amount (e.g., "+$0.05/mile")
4. Boost is "pre-committed" (stored but not applied)
5. Challenge succeeds -> all pre-committed boosts are applied
6. Challenge fails -> boosts are discarded
7. Pledger sees updated total on `/my-pledge`

**New API route:**
- `POST /api/pledges/boost` — Pre-commit a boost for active challenge

### Phase 4: Email Notifications

**Integration:** Resend (simple API, good free tier: 100 emails/day)

**Triggers:**
- Pledge created -> confirmation email
- Challenge started -> email all pledgers
- Challenge resolved -> email all pledgers with result
- Paul reaches Canada -> email all pledgers with Stripe payment link

### Phase 5: Social Proof & Leaderboard

**Pledger Wall** (like Donor Wall):
- Top pledgers by total amount
- Recent boosts feed
- Challenge participation stats

**Homepage stats update:**
- "127 pledgers" / "$34,200 total pledged" / "3 challenges completed"

---

## Design Screens Needed (Pencil)

1. **Updated Pledge Page** — form now saves to backend, shows confirmation state
2. **My Pledge Profile** (`/my-pledge`) — pledge dashboard with history, running total, challenge boosts
3. **Challenge Banner** — compact banner for all pages during active challenge
4. **Challenge Detail / Active State** — full challenge view with countdown, progress, boost CTA
5. **Challenge Success State** — celebration, "your pledge was boosted" confirmation
6. **Admin: Challenge Creator** — form to create/manage challenges
7. **Pledger Leaderboard** — social proof wall

---

## Priority & Effort Estimates

| Phase | What | Effort |
|-------|------|--------|
| P0 | Pledge backend + storage | ~2-3 hrs |
| P1 | My Pledge profile page | ~2 hrs |
| P2 | Challenge system (admin + frontend) | ~3-4 hrs |
| P3 | Pledge boost mechanic | ~2 hrs |
| P4 | Email notifications (Resend) | ~2-3 hrs |
| P5 | Leaderboard + social proof | ~2 hrs |

---

## User Journey Example

1. Visitor pledges $0.10/mile on `/pledge` -> stored in Redis, confirmation email sent
2. Paul creates challenge from admin: "Desert Push: 40 Miles in 24 Hours"
3. Website shows live challenge banner on every page
4. Pledger sees banner, clicks "I'll add $0.05/mile if Paul does it"
5. Paul's GPS auto-tracks miles. Banner updates in real-time.
6. 22 hours later: Paul covers 41 miles. Challenge auto-succeeds.
7. Pledger's rate goes from $0.10 to $0.15/mile. Email sent: "Paul did it!"
8. Months later: Paul reaches Canada. Final email: "Your total: $397.50. Donate now."
9. Pledger clicks Stripe link, pays $397.50 -> split 50/50 to two cancer foundations.
