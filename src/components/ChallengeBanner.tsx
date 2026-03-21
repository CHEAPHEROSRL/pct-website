"use client";

import { useState, useEffect, FormEvent } from "react";
import { Zap, Clock, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import type { ChallengePublic } from "@/lib/types";

function formatTimeLeft(deadline: number): string {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${mins}m left`;
}

export default function ChallengeBanner({ belowFixedHeader }: { belowFixedHeader?: boolean }) {
  const [challenge, setChallenge] = useState<ChallengePublic | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [boostAmount, setBoostAmount] = useState("0.05");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch active challenge
  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch("/api/challenges");
        if (res.ok) {
          const data = await res.json();
          setChallenge(data.active);
        }
      } catch {
        // Silently fail — banner just won't show
      }
    }
    fetchChallenge();
    const interval = setInterval(fetchChallenge, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!challenge) return;
    const update = () => setTimeLeft(formatTimeLeft(challenge.deadline));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) return null;

  const progress = Math.max(0, challenge.current - challenge.start);
  const progressPercent = Math.min(100, (progress / challenge.target) * 100);

  // For location/custom challenges with target=1, show simpler display
  const isSimpleChallenge =
    (challenge.challengeType === "location" || challenge.challengeType === "custom") &&
    challenge.target === 1;

  const handleBoostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/challenges/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          boostAmount: parseFloat(boostAmount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        setEmail("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full bg-[var(--bg-dark)] text-white ${belowFixedHeader ? "relative z-40" : ""}`}>
      {/* Compact bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-6 md:px-12 lg:px-[120px] py-[12px] cursor-pointer hover:bg-[#252825] transition-colors"
      >
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[8px] h-[8px] rounded-full bg-red-500 animate-pulse" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-red-400">
              LIVE
            </span>
          </div>
          <Zap className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
          <span className="font-heading font-semibold text-[14px] text-white">
            {challenge.title}
          </span>
        </div>

        <div className="flex items-center gap-[16px]">
          <div className="hidden md:flex items-center gap-[8px]">
            <TrendingUp className="w-[14px] h-[14px] text-[var(--forest-green)]" />
            <span className="font-label font-medium text-[12px] text-gray-300">
              {isSimpleChallenge
                ? (challenge.current >= challenge.target ? "Complete" : "In progress")
                : `${progress.toFixed(1)} / ${challenge.target} ${challenge.unit}`
              }
            </span>
          </div>
          <div className="hidden md:flex items-center gap-[8px]">
            <Clock className="w-[14px] h-[14px] text-gray-400" />
            <span className="font-label font-medium text-[12px] text-gray-300">
              {timeLeft}
            </span>
          </div>
          <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--burnt-orange)]">
            BOOST YOUR PLEDGE
          </span>
          {expanded ? (
            <ChevronUp className="w-[16px] h-[16px] text-gray-400" />
          ) : (
            <ChevronDown className="w-[16px] h-[16px] text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] pb-[20px]">
          {/* Progress bar */}
          {!isSimpleChallenge && (
            <div className="flex flex-col gap-[6px]">
              <div className="relative w-full h-[6px] bg-[#333]">
                <div
                  className="absolute top-0 left-0 h-[6px] bg-[var(--burnt-orange)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="font-label text-[10px] text-gray-500">
                  {challenge.start} {challenge.unit}
                </span>
                <span className="font-label text-[10px] text-gray-500">
                  {challenge.start + challenge.target} {challenge.unit}
                </span>
              </div>
            </div>
          )}

          {challenge.description && (
            <p className="font-heading text-[13px] text-gray-300 leading-[1.5] max-w-[600px]">
              {challenge.description}
            </p>
          )}

          {/* Boost form */}
          {result ? (
            <div className="flex items-center gap-[10px] bg-[var(--forest-green)] bg-opacity-20 px-[16px] py-[12px]">
              <span className="font-heading text-[14px] text-[var(--forest-green)]">
                {result}
              </span>
            </div>
          ) : (
            <form onSubmit={handleBoostSubmit} className="flex flex-col sm:flex-row gap-[10px] max-w-[700px]">
              <input
                type="email"
                required
                placeholder="Your pledge email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-[40px] px-[14px] bg-[#2A2D28] font-heading text-[14px] text-white placeholder:text-gray-500 outline-none"
              />
              <div className="flex items-center h-[40px] bg-[#2A2D28] px-[14px] gap-[6px]">
                <span className="font-heading text-[14px] text-gray-400">+$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={boostAmount}
                  onChange={(e) => setBoostAmount(e.target.value)}
                  className="w-[60px] h-full bg-transparent font-heading text-[14px] text-white outline-none"
                />
                <span className="font-heading text-[14px] text-gray-400">/mi</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-[6px] h-[40px] px-[20px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-[14px] h-[14px] text-white" />
                <span className="font-label font-bold text-[11px] tracking-[2px] text-white">
                  {submitting ? "..." : "COMMIT BOOST"}
                </span>
              </button>
            </form>
          )}

          {error && (
            <span className="font-heading text-[13px] text-red-400">
              {error}
            </span>
          )}

          <span className="font-heading text-[11px] text-gray-500">
            {challenge.commitmentCount} pledger{challenge.commitmentCount !== 1 ? "s" : ""} committed to boost if Paul succeeds. Your boost only applies if the challenge succeeds.
          </span>
        </div>
      )}
    </div>
  );
}
