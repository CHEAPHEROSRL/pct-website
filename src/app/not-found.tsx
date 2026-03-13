import Link from "next/link";
import { Mountain } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-warm)] px-6">
      <div className="flex flex-col items-center gap-[24px] max-w-[480px] text-center">
        <Mountain className="w-[48px] h-[48px] text-[var(--text-muted)]" />
        <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
          Off Trail
        </h1>
        <p className="font-heading text-[16px] text-[var(--text-secondary)] leading-[1.6]">
          This page doesn&apos;t exist — like a trail marker that&apos;s gone missing. Let&apos;s get you back on the path.
        </p>
        <div className="flex flex-col sm:flex-row gap-[12px]">
          <Link
            href="/"
            className="flex items-center justify-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
              BACK TO HOME
            </span>
          </Link>
          <Link
            href="/trail-map"
            className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[28px] py-[12px] hover:bg-[var(--bg-card)] transition-colors"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
              VIEW TRAIL MAP
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
