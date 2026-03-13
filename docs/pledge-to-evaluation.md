# Pledge.to Evaluation — Why It Doesn't Work for YesChapter

**Date:** March 13, 2026
**Prepared for:** Paul Barry
**Decision:** Do not use Pledge.to. Continue with our custom pledge system.

---

## What Is Pledge.to?

Pledge.to (formerly Pledgeling) is a donation processing platform that lets businesses embed charitable giving into their apps and websites. It provides APIs, widgets, and a dashboard for processing donations to verified US 501(c)(3) nonprofits.

## Why We Investigated It

We wanted to know if Pledge.to could:
1. Handle the complexity of collecting and distributing pledge money to foundations
2. Remove Paul from the money flow entirely
3. Provide tax receipts to donors
4. Support per-mile or milestone-based giving

## Why It Doesn't Work — 7 Clear Reasons

### 1. Paul Becomes the Bank Account

Pledge.to's Donate API does **not** charge the donors. It charges **your** account.

When a visitor "donates" through Pledge.to on our site, Pledge.to records it, aggregates all donations, and then charges Paul's credit card or bank account for the total. Paul would literally be paying for everyone's donations out of pocket, then Pledge.to sends that money to foundations.

This is the exact opposite of our model. Paul never touches foundation money. Period.

> "Charges your card on file (or pull funds via ACH) for all accrued donations."
> — Pledge.to documentation

### 2. 5% Fee Eats Into Donations

Pledge.to takes 5% of every donation, plus payment processing fees. On a $50,000 pledge goal, that's $2,500+ that never reaches the foundations. Our model has zero fees — pledgers donate directly to the foundations, 100% arrives.

### 3. Cancer Council NSW Is Not in Their System

Pledge.to works with verified US 501(c)(3) organizations. Cancer Council NSW is an Australian registered charity (ABN 51 116 463 846), not a US nonprofit. It almost certainly isn't in their database. Our 50/50 split between Tower Cancer Research Foundation (California) and Cancer Council NSW (Sydney) cannot be fulfilled through their platform.

### 4. It Does NOT Solve the Tax Deduction Problem

This was a key question. The answer is disappointing:

- Pledge.to says donations are "considered to be individual donations by those donors" for tax purposes — **but Paul's card is the one being charged**
- For Australian donors pledging to Cancer Council NSW, US-based Pledge.to provides zero tax benefit — Australian tax deductions require donations to Australian DGR-registered charities made directly
- For US donors, tax deductibility depends on donating directly to a 501(c)(3) — routing through Pledge.to via Paul's account creates an unclear tax situation
- **Direct donations to the foundations** give donors the cleanest, most defensible tax deduction in their respective jurisdictions

### 5. No Per-Mile or Milestone-Based Giving

Pledge.to supports:
- One-time donations
- Recurring donations (monthly/quarterly/annually)

It does **not** support:
- Per-mile pledges (donate $0.25 every time Paul walks a mile)
- Milestone triggers (donate $50 when Paul crosses into Oregon)
- Event-based giving tied to external data (GPS location, miles hiked)

We would need to build all that custom logic ourselves anyway, then call their API to create donations — which charges Paul's card. There is no benefit.

### 6. No Donor Location Data

We want to show pledger locations on the trail map as bubbles. Pledge.to's webhook payload only includes: `email`, `first_name`, `last_name`, `phone_number`, `amount`, `organization_id`. No city, no country, no coordinates. We'd need to collect location data ourselves anyway.

### 7. It Changes Our Model From "Pledge" to "Donate Now"

Our entire brand promise is: **pledge now, pay later, directly to foundations.** Pledge.to processes real payments immediately. Using it would mean asking visitors to pay money right now through a third party — fundamentally changing what YesChapter is.

The pledge model creates anticipation, community, and a shared journey. "Your pledge grows as Paul walks." That emotional arc disappears if we just collect money upfront.

---

## Summary

| Requirement | Pledge.to | Our Custom System |
|------------|-----------|-------------------|
| Paul never touches foundation money | No — Paul's card gets charged | Yes — pledgers pay foundations directly |
| Zero fees to foundations | No — 5% + processing fees | Yes — 100% reaches foundations |
| Supports Australian charities | No — US 501(c)(3) only | Yes — direct links to both foundations |
| Tax deductions for donors | Unclear/problematic | Clean — direct donations to registered charities |
| Per-mile pledges | No | Yes — already built |
| Milestone-based giving | No | Can be built |
| Donor location for map | No | Yes — via geolocation |
| Pledge-then-pay-later model | No — immediate payment | Yes — this is our core model |

**Verdict:** Pledge.to is designed for businesses that want to donate to charity on behalf of their customers (e.g., "we plant a tree for every purchase"). It is not designed for individual supporters making personal commitments to donate later. Our custom system is the right approach.
