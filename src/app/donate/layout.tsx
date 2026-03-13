import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Help — YesChapter",
  description: "Choose how to support Paul Barry's 2,650-mile PCT walk for cancer. Pledge per mile for the foundations or support Paul directly on the trail.",
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
