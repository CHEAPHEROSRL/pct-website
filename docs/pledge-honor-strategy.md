# YesChapter — Pledge Honor Strategy

## How We Build Community, Responsibility, and Make It Easy for Pledgers to Pay

**Date:** March 13, 2026
**Prepared for:** Paul Barry
**Goal:** Maximize the percentage of pledgers who honor their commitments at the end of the hike, while keeping Paul 100% out of the money flow.

---

## The Challenge

A pledge is a promise, not a payment. When Paul reaches Canada (approximately September/October 2026), every pledger needs to:
1. Remember they made a pledge
2. Feel motivated to honor it
3. Know exactly how much they owe
4. Easily donate their total directly to the two foundations

The risk is that people forget, lose interest, or find the process confusing. Our job is to eliminate all three risks.

---

## Part 1: Building Community During the Hike (March–October 2026)

The key insight: **people who feel emotionally invested in Paul's journey will honor their pledges.** This isn't about guilt — it's about making pledgers feel like they're walking WITH Paul.

### 1.1 — Pledge Identity

When someone pledges, they become part of something. We reinforce this at every touchpoint:

- **Pledger Profile Page** (`/my-pledge`) — already built. Shows their pledge rate, running total, and miles walked. This is "their" page.
- **Pledger Leaderboard** (`/pledgers`) — already built. Public recognition, opt-in. Shows who's pledging and their per-mile rates.
- **Trail Map Bubbles** — Plot pledger locations on the trail map. When Paul passes through an area, local pledgers see "Paul is near you!" This creates a personal connection to the physical journey.

### 1.2 — Regular Engagement (The "Walking With You" Emails)

A drip email sequence that keeps pledgers connected throughout the hike:

| When | Email | Purpose |
|------|-------|---------|
| Day 1 | "Paul just started! Your pledge is live." | Excitement, confirmation |
| Weekly | "Week 12 Update: Paul crossed into Oregon. Your pledge total is now $X." | Running total, progress |
| Milestone | "Paul hit 1,000 miles! Your pledge is now $250." | Celebration, growing number |
| Challenge win | "Paul crushed today's challenge — 25 miles! Your boosted rate kicked in." | Engagement with daily challenges |
| Monthly | "Monthly Journal: What Paul saw, felt, and learned this month." | Emotional connection, storytelling |
| Near finish | "Paul is 200 miles from Canada. Your final total will be approximately $X." | Preparation, anticipation |

**Key principle:** Every email includes the pledger's **personal running total**. Watching it grow from $12 to $200 to $662 over 6 months creates ownership. It's not abstract — it's *their* number.

### 1.3 — Social Proof & Community

- **Live pledge counter on the website** — "1,247 people walking with Paul" (already have pledge stats API)
- **Pledge wall / leaderboard** — see other pledgers, feel part of a group
- **Journal comments** — pledgers can comment on Paul's trail journal posts
- **Share badges** — "I'm pledging $0.25/mile for cancer research" shareable image for social media
- **Challenge system** — daily hiking challenges where pledgers can "boost" their rate if Paul succeeds (already built)

### 1.4 — The Emotional Arc

The pledge model has a natural story arc that traditional "donate now" doesn't:

```
BEGINNING (March)     → "I believe in this. I'm in."
MIDDLE (May–August)   → "My total is growing. Paul is really doing this."
CLIMAX (September)    → "He's almost there. My pledge is $662."
RESOLUTION (October)  → "He made it. Time to honor my promise."
```

This arc is powerful. Every email, every mile update, every journal post reinforces it.

---

## Part 2: The Honor Moment (When Paul Reaches Canada)

This is the most critical moment. Paul reaches Manning Park. The hike is done. Now every pledger needs to convert their promise into a real donation.

### 2.1 — The "Paul Made It" Email

**Trigger:** Paul reaches the northern terminus (manual trigger or GPS-based).

**Content:**
- Congratulations — Paul walked 2,650 miles
- Photos/video from the finish
- "Your pledge total: $662.50"
- Two big buttons:
  - "HONOR MY PLEDGE — TOWER CANCER RESEARCH FOUNDATION ($331.25)" → direct link to their donation page
  - "HONOR MY PLEDGE — CANCER COUNCIL NSW ($331.25)" → direct link to their donation page
- The 50/50 split is pre-calculated
- Option to honor in full, in part, or in installments
- "I've honored my pledge" confirmation button (updates their profile)

### 2.2 — Direct Foundation Donation Links

This is the critical piece. Pledgers must be able to donate directly to the foundations with minimal friction:

**Tower Cancer Research Foundation (California)**
- They have an online donation page
- We link directly to it
- Pledger enters their amount ($331.25) and pays with their own card
- Foundation issues tax receipt directly to the donor
- 100% goes to the foundation — zero middlemen

**Cancer Council NSW (Sydney)**
- They have an online donation page
- We link directly to it
- Same process — pledger pays directly
- Cancer Council issues tax receipt (deductible in Australia for Australian residents)
- We can potentially set up a dedicated YesChapter fundraising page on Cancer Council's platform

### 2.3 — Making It Frictionless

The biggest risk is friction. Every extra click loses people. Here's how we minimize it:

**Pre-filled amounts:** The email and `/my-pledge` page show the exact dollar amounts for each foundation. No math required.

**One-click flow:**
1. Pledger opens email or goes to `/my-pledge`
2. Sees "Your total: $662.50 → $331.25 to each foundation"
3. Clicks "HONOR — TOWER CANCER RESEARCH" → lands on Tower's donation page
4. Enters $331.25, pays, done
5. Comes back, clicks "HONOR — CANCER COUNCIL NSW" → same process
6. Clicks "I've honored my pledge" → gets a thank you and recognition

