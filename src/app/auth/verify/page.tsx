"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader, CircleX, LogIn } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

/**
 * Magic-link verify page.
 *
 * Renders a "Sign In" button that the user must click. The click does a
 * fetch POST to /api/auth/verify which atomically consumes the token,
 * creates the session, sets the cookie, and returns the redirect target.
 *
 * Why a button (not auto-redirect): email link scanners (Gmail safe-browse,
 * Outlook ATP, corporate spam filters) often pre-fetch URLs in emails to
 * check for malware. Many run JavaScript. The previous auto-redirect via
 * router.replace was being followed by these scanners — burning the
 * one-time token before the actual user clicked. The user would then see
 * "Link expired" because the scanner had already consumed it.
 *
 * Scanners don't simulate user clicks. An explicit button that triggers
 * the consume on click is the industry-standard fix.
 */

function VerifyContent() {
  const params = useSearchParams();
  const error = params.get("error");
  const token = params.get("token");
  const redirectParam = params.get("redirect") || "/my-pledge";

  const initialStatus: "idle" | "submitting" | "error" =
    error || !token ? "error" : "idle";
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(initialStatus);
  const [errorReason, setErrorReason] = useState<string | null>(error);

  async function handleSignIn() {
    if (!token || status === "submitting") return;
    setStatus("submitting");
    setErrorReason(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, redirect: redirectParam }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && typeof data.redirect === "string") {
        // Use window.location so the browser follows with the new cookie
        // applied to subsequent requests on the destination page.
        window.location.href = data.redirect;
        return;
      }
      setStatus("error");
      setErrorReason(data.reason || "expired");
    } catch {
      setStatus("error");
      setErrorReason("network");
    }
  }

  // ── Error states ─────────────────────────────────────────────
  if (status === "error" || (!token && !error)) {
    const isNetwork = errorReason === "network";
    const isMissing = errorReason === "missing" || (!token && !error);
    return (
      <div className="flex flex-col items-center gap-[24px] px-6 py-[120px] bg-[var(--bg-white)] w-full text-center">
        <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-red-50">
          <CircleX className="w-[32px] h-[32px] text-red-600" />
        </div>
        <h2 className="font-heading font-semibold text-[28px] md:text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
          {isNetwork
            ? "Network error"
            : isMissing
            ? "No sign-in link"
            : "Link expired or already used"}
        </h2>
        <p className="font-heading text-[15px] md:text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[460px]">
          {isNetwork
            ? "We couldn't reach the server. Check your connection and try again."
            : isMissing
            ? "This page needs a magic-link token in the URL. Request a new sign-in link to continue."
            : "Magic links are valid for 15 minutes and only work once. Request a new one and try again — it'll arrive in your inbox in a moment."}
        </p>
        <div className="flex flex-col sm:flex-row gap-[12px]">
          {isNetwork && token && (
            <button
              onClick={handleSignIn}
              className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
                TRY AGAIN
              </span>
            </button>
          )}
          <Link
            href="/my-pledge"
            className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
              GET A NEW LINK
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Submitting state ────────────────────────────────────────
  if (status === "submitting") {
    return (
      <div className="flex flex-col items-center gap-[24px] px-6 py-[120px] bg-[var(--bg-white)] w-full text-center">
        <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[var(--forest-green-light)]">
          <Loader className="w-[32px] h-[32px] text-[var(--forest-green)] animate-spin" />
        </div>
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
          SIGNING YOU IN
        </span>
        <h2 className="font-heading font-semibold text-[28px] md:text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
          One moment…
        </h2>
      </div>
    );
  }

  // ── Idle state — show the Sign In button ────────────────────
  return (
    <div className="flex flex-col items-center gap-[24px] px-6 py-[120px] bg-[var(--bg-white)] w-full text-center">
      <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[var(--forest-green-light)]">
        <LogIn className="w-[32px] h-[32px] text-[var(--forest-green)]" />
      </div>
      <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
        SIGN IN
      </span>
      <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
        Welcome back
      </h2>
      <p className="font-heading text-[15px] md:text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[460px]">
        Click below to sign in and view your pledge.
      </p>
      <button
        onClick={handleSignIn}
        className="flex items-center justify-center gap-[10px] bg-[var(--forest-green)] px-[40px] py-[16px] hover:opacity-90 transition-opacity cursor-pointer"
      >
        <LogIn className="w-[18px] h-[18px] text-white" />
        <span className="font-label font-bold text-[14px] tracking-[2px] text-white">
          SIGN IN
        </span>
      </button>
      <p className="font-heading text-[12px] text-[var(--text-muted)] max-w-[420px] leading-[1.5]">
        You&apos;re seeing this button instead of an automatic redirect because some
        email apps preview links — clicking is what tells us it&apos;s really you.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-[120px] bg-[var(--bg-white)] w-full">
            <Loader className="w-[32px] h-[32px] text-[var(--forest-green)] animate-spin" />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
