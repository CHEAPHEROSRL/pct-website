"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { pctRouteCoords } from "@/lib/trail";

export default function MapLibreTolkien() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // PCT trail as GeoJSON — MapLibre uses [lng, lat], Leaflet uses [lat, lng]
    const pctGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: pctRouteCoords.map(([lat, lng]) => [lng, lat]),
      },
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [-118.5, 36.5],
      zoom: 7,
      attributionControl: false,
      style: {
        version: 8,
        glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
        sources: {
          ofm: {
            type: "vector",
            url: "https://tiles.openfreemap.org/planet",
          },
          "pct-trail": {
            type: "geojson",
            data: pctGeoJSON,
          },
        },
        layers: [
          // ── Parchment background ──────────────────────────────────────
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#f0e4b8" },
          },

          // ── Water ─────────────────────────────────────────────────────
          {
            id: "water-fill",
            type: "fill",
            source: "ofm",
            "source-layer": "water",
            paint: { "fill-color": "#9cc0d8", "fill-opacity": 0.85 },
          },
          {
            id: "waterway",
            type: "line",
            source: "ofm",
            "source-layer": "waterway",
            paint: { "line-color": "#9cc0d8", "line-width": 0.8, "line-opacity": 0.8 },
          },

          // ── Landcover ─────────────────────────────────────────────────
          {
            id: "forest",
            type: "fill",
            source: "ofm",
            "source-layer": "landcover",
            filter: ["==", ["get", "class"], "wood"],
            paint: { "fill-color": "#b8c898", "fill-opacity": 0.55 },
          },
          {
            id: "grass",
            type: "fill",
            source: "ofm",
            "source-layer": "landcover",
            filter: ["in", ["get", "class"], ["literal", ["grass", "farmland"]]],
            paint: { "fill-color": "#d8d0a0", "fill-opacity": 0.35 },
          },
          {
            id: "sand",
            type: "fill",
            source: "ofm",
            "source-layer": "landcover",
            filter: ["==", ["get", "class"], "sand"],
            paint: { "fill-color": "#e8d898", "fill-opacity": 0.5 },
          },

          // ── Landuse ───────────────────────────────────────────────────
          {
            id: "park",
            type: "fill",
            source: "ofm",
            "source-layer": "landuse",
            filter: ["in", ["get", "class"], ["literal", ["park", "national_park", "nature_reserve"]]],
            paint: { "fill-color": "#c4d4a4", "fill-opacity": 0.4 },
          },

          // ── Roads (thin sepia) ────────────────────────────────────────
          {
            id: "road-minor",
            type: "line",
            source: "ofm",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor", "tertiary", "service"]]],
            paint: { "line-color": "#c8ae80", "line-width": 0.7, "line-opacity": 0.6 },
          },
          {
            id: "road-major",
            type: "line",
            source: "ofm",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]],
            paint: { "line-color": "#b09050", "line-width": 1.2, "line-opacity": 0.65 },
          },
          {
            id: "hiking-path",
            type: "line",
            source: "ofm",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["path", "track"]]],
            paint: {
              "line-color": "#b09060",
              "line-width": 0.6,
              "line-opacity": 0.5,
              "line-dasharray": [2, 2],
            },
          },

          // ── Borders ───────────────────────────────────────────────────
          {
            id: "state-border",
            type: "line",
            source: "ofm",
            "source-layer": "boundary",
            filter: ["==", ["get", "admin_level"], 4],
            paint: { "line-color": "#a08858", "line-width": 1, "line-dasharray": [4, 3], "line-opacity": 0.5 },
          },

          // ── PCT Trail ─────────────────────────────────────────────────
          {
            id: "pct-glow",
            type: "line",
            source: "pct-trail",
            paint: {
              "line-color": "#f0d0b0",
              "line-width": 10,
              "line-opacity": 0.3,
              "line-blur": 4,
            },
          },
          {
            id: "pct-trail",
            type: "line",
            source: "pct-trail",
            paint: {
              "line-color": "#8B2500",
              "line-width": 3,
              "line-dasharray": [5, 2],
            },
          },

          // ── Labels ────────────────────────────────────────────────────
          {
            id: "place-city",
            type: "symbol",
            source: "ofm",
            "source-layer": "place",
            filter: ["in", ["get", "class"], ["literal", ["city", "town"]]],
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Open Sans Bold"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 12, 14],
              "text-max-width": 8,
              "text-letter-spacing": 0.05,
            },
            paint: {
              "text-color": "#3a2010",
              "text-halo-color": "rgba(240, 228, 184, 0.9)",
              "text-halo-width": 2,
            },
          },
          {
            id: "place-village",
            type: "symbol",
            source: "ofm",
            "source-layer": "place",
            filter: ["in", ["get", "class"], ["literal", ["village", "hamlet", "suburb"]]],
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Open Sans Regular"],
              "text-size": 10,
              "text-max-width": 6,
            },
            paint: {
              "text-color": "#5a3820",
              "text-halo-color": "rgba(240, 228, 184, 0.9)",
              "text-halo-width": 1.5,
            },
          },
          {
            id: "mountain-peaks",
            type: "symbol",
            source: "ofm",
            "source-layer": "mountain_peak",
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Open Sans Regular"],
              "text-size": 10,
              "text-offset": [0, 1],
              "text-anchor": "top",
            },
            paint: {
              "text-color": "#6a4020",
              "text-halo-color": "rgba(240, 228, 184, 0.8)",
              "text-halo-width": 1.5,
            },
          },
        ],
      },
    });

    // Cleanup
    return () => map.remove();
  }, []);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
  );
}
