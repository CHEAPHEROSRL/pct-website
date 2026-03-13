"use client";

import { Mountain } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-warm)] px-6">
      <div className="flex flex-col items-center gap-[24px] max-w-[480px] text-center">
        <Mountain className="w-[48px] h-[48px] text-[var(--burnt-orange)]" />
        <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
          Trail Detour
        </h1>
        <p className="font-heading text-[16px] text-[var(--text-secondary)] leading-[1.6]">
          Something went wrong loading this page. Even the best hikers hit unexpected obstacles — let&apos;s get back on the trail.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
            TRY AGAIN
          </span>
        </button>
      </div>
    </div>
  );
}
