import Link from "next/link";
import { Heart, Gift, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Help — YesChapter",
  description:
    "Pledge per mile for cancer foundations or support Paul directly on the Pacific Crest Trail.",
};

export default function DonatePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          TWO WAYS TO HELP
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Choose How to Make a Difference
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[700px]">
          There are two completely separate ways to help — pledge for the cause, or support Paul directly on the trail. They never mix.
        </p>
      </section>

      {/* Two Paths */}
      <section className="flex flex-col lg:flex-row gap-[24px] lg:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[32px] md:py-[48px] lg:py-[64px] bg-[var(--bg-warm)] w-full">
        {/* Path 1: Pledge */}
        <div className="flex flex-col gap-[24px] flex-1 bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[32px] md:p-[40px]">
          <div className="flex items-center gap-[8px]">
            <Heart className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
              FOR THE CAUSE
            </span>
          </div>
          <h2 className="font-heading font-semibold text-[24px] md:text-[28px] text-[var(--text-primary)]">
            Pledge Per Mile
          </h2>
          <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
            Set a pledge per mile — like US$0.25/mi. Pay nothing now. At the end of Paul&apos;s hike, you&apos;ll be invited to donate your total directly to two cancer foundations. Paul never touches this money. All amounts in US Dollars (USD).
          </p>
          <ul className="flex flex-col gap-[10px]">
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--burnt-orange)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">No payment collected — it&apos;s a pledge of intent</span>
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--burnt-orange)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">100% goes to cancer foundations (50/50 split)</span>
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--burnt-orange)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">You donate directly to the foundations — not through Paul</span>
            </li>
          </ul>
          <Link
            href="/pledge"
            className="flex items-center justify-center gap-[10px] bg-[var(--burnt-orange)] px-[32px] py-[16px] hover:opacity-90 transition-opacity mt-auto"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">PLEDGE NOW</span>
            <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />
          </Link>
        </div>

        {/* Path 2: Support Paul */}
        <div className="flex flex-col gap-[24px] flex-1 bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[32px] md:p-[40px]">
          <div className="flex items-center gap-[8px]">
            <Gift className="w-[20px] h-[20px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">
              FOR PAUL
            </span>
          </div>
          <h2 className="font-heading font-semibold text-[24px] md:text-[28px] text-[var(--text-primary)]">
            Support Paul on the Trail
          </h2>
          <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
            Paul carries everything on his back for 2,650 miles. Buy him a trail meal, a pair of boots, or a rest day at a hostel. These gifts go directly to Paul — keeping him on the trail so he can walk for the cause.
          </p>
          <ul className="flex flex-col gap-[10px]">
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">Real payment — processed securely through Stripe</span>
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">Specific gifts: meals, gear, hostel nights, boots</span>
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] mt-[8px] bg-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">Goes directly to Paul — completely separate from pledges</span>
            </li>
          </ul>
          <Link
            href="/support"
            className="flex items-center justify-center gap-[10px] bg-[var(--forest-green)] px-[32px] py-[16px] hover:opacity-90 transition-opacity mt-auto"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">SUPPORT PAUL</span>
            <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />
          </Link>
        </div>
      </section>

      {/* Clarification */}
      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[48px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
          TWO CAUSES. ONE JOURNEY. THEY NEVER MIX.
        </span>
        <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[600px]">
          Pledges go 100% to cancer foundations. Trail support goes directly to Paul. These are completely separate — Paul receives US$0 from pledges, and foundation money never passes through Paul&apos;s hands.
        </p>
        <Link href="/transparency" className="font-heading font-semibold text-[14px] text-[var(--burnt-orange)] hover:underline">
          Read our Transparency page &rarr;
        </Link>
      </section>

      <Footer />
    </div>
  );
}
