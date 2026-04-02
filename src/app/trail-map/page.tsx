"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Heart, Footprints, Mountain, Flame, Clock, TrendingUp, MapPin, Milestone, CalendarDays, Ruler, ArrowUp, Gift } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CountUpStat from "@/components/CountUpStat";
import { useLocationData } from "@/hooks/useLocationData";
import { useGiftLocations } from "@/hooks/useGiftLocations";
import { getTrailFundingPercent } from "@/lib/trail-funding";
import { getTrailSectionIndex } from "@/lib/trail";
import DistanceTracker from "@/components/DistanceTracker";
import type { PledgerLocation } from "@/lib/types";

type MapMode = "trail" | "pledgers" | "supporters";

const GIFT_EMOJI_MAP: Record<string, string> = {
  "A Trail Meal": "🍽️",
  "Hiking Socks": "🧦",
  "A Night at Camp": "⛺",
  "A Resupply Box": "📦",
  "A Rest Day in Town": "🛏️",
  "Trail Boots": "🥾",
};

const trailSections = [
  { name: "Southern California", info: "Mi 0 - 700 · Campo to Kennedy Meadows", center: [33.5, -117.0, 7] as [number, number, number] },
  { name: "Sierra Nevada", info: "Mi 700 - 1,100 · Kennedy Meadows to Tuolumne", center: [37.0, -118.5, 8] as [number, number, number] },
  { name: "Northern California", info: "Mi 1,100 - 1,691 · Tuolumne to Ashland", center: [40.0, -121.0, 7] as [number, number, number] },
  { name: "Oregon", info: "Mi 1,691 - 2,147 · Ashland to Cascade Locks", center: [43.9, -121.9, 7] as [number, number, number] },
  { name: "Washington", info: "Mi 2,147 - 2,650 · Cascade Locks to Manning Park", center: [47.3, -121.0, 7] as [number, number, number] },
];

const fallbackPledgerLocations: PledgerLocation[] = [];

