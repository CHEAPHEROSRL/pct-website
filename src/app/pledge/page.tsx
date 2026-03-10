"use client";

import { useState, useCallback } from "react";
import { Heart, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TOTAL_MILES = 2650;

const intervals = [
  { label: "Every Mile", value: 1 },
  { label: "Every 10 Miles", value: 10 },
  { label: "Every 100 Miles", value: 100 },
] as const;

const presets = [
  { label: "1¢/mi", amount: 0.01, interval: 1 },
  { label: "10¢/mi", amount: 0.1, interval: 1 },
  { label: "25¢/mi", amount: 0.25, interval: 1 },
  { label: "$1/mi", amount: 1, interval: 1 },
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
  const [intervalValue, setIntervalValue] = useState<number>(1);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalPledge = (amount * TOTAL_MILES) / intervalValue;
  const perFoundation = totalPledge / 2;

  const perMileEquivalent = amount / intervalValue;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(parseFloat(e.target.value));
    },
    []
  );

  const handleAmountStep = useCallback(
    (direction: "up" | "down") => {
      setAmount((prev) => {
        const step = prev < 0.1 ? 0.01 : prev < 1 ? 0.05 : 0.25;
        const next = direction === "up" ? prev + step : prev - step;
        return Math.max(0.01, Math.min(5, parseFloat(next.toFixed(2))));
      });
    },
    []
  );

  const handlePreset = useCallback(
    (preset: (typeof presets)[number]) => {
      setAmount(preset.amount);
      setIntervalValue(preset.interval);
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  // Slider position percentage for the custom track fill
  const sliderPercent = ((amount - 0.01) / (5 - 0.01)) * 100;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[56px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          PLEDGE PER MILE
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] max-w-[800px]">
          Support Paul&apos;s Journey — One Mile at a Time
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[700px]">
          Set a pledge per mile. Pay nothing now. When Paul reaches Canada,
          you&apos;ll be invited to donate your total — 100% goes to cancer
          foundations.
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
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={() => handleAmountStep("down")}
                className="flex items-center justify-center w-[48px] h-[56px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--warm-stone)] transition-colors select-none"
              >
                <span className="font-heading text-[24px] font-semibold text-[var(--text-primary)]">
                  −
                </span>
              </button>
              <div className="flex items-center justify-center flex-1 h-[56px] border-t border-b border-[var(--border-subtle)] bg-[var(--bg-white)]">
                <span className="font-heading text-[32px] font-semibold tracking-[-0.5px] text-[var(--text-primary)]">
                  {formatCurrency(amount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAmountStep("up")}
                className="flex items-center justify-center w-[48px] h-[56px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] cursor-pointer hover:opacity-80 transition-opacity select-none"
              >
                <span className="font-heading text-[24px] font-semibold text-[var(--burnt-orange)]">
                  +
                </span>
              </button>
            </div>
          </div>

          {/* Interval */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
              PLEDGE INTERVAL
            </span>
            <div className="flex w-full">
              {intervals.map((int) => (
                <button
                  key={int.value}
                  type="button"
                  onClick={() => setIntervalValue(int.value)}
                  className={`flex items-center justify-center flex-1 h-[48px] cursor-pointer transition-colors ${
                    intervalValue === int.value
                      ? "bg-[var(--burnt-orange)] border border-[var(--burnt-orange)]"
                      : "bg-[var(--bg-white)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)]"
                  }`}
                >
                  <span
                    className={`font-label font-semibold text-[13px] tracking-[1px] ${
                      intervalValue === int.value
                        ? "text-[var(--text-white)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {int.label}
                  </span>
                </button>
              ))}
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
                const isActive =
                  amount === p.amount && intervalValue === p.interval;
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

          {/* Email */}
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

          {/* Submit */}
          {submitted ? (
            <div className="flex flex-col items-center gap-[12px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[24px]">
              <Heart className="w-[28px] h-[28px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--forest-green)]">
                Pledge Registered!
              </span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center leading-[1.6]">
                We&apos;ll email you at <strong>{email}</strong> when Paul
                reaches Canada. Your pledge: {formatCurrency(perMileEquivalent)}
                /mile = {formatCurrency(totalPledge)} total.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center justify-center gap-[10px] h-[56px] w-full bg-[var(--forest-green)] cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Heart className="w-[20px] h-[20px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[15px] tracking-[2px] text-[var(--text-white)]">
                SET MY PLEDGE
              </span>
            </button>
          )}

          <p className="font-heading italic text-[13px] leading-[1.5] text-[var(--text-muted)]">
            No payment is collected. This is a pledge of intent. When Paul
            reaches Canada, you&apos;ll receive an email to donate directly to
            the foundations.
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
              {formatCurrency(perMileEquivalent)}/mi × 2,650 miles ={" "}
              {formatCurrency(totalPledge)}
            </span>
            <p className="font-heading text-[13px] leading-[1.5] text-[var(--text-secondary)]">
              Paul receives $0. Every cent goes directly to cancer research and
              patient support.
            </p>
          </div>
        </div>
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
              Choose how much to pledge per mile. No account needed — just your
              email so we can reach you.
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
              Donate at the Finish
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              When Paul reaches Canada, you&apos;ll get a video + email inviting
              you to donate your pledge — 50/50 to two cancer foundations.
            </p>
          </div>
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

      <Footer />
    </div>
  );
}
