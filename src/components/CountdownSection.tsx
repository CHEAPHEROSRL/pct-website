"use client";

import { Mountain } from "lucide-react";
import useCountdown from "@/hooks/useCountdown";
import ScrollReveal from "@/components/ScrollReveal";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-[8px]">
      <div className="flex items-center justify-center w-[80px] h-[70px] sm:w-[110px] sm:h-[90px] lg:w-[140px] lg:h-[110px] bg-[#FFFFFF0D] rounded-[8px] border border-[#FFFFFF1A]">
        <span className="font-label font-bold text-[32px] sm:text-[44px] lg:text-[56px] text-[var(--burnt-orange)]">
          {value}
        </span>
      </div>
      <span className="font-label font-bold text-[10px] sm:text-[11px] lg:text-[13px] tracking-[3px] sm:tracking-[4px] text-[#FFFFFF55]">
        {label}
      </span>
    </div>
  );
}

export default function CountdownSection() {
  const { days, hours, minutes, seconds, isExpired } = useCountdown();

  // Don't render after the hike starts
  if (isExpired) return null;

  return (
    <section className="flex flex-col items-center gap-[28px] sm:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[40px] sm:py-[48px] bg-[var(--bg-dark)] w-full">
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col items-center gap-[14px]">
          <Mountain className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] text-[var(--burnt-orange)]" />
          <span className="font-label font-bold text-[12px] sm:text-[14px] tracking-[3px] sm:tracking-[4px] text-[var(--burnt-orange)] text-center">
            THE COUNTDOWN IS ON
          </span>
          <p className="font-heading text-[16px] sm:text-[18px] lg:text-[20px] text-[#FFFFFFBB] text-center">
            Until Paul begins walking 2,650 miles for cancer
          </p>
        </div>
      </ScrollReveal>

      <div className="flex items-center gap-[8px] sm:gap-[16px] lg:gap-[20px]">
        <TimeBox value={pad(days)} label="DAYS" />
        <span className="font-label font-bold text-[24px] sm:text-[36px] lg:text-[48px] text-[#FFFFFF33]">:</span>
        <TimeBox value={pad(hours)} label="HOURS" />
        <span className="font-label font-bold text-[24px] sm:text-[36px] lg:text-[48px] text-[#FFFFFF33]">:</span>
        <TimeBox value={pad(minutes)} label="MINUTES" />
        <span className="font-label font-bold text-[24px] sm:text-[36px] lg:text-[48px] text-[#FFFFFF33]">:</span>
        <TimeBox value={pad(seconds)} label="SECONDS" />
      </div>

      <p className="font-heading text-[13px] sm:text-[15px] text-[#FFFFFF44] text-center">
        Mexico &rarr; Canada &middot; Pacific Crest Trail &middot; March 2026
      </p>
    </section>
  );
}
