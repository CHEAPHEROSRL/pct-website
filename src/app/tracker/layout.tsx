import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPS Tracker",
  robots: { index: false, follow: false },
};

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
