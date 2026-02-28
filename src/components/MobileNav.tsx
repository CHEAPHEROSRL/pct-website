"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";

interface MobileNavProps {
  activeItem?: string;
}

const navLinks = [
  { href: "/", label: "The Journey" },
  { href: "/trail-map", label: "Trail Map" },
  { href: "/the-cause", label: "The Cause" },
  { href: "/journal", label: "Journal" },
  { href: "/donors", label: "Donors" },
];

export default function MobileNav({ activeItem }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden flex items-center justify-center w-[40px] h-[40px]"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? (
          <X className="w-[24px] h-[24px] text-[var(--text-primary)]" />
        ) : (
          <Menu className="w-[24px] h-[24px] text-[var(--text-primary)]" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 top-[60px] z-50 bg-[#FFFFFFFA] flex flex-col px-6 py-8 gap-6 lg:hidden">
          {navLinks.map((link) =>
            link.label === activeItem ? (
              <span
                key={link.label}
                className="font-heading text-[18px] font-semibold text-[var(--burnt-orange)]"
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="font-heading text-[18px] font-semibold text-[var(--text-secondary)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            href="/donate"
            className="flex items-center justify-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[14px] mt-4"
            onClick={() => setOpen(false)}
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
              DONATE NOW
            </span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        </div>
      )}
    </>
  );
}
