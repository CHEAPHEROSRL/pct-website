"use client";

import Link from "next/link";
import { Mountain, ArrowRight } from "lucide-react";
import useCountdown from "@/hooks/useCountdown";
import ChallengeBanner from "@/components/ChallengeBanner";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function CountdownBanner({ belowFixedHeader }: { belowFixedHeader?: boolean }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown();

  // Once the hike starts, show the challenge banner instead
  if (isExpired) return <ChallengeBanner belowFixedHeader={belowFixedHeader} />;

  return (
    <div className={`flex items-center justify-center gap-[16px] sm:gap-[32px] w-full px-4 sm:px-6 md:px-12 lg:px-[80px] py-[12px] bg-[var(--bg-dark)] ${belowFixedHeader ? "relative z-40" : ""}`}>
      {/* Left: label */}
      <div className="hidden sm:flex items-center gap-[10px]">
        <Mountain className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[#FFFFFFCC]">
          PAUL HITS THE TRAIL IN
        </span>
      </div>

      {/* Numbers */}
      <div className="flex items-center gap-[10px] sm:gap-[14px]">
        <div className="flex items-end gap-[4px]">
          <span className="font-label font-bold text-[22px] sm:text-[26px] text-[var(--burnt-orange)]">
            {pad(days)}
          </span>
          <span className="font-label font-semibold text-[11px] sm:text-[12px] text-[#FFFFFF55] pb-[3px]">
            d
          </span>
        </div>
        <span className="font-label font-bold text-[18px] text-[#FFFFFF33]">:</span>
        <div className="flex items-end gap-[4px]">
          <span className="font-label font-bold text-[22px] sm:text-[26px] text-[var(--burnt-orange)]">
            {pad(hours)}
          </span>
          <span className="font-label font-semibold text-[11px] sm:text-[12px] text-[#FFFFFF55] pb-[3px]">
            h
          </span>
        </div>
        <span className="font-label font-bold text-[18px] text-[#FFFFFF33]">:</span>
        <div className="flex items-end gap-[4px]">
          <span className="font-label font-bold text-[22px] sm:text-[26px] text-[var(--burnt-orange)]">
            {pad(minutes)}
          </span>
          <span className="font-label font-semibold text-[11px] sm:text-[12px] text-[#FFFFFF55] pb-[3px]">
            m
          </span>
        </div>
        <span className="font-label font-bold text-[18px] text-[#FFFFFF33]">:</span>
        <div className="flex items-end gap-[4px]">
          <span className="font-label font-bold text-[22px] sm:text-[26px] text-[var(--burnt-orange)]">
            {pad(seconds)}
          </span>
          <span className="font-label font-semibold text-[11px] sm:text-[12px] text-[#FFFFFF55] pb-[3px]">
            s
          </span>
        </div>
      </div>

      {/* Divider + CTA */}
      <div className="hidden md:block w-[1px] h-[24px] bg-[#FFFFFF22]" />
      <Link
        href="/pledge"
        className="hidden md:flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[16px] py-[6px] hover:opacity-90 transition-opacity"
      >
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">
          PLEDGE NOW
        </span>
        <ArrowRight className="w-[12px] h-[12px] text-[var(--text-white)]" />
      </Link>
    </div>
  );
}
