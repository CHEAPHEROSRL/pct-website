"use client";

import Link from "next/link";
import { Check, Mail, Microscope, HeartPulse, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const impactCards = [
  {
    icon: Microscope,
    title: "Cancer Research",
    description:
      "Funding cutting-edge research to find better treatments and cures",
  },
  {
    icon: HeartPulse,
    title: "Patient Support",
    description:
      "Providing care and resources to patients and their families",
  },
  {
    icon: BookOpen,
    title: "Prevention Education",
    description:
      "Teaching communities about early detection and healthy living",
  },
];

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
          Thank You for Your
          <br />
          Generosity!
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[560px]">
          Your donation has been successfully processed and will make a real
          difference in the fight against cancer.
        </p>
        <div className="flex items-center gap-[10px] bg-[var(--bg-warm)] px-[24px] py-[14px] rounded-[4px]">
          <Mail className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <span className="font-label font-medium text-[13px] tracking-[0.5px] text-[var(--text-muted)]">
            A receipt has been sent to your email by Stripe
          </span>
        </div>
      </section>

      {/* Impact */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          YOUR DONATION HELPS FUND
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px] w-full max-w-[860px]">
          {impactCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-[14px] bg-[var(--bg-white)] p-[28px_24px] rounded-[2px]"
            >
              <card.icon className="w-[28px] h-[28px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)] text-center">
                {card.title}
              </span>
              <span className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)] text-center">
                {card.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">
          SPREAD THE WORD
        </span>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[480px]">
          Help us reach our goal by sharing Paul&apos;s journey with your
          friends and family.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-[16px]">
          <Link
            href="/"
            className="flex items-center justify-center h-[48px] px-[36px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              BACK TO HOME
            </span>
          </Link>
          <Link
            href="/donors"
            className="flex items-center justify-center h-[48px] px-[36px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
              VIEW DONOR WALL
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
