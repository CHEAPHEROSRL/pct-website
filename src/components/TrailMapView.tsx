"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pctRouteCoords, pctWaypoints } from "@/lib/trail";
import type { PledgerLocation, SupportGiftLocation } from "@/lib/types";

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

const GIFT_EMOJI: Record<string, string> = {
  "A Trail Meal": "🍽️",
  "Hiking Socks": "🧦",
  "A Night at Camp": "⛺",
  "A Resupply Box": "📦",
  "A Rest Day in Town": "🛏️",
  "Trail Boots": "🥾",
};

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

          {/* Individual pledger dots */}
          {pledgerLocations.map((loc, i) => (
            <CircleMarker
              key={`pledger-${loc.lat}-${loc.lng}-${i}`}
              center={[loc.lat, loc.lng]}
              radius={6}
              pathOptions={{
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: "#C45C26",
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center", maxWidth: 200 }}>
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
            </CircleMarker>
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
