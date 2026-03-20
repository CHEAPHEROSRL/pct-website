"use client";

import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

export default function WaitlistPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or signed up this session
    if (sessionStorage.getItem("waitlist-dismissed")) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("waitlist-dismissed", "1");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire up to an API route or email service
    console.log("Waitlist signup:", email);
    setSubmitted(true);
    sessionStorage.setItem("waitlist-dismissed", "1");
  }

  if (dismissed || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="relative bg-[var(--bg-white)] border border-[var(--border-subtle)] shadow-2xl w-full max-w-[460px] p-8 md:p-10 pointer-events-auto animate-fade-up">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

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
              <button
                onClick={handleDismiss}
                className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-2 cursor-pointer"
              >
                CLOSE
              </button>
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
                <button
                  type="submit"
                  className="w-full bg-[var(--burnt-orange)] px-6 py-3 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-primary)]">
                    NOTIFY ME
                  </span>
                </button>
              </form>

              <button
                onClick={handleDismiss}
                className="font-heading text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                No thanks, I&apos;ll check back later
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
