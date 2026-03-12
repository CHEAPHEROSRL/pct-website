"use client";

import { useEffect, useRef } from "react";

interface ParallaxOptions {
  speed?: number;
  max?: number;
}

export function useParallax({ speed = 0.3, max = 80 }: ParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Only compute when element is in viewport
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        const center = rect.top + rect.height / 2;
        const viewCenter = windowHeight / 2;
        const offset = (center - viewCenter) * speed;
        const clamped = Math.max(-max, Math.min(max, offset));

        el.style.transform = `translateY(${clamped}px)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial position

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, max]);

  return { ref };
}
