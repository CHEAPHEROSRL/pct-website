import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pledgers",
  description:
    "See everyone who has pledged per mile for Paul's PCT thru-hike. Join the community walking with Paul for cancer research.",
};

export default function PledgersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
