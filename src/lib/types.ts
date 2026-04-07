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
