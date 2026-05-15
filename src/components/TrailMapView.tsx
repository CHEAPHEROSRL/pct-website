"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pctRouteCoords, pctWaypoints, interpolateFromMile } from "@/lib/trail";
import { countryCodeToFlag } from "@/lib/country-centers";
import type { SupportGiftLocation, CountryAggregate } from "@/lib/types";

/**
 * One claimed-section entry rendered as a pin on the trail. Wire-shape mirrors
 * the /api/pledges/claimed-sections response. `count: 0` is valid — that's a
 * sponsor-only entry where no pledger has claimed the section yet. Lat/lng
 * and name are pre-resolved server-side; the client doesn't need to know
 * whether the entry came from a named landmark or a custom sponsor location.
 */
export interface ClaimedSection {
  id: string;
  name: string;
  miles: number;
  lat: number;
  lng: number;
  count: number;
  samples: { name: string; avatar?: string }[];
  sponsor?: {
    companyName: string;
    logoUrl: string;
    websiteUrl?: string;
  };
}

/**
 * Lightweight journal-post shape for trail map markers.
 * Only the fields we need to render a marker + popup are included.
 */
export interface JournalMarkerPost {
  slug: string;
  title: string;
  dayNumber: number;
  date: string;
  mileMarker: number;
}

/**
 * Build a partial trail polyline showing pledge coverage.
 * pledgeCoveragePercent (0–100) determines how far along the trail to fill.
 */
function buildPledgeCoverageCoords(pledgeCoveragePercent: number): [number, number][] {
  const coverageMiles = (pledgeCoveragePercent / 100) * 2650;
  const coords: [number, number][] = [];
  for (const wp of pctWaypoints) {
    coords.push([wp.lat, wp.lng]);
    if (wp.miles >= coverageMiles) break;
  }
  return coords;
}

/**
 * Tracks the map's current zoom level into React state. Used by the
 * claimed-section pin layer so it can shrink pins at low zoom (global view)
 * and grow them back to full size at trail-view zoom — keeps sponsor logos
 * from blanketing the trail when the user zooms way out.
 */
function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
    const handler = () => onZoom(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map, onZoom]);
  return null;
}

/**
 * Map Leaflet zoom level → claimed-pin display scale.
 *   zoom 2 (continent view): 0.3x   — pins shrink to small dots so they
 *                                     don't blanket the trail
 *   zoom 7 (state view) +    : 1.0x  — full size, fully legible
 * Linear interpolation between; clamped at the ends.
 */
function getPinScale(zoom: number): number {
  if (zoom >= 7) return 1;
  if (zoom <= 2) return 0.3;
  return 0.3 + ((zoom - 2) / 5) * 0.7;
}

function FlyToHandler({ target }: { target?: [number, number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target[0], target[1]], target[2], { duration: 1.5 });
    }
  }, [map, target]);
  return null;
}