**Installment option:** Some pledgers may have large totals ($500+). We offer: "Honor over 3 months" — we send monthly reminder emails with 1/3 of the amount each time.

### 2.4 — The Follow-Up Sequence

Not everyone honors immediately. That's okay. We follow up with empathy, not pressure:

| Day | Email | Tone |
|-----|-------|------|
| Day 0 | "Paul made it! Here's your pledge total." | Celebration |
| Day 3 | "Quick reminder — your pledge links are ready." | Gentle nudge |
| Day 7 | "X% of pledgers have honored so far! Join them." | Social proof |
| Day 14 | "Still planning to honor? No rush — here are your links." | Understanding |
| Day 30 | "Final reminder — the foundations are counting on us." | Purpose |
| Day 45 | "Installment option: honor your pledge over 3 months." | Flexibility |

After 45 days, we stop. No guilt. No harassment. People either honor or they don't.

### 2.5 — Self-Reported Honoring

Since we can't track direct foundation donations (they happen on the foundation's site, not ours), we use a self-report system:

- Pledger clicks "I've honored my pledge" on `/my-pledge`
- Optional: upload receipt or screenshot
- Their profile updates to show "PLEDGE HONORED" badge
- They appear on a special "Wall of Honor" on the website
- Their map bubble changes color (grey → green)

This creates social incentive to honor AND report.

---

## Part 3: What We Need to Build

### Already Built
- [x] Pledge calculator and submission (`/pledge`)
- [x] Pledge storage in KV/Redis (`/api/pledges`)
- [x] Pledger profile page (`/my-pledge`)
- [x] Pledger leaderboard (`/pledgers`)
- [x] Challenge system with boost commitments
- [x] Trail map with Leaflet
- [x] Journal/blog system
- [x] Pledge stats API (`/api/pledges/stats`)
- [x] Visitor geolocation (`/api/geo`)

### Needs to Be Built

#### Phase 1: Pre-Hike (Before March 24)
- [ ] Add optional "city" and "message" fields to pledge form
- [ ] Store pledger location with pledge data
- [ ] Plot pledger locations as bubbles on trail map
- [ ] "Share my pledge" social media badge generator

#### Phase 2: During Hike (March–October)
- [ ] Email integration (Resend, SendGrid, or Google Workspace)
- [ ] Weekly automated email with personal pledge total
- [ ] Milestone notification emails (500mi, 1000mi, halfway, state crossings)
- [ ] "Paul is near you" notification for local pledgers
- [ ] Running honor counter on website ("$X pledged by Y people")

#### Phase 3: Honor System (When Paul Finishes)
- [ ] "Paul Made It" email template with personalized totals and foundation links
- [ ] Honor confirmation flow on `/my-pledge` ("I've honored my pledge" button)
- [ ] Wall of Honor page showing confirmed honorers
- [ ] Follow-up email sequence (Day 0, 3, 7, 14, 30, 45)
- [ ] Installment reminder option (split over 3 months)
- [ ] Map bubble color change for honored pledges

#### Phase 4: Foundation Coordination
- [ ] Contact Tower Cancer Research Foundation about a dedicated YesChapter donation page
- [ ] Contact Cancer Council NSW about a dedicated YesChapter fundraising page
- [ ] Get direct donation URLs that we can link to
- [ ] Confirm tax receipt process for both foundations
- [ ] If possible, get tracking/referral parameters so foundations can report back YesChapter totals

---

## Part 4: Tax Deductions — How Our Model Is Actually Better

### For US Donors → Tower Cancer Research Foundation
- Tower is a registered 501(c)(3) charity
- Donors who give directly to Tower receive a tax receipt from Tower
- Their donation is tax-deductible in the US
- **No middleman means no confusion about who made the donation**

### For Australian Donors → Cancer Council NSW
- Cancer Council is a DGR-registered charity in Australia
- Donors who give directly to Cancer Council receive a tax receipt
- Their donation is tax-deductible in Australia
- **If we used Pledge.to (a US platform), Australian donors would get zero tax benefit**

### For International Donors
- Tax deductibility depends on their local laws and the foundation they donate to
- Direct donation gives them the best chance of a valid deduction
- A receipt from the foundation itself (not from a third-party processor) is the cleanest documentation

### Why Pledge.to Would Make This Worse
- Paul's card gets charged → ambiguous who the "donor" is
- US platform processing Australian charity donations → no clear tax path
- 5% fee → less money reaches foundations
- Intermediary receipt → weaker documentation for tax purposes

---

## Summary for Paul

**The short version:**

1. We don't need Pledge.to or any third party. Our system is simpler and better.
2. Pledgers promise during the hike. They watch their total grow. They feel invested.
3. When you reach Canada, we send everyone a personalized email with their total and direct links to donate to each foundation.
4. They click, they pay the foundations directly, they get proper tax receipts.
5. You touch $0 of foundation money. Ever.
6. The only payments you receive are trail support gifts (meals, boots, hostel) through Stripe — which is completely separate and already working.

**What makes people honor pledges:**
- Emotional investment (they followed your journey for 6 months)
- Social proof (they see others honoring)
- Frictionless process (pre-calculated amounts, direct links)
- Personal running total (they watched $12 become $662)
- Recognition (Wall of Honor, map badges)

**What we still need to do:**
- Set up email (for weekly updates and the honor email)
- Add pledger locations to the trail map
- Build the honor confirmation flow
- Contact both foundations about dedicated donation pages

That's it. No third-party platforms. No fees. No middlemen. Clean, transparent, and exactly what YesChapter promises.
