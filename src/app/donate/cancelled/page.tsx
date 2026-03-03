"use client";

import Link from "next/link";
import { X, Heart, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DonateCancelledPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[28px] px-6 md:px-12 lg:px-[120px] py-[60px] md:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="flex items-center justify-center w-[96px] h-[96px] bg-[#FFF3E0] rounded-full">
          <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--burnt-orange)] rounded-full">
            <X className="w-[32px] h-[32px] text-white" />
          </div>
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] lg:text-[44px] tracking-[-0.5px] leading-[1.15] text-[var(--text-primary)] text-center">
          Payment Not Completed
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[560px]">
          It looks like your donation wasn&apos;t completed. No worries — no
          charges were made to your account.
        </p>
      </section>

      {/* Encouragement */}
      <section className="flex flex-col items-center gap-[28px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          EVERY DONATION COUNTS
        </span>
        <p className="font-heading text-[15px] md:text-[17px] leading-[1.8] text-[var(--text-secondary)] text-center max-w-[540px]">
          Paul is walking 2,650 miles from Mexico to Canada to raise awareness
          and funds for cancer research. Your support — no matter the size —
          helps make this mission possible.
        </p>
        <div className="flex flex-col items-center gap-[8px] px-[28px] py-[20px]">
          <p className="font-heading text-[16px] font-semibold italic leading-[1.6] text-[var(--text-primary)] text-center">
            &ldquo;The trail teaches you that every step matters — just like
            every dollar donated.&rdquo;
          </p>
          <span className="font-label font-semibold text-[12px] tracking-[1px] text-[var(--burnt-orange)]">
            — Paul Barry
          </span>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">
          READY TO TRY AGAIN?
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-[16px]">
          <Link
            href="/donate"
            className="flex items-center justify-center gap-[10px] h-[48px] px-[36px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <Heart className="w-[16px] h-[16px] text-white" />
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              TRY DONATING AGAIN
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center h-[48px] px-[36px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
              BACK TO HOME
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-[8px] mt-[8px]">
          <Lock className="w-[14px] h-[14px] text-[var(--text-muted)]" />
          <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
            All payments are securely processed by Stripe
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
