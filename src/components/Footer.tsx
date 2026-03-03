import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-8 md:gap-[48px] px-6 md:px-12 lg:px-[120px] pt-[40px] md:pt-[60px] pb-[32px] bg-[var(--bg-dark)] w-full">
      {/* Top */}
      <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 w-full">
        {/* Brand */}
        <div className="flex flex-col gap-[16px] w-full lg:w-[360px]">
          <div className="flex items-center gap-[12px]">
            <Mountain className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[16px] tracking-[3px] text-[var(--text-white)]">
              PAUL BARRY
            </span>
            <span className="font-label font-medium text-[11px] tracking-[2px] text-[var(--text-muted)]">
              PCT 2026
            </span>
          </div>
          <p className="font-heading text-[14px] leading-[1.6] text-[#FFFFFF88] w-full lg:w-[340px]">
            Walking 2,650 miles for cancer awareness, survivor support, and
            prevention education. Every step counts.
          </p>
          <div className="flex gap-[16px]">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-[20px] h-[20px] text-[var(--text-muted)] hover:text-white cursor-pointer" /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="w-[20px] h-[20px] text-[var(--text-muted)] hover:text-white cursor-pointer" /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter className="w-[20px] h-[20px] text-[var(--text-muted)] hover:text-white cursor-pointer" /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="w-[20px] h-[20px] text-[var(--text-muted)] hover:text-white cursor-pointer" /></a>
          </div>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-8 lg:gap-[64px]">
          <div className="flex flex-col gap-[16px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              EXPLORE
            </span>
            <Link href="/" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">The Journey</Link>
            <Link href="/trail-map" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Trail Map</Link>
            <Link href="/journal" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Blog & Vlog</Link>
            <Link href="/donors" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Donor Wall</Link>
          </div>
          <div className="flex flex-col gap-[16px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              THE CAUSE
            </span>
            <Link href="/the-cause" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Cancer Prevention</Link>
            <Link href="/the-cause" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Survivor Support</Link>
            <Link href="/the-cause" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Healthy Lifestyles</Link>
            <Link href="/donate" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Donate</Link>
          </div>
          <div className="flex flex-col gap-[16px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              CONNECT
            </span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">YouTube</a>
            <a href="mailto:paul@paulbarrypct.com" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Contact Paul</a>
            <Link href="/press-kit" className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white">Press Kit</Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-[#FFFFFF15]" />

      {/* Bottom */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 w-full">
        <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[#FFFFFF55]">
          &copy; 2026 Paul Barry PCT Walk for Cancer. All rights reserved.
        </span>
        <div className="flex gap-[24px]">
          <Link href="/privacy-policy" className="font-label font-medium text-[11px] tracking-[0.5px] text-[#FFFFFF55] hover:text-white cursor-pointer">
            Privacy Policy
          </Link>
          <Link href="/terms-of-use" className="font-label font-medium text-[11px] tracking-[0.5px] text-[#FFFFFF55] hover:text-white cursor-pointer">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}
