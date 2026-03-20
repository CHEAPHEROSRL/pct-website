"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { pctRouteCoords } from "@/lib/trail";

// ── Illustrated icon factories (drawn on canvas, injected as sprites) ──

function mountainIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 60; c.height = 46;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";

  // Back mountain (left, darker)
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#b89858";
  ctx.strokeStyle = "#5a3810";
  ctx.beginPath();
  ctx.moveTo(2, 44); ctx.lineTo(22, 10); ctx.lineTo(42, 44);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Front mountain (right, taller, lighter)
  ctx.fillStyle = "#ccaa60";
  ctx.beginPath();
  ctx.moveTo(18, 44); ctx.lineTo(38, 4); ctx.lineTo(58, 44);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Snow cap
  ctx.fillStyle = "#f0eadc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(38, 4); ctx.lineTo(32, 15); ctx.lineTo(44, 15);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Hatching lines on back mountain for texture
  ctx.strokeStyle = "#a08040";
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 5; i++) {
    const x = 14 + i * 4;
    ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(22, 10 + (44 - 10) * 0.3); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return ctx.getImageData(0, 0, c.width, c.height);
}

function castleIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 38; c.height = 42;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#5a3810";
  const F = "#d4b880";
  const D = "#8a5020";

  function battlement(x: number, y: number, w: number) {
    // Draw crenellation: filled sections alternating with gaps
    const tw = Math.floor(w / 3);
    for (let i = 0; i < 3; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = F;
        ctx.fillRect(x + i * tw, y, tw, 5);
        ctx.strokeRect(x + i * tw, y, tw, 5);
      }
    }
  }

  // Left tower body
  ctx.lineWidth = 1.5;
  ctx.fillStyle = F;
  ctx.fillRect(0, 12, 11, 30); ctx.strokeRect(0, 12, 11, 30);
  battlement(0, 7, 11);

  // Right tower body
  ctx.fillRect(27, 12, 11, 30); ctx.strokeRect(27, 12, 11, 30);
  battlement(27, 7, 11);

  // Main keep
  ctx.fillRect(9, 18, 20, 24); ctx.strokeRect(9, 18, 20, 24);
  battlement(9, 13, 20);

  // Arched gate
  ctx.fillStyle = D;
  ctx.beginPath();
  ctx.moveTo(13, 42); ctx.lineTo(13, 30);
  ctx.arc(19, 30, 6, Math.PI, 0);
  ctx.lineTo(25, 42);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Arrow slits on towers
  ctx.fillStyle = D;
  ctx.lineWidth = 0.8;
  ctx.fillRect(3, 18, 2, 6); ctx.strokeRect(3, 18, 2, 6);
  ctx.fillRect(7, 18, 2, 6); ctx.strokeRect(7, 18, 2, 6);
  ctx.fillRect(29, 18, 2, 6); ctx.strokeRect(29, 18, 2, 6);
  ctx.fillRect(33, 18, 2, 6); ctx.strokeRect(33, 18, 2, 6);

  return ctx.getImageData(0, 0, c.width, c.height);
}

function villageIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 28; c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#5a3810";
  ctx.lineWidth = 1.5;

  // House body
  ctx.fillStyle = "#d4b880";
  ctx.fillRect(2, 16, 24, 16); ctx.strokeRect(2, 16, 24, 16);

  // Roof
  ctx.fillStyle = "#a06830";
  ctx.beginPath();
  ctx.moveTo(0, 17); ctx.lineTo(14, 3); ctx.lineTo(28, 17);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Chimney
  ctx.fillStyle = "#c09050";
  ctx.fillRect(19, 5, 3, 9); ctx.strokeRect(19, 5, 3, 9);

  // Door
  ctx.fillStyle = "#7a4820";
  ctx.fillRect(10, 22, 8, 10); ctx.strokeRect(10, 22, 8, 10);

  // Door knob
  ctx.fillStyle = "#d4a040";
  ctx.beginPath(); ctx.arc(17, 27, 1, 0, Math.PI * 2); ctx.fill();

  // Windows
  ctx.fillStyle = "#b0ccd8";
  ctx.fillRect(3, 18, 5, 5); ctx.strokeRect(3, 18, 5, 5);
  // Window cross
  ctx.strokeStyle = "#5a3810"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(5.5, 18); ctx.lineTo(5.5, 23); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 20.5); ctx.lineTo(8, 20.5); ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#b0ccd8";
  ctx.fillRect(20, 18, 5, 5); ctx.strokeRect(20, 18, 5, 5);
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(22.5, 18); ctx.lineTo(22.5, 23); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, 20.5); ctx.lineTo(25, 20.5); ctx.stroke();

  return ctx.getImageData(0, 0, c.width, c.height);
}

function treeIcon(): ImageData {
  const c = document.createElement("canvas");
  c.width = 18; c.height = 26;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#4a5830";
  ctx.lineJoin = "round";

  // Top layer
  ctx.lineWidth = 1;
  ctx.fillStyle = "#7a9860";
  ctx.beginPath();
  ctx.moveTo(9, 1); ctx.lineTo(1, 10); ctx.lineTo(17, 10);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Mid layer
  ctx.fillStyle = "#6a8850";
  ctx.beginPath();
  ctx.moveTo(9, 7); ctx.lineTo(0, 18); ctx.lineTo(18, 18);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Trunk
  ctx.fillStyle = "#8a6040";
  ctx.strokeStyle = "#5a3810";
  ctx.fillRect(7, 18, 4, 7); ctx.strokeRect(7, 18, 4, 7);

  return ctx.getImageData(0, 0, c.width, c.height);
}

