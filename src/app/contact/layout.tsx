import type { Metadata } from "next";

// The page itself is a client component (uses form state, browser APIs,
// Turnstile widget), so it can't export `metadata` directly — that only
// works on server components. This thin layout provides the page-specific
// title + description so the route doesn't fall back to the generic site
// title from the root layout.
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send Paul Barry a message about YesChapter — the PCT thru-hike walking 2,650 miles for cancer research, patient support, and prevention.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
