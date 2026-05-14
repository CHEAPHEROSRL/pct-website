"use client";

import { useState, useCallback, FormEvent, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  TrendingUp,
  Heart,
  Share2,
  Download,
  Check,
  Plus,
  Minus,
  Loader,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountdownBanner from "@/components/CountdownBanner";
import { useLocationData } from "@/hooks/useLocationData";
import { useSession } from "@/hooks/useSession";
import type { PledgeBoost } from "@/lib/types";
import { getTrailSection } from "@/lib/trail";

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
  claimedSection?: string;
  createdAt: number;
  updatedAt: number;
}

function ShareBadge({ pledge }: { pledge: PledgeData }) {
  const [copied, setCopied] = useState(false);

  const rateStr = `$${pledge.amount}/${pledge.interval === 1 ? "mi" : pledge.interval + "mi"}`;
  const totalStr = formatCurrency(pledge.totalPledge);
  const badgeUrl = `/api/share-badge?name=${encodeURIComponent(pledge.name)}&rate=${encodeURIComponent(rateStr)}&total=${encodeURIComponent(totalStr)}`;

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(badgeUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "yeschapter-pledge-badge.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(badgeUrl, "_blank");
    }
  }, [badgeUrl]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = `${window.location.origin}/pledge`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      window.open(shareUrl, "_blank");
    }
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "I'm pledging for cancer research — YesChapter",
      text: `I pledged ${rateStr} per mile for Paul's 2,650-mile PCT walk for cancer research. Join me!`,
      url: `${window.location.origin}/pledge`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — that's fine
      }
    } else {
      handleCopyLink();
    }
  }, [rateStr, handleCopyLink]);

  return (
    <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] border-t border-[var(--border-subtle)] w-full">
      <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
        SHARE YOUR PLEDGE
      </span>
      <div className="flex flex-col lg:flex-row gap-[24px] items-start">
        {/* Badge Preview */}
        <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg border border-[var(--border-subtle)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeUrl}
            alt="Your pledge share badge"
            className="w-full h-auto"
          />
        </div>

        {/* Share Actions */}
        <div className="flex flex-col gap-[16px] flex-1">
          <h3 className="font-heading font-semibold text-[22px] text-[var(--text-primary)]">
            Spread the word
          </h3>
          <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
            Every share can turn into another pledge. Download your badge for
            social media or share the pledge link directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-[12px] mt-[8px]">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-[8px] bg-[var(--burnt-orange)] px-[24px] py-[14px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Download className="w-[16px] h-[16px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                DOWNLOAD BADGE
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[24px] py-[14px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Share2 className="w-[16px] h-[16px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">
                SHARE
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[14px] hover:bg-[var(--bg-white)] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-[16px] h-[16px] text-[var(--forest-green)]" />
              ) : (
                <Share2 className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
              )}
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                {copied ? "COPIED!" : "COPY LINK"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function IncreasePledgeForm({
  pledge,
  email,
  onUpdated,
}: {
  pledge: PledgeData;
  email: string;
  onUpdated: (updated: PledgeData) => void;
}) {
  const [addAmount, setAddAmount] = useState(0.01);
  const [submitting, setSubmitting] = useState(false);
  // Two distinct post-submit states. The boost flow requires email
  // verification — the dashboard does NOT update at submit time, it
  // updates after the user clicks the verification link. Previously we
  // showed "Pledge increased!" immediately on submit, which lied to
  // the user: the pledge wasn't actually changed and the dashboard
  // showed the old amount. Now we distinguish:
  //   pendingVerification = "we sent you an email, click the link"
  //   appliedSuccess      = (currently unused — only reachable when
  //                          the boost-verify endpoint redirects back
  //                          here after applying the change)
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Boost-amount prefill: when someone hits the 409 ("already pledged")
  // state on /pledge and clicks "ADD $X/MILE TO MY PLEDGE", that page
  // writes the typed amount into sessionStorage before navigating here.
  // sessionStorage survives the magic-link auth redirect, so this works
  // whether the user is already signed in or has to sign in first.
  // We consume the value once on mount and clear it so a later visit
  // doesn't accidentally re-apply it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("pledgeBoostAmount");
    if (!raw) return;
    window.sessionStorage.removeItem("pledgeBoostAmount");
    const parsed = parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed < 0.01 || parsed > 100) return;
    setAddAmount(parsed);
    // Scroll the boost form into view so it's obvious the prefill worked
    requestAnimationFrame(() => {
      document.getElementById("boost-form-anchor")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, []);

  const presets = [0.01, 0.02, 0.05, 0.10];
  const newRate = pledge.amount + addAmount;
  const newTotal = (newRate * TOTAL_MILES) / pledge.interval;
  const addedTotal = addAmount * TOTAL_MILES;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pledges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, addAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        // The boost is NOT applied at this point. The server has sent a
        // verification email and the pledge stays at its current amount
        // until the user clicks the email link. data.pledge is undefined
        // here — don't try to onUpdated() with it.
        setPendingVerification(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="flex flex-col items-center gap-[14px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] p-[28px]">
        <Mail className="w-[32px] h-[32px] text-[var(--burnt-orange)]" />
        <span className="font-heading font-semibold text-[18px] text-[var(--burnt-orange)]">
          Almost there — check your email
        </span>
        <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click
          the &ldquo;Confirm Pledge Increase&rdquo; button in that email and
          your pledge will jump from <strong>{formatCurrency(pledge.amount)}/mile</strong> to <strong>{formatCurrency(newRate)}/mile</strong> ({formatCurrency(newTotal)} total).
        </p>
        <p className="font-heading italic text-[12px] text-[var(--text-muted)] text-center">
          Nothing has changed yet — your pledge stays at {formatCurrency(pledge.amount)}/mile until you click the link. Can&apos;t find the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
      <div className="flex flex-col gap-[4px]">
        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
          INCREASE YOUR PLEDGE
        </span>
        <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
          Even a small increase adds up over 2,650 miles. How much more per mile?
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-[8px]">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAddAmount(p)}
            className={`flex items-center justify-center px-[16px] py-[10px] border cursor-pointer transition-colors ${
              addAmount === p
                ? "border-[var(--forest-green)] bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--forest-green)]"
            }`}
          >
            <span className="font-label font-bold text-[13px] tracking-[1px]">
              +${p.toFixed(2)}/mi
            </span>
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-[12px]">
        <span className="font-heading text-[14px] text-[var(--text-secondary)]">
          Or custom:
        </span>
        <div className="flex items-center h-[44px] border border-[var(--border-subtle)] bg-[var(--bg-white)]">
          <button
            onClick={() => setAddAmount(Math.max(0.01, Math.round((addAmount - 0.01) * 100) / 100))}
            className="flex items-center justify-center w-[36px] h-full border-r border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-warm)]"
          >
            <Minus className="w-[14px] h-[14px] text-[var(--text-muted)]" />
          </button>
          <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)] px-[16px]">
            +${addAmount.toFixed(2)}/mi
          </span>
          <button
            onClick={() => setAddAmount(Math.min(100, Math.round((addAmount + 0.01) * 100) / 100))}
            className="flex items-center justify-center w-[36px] h-full border-l border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-warm)]"
          >
            <Plus className="w-[14px] h-[14px] text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Impact preview */}
      <div className="flex flex-col gap-[6px] bg-[var(--bg-warm)] p-[16px]">
        <div className="flex justify-between">
          <span className="font-heading text-[13px] text-[var(--text-secondary)]">Current rate</span>
          <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">
            {formatCurrency(pledge.amount)}/mi
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-heading text-[13px] text-[var(--forest-green)]">Adding</span>
          <span className="font-heading font-semibold text-[13px] text-[var(--forest-green)]">
            +{formatCurrency(addAmount)}/mi
          </span>
        </div>
        <div className="w-full h-[1px] bg-[var(--border-subtle)]" />
        <div className="flex justify-between">
          <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">New rate</span>
          <span className="font-heading font-bold text-[15px] text-[var(--burnt-orange)]">
            {formatCurrency(newRate)}/mi
          </span>
        </div>
        <span className="font-heading text-[12px] text-[var(--text-muted)] text-right">
          +{formatCurrency(addedTotal)} more for cancer research
        </span>
      </div>

      {error && (
        <span className="font-heading text-[13px] text-red-600">{error}</span>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`flex items-center justify-center gap-[8px] h-[48px] w-full transition-opacity ${
          submitting
            ? "bg-[var(--text-muted)] cursor-not-allowed"
            : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
        }`}
      >
        <TrendingUp className="w-[16px] h-[16px] text-[var(--text-white)]" />
        <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
          {submitting ? "UPDATING..." : "CONFIRM INCREASE"}
        </span>
      </button>
    </div>
  );
}

