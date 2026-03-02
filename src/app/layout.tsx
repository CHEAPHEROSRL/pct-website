import type { Metadata } from "next";
import PrefetchTrailMap from "@/components/PrefetchTrailMap";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Paul Barry PCT 2026 — Walking for Cancer",
    template: "%s | Paul Barry PCT 2026",
  },
  description:
    "Paul Barry is walking the entire Pacific Crest Trail to raise awareness and funds for cancer survivors, patients, and prevention.",
  openGraph: {
    type: "website",
    siteName: "Paul Barry PCT 2026",
    title: "Paul Barry PCT 2026 — Walking for Cancer",
    description:
      "Walking 2,650 miles on the Pacific Crest Trail for cancer awareness, survivor support, and prevention education.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paul Barry PCT 2026 — Walking for Cancer",
    description:
      "Walking 2,650 miles on the Pacific Crest Trail for cancer awareness, survivor support, and prevention education.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">
        {children}
        <PrefetchTrailMap />
      </body>
    </html>
  );
}
