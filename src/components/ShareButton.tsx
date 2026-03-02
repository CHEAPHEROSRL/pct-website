"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({
  className,
  label = "SHARE THIS CAUSE",
  labelClassName,
}: {
  className?: string;
  label?: string;
  labelClassName?: string;
}) {
  async function handleShare() {
    const shareData = {
      title: "Paul Barry PCT 2026 — Walking for Cancer",
      text: "Paul Barry is walking 2,650 miles on the Pacific Crest Trail for cancer awareness. Support his journey!",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — silently ignore
      }
    } else {
      await navigator.clipboard.writeText(
        `${shareData.text} ${shareData.url}`
      );
      alert("Link copied to clipboard!");
    }
  }

  return (
    <button onClick={handleShare} className={className}>
      <span className={labelClassName}>{label}</span>
      <Share2 className="w-[18px] h-[18px] text-[var(--text-white)]" />
    </button>
  );
}
