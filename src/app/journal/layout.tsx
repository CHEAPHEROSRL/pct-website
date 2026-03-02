import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Journal — Blog & Vlog",
  description: "Follow Paul Barry's daily trail journal from the PCT — photos, stories, and video dispatches from Mexico to Canada.",
};

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
