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
};

export default nextConfig;
