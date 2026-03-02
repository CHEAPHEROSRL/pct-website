import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate — Support the Walk",
  description: "Support Paul Barry's 2,650-mile PCT walk for cancer. 100% of donations go to cancer prevention, survivor support, and research.",
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