export default function MapLibreTolkien() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const pctGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        // MapLibre = [lng, lat]; pctRouteCoords = [lat, lng]
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
          // Parchment background
          { id: "bg", type: "background", paint: { "background-color": "#f0e4b0" } },

          // Water
          {
            id: "water-fill", type: "fill", source: "ofm", "source-layer": "water",
            paint: { "fill-color": "#8ab8d4", "fill-opacity": 0.8 },
          },
          {
            id: "waterway", type: "line", source: "ofm", "source-layer": "waterway",
            paint: { "line-color": "#8ab8d4", "line-width": 0.8, "line-opacity": 0.8 },
          },

          // Landcover
          {
            id: "forest", type: "fill", source: "ofm", "source-layer": "landcover",
            filter: ["==", ["get", "class"], "wood"],
            paint: { "fill-color": "#a8bc88", "fill-opacity": 0.45 },
          },
          {
            id: "grass", type: "fill", source: "ofm", "source-layer": "landcover",
            filter: ["in", ["get", "class"], ["literal", ["grass", "farmland"]]],
            paint: { "fill-color": "#d4cc94", "fill-opacity": 0.3 },
          },

          // National parks / wilderness
          {
            id: "park-fill", type: "fill", source: "ofm", "source-layer": "landuse",
            filter: ["in", ["get", "class"], ["literal", ["park", "national_park", "nature_reserve"]]],
            paint: { "fill-color": "#b8cc98", "fill-opacity": 0.35 },
          },

          // State borders (dashed, sepia)
          {
            id: "state-border", type: "line", source: "ofm", "source-layer": "boundary",
            filter: ["==", ["get", "admin_level"], 4],
            paint: { "line-color": "#9a7840", "line-width": 1, "line-dasharray": [5, 3], "line-opacity": 0.6 },
          },

          // Roads — thin sepia, no visual noise
          {
            id: "road-minor", type: "line", source: "ofm", "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor", "tertiary", "service"]]],
            paint: { "line-color": "#c8ae78", "line-width": 0.6, "line-opacity": 0.5 },
          },
          {
            id: "road-major", type: "line", source: "ofm", "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]],
            paint: { "line-color": "#b09050", "line-width": 1.2, "line-opacity": 0.6 },
          },

          // PCT Trail — hero element
          {
            id: "pct-glow", type: "line", source: "pct-trail",
            paint: { "line-color": "#e8c090", "line-width": 12, "line-opacity": 0.25, "line-blur": 6 },
          },
          {
            id: "pct-trail", type: "line", source: "pct-trail",
            paint: { "line-color": "#8B2200", "line-width": 3.5, "line-dasharray": [6, 2] },
          },
        ],
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      // Register illustrated icons
      map.addImage("mountain-icon", mountainIcon());
      map.addImage("castle-icon", castleIcon());
      map.addImage("village-icon", villageIcon());
      map.addImage("tree-icon", treeIcon());

      // ── Mountain peaks — illustrated mountain symbol + name
      map.addLayer({
        id: "mountain-peaks",
        type: "symbol",
        source: "ofm",
        "source-layer": "mountain_peak",
        layout: {
          "icon-image": "mountain-icon",
          "icon-size": 0.75,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "icon-ignore-placement": false,
          "text-field": ["step", ["zoom"], "", 8, ["get", "name"]],
          "text-font": ["Open Sans Regular"],
          "text-size": 10,
          "text-offset": [0, 0.3],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#5a3820",
          "text-halo-color": "rgba(240, 228, 176, 0.9)",
          "text-halo-width": 1.5,
        },
      });

      // ── Cities — castle icon + bold name
      map.addLayer({
        id: "city-icons",
        type: "symbol",
        source: "ofm",
        "source-layer": "place",
        filter: ["==", ["get", "class"], "city"],
        layout: {
          "icon-image": "castle-icon",
          "icon-size": 0.7,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 12, 15],
          "text-offset": [0, 0.4],
          "text-anchor": "top",
          "text-optional": true,
          "text-letter-spacing": 0.08,
        },
        paint: {
          "text-color": "#2a1800",
          "text-halo-color": "rgba(240, 228, 176, 0.95)",
          "text-halo-width": 2.5,
        },
      });

      // ── Towns — village house icon + name
      map.addLayer({
        id: "town-icons",
        type: "symbol",
        source: "ofm",
        "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["town", "village"]]],
        minzoom: 8,
        layout: {
          "icon-image": "village-icon",
          "icon-size": 0.6,
          "icon-anchor": "bottom",
          "icon-allow-overlap": false,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular"],
          "text-size": 10,
          "text-offset": [0, 0.3],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#4a2c10",
          "text-halo-color": "rgba(240, 228, 176, 0.9)",
          "text-halo-width": 1.5,
        },
      });

      // ── Forest tree icons (zoom 10+, spaced out)
      map.addLayer({
        id: "forest-icons",
        type: "symbol",
        source: "ofm",
        "source-layer": "landcover",
        filter: ["==", ["get", "class"], "wood"],
        minzoom: 10,
        layout: {
          "icon-image": "tree-icon",
          "icon-size": 0.8,
          "symbol-placement": "line",
          "symbol-spacing": 60,
          "icon-allow-overlap": false,
          "icon-padding": 4,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {/* Vignette overlay for parchment edge effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 80px 20px rgba(100, 70, 20, 0.18)",
          borderRadius: "inherit",
        }}
      />
    </div>
  );
}
