"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { pctRouteCoords } from "@/lib/trail";

// ─────────────────────────────────────────────────────────────────────────────
// Icon factories — each returns ImageData drawn on an offscreen canvas
// ─────────────────────────────────────────────────────────────────────────────

/** Mountain range: 5 connected peaks as one continuous silhouette */
function mountainRangeIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 104; c.height = 54;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";

  // Main silhouette — connected peaks polygon
  ctx.fillStyle = "#c4a858";
  ctx.strokeStyle = "#5a3810";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 54);
  ctx.lineTo(6, 44);    // minor left peak
  ctx.lineTo(14, 47);   // valley
  ctx.lineTo(26, 26);   // medium peak
  ctx.lineTo(34, 36);   // valley
  ctx.lineTo(52, 4);    // TALLEST peak (center)
  ctx.lineTo(68, 32);   // valley
  ctx.lineTo(80, 14);   // second tall peak
  ctx.lineTo(88, 34);   // valley
  ctx.lineTo(96, 40);   // minor right peak
  ctx.lineTo(104, 54);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snow cap on tallest peak
  ctx.fillStyle = "#f0eadc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(52, 4); ctx.lineTo(44, 19); ctx.lineTo(60, 19);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Smaller snow cap on second peak
  ctx.beginPath();
  ctx.moveTo(80, 14); ctx.lineTo(74, 25); ctx.lineTo(86, 25);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Hatching on left face of tallest peak
  ctx.strokeStyle = "#9a8030";
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 5; i++) {
    const t = 0.25 + i * 0.14;
    const px = 34 + (52 - 34) * t;
    const py = 36 + (4 - 36) * t;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 7, py + 9); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Single dramatic sharp peak — for prominent named peaks */
function mountainPeakIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 50; c.height = 52;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";

  // Slight shadow / secondary ridge behind
  ctx.fillStyle = "#b09050";
  ctx.strokeStyle = "#5a3810";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(8, 52); ctx.lineTo(32, 14); ctx.lineTo(50, 52);
  ctx.closePath(); ctx.fill();

  // Main peak (front)
  ctx.fillStyle = "#ccaa60";
  ctx.beginPath();
  ctx.moveTo(0, 52); ctx.lineTo(25, 4); ctx.lineTo(44, 52);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Snow cap
  ctx.fillStyle = "#f0eadc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(25, 4); ctx.lineTo(18, 20); ctx.lineTo(32, 20);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Hatching
  ctx.strokeStyle = "#a08040";
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.4;
  for (let i = 1; i < 5; i++) {
    const x = 6 + i * 5;
    ctx.beginPath(); ctx.moveTo(x, 52); ctx.lineTo(x - 2, 52 - i * 6); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Rolling hill — for minor peaks and foothills */
function mountainHillIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 60; c.height = 38;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";

  // Back hill (slightly darker)
  ctx.fillStyle = "#b8983c";
  ctx.strokeStyle = "#5a3810";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 38);
  ctx.quadraticCurveTo(50, 4, 60, 38);
  ctx.closePath(); ctx.fill();

  // Front hill (main, lighter)
  ctx.fillStyle = "#caa84c";
  ctx.beginPath();
  ctx.moveTo(0, 38);
  ctx.quadraticCurveTo(26, 6, 52, 38);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Subtle texture dots
  ctx.fillStyle = "#9a7830";
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 5; i++) {
    const x = 10 + i * 8;
    const y = 28 - Math.abs(i - 2) * 3;
    ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Full castle — for major cities (rank 1–4) */
function castleIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 40; c.height = 44;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#5a3810";
  const F = "#d4b880";
  const D = "#8a5020";

  function cren(x: number, y: number, count: number, tw: number) {
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = F;
        ctx.fillRect(x + i * tw, y, tw, 5);
        ctx.strokeRect(x + i * tw, y, tw, 5);
      }
    }
  }

  ctx.lineWidth = 1.5;
  ctx.fillStyle = F;

  // Left tower
  ctx.fillRect(0, 12, 11, 32); ctx.strokeRect(0, 12, 11, 32);
  cren(0, 7, 4, 3);
  // Right tower
  ctx.fillRect(29, 12, 11, 32); ctx.strokeRect(29, 12, 11, 32);
  cren(29, 7, 4, 3);
  // Main keep
  ctx.fillRect(9, 18, 22, 26); ctx.strokeRect(9, 18, 22, 26);
  cren(9, 13, 6, 4);

  // Arched gate
  ctx.fillStyle = D;
  ctx.beginPath();
  ctx.moveTo(14, 44); ctx.lineTo(14, 32);
  ctx.arc(20, 32, 6, Math.PI, 0);
  ctx.lineTo(26, 44);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Arrow slits
  ctx.fillStyle = D; ctx.lineWidth = 0.8;
  ctx.fillRect(2, 20, 2, 6); ctx.strokeRect(2, 20, 2, 6);
  ctx.fillRect(6, 20, 2, 6); ctx.strokeRect(6, 20, 2, 6);
  ctx.fillRect(30, 20, 2, 6); ctx.strokeRect(30, 20, 2, 6);
  ctx.fillRect(34, 20, 2, 6); ctx.strokeRect(34, 20, 2, 6);

  // Flag on left tower
  ctx.strokeStyle = "#5a3810"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(5, 1); ctx.stroke();
  ctx.fillStyle = "#8B2200";
  ctx.beginPath(); ctx.moveTo(5, 1); ctx.lineTo(10, 3); ctx.lineTo(5, 5); ctx.closePath(); ctx.fill();

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Fortified town wall — for smaller cities (rank 5+) */
function fortifiedTownIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 56; c.height = 40;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#5a3810";
  const F = "#d4b880";
  const D = "#8a5020";

  ctx.lineWidth = 1.5;
  ctx.fillStyle = F;

  // Left wall section
  ctx.fillRect(0, 18, 16, 22); ctx.strokeRect(0, 18, 16, 22);
  // Left battlements
  ctx.fillRect(0, 13, 4, 7); ctx.strokeRect(0, 13, 4, 7);
  ctx.fillRect(6, 13, 4, 7); ctx.strokeRect(6, 13, 4, 7);
  ctx.fillRect(12, 13, 4, 7); ctx.strokeRect(12, 13, 4, 7);

  // Center gate tower (tallest)
  ctx.fillRect(14, 4, 28, 36); ctx.strokeRect(14, 4, 28, 36);
  // Gate tower battlements
  ctx.fillRect(14, 0, 5, 6); ctx.strokeRect(14, 0, 5, 6);
  ctx.fillRect(21, 0, 5, 6); ctx.strokeRect(21, 0, 5, 6);
  ctx.fillRect(28, 0, 5, 6); ctx.strokeRect(28, 0, 5, 6);
  ctx.fillRect(35, 0, 5, 6); ctx.strokeRect(35, 0, 5, 6);

  // Right wall section
  ctx.fillStyle = F;
  ctx.fillRect(40, 18, 16, 22); ctx.strokeRect(40, 18, 16, 22);
  ctx.fillRect(40, 13, 4, 7); ctx.strokeRect(40, 13, 4, 7);
  ctx.fillRect(46, 13, 4, 7); ctx.strokeRect(46, 13, 4, 7);
  ctx.fillRect(52, 13, 4, 7); ctx.strokeRect(52, 13, 4, 7);

  // Arched gate in center tower
  ctx.fillStyle = D;
  ctx.beginPath();
  ctx.moveTo(21, 40); ctx.lineTo(21, 27);
  ctx.arc(28, 27, 7, Math.PI, 0);
  ctx.lineTo(35, 40);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Arrow slits on tower
  ctx.fillStyle = D; ctx.lineWidth = 0.8;
  ctx.fillRect(17, 10, 2, 8); ctx.strokeRect(17, 10, 2, 8);
  ctx.fillRect(37, 10, 2, 8); ctx.strokeRect(37, 10, 2, 8);

  // Flag on center tower
  ctx.strokeStyle = "#5a3810"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(28, -5); ctx.stroke();
  ctx.fillStyle = "#8B2200";
  ctx.beginPath(); ctx.moveTo(28, -5); ctx.lineTo(34, -3); ctx.lineTo(28, -1); ctx.closePath(); ctx.fill();

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Watchtower — for towns */
function watchtowerIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 24; c.height = 48;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#5a3810";
  const F = "#d4b880";
  const D = "#8a5020";

  ctx.lineWidth = 1.5;
  ctx.fillStyle = F;

  // Base (slightly wider)
  ctx.fillRect(2, 38, 20, 10); ctx.strokeRect(2, 38, 20, 10);

  // Tower body
  ctx.fillRect(5, 10, 14, 30); ctx.strokeRect(5, 10, 14, 30);

  // Battlements at top
  ctx.fillRect(5, 6, 4, 6); ctx.strokeRect(5, 6, 4, 6);
  ctx.fillRect(11, 6, 4, 6); ctx.strokeRect(11, 6, 4, 6);
  ctx.fillRect(15, 6, 4, 6); ctx.strokeRect(15, 6, 4, 6);

  // Arrow slits
  ctx.fillStyle = D; ctx.lineWidth = 0.8;
  ctx.fillRect(10, 15, 4, 7); ctx.strokeRect(10, 15, 4, 7);
  ctx.fillRect(10, 26, 4, 7); ctx.strokeRect(10, 26, 4, 7);

  // Door
  ctx.fillRect(9, 36, 6, 12); ctx.strokeRect(9, 36, 6, 12);

  // Flag
  ctx.strokeStyle = "#5a3810"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(12, 0); ctx.stroke();
  ctx.fillStyle = "#8B2200";
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(18, 2); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill();

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Village house — for small villages */
function villageIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 28; c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#5a3810";
  ctx.lineWidth = 1.5;

  ctx.fillStyle = "#d4b880";
  ctx.fillRect(2, 16, 24, 16); ctx.strokeRect(2, 16, 24, 16);

  ctx.fillStyle = "#a06830";
  ctx.beginPath();
  ctx.moveTo(0, 17); ctx.lineTo(14, 3); ctx.lineTo(28, 17);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#c09050";
  ctx.fillRect(19, 5, 3, 9); ctx.strokeRect(19, 5, 3, 9);

  ctx.fillStyle = "#7a4820";
  ctx.fillRect(10, 22, 8, 10); ctx.strokeRect(10, 22, 8, 10);
  ctx.fillStyle = "#d4a040";
  ctx.beginPath(); ctx.arc(17, 27, 1, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#b0ccd8";
  ctx.fillRect(3, 19, 5, 5); ctx.strokeRect(3, 19, 5, 5);
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(5.5, 19); ctx.lineTo(5.5, 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 21.5); ctx.lineTo(8, 21.5); ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.fillRect(20, 19, 5, 5); ctx.strokeRect(20, 19, 5, 5);
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(22.5, 19); ctx.lineTo(22.5, 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, 21.5); ctx.lineTo(25, 21.5); ctx.stroke();

  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Pine tree — for forest areas at higher zoom */
function treeIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 18; c.height = 26;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#4a5830";
  ctx.lineJoin = "round"; ctx.lineWidth = 1;

  ctx.fillStyle = "#7a9860";
  ctx.beginPath(); ctx.moveTo(9, 1); ctx.lineTo(1, 10); ctx.lineTo(17, 10);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#6a8850";
  ctx.beginPath(); ctx.moveTo(9, 7); ctx.lineTo(0, 18); ctx.lineTo(18, 18);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#8a6040"; ctx.strokeStyle = "#5a3810";
  ctx.fillRect(7, 18, 4, 7); ctx.strokeRect(7, 18, 4, 7);

  return ctx.getImageData(0, 0, c.width, c.height);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MapLibreTolkien() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
          ofm: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
          "pct-trail": { type: "geojson", data: pctGeoJSON },
        },
        layers: [
          // Parchment ground
          { id: "bg", type: "background", paint: { "background-color": "#f0e4b0" } },

          // Water
          { id: "water", type: "fill", source: "ofm", "source-layer": "water",
            paint: { "fill-color": "#8ab8d4", "fill-opacity": 0.8 } },
          { id: "waterway", type: "line", source: "ofm", "source-layer": "waterway",
            paint: { "line-color": "#8ab8d4", "line-width": 0.8, "line-opacity": 0.7 } },

          // Landcover
          { id: "forest", type: "fill", source: "ofm", "source-layer": "landcover",
            filter: ["==", ["get", "class"], "wood"],
            paint: { "fill-color": "#a8bc84", "fill-opacity": 0.4 } },
          { id: "grass", type: "fill", source: "ofm", "source-layer": "landcover",
            filter: ["in", ["get", "class"], ["literal", ["grass", "farmland"]]],
            paint: { "fill-color": "#d4cc90", "fill-opacity": 0.3 } },

          // Parks / wilderness
          { id: "park", type: "fill", source: "ofm", "source-layer": "landuse",
            filter: ["in", ["get", "class"], ["literal", ["park", "national_park", "nature_reserve"]]],
            paint: { "fill-color": "#b4cc90", "fill-opacity": 0.3 } },

          // State borders
          { id: "state-border", type: "line", source: "ofm", "source-layer": "boundary",
            filter: ["==", ["get", "admin_level"], 4],
            paint: { "line-color": "#9a7840", "line-width": 1, "line-dasharray": [5, 3], "line-opacity": 0.55 } },

          // Roads (very quiet — sepia, thin)
          { id: "road-minor", type: "line", source: "ofm", "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor", "tertiary", "service"]]],
            paint: { "line-color": "#c8ae78", "line-width": 0.5, "line-opacity": 0.45 } },
          { id: "road-major", type: "line", source: "ofm", "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]],
            paint: { "line-color": "#b09050", "line-width": 1.1, "line-opacity": 0.55 } },

          // PCT Trail — the hero
          { id: "pct-glow", type: "line", source: "pct-trail",
            paint: { "line-color": "#e8c090", "line-width": 14, "line-opacity": 0.2, "line-blur": 8 } },
          { id: "pct-trail", type: "line", source: "pct-trail",
            paint: { "line-color": "#8B2200", "line-width": 3.5, "line-dasharray": [6, 2] } },
        ],
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      // Register all icon sprites
      map.addImage("mountain-range", mountainRangeIcon());
      map.addImage("mountain-peak",  mountainPeakIcon());
      map.addImage("mountain-hill",  mountainHillIcon());
      map.addImage("castle",         castleIcon());
      map.addImage("fort",           fortifiedTownIcon());
      map.addImage("watchtower",     watchtowerIcon());
      map.addImage("village-house",  villageIcon());
      map.addImage("tree",           treeIcon());

      // ── MOUNTAINS ───────────────────────────────────────────────────────

      // Rank ≤ 6 → range silhouette (Sierra Nevada, Cascades, etc.)
      map.addLayer({
        id: "mtn-range", type: "symbol", source: "ofm", "source-layer": "mountain_peak",
        filter: ["<=", ["coalesce", ["get", "rank"], 99], 6],
        layout: {
          "icon-image": "mountain-range",
          "icon-size": 0.65,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["step", ["zoom"], "", 8, ["get", "name"]],
          "text-font": ["Open Sans Regular"],
          "text-size": 10,
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#4a2c0e",
          "text-halo-color": "rgba(240, 228, 176, 0.92)", "text-halo-width": 1.8,
        },
      });

      // Rank 7–18 → single dramatic peak
      map.addLayer({
        id: "mtn-peak", type: "symbol", source: "ofm", "source-layer": "mountain_peak",
        filter: ["all",
          [">",  ["coalesce", ["get", "rank"], 99], 6],
          ["<=", ["coalesce", ["get", "rank"], 99], 18],
        ],
        layout: {
          "icon-image": "mountain-peak",
          "icon-size": 0.7,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["step", ["zoom"], "", 9, ["get", "name"]],
          "text-font": ["Open Sans Regular"],
          "text-size": 9,
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#5a3820",
          "text-halo-color": "rgba(240, 228, 176, 0.9)", "text-halo-width": 1.5,
        },
      });

      // Rank > 18 → rolling hill (minor peaks, zoom 10+)
      map.addLayer({
        id: "mtn-hill", type: "symbol", source: "ofm", "source-layer": "mountain_peak",
        filter: [">", ["coalesce", ["get", "rank"], 99], 18],
        minzoom: 9,
        layout: {
          "icon-image": "mountain-hill",
          "icon-size": 0.6,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["step", ["zoom"], "", 11, ["get", "name"]],
          "text-font": ["Open Sans Regular"],
          "text-size": 9,
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#6a4828",
          "text-halo-color": "rgba(240, 228, 176, 0.9)", "text-halo-width": 1.5,
        },
      });

      // ── CITIES & TOWNS ────────────────────────────────────────────────

      // Major cities (rank ≤ 4) → full castle
      map.addLayer({
        id: "city-castle", type: "symbol", source: "ofm", "source-layer": "place",
        filter: ["all", ["==", ["get", "class"], "city"], ["<=", ["coalesce", ["get", "rank"], 99], 4]],
        layout: {
          "icon-image": "castle",
          "icon-size": 0.75,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 12, 12, 16],
          "text-anchor": "top", "text-offset": [0, 0.4],
          "text-optional": true,
          "text-letter-spacing": 0.1,
        },
        paint: {
          "text-color": "#1e1000",
          "text-halo-color": "rgba(240, 228, 176, 0.96)", "text-halo-width": 2.5,
        },
      });

      // Smaller cities (rank 5+) → fortified wall
      map.addLayer({
        id: "city-fort", type: "symbol", source: "ofm", "source-layer": "place",
        filter: ["all", ["==", ["get", "class"], "city"], [">", ["coalesce", ["get", "rank"], 99], 4]],
        layout: {
          "icon-image": "fort",
          "icon-size": 0.65,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 12, 14],
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#2a1800",
          "text-halo-color": "rgba(240, 228, 176, 0.94)", "text-halo-width": 2,
        },
      });

      // Towns → watchtower
      map.addLayer({
        id: "town-tower", type: "symbol", source: "ofm", "source-layer": "place",
        filter: ["==", ["get", "class"], "town"],
        minzoom: 8,
        layout: {
          "icon-image": "watchtower",
          "icon-size": 0.6,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular"],
          "text-size": 10,
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#3a2010",
          "text-halo-color": "rgba(240, 228, 176, 0.9)", "text-halo-width": 1.5,
        },
      });

      // Villages → small house
      map.addLayer({
        id: "village-house", type: "symbol", source: "ofm", "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["village", "hamlet"]]],
        minzoom: 10,
        layout: {
          "icon-image": "village-house",
          "icon-size": 0.55,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular"],
          "text-size": 9,
          "text-anchor": "top", "text-offset": [0, 0.3],
          "text-optional": true,
        },
        paint: {
          "text-color": "#4a3020",
          "text-halo-color": "rgba(240, 228, 176, 0.9)", "text-halo-width": 1.5,
        },
      });

      // Forest tree icons at zoom 10+
      map.addLayer({
        id: "forest-trees", type: "symbol", source: "ofm", "source-layer": "landcover",
        filter: ["==", ["get", "class"], "wood"],
        minzoom: 10,
        layout: {
          "icon-image": "tree",
          "icon-size": 0.85,
          "symbol-placement": "line",
          "symbol-spacing": 55,
          "icon-allow-overlap": false,
          "icon-padding": 2,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {/* Parchment vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        boxShadow: "inset 0 0 100px 30px rgba(100, 65, 15, 0.2)",
        borderRadius: "inherit",
      }} />
    </div>
  );
}
