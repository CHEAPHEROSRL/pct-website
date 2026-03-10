"use client";

import { useState, FormEvent } from "react";
import { MapPin, Navigation, Zap, Users, Mountain } from "lucide-react";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { useLocationData } from "@/hooks/useLocationData";

interface DistanceTrackerProps {
  /** Compact mode for sidebar use */
  compact?: boolean;
}

export default function DistanceTracker({ compact }: DistanceTrackerProps) {
  const { data } = useLocationData(30000);
  const paulLat = data?.current?.lat ?? null;
  const paulLng = data?.current?.lng ?? null;
  const paulLocation = data?.stats?.nearestLocationName ?? "the PCT";
  const dayNumber = data?.stats?.dayNumber ?? 0;
  const lastUpdated = data?.stats?.lastUpdated;

  const {
    visitorLocation,
    distanceMiles,
    isNearby,
    isGeocoding,
    error,
    setCity,
    clearLocation,
  } = useVisitorLocation(paulLat, paulLng);

  const [cityInput, setCityInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const success = await setCity(cityInput.trim());
    if (success) {
      setCityInput("");
      setShowInput(false);
    }
  };

  const handleChange = () => {
    setShowInput(true);
  };

  const updatedAgo = lastUpdated
    ? formatTimeAgo(lastUpdated)
    : null;

  // --- State: Paul is nearby! ---
  if (visitorLocation && !showInput && isNearby) {
    return (
      <div className={`flex flex-col gap-[16px] bg-[var(--forest-green-light)] border-2 border-[var(--forest-green)] ${compact ? "p-[20px]" : "p-[28px]"}`}>
        <div className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[12px] py-[5px] w-fit">
          <Zap className="w-[14px] h-[14px] text-[var(--text-white)]" />
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">
            PAUL IS NEAR YOU!
          </span>
        </div>
        <div className="flex items-end gap-[8px]">
          <span className={`font-heading font-semibold tracking-[-1px] text-[var(--forest-green)] ${compact ? "text-[40px]" : "text-[56px]"}`}>
            {distanceMiles}
          </span>
          <span className="font-heading text-[18px] text-[var(--text-secondary)] pb-[4px]">
            miles away
          </span>
        </div>
        <p className={`font-heading text-[var(--text-primary)] leading-[1.6] ${compact ? "text-[13px]" : "text-[15px]"}`}>
          Paul is hiking near your area right now! Want to walk a few miles with
          him? Reach out and join Paul on the trail.
        </p>
        <a
          href="mailto:paul@paulbarrypct.com?subject=I want to walk with you on the PCT!"
          className="flex items-center justify-center gap-[10px] h-[48px] w-full bg-[var(--forest-green)] hover:opacity-90 transition-opacity"
        >
          <Users className="w-[18px] h-[18px] text-[var(--text-white)]" />
          <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
            I WANT TO WALK WITH PAUL
          </span>
        </a>
        <div className="flex items-center gap-[8px]">
          <MapPin className="w-[14px] h-[14px] text-[var(--forest-green)] shrink-0" />
          <span className="font-heading text-[13px] text-[var(--text-secondary)]">
            Your location: {visitorLocation.displayName}
          </span>
          <button
            onClick={handleChange}
            className="font-label font-semibold text-[12px] tracking-[0.5px] text-[var(--burnt-orange)] cursor-pointer hover:underline"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // --- State: Distance active ---
  if (visitorLocation && !showInput && distanceMiles !== null) {
    return (
      <div className={`flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] ${compact ? "p-[20px]" : "p-[28px]"}`}>
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
          YOUR DISTANCE FROM PAUL
        </span>
        <div className="flex items-end gap-[8px]">
          <span className={`font-heading font-semibold tracking-[-1px] text-[var(--text-primary)] ${compact ? "text-[36px]" : "text-[48px]"}`}>
            {distanceMiles.toLocaleString()}
          </span>
          <span className="font-heading text-[18px] text-[var(--text-secondary)] pb-[2px]">
            miles away
          </span>
        </div>
        <div className="flex items-center gap-[8px]">
          <MapPin className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0" />
          <span className="font-heading text-[14px] text-[var(--text-secondary)]">
            Your location: {visitorLocation.displayName}
          </span>
          <button
            onClick={handleChange}
            className="font-label font-semibold text-[12px] tracking-[0.5px] text-[var(--burnt-orange)] cursor-pointer hover:underline"
          >
            Change
          </button>
        </div>
        <div className="w-full h-[1px] bg-[var(--border-subtle)]" />
        <div className="flex items-center gap-[12px]">
          <Mountain className="w-[18px] h-[18px] text-[var(--burnt-orange)] shrink-0" />
          <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
            Paul is near {paulLocation}
          </span>
        </div>
        {updatedAgo && (
          <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
            Updated {updatedAgo}
            {dayNumber > 0 ? ` · Day ${dayNumber} of the hike` : ""}
          </span>
        )}
      </div>
    );
  }

  // --- State: No location set (or editing) ---
  return (
    <div className={`flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] ${compact ? "p-[20px]" : "p-[28px]"}`}>
      <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
        HOW FAR IS PAUL FROM YOU?
      </span>
      {!compact && (
        <>
          <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">
            Track Your Distance from Paul
          </span>
          <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
            Enter your city to see how far Paul is from you right now — and
            get notified when he&apos;s near your area.
          </p>
        </>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
        <div className="flex items-center w-full h-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
          <MapPin className="w-[18px] h-[18px] text-[var(--text-muted)] ml-[14px] shrink-0" />
          <input
            type="text"
            placeholder="Enter your city (e.g., Portland, OR)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="flex-1 h-full px-[10px] font-heading text-[14px] italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent"
          />
        </div>
        {error && (
          <span className="font-heading text-[13px] text-red-600">
            {error}
          </span>
        )}
        <button
          type="submit"
          disabled={isGeocoding || !cityInput.trim()}
          className={`flex items-center justify-center gap-[8px] h-[44px] w-full transition-opacity ${
            isGeocoding || !cityInput.trim()
              ? "bg-[var(--text-muted)] cursor-not-allowed"
              : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
          }`}
        >
          <Navigation className="w-[16px] h-[16px] text-[var(--text-white)]" />
          <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
            {isGeocoding ? "FINDING..." : "FIND MY DISTANCE"}
          </span>
        </button>
        {showInput && visitorLocation && (
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="font-label font-semibold text-[12px] tracking-[0.5px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
