# Pledge Honor System — Implementation Plan

**Created:** March 13, 2026
**Goal:** Build everything needed so pledgers stay engaged during the hike and honor their pledges when Paul finishes.

---

## P0 — Before March 24 (Hike Start)

### 1. Add "message" field to pledge form
- **Files:** `src/lib/types.ts`, `src/app/api/pledges/route.ts`, `src/app/pledge/page.tsx`
- Add optional `message` to `PledgeRecord` and `PledgerLocation`
- Accept `message` in API POST, store in Redis
- Add textarea to pledge form ("Leave a message for Paul")
- Return `message` in locations API

### 2. Enhanced pledger map bubbles
- **File:** `src/components/TrailMapView.tsx`
- Show pledger name, city/country, and message in popup
- Style popup with brand fonts

### 3. Update .pen file
- Add message field to pledge form design
- Update map bubble design with message

---

## P1 — First 2 Weeks of Hike (March 24 – April 7)

### 4. Weekly email with personal running total
- **Files:** `src/lib/email.ts`, new cron/API route
- Template: "Week X Update: Paul crossed into [state]. Your pledge total is now $X."
- Uses Resend, pulls miles from GPS tracker, calculates per-pledger total

### 5. Milestone notification emails
- **Trigger:** 500mi, 1000mi, halfway (1325mi), state crossings
- Template: "Paul hit [milestone]! Your pledge is now $X."

### 6. Share badge generator
- **File:** new `src/app/api/share-badge/route.ts` or client-side canvas
- Generates "I'm pledging $X/mile for cancer research" image
- Shareable to social media from `/my-pledge`

---

## P2 — During Hike (April – August)

### 7. "Paul is near you" notification
- Compare Paul's GPS lat/lng to pledger lat/lng
- Email pledgers within ~50 miles when Paul passes through

### 8. Running honor counter on website
- "$X pledged by Y people" live counter on home page
- Already have `/api/pledges/stats` — wire it to home page

### 9. Journal comments for pledgers
- Allow pledgers to comment on journal posts (verify by email)

---

## P3 — Before Paul Finishes (~September)

### 10. Add `honored`, `honoredAt`, `receiptUrl` to PledgeRecord
- **Files:** `src/lib/types.ts`, `src/app/api/pledges/route.ts`
- New PUT endpoint field: `honored: true`

### 11. "Honor My Pledge" button on `/my-pledge`
- Shows final total, 50/50 split with exact amounts
- Two buttons linking to Tower Cancer Research and Cancer Council NSW donation pages
- "I've honored my pledge" confirmation button
- Optional receipt upload

### 12. "Paul Made It" email template
- **File:** `src/lib/email.ts`
- Personalized total, foundation links with pre-calculated 50/50 amounts
- Celebratory tone with finish photos/video

### 13. Wall of Honor page
- New page showing confirmed honorers
- Badge system: "PLEDGE HONORED" on profile
- Map bubble color change (grey → green for honored)

### 14. Follow-up email sequence
- Day 0: "Paul made it! Here's your pledge total."
- Day 3: Gentle reminder
- Day 7: Social proof ("X% have honored")
- Day 14: Understanding tone
- Day 30: Purpose reminder
- Day 45: Installment option — then stop

### 15. Installment option
- Allow pledgers to split payment over 3 months
- Monthly reminder emails with 1/3 amount each

---

## P4 — Foundation Coordination (Ongoing)

### 16. Contact Tower Cancer Research Foundation
- Request dedicated YesChapter donation page
- Get direct donation URL
- Ask about tracking/referral parameters

### 17. Contact Cancer Council NSW
- Request dedicated YesChapter fundraising page
- Get direct donation URL
- Confirm DGR tax receipt process

### 18. Confirm tax receipt process for both foundations

---

## Status Key
- [ ] Not started
- [~] In progress
- [x] Complete
