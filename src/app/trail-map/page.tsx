"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Mountain, Heart } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const TrailMapView = dynamic(() => import("@/components/TrailMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#E8E5E0]">
      <span className="font-label font-medium text-[14px] text-[var(--text-muted)]">Loading map...</span>
    </div>
  ),
});

export default function TrailMapPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 lg:px-[80px] py-[16px] md:py-[20px] bg-[#FFFFFFEE] w-full relative z-50">
        <Link href="/" className="flex items-center gap-[12px]">
          <Mountain className="w-[28px] h-[28px] text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[16px] tracking-[3px] text-[var(--text-primary)]">PAUL BARRY</span>
          <span className="font-label font-medium text-[11px] tracking-[2px] text-[var(--text-muted)] hidden sm:inline">PCT 2026</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-[40px]">
          <Link href="/" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">The Journey</Link>
          <span className="font-heading text-[15px] font-semibold text-[var(--burnt-orange)]">Trail Map</span>
          <Link href="/the-cause" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">The Cause</Link>
          <Link href="/journal" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Journal</Link>
          <Link href="/donors" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Donors</Link>
          <Link href="/donate" className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        </nav>
        <MobileNav activeItem="Trail Map" />
      </header>

      {/* Map Main */}
      <div className="flex flex-col lg:flex-row w-full lg:h-[800px]">
        {/* Sidebar */}
        <div className="flex flex-col w-full lg:w-[400px] max-h-[300px] lg:max-h-none lg:h-full bg-[var(--bg-white)] border-r border-[var(--border-subtle)] shrink-0 overflow-auto">
          {/* Sidebar Header */}
          <div className="flex flex-col gap-[12px] px-[24px] pt-[24px] pb-[16px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL PROGRESS</span>
            <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">Pacific Crest Trail</span>
            {/* Progress bar */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="relative w-full h-[6px] bg-[#E8E5E0]">
                <div className="absolute top-0 left-0 h-[6px] bg-[var(--forest-green)] w-[6px]" />
              </div>
              <div className="flex justify-between w-full">
                <span className="font-label font-medium text-[11px] text-[var(--text-muted)]">Mile 0</span>
                <span className="font-label font-semibold text-[11px] text-[var(--forest-green)]">1.6%</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

          {/* Trail Sections */}
          <div className="flex flex-col w-full overflow-hidden">
            <div className="px-[24px] py-[12px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TRAIL SECTIONS</span>
            </div>
            <div className="flex items-center justify-between px-[24px] py-[14px] bg-[var(--forest-green-light)] border-b border-[var(--border-subtle)]">
              <div className="flex flex-col">
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">Southern California</span>
                <span className="font-label text-[11px] text-[var(--text-muted)]">Mi 0 - 700 · Campo to Kennedy Meadows</span>
              </div>
              <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)] bg-[var(--forest-green)] px-[8px] py-[3px]">CURRENT</span>
            </div>
            {[
              { name: "Sierra Nevada", info: "Mi 700 - 1,100 · Kennedy Meadows to Tuolumne" },
              { name: "Northern California", info: "Mi 1,100 - 1,691 · Tuolumne to Ashland" },
              { name: "Oregon", info: "Mi 1,691 - 2,147 · Ashland to Cascade Locks" },
              { name: "Washington", info: "Mi 2,147 - 2,650 · Cascade Locks to Manning Park" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between px-[24px] py-[14px] border-b border-[var(--border-subtle)]">
                <div className="flex flex-col">
                  <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{s.name}</span>
                  <span className="font-label text-[11px] text-[var(--text-muted)]">{s.info}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="relative flex-1 h-[400px] md:h-[500px] lg:h-full overflow-hidden bg-[#E8E5E0]">
          <TrailMapView />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6 md:px-12 lg:px-[80px] py-[20px] md:py-[24px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">TODAY&apos;S DISTANCE</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">18.4 mi</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">ELEVATION GAIN</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">+2,340 ft</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">TOTAL MILES</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--forest-green)]">42.7 / 2,650</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">CURRENT ELEVATION</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">3,845 ft</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">DAY</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--burnt-orange)]">3 of ~180</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-6 md:px-12 lg:px-[80px] py-[24px] bg-[var(--bg-dark)] w-full">
        <span className="font-label text-[13px] text-[#FFFFFF80]">2026 Paul Barry &middot; Walking for a Cause</span>
        <div className="flex items-center gap-[24px] md:gap-[32px]">
          <Link href="/" className="font-label font-medium text-[13px] text-[#FFFFFF80]">Home</Link>
          <Link href="/journal" className="font-label font-medium text-[13px] text-[#FFFFFF80]">Journal</Link>
          <Link href="/donate" className="font-label font-medium text-[13px] text-[#FFFFFFCC]">Donate</Link>
          <Link href="/the-cause" className="font-label font-medium text-[13px] text-[#FFFFFF80]">The Cause</Link>
        </div>
      </footer>
    </div>
  );
}
