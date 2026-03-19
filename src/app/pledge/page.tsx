"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Heart, Mail, ArrowRight, HeartHandshake } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DistanceTracker from "@/components/DistanceTracker";
import CountdownBanner from "@/components/CountdownBanner";
import Turnstile from "@/components/Turnstile";

const TOTAL_MILES = 2650;

const presets = [
  { label: "1¢/mi", amount: 0.01 },
  { label: "10¢/mi", amount: 0.1 },
  { label: "25¢/mi", amount: 0.25 },
  { label: "$1/mi", amount: 1 },
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [avatar, setAvatar] = useState<string>("💚");

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

  const totalPledge = amount * TOTAL_MILES;
  const perFoundation = totalPledge / 2;

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
          turnstileToken: turnstileToken || "",
          website: honeypot, // honeypot field
          ...geoRef.current,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Already pledged — still show success
        setSubmitted(true);
        // Send magic link so they can access dashboard
        fetch("/api/auth/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: name || undefined }),
        }).catch(() => {});
      } else if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
        // Automatically send magic sign-in link so new pledger can access their dashboard
        fetch("/api/auth/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: name || undefined }),
        }).catch(() => {});
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Slider position percentage for the custom track fill
  const sliderPercent = ((amount - 0.01) / (5 - 0.01)) * 100;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
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
          Make a commitment today — pay nothing now. When Paul reaches Canada, you&apos;ll receive an email reminder to honour your pledge and donate directly to the foundations. 100% goes to cancer research.
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
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
              YOUR PLEDGE AMOUNT
            </span>
            <div className="flex items-center justify-center w-full h-[56px] border border-[var(--border-subtle)] bg-[var(--bg-white)]">
              <span className="font-heading text-[32px] font-semibold tracking-[-0.5px] text-[var(--text-primary)]">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
              ADJUST AMOUNT
            </span>
            <div className="relative w-full h-[8px] mt-[8px] mb-[4px]">
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

          {submitted ? (
            <div className="flex flex-col items-center gap-[12px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[24px]">
              <Mail className="w-[28px] h-[28px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--forest-green)]">
                Pledge set — check your email!
              </span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
                We&apos;ve emailed <strong>{email}</strong> a magic sign-in link.
                Click it to open your personal pledge dashboard — no password needed.
                Your pledge: {formatCurrency(amount)}/mile ({formatCurrency(totalPledge)} total).
              </p>
            </div>
          ) : (
            <button
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
          )}

          <p className="font-heading italic text-[13px] leading-[1.5] text-[var(--text-muted)]">
            <strong className="not-italic text-[var(--text-secondary)]">PLEDGE ONLY — No money is collected today.</strong> This is a promise of intent. When Paul finishes the trail, you&apos;ll be emailed a reminder to honour your pledge and donate directly to the foundations. Paul never touches this money.{" "}
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
                    Cancer Foundation — California
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
                    Cancer Foundation — Sydney, Australia
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
              When Paul reaches Canada, you&apos;ll receive an email reminder to honour your pledge — donating directly to the foundations. Paul never handles this money.
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
