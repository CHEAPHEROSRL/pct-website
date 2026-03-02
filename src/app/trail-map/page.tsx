"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const trailSections = [
  { name: "Southern California", info: "Mi 0 - 700 · Campo to Kennedy Meadows", center: [33.5, -117.0, 7] as [number, number, number] },
  { name: "Sierra Nevada", info: "Mi 700 - 1,100 · Kennedy Meadows to Tuolumne", center: [37.0, -118.5, 8] as [number, number, number] },
  { name: "Northern California", info: "Mi 1,100 - 1,691 · Tuolumne to Ashland", center: [40.0, -121.0, 7] as [number, number, number] },
  { name: "Oregon", info: "Mi 1,691 - 2,147 · Ashland to Cascade Locks", center: [43.9, -121.9, 7] as [number, number, number] },
  { name: "Washington", info: "Mi 2,147 - 2,650 · Cascade Locks to Manning Park", center: [47.3, -121.0, 7] as [number, number, number] },
];

const TrailMapView = dynamic(() => import("@/components/TrailMapView"), {
  ssr: false,
  loading: () => (
    <div className="relative flex items-center justify-center w-full h-full bg-[#E8E5E0]">
      {/* Static PCT route silhouette for instant visual feedback */}
      <svg
        viewBox="116 32 6 18"
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        preserveAspectRatio="xMidYMid meet"
      >
        <polyline
          points="116.467,32.589 116.48,32.72 116.52,32.88 116.60,33.05 116.68,33.24 116.70,33.35 116.72,33.47 116.80,33.60 116.83,33.82 116.85,33.92 117.05,34.02 117.30,34.18 117.45,34.24 117.68,34.32 117.82,34.37 118.06,34.43 118.25,34.68 118.38,34.78 118.52,34.82 118.08,36.02 118.18,36.45 118.25,36.58 118.40,36.74 118.52,37.00 118.60,37.24 118.68,37.50 118.78,37.74 119.33,37.87 119.60,38.18 119.90,38.65 120.12,39.15 120.25,39.50 120.55,39.95 121.30,40.42 121.50,40.78 122.05,41.18 122.28,41.55 122.38,41.85 122.68,42.18 122.15,42.55 122.10,42.87 122.12,43.10 121.98,43.55 121.78,44.05 121.78,44.48 121.85,44.82 121.82,45.10 121.90,45.67 121.70,45.85 121.52,46.15 121.48,46.38 121.38,46.72 121.18,47.05 121.08,47.35 120.92,47.55 120.75,47.85 120.68,48.15 120.62,48.42 120.72,48.65 120.78,48.85 121.05,49.00"
          fill="none"
          stroke="#C45C26"
          strokeWidth="0.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col items-center gap-3 z-10">
        <div className="w-8 h-8 border-2 border-[var(--burnt-orange)] border-t-transparent rounded-full animate-spin" />
        <span className="font-label font-medium text-[13px] text-[var(--text-muted)]">Loading interactive map...</span>
      </div>
    </div>
  ),
});

export default function TrailMapPage() {
  const [flyTo, setFlyTo] = useState<[number, number, number] | undefined>();

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Trail Map" />

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
            {trailSections.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setFlyTo(s.center)}
                className={`flex items-center justify-between px-[24px] py-[14px] border-b border-[var(--border-subtle)] w-full text-left cursor-pointer hover:bg-[var(--forest-green-light)] transition-colors ${i === 0 ? "bg-[var(--forest-green-light)]" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{s.name}</span>
                  <span className="font-label text-[11px] text-[var(--text-muted)]">{s.info}</span>
                </div>
                {i === 0 && (
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)] bg-[var(--forest-green)] px-[8px] py-[3px]">CURRENT</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="relative flex-1 h-[400px] md:h-[500px] lg:h-full overflow-hidden bg-[#E8E5E0]">
          <TrailMapView flyTo={flyTo} />
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

      <Footer />
    </div>
  );
}
