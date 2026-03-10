import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Journal Entry | YesChapter",
  description:
    "A journal entry from Paul's PCT 2026 thru-hike for cancer research.",
};

export default function JournalPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
