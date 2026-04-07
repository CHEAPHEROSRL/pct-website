"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function VerifyContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "pending";
  const name = searchParams.get("name") || "Friend";
  const total = searchParams.get("total");

  if (status === "success") {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header />
        <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--forest-green)] text-center w-full">
          <CheckCircle className="w-[48px] h-[48px] text-white" />
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFF88]">
            PLEDGE CONFIRMED
          </span>
          <h1 className="font-heading font-semibold text-[32px] md:text-[44px] tracking-[-1px] text-white max-w-[700px]">
            Welcome Aboard, {name}!
          </h1>
          <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
            Your pledge of {total ? `$${parseFloat(total).toFixed(2)}` : "per mile"} is now confirmed.
            You&apos;re officially walking with Paul from Mexico to Canada.
          </p>
        </section>

        <section className="flex flex-col items-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full">
          <Heart className="w-[28px] h-[28px] text-[var(--burnt-orange)]" />
          <h2 className="font-heading font-semibold text-[22px] text-[var(--text-primary)] text-center">
            What Happens Next
          </h2>
          <div className="flex flex-col gap-[16px] max-w-[500px]">
            <div className="flex items-start gap-[12px]">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)] shrink-0">1</span>
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                Check your inbox for a welcome email with your pledge details and dashboard link.
              </p>
            </div>
            <div className="flex items-start gap-[12px]">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)] shrink-0">2</span>
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                Follow Paul&apos;s journey on the trail map — you&apos;ll get weekly updates as he hikes.
              </p>
            </div>
            <div className="flex items-start gap-[12px]">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)] shrink-0">3</span>
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                At the end of Paul&apos;s hike, you&apos;ll be invited to honour your pledge — paying the foundations directly.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-[16px] mt-[8px]">
            <Link
              href="/my-pledge"
              className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                VIEW MY PLEDGE
              </span>
            </Link>
            <Link
              href="/trail-map"
              className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:border-[var(--burnt-orange)] transition-colors"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
                TRAIL MAP
              </span>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header />
        <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--forest-green)] text-center w-full">
          <CheckCircle className="w-[48px] h-[48px] text-white" />
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] tracking-[-1px] text-white max-w-[700px]">
            Already Confirmed
          </h1>
          <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
            Your pledge is already active. No action needed!
          </p>
        </section>
        <section className="flex flex-col items-center gap-[16px] px-6 py-[48px] bg-[var(--bg-white)] w-full">
          <Link
            href="/my-pledge"
            className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
              VIEW MY PLEDGE
            </span>
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header />
        <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--bg-dark)] text-center w-full">
          <AlertCircle className="w-[48px] h-[48px] text-[var(--burnt-orange)]" />
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] tracking-[-1px] text-white max-w-[700px]">
            Link Expired
          </h1>
          <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
            This verification link has expired or was already used. Please submit your pledge again to receive a new confirmation email.
          </p>
        </section>
        <section className="flex flex-col items-center gap-[16px] px-6 py-[48px] bg-[var(--bg-white)] w-full">
          <Link
            href="/pledge"
            className="flex items-center justify-center gap-[8px] bg-[var(--burnt-orange)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
              PLEDGE AGAIN
            </span>
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  // Pending / default
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--forest-green)] text-center w-full">
        <Clock className="w-[48px] h-[48px] text-white" />
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFF88]">
          CHECK YOUR EMAIL
        </span>
        <h1 className="font-heading font-semibold text-[32px] md:text-[44px] tracking-[-1px] text-white max-w-[700px]">
          Almost There!
        </h1>
        <p className="font-heading text-[17px] text-[#FFFFFFCC] max-w-[560px] leading-[1.6]">
          We&apos;ve sent a confirmation link to your email. Click it to activate your pledge.
          The link expires in 1 hour.
        </p>
      </section>
      <section className="flex flex-col items-center gap-[16px] px-6 py-[48px] bg-[var(--bg-white)] w-full">
        <p className="font-heading text-[14px] text-[var(--text-muted)] text-center max-w-[400px] leading-[1.6]">
          Didn&apos;t receive the email? Check your spam folder, or{" "}
          <Link href="/pledge" className="text-[var(--burnt-orange)] hover:underline">
            submit your pledge again
          </Link>.
        </p>
      </section>
      <Footer />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col w-full bg-[var(--bg-warm)]">
          <Header />
          <div className="py-[120px] text-center">
            <p className="font-heading text-[var(--text-muted)]">Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
