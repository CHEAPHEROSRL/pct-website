"use client";

import { useState, useEffect } from "react";

// March 24, 2026 at 8:00 AM PST (UTC-8) = 16:00 UTC
const TRAIL_START = new Date("2026-03-24T16:00:00Z").getTime();

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function useCountdown(): CountdownValues {
  // Start with null to avoid hydration mismatch (server time ≠ client time)
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Before mount, return zeros to match server render
  if (now === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false };
  }

  const diff = TRAIL_START - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
}
