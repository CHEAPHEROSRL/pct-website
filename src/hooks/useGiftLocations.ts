"use client";

import { useState, useEffect } from "react";
import type { SupportGiftLocation } from "@/lib/types";

export function useGiftLocations() {
  const [locations, setLocations] = useState<SupportGiftLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchLocations() {
      try {
        const res = await fetch("/api/supporters/locations");
        if (res.ok && active) {
          const json = await res.json();
          setLocations(json.locations || []);
        }
      } catch {
        // Keep showing empty/fallback on error
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLocations();
    return () => {
      active = false;
    };
  }, []);

  return { locations, loading };
}
