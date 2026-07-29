export interface GpsPoint {
  lat: number;
  lng: number;
  altitude: number | null;
  timestamp: number;
  accuracy: number | null;
}

export interface TrailStats {
  totalMiles: number;
  currentElevation: number;
  dayNumber: number;
  todayDistance: number;
  todayElevationGain: number;
  lastUpdated: number | null;
  nearestLocationName: string;
}

export interface LocationData {
  current: GpsPoint | null;
  stats: TrailStats;
}

// Trail support gift types

export interface SupportRecord {
  id: string;
  name: string;
  email: string;
  amount: number;
  message: string;
  anonymous: boolean;
  color: string;
  giftTitle: string | null;
  createdAt: number;
  trailLat?: number;
  trailLng?: number;
  trailMile?: number;
  mediaUrl?: string;
  mediaType?: "image" | "video_link";
  videoUrl?: string;
  mediaApproved?: boolean;
}

export interface SupportGiftLocation {
  giftTitle: string;
  name: string;
  amount: number;
  lat: number;
  lng: number;
  trailMile: number;
  date: string;
  message?: string;
  mediaUrl?: string;
  videoUrl?: string;
}

export interface SupporterPublic {
  name: string;
  amount: string;
  amountNum: number;
  date: string;
  message: string;
  color: string;
}

export interface SupportStats {
  totalGifts: number;
  supporterCount: number;
  averageGift: number;
  largestGift: number;
}

// Journal types

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  dayNumber: number;
  date: string;
  body: string;
  excerpt: string;
  coverImage: string;
  images: string[];
  youtubeUrl: string;
  tags: string[];
  published: boolean;
  createdAt: number;
  updatedAt: number;
  /**
   * Cumulative mile on the PCT this post is anchored to. Used to render
   * blog post markers on the trail map at the right position. Auto-set
   * when the post is created (from the day-mileage lookup or current
   * simulated mile), can be manually overridden in the admin editor.
   */
  mileMarker?: number;
}

export interface JournalPostPublic {
  id: string;
  title: string;
  slug: string;
  dayNumber: number;
  date: string;
  excerpt: string;
  coverImage: string;
  youtubeUrl: string;
  tags: string[];
  isDraft?: boolean;
  mileMarker?: number;
}

export interface JournalPostDetail {
  id: string;
  title: string;
  slug: string;
  dayNumber: number;
  date: string;
  body: string;
  excerpt: string;
  coverImage: string;
  images: string[];
  youtubeUrl: string;
  tags: string[];
  isDraft?: boolean;
  mileMarker?: number;
}

export interface PostNavLink {
  slug: string;
  title: string;
  dayNumber: number;
}

export interface JournalPostDetailResponse {
  post: JournalPostDetail;
  prevPost: PostNavLink | null;
  nextPost: PostNavLink | null;
}

// Pledge types

export interface PledgeBoost {
  challengeId: string;
  challengeTitle: string;
  addedAmount: number;
  addedAt: number;
}