const TrailMapView = dynamic(() => import("@/components/TrailMapView"), {
  ssr: false,
  loading: () => (
    <div className="relative flex items-center justify-center w-full h-full bg-[#E8E5E0]">
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
  const [mode, setMode] = useState<MapMode>("trail");
  const { data } = useLocationData(30000);

  // Pledger locations
  const [pledgerLocations, setPledgerLocations] = useState<PledgerLocation[]>([]);
  const [countryCount, setCountryCount] = useState(0);
  const [totalPledged, setTotalPledged] = useState(0);

  // Track whether pledgers world-view has been shown once — sticky map
  const pledgersVisited = useRef(false);

  // Gift locations for supporters mode
  const { locations: giftLocations } = useGiftLocations();

  useEffect(() => {
    fetch("/api/pledges/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.locations && data.locations.length > 0) {
          setPledgerLocations(data.locations);
          setCountryCount(data.countryCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/pledges/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats?.totalPledged) setTotalPledged(data.stats.totalPledged);
      })
      .catch(() => {});
  }, []);

  const displayLocations = pledgerLocations.length > 0 ? pledgerLocations : fallbackPledgerLocations;
  const displayCountryCount = countryCount > 0 ? countryCount : 12;

  const stats = data?.stats;
  const totalMiles = stats?.totalMiles ?? 0;
  const progressPercent = Math.round((totalMiles / 2650) * 1000) / 10;
  const currentSectionIndex = getTrailSectionIndex(totalMiles);

  const handleModeSwitch = (newMode: MapMode) => {
    setMode(newMode);
    // Only fly to world view the first time pledgers tab is opened.
    // After that, keep whatever viewport the user is on (sticky map).
    if (newMode === "pledgers" && !pledgersVisited.current) {
      pledgersVisited.current = true;
      setFlyTo([20, -40, 2]);
    }
    // Switching back to trail/supporters does NOT reset the viewport —
    // the user stays wherever they were looking.
  };

  const totalGiftAmount = giftLocations.reduce((sum, g) => sum + g.amount, 0);
  // Pledge coverage: totalPledged / $50,000 goal → % of trail "lit up"
  const pledgeCoveragePercent = Math.min(100, Math.round((totalPledged / 50000) * 100));

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Trail Map" />

      {/* Map Main */}
      <div className="flex flex-col lg:flex-row w-full lg:h-[800px]">
        {/* Sidebar */}
        <div className="flex flex-col w-full lg:w-[400px] max-h-[300px] lg:max-h-none lg:h-full bg-[var(--bg-white)] border-r border-[var(--border-subtle)] shrink-0 overflow-auto">
          {/* Mode Toggle */}
          <div className="flex w-full border-b border-[var(--border-subtle)]">
            <button
              onClick={() => handleModeSwitch("trail")}
              className={`flex-1 flex items-center justify-center h-[48px] cursor-pointer transition-colors ${
                mode === "trail"
                  ? "bg-[var(--burnt-orange)]"
                  : "bg-[var(--bg-white)] hover:bg-[var(--bg-warm)]"
              }`}
            >
              <span className={`font-label font-bold text-[11px] tracking-[2px] ${
                mode === "trail" ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"
              }`}>
                TRAIL
              </span>
            </button>
            <button
              onClick={() => handleModeSwitch("pledgers")}
              className={`flex-1 flex items-center justify-center h-[48px] cursor-pointer transition-colors ${
                mode === "pledgers"
                  ? "bg-[var(--burnt-orange)]"
                  : "bg-[var(--bg-white)] hover:bg-[var(--bg-warm)]"
              }`}
            >
              <span className={`font-label font-bold text-[11px] tracking-[2px] ${
                mode === "pledgers" ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"
              }`}>
                PLEDGERS
              </span>
            </button>
            <button
              onClick={() => handleModeSwitch("supporters")}
              className={`flex-1 flex items-center justify-center h-[48px] cursor-pointer transition-colors ${
                mode === "supporters"
                  ? "bg-[var(--forest-green)]"
                  : "bg-[var(--bg-white)] hover:bg-[var(--bg-warm)]"
              }`}
            >
              <span className={`font-label font-bold text-[11px] tracking-[2px] ${
                mode === "supporters" ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"
              }`}>
                TRAIL GIFTS
              </span>
            </button>
          </div>

          {mode === "trail" && (
            <>
              {/* Trail Sidebar */}
              <div className="flex flex-col gap-[12px] px-[24px] pt-[24px] pb-[16px]">
                <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL PROGRESS</span>
                <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">Pacific Crest Trail</span>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="relative w-full h-[6px] bg-[#E8E5E0]">
                    <div
                      className="absolute top-0 left-0 h-[6px] bg-[var(--forest-green)] transition-all duration-1000"
                      style={{ width: `max(6px, ${progressPercent}%)` }}
                    />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="font-label font-medium text-[11px] text-[var(--text-muted)]">
                      Mile {totalMiles.toLocaleString("en-US")}
                    </span>
                    <span className="font-label font-semibold text-[11px] text-[var(--forest-green)]">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

              <div className="flex flex-col w-full overflow-hidden">
                <div className="px-[24px] py-[12px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TRAIL SECTIONS</span>
                </div>
                {trailSections.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setFlyTo(s.center)}
                    className={`flex items-center justify-between px-[24px] py-[14px] border-b border-[var(--border-subtle)] w-full text-left cursor-pointer hover:bg-[var(--forest-green-light)] transition-colors ${i === currentSectionIndex ? "bg-[var(--forest-green-light)]" : ""}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{s.name}</span>
                      <span className="font-label text-[11px] text-[var(--text-muted)]">{s.info}</span>
                    </div>
                    {i === currentSectionIndex && (
                      <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)] bg-[var(--forest-green)] px-[8px] py-[3px]">CURRENT</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="px-[16px] py-[16px]">
                <DistanceTracker compact />
              </div>
            </>
          )}

          {mode === "pledgers" && (
            <>
              {/* Pledger Sidebar */}
              <div className="flex flex-col gap-[12px] px-[24px] pt-[24px] pb-[16px]">
                <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">GLOBAL COMMUNITY</span>
                <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">Pledgers Worldwide</span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  People from around the world are walking with Paul — one pledge at a time.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-[16px] px-[24px] pb-[16px]">
                <div className="flex flex-col gap-[4px] flex-1 bg-[var(--bg-warm)] p-[16px]">
                  <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--burnt-orange)] leading-[1]">
                    {displayLocations.length}
                  </span>
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">PLEDGERS</span>
                </div>
                <div className="flex flex-col gap-[4px] flex-1 bg-[var(--bg-warm)] p-[16px]">
                  <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--forest-green)] leading-[1]">
                    {displayCountryCount}
                  </span>
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">COUNTRIES</span>
                </div>
              </div>

              {/* Pledge trail fill bar */}
              <div className="flex flex-col gap-[8px] px-[24px] pb-[16px]">
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TRAIL COVERED BY PLEDGES</span>
                  <span className="font-label font-bold text-[12px] text-[var(--burnt-orange)]">{pledgeCoveragePercent}%</span>
                </div>
                <div className="w-full h-[6px] bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--burnt-orange)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `max(6px, ${pledgeCoveragePercent}%)` }}
                  />
                </div>
                <span className="font-heading text-[12px] text-[var(--text-muted)]">
                  ${totalPledged.toLocaleString("en-US")} pledged toward $50,000 goal. The orange line on the map shows coverage.
                </span>
              </div>

              <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

              {/* Recent Pledgers List */}
              <div className="flex flex-col w-full overflow-hidden">
                <div className="px-[24px] py-[12px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">PLEDGERS AROUND THE WORLD</span>
                </div>
                {displayLocations.slice(0, 12).map((loc, i) => (
                  <div
                    key={`${loc.lat}-${loc.lng}-${i}`}
                    className="flex items-center gap-[12px] px-[24px] py-[10px] border-b border-[var(--border-subtle)]"
                  >
                    <div className="w-[8px] h-[8px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">{loc.name}</span>
                      <span className="font-label text-[11px] text-[var(--text-muted)]">{loc.city}, {loc.country}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-[24px] py-[20px]">
                <Link
                  href="/pledge"
                  className="flex items-center justify-center gap-[8px] w-full h-[44px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
                >
                  <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                    ADD YOUR PIN TO THE MAP
                  </span>
                </Link>
              </div>
            </>
          )}

          {mode === "supporters" && (
            <>
              {/* Supporters Sidebar */}
              <div className="flex flex-col gap-[12px] px-[24px] pt-[24px] pb-[16px]">
                <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">TRAIL GIFTS</span>
                <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">Gifts on the Trail</span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  Every icon on the map is a real gift — meals, boots, camp nights — keeping Paul moving forward. Green segments show supported trail sections.
                </p>
              </div>

              {/* Trail Coverage Bar */}
              <div className="flex flex-col gap-[8px] px-[24px] pb-[16px]">
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TRAIL COVERAGE</span>
                  <span className="font-label font-bold text-[12px] text-[var(--forest-green)]">
                    {getTrailFundingPercent(giftLocations)}%
                  </span>
                </div>
                <div className="w-full h-[6px] bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--forest-green)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getTrailFundingPercent(giftLocations)}%` }}
                  />
                </div>
                <span className="font-heading text-[12px] text-[var(--text-muted)]">
                  Segments with gifts light up green on the map
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-[16px] px-[24px] pb-[16px]">
                <div className="flex flex-col gap-[4px] flex-1 bg-[var(--forest-green-light)] p-[16px]">
                  <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--forest-green)] leading-[1]">
                    {giftLocations.length}
                  </span>
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">GIFTS</span>
                </div>
                <div className="flex flex-col gap-[4px] flex-1 bg-[var(--forest-green-light)] p-[16px]">
                  <span className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--forest-green)] leading-[1]">
                    ${totalGiftAmount.toLocaleString("en-US")}
                  </span>
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">TOTAL</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

              {/* Recent Gifts List */}
              <div className="flex flex-col w-full overflow-hidden">
                <div className="px-[24px] py-[12px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">RECENT GIFTS</span>
                </div>
                {giftLocations.slice(0, 12).map((gift, i) => (
                  <div
                    key={`gift-sidebar-${gift.lat}-${gift.lng}-${i}`}
                    className="flex items-center gap-[12px] px-[24px] py-[10px] border-b border-[var(--border-subtle)]"
                  >
                    <span className="text-[18px] shrink-0">{GIFT_EMOJI_MAP[gift.giftTitle] || "💚"}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)] truncate">
                        {gift.name} — ${gift.amount}
                      </span>
                      <span className="font-label text-[11px] text-[var(--text-muted)]">
                        {gift.giftTitle} · Mile {gift.trailMile.toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-[24px] py-[20px]">
                <Link
                  href="/support"
                  className="flex items-center justify-center gap-[8px] w-full h-[44px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity"
                >
                  <Gift className="w-[14px] h-[14px] text-[var(--text-white)]" />
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                    SUPPORT PAUL ON THE TRAIL
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Map Area */}
        <div className="relative flex-1 h-[400px] md:h-[500px] lg:h-full overflow-hidden bg-[#E8E5E0]">
          <TrailMapView
            flyTo={flyTo}
            currentPosition={data?.current ? { lat: data.current.lat, lng: data.current.lng } : null}
            dayNumber={stats?.dayNumber}
            nearestLocationName={stats?.nearestLocationName}
            totalMiles={stats?.totalMiles}
            currentElevation={stats?.currentElevation}
            mode={mode}
            pledgerLocations={displayLocations}
            supportGiftLocations={giftLocations}
            pledgeCoveragePercent={pledgeCoveragePercent}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6 md:px-12 lg:px-[80px] py-[20px] md:py-[24px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">TODAY&apos;S DISTANCE</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">
            {stats ? `${stats.todayDistance} mi` : "—"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">ELEVATION GAIN</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">
            {stats ? `+${stats.todayElevationGain.toLocaleString("en-US")} ft` : "—"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">TOTAL MILES</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--forest-green)]">
            {stats ? `${stats.totalMiles.toLocaleString("en-US")} / 2,650` : "— / 2,650"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">CURRENT ELEVATION</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--text-primary)]">
            {stats ? `${stats.currentElevation.toLocaleString("en-US")} ft` : "—"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[2px] text-[var(--text-muted)]">DAY</span>
          <span className="font-heading font-semibold text-[20px] md:text-[24px] lg:text-[28px] text-[var(--burnt-orange)]">
            {stats ? `${stats.dayNumber} of ~180` : "— of ~180"}
          </span>
        </div>
      </div>

      {/* By the Numbers — Expedition Stats */}
      <ExpeditionStats totalMiles={totalMiles} dayNumber={stats?.dayNumber ?? 0} currentElevation={stats?.currentElevation ?? 0} />

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expedition Stats Section
// ---------------------------------------------------------------------------

const STEPS_PER_MILE = 2200; // Average for trail hiking with pack
const CALORIES_PER_MILE = 120; // Conservative hiking calorie burn (beyond BMR)
const AVG_HIKING_SPEED_MPH = 2.8; // Typical PCT thru-hiker pace

function ExpeditionStats({ totalMiles, dayNumber, currentElevation }: {
  totalMiles: number;
  dayNumber: number;
  currentElevation: number;
}) {
  const computed = useMemo(() => {
    const steps = Math.round(totalMiles * STEPS_PER_MILE);
    const caloriesBurned = Math.round(totalMiles * CALORIES_PER_MILE);
    const hoursWalked = Math.round(totalMiles / AVG_HIKING_SPEED_MPH);
    const milesRemaining = Math.max(0, 2650 - totalMiles);
    const avgDailyMiles = dayNumber > 0 ? Math.round((totalMiles / dayNumber) * 10) / 10 : 0;
    const daysRemaining = avgDailyMiles > 0 ? Math.round(milesRemaining / avgDailyMiles) : 0;
    const marathons = Math.round((totalMiles / 26.2) * 10) / 10;
    const highestPoint = totalMiles >= 800 ? 13100 : currentElevation; // Mt. Whitney at mile 800
    const statesCrossed = totalMiles >= 2147 ? 3 : totalMiles >= 1691 ? 2 : 1;

    return {
      steps, caloriesBurned, hoursWalked, milesRemaining,
      avgDailyMiles, daysRemaining, marathons, highestPoint, statesCrossed,
    };
  }, [totalMiles, dayNumber, currentElevation]);

  // Don't show section if hike hasn't started
  if (dayNumber <= 0 && totalMiles <= 0) return null;

  return (
    <section className="flex flex-col items-center gap-[40px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-warm)] w-full">
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col items-center gap-[12px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">BY THE NUMBERS</span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            What {totalMiles.toLocaleString("en-US")} Miles Looks Like
          </h2>
          <p className="font-heading text-[15px] md:text-[16px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[600px]">
            The physical reality of walking from Mexico to Canada — every step counted, every calorie earned.
          </p>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[16px] md:gap-[20px] w-full max-w-[1100px]">
        <StatCard
          icon={<Footprints className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />}
          value={computed.steps}
          label="STEPS TAKEN"
          color="var(--burnt-orange)"
          separator=","
        />
        <StatCard
          icon={<Flame className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />}
          value={computed.caloriesBurned}
          label="CALORIES BURNED"
          color="var(--burnt-orange)"
          separator=","
        />
        <StatCard
          icon={<Clock className="w-[24px] h-[24px] text-[var(--forest-green)]" />}
          value={computed.hoursWalked}
          label="HOURS WALKED"
          color="var(--forest-green)"
          separator=","
        />
        <StatCard
          icon={<Mountain className="w-[24px] h-[24px] text-[var(--forest-green)]" />}
          value={computed.highestPoint}
          label="HIGHEST POINT (FT)"
          color="var(--forest-green)"
          separator=","
        />
        <StatCard
          icon={<TrendingUp className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />}
          value={computed.avgDailyMiles}
          label="AVG MILES / DAY"
          color="var(--burnt-orange)"
          decimals={1}
        />
        <StatCard
          icon={<Ruler className="w-[24px] h-[24px] text-[var(--forest-green)]" />}
          value={computed.marathons}
          label="MARATHONS WALKED"
          color="var(--forest-green)"
          decimals={1}
        />
        <StatCard
          icon={<MapPin className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />}
          value={computed.statesCrossed}
          label="STATES CROSSED"
          color="var(--burnt-orange)"
        />
        <StatCard
          icon={<CalendarDays className="w-[24px] h-[24px] text-[var(--forest-green)]" />}
          value={dayNumber}
          label="DAYS ON TRAIL"
          color="var(--forest-green)"
        />
        <StatCard
          icon={<ArrowUp className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />}
          value={computed.milesRemaining}
          label="MILES REMAINING"
          color="var(--burnt-orange)"
          separator=","
        />
        <StatCard
          icon={<Milestone className="w-[24px] h-[24px] text-[var(--forest-green)]" />}
          value={computed.daysRemaining}
          label="EST. DAYS LEFT"
          color="var(--forest-green)"
        />
      </div>

      {/* Context note */}
      <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)] text-center">
        Steps and calories are estimated from trail distance. Pace based on typical PCT thru-hiker averages.
      </span>
    </section>
  );
}

function StatCard({ icon, value, label, color, separator, decimals }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  separator?: string;
  decimals?: number;
}) {
  return (
    <ScrollReveal animation="fade-up">
      <div className="flex flex-col items-center gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[20px] md:p-[24px]">
        {icon}
        <CountUpStat
          end={value}
          label={label}
          color={color}
          separator={separator}
          decimals={decimals}
        />
      </div>
    </ScrollReveal>
  );
}
