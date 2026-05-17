import { ImageResponse } from "next/og";

// Sibling to app/icon.svg — Chrome's SVG favicon support is spotty
// (sometimes the SVG never gets rendered as a tab icon even when it
// serves correctly at /icon.svg). This file generates a PNG via
// Next.js's ImageResponse so we have a guaranteed-working raster
// fallback. Browsers register both icons via auto-generated <link>
// tags and pick whichever they support best.

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* Same lucide Mountain path as <Header /> + app/icon.svg.
            Rendered at 32x32, browsers downscale to 16x16 for tab favicons
            — cleaner than letting them downscale the SVG themselves. */}
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" fill="#3D7A5A" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
