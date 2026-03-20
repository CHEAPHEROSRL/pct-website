"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MapStylePreview = dynamic(() => import("@/components/MapStylePreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--warm-stone)]">
      <span className="font-label text-sm text-[var(--text-muted)] tracking-widest">
        LOADING MAP...
      </span>
    </div>
  ),
});

const STYLES = [
  {
    id: "watercolor",
    letter: "A",
    name: "Stadia Watercolor",
    tagline: "Painterly & Artistic",
    note: "Requires free API key · stadiamaps.com",
    tileUrl:
      "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com">Stamen Design</a>',
    trailColor: "#c45c26",
    accentBg: "#2d5e42",
    accentText: "#90c4a8",
  },
  {
    id: "pioneer",
    letter: "B",
    name: "Thunderforest Pioneer",
    tagline: "Vintage / Hand-Drawn",
    note: "Requires free API key · thunderforest.com",
    tileUrl:
      "https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
    trailColor: "#6b3010",
    accentBg: "#7a4218",
    accentText: "#d4a878",
  },
  {
    id: "voyager",
    letter: "C",
    name: "CartoDB Voyager",
    tagline: "Warm & Modern",
    note: "No API key required · ready to go",
    tileUrl:
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    trailColor: "#c45c26",
    accentBg: "#3a5c38",
    accentText: "#a8d4a0",
  },
  {
    id: "tolkien",
    letter: "D",
    name: "Tolkien Custom",
    tagline: "MapLibre GL + Illustrated Tiles",
    note: "Requires architectural rebuild · most unique",
    tileUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri — National Geographic, Esri, DeLorme, NAVTEQ (placeholder for custom style)",
    trailColor: "#7a2800",
    accentBg: "#3d2800",
    accentText: "#d4a860",
  },
];

export default function MapStylesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-warm)]">
      <Header activeItem="trail-map" />

      <main className="flex-1">
        {/* Banner */}
        <div className="bg-[var(--bg-dark)] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="font-label text-xs font-bold tracking-[0.2em] text-[var(--burnt-orange)] uppercase">
            Internal Mock
          </span>
          <span className="text-[var(--text-muted)] hidden sm:block">·</span>
          <span className="font-label text-sm text-[var(--text-muted)]">
            Four alternative map tile styles for the trail map page — for Paul to review
          </span>
        </div>

        {/* Intro */}
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <p className="font-label text-xs font-bold tracking-[0.2em] text-[var(--forest-green)] uppercase mb-3">
            Map Style Comparison
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-[var(--text-primary)] mb-4">
            Which map feels right?
          </h1>
          <p className="font-heading text-lg text-[var(--text-secondary)] max-w-2xl">
            All four show the same PCT trail. The difference is the tile style underneath —
            from painterly watercolor to a hand-drawn vintage look to a fully custom illustrated map.
            Drag any map to explore.
          </p>
        </div>

        {/* Map grid */}
        <div className="px-4 md:px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1600px] mx-auto">
          {STYLES.map((style) => (
            <div
              key={style.id}
              className="flex flex-col rounded-lg overflow-hidden shadow-sm border border-[var(--border-subtle)]"
            >
              {/* Label bar */}
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ backgroundColor: style.accentBg }}
              >
                <span
                  className="font-label text-sm font-bold tracking-widest"
                  style={{ color: "#fff" }}
                >
                  {style.letter}
                </span>
                <span
                  className="font-label text-sm font-bold tracking-widest"
                  style={{ color: "#fff" }}
                >
                  {style.name.toUpperCase()}
                </span>
                <span
                  className="font-label text-xs ml-auto"
                  style={{ color: style.accentText }}
                >
                  {style.tagline}
                </span>
              </div>

              {/* Map */}
              <div className="h-[480px] relative">
                <MapStylePreview
                  tileUrl={style.tileUrl}
                  attribution={style.attribution}
                  trailColor={style.trailColor}
                />
              </div>

              {/* Footer */}
              <div className="bg-white px-5 py-3 flex items-center gap-2 border-t border-[var(--border-subtle)]">
                <span className="font-label text-xs text-[var(--text-muted)]">
                  {style.note}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-white border border-[var(--border-subtle)] rounded-lg p-6 space-y-3">
            <p className="font-label text-xs font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">Notes</p>
            <ul className="space-y-2 font-heading text-sm text-[var(--text-secondary)]">
              <li><strong>A (Watercolor)</strong> — tiles may appear blank until a free API key is configured in Vercel env as <code className="bg-[var(--warm-stone)] px-1 rounded text-xs">STADIA_API_KEY</code>.</li>
              <li><strong>B (Pioneer)</strong> — tiles may appear blank until a free API key is configured as <code className="bg-[var(--warm-stone)] px-1 rounded text-xs">THUNDERFOREST_API_KEY</code>.</li>
              <li><strong>C (Voyager)</strong> — works immediately, no setup needed.</li>
              <li><strong>D (Tolkien)</strong> — currently showing Esri NatGeo as a placeholder. The real Tolkien custom style requires switching from Leaflet to MapLibre GL JS — significant dev work but the most unique result. The NatGeo style shown here gives a rough sense of a vintage cartographic feel.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
