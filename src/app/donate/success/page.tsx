"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DonateSuccessPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <section className="flex flex-col items-center justify-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[80px] md:py-[120px] bg-[var(--bg-white)] w-full">
        <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--forest-green)] rounded-full">
          <Heart className="w-[28px] h-[28px] text-white" />
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Thank You for Your Generosity!
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[520px]">
          Your donation will make a real difference in the fight against cancer.
          Paul will carry your support with every step on the trail.
        </p>
        <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-muted)] text-center max-w-[520px]">
          A receipt has been sent to your email by Stripe.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-[16px] mt-[16px]">
          <Link
            href="/"
            className="flex items-center justify-center gap-[10px] h-[48px] px-[32px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              BACK TO HOME
            </span>
          </Link>
          <Link
            href="/donors"
            className="flex items-center justify-center gap-[10px] h-[48px] px-[32px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-secondary)]">
              VIEW DONOR WALL
            </span>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
