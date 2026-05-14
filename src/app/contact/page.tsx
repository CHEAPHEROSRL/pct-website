"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Send, Check, Clock, MessageCircle, BookOpen, ShieldCheck, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Turnstile from "@/components/Turnstile";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagePercent = (message.length / 2000) * 100;
  const messageCountColor =
    messagePercent >= 100 ? "text-red-600"
    : messagePercent >= 90 ? "text-amber-600"
    : "text-[var(--text-muted)]";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (message.trim().length < 10) {
      setError("Please write at least a few sentences (10 characters minimum).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          turnstileToken: turnstileToken || "",
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendAnother() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setHoneypot("");
    setSubmitted(false);
    setError(null);
  }

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero — text left, portrait right */}
      <section className="flex flex-col lg:flex-row items-center gap-[32px] lg:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[72px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[16px] flex-1">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            GET IN TOUCH
          </span>
          <h1 className="font-heading font-semibold text-[34px] md:text-[42px] tracking-[-0.5px] text-[var(--text-primary)]">
            Talk to Paul
          </h1>
          <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)] max-w-[640px]">
            Questions about the journey, your pledge, sponsorship, or just want to say hello? Send a message below — Paul reads every one and tries to reply within 48 hours.
          </p>
        </div>
        <div className="relative w-full max-w-[360px] h-[400px] lg:h-[460px] rounded-lg overflow-hidden border border-[var(--border-subtle)] shrink-0">
          <Image
            src="/images/portraits/20251214_133250.jpg"
            alt="Paul Barry on the trail"
            fill
            sizes="(max-width: 1024px) 100vw, 360px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Main: form + aside */}
      <section className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[72px] w-full">
        {/* Form column */}
        <div className="flex flex-col gap-[24px] flex-1 bg-[var(--bg-white)] p-[24px] md:p-[40px] border border-[var(--border-subtle)]">
          {submitted ? (
            <div className="flex flex-col items-center gap-[20px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[32px] md:p-[40px]">
              <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[var(--forest-green)]">
                <Check className="w-[32px] h-[32px] text-white" strokeWidth={3} />
              </div>
              <h2 className="font-heading font-semibold text-[24px] text-[var(--forest-green)] text-center">
                Message sent — thanks!
              </h2>
              <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[440px]">
                Paul reads every message and will reply to your email within 48 hours, usually faster. While you wait, you can pop over to the trail map or read recent journal entries.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-[12px]">
                <Link
                  href="/trail-map"
                  className="flex items-center justify-center gap-[8px] bg-[var(--burnt-orange)] px-[24px] py-[12px] hover:opacity-90 transition-opacity"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                    VIEW TRAIL MAP
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[12px] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                    SEND ANOTHER
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
                  SEND A MESSAGE
                </span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  All fields marked with <span className="text-[var(--burnt-orange)]">*</span> are required. Messages go straight to Paul&apos;s inbox.
                </p>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-[8px]">
                <label htmlFor="contact-name" className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
                  YOUR NAME <span className="text-[var(--burnt-orange)]">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Hiker"
                  className="w-full h-[48px] px-[16px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:italic bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)] focus:ring-2 focus:ring-[var(--burnt-orange)] focus:ring-offset-0"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-[8px]">
                <label htmlFor="contact-email" className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
                  YOUR EMAIL <span className="text-[var(--burnt-orange)]">*</span>
                </label>
                <div className="flex items-center w-full h-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus-within:border-[var(--burnt-orange)] focus-within:ring-2 focus-within:ring-[var(--burnt-orange)]">
                  <Mail className="w-[18px] h-[18px] text-[var(--text-muted)] ml-[16px] shrink-0" />
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="flex-1 h-full px-[12px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:italic bg-transparent outline-none"
                  />
                </div>
                <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
                  Paul will reply to this address. We never share it.
                </span>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-[8px]">
                <label htmlFor="contact-subject" className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
                  SUBJECT <span className="text-[var(--burnt-orange)]">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={120}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Pledge question — when do I honour my pledge?"
                  className="w-full h-[48px] px-[16px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:italic bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)] focus:ring-2 focus:ring-[var(--burnt-orange)] focus:ring-offset-0"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-[8px]">
                <label htmlFor="contact-message" className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
                  YOUR MESSAGE <span className="text-[var(--burnt-orange)]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  maxLength={2000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi Paul, my pledge is going great! Quick question..."
                  className="w-full px-[16px] py-[14px] font-heading text-[15px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:italic bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)] focus:ring-2 focus:ring-[var(--burnt-orange)] focus:ring-offset-0 resize-none"
                />
                <div className="flex justify-between gap-[8px] flex-wrap">
                  <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
                    Keep it focused — Paul replies faster to shorter messages.
                  </span>
                  <span className={`font-label font-semibold text-[11px] tracking-[0.5px] ${messageCountColor}`}>
                    {message.length} / 2000
                  </span>
                </div>
              </div>

              {/* Honeypot — hidden from humans, visible to bots */}
              <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                <label htmlFor="contact-website">Website</label>
                <input
                  type="text"
                  id="contact-website"
                  name="website"
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                />
              </div>

              {/* Turnstile (invisible) */}
              <Turnstile
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />

              {error && (
                <div className="flex items-center gap-[10px] bg-red-50 border border-red-200 p-[14px]">
                  <span className="font-heading text-[13px] text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`flex items-center justify-center gap-[10px] h-[56px] w-full transition-opacity ${
                  submitting
                    ? "bg-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--burnt-orange)] cursor-pointer hover:opacity-90"
                }`}
              >
                <Send className="w-[20px] h-[20px] text-white" />
                <span className="font-label font-bold text-[15px] tracking-[2px] text-white">
                  {submitting ? "SENDING..." : "SEND MESSAGE"}
                </span>
              </button>

              <p className="font-heading italic text-[11px] leading-[1.6] text-[var(--text-muted)]">
                Protected by Cloudflare Turnstile (invisible). Messages go straight to Paul&apos;s Gmail. We only store them temporarily if email dispatch fails, so nothing gets lost.
              </p>
            </form>
          )}
        </div>

        {/* Aside */}
        <div className="flex flex-col gap-[20px] w-full lg:w-[400px] shrink-0">
          {/* Direct email card */}
          <div className="flex flex-col gap-[12px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] p-[24px] md:p-[28px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--forest-green)]">
              OR EMAIL DIRECTLY
            </span>
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
              Prefer your own mail client?
            </h3>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Tap the address below to open it in your email app. Same inbox as the form.
            </p>
            <a
              href="mailto:paul@yeschapter.com"
              className="flex items-center gap-[10px] w-full bg-white border border-[var(--forest-green)] px-[16px] py-[14px] hover:bg-[var(--forest-green-light)] transition-colors"
            >
              <Mail className="w-[18px] h-[18px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[15px] text-[var(--forest-green)]">
                paul@yeschapter.com
              </span>
            </a>
          </div>

          {/* What to expect */}
          <div className="flex flex-col gap-[20px] bg-white border border-[var(--border-subtle)] p-[24px] md:p-[28px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
              WHAT TO EXPECT
            </span>

            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <Clock className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0" />
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                  Response time
                </span>
              </div>
              <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                Usually within 48 hours. Slower while Paul is on a long trail stretch with no signal — please be patient.
              </p>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <MessageCircle className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0" />
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                  What Paul handles
                </span>
              </div>
              <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                Pledge questions, sponsorship inquiries, press / media, general hello. Trail safety emergencies — please contact local authorities, not this form.
              </p>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <BookOpen className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0" />
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                  Pledge-specific questions
                </span>
              </div>
              <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                Many common questions are already answered in the{" "}
                <Link href="/journal/how-pledging-works" className="text-[var(--burnt-orange)] hover:underline">
                  How Pledging Works
                </Link>{" "}
                guide.
              </p>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <Building2 className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0" />
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                  Sponsorship inquiries
                </span>
              </div>
              <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                Read the{" "}
                <Link href="/sponsor-agreement" className="text-[var(--burnt-orange)] hover:underline">
                  Sponsor Agreement
                </Link>{" "}
                first — it covers the basics, and Paul can skip to specifics.
              </p>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex flex-col gap-[10px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[20px] md:p-[24px]">
            <div className="flex items-center gap-[10px]">
              <ShieldCheck className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                Privacy
              </span>
            </div>
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              Your message goes straight to Paul&apos;s Gmail. Nothing is stored on YesChapter servers unless the email send fails — in which case it&apos;s retained for 7 days so Paul can recover it.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
