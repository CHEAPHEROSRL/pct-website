"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Radio, Square, Mountain } from "lucide-react";

export default function TrackerPage() {
  const [token, setToken] = useState("");
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [lastPosition, setLastPosition] = useState<{
    lat: number;
    lng: number;
    altitude: number | null;
  } | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pct-tracker-token");
    if (saved) setToken(saved);
  }, []);

  const sendPosition = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, altitude, accuracy } = position.coords;
      setLastPosition({ lat: latitude, lng: longitude, altitude });
      setStatus("Sending...");

      try {
        const res = await fetch("/api/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            altitude,
            timestamp: position.timestamp,
            accuracy,
          }),
        });

        if (res.ok) {
          setUpdateCount((c) => c + 1);
          setStatus(`Updated ${new Date().toLocaleTimeString()}`);
        } else if (res.status === 401) {
          setStatus("Invalid token");
          stopTracking();
        } else if (res.status === 429) {
          setStatus("Too frequent — will retry");
        } else {
          setStatus(`Error ${res.status}`);
        }
      } catch {
        setStatus("Network error — will retry");
      }
    },
    [token]
  );

  function startTracking() {
    if (!navigator.geolocation) {
      setStatus("Geolocation not available");
      return;
    }
    if (!token.trim()) {
      setStatus("Enter auth token first");
      return;
    }

    localStorage.setItem("pct-tracker-token", token);
    setTracking(true);
    setStatus("Getting GPS...");

    // Immediate position
    navigator.geolocation.getCurrentPosition(
      sendPosition,
      (err) => setStatus(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 30000 }
    );

    // Then every 60 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        sendPosition,
        (err) => setStatus(`GPS error: ${err.message}`),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 }
      );
    }, 60000);
  }

  function stopTracking() {
    setTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("Stopped");
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-dark)] px-6 py-12">
      <div className="flex flex-col items-center gap-8 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Mountain className="w-6 h-6 text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[14px] tracking-[3px] text-[var(--text-white)]">
            PCT TRACKER
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              tracking
                ? "bg-[var(--forest-green)] animate-pulse"
                : "bg-[#333]"
            }`}
          >
            {tracking ? (
              <Radio className="w-10 h-10 text-white" />
            ) : (
              <MapPin className="w-10 h-10 text-[var(--text-muted)]" />
            )}
          </div>
          <span className="font-label font-semibold text-[13px] tracking-[1px] text-[var(--text-muted)]">
            {status}
          </span>
        </div>

        {/* Token input */}
        {!tracking && (
          <div className="flex flex-col gap-2 w-full">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              AUTH TOKEN
            </span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your auth token"
              className="h-[48px] px-4 bg-[#2a2d28] border border-[#444] font-heading text-[15px] text-white placeholder:text-[#666] outline-none w-full"
            />
          </div>
        )}

        {/* Start/Stop button */}
        <button
          onClick={tracking ? stopTracking : startTracking}
          className={`flex items-center justify-center gap-3 h-[56px] w-full cursor-pointer transition-opacity hover:opacity-90 ${
            tracking ? "bg-[#8B2020]" : "bg-[var(--burnt-orange)]"
          }`}
        >
          {tracking ? (
            <>
              <Square className="w-5 h-5 text-white" />
              <span className="font-label font-bold text-[15px] tracking-[2px] text-white">
                STOP TRACKING
              </span>
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 text-white" />
              <span className="font-label font-bold text-[15px] tracking-[2px] text-white">
                START TRACKING
              </span>
            </>
          )}
        </button>

        {/* Position info */}
        {lastPosition && (
          <div className="flex flex-col gap-3 w-full bg-[#2a2d28] border border-[#444] p-5">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              LAST POSITION
            </span>
            <div className="flex justify-between">
              <span className="font-heading text-[14px] text-[#999]">Latitude</span>
              <span className="font-heading font-semibold text-[14px] text-white">
                {lastPosition.lat.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-heading text-[14px] text-[#999]">Longitude</span>
              <span className="font-heading font-semibold text-[14px] text-white">
                {lastPosition.lng.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-heading text-[14px] text-[#999]">Altitude</span>
              <span className="font-heading font-semibold text-[14px] text-white">
                {lastPosition.altitude !== null
                  ? `${Math.round(lastPosition.altitude)} m`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-heading text-[14px] text-[#999]">Updates sent</span>
              <span className="font-heading font-semibold text-[14px] text-[var(--forest-green)]">
                {updateCount}
              </span>
            </div>
          </div>
        )}

        <span className="font-label text-[11px] text-[#555]">
          Updates every 60 seconds while tracking
        </span>
      </div>
    </div>
  );
}
