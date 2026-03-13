import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Paul on the Trail",
  description:
    "Buy Paul a trail meal, boots, or a rest day. Trail support gifts go directly to Paul — keeping him walking 2,650 miles for the cause.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
