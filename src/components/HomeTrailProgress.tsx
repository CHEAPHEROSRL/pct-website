"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocationData } from "@/hooks/useLocationData";

const TrailMapView = dynamic(() => import("@/components/TrailMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#E8E5E0]">
      <div className="w-8 h-8 border-2 border-[var(--burnt-orange)] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const milestones = [
  { name: "Campo, CA", mile: 0 },
  { name: "Kennedy Meadows", mile: 702 },
  { name: "Ashland, OR", mile: 1719 },
  { name: "Manning Park, BC", mile: 2650 },
];

export default function HomeTrailProgress() {
  const { data } = useLocationData(30000);

  const stats = data?.stats;
  const totalMiles = stats?.totalMiles ?? 0;
  const progressPercent = Math.round((totalMiles / 2650) * 1000) / 10;
  const locationName = stats?.nearestLocationName ?? "Campo, CA";
  const dayNumber = stats?.dayNumber ?? 0;

  return (
    <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-warm)] w-full">
      <div className="flex flex-col items-center gap-[16px] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL PROGRESS</span>
        <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Follow Paul on the Trail
        </h2>
        <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center">
          Track the journey in real-time as Paul walks from Mexico to Canada.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[32px] w-full">
        {/* Live Map */}
        <div className="relative w-full lg:w-[720px] h-[300px] md:h-[400px] lg:h-[560px] bg-[#E8E5E0] border border-[var(--border-subtle)] overflow-hidden shrink-0">
          <TrailMapView
            currentPosition={data?.current ? { lat: data.current.lat, lng: data.current.lng } : null}
            dayNumber={dayNumber}
            nearestLocationName={locationName}
            totalMiles={totalMiles}
            currentElevation={stats?.currentElevation}
          />
        </div>

        {/* Map Sidebar */}
        <div className="flex flex-col gap-[24px] flex-1">
          {/* Current Location */}
          <div className="flex flex-col gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">CURRENT LOCATION</span>
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">{locationName}</span>
            <span className="font-heading text-[15px] text-[var(--text-secondary)]">
              Mile {totalMiles.toLocaleString()} of 2,650
            </span>
            <div className="relative w-full h-[8px] bg-[#E8E5E0]">
              <div
                className="absolute top-0 left-0 h-[8px] bg-[var(--forest-green)] transition-all duration-1000"
                style={{ width: `max(10px, ${progressPercent}%)` }}
              />
            </div>
            <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
              {progressPercent}% Complete{dayNumber > 0 ? ` — Day ${dayNumber}` : " — Journey begins March 28, 2026"}
            </span>
          </div>

          {/* Key Milestones */}
          <div className="flex flex-col gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">KEY MILESTONES</span>
            {milestones.map((m) => {
              const reached = totalMiles >= m.mile;
              return (
                <div key={m.name} className="flex items-center gap-[12px]">
                  <div className={`w-[10px] h-[10px] shrink-0 ${reached ? "bg-[var(--forest-green)]" : "bg-[#D9D7D4]"}`} />
                  <span className={`font-heading text-[14px] ${reached ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {m.name} — Mile {m.mile.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Link to full map */}
          <Link
            href="/trail-map"
            className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[14px] hover:bg-[var(--bg-white)] transition-colors"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">VIEW FULL TRAIL MAP</span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