function createMarkerIcon(dayNumber: number, locationName: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#C45C26" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div style="
        background: #C45C26;
        padding: 4px 10px;
        white-space: nowrap;
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 2px;
        color: #fff;
      ">DAY ${dayNumber} · ${locationName.toUpperCase()}</div>
    </div>`,
    iconSize: [160, 60],
    iconAnchor: [80, 32],
    popupAnchor: [0, -36],
  });
}

const GIFT_EMOJI: Record<string, string> = {
  "A Trail Meal": "🍽️",
  "Hiking Socks": "🧦",
  "A Night at Camp": "⛺",
  "A Resupply Box": "📦",
  "A Rest Day in Town": "🛏️",
  "Trail Boots": "🥾",
};

function createJournalMarkerIcon(dayNumber: number) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #C45C26;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-weight: 700;
      font-size: 11px;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    ">${dayNumber}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// — Claimed-section pin variants —
// Three shapes covering the data the section-picker can produce. All anchor
// to the section's lat/lng, all show the section name beneath the icon.

// `scale` arg shrinks the visible pin at low map zoom levels. We apply it via
// CSS transform on the outermost div rather than recomputing every inner
// dimension — keeps the markup readable and the implementation contained.
// Leaflet's iconSize/iconAnchor stay constant: at low zoom the bounding box
// is technically larger than the visible pin (click targets get slightly more
// forgiving), which is fine.

function createSingleClaimedIcon(sectionName: string, scale = 1, avatar?: string) {
  // When the single pledger picked an avatar emoji, show it inside the green
  // circle instead of the generic map-pin SVG — the pledger's personal choice
  // becomes their visible mark on the trail. Falls back to the SVG for legacy
  // pledges without avatars or for sections claimed without one.
  const innerMark = avatar
    ? `<span style="font-size:16px;line-height:1;">${avatar}</span>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
  // Emoji renders better on a white background — switch the inner-circle
  // colour when an avatar is present so the emoji has good contrast.
  const bg = avatar ? "#FFFFFF" : "#3D7A5A";
  const borderColor = avatar ? "#3D7A5A" : "#FFFFFF";
  return new L.DivIcon({
    className: "",
    html: `<div style="transform:scale(${scale});transform-origin:center;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:${bg};border:3px solid ${borderColor};border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
        ${innerMark}
      </div>
      <div style="background:#FFFFFF;padding:2px 6px;border:1px solid #D9D7D4;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:9px;letter-spacing:1px;color:#1C1C1C;">${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [120, 50],
    iconAnchor: [60, 18],
    popupAnchor: [0, -20],
  });
}

function createClusterClaimedIcon(count: number, sectionName: string, scale = 1) {
  return new L.DivIcon({
    className: "",
    html: `<div style="transform:scale(${scale});transform-origin:center;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#3D7A5A;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:15px;color:#FFFFFF;">${count}</div>
      <div style="background:#FFFFFF;padding:2px 6px;border:1px solid #D9D7D4;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:9px;letter-spacing:1px;color:#1C1C1C;">${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [120, 60],
    iconAnchor: [60, 23],
    popupAnchor: [0, -25],
  });
}

function createSponsorIcon(logoUrl: string, companyName: string, sectionName: string, scale = 1) {
  // Inline <img> so the logo loads with the marker; failures render as a
  // text fallback so a missing file never breaks the map.
  return new L.DivIcon({
    className: "",
    html: `<div style="transform:scale(${scale});transform-origin:center;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:50px;height:50px;background:#FFFFFF;border:3px solid #C45C26;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;">
        <img src="${logoUrl}" alt="${companyName}" style="width:42px;height:42px;object-fit:contain;display:block;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-family:Barlow Semi Condensed,sans-serif;font-weight:700;font-size:10px;color:#C45C26;letter-spacing:1px;text-align:center;\\'>'+this.alt.toUpperCase().slice(0,8)+'</span>';" />
      </div>
      <div style="background:#C45C26;padding:2px 6px;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:8px;letter-spacing:1.5px;color:#1C1C1C;">SPONSORED · ${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [140, 70],
    iconAnchor: [70, 28],
    popupAnchor: [0, -30],
  });
}

/**
 * Country aggregate pin for the PLEDGERS world map. Subtle by design —
 * the PCT trail itself is still the visual hero, country pins are
 * supporting information. White rounded card with the flag emoji,
 * dark count pill underneath. Tiny drop shadow, no loud colour.
 *
 * Scale uses a gentler curve than the trail pins because the PLEDGERS
 * map opens at world zoom (zoom 2), where the default getPinScale would
 * shrink pins below readability.
 */
function getCountryPinScale(zoom: number): number {
  // 0.7 at world view, 1.0 at country-level zoom and above. Half the
  // dynamic range of the trail pins — country pins stay legible at low
  // zoom because that IS their natural state.
  if (zoom >= 5) return 1;
  if (zoom <= 2) return 0.7;
  return 0.7 + ((zoom - 2) / 3) * 0.3;
}

function createCountryIcon(code: string, count: number, scale: number = 1) {
  const flag = countryCodeToFlag(code);
  return new L.DivIcon({
    className: "",
    html: `<div style="transform:scale(${scale});transform-origin:center;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#FFFFFF;border:1px solid rgba(0,0,0,0.12);border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.15);font-size:20px;line-height:1;">${flag}</div>
      <div style="background:#1C1F1A;color:#FFFFFF;border-radius:8px;padding:1px 7px;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:10px;letter-spacing:0.5px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${count}</div>
    </div>`,
    iconSize: [60, 50],
    iconAnchor: [30, 25],
    popupAnchor: [0, -22],
  });
}

function createGiftIcon(giftTitle: string) {
  const emoji = GIFT_EMOJI[giftTitle] || "💚";
  return new L.DivIcon({
    className: "",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #FFFFFF;
      border: 2px solid #3D7A5A;
      border-radius: 50%;
      font-size: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

/**
 * Build funded/unfunded trail segments based on gift locations.
 * Each waypoint-to-waypoint segment is checked: if any gift falls within that
 * mile range, the segment is "funded" (green). Otherwise it's grey.
 */
function buildFundedSegments(gifts: SupportGiftLocation[]) {
  const segments: { coords: [number, number][]; funded: boolean }[] = [];
  const giftMiles = gifts.map((g) => g.trailMile);

  for (let i = 0; i < pctWaypoints.length - 1; i++) {
    const start = pctWaypoints[i];
    const end = pctWaypoints[i + 1];
    const funded = giftMiles.some((m) => m >= start.miles && m < end.miles);
    segments.push({
      coords: [[start.lat, start.lng], [end.lat, end.lng]],
      funded,
    });
  }
  return segments;
}


interface TrailMapViewProps {
  flyTo?: [number, number, number];
  currentPosition?: { lat: number; lng: number } | null;
  dayNumber?: number;
  nearestLocationName?: string;
  totalMiles?: number;
  currentElevation?: number;
  mode?: "trail" | "pledgers" | "supporters";
  supportGiftLocations?: SupportGiftLocation[];
  /** 0–100: how much of the trail to fill with pledge coverage colour */
  pledgeCoveragePercent?: number;
  /**
   * Journal posts to display as clickable markers along the trail.
   * Only posts with mileMarker <= currentTotalMiles are rendered (visitors
   * never see future-dated posts that Paul hasn't reached yet). Caller is
   * responsible for filtering out drafts on the public site.
   */
  journalPosts?: JournalMarkerPost[];
  /**
   * Pledger pin claims grouped by named PCT section. Only sections whose mile
   * marker is <= totalMiles are actually rendered — pins for landmarks Paul
   * hasn't reached yet stay hidden to keep the early-trail map clean.
   * Sponsor-only entries (count: 0 + sponsor present) DO render regardless,
   * since a sponsorship is a paid commitment that should display from day one.
   */
  claimedSections?: ClaimedSection[];
  /**
   * Country aggregate pin data for the PLEDGERS world map. Replaces the
   * previous per-pledger pin layer — one entry per country, with a count.
   * No individual pledger location ever appears on the map; aggregating
   * to country level is privacy-friendly and matches IP geolocation's
   * actual precision (which is ~country-level anyway).
   */
  countryAggregates?: CountryAggregate[];
}

// Default fallback position (Campo, CA — starting point)
const DEFAULT_POSITION: [number, number] = [32.589, -116.467];

export default function TrailMapView({
  flyTo,
  currentPosition,
  dayNumber = 0,
  nearestLocationName = "Campo",
  totalMiles = 0,
  currentElevation = 2915,
  mode = "trail",
  supportGiftLocations = [],
  pledgeCoveragePercent = 0,
  journalPosts = [],
  claimedSections = [],
  countryAggregates = [],
}: TrailMapViewProps) {
  const position: [number, number] = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : DEFAULT_POSITION;

  const icon = useMemo(
    () => createMarkerIcon(dayNumber, nearestLocationName),
    [dayNumber, nearestLocationName]
  );

  const fundedSegments = useMemo(
    () => buildFundedSegments(supportGiftLocations),
    [supportGiftLocations]
  );

  const pledgeCoverageCoords = useMemo(
    () => buildPledgeCoverageCoords(pledgeCoveragePercent),
    [pledgeCoveragePercent]
  );

  // All claimed-section pins render from the moment the pledger confirms,
  // regardless of Paul's current mile. Previously pledger pins were gated
  // behind "Paul has passed this landmark" for a cleaner early-trail map,
  // but the cost was real: pledgers couldn't see their own commitment on
  // the map for weeks or months. Showing immediately is more motivating
  // and the pin density at typical pledge volumes isn't actually noisy.
  // Sponsors already showed from day 1 — this just brings pledger pins
  // into line with that rule.
  const visibleClaimedSections = useMemo(
    () => (claimedSections && claimedSections.length > 0 ? claimedSections : []),
    [claimedSections]
  );

  // Current Leaflet zoom, fed by <ZoomTracker> below. Initial value matches
  // what we pass to MapContainer's `zoom` prop so the first render uses the
  // right scale and we avoid a brief frame at the wrong size.
  const [currentZoom, setCurrentZoom] = useState<number>(mode === "pledgers" ? 2 : 6);
  const pinScale = useMemo(() => getPinScale(currentZoom), [currentZoom]);

  // Filter journal posts: only show ones Paul has actually reached.
  // Posts with no mileMarker are skipped entirely (legacy / unanchored).
  // Then resolve each to a lat/lng using the existing trail interpolation.
  const visibleJournalMarkers = useMemo(() => {
    if (!journalPosts || journalPosts.length === 0) return [];
    return journalPosts
      .filter(
        (p) =>
          typeof p.mileMarker === "number" &&
          p.mileMarker >= 0 &&
          p.mileMarker <= totalMiles + 0.01 // small tolerance for rounding
      )
      .map((p) => {
        const { lat, lng } = interpolateFromMile(p.mileMarker);
        return { ...p, lat, lng };
      })
      // Sort by mile so popups overlap predictably
      .sort((a, b) => a.mileMarker - b.mileMarker);
  }, [journalPosts, totalMiles]);

  // No mode-based auto-flyTo override. Previously switching to "pledgers"
  // would force a global world-view fly-out on every render, which was
  // disorienting. flyTo is now passed through unchanged from the parent,
  // so the user's manual zoom is preserved across tab switches.
  const effectiveFlyTo = flyTo;

  return (
    <MapContainer
      center={mode === "pledgers" ? [20, -40] : [40.0, -120.0]}
      zoom={mode === "pledgers" ? 2 : 6}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <FlyToHandler target={effectiveFlyTo} />
      <ZoomTracker onZoom={setCurrentZoom} />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {mode === "trail" && (
        <>
          {/* PCT Trail Route */}
          <Polyline
            positions={pctRouteCoords}
            pathOptions={{
              color: "#C45C26",
              weight: 3,
              opacity: 0.85,
            }}
          />

          {/* Journal post markers — clickable circles with the day number.
              Only renders posts Paul has actually reached (mileMarker <=
              totalMiles), already filtered upstream. */}
          {visibleJournalMarkers.map((p) => (
            <Marker
              key={`journal-${p.slug}`}
              position={[p.lat, p.lng]}
              icon={createJournalMarkerIcon(p.dayNumber)}
            >
              <Popup>
                <div
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    maxWidth: 240,
                    padding: "4px 0",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Barlow Semi Condensed', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      color: "#C45C26",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Day {p.dayNumber} · Mile {p.mileMarker}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1C1C1C",
                      lineHeight: 1.35,
                      marginBottom: 8,
                    }}
                  >
                    {p.title}
                  </div>
                  <a
                    href={`/journal/${p.slug}`}
                    style={{
                      fontFamily: "'Barlow Semi Condensed', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      color: "#C45C26",
                      textDecoration: "none",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #C45C26",
                      paddingBottom: 1,
                    }}
                  >
                    Read post →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Claimed-section pins. Rendered before the current-position marker
              so Paul's pin always layers on top when they coincide. */}
          {visibleClaimedSections.map((entry) => {
            const iconNode = entry.sponsor
              ? createSponsorIcon(entry.sponsor.logoUrl, entry.sponsor.companyName, entry.name, pinScale)
              : entry.count > 1
                ? createClusterClaimedIcon(entry.count, entry.name, pinScale)
                : createSingleClaimedIcon(entry.name, pinScale, entry.samples[0]?.avatar);
            return (
              <Marker
                key={`claimed-${entry.id}`}
                position={[entry.lat, entry.lng]}
                icon={iconNode}
              >
                <Popup>
                  <div style={{ fontFamily: "'Source Serif 4', serif", maxWidth: 240, padding: "4px 0" }}>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: entry.sponsor ? "#C45C26" : "#3D7A5A", marginBottom: 6, textTransform: "uppercase" }}>
                      {entry.name} · Mile {entry.miles.toLocaleString("en-US")}
                    </div>
                    {entry.sponsor ? (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C", lineHeight: 1.35, marginBottom: 6 }}>
                          Sponsored by {entry.sponsor.companyName}
                        </div>
                        {entry.count > 0 && (
                          <div style={{ fontSize: 12, color: "#5C5C5C", marginBottom: 6 }}>
                            + {entry.count} pledger{entry.count === 1 ? "" : "s"} claimed this stretch
                          </div>
                        )}
                        {entry.sponsor.websiteUrl && (
                          <a href={entry.sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#C45C26", textDecoration: "none", textTransform: "uppercase", borderBottom: "1px solid #C45C26", paddingBottom: 1 }}>
                            Visit sponsor →
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C", lineHeight: 1.35, marginBottom: 8 }}>
                          {entry.count} pledger{entry.count === 1 ? "" : "s"} claimed this stretch
                        </div>
                        {entry.samples.length > 0 && (
                          <div style={{ fontSize: 12, color: "#5C5C5C", lineHeight: 1.5 }}>
                            {entry.samples.map((s) => `${s.avatar || "💚"} ${s.name}`).join(" · ")}
                            {entry.count > entry.samples.length && ` · +${entry.count - entry.samples.length} more`}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Current Position Marker */}
          <Marker position={position} icon={icon}>
            <Popup>
              <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center" }}>
                <strong style={{ fontSize: 14 }}>
                  Day {dayNumber} — {nearestLocationName}
                </strong>
                <br />
                <span style={{ fontSize: 12, color: "#5C5C5C" }}>
                  Mile {totalMiles.toLocaleString("en-US")} of 2,650
                </span>
                <br />
                <span style={{ fontSize: 12, color: "#5C5C5C" }}>
                  Elevation: {currentElevation.toLocaleString("en-US")} ft
                </span>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {mode === "pledgers" && (
        <>
          {/* PCT Trail Route (faded grey base) */}
          <Polyline
            positions={pctRouteCoords}
            pathOptions={{ color: "#B0ADA8", weight: 3, opacity: 0.35 }}
          />

          {/* Pledge coverage fill — glowing outer */}
          {pledgeCoverageCoords.length > 1 && (
            <Polyline
              positions={pledgeCoverageCoords}
              pathOptions={{ color: "#C45C26", weight: 9, opacity: 0.18 }}
            />
          )}
          {/* Pledge coverage fill — solid inner */}
          {pledgeCoverageCoords.length > 1 && (
            <Polyline
              positions={pledgeCoverageCoords}
              pathOptions={{ color: "#C45C26", weight: 4, opacity: 0.9 }}
            />
          )}

          {/* Country aggregate pins. One pin per country with ≥1 pledger,
              placed at the country's geographic centroid (NOT at any
              individual pledger's IP-derived coordinates — privacy-friendly
              and cleaner than per-pledger pins). Flag emoji inside a small
              white card, count in a dark pill underneath. */}
          {countryAggregates.map((c) => (
            <Marker
              key={`country-${c.code}`}
              position={[c.lat, c.lng]}
              icon={createCountryIcon(c.code, c.count, getCountryPinScale(currentZoom))}
            >
              <Popup>
                <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center", maxWidth: 200, padding: "2px 0" }}>
                  <div style={{ fontSize: 26, marginBottom: 4, lineHeight: 1 }}>{countryCodeToFlag(c.code)}</div>
                  <strong style={{ fontSize: 14, color: "#1C1C1C", display: "block", marginBottom: 2 }}>{c.name}</strong>
                  <span style={{ fontSize: 12, color: "#5C5C5C" }}>
                    {c.count} pledger{c.count === 1 ? "" : "s"}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      )}

      {mode === "supporters" && (
        <>
          {/* Base trail — unfunded grey */}
          <Polyline
            positions={pctRouteCoords}
            pathOptions={{
              color: "#B0ADA8",
              weight: 3,
              opacity: 0.4,
            }}
          />

          {/* Funded segments — glowing green overlay */}
          {fundedSegments
            .filter((s) => s.funded)
            .map((s, i) => (
              <Polyline
                key={`funded-glow-${i}`}
                positions={s.coords}
                pathOptions={{
                  color: "#3D7A5A",
                  weight: 7,
                  opacity: 0.25,
                }}
              />
            ))}
          {fundedSegments
            .filter((s) => s.funded)
            .map((s, i) => (
              <Polyline
                key={`funded-${i}`}
                positions={s.coords}
                pathOptions={{
                  color: "#3D7A5A",
                  weight: 4,
                  opacity: 0.9,
                }}
              />
            ))}

          {/* Gift markers along the trail */}
          {supportGiftLocations.map((gift, i) => (
            <Marker
              key={`gift-${gift.lat}-${gift.lng}-${i}`}
              position={[gift.lat, gift.lng]}
              icon={createGiftIcon(gift.giftTitle)}
            >
              <Popup>
                <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center", maxWidth: 220 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {GIFT_EMOJI[gift.giftTitle] || "💚"}
                  </div>
                  <strong style={{ fontSize: 13, color: "#3D7A5A" }}>
                    {gift.giftTitle}
                  </strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#1C1C1C" }}>
                    {gift.name} — ${gift.amount}
                  </span>
                  <br />
                  <span style={{ fontSize: 10, color: "#8C8A87" }}>
                    Mile {gift.trailMile.toLocaleString("en-US")} · {gift.date}
                  </span>
                  {gift.message && (
                    <div style={{ fontSize: 11, color: "#1C1C1C", fontStyle: "italic", marginTop: 6, borderTop: "1px solid #E8E5E0", paddingTop: 6 }}>
                      &ldquo;{gift.message}&rdquo;
                    </div>
                  )}
                  {gift.mediaUrl && (
                    <img
                      src={gift.mediaUrl}
                      alt="Supporter photo"
                      style={{ width: "100%", maxWidth: 180, borderRadius: 4, marginTop: 6 }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
}
