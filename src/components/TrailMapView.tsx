"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pctRouteCoords } from "@/lib/trail";
import type { PledgerLocation } from "@/lib/types";

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

interface TrailMapViewProps {
  flyTo?: [number, number, number];
  currentPosition?: { lat: number; lng: number } | null;
  dayNumber?: number;
  nearestLocationName?: string;
  totalMiles?: number;
  currentElevation?: number;
  mode?: "trail" | "pledgers";
  pledgerLocations?: PledgerLocation[];
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
}: TrailMapViewProps) {
  const position: [number, number] = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : DEFAULT_POSITION;

  const icon = useMemo(
    () => createMarkerIcon(dayNumber, nearestLocationName),
    [dayNumber, nearestLocationName]
  );

  // For pledger mode, zoom out to world view
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
          {/* PCT Trail Route (faded) */}
          <Polyline
            positions={pctRouteCoords}
            pathOptions={{
              color: "#C45C26",
              weight: 2,
              opacity: 0.3,
            }}
          />

          {/* Pledger location markers */}
          {pledgerLocations.map((loc, i) => (
            <CircleMarker
              key={`${loc.lat}-${loc.lng}-${i}`}
              center={[loc.lat, loc.lng]}
              radius={7}
              pathOptions={{
                color: "#FFFFFF",
                weight: 2,
                fillColor: "#C45C26",
                fillOpacity: 0.85,
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
    </MapContainer>
  );
}
