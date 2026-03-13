import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pledge Per Mile",
  description:
    "Pledge a dollar amount for every mile Paul walks on the Pacific Crest Trail. 100% goes directly to cancer foundations — Paul never touches the money.",
};

export default function PledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
