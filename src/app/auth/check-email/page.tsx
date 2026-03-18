"use client";

import { useState, FormEvent } from "react";
import { Mail, Timer, ShieldCheck, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CheckEmailPage() {
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || resending) return;
    setResending(true);
    try {
      await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setResent(true);
    } catch {
      // Silently fail
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Dark hero */}
      <section className="flex flex-col items-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-dark)] w-full text-center">
        <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-white/10">
          <Mail className="w-[36px] h-[36px] text-[var(--burnt-orange)]" />
        </div>
        <span className="font-label font-bold text-[12px] tracking-[3px] text-white/70">
          CHECK YOUR INBOX
        </span>
        <h1 className="font-heading font-semibold text-[40px] md:text-[48px] tracking-[-0.5px] text-white">
          Magic link sent.
        </h1>
        <p className="font-heading text-[18px] leading-[1.6] text-white/75 max-w-[560px]">
          We sent a sign-in link to your email address.
          Click it to open your personal pledge dashboard — no password needed.
        </p>
      </section>

      {/* Info cards */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col md:flex-row gap-[24px] w-full max-w-[900px] justify-center">
          <div className="flex flex-col items-center gap-[10px] bg-[var(--bg-warm)] p-[24px] flex-1 text-center">
            <Mail className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">Check your email</span>
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              Open the email from paul@yeschapter.com and click the link inside.
            </p>
          </div>
          <div className="flex flex-col items-center gap-[10px] bg-[var(--bg-warm)] p-[24px] flex-1 text-center">
            <Timer className="w-[24px] h-[24px] text-[var(--text-muted)]" />
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">Link expires in 15 min</span>
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              If it expires, just come back here and request a new one. Takes 5 seconds.
            </p>
          </div>
          <div className="flex flex-col items-center gap-[10px] bg-[var(--bg-warm)] p-[24px] flex-1 text-center">
            <ShieldCheck className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">No password, ever</span>
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              Your email is your identity. The link is your key. Nothing to remember.
            </p>
          </div>
        </div>

        {/* Resend */}
        <div className="flex flex-col items-center gap-[12px] mt-[8px]">
          <p className="font-heading text-[14px] text-[var(--text-muted)] text-center">
            Didn&apos;t get it? Check your spam folder, or request a new link.
          </p>
          {resent ? (
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--forest-green)]">
              NEW LINK SENT — CHECK YOUR INBOX
            </span>
          ) : (
            <form onSubmit={handleResend} className="flex items-center gap-[8px]">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[var(--border-subtle)] px-[14px] py-[10px] font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent w-[220px]"
              />
              <button
                type="submit"
                disabled={resending}
                className="px-[20px] py-[10px] bg-[var(--forest-green)] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                  {resending ? "SENDING..." : "RESEND"}
                </span>
              </button>
            </form>
          )}
        </div>

        <Link href="/my-pledge" className="flex items-center gap-[6px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mt-[8px]">
          <ArrowLeft className="w-[14px] h-[14px]" />
          <span className="font-label font-bold text-[12px] tracking-[2px]">BACK TO MY PLEDGE</span>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
