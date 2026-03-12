"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

type Animation = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-up";

const animationClassMap: Record<Animation, string> = {
  "fade-up": "animate-fade-up",
  "fade-in": "animate-fade-in",
  "slide-left": "animate-slide-left",
  "slide-right": "animate-slide-right",
  "scale-up": "animate-scale-up",
};

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay,
  className = "",
  as: Tag = "div",
  threshold,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold });

  const animClass = isVisible ? animationClassMap[animation] : "scroll-hidden";
  const style = delay && isVisible ? { animationDelay: `${delay}ms` } : undefined;

  return (
    // @ts-expect-error - dynamic tag element
    <Tag ref={ref} className={`${animClass} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
