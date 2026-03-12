"use client";

import { useParallax } from "@/hooks/useParallax";

interface HeroParallaxProps {
  children: React.ReactNode;
  speed?: number;
}

export default function HeroParallax({ children, speed = 0.3 }: HeroParallaxProps) {
  const { ref } = useParallax({ speed });

  return (
    <div ref={ref} className="absolute inset-0">
      {children}
    </div>
  );
}
