import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You — Trail Support Received",
  description:
    "Your trail support gift has been received. Thank you for keeping Paul on the trail!",
};

export default function SupportSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
