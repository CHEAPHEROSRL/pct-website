"use client";

import { useState, useEffect } from "react";
import type { LocationData } from "@/lib/types";

export function useLocationData(pollIntervalMs = 30000) {
  const [data, setData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchLocation = async () => {
      try {
        const res = await fetch("/api/location");
        if (res.ok && active) {
          const json: LocationData = await res.json();
          setData(json);
        }
      } catch {
        // Keep showing last known data on failure
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, pollIntervalMs);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return { data, loading };
}
