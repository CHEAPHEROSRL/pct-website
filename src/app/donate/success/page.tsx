"use client";

import Link from "next/link";
import { Check, Mail, Gift } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DonateSuccessPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[28px] px-6 md:px-12 lg:px-[120px] py-[60px] md:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="flex items-center justify-center w-[96px] h-[96px] bg-[#E8F5E9] rounded-full">
          <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--forest-green)] rounded-full">
            <Check className="w-[32px] h-[32px] text-white" />
          </div>
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] lg:text-[44px] tracking-[-0.5px] leading-[1.15] text-[var(--text-primary)] text-center">
          Thank You for Supporting
          <br />
          Paul on the Trail!
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[560px]">
          Your gift will help keep Paul going on his 2,650-mile journey. Every meal, rest day, and piece of gear makes a real difference.
        </p>
        <div className="flex items-center gap-[10px] bg-[var(--bg-warm)] px-[24px] py-[14px] rounded-[4px]">
          <Mail className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <span className="font-label font-medium text-[13px] tracking-[0.5px] text-[var(--text-muted)]">
            A receipt has been sent to your email by Stripe
          </span>
        </div>
      </section>

      {/* What&apos;s Next */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--forest-green)]">
          YOUR GIFT HELPS PAUL
        </span>
        <div className="flex flex-col items-center gap-[16px] max-w-[560px]">
          <Gift className="w-[32px] h-[32px] text-[var(--forest-green)]" />
          <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)] text-center">
            Trail support goes directly to Paul — keeping him fed, rested, and moving toward Canada. Want to support the cause too?
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">
          WHAT&apos;S NEXT
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-[16px]">
          <Link
            href="/pledge"
            className="flex items-center justify-center h-[48px] px-[36px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              PLEDGE PER MILE
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
          <Link
            href="/journal"
            className="flex items-center justify-center h-[48px] px-[36px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
              FOLLOW THE JOURNEY
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
