import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Supporters",
  description: "Meet the people keeping Paul on the trail. Trail support gifts go directly to Paul — meals, boots, rest days, and gear for 2,650 miles.",
};

export default function DonorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
