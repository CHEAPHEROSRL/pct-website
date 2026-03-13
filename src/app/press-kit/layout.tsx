import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "Media resources for YesChapter — Paul Barry's 2,650-mile PCT thru-hike for cancer. Bio, photos, key facts, and contact information.",
};

export default function PressKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