export interface PledgeRecord {
  id: string;
  email: string;
  name: string;
  amount: number;
  interval: number;
  totalPledge: number;
  anonymous: boolean;
  boosts: PledgeBoost[];
  message?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  avatar?: string;
  honored?: boolean;
  honoredAt?: number;
  unsubscribeToken?: string;
  emailPreference?: "all" | "milestones" | "finish";
  referredBy?: string;
  /**
   * ID of the trail section the pledger claimed (matches trailSections in
   * src/lib/trail.ts). Optional — omitted when no preference. Appears as
   * a pin on the live map once Paul passes that landmark's mile marker.
   */
  claimedSection?: string;
  /**
   * Set to true when the pledger's calculator crossed the US$5,000
   * sponsorship threshold at submit time. Doesn't matter whether they
   * clicked the sponsorship path or pledged anyway — the flag is purely a
   * "this person is a sponsorship lead" marker so Paul can spot them in
   * the admin and consider a personal follow-up. Absent on pledges below
   * the threshold.
   */
  seenSponsorCTA?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PledgerLocation {
  name: string;
  message?: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  avatar?: string;
}

/**
 * One country-aggregated entry for the PLEDGERS world map. Replaces the
 * earlier "one pin per pledger" model — we now collapse all pledgers from
 * a country down to a single pin at the country's geographic center, with
 * a count badge. Privacy-friendly (no individual IP-derived location ever
 * appears on the map) and visually quiet (the PCT trail stays the hero).
 */
export interface CountryAggregate {
  /** ISO 3166-1 alpha-2 code, e.g. "US" */
  code: string;
  /** Display name from COUNTRY_CENTERS — used in tooltips */
  name: string;
  /** Number of confirmed pledgers from this country */
  count: number;
  /** Country geographic centroid lat */
  lat: number;
  /** Country geographic centroid lng */
  lng: number;
}

export interface PledgePublic {
  name: string;
  rate: string;
  totalPledge: number;
  boostCount: number;
  createdAt: number;
}

export interface PledgeStats {
  pledgerCount: number;
  totalPledged: number;
  averagePledge: number;
  totalBoosts: number;
}

/**
 * Someone who filled in the pledge form but never clicked the confirmation
 * link in their email, so their pledge never became real.
 *
 * Kept in a Redis hash with NO expiry, deliberately. The `pending:<hash>`
 * record it shadows does expire, and before this existed an unconfirmed
 * pledge vanished without trace — leaving Paul with people telling him
 * "I pledged!" and no way to find them. This is that missing list.
 *
 * Removed the moment the pledge is confirmed, so the list only ever holds
 * people who genuinely need chasing.
 */
export interface UnconfirmedPledge {
  /** Same email hash used for pledger:<id>, so it survives a re-submit. */
  id: string;
  email: string;
  name: string;
  rate: string;
  totalPledge: number;
  /** First time they submitted the form. */
  createdAt: number;
  /** Most recent submit or resend — what "reminded 2h ago" is measured from. */
  lastSentAt: number;
  /** How many verification emails have gone out, including the first. */
  sendCount: number;
}

// Contact form types

/**
 * One submission from /contact, persisted in Redis with a 90-day TTL.
 * Stored regardless of whether Gmail delivery succeeded — if it failed,
 * `deliveryStatus: "failed"` + `sendError` tells Paul there's a message
 * that never reached his inbox and he should follow up manually.
 */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
  /** When Paul first opened the detail view in admin. Optional — null = unread. */
  readAt?: number;
  /** When Paul marked the conversation as replied. Optional — null = open. */
  repliedAt?: number;
  /** "sent" when Gmail accepted the message; "failed" when dispatch errored. */
  deliveryStatus: "sent" | "failed";
  /** Only set when deliveryStatus = "failed". The Gmail error message. */
  sendError?: string;
}

// Comment types

export interface PledgerComment {
  id: string;
  pledgeId: string;
  name: string;
  /** Display name with optional city suffix */
  displayName: string;
  body: string;
  createdAt: number;
}

// Auth / Session types

export interface AuthSession {
  sessionId: string;
  email: string;
  name: string;
  pledgeId: string | null;
  createdAt: number;
  expiresAt: number;
}

// Challenge types

export type ChallengeStatus = "active" | "succeeded" | "failed" | "cancelled";

export type ChallengeType = "distance" | "elevation" | "location" | "custom";

export interface ChallengeRecord {
  id: string;
  title: string;
  description: string;
  target: number;
  start: number;
  current: number;
  unit: string;
  challengeType: ChallengeType;
  deadline: number;
  status: ChallengeStatus;
  commitmentCount: number;
  createdAt: number;
  resolvedAt: number | null;
  // Backward compat: old records may have these
  targetMiles?: number;
  startMile?: number;
  currentMiles?: number;
}

export interface ChallengePublic {
  id: string;
  title: string;
  description: string;
  target: number;
  start: number;
  current: number;
  unit: string;
  challengeType: ChallengeType;
  deadline: number;
  status: ChallengeStatus;
  commitmentCount: number;
  createdAt: number;
  resolvedAt: number | null;
}

export interface ChallengeCommitment {
  pledgerId: string;
  pledgerName: string;
  challengeId: string;
  boostAmount: number;
  committedAt: number;
}
