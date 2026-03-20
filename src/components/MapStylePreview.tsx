"use client";

import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { pctRouteCoords } from "@/lib/trail";

interface MapStylePreviewProps {
  tileUrl: string;
  attribution: string;
  trailColor: string;
}

export default function MapStylePreview({
  tileUrl,
  attribution,
  trailColor,
}: MapStylePreviewProps) {
  return (
    <MapContainer
      center={[36.5, -118.5]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
      dragging={true}
      scrollWheelZoom={false}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      <Polyline
        positions={pctRouteCoords}
        color={trailColor}
        weight={2.5}
        opacity={0.85}
      />
    </MapContainer>
  );
}
