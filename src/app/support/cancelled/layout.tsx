import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Not Completed",
  description:
    "Your trail support gift was not completed. You can try again or pledge per mile instead.",
};

export default function SupportCancelledLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
