"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FlyToHandler({ target }: { target?: [number, number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target[0], target[1]], target[2], { duration: 1.5 });
    }
  }, [map, target]);
  return null;
}

// Custom burnt-orange marker icon
const currentPositionIcon = new L.DivIcon({
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
    ">DAY 3 · CAMPO, CA</div>
  </div>`,
  iconSize: [140, 60],
  iconAnchor: [70, 32],
  popupAnchor: [0, -36],
});

// Simplified PCT route — key waypoints from Mexico to Canada
const pctRoute: [number, number][] = [
  // Southern Terminus — Campo, CA
  [32.589, -116.467],
  // Southern California
  [32.72, -116.48],
  [32.88, -116.52],
  [33.05, -116.60],
  [33.24, -116.68],
  [33.35, -116.70],
  [33.47, -116.72],
  [33.60, -116.80],
  [33.82, -116.83],
  [33.92, -116.85],
  [34.02, -117.05],
  [34.18, -117.30],
  [34.24, -117.45],
  [34.32, -117.68],
  [34.37, -117.82],
  [34.43, -118.06],
  [34.68, -118.25],
  [34.78, -118.38],
  [34.82, -118.52],
  // Kennedy Meadows
  [36.02, -118.08],
  // Sierra Nevada
  [36.45, -118.18],
  [36.58, -118.25],
  [36.74, -118.40],
  [37.00, -118.52],
  [37.24, -118.60],
  [37.50, -118.68],
  [37.74, -118.78],
  // Tuolumne Meadows
  [37.87, -119.33],
  // Northern California
  [38.18, -119.60],
  [38.65, -119.90],
  [39.15, -120.12],
  [39.50, -120.25],
  [39.95, -120.55],
  [40.42, -121.30],
  [40.78, -121.50],
  [41.18, -122.05],
  [41.55, -122.28],
  [41.85, -122.38],
  // Ashland, OR
  [42.18, -122.68],
  // Oregon
  [42.55, -122.15],
  [42.87, -122.10],
  [43.10, -122.12],
  [43.55, -121.98],
  [44.05, -121.78],
  [44.48, -121.78],
  [44.82, -121.85],
  [45.10, -121.82],
  // Cascade Locks
  [45.67, -121.90],
  // Washington
  [45.85, -121.70],
  [46.15, -121.52],
  [46.38, -121.48],
  [46.72, -121.38],
  [47.05, -121.18],
  [47.35, -121.08],
  [47.55, -120.92],
  [47.85, -120.75],
  [48.15, -120.68],
  [48.42, -120.62],
  [48.65, -120.72],
  [48.85, -120.78],
  // Northern Terminus — Manning Park, BC
  [49.00, -121.05],
];

// Current position (Day 3 — near Campo, CA)
const currentPosition: [number, number] = [32.65, -116.47];

export default function TrailMapView({ flyTo }: { flyTo?: [number, number, number] }) {
  return (
    <MapContainer
      center={[40.0, -120.0]}
      zoom={6}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <FlyToHandler target={flyTo} />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* PCT Trail Route */}
      <Polyline
        positions={pctRoute}
        pathOptions={{
          color: "#C45C26",
          weight: 3,
          opacity: 0.85,
        }}
      />

      {/* Current Position Marker */}
      <Marker position={currentPosition} icon={currentPositionIcon}>
        <Popup>
          <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", textAlign: "center" }}>
            <strong style={{ fontSize: 14 }}>Day 3 — Campo, CA</strong>
            <br />
            <span style={{ fontSize: 12, color: "#5C5C5C" }}>Mile 42.7 of 2,650</span>
            <br />
            <span style={{ fontSize: 12, color: "#5C5C5C" }}>Elevation: 3,845 ft</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
