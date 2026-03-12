"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface CountUpStatProps {
  end: number;
  label: string;
  color: string;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimals?: number;
}

export default function CountUpStat({
  end,
  label,
  color,
  prefix = "",
  suffix = "",
  separator = "",
  decimals = 0,
}: CountUpStatProps) {
  const { ref, displayValue } = useCountUp({ end, prefix, suffix, separator, decimals });

  return (
    <div ref={ref} className="flex flex-col items-center gap-[4px]">
      <span
        className="font-heading font-semibold text-[24px] md:text-[30px] lg:text-[36px] tracking-[-1px]"
        style={{ color }}
      >
        {displayValue}
      </span>
      <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[3px] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}
