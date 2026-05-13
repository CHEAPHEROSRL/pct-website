"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pctRouteCoords, pctWaypoints, interpolateFromMile } from "@/lib/trail";
import type { PledgerLocation, SupportGiftLocation } from "@/lib/types";

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

/** Group pledgers by country for heatmap-style clusters */
function buildCountryClusters(pledgers: PledgerLocation[]) {
  const map = new Map<string, { lat: number; lng: number; count: number; country: string }>();
  for (const p of pledgers) {
    const key = p.country;
    const existing = map.get(key);
    if (existing) {
      existing.lat = (existing.lat * existing.count + p.lat) / (existing.count + 1);
      existing.lng = (existing.lng * existing.count + p.lng) / (existing.count + 1);
      existing.count++;
    } else {
      map.set(key, { lat: p.lat, lng: p.lng, count: 1, country: key });
    }
  }
  return Array.from(map.values());
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

function createPledgerIcon(avatar: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: #FFFFFF;
      border: 2px solid #C45C26;
      border-radius: 50%;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">${avatar}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
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

function createSingleClaimedIcon(sectionName: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#3D7A5A;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="background:#FFFFFF;padding:2px 6px;border:1px solid #D9D7D4;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:9px;letter-spacing:1px;color:#1C1C1C;">${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [120, 50],
    iconAnchor: [60, 18],
    popupAnchor: [0, -20],
  });
}

function createClusterClaimedIcon(count: number, sectionName: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#3D7A5A;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:15px;color:#FFFFFF;">${count}</div>
      <div style="background:#FFFFFF;padding:2px 6px;border:1px solid #D9D7D4;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:9px;letter-spacing:1px;color:#1C1C1C;">${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [120, 60],
    iconAnchor: [60, 23],
    popupAnchor: [0, -25],
  });
}

function createSponsorIcon(logoUrl: string, companyName: string, sectionName: string) {
  // Inline <img> so the logo loads with the marker; failures render as a
  // text fallback so a missing file never breaks the map.
  return new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:center;width:50px;height:50px;background:#FFFFFF;border:3px solid #C45C26;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;">
        <img src="${logoUrl}" alt="${companyName}" style="max-width:42px;max-height:42px;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-family:Barlow Semi Condensed,sans-serif;font-weight:700;font-size:10px;color:#C45C26;letter-spacing:1px;text-align:center;\\'>'+this.alt.toUpperCase().slice(0,8)+'</span>';" />
      </div>
      <div style="background:#C45C26;padding:2px 6px;border-radius:3px;white-space:nowrap;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:8px;letter-spacing:1.5px;color:#1C1C1C;">SPONSORED · ${sectionName.toUpperCase()}</div>
    </div>`,
    iconSize: [140, 70],
    iconAnchor: [70, 28],
    popupAnchor: [0, -30],
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
  pledgerLocations?: PledgerLocation[];
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
  pledgerLocations = [],
  supportGiftLocations = [],
  pledgeCoveragePercent = 0,
  journalPosts = [],
  claimedSections = [],
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

  const countryClusters = useMemo(
    () => buildCountryClusters(pledgerLocations),
    [pledgerLocations]
  );

  const pledgeCoverageCoords = useMemo(
    () => buildPledgeCoverageCoords(pledgeCoveragePercent),
    [pledgeCoveragePercent]
  );

  // Two visibility rules:
  //  • A pledger-only entry (no sponsor) requires Paul to have passed the
  //    landmark — otherwise pin promises pile up on the early map.
  //  • A sponsor entry shows from day one — the deal was signed; the brand
  //    visibility is part of what was paid for.
  const visibleClaimedSections = useMemo(() => {
    if (!claimedSections || claimedSections.length === 0) return [];
    return claimedSections.filter(
      (entry) => entry.sponsor || entry.miles <= totalMiles + 0.01
    );
  }, [claimedSections, totalMiles]);

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

  // For pledger mode, zoom out to world view; supporters mode uses trail view
  const effectiveFlyTo = mode === "pledgers"
    ? [20, -40, 2] as [number, number, number]
    : flyTo;

  return (
    <MapContainer
      center={mode === "pledgers" ? [20, -40] : [40.0, -120.0]}
      zoom={mode === "pledgers" ? 2 : 6}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <FlyToHandler target={effectiveFlyTo} />
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
              ? createSponsorIcon(entry.sponsor.logoUrl, entry.sponsor.companyName, entry.name)
              : entry.count > 1
                ? createClusterClaimedIcon(entry.count, entry.name)
                : createSingleClaimedIcon(entry.name);
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

          {/* Country heatmap clusters — large translucent circles */}
          {countryClusters.map((cluster) => (
            <CircleMarker
              key={`cluster-${cluster.country}`}
              center={[cluster.lat, cluster.lng]}
              radius={Math.min(6 + Math.sqrt(cluster.count) * 8, 40)}
              pathOptions={{
                color: "transparent",
                weight: 0,
                fillColor: "#C45C26",
                fillOpacity: Math.min(0.08 + cluster.count * 0.04, 0.35),
              }}
            />
          ))}

          {/* Individual pledger avatar markers */}
          {pledgerLocations.map((loc, i) => (
            <Marker
              key={`pledger-${loc.lat}-${loc.lng}-${i}`}
              position={[loc.lat, loc.lng]}
              icon={createPledgerIcon(loc.avatar || "💚")}
            >
              <Popup>
                <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center", maxWidth: 200 }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{loc.avatar || "💚"}</div>
                  <strong style={{ fontSize: 13 }}>{loc.name}</strong>
                  <br />
                  <span style={{ fontSize: 11, color: "#5C5C5C" }}>
                    {loc.city}, {loc.country}
                  </span>
                  {loc.message && (
                    <>
                      <br />
                      <span style={{ fontSize: 11, color: "#1C1C1C", fontStyle: "italic", display: "block", marginTop: 4 }}>
                        &ldquo;{loc.message}&rdquo;
                      </span>
                    </>
                  )}
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
