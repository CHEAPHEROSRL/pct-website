"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "./useScrollReveal";

interface CountUpOptions {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimals?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(n: number, decimals: number, separator: string): string {
  const fixed = n.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return dec ? `${withSep}.${dec}` : withSep;
}

export function useCountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
  separator = ",",
  decimals = 0,
}: CountUpOptions) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(`${prefix}${formatNumber(end, decimals, separator)}${suffix}`);
      return;
    }

    let start: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = eased * end;

      setDisplayValue(`${prefix}${formatNumber(current, decimals, separator)}${suffix}`);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, end, duration, prefix, suffix, separator, decimals]);

  return { ref, displayValue };
}
