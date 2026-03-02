import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donor Wall — Thank You",
  description: "Meet the generous supporters funding Paul Barry's PCT walk for cancer awareness. Every donation fuels every mile.",
};

export default function DonorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
