import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paul Barry PCT 2026 — Walking for Cancer",
  description:
    "Paul Barry is walking the entire Pacific Crest Trail to raise awareness and funds for cancer survivors, patients, and prevention.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
