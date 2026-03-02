"use client";

import { useState, useEffect } from "react";
import type { DonorPublic, DonationStats } from "@/lib/types";

interface DonorData {
  donors: DonorPublic[];
  stats: DonationStats;
}

export function useDonorData() {
  const [data, setData] = useState<DonorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchDonors() {
      try {
        const res = await fetch("/api/donors");
        if (res.ok && active) {
          const json: DonorData = await res.json();
          setData(json);
        }
      } catch {
        // Keep showing loading/fallback on error
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDonors();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
