"use client";

import { useEffect, useRef } from "react";

interface ParallaxOptions {
  speed?: number;
  max?: number;
  scaleRange?: [number, number];
}

export function useParallax({
  speed = 0.35,
  max = 120,
  scaleRange = [1.12, 1.22],
}: ParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;
    let lastTransform = "";

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Only compute when element is in viewport
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        // progress: 0 = element top at viewport bottom, 1 = element bottom at viewport top
        const totalTravel = windowHeight + rect.height;
        const progress = 1 - (rect.bottom / totalTravel);
        const clamped01 = Math.max(0, Math.min(1, progress));

        // Ease-out cubic for organic, decelerating motion
        const eased = 1 - Math.pow(1 - clamped01, 3);

        // Vertical offset — maps eased 0→1 to -max → +max
        const yOffset = (eased - 0.5) * 2 * max;

        // Scale — subtle zoom-in as you scroll past, creating depth
        const [scaleMin, scaleMax] = scaleRange;
        const scale = scaleMin + eased * (scaleMax - scaleMin);

        const transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        if (transform !== lastTransform) {
          el.style.transform = transform;
          lastTransform = transform;
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial position

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, max, scaleRange]);

  return { ref };
}
