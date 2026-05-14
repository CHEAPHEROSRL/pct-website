"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Heart, Mail, ArrowRight, HeartHandshake, Building2, Sparkles, Check, X } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DistanceTracker from "@/components/DistanceTracker";
import CountdownBanner from "@/components/CountdownBanner";
import Turnstile from "@/components/Turnstile";
import { trailSections, TRAIL_REGIONS, type TrailRegion } from "@/lib/trail";

const TOTAL_MILES = 2650;
// Threshold (in US$ total pledge) above which we surface the company-sponsorship
// path. Designed to ONLY appear in parallel to the regular submit button — the
// individual at $5K+ should still be able to pledge directly. Previously this
// CTA replaced the submit button entirely, which locked out non-business
// pledgers at the high end.
const SPONSOR_CTA_THRESHOLD = 5000;

const presets = [
  { label: "1¢/mi", amount: 0.01 },
  { label: "10¢/mi", amount: 0.1 },
  { label: "25¢/mi", amount: 0.25 },
  { label: "US$1/mi", amount: 1 },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PledgePage() {
  const [amount, setAmount] = useState(0.1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Set when the server returns 409 (email already has a confirmed pledge).
  // Drives a distinct "you already pledged" success state so we don't lie
  // to the user with the standard "confirmation email sent" copy.
  const [existingPledge, setExistingPledge] = useState<{ rate: string; totalPledge: number; createdAt: number } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [avatar, setAvatar] = useState<string>("💚");
  const [mailingList, setMailingList] = useState(false);
  const [claimedSection, setClaimedSection] = useState<string | null>(null);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});

  // Sponsorship modal — opens automatically the FIRST time the running total
  // crosses US$5K, so a business rep dragging the slider sees the option
  // before they invest time filling out the rest of the form. After dismiss,
  // it doesn't reappear in this page session (sliding under and over again
  // won't re-trigger). Rising-edge detected by tracking the previous total
  // in a ref so we only fire on the up-cross, not on every render at high
  // amounts.
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [sponsorModalDismissedThisSession, setSponsorModalDismissedThisSession] = useState(false);
  const prevTotalRef = useRef(0);

  // Silent IP geolocation on mount
  const geoRef = useRef<{ city?: string; country?: string; lat?: number; lng?: number }>({});
  useEffect(() => {
    fetch("https://ip-api.com/json/?fields=city,country,lat,lon")
      .then((res) => res.json())
      .then((data) => {
        if (data.lat && data.lon) {
          geoRef.current = { city: data.city, country: data.country, lat: data.lat, lng: data.lon };
        }
      })
      .catch(() => {});
  }, []);

  // Fetch pledger count per section so the picker can show "X pledgers" badges.
  // Silent-fail: an empty {} is fine — the picker just doesn't show counts.
  useEffect(() => {
    fetch("/api/pledges/section-counts")
      .then((res) => res.json())
      .then((data) => setSectionCounts(data?.counts || {}))
      .catch(() => {});
  }, []);

  // Group the curated sections by region for the picker. Stable across renders
  // because trailSections itself is a module-level constant.
  const sectionsByRegion = useMemo(() => {
    const groups: Record<TrailRegion, typeof trailSections> = {
      socal: [], sierra: [], norcal: [], oregon: [], washington: [],
    };
    for (const s of trailSections) groups[s.region].push(s);
    return groups;
  }, []);

  const totalPledge = amount * TOTAL_MILES;
  const perFoundation = totalPledge / 2;

  // Rising-edge detect: open the modal exactly on the transition from
  // below-threshold to above-threshold. Skips re-trigger after dismiss
  // (the visitor said no, leave them alone for the rest of the session)
  // and skips re-trigger on every render while above threshold.
  useEffect(() => {
    const prev = prevTotalRef.current;
    const justCrossed = prev < SPONSOR_CTA_THRESHOLD && totalPledge >= SPONSOR_CTA_THRESHOLD;
    if (justCrossed && !sponsorModalDismissedThisSession) {
      setSponsorModalOpen(true);
    }
    prevTotalRef.current = totalPledge;
  }, [totalPledge, sponsorModalDismissedThisSession]);

  // ESC key closes the modal — basic accessibility
  useEffect(() => {
    if (!sponsorModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSponsorModalOpen(false);
        setSponsorModalDismissedThisSession(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sponsorModalOpen]);

  // Body scroll lock while modal is open so the page behind doesn't scroll
  useEffect(() => {
    if (!sponsorModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [sponsorModalOpen]);

  function dismissSponsorModal() {
    setSponsorModalOpen(false);
    setSponsorModalDismissedThisSession(true);
  }

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(parseFloat(e.target.value));
    },
    []
  );

  const handlePreset = useCallback(
    (preset: (typeof presets)[number]) => {
      setAmount(preset.amount);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || "Anonymous",
          amount,
          interval: 1,
          anonymous: !name,
          message: message || undefined,
          avatar,
          emailPreference: mailingList ? "all" : "finish",
          claimedSection: claimedSection || undefined,
          turnstileToken: turnstileToken || "",
          website: honeypot, // honeypot field
          ...geoRef.current,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Already-pledged user re-submitting. Server returns the existing
        // pledge details so we can show an honest "you already pledged X"
        // state instead of pretending a new pledge was created. The new
        // amount they typed was NOT saved — we don't replace pledges from
        // this form (boost flow on /my-pledge is the way to change amounts).
        // Magic link sent so they can get into their dashboard to manage it.
        setExistingPledge(data?.pledge || null);
        setSubmitted(true);
        fetch("/api/auth/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: name || undefined }),
        }).catch(() => {});
      } else if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        // New pledge — server already sent the "Confirm Your Pledge" email
        // and clicking that link both confirms the pledge AND creates a
        // session cookie (see /api/pledges/verify). No magic-link email
        // needed; sending one would result in two emails landing back-to-back
        // for the same purpose, which is confusing and triggers spam filters.
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Slider position percentage for the custom track fill
  const sliderPercent = ((amount - 0.01) / (5 - 0.01)) * 100;

  // Build the sponsor contact URL with the current pledge details pre-filled.
  // Same shape as the inline celebration card uses — keeps the modal and the
  // card pointing at exactly the same conversion path.
  const modalSectionName = claimedSection
    ? trailSections.find((s) => s.id === claimedSection)?.name
    : undefined;
  const modalSponsorParams = new URLSearchParams();
  modalSponsorParams.set("type", "sponsor");
  modalSponsorParams.set("amount", Math.round(totalPledge).toString());
  if (modalSectionName) modalSponsorParams.set("section", modalSectionName);
  const modalSponsorUrl = `/contact?${modalSponsorParams.toString()}`;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      {/* Sponsorship modal — appears once per session on first cross of $5K.
          Backdrop click + ESC both dismiss; primary CTA routes to the
          pre-filled contact form; secondary just closes the modal so the
          visitor can continue pledging normally. */}
      {sponsorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
          onClick={dismissSponsorModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sponsor-modal-title"
        >
          <div
            className="relative bg-white max-w-[640px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header band — warm orange accent, matches the inline card */}
            <div className="flex items-center justify-between gap-[12px] px-[24px] md:px-[32px] py-[20px] bg-[var(--burnt-orange-light)] border-b-2 border-[var(--burnt-orange)]">
              <div className="flex items-center gap-[10px]">
                <Sparkles className="w-[20px] h-[20px] text-[var(--burnt-orange)] shrink-0" />
                <span className="font-label font-bold text-[11px] md:text-[12px] tracking-[2px] md:tracking-[3px] text-[var(--burnt-orange)]">
                  EXTRAORDINARY COMMITMENT — QUICK QUESTION
                </span>
              </div>
              <button
                type="button"
                onClick={dismissSponsorModal}
                aria-label="Close sponsorship dialog"
                className="flex items-center justify-center w-[32px] h-[32px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-[20px] p-[24px] md:p-[32px]">
              <h2
                id="sponsor-modal-title"
                className="font-heading font-semibold text-[22px] md:text-[28px] tracking-[-0.5px] text-[var(--text-primary)] leading-tight"
              >
                Before you submit — are you representing a company?
              </h2>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                At <strong className="text-[var(--text-primary)]">{formatCurrency(totalPledge)}</strong>, you&apos;re funding thousands of trail miles. If this is on behalf of a business, your sponsorship gets:
              </p>

              <div className="flex flex-col sm:flex-row gap-[20px] items-start">
                <div className="flex flex-col items-center gap-[6px] shrink-0 mx-auto sm:mx-0">
                  <div className="flex items-center justify-center w-[80px] h-[80px] bg-white border-[3px] border-[var(--burnt-orange)] rounded-md shadow-md">
                    <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--burnt-orange)] text-center px-[6px] leading-[1.2]">
                      YOUR<br />LOGO
                    </span>
                  </div>
                  <div className="px-[8px] py-[3px] bg-[var(--burnt-orange)] rounded-sm">
                    <span className="font-label font-bold text-[8px] tracking-[1.2px] text-[var(--text-primary)] whitespace-nowrap">
                      SPONSORED · {(modalSectionName || "YOUR SECTION").toUpperCase()}
                    </span>
                  </div>
                </div>
                <ul className="flex flex-col gap-[8px] flex-1">
                  <li className="flex items-start gap-[10px]">
                    <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                    <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                      Your logo on the live trail map at the section you choose
                    </span>
                  </li>
                  <li className="flex items-start gap-[10px]">
                    <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                    <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                      Linked to your website when visitors tap the pin
                    </span>
                  </li>
                  <li className="flex items-start gap-[10px]">
                    <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                    <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                      A personal photo from Paul when he reaches your section
                    </span>
                  </li>
                </ul>
              </div>

              <p className="font-heading italic text-[13px] leading-[1.6] text-[var(--text-muted)]">
                Pledging as an individual? Just close this and continue — no pressure, both paths are valid.
              </p>

              <div className="flex flex-col gap-[10px]">
                <Link
                  href={modalSponsorUrl}
                  className="flex items-center justify-center gap-[10px] w-full h-[56px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
                >
                  <Building2 className="w-[20px] h-[20px] text-[var(--text-primary)]" />
                  <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
                    TALK SPONSORSHIP →
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={dismissSponsorModal}
                  className="flex items-center justify-center w-full h-[44px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                    CONTINUE AS INDIVIDUAL
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Header />
      <CountdownBanner />

      {/* Two-Stream Banner */}
      <section className="flex flex-col sm:flex-row items-center gap-[16px] sm:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[16px] md:py-[20px] bg-[var(--bg-dark)] w-full">
        <div className="flex items-center gap-[12px]">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
          <span className="font-heading font-semibold text-[14px] text-[var(--text-white)]">
            Pledges go 100% to cancer foundations
          </span>
        </div>
        <div className="hidden sm:block w-[1px] h-[24px] bg-[#FFFFFF33]" />
        <div className="flex items-center gap-[12px]">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--forest-green)] shrink-0" />
          <span className="font-heading font-semibold text-[14px] text-[var(--text-white)]">
            Trail support goes directly to Paul
          </span>
        </div>
        <span className="font-heading italic text-[13px] text-[#FFFFFF88]">
          Two causes. One journey. They never mix.
        </span>
      </section>

      {/* Hero */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[56px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          PLEDGE PER MILE
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] max-w-[800px]">
          Support Paul&apos;s Journey — One Mile at a Time
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[700px]">
          Make a commitment today — pay nothing now. At the end of Paul&apos;s hike, you&apos;ll receive an email reminder to honour your pledge and donate directly to the foundations. 100% goes to cancer research.
        </p>
      </section>

      {/* Calculator */}
      <section className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px] px-6 md:px-12 lg:px-[120px] pb-[48px] md:pb-[64px] bg-[var(--bg-white)] w-full">
        {/* Left — Controls */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[32px] flex-1"
        >
          {/* Amount */}
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-baseline justify-between gap-[8px] flex-wrap">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
                YOUR PLEDGE AMOUNT
              </span>
              <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
                All amounts in US Dollars (USD)
              </span>
            </div>
            <div className="flex items-center justify-center w-full h-[56px] border border-[var(--border-subtle)] bg-[var(--bg-white)]">
              <span className="font-heading text-[32px] font-semibold tracking-[-0.5px] text-[var(--text-primary)]">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]" id="pledge-slider-label">
              ADJUST AMOUNT
            </span>
            <div className="relative w-full h-[8px] mt-[8px] mb-[4px] group has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--burnt-orange)] has-[input:focus-visible]:outline-offset-[10px] has-[input:focus-visible]:rounded-full">
              <div className="absolute inset-0 bg-[var(--warm-stone)] rounded-[4px]" />
              <div
                className="absolute top-0 left-0 h-full bg-[var(--burnt-orange)] rounded-[4px]"
                style={{ width: `${sliderPercent}%` }}
              />
              <input
                type="range"
                min="0.01"
                max="5"
                step="0.01"
                value={amount}
                onChange={handleSliderChange}
                aria-labelledby="pledge-slider-label"
                aria-valuemin={0.01}
                aria-valuemax={5}
                aria-valuenow={amount}
                aria-valuetext={`${formatCurrency(amount)} per mile`}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: "24px", top: "-8px" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[var(--burnt-orange)] border-[3px] border-white shadow-md pointer-events-none"
                style={{ left: `calc(${sliderPercent}% - 12px)` }}
              />
            </div>
            <div className="flex justify-between w-full">
              <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
                $0.01
              </span>
              <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
                $5.00
              </span>
            </div>
          </div>

          {/* Sponsorship awareness banner — always visible, sits right under
              the slider so business reps see the option from the moment they
              start interacting with the form, not after they've filled out
              every field. Subtle by design; the heavy lift happens in the
              celebration card + modal once the slider actually crosses $5K. */}
          <Link
            href="/sponsor-agreement"
            target="_blank"
            className="flex items-center gap-[10px] px-[14px] py-[10px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors"
          >
            <Building2 className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0" />
            <span className="font-heading text-[13px] leading-[1.4] text-[var(--text-secondary)] flex-1">
              <strong className="text-[var(--text-primary)]">Pledging as a company?</strong> Pledges over US$5,000 unlock sponsor section options on the live trail map.
            </span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--burnt-orange)] shrink-0" />
          </Link>

          {/* Quick Pick */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
              QUICK PICK
            </span>
            <div className="flex gap-[12px] w-full">
              {presets.map((p) => {
                const isActive = amount === p.amount;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className={`flex items-center justify-center flex-1 h-[40px] cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]"
                        : "bg-[var(--bg-warm)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)]"
                    }`}
                  >
                    <span
                      className={`font-label font-semibold text-[13px] tracking-[0.5px] ${
                        isActive
                          ? "text-[var(--burnt-orange)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Email */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
              YOUR NAME (OPTIONAL — FOR THE PLEDGER WALL)
            </span>
            <div className="flex items-center w-full h-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <input
                type="text"
                placeholder="Your name (or leave blank for anonymous)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 h-full px-[16px] font-heading text-[15px] italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
              YOUR EMAIL (TO NOTIFY YOU WHEN PAUL FINISHES)
            </span>
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
          </div>

          {/* Message */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
              LEAVE A MESSAGE FOR PAUL (OPTIONAL)
            </span>
            <textarea
              placeholder="Why are you pledging? Your message will appear on the trail map."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full px-[16px] py-[12px] font-heading text-[15px] italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-white)] border border-[var(--border-subtle)] resize-none"
            />
            <span className="font-label text-[11px] text-[var(--text-muted)] text-right">
              {message.length}/280
            </span>
          </div>

          {/* Avatar Picker */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
              YOUR TRAIL AVATAR (SHOWS ON THE MAP)
            </span>
            <div className="flex flex-wrap gap-[10px]">
              {[
                { emoji: "💚", label: "Supporter" },
                { emoji: "🍽️", label: "Trail Meal" },
                { emoji: "🧦", label: "Hiking Socks" },
                { emoji: "⛺", label: "Camp Night" },
                { emoji: "📦", label: "Resupply" },
                { emoji: "🛏️", label: "Rest Day" },
                { emoji: "🥾", label: "Trail Boots" },
                { emoji: "🏃", label: "Runner" },
                { emoji: "🌲", label: "Nature" },
                { emoji: "❤️", label: "Heart" },
              ].map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  title={label}
                  onClick={() => setAvatar(emoji)}
                  className={`flex items-center justify-center w-[44px] h-[44px] text-[22px] transition-all border-2 rounded-full ${
                    avatar === emoji
                      ? "border-[var(--burnt-orange)] bg-[var(--burnt-orange-light)] scale-110"
                      : "border-[var(--border-subtle)] bg-[var(--bg-warm)] hover:border-[var(--burnt-orange)]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <span className="font-label text-[11px] text-[var(--text-muted)]">
              Your avatar will appear as a pin on the trail map.
            </span>
          </div>

          {/* Section Picker — claim a named stretch of the trail */}
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-baseline justify-between gap-[8px] flex-wrap">
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
                CLAIM A TRAIL SECTION (OPTIONAL)
              </span>
              {claimedSection && (
                <button
                  type="button"
                  onClick={() => setClaimedSection(null)}
                  className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--burnt-orange)] hover:underline"
                >
                  CLEAR
                </button>
              )}
            </div>
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              Pick a named stretch of the PCT. When Paul reaches it, your pin shows on the live map. Multiple pledgers can claim the same one — it&apos;s a memento, not exclusive.
            </p>
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-warm)] max-h-[420px] overflow-y-auto rounded-[6px]">
              <div className="sticky top-0 flex items-center justify-between bg-[var(--bg-card)] px-[16px] py-[10px] border-b border-[var(--border-subtle)] z-[1]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                  PICK A SECTION
                </span>
                <span className="font-label font-medium text-[10px] tracking-[1.5px] text-[var(--text-muted)]">
                  {trailSections.length} NAMED LANDMARKS
                </span>
              </div>
              {(Object.keys(sectionsByRegion) as TrailRegion[]).map((region) => (
                <div key={region}>
                  <div className="px-[16px] py-[6px] bg-[var(--bg-warm)] border-b border-[var(--border-subtle)]">
                    <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                      {TRAIL_REGIONS[region].label} · {TRAIL_REGIONS[region].rangeLabel}
                    </span>
                  </div>
                  {sectionsByRegion[region].map((s) => {
                    const selected = claimedSection === s.id;
                    const count = sectionCounts[s.id] || 0;
                    const isFinish = s.id === "manning-park";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setClaimedSection(selected ? null : s.id)}
                        className={`flex items-center justify-between gap-[12px] w-full text-left px-[16px] py-[10px] border-b border-[var(--border-subtle)] transition-colors cursor-pointer ${
                          selected
                            ? "bg-[var(--forest-green-light)]"
                            : isFinish
                              ? "bg-[var(--burnt-orange-light)] hover:bg-[var(--burnt-orange-light)]"
                              : "bg-[var(--bg-white)] hover:bg-[var(--bg-warm)]"
                        }`}
                      >
                        <div className="flex flex-col gap-[2px] min-w-0">
                          <span className={`font-heading text-[15px] ${selected ? "font-bold" : "font-semibold"} text-[var(--text-primary)] truncate`}>
                            {s.name}
                          </span>
                          <span
                            className={`font-label font-bold text-[10px] tracking-[1.5px] truncate ${
                              selected
                                ? "text-[var(--forest-green)]"
                                : isFinish
                                  ? "text-[var(--burnt-orange)]"
                                  : "text-[var(--text-muted)]"
                            }`}
                          >
                            MILE {s.miles.toLocaleString()}
                            {s.subtitle ? ` · ${s.subtitle.toUpperCase()}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-[12px] shrink-0">
                          {count > 0 ? (
                            <span className="font-label font-bold text-[11px] tracking-[1.5px] text-[var(--forest-green)]">
                              {count} pledger{count === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span className="font-label font-semibold italic text-[11px] tracking-[1.5px] text-[var(--text-muted)]">
                              Be the first
                            </span>
                          )}
                          <span
                            className={`flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 ${
                              selected
                                ? "bg-[var(--forest-green)] border-[var(--forest-green)]"
                                : "bg-[var(--bg-white)] border-[var(--border-subtle)]"
                            }`}
                          >
                            {selected && <span className="w-[6px] h-[6px] rounded-full bg-white" />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="font-heading italic text-[12px] text-[var(--text-muted)]">
              No preference? Skip — Paul will assign your pin to a random unclaimed section.
            </p>
          </div>

          {/* Mailing List Opt-in */}
          <label className="flex items-start gap-[12px] cursor-pointer">
            <input
              type="checkbox"
              checked={mailingList}
              onChange={(e) => setMailingList(e.target.checked)}
              className="mt-[3px] w-[18px] h-[18px] accent-[var(--forest-green)] cursor-pointer shrink-0"
            />
            <span className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Keep me updated on Paul&apos;s journey — trail updates, milestones, and progress along the way. No spam, unsubscribe anytime.
            </span>
          </label>

          {/* Submit */}
          {submitError && (
            <div className="flex items-center gap-[8px] bg-red-50 border border-red-200 p-[12px]">
              <span className="font-heading text-[13px] text-red-600">{submitError}</span>
            </div>
          )}

          {/* Honeypot field — hidden from humans, visible to bots */}
          <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
            />
          </div>

          {/* Turnstile CAPTCHA (invisible) */}
          <Turnstile
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
          />

          {submitted && existingPledge ? (
            // 409 path — they already had a pledge. Be honest: their NEW amount
            // wasn't saved. Direct them to the dashboard to manage what they
            // have (or boost it).
            <div className="flex flex-col items-center gap-[14px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] p-[24px]">
              <Mail className="w-[28px] h-[28px] text-[var(--burnt-orange)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--burnt-orange)]">
                You already have a pledge for this email
              </span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
                <strong>{email}</strong> is already pledged at <strong>{existingPledge.rate}</strong> ({formatCurrency(existingPledge.totalPledge)} total), set on {new Date(existingPledge.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
                <br />
                <span className="text-[var(--text-muted)]">
                  Your new amount of {formatCurrency(amount)}/mile was <strong>not saved</strong> — we don&apos;t replace existing pledges from this form.
                </span>
              </p>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
                We&apos;ve sent a <strong>sign-in link</strong> to your inbox. Click it to open your dashboard, where you can review your pledge or <strong>boost</strong> it during a trail challenge.
              </p>
              <Link
                href="/my-pledge"
                className="flex items-center gap-[8px] mt-[4px] px-[24px] py-[12px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
              >
                <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                  GO TO MY DASHBOARD
                </span>
                <ArrowRight className="w-[14px] h-[14px] text-[var(--text-primary)]" />
              </Link>
              <p className="font-heading italic text-[12px] text-[var(--text-muted)] text-center">
                Can&apos;t find the email? Check your spam folder for &ldquo;Sign in to YesChapter&rdquo;.
              </p>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center gap-[12px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[24px]">
              <Mail className="w-[28px] h-[28px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--forest-green)]">
                Almost done — check your email!
              </span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
                We&apos;ve sent a <strong>confirmation link</strong> to <strong>{email}</strong>.
                Clicking it confirms your pledge of {formatCurrency(amount)}/mile ({formatCurrency(totalPledge)} total) and opens your personal dashboard — no password needed.
              </p>
              <p className="font-heading italic text-[12px] text-[var(--text-muted)] text-center">
                Can&apos;t find it? Check your spam folder. The email comes from <strong>paul@yeschapter.com</strong> with the subject &ldquo;Confirm Your Pledge&rdquo;.
              </p>
            </div>
          ) : (
            <>
              {/* High-value sponsorship celebration card. Appears when the
                  running total crosses US$5,000. Designed to:
                    1. Celebrate the commitment (warm, not salesy)
                    2. Surface the sponsorship offer with substance — what
                       the company actually gets, including a small visual
                       mockup of the pin so they can see it's tangible
                    3. Provide two clear paths: primary "TALK SPONSORSHIP"
                       routes to /contact with the pledge details pre-filled,
                       secondary link scrolls down to SET MY PLEDGE for
                       individuals who don't want the sponsorship path.
                  The submit button below stays clickable — both paths are
                  always available, no one is blocked. */}
              {totalPledge >= SPONSOR_CTA_THRESHOLD && (() => {
                const sectionName = claimedSection
                  ? trailSections.find((s) => s.id === claimedSection)?.name
                  : undefined;
                const sponsorContactParams = new URLSearchParams();
                sponsorContactParams.set("type", "sponsor");
                sponsorContactParams.set("amount", Math.round(totalPledge).toString());
                if (sectionName) sponsorContactParams.set("section", sectionName);
                const sponsorContactUrl = `/contact?${sponsorContactParams.toString()}`;
                return (
                  <div className="flex flex-col gap-[20px] bg-[var(--burnt-orange-light)] border-2 border-[var(--burnt-orange)] p-[24px] md:p-[32px]">
                    <div className="flex items-center gap-[10px]">
                      <Sparkles className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
                      <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
                        EXTRAORDINARY COMMITMENT
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-[22px] md:text-[26px] tracking-[-0.5px] text-[var(--text-primary)] leading-tight">
                      Thank you for considering this.
                    </h3>
                    <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                      At <strong className="text-[var(--text-primary)]">{formatCurrency(totalPledge)}</strong>, you&apos;re funding thousands of trail miles. Quick question — are you representing a <strong>company</strong>, or pledging as an <strong>individual</strong>?
                    </p>

                    <div className="flex flex-col sm:flex-row gap-[24px] items-start">
                      {/* Pin mockup — concrete proof of what sponsorship looks like */}
                      <div className="flex flex-col items-center gap-[6px] shrink-0 mx-auto sm:mx-0">
                        <div className="flex items-center justify-center w-[80px] h-[80px] bg-white border-[3px] border-[var(--burnt-orange)] rounded-md shadow-md">
                          <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--burnt-orange)] text-center px-[6px] leading-[1.2]">
                            YOUR<br />LOGO
                          </span>
                        </div>
                        <div className="px-[8px] py-[3px] bg-[var(--burnt-orange)] rounded-sm">
                          <span className="font-label font-bold text-[8px] tracking-[1.2px] text-[var(--text-primary)] whitespace-nowrap">
                            SPONSORED · {(sectionName || "YOUR SECTION").toUpperCase()}
                          </span>
                        </div>
                        <span className="font-heading italic text-[10px] text-[var(--text-muted)] text-center max-w-[160px] mt-[2px]">
                          What it looks like on the{" "}
                          <Link href="/trail-map" target="_blank" className="text-[var(--burnt-orange)] hover:underline not-italic">
                            live map ↗
                          </Link>
                        </span>
                      </div>

                      {/* Bullets */}
                      <div className="flex flex-col gap-[12px] flex-1">
                        <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                          WHAT SPONSORSHIP INCLUDES
                        </span>
                        <ul className="flex flex-col gap-[8px]">
                          <li className="flex items-start gap-[10px]">
                            <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                            <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                              Your logo on the live trail map at the section you choose
                            </span>
                          </li>
                          <li className="flex items-start gap-[10px]">
                            <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                            <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                              Linked to your website when visitors tap the pin
                            </span>
                          </li>
                          <li className="flex items-start gap-[10px]">
                            <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0 mt-[3px]" />
                            <span className="font-heading text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                              A personal photo from Paul when he reaches your section
                            </span>
                          </li>
                        </ul>
                        <Link
                          href="/sponsor-agreement"
                          target="_blank"
                          className="font-heading text-[13px] text-[var(--burnt-orange)] hover:underline self-start"
                        >
                          Full terms on the sponsor agreement →
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[12px]">
                      <Link
                        href={sponsorContactUrl}
                        className="flex items-center justify-center gap-[10px] w-full h-[56px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
                      >
                        <Building2 className="w-[20px] h-[20px] text-[var(--text-primary)]" />
                        <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
                          TALK SPONSORSHIP →
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          document
                            .getElementById("set-my-pledge-btn")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="font-heading text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer self-center"
                      >
                        I&apos;m an individual — pledge below ↓
                      </button>
                    </div>
                  </div>
                );
              })()}

              <button
                id="set-my-pledge-btn"
                type="submit"
                disabled={submitting}
                className={`flex items-center justify-center gap-[10px] h-[56px] w-full transition-opacity ${
                  submitting
                    ? "bg-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
                }`}
              >
                <Heart className="w-[20px] h-[20px] text-[var(--text-white)]" />
                <span className="font-label font-bold text-[15px] tracking-[2px] text-[var(--text-white)]">
                  {submitting ? "REGISTERING..." : "SET MY PLEDGE"}
                </span>
              </button>
            </>
          )}

          <p className="font-heading italic text-[13px] leading-[1.5] text-[var(--text-muted)]">
            <strong className="not-italic text-[var(--text-secondary)]">PLEDGE ONLY — No money is collected today.</strong> This is a promise of intent. At the end of Paul&apos;s hike, you&apos;ll be emailed a reminder to honour your pledge and donate directly to the foundations. Paul never touches this money.{" "}
            <Link href="/journal/how-pledging-works" className="text-[var(--burnt-orange)] not-italic hover:underline">
              How does this work?
            </Link>
          </p>
        </form>

        {/* Right — Live Result */}
        <div className="flex flex-col gap-[24px] w-full lg:w-[420px] shrink-0 bg-[var(--bg-warm)] p-[32px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
            YOUR TOTAL PLEDGE
          </span>
          <span className="font-heading font-semibold text-[64px] tracking-[-1px] text-[var(--text-primary)] leading-[1]">
            {formatCurrency(totalPledge)}
          </span>
          <span className="font-heading italic text-[14px] text-[var(--text-secondary)]">
            if Paul completes all 2,650 miles
          </span>

          <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

          {/* Trail Bar */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-semibold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              TRAIL PROGRESS VISUALIZATION
            </span>
            <div className="relative w-full h-[12px] bg-[var(--warm-stone)] rounded-[6px]">
              <div
                className="absolute top-0 left-0 h-full rounded-[6px]"
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(90deg, var(--forest-green), var(--burnt-orange))",
                }}
              />
            </div>
            <div className="flex justify-between w-full">
              <span className="font-label font-medium text-[10px] tracking-[1px] text-[var(--text-muted)]">
                Campo, CA
              </span>
              <span className="font-label font-medium text-[10px] tracking-[1px] text-[var(--text-muted)]">
                Manning Park, BC
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

          {/* Foundation Split */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              WHERE YOUR PLEDGE GOES
            </span>
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[12px] h-[12px] rounded-full bg-[var(--forest-green)] shrink-0" />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    City of Hope — California, USA
                  </span>
                  <span className="font-label font-semibold text-[12px] tracking-[0.5px] text-[var(--forest-green)]">
                    {formatCurrency(perFoundation)} (50%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[12px] h-[12px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    Leukaemia Foundation — Australia
                  </span>
                  <span className="font-label font-semibold text-[12px] tracking-[0.5px] text-[var(--burnt-orange)]">
                    {formatCurrency(perFoundation)} (50%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

          {/* Equation */}
          <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] p-[20px]">
            <span className="font-heading font-semibold text-[18px] text-[var(--burnt-orange)]">
              {formatCurrency(amount)}/mi × 2,650 miles ={" "}
              {formatCurrency(totalPledge)}
            </span>
            <p className="font-heading text-[13px] leading-[1.5] text-[var(--text-secondary)]">
              Paul receives $0. Every cent goes directly to cancer research and
              patient support.
            </p>
          </div>
        </div>
      </section>

      {/* Distance Tracker */}
      <section className="px-6 md:px-12 lg:px-[120px] py-[32px] md:py-[48px] bg-[var(--bg-white)] w-full max-w-[700px] mx-auto lg:max-w-none">
        <DistanceTracker />
      </section>

      {/* How It Works */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            HOW PLEDGING WORKS
          </span>
          <h2 className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)]">
            Three Simple Steps
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] lg:gap-[32px] w-full">
          {/* Step 1 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] p-[28px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--burnt-orange)]">
              <span className="font-label font-bold text-[18px] text-[var(--text-white)]">
                1
              </span>
            </div>
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
              Set Your Pledge
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Choose how much to pledge per mile. <strong>No payment today</strong> — this is a commitment, not a charge.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] p-[28px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--forest-green)]">
              <span className="font-label font-bold text-[18px] text-[var(--text-white)]">
                2
              </span>
            </div>
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
              Paul Hikes the PCT
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Follow his journey in real-time on the trail map. 2,650 miles from
              Mexico to Canada for cancer awareness.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] p-[28px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--bg-dark)]">
              <span className="font-label font-bold text-[18px] text-[var(--text-white)]">
                3
              </span>
            </div>
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
              Honour Your Pledge at the Finish
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              At the end of Paul&apos;s hike, you&apos;ll receive an email reminder to honour your pledge — donating directly to the foundations. Paul never handles this money.
            </p>
          </div>
        </div>

        {/* Learn More */}
        <div className="flex items-center justify-center">
          <Link
            href="/journal/how-pledging-works"
            className="font-heading text-[15px] text-[var(--burnt-orange)] hover:underline"
          >
            Want the full details? Read our complete guide to how pledging works &rarr;
          </Link>
        </div>

        {/* Extra CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-[16px]">
          <Link
            href="/trail-map"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[12px] hover:border-[var(--burnt-orange)] transition-colors"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
              VIEW TRAIL MAP
            </span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
          <Link
            href="/the-cause"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[12px] hover:border-[var(--burnt-orange)] transition-colors"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
              READ PAUL&apos;S STORY
            </span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
        </div>
      </section>

      {/* Support Paul Cross-sell */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[56px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
        <HeartHandshake className="w-[36px] h-[36px] text-[var(--forest-green)]" />
        <h2 className="font-heading font-semibold text-[22px] text-[var(--text-primary)] text-center max-w-[600px]">
          Already pledged? Support Paul directly on the trail.
        </h2>
        <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[600px]">
          Buy Paul a meal, boots, or a rest day. Trail support goes directly to
          Paul — keeping him on the trail so he can walk for the cause.
        </p>
        <Link
          href="/support"
          className="flex items-center justify-center gap-[10px] bg-[var(--forest-green)] px-[40px] py-[16px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
            SUPPORT PAUL ON THE TRAIL
          </span>
          <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
