import type { Metadata } from "next";
import PrefetchTrailMap from "@/components/PrefetchTrailMap";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "YesChapter — Walking for Cancer",
    template: "%s | YesChapter",
  },
  description:
    "Paul is walking the entire Pacific Crest Trail to raise awareness and funds for cancer survivors, patients, and prevention.",
  metadataBase: new URL("https://yeschapter.com"),
  openGraph: {
    type: "website",
    siteName: "YesChapter",
    title: "YesChapter — Walking for Cancer",
    description:
      "Walking 2,650 miles on the Pacific Crest Trail for cancer awareness, survivor support, and prevention education.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Paul at the PCT Southern Terminus monument at sunrise — start of the 2,650-mile walk for cancer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YesChapter — Walking for Cancer",
    description:
      "Walking 2,650 miles on the Pacific Crest Trail for cancer awareness, survivor support, and prevention education.",
    images: ["/og-image.jpg"],
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
        <div id="page-content">
          {children}
        </div>
        <PrefetchTrailMap />
      </body>
    </html>
  );
}
