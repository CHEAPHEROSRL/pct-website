import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/map-styles", destination: "/", permanent: false },
      { source: "/tracker", destination: "/", permanent: false },
      { source: "/strategy", destination: "/", permanent: false },
      { source: "/sponsor-agreement", destination: "/", permanent: false },
    ];
  },
  // Security headers applied to every response. HSTS is already injected by
  // Vercel — the four below close the standard gaps that scanner tools
  // (Mozilla Observatory, securityheaders.com) flag on a default Next.js
  // deployment. Content-Security-Policy is deliberately NOT set here yet —
  // Next.js inlines bootstrap scripts and Tailwind injects inline styles,
  // so a CSP without `unsafe-inline` would break the site, and a CSP with
  // `unsafe-inline` is mostly cosmetic. Audit report Phase 13 has the
  // proper rollout plan (nonces + report-only first).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking — allow same-origin frames (admin uses an iframe
          // for email-template previews) but block external embedding.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME-sniff hardening — prevents browsers from second-guessing
          // a Content-Type and executing as a different kind of resource.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak full URLs (including query strings) when navigating
          // off-site. Sends only the origin on cross-origin navigations.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable powerful browser features the site doesn't use.
          // geolocation kept for /tracker (Paul's manual position update
          // flow); fullscreen kept for trail-map zoom.
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "payment=()",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
              "accelerometer=()",
              "geolocation=(self)",
              "fullscreen=(self)",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
