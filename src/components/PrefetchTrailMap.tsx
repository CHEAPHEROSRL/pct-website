"use client";

import { useEffect } from "react";

export default function PrefetchTrailMap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefetch = () => {
      import("@/components/TrailMapView").catch(() => {
        // Silently ignore — this is just a prefetch optimization
      });
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 2000);
      return () => clearTimeout(id);
    }
  }, []);

  return null;
}
