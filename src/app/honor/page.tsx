"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Heart,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Mountain,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface HonorData {
  pledge: {
    id: string;
    name: string;
    amount: number;
    interval: number;
    totalPledge: number;
    honored: boolean;
    honoredAt: number | null;
  };
  community: {
    honoredCount: number;
    pledgerCount: number;
    totalPledged: number;
    honorRate: number;
  };
}

export default function HonorPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HonorData | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/honor?email=${encodeURIComponent(email.trim())}`
      );
      const json = await res.json();

      if (!res.ok) {
        setError(
          res.status === 404
            ? "No pledge found for this email."
            : json.error || "Something went wrong."
        );
      } else {
        setData(json);
        if (json.pledge.honored) setConfirmed(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHonored = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/honor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setConfirmed(true);
        // Refresh data
        const refreshRes = await fetch(
          `/api/honor?email=${encodeURIComponent(email.trim())}`
        );
        if (refreshRes.ok) {
          setData(await refreshRes.json());
        }
      }
    } catch {
      // Silently fail — button state still changes
    } finally {
      setConfirming(false);
    }
  };

  const pledge = data?.pledge;
  const community = data?.community;
  const halfPledge = pledge ? pledge.totalPledge / 2 : 0;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[56px] bg-[var(--forest-green)] text-center w-full">
        <Mountain className="w-[32px] h-[32px] text-white opacity-60" />
        <span className="font-label font-bold text-[12px] tracking-[3px] text-white opacity-70">
          PAUL MADE IT TO CANADA
        </span>
        <h1 className="font-heading font-semibold text-[32px] md:text-[40px] tracking-[-0.5px] text-white max-w-[600px]">
          Honor Your Pledge
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-white opacity-80 max-w-[560px]">
          2,650 miles. Mexico to Canada. Paul walked every step for cancer
          research, patient support, and prevention. Now it&apos;s time to honor
          your pledge by donating directly to the foundations.
        </p>
      </section>

      {!data ? (
        /* Lookup Form */
        <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full">
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[32px] max-w-[500px] mx-auto w-full">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              FIND YOUR PLEDGE
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Enter the email you used when setting your pledge to see your
              final total and donation links.
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
                    : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
                }`}
              >
                <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                  {loading ? "LOOKING UP..." : "VIEW MY PLEDGE"}
                </span>
              </button>
            </form>
          </div>
        </section>
      ) : (
        <>
          {/* Pledge Summary */}
          <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full">
            <div className="flex flex-col items-center gap-[8px] text-center">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                YOUR FINAL PLEDGE
              </span>
              <span className="font-heading font-semibold text-[56px] md:text-[64px] tracking-[-2px] text-[var(--burnt-orange)] leading-[1]">
                {formatCurrency(pledge!.totalPledge)}
              </span>
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">
                {formatCurrency(pledge!.amount)}/{pledge!.interval === 1 ? "mile" : `${pledge!.interval} miles`} &times; 2,650 miles
              </span>
            </div>

            {/* 50/50 Split */}
            <div className="flex flex-col md:flex-row gap-[16px] max-w-[700px] mx-auto w-full">
              <div className="flex flex-col items-center gap-[12px] flex-1 bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[28px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--forest-green)]">
                  50% — CITY OF HOPE
                </span>
                <span className="font-heading font-semibold text-[28px] text-[var(--forest-green)]">
                  {formatCurrency(halfPledge)}
                </span>
                <span className="font-heading text-[13px] text-[var(--text-secondary)] text-center leading-[1.5]">
                  Cancer research and treatment — California, USA
                </span>
                <a
                  href="https://www.cityofhope.org/giving/why-give-to-city-hope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[24px] py-[12px] hover:opacity-90 transition-opacity mt-[4px]"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                    DONATE {formatCurrency(halfPledge)}
                  </span>
                  <ExternalLink className="w-[14px] h-[14px] text-[var(--text-white)]" />
                </a>
              </div>

              <div className="flex flex-col items-center gap-[12px] flex-1 bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] p-[28px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
                  50% — LEUKAEMIA FOUNDATION
                </span>
                <span className="font-heading font-semibold text-[28px] text-[var(--burnt-orange)]">
                  {formatCurrency(halfPledge)}
                </span>
                <span className="font-heading text-[13px] text-[var(--text-secondary)] text-center leading-[1.5]">
                  Blood cancer support and research — Australia
                </span>
                <a
                  href="https://www.leukaemia.org.au/make-a-difference/give/donate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[24px] py-[12px] hover:opacity-90 transition-opacity mt-[4px]"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                    DONATE {formatCurrency(halfPledge)}
                  </span>
                  <ExternalLink className="w-[14px] h-[14px] text-[var(--text-white)]" />
                </a>
              </div>
            </div>
          </section>

          {/* Confirm Honor */}
          <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] border-t border-[var(--border-subtle)] w-full">
            {confirmed ? (
              <div className="flex flex-col items-center gap-[16px] max-w-[500px] text-center">
                <CheckCircle className="w-[48px] h-[48px] text-[var(--forest-green)]" />
                <h3 className="font-heading font-semibold text-[24px] text-[var(--forest-green)]">
                  You&apos;ve honored your pledge!
                </h3>
                <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                  Thank you, {pledge!.name}. Your generosity goes directly to
                  cancer research and patient support. Paul never touches a cent
                  — every dollar goes to the foundations.
                </p>
                {community && (
                  <span className="font-label font-bold text-[12px] tracking-[1px] text-[var(--forest-green)]">
                    {community.honoredCount} of {community.pledgerCount}{" "}
                    pledgers have honored so far ({community.honorRate}%)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-[16px] max-w-[500px] text-center">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                  AFTER YOU&apos;VE DONATED
                </span>
                <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                  Once you&apos;ve donated to both foundations, click the button
                  below to mark your pledge as honored. This helps Paul track
                  the community&apos;s impact.
                </p>
                <button
                  onClick={handleConfirmHonored}
                  disabled={confirming}
                  className={`flex items-center gap-[8px] px-[32px] py-[14px] transition-opacity ${
                    confirming
                      ? "bg-[var(--text-muted)] cursor-not-allowed"
                      : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
                  }`}
                >
                  <Heart className="w-[16px] h-[16px] text-[var(--text-white)]" />
                  <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                    {confirming
                      ? "CONFIRMING..."
                      : "I'VE HONORED MY PLEDGE"}
                  </span>
                </button>
                {community && community.honoredCount > 0 && (
                  <span className="font-heading text-[13px] text-[var(--text-muted)]">
                    {community.honoredCount} of {community.pledgerCount}{" "}
                    pledgers have already honored
                  </span>
                )}
              </div>
            )}
          </section>

          {/* How it works */}
          <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full max-w-[700px] mx-auto lg:max-w-none">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              HOW HONORING WORKS
            </span>
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-start gap-[16px]">
                <span className="font-label font-bold text-[20px] text-[var(--burnt-orange)] shrink-0 w-[28px]">1</span>
                <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                  <strong>Click the donation links above</strong> — each takes you directly to the foundation&apos;s donation page. Donate the amount shown for each (50/50 split).
                </p>
              </div>
              <div className="flex items-start gap-[16px]">
                <span className="font-label font-bold text-[20px] text-[var(--burnt-orange)] shrink-0 w-[28px]">2</span>
                <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                  <strong>Come back here and confirm</strong> — click &quot;I&apos;ve honored my pledge&quot; so we can track the community&apos;s collective impact.
                </p>
              </div>
              <div className="flex items-start gap-[16px]">
                <span className="font-label font-bold text-[20px] text-[var(--burnt-orange)] shrink-0 w-[28px]">3</span>
                <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                  <strong>Paul gets $0</strong> — every cent goes directly to the cancer foundations. That&apos;s the whole point.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[32px] bg-[var(--bg-warm)] w-full">
            <Link
              href="/my-pledge"
              className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-white)] transition-colors"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
                VIEW MY PLEDGE
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
