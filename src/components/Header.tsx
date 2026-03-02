import Link from "next/link";
import { Mountain, Heart } from "lucide-react";
import MobileNav from "./MobileNav";

interface HeaderProps {
  activeItem?: string;
}

const navLinks = [
  { href: "/", label: "The Journey" },
  { href: "/trail-map", label: "Trail Map" },
  { href: "/the-cause", label: "The Cause" },
  { href: "/journal", label: "Journal" },
  { href: "/donors", label: "Donors" },
];

export default function Header({ activeItem }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 lg:px-[80px] py-[16px] md:py-[20px] bg-[#FFFFFFEE] w-full relative z-50">
      <Link href="/" className="flex items-center gap-[12px]">
        <Mountain className="w-[28px] h-[28px] text-[var(--forest-green)]" />
        <span className="font-label font-bold text-[16px] tracking-[3px] text-[var(--text-primary)]">
          PAUL BARRY
        </span>
        <span className="font-label font-medium text-[11px] tracking-[2px] text-[var(--text-muted)] hidden sm:inline">
          PCT 2026
        </span>
      </Link>
      <nav className="hidden lg:flex items-center gap-[40px]">
        {navLinks.map((link) =>
          link.label === activeItem ? (
            <span key={link.label} className="font-heading text-[15px] font-semibold text-[var(--burnt-orange)]">
              {link.label}
            </span>
          ) : (
            <Link key={link.label} href={link.href} className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              {link.label}
            </Link>
          )
        )}
        <Link
          href="/donate"
          className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
            DONATE NOW
          </span>
          <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
        </Link>
      </nav>
      <MobileNav activeItem={activeItem} />
    </header>
  );
}
