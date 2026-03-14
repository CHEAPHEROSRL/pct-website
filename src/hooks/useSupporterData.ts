"use client";

import { useState, useEffect } from "react";
import type { SupporterPublic, SupportStats } from "@/lib/types";

interface SupporterData {
  supporters: SupporterPublic[];
  stats: SupportStats;
  giftCounts: Record<string, number>;
}

export function useSupporterData() {
  const [data, setData] = useState<SupporterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchSupporters() {
      try {
        const res = await fetch("/api/donors");
        if (res.ok && active) {
          const json: SupporterData = await res.json();
          setData(json);
        }
      } catch {
        // Keep showing loading/fallback on error
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSupporters();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
