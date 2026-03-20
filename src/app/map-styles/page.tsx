"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MapStylePreview = dynamic(() => import("@/components/MapStylePreview"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const MapLibreTolkien = dynamic(
  () => import("@/components/MapLibreTolkien"),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--warm-stone)]">
      <span className="font-label text-sm text-[var(--text-muted)] tracking-widest animate-pulse">
        LOADING MAP...
      </span>
    </div>
  );
}

const stadiaKey = process.env.NEXT_PUBLIC_STADIA_API_KEY ?? "";
const tfKey = process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY ?? "";

const STYLES = [
  {
    id: "watercolor",
    letter: "A",
    name: "Stadia Watercolor",
    tagline: "Painterly & Artistic",
    note: stadiaKey
      ? "Stadia Maps · stadiamaps.com"
      : "Add NEXT_PUBLIC_STADIA_API_KEY to Vercel to activate",
    active: !!stadiaKey,
    tileUrl: `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${stadiaKey ? `?api_key=${stadiaKey}` : ""}`,
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
    note: tfKey
      ? "Thunderforest · thunderforest.com"
      : "Add NEXT_PUBLIC_THUNDERFOREST_API_KEY to Vercel to activate",
    active: !!tfKey,
    tileUrl: `https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png${tfKey ? `?apikey=${tfKey}` : ""}`,
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
    note: "No API key required · live now",
    active: true,
    tileUrl:
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    trailColor: "#c45c26",
    accentBg: "#3a5c38",
    accentText: "#a8d4a0",
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
            Four alternative map tile styles for the trail map — for Paul to review
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
            All four show the same PCT trail. Drag any map to explore.
            Options A and B need a free API key — sign up takes 2 minutes.
          </p>
        </div>

        {/* A / B / C — Leaflet tile swaps */}
        <div className="px-4 md:px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {STYLES.map((style) => (
            <div
              key={style.id}
              className="flex flex-col rounded-lg overflow-hidden shadow-sm border border-[var(--border-subtle)]"
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ backgroundColor: style.accentBg }}
              >
                <span className="font-label text-sm font-bold tracking-widest text-white">
                  {style.letter}
                </span>
                <span className="font-label text-sm font-bold tracking-widest text-white">
                  {style.name.toUpperCase()}
                </span>
                <span
                  className="font-label text-xs ml-auto"
                  style={{ color: style.accentText }}
                >
                  {style.tagline}
                </span>
              </div>

              <div className="h-[400px] relative">
                {style.active ? (
                  <MapStylePreview
                    tileUrl={style.tileUrl}
                    attribution={style.attribution}
                    trailColor={style.trailColor}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[var(--bg-warm)]">
                    <span className="font-label text-xs font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">
                      API Key Required
                    </span>
                    <span className="font-heading text-sm text-[var(--text-secondary)] text-center max-w-[200px]">
                      {style.id === "watercolor"
                        ? "Sign up free at stadiamaps.com → add NEXT_PUBLIC_STADIA_API_KEY to Vercel"
                        : "Sign up free at thunderforest.com → add NEXT_PUBLIC_THUNDERFOREST_API_KEY to Vercel"}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white px-5 py-3 border-t border-[var(--border-subtle)]">
                <span className="font-label text-xs text-[var(--text-muted)]">
                  {style.note}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* D — Full-width MapLibre Tolkien */}
        <div className="px-4 md:px-6 pb-16 max-w-[1600px] mx-auto">
          <div className="flex flex-col rounded-lg overflow-hidden shadow-sm border border-[var(--border-subtle)]">
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ backgroundColor: "#3d2800" }}
            >
              <span className="font-label text-sm font-bold tracking-widest text-white">D</span>
              <span className="font-label text-sm font-bold tracking-widest text-white">
                TOLKIEN CUSTOM — MapLibre GL
              </span>
              <span
                className="font-label text-xs ml-auto"
                style={{ color: "#d4a860" }}
              >
                Parchment · Illustrated · Fully Custom
              </span>
            </div>

            <div className="h-[600px] relative">
              <MapLibreTolkien />
            </div>

            <div className="bg-white px-5 py-3 border-t border-[var(--border-subtle)]">
              <span className="font-label text-xs text-[var(--text-muted)]">
                OpenFreeMap vector tiles · custom parchment style · no API key needed · PCT trail in deep red-brown
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
