import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Map — Live Progress",
  description: "Track Paul Barry's real-time position on the Pacific Crest Trail with an interactive map showing daily progress from Mexico to Canada.",
};

export default function TrailMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
