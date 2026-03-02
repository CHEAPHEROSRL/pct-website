import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Journal Entry | Paul Barry PCT 2026",
  description:
    "A journal entry from Paul Barry's PCT 2026 thru-hike for cancer research.",
};

export default function JournalPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
