"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";

export default function WaitlistPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already signed up, don't show popup but keep blur off
    if (localStorage.getItem("waitlist-signed-up")) {
      setSubmitted(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Apply blur to the page content behind the popup
  useEffect(() => {
    const body = document.body;
    if (visible && !submitted) {
      body.style.overflow = "hidden";
      // Blur the main page content
      const main = document.getElementById("page-content");
      if (main) {
        main.style.filter = "blur(6px)";
        main.style.pointerEvents = "none";
        main.style.userSelect = "none";
      }
    } else {
      body.style.overflow = "";
      const main = document.getElementById("page-content");
      if (main) {
        main.style.filter = "";
        main.style.pointerEvents = "";
        main.style.userSelect = "";
      }
    }
  }, [visible, submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      localStorage.setItem("waitlist-signed-up", "1");
    } catch {
      setError("Could not connect. Please try again.");
      setSubmitting(false);
    }
  }

  // Already signed up — no popup, no blur
  if (submitted) return null;

  // Not yet visible (waiting 2s)
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/40">
      <div className="relative bg-[var(--bg-white)] border border-[var(--border-subtle)] shadow-2xl w-full max-w-[460px] p-8 md:p-10 animate-fade-up">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--forest-green-light)] flex items-center justify-center">
              <Mail className="w-6 h-6 text-[var(--forest-green)]" />
            </div>
            <h3 className="font-heading font-semibold text-[22px] text-[var(--text-primary)]">
              You&apos;re on the list!
            </h3>
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Thanks for signing up. I&apos;ll let you know as soon as the full site goes live.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
                COMING SOON
              </span>
              <h3 className="font-heading font-semibold text-[22px] md:text-[26px] leading-[1.2] text-[var(--text-primary)]">
                The site isn&apos;t quite ready yet
              </h3>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                I&apos;m still putting the finishing touches on everything. Drop your email below and I&apos;ll send you a heads-up the moment it&apos;s live — no spam, just one email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--burnt-orange)] transition-colors"
              />
              {error && (
                <p className="font-heading text-[13px] text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--burnt-orange)] px-6 py-3 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-primary)]">
                  {submitting ? "SIGNING UP..." : "NOTIFY ME"}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
