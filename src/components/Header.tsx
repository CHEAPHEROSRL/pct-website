"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mountain, Heart } from "lucide-react";
import MobileNav from "./MobileNav";

interface HeaderProps {
  activeItem?: string;
  transparent?: boolean;
}

const navLinks = [
  { href: "/", label: "The Journey" },
  { href: "/trail-map", label: "Trail Map" },
  { href: "/the-cause", label: "The Cause" },
  { href: "/journal", label: "Journal" },
  { href: "/pledgers", label: "Pledgers" },
];

export default function Header({ activeItem, transparent }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const isTransparent = transparent && !scrolled;

  return (
    <header
      className={`flex items-center justify-between px-4 md:px-8 lg:px-[80px] py-[16px] md:py-[20px] w-full z-50 transition-colors duration-400 ${
        transparent ? "fixed top-0 left-0" : "relative"
      } ${isTransparent ? "bg-transparent" : "bg-[#FFFFFFEE]"}`}
    >
      <Link href="/" className="flex items-center gap-[12px]">
        <Mountain className={`w-[28px] h-[28px] transition-colors duration-300 ${isTransparent ? "text-white" : "text-[var(--forest-green)]"}`} />
        <span className={`font-label font-bold text-[16px] tracking-[3px] transition-colors duration-300 ${isTransparent ? "text-white" : "text-[var(--text-primary)]"}`}>
          YESCHAPTER
        </span>
      </Link>
      <nav className="hidden lg:flex items-center gap-[40px]">
        {navLinks.map((link) =>
          link.label === activeItem ? (
            <span key={link.label} className={`font-heading text-[15px] font-semibold transition-colors duration-300 ${isTransparent ? "text-white" : "text-[var(--burnt-orange)]"}`}>
              {link.label}
            </span>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className={`font-heading text-[15px] font-semibold transition-colors duration-300 ${
                isTransparent
                  ? "text-white/80 hover:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {link.label}
            </Link>
          )
        )}
        <Link
          href="/pledge"
          className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
            PLEDGE NOW
          </span>
          <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
        </Link>
      </nav>
      <MobileNav activeItem={activeItem} />
    </header>
  );
}
