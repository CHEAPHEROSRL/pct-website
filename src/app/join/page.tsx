"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mountain, ArrowRight, Users, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function JoinContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--forest-green)] text-center w-full">
        <Mountain className="w-[36px] h-[36px] text-white opacity-60" />
        {ref ? (
          <>
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFF88]">
              YOU WERE INVITED BY
            </span>
            <h1 className="font-heading font-semibold text-[32px] md:text-[44px] tracking-[-1px] text-white max-w-[700px]">
              {ref} is Walking{" "}
              <span className="text-[var(--burnt-orange)]">With Paul</span>
            </h1>
            <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
              {ref} pledged per mile for cancer research — and they want you to join.
              Paul is walking 2,650 miles from Mexico to Canada. Every pledger makes
              the impact bigger.
            </p>
          </>
        ) : (
          <>
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFF88]">
              JOIN THE WALK
            </span>
            <h1 className="font-heading font-semibold text-[32px] md:text-[44px] tracking-[-1px] text-white max-w-[700px]">
              Walk With Paul for{" "}
              <span className="text-[var(--burnt-orange)]">Cancer Research</span>
            </h1>
            <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
              Paul is hiking 2,650 miles from Mexico to Canada on the Pacific Crest Trail.
              Pledge per mile — at the end, you donate directly to cancer foundations. Paul gets $0.
            </p>
          </>
        )}
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full max-w-[800px] mx-auto lg:max-w-none">
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
          HOW PLEDGING WORKS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          <div className="flex flex-col gap-[12px] p-[24px] bg-[var(--bg-warm)]">
            <span className="font-label font-bold text-[24px] text-[var(--burnt-orange)]">1</span>
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">Pick your rate</span>
            <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
              Choose an amount per mile — even $0.01/mile adds up to $26.50 over 2,650 miles.
            </p>
          </div>
          <div className="flex flex-col gap-[12px] p-[24px] bg-[var(--bg-warm)]">
            <span className="font-label font-bold text-[24px] text-[var(--burnt-orange)]">2</span>
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">Watch Paul walk</span>
            <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
              Get weekly updates, milestone celebrations, and journal entries from the trail. Your pledge total grows with every mile.
            </p>
          </div>
          <div className="flex flex-col gap-[12px] p-[24px] bg-[var(--bg-warm)]">
            <span className="font-label font-bold text-[24px] text-[var(--burnt-orange)]">3</span>
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">Honour at the end</span>
            <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
              At the end of Paul&apos;s hike, donate your total directly to the cancer foundations. Paul never touches a cent.
            </p>
          </div>
        </div>
      </section>

      {/* Stats + CTA */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] border-t border-[var(--border-subtle)] w-full">
        <div className="flex gap-[48px]">
          <div className="flex flex-col items-center gap-[4px]">
            <Users className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              GROWING COMMUNITY
            </span>
            <p className="font-heading text-[14px] text-[var(--text-secondary)]">
              Join pledgers from around the world
            </p>
          </div>
          <div className="flex flex-col items-center gap-[4px]">
            <Heart className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              100% TO FOUNDATIONS
            </span>
            <p className="font-heading text-[14px] text-[var(--text-secondary)]">
              City of Hope + Leukaemia Foundation
            </p>
          </div>
        </div>

        <Link
          href={`/pledge${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`}
          className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[40px] py-[16px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
            PLEDGE PER MILE
          </span>
          <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />
        </Link>

        {ref && (
          <p className="font-heading text-[13px] text-[var(--text-muted)]">
            Referred by {ref}
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex flex-col w-full bg-[var(--bg-warm)]"><Header /><div className="py-[120px] text-center"><p className="font-heading text-[var(--text-muted)]">Loading...</p></div><Footer /></div>}>
      <JoinContent />
    </Suspense>
  );
}
