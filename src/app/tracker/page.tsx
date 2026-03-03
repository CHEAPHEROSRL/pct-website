"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mountain, Radio, Square, CheckCircle } from "lucide-react";

// ─── GPSLogger section ───────────────────────────────────────────────────────

function ConfigBox({
  fields,
}: {
  fields: { label: string; value: string; mono?: boolean }[];
}) {
  return (
    <div className="flex flex-col gap-4 bg-[#141714] border border-[#333] p-5 mx-6 my-1">
      <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
        CONFIGURATION
      </span>
      {fields.map((f) => (
        <div key={f.label} className="flex flex-col gap-[3px]">
          <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">
            {f.label}
          </span>
          <span
            className={`font-label text-[12px] break-all ${
              f.mono ? "text-[var(--burnt-orange)]" : "text-[#FFFFFFCC]"
            }`}
          >
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Step({
  num,
  text,
  color,
}: {
  num: number;
  text: string;
  color: "green" | "orange";
}) {
  const bg = color === "green" ? "bg-[var(--forest-green)]" : "bg-[var(--burnt-orange)]";
  return (
    <div className="flex gap-3 px-6 py-2 items-start">
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full ${bg} flex items-center justify-center`}
      >
        <span className="font-label font-bold text-[12px] text-white">{num}</span>
      </div>
      <span className="font-label text-[13px] text-[#FFFFFFCC] leading-snug pt-[2px]">
        {text}
      </span>
    </div>
  );
}

function SectionNote({
  text,
  color,
}: {
  text: string;
  color: "green" | "orange";
}) {
  const textColor =
    color === "green" ? "text-[var(--forest-green)]" : "text-[var(--burnt-orange)]";
  return (
    <div className={`flex gap-2 px-6 py-3 items-start ${textColor}`}>
      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-[1px]" />
      <span className="font-label text-[12px] leading-snug">{text}</span>
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "green" | "orange";
}) {
  return color === "green" ? (
    <span className="font-label font-bold text-[9px] tracking-[1px] text-[var(--forest-green)] bg-[var(--forest-green-light)] px-2 py-[3px]">
      {label}
    </span>
  ) : (
    <span className="font-label font-bold text-[9px] tracking-[1px] text-[var(--burnt-orange)] bg-[var(--burnt-orange-light)] px-2 py-[3px]">
      {label}
    </span>
  );
}

// ─── Manual tracker ───────────────────────────────────────────────────────────

function ManualTracker() {
  const [token, setToken] = useState("");
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pct-tracker-token");
    if (saved) setToken(saved);
  }, []);

  const sendPosition = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, altitude, accuracy } = position.coords;
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
    [token] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function startTracking() {
    if (!navigator.geolocation) { setStatus("Geolocation not available"); return; }
    if (!token.trim()) { setStatus("Enter auth token first"); return; }
    localStorage.setItem("pct-tracker-token", token);
    setTracking(true);
    setStatus("Getting GPS...");
    navigator.geolocation.getCurrentPosition(sendPosition, (e) =>
      setStatus(`GPS error: ${e.message}`), { enableHighAccuracy: true, timeout: 30000 });
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendPosition, (e) =>
        setStatus(`GPS error: ${e.message}`), { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 });
    }, 60000);
  }

  function stopTracking() {
    setTracking(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setStatus("Stopped");
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="flex flex-col gap-4 px-6 py-5 bg-[#141714]">
      <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
        MANUAL BROWSER TESTING
      </span>
      <span className="font-label text-[12px] text-[#5C5C5C] leading-snug">
        Only for quick testing. Screen must stay on and tab must remain active.
      </span>

      {!tracking && (
        <div className="flex flex-col gap-2">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
            AUTH TOKEN
          </span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your auth token"
            className="h-[48px] px-4 bg-[#2a2d28] border border-[#444] font-label text-[14px] text-white placeholder:text-[#666] outline-none w-full"
          />
        </div>
      )}

      <button
        onClick={tracking ? stopTracking : startTracking}
        className={`flex items-center justify-center gap-3 h-[52px] w-full cursor-pointer transition-opacity hover:opacity-90 ${
          tracking ? "bg-[#8B2020]" : "bg-[var(--burnt-orange)]"
        }`}
      >
        {tracking ? (
          <>
            <Square className="w-4 h-4 text-white" />
            <span className="font-label font-bold text-[14px] tracking-[2px] text-white">
              STOP TRACKING
            </span>
          </>
        ) : (
          <>
            <Radio className="w-4 h-4 text-white" />
            <span className="font-label font-bold text-[14px] tracking-[2px] text-white">
              START TRACKING
            </span>
          </>
        )}
      </button>

      {(tracking || updateCount > 0) && (
        <div className="flex justify-between items-center py-2 border-t border-[#333]">
          <span className="font-label text-[12px] text-[#8C8A87]">{status}</span>
          {updateCount > 0 && (
            <span className="font-label font-bold text-[12px] text-[var(--forest-green)]">
              {updateCount} sent
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const [apiUrl, setApiUrl] = useState("/api/location");
  useEffect(() => {
    setApiUrl(`${window.location.origin}/api/location`);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[var(--bg-dark)]">
      <div className="flex flex-col w-full max-w-[480px]">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-8 pt-10 pb-7">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">
              PCT TRACKER
            </span>
          </div>
          <h1 className="font-heading font-semibold text-[30px] tracking-[-0.5px] text-white text-center">
            Set Up Tracking
          </h1>
          <p className="font-label text-[13px] text-[var(--text-muted)] text-center">
            For reliable background tracking, use a<br />native app on your phone.
          </p>
        </div>

        <div className="w-full h-[1px] bg-[#2a2a2a]" />

        {/* App choice cards */}
        <div className="flex flex-col gap-3 px-4 py-5">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] px-2">
            CHOOSE YOUR PLATFORM
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 p-4 border border-[var(--forest-green)]">
              <Badge label="ANDROID" color="green" />
              <span className="font-label font-bold text-[17px] text-white">GPSLogger</span>
              <span className="font-label text-[11px] text-[var(--text-muted)]">Free · Google Play</span>
              <span className="font-label text-[11px] text-[#5C5C5C]">Runs in background,<br />battery-friendly</span>
            </div>
            <div className="flex flex-col gap-2 p-4 border border-[var(--burnt-orange)]">
              <Badge label="iOS + ANDROID" color="orange" />
              <span className="font-label font-bold text-[17px] text-white">OwnTracks</span>
              <span className="font-label text-[11px] text-[var(--text-muted)]">Free · App Store</span>
              <span className="font-label text-[11px] text-[#5C5C5C]">iOS &amp; Android,<br />works on iPhone</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-[#2a2a2a]" />

        {/* GPSLogger setup */}
        <div className="flex flex-col py-1">
          <div className="flex items-center gap-3 px-6 py-5 pb-3">
            <Badge label="ANDROID" color="green" />
            <h2 className="font-heading font-semibold text-[22px] text-white">GPSLogger Setup</h2>
          </div>

          <Step num={1} color="green" text='Download GPSLogger from the Google Play Store (search "GPSLogger")' />
          <Step num={2} color="green" text='Open GPSLogger → tap the menu (⋮) → General Options → enable "Start on boot"' />
          <Step num={3} color="green" text='Tap "Logging Details" → enable "Log to custom URL"' />
          <Step num={4} color="green" text="Set URL, Method POST, and paste the body and header below" />

          <ConfigBox
            fields={[
              { label: "URL", value: apiUrl },
              { label: "METHOD", value: "POST" },
              {
                label: "BODY",
                value: '{"lat":"%LAT","lng":"%LON","altitude":%ALT,"timestamp":%TIMESTAMP,"accuracy":%ACC}',
                mono: true,
              },
              { label: "HEADER", value: "Authorization: Bearer YOUR_TOKEN" },
              { label: "INTERVAL", value: "60 seconds (minimum recommended)" },
            ]}
          />

          <Step num={5} color="green" text='Tap "Start Logging" — GPSLogger runs in the background even when the screen is off!' />
          <SectionNote
            color="green"
            text="GPSLogger continues sending even when your phone screen is off and the app is closed."
          />
        </div>

        <div className="w-full h-[1px] bg-[#2a2a2a]" />

        {/* OwnTracks setup */}
        <div className="flex flex-col py-1">
          <div className="flex items-center gap-3 px-6 py-5 pb-3">
            <Badge label="iOS + ANDROID" color="orange" />
            <h2 className="font-heading font-semibold text-[22px] text-white">OwnTracks Setup</h2>
          </div>

          <Step num={1} color="orange" text="Download OwnTracks from the App Store (iOS) or Google Play (Android)" />
          <Step num={2} color="orange" text='Open OwnTracks → tap the "i" menu → Preferences → Connection' />
          <Step num={3} color="orange" text='Set Mode to "HTTP" and paste the URL from the config below' />
          <Step num={4} color="orange" text="iOS only: go to iPhone Settings → OwnTracks → enable Background App Refresh" />

          <ConfigBox
            fields={[
              {
                label: "URL (token included)",
                value: `${apiUrl}?format=owntracks&token=YOUR_TOKEN`,
                mono: true,
              },
              { label: "MODE", value: "HTTP (not MQTT)" },
              { label: "INTERVAL", value: "60 seconds or longer" },
            ]}
          />

          <Step num={5} color="orange" text="Tap the location icon to send a test ping and confirm it appears on the Trail Map" />
          <SectionNote
            color="orange"
            text="OwnTracks sends location updates in the background on both iOS and Android."
          />
        </div>

        <div className="w-full h-[1px] bg-[#2a2a2a]" />

        {/* Manual browser testing */}
        <ManualTracker />

        <p className="font-label text-[11px] text-[#555] text-center py-4 px-6">
          Updates every 60 seconds while tracking
        </p>
      </div>
    </div>
  );
}
