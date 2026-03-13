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

// Challenge types

export type ChallengeStatus = "active" | "succeeded" | "failed" | "cancelled";

export interface ChallengeRecord {
  id: string;
  title: string;
  description: string;
  targetMiles: number;
  startMile: number;
  currentMiles: number;
  deadline: number;
  status: ChallengeStatus;
  commitmentCount: number;
  createdAt: number;
  resolvedAt: number | null;
}

export interface ChallengePublic {
  id: string;
  title: string;
  description: string;
  targetMiles: number;
  startMile: number;
  currentMiles: number;
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
