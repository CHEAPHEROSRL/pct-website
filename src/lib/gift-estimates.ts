/**
 * Estimated trail supply needs for a 2,650-mile, ~150-day PCT thru-hike.
 * Keys match the `giftTitle` strings used in Stripe metadata and SupportRecord.
 */

export interface GiftEstimate {
  needed: number;
  slug: string;
  reasoning: string;
}

export const GIFT_ESTIMATES: Record<string, GiftEstimate> = {
  "A Trail Meal": {
    needed: 450,
    slug: "trail-meal",
    reasoning: "3 meals/day × 150 days",
  },
  "Hiking Socks": {
    needed: 25,
    slug: "hiking-socks",
    reasoning: "Replace every ~100 miles",
  },
  "A Night at Camp": {
    needed: 120,
    slug: "camp-night",
    reasoning: "~80% of nights on trail",
  },
  "A Resupply Box": {
    needed: 30,
    slug: "resupply-box",
    reasoning: "Every ~100 miles",
  },
  "A Rest Day in Town": {
    needed: 15,
    slug: "rest-day",
    reasoning: "Every 1–2 weeks",
  },
  "Trail Boots": {
    needed: 5,
    slug: "trail-boots",
    reasoning: "Replace every ~500 miles",
  },
};

/** All known gift titles for type-safe lookups */
export const GIFT_TITLES = Object.keys(GIFT_ESTIMATES);
