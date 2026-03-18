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

export default function HomeTrailProgress() {
  const { data } = useLocationData(30000);

  const stats = data?.stats;
  const totalMiles = stats?.totalMiles ?? 0;
  const progressPercent = Math.round((totalMiles / 2650) * 1000) / 10;
  const locationName = stats?.nearestLocationName ?? "Campo, CA";
  const dayNumber = stats?.dayNumber ?? 0;

  return (
    <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
      <div className="flex flex-col gap-[8px]">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL PROGRESS</span>
        <h2 className="font-heading font-semibold text-[24px] md:text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">
          Follow Paul on the Trail
        </h2>
        <p className="font-label text-[13px] tracking-[0.5px] text-[var(--text-muted)]">
          Live GPS · Updates every 30 seconds
        </p>
      </div>

      {/* Full-width map */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-[#E8E5E0] border border-[var(--border-subtle)] overflow-hidden">
        <TrailMapView
          currentPosition={data?.current ? { lat: data.current.lat, lng: data.current.lng } : null}
          dayNumber={dayNumber}
          nearestLocationName={locationName}
          totalMiles={totalMiles}
          currentElevation={stats?.currentElevation}
        />
      </div>

      {/* Compact stats strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[24px] py-[16px]">
        <div className="flex flex-col gap-[2px]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">NEAR</span>
          <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">{locationName}</span>
        </div>
        <div className="hidden md:block w-[1px] h-[32px] bg-[var(--border-subtle)]" />
        <div className="flex flex-col gap-[2px] items-center">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">MILES WALKED</span>
          <span className="font-heading font-semibold text-[18px] text-[var(--burnt-orange)]">
            {totalMiles.toLocaleString("en-US")} / 2,650
          </span>
        </div>
        <div className="hidden md:block w-[1px] h-[32px] bg-[var(--border-subtle)]" />
        <div className="flex flex-col gap-[6px] items-center">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">PROGRESS</span>
          <div className="relative w-[160px] md:w-[200px] h-[6px] bg-[#E8E5E0]">
            <div
              className="absolute top-0 left-0 h-[6px] bg-[var(--forest-green)] transition-all duration-1000"
              style={{ width: `max(4px, ${progressPercent}%)` }}
            />
          </div>
        </div>
        <div className="hidden md:block w-[1px] h-[32px] bg-[var(--border-subtle)]" />
        <div className="flex flex-col gap-[2px] items-center">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">DAY</span>
          <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
            {dayNumber > 0 ? dayNumber : "—"}
          </span>
        </div>
        <Link
          href="/trail-map"
          className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[20px] py-[10px] hover:bg-[var(--bg-warm)] transition-colors ml-auto"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">FULL MAP</span>
          <ArrowRight className="w-[13px] h-[13px] text-[var(--text-secondary)]" />
        </Link>
      </div>
    </section>
  );
}
