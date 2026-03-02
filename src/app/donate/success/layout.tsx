import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You — Donation Received",
  description:
    "Your donation to Paul Barry's PCT walk for cancer has been received. Thank you for your generosity.",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
