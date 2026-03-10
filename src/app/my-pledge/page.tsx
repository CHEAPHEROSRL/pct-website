"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  TrendingUp,
  Heart,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChallengeBanner from "@/components/ChallengeBanner";
import { useLocationData } from "@/hooks/useLocationData";
import type { PledgeBoost } from "@/lib/types";

const TOTAL_MILES = 2650;

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface PledgeData {
  id: string;
  name: string;
  amount: number;
  interval: number;
  totalPledge: number;
  boosts: PledgeBoost[];
  createdAt: number;
  updatedAt: number;
}

export default function MyPledgePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledge, setPledge] = useState<PledgeData | null>(null);

  const { data: locationData } = useLocationData(30000);
  const totalMiles = locationData?.stats?.totalMiles ?? 0;

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/pledges?email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(
          res.status === 404
            ? "No pledge found for this email. Have you pledged yet?"
            : data.error || "Something went wrong."
        );
      } else {
        setPledge(data.pledge);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const perMile = pledge ? pledge.amount / pledge.interval : 0;
  const runningTotal = pledge ? perMile * totalMiles : 0;
  const progressPercent = pledge
    ? Math.round((runningTotal / pledge.totalPledge) * 1000) / 10
    : 0;
  const perFoundation = pledge ? pledge.totalPledge / 2 : 0;

  const originalAmount =
    pledge && pledge.boosts.length > 0
      ? pledge.amount -
        pledge.boosts.reduce((sum, b) => sum + b.addedAmount, 0)
      : pledge?.amount ?? 0;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <ChallengeBanner />

      {/* Hero */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[56px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          MY PLEDGE
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
          Your Pledge Dashboard
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[650px]">
          Track your pledge, see your running total as Paul progresses, and
          boost your pledge during challenges.
        </p>
      </section>

      {!pledge ? (
        /* Lookup Form */
        <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full max-w-[600px] mx-auto lg:max-w-none">
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[32px] max-w-[500px] mx-auto w-full">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              FIND YOUR PLEDGE
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Enter the email you used when setting your pledge.
            </p>
            <form onSubmit={handleLookup} className="flex flex-col gap-[12px]">
              <div className="flex items-center w-full h-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <Mail className="w-[18px] h-[18px] text-[var(--text-muted)] ml-[16px] shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-full px-[12px] font-heading text-[15px] italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent"
                />
              </div>
              {error && (
                <span className="font-heading text-[13px] text-red-600">
                  {error}
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-[8px] h-[48px] w-full transition-opacity ${
                  loading
                    ? "bg-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--burnt-orange)] cursor-pointer hover:opacity-90"
                }`}
              >
                <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                  {loading ? "LOOKING UP..." : "VIEW MY PLEDGE"}
                </span>
              </button>
            </form>
            <p className="font-heading text-[13px] text-[var(--text-muted)] text-center">
              Don&apos;t have a pledge yet?{" "}
              <Link
                href="/pledge"
                className="text-[var(--burnt-orange)] font-semibold hover:underline"
              >
                Set one now
              </Link>
            </p>
          </div>
        </section>
      ) : (
        /* Dashboard */
        <>
          {/* Stats Cards */}
          <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] pb-[48px] bg-[var(--bg-white)] w-full">
            <div className="flex flex-col lg:flex-row gap-[24px] w-full">
              {/* Running Total */}
              <div className="flex flex-col gap-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px] flex-1">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                  YOUR RUNNING TOTAL
                </span>
                <span className="font-heading font-semibold text-[48px] tracking-[-1px] text-[var(--text-primary)] leading-[1]">
                  {formatCurrency(runningTotal)}
                </span>
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                  based on {totalMiles.toLocaleString()} miles completed so far
                </span>
                <div className="relative w-full h-[8px] bg-[var(--warm-stone)]">
                  <div
                    className="absolute top-0 left-0 h-[8px] bg-[var(--forest-green)] transition-all duration-1000"
                    style={{
                      width: `max(4px, ${Math.min(progressPercent, 100)}%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between w-full">
                  <span className="font-label font-medium text-[10px] tracking-[0.5px] text-[var(--text-muted)]">
                    $0
                  </span>
                  <span className="font-label font-medium text-[10px] tracking-[0.5px] text-[var(--text-muted)]">
                    {formatCurrency(pledge.totalPledge)} if Paul finishes
                  </span>
                </div>
              </div>

              {/* Pledge Details */}
              <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px] flex-1">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                  YOUR PLEDGE
                </span>
                <span className="font-heading font-semibold text-[28px] text-[var(--burnt-orange)]">
                  {formatCurrency(pledge.amount)} /{" "}
                  {pledge.interval === 1
                    ? "mile"
                    : `${pledge.interval} miles`}
                </span>
                <div className="w-full h-[1px] bg-[var(--border-subtle)]" />
                <div className="flex justify-between w-full">
                  <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                    Original pledge
                  </span>
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    {formatCurrency(originalAmount)}/
                    {pledge.interval === 1 ? "mi" : `${pledge.interval}mi`}
                  </span>
                </div>
                {pledge.boosts.length > 0 && (
                  <div className="flex justify-between w-full">
                    <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                      Challenge boosts
                    </span>
                    <span className="font-heading font-semibold text-[14px] text-[var(--forest-green)]">
                      +{formatCurrency(pledge.amount - originalAmount)}/
                      {pledge.interval === 1 ? "mi" : `${pledge.interval}mi`} (
                      {pledge.boosts.length} boost
                      {pledge.boosts.length > 1 ? "s" : ""})
                    </span>
                  </div>
                )}
                <div className="flex justify-between w-full">
                  <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                    Total if completed
                  </span>
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    {formatCurrency(pledge.totalPledge)}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-[var(--border-subtle)]" />
                <div className="flex flex-col gap-[8px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                    WHERE YOUR PLEDGE GOES
                  </span>
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[var(--forest-green)] shrink-0" />
                    <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                      Cancer Foundation — California:{" "}
                      <strong className="text-[var(--forest-green)]">
                        {formatCurrency(perFoundation)} (50%)
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
                    <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                      Cancer Foundation — Sydney:{" "}
                      <strong className="text-[var(--burnt-orange)]">
                        {formatCurrency(perFoundation)} (50%)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pledge History */}
          <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              PLEDGE HISTORY
            </span>
            <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
              {/* Original pledge */}
              <div className="flex items-center gap-[16px]">
                <div className="w-[10px] h-[10px] bg-[var(--burnt-orange)] shrink-0" />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    Original pledge set
                  </span>
                  <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                    {formatDate(pledge.createdAt)} ·{" "}
                    {formatCurrency(originalAmount)}/
                    {pledge.interval === 1 ? "mile" : `${pledge.interval}mi`} ·
                    Total: {formatCurrency((originalAmount * TOTAL_MILES) / pledge.interval)}
                  </span>
                </div>
              </div>

              {/* Boosts */}
              {pledge.boosts.map((boost, i) => (
                <div key={i}>
                  <div className="w-full h-[1px] bg-[var(--border-subtle)] my-[8px]" />
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[10px] h-[10px] bg-[var(--forest-green)] shrink-0" />
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-heading font-semibold text-[14px] text-[var(--forest-green)]">
                        Challenge boost: {boost.challengeTitle}
                      </span>
                      <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                        {formatDate(boost.addedAt)} · +
                        {formatCurrency(boost.addedAmount)}/
                        {pledge.interval === 1 ? "mile" : `${pledge.interval}mi`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {pledge.boosts.length === 0 && (
                <p className="font-heading text-[13px] text-[var(--text-muted)] italic mt-[8px]">
                  No challenge boosts yet. When Paul starts a trail challenge,
                  you&apos;ll be able to boost your pledge here.
                </p>
              )}
            </div>
          </section>

          {/* CTAs */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[32px] bg-[var(--bg-warm)] w-full">
            <Link
              href="/pledge"
              className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
            >
              <TrendingUp className="w-[16px] h-[16px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                INCREASE MY PLEDGE
              </span>
            </Link>
            <Link
              href="/support"
              className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-white)] transition-colors"
            >
              <Heart className="w-[16px] h-[16px] text-[var(--forest-green)]" />
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
                SUPPORT PAUL ON THE TRAIL
              </span>
            </Link>
            <Link
              href="/trail-map"
              className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-white)] transition-colors"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
                VIEW TRAIL MAP
              </span>
              <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
            </Link>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
