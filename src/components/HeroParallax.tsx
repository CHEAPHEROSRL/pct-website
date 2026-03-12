"use client";

import { useParallax } from "@/hooks/useParallax";

interface HeroParallaxProps {
  children: React.ReactNode;
  speed?: number;
  scaleRange?: [number, number];
}

export default function HeroParallax({
  children,
  speed = 0.35,
  scaleRange = [1.12, 1.22],
}: HeroParallaxProps) {
  const { ref } = useParallax({ speed, scaleRange });

  return (
    <div
      ref={ref}
      className="absolute inset-0 will-change-transform"
      style={{ transformOrigin: "center center" }}
    >
      {children}
    </div>
  );
}
