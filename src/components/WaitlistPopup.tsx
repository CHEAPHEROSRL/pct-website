"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";

// Pages that should NOT show the waitlist popup (admin, API routes, etc.)
const EXCLUDED_PATHS = ["/admin", "/site-login"];

function hasAdminCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("pct-admin-session="));
}

function hasSiteAuthCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("site-auth="));
}

function hasAdminLocalStorageToken(): boolean {
  try {
    return !!localStorage.getItem("pct-admin-token");
  } catch {
    return false;
  }
}

export default function WaitlistPopup() {
  const [visible, setVisible] = useState(false);
  const [excluded, setExcluded] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Skip popup on admin and other excluded pages
    if (EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p))) {
      setExcluded(true);
      return;
    }

    // Skip popup for logged-in admins (cookie or localStorage token) and site-auth users
    if (hasAdminCookie() || hasSiteAuthCookie() || hasAdminLocalStorageToken()) {
      setExcluded(true);
      return;
    }

    if (localStorage.getItem("waitlist-signed-up")) {
      setSubmitted(true);
    }

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Always blur the page content — site is not published yet
  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = "hidden";
    const main = document.getElementById("page-content");
    if (main) {
      main.style.filter = "blur(6px)";
      main.style.pointerEvents = "none";
      main.style.userSelect = "none";
    }
  }, [visible]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;
    if (!consent) {
      setError("Please tick the box to confirm you agree to receive email updates.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true }),
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

  // Skip on excluded pages or not yet visible
  if (excluded || !visible) return null;

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
                PREPARE FOR A JOURNEY
              </span>
              <h3 className="font-heading font-semibold text-[22px] md:text-[26px] leading-[1.2] text-[var(--text-primary)]">
                This is more than a launch.{"\n"}It&apos;s a new chapter.
              </h3>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                Be the first to know.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--burnt-orange)] transition-colors"
              />

              {/* Explicit consent checkbox — GDPR-compliant opt-in */}
              <label className="flex items-start gap-[10px] cursor-pointer select-none py-[2px]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked && error) setError("");
                  }}
                  className="mt-[3px] w-[16px] h-[16px] accent-[var(--burnt-orange)] shrink-0 cursor-pointer"
                />
                <span className="font-heading text-[13px] leading-[1.5] text-[var(--text-secondary)]">
                  I agree to receive email updates from YesChapter. You can unsubscribe at any time.
                </span>
              </label>

              {error && (
                <p className="font-heading text-[13px] text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !consent}
                className="w-full bg-[var(--burnt-orange)] px-6 py-3 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-primary)]">
                  {submitting ? "JOINING..." : "I'M IN!"}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