export default function MyPledgePage() {
  const [email, setEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledge, setPledge] = useState<PledgeData | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [magicSending, setMagicSending] = useState(false);

  const { user, loading: sessionLoading } = useSession();
  const { data: locationData } = useLocationData(30000);
  const totalMiles = locationData?.stats?.totalMiles ?? 0;

  // Auto-load pledge from session email. Abort controller prevents stomping
  // state if the user manually types a different email while this is still
  // in flight (race condition flagged in the audit).
  useEffect(() => {
    if (!user?.email || pledge) return;
    const controller = new AbortController();
    fetch(`/api/pledges?email=${encodeURIComponent(user.email)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pledge) {
          setPledge(data.pledge);
          setEmail(user.email);
        }
      })
      .catch((err) => {
        // AbortError is expected (user navigated away); any other error is
        // network trouble — keep it quiet, the manual lookup form will
        // surface a proper error if needed.
        if (err?.name !== "AbortError") {
          // swallow — session auto-load is a convenience, not a contract
        }
      });
    return () => controller.abort();
  }, [user, pledge]);

  // Magic-link-only auth. The previous "instant view by email" lookup let
  // anyone read a pledger's amount/total/history by knowing the email
  // address — a privacy hole. Now the only path in is: type email → receive
  // sign-in link → click it → session cookie set → dashboard renders.
  // Pairs with the API change in /api/pledges that now requires a session
  // matching the requested email.
  const handleSendMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || magicSending) return;
    setMagicSending(true);
    setError(null);
    try {
      await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      // The magic endpoint always returns success to avoid leaking which
      // emails exist. We mirror that on the UI — show "check your inbox"
      // regardless of whether the email is in the system.
      setMagicSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setMagicSending(false);
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
      <CountdownBanner />

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
          boost your pledge during challenges.{" "}
          <Link href="/journal/how-pledging-works" className="text-[var(--burnt-orange)] hover:underline">
            Learn how pledging works &rarr;
          </Link>
        </p>
      </section>

      {!pledge ? (
        /* Lookup Form */
        <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full max-w-[600px] mx-auto lg:max-w-none">
          {sessionLoading ? (
            <div className="flex items-center justify-center py-[48px]">
              <Loader className="w-[28px] h-[28px] text-[var(--forest-green)] animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[32px] max-w-[500px] mx-auto w-full">
              {magicSent ? (
                /* Success state — magic link has been sent */
                <div className="flex flex-col gap-[12px] items-center text-center py-[8px]">
                  <Mail className="w-[28px] h-[28px] text-[var(--forest-green)]" />
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--forest-green)]">
                    CHECK YOUR INBOX
                  </span>
                  <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                    If a pledge exists for <strong>{email}</strong>, we&apos;ve emailed
                    you a sign-in link. Open it on this device — clicking the
                    button inside will sign you in and bring you straight here.
                  </p>
                  <p className="font-heading text-[12px] text-[var(--text-muted)] mt-[4px]">
                    The link expires in 15 minutes. Don&apos;t see it? Check spam.
                  </p>
                </div>
              ) : (
                <>
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                    SIGN IN TO VIEW YOUR PLEDGE
                  </span>
                  <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                    Enter the email you pledged with. We&apos;ll send you a one-time
                    sign-in link — no password needed.
                  </p>
                  <form onSubmit={handleSendMagicLink} className="flex flex-col gap-[12px]">
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
                      disabled={magicSending}
                      className={`flex items-center justify-center gap-[8px] h-[48px] w-full transition-opacity ${
                        magicSending
                          ? "bg-[var(--text-muted)] cursor-not-allowed"
                          : "bg-[var(--burnt-orange)] cursor-pointer hover:opacity-90"
                      }`}
                    >
                      <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                        {magicSending ? "SENDING…" : "SEND ME A SIGN-IN LINK"}
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
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        /* Dashboard */
        <>
          {/* Stats Cards */}
          <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] pb-[48px] bg-[var(--bg-white)] w-full">
            <div className="flex flex-col lg:flex-row gap-[24px] w-full">
              {/* Running Total */}
              <div className="flex flex-col gap-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px] flex-1">
                <div className="flex items-baseline justify-between gap-[8px] flex-wrap">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                    YOUR RUNNING TOTAL
                  </span>
                  <span className="font-label font-medium text-[10px] tracking-[0.5px] text-[var(--text-muted)]">
                    USD
                  </span>
                </div>
                <span className="font-heading font-semibold text-[48px] tracking-[-1px] text-[var(--text-primary)] leading-[1]">
                  {formatCurrency(runningTotal)}
                </span>
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                  based on {totalMiles.toLocaleString("en-US")} miles completed so far
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
                    {formatCurrency(pledge.totalPledge)} maximum (at 2,650 mi)
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
                      City of Hope (California):{" "}
                      <strong className="text-[var(--forest-green)]">
                        {formatCurrency(perFoundation)} (50%)
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
                    <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                      Leukaemia Foundation (Australia):{" "}
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

          {/* Increase Pledge Form */}
          <section id="boost-form-anchor" className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full scroll-mt-[120px]">
            <IncreasePledgeForm
              pledge={pledge}
              email={email}
              onUpdated={(updated) => setPledge(updated)}
            />
          </section>

          {/* Trail Section Claim */}
          <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              YOUR TRAIL SECTION CLAIM
            </span>
            {pledge.claimedSection && getTrailSection(pledge.claimedSection) ? (() => {
              const section = getTrailSection(pledge.claimedSection)!;
              const reached = totalMiles >= section.miles;
              const milesToGo = Math.max(0, section.miles - Math.floor(totalMiles));
              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">
                      {section.name}
                    </span>
                    <span className="font-label font-bold text-[11px] tracking-[1.5px] text-[var(--text-muted)]">
                      MILE {section.miles.toLocaleString("en-US")}
                      {section.subtitle ? ` · ${section.subtitle.toUpperCase()}` : ""}
                    </span>
                    {/* Progress hint — pin is always live on the map, but it's
                        still useful for the pledger to know how close Paul is
                        to actually reaching their section. */}
                    <span className="font-heading italic text-[12px] text-[var(--text-muted)] mt-[2px]">
                      {reached
                        ? "Paul has reached this section ✓"
                        : `Paul reaches this section in ${milesToGo.toLocaleString("en-US")} miles`}
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className="font-label font-bold text-[10px] tracking-[1.5px] text-[var(--forest-green)] bg-[var(--forest-green-light)] px-[10px] py-[4px]">
                      PIN LIVE ON MAP
                    </span>
                    <Link
                      href="/trail-map"
                      className="font-heading font-semibold text-[13px] text-[var(--burnt-orange)] hover:underline"
                    >
                      View on map →
                    </Link>
                  </div>
                </div>
              );
            })() : (
              <div className="flex flex-col gap-[8px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px]">
                <span className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                  You haven&apos;t claimed a trail section. Paul will assign your pin to a random unclaimed landmark.
                </span>
                <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
                  Section claims are set at pledge time. To change yours, use the{" "}
                  <Link href="/contact" className="text-[var(--burnt-orange)] hover:underline not-italic">
                    contact form
                  </Link>.
                </span>
              </div>
            )}
          </section>

          {/* Share Badge */}
          <ShareBadge pledge={pledge} />

          {/* CTAs */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[32px] bg-[var(--bg-warm)] w-full">
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
