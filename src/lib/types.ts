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

// Donation types

export interface DonationRecord {
  id: string;
  name: string;
  email: string;
  amount: number;
  message: string;
  anonymous: boolean;
  color: string;
  createdAt: number;
}

export interface DonorPublic {
  name: string;
  amount: string;
  amountNum: number;
  date: string;
  message: string;
  color: string;
}

export interface DonationStats {
  totalRaised: number;
  donorCount: number;
  averageDonation: number;
  largestDonation: number;
  goalAmount: number;
}
