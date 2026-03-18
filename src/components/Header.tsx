"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mountain, Heart, User, LogOut } from "lucide-react";
import MobileNav from "./MobileNav";
import { useSession } from "@/hooks/useSession";

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
  const { user, loading, logout } = useSession();

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
        transparent ? "sticky top-0" : "relative"
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

        {/* Auth-aware right side */}
        {!loading && user ? (
          <div className="flex items-center gap-[10px]">
            <Link
              href="/my-pledge"
              className="flex items-center gap-[8px] bg-[var(--forest-green-light)] px-[16px] py-[10px] hover:opacity-90 transition-opacity"
            >
              <User className="w-[14px] h-[14px] text-[var(--forest-green)]" />
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--forest-green)]">
                MY PLEDGE
              </span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-[6px] border border-[var(--border-subtle)] px-[12px] py-[10px] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-[14px] h-[14px] text-[var(--text-muted)]" />
            </button>
          </div>
        ) : (
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
              PLEDGE NOW
            </span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        )}
      </nav>
      <MobileNav activeItem={activeItem} />
    </header>
  );
}
