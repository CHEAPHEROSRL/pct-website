import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Pledge",
  description:
    "View your pledge details, running total, and share your commitment to cancer research with friends.",
};

export default function MyPledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
