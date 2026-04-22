"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Preference = "all" | "milestones" | "finish";

type SubscriberType = "pledger" | "waitlist";

interface PledgerData {
  type: "pledger";
  name: string;
  email: string;
  emailPreference: Preference;
}

interface WaitlistData {
  type: "waitlist";
  name: string;
  email: string;
  subscribed: boolean;
}

type SubscriberData = PledgerData | WaitlistData;

const TIERS: { value: Preference; label: string; desc: string }[] = [
  {
    value: "all",
    label: "ALL UPDATES",
    desc: "Weekly progress, milestones, nudges, challenges, community milestones — everything.",
  },
  {
    value: "milestones",
    label: "MILESTONES ONLY",
    desc: "Major milestones (500mi, 1000mi, halfway, state crossings) + near-finish + honour reminders.",
  },
  {
    value: "finish",
    label: "FINISH ONLY",
    desc: "Only the \"Paul made it to Canada\" email and honour reminders when it's time to donate.",
  },
];

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const action = searchParams.get("action") || "";

  const [data, setData] = useState<SubscriberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback email-recovery form state (shown when no token)
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySending, setRecoverySending] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      // No token: we don't show an error, we show the email recovery form.
      setLoading(false);
      return;
    }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.error) {
          setError(resp.error);
          return;
        }
        if (resp.type === "pledger") {
          setData({
            type: "pledger",
            name: resp.name,
            email: resp.email,
            emailPreference: resp.emailPreference || "all",
          });
          // If they clicked the "unsubscribe" link variant, auto-demote them
          if (action === "unsubscribe" && resp.emailPreference !== "finish") {
            handleSavePledgerPreference("finish");
          }
        } else if (resp.type === "waitlist") {
          setData({
            type: "waitlist",
            name: resp.name,
            email: resp.email,
            subscribed: !!resp.subscribed,
          });
        }
      })
      .catch(() => setError("Failed to load preferences."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, action]);

  const handleSavePledgerPreference = async (pref: Preference) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, preference: pref }),
      });
      if (res.ok) {
        setData((d) =>
          d && d.type === "pledger" ? { ...d, emailPreference: pref } : d
        );
        setSaved(true);
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleWaitlistUnsubscribe = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, preference: "unsubscribe" }),
      });
      if (res.ok) {
        setData((d) =>
          d && d.type === "waitlist" ? { ...d, subscribed: false } : d
        );
        setSaved(true);
      } else {
        setError("Failed to unsubscribe. Please try again.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRecoveryLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || recoverySending) return;
    setRecoverySending(true);
    setRecoveryError(null);
    setRecoverySent(false);
    try {
      const res = await fetch("/api/unsubscribe/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      const resp = await res.json();
      if (res.ok) {
        setRecoverySent(true);
      } else {
        setRecoveryError(resp.error || "Could not send link. Please try again.");
      }
    } catch {
      setRecoveryError("Network error. Please try again.");
    } finally {
      setRecoverySending(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-dark)] text-center w-full">
        <Mail className="w-[28px] h-[28px] text-white opacity-60" />
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-white">
          Email Preferences
        </h1>
        <p className="font-heading text-[15px] text-[#FFFFFFBB] max-w-[500px] leading-[1.6]">
          Choose how often you hear from YesChapter. Honour reminders are always sent regardless of preference.
        </p>
      </section>

      <section className="flex flex-col items-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full">
        {loading ? (
          <p className="font-heading text-[15px] text-[var(--text-muted)]">Loading...</p>
        ) : error ? (
          <div className="flex items-center gap-[12px] p-[20px] bg-red-50 border border-red-200 max-w-[500px] w-full">
            <AlertCircle className="w-[20px] h-[20px] text-red-500 shrink-0" />
            <span className="font-heading text-[14px] text-red-600">{error}</span>
          </div>
        ) : !token ? (
          // ─── NO TOKEN: show email recovery form ──────────────────
          <div className="flex flex-col gap-[20px] max-w-[500px] w-full">
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)] text-center">
              Enter your email and we&apos;ll send you a link to manage your subscription or unsubscribe.
            </p>
            {recoverySent ? (
              <div className="flex flex-col gap-[10px] p-[20px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]">
                <div className="flex items-center gap-[10px]">
                  <CheckCircle className="w-[20px] h-[20px] text-[var(--forest-green)]" />
                  <span className="font-heading font-semibold text-[15px] text-[var(--forest-green)]">
                    Check your inbox
                  </span>
                </div>
                <p className="font-heading text-[13px] leading-[1.5] text-[var(--text-secondary)]">
                  If an account exists for that email, we&apos;ve sent a manage-subscription link. It may take a minute to arrive — check spam too.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestRecoveryLink} className="flex flex-col gap-[12px]">
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] focus:border-[var(--burnt-orange)] transition-colors"
                />
                {recoveryError && (
                  <p className="font-heading text-[13px] text-red-600">{recoveryError}</p>
                )}
                <button
                  type="submit"
                  disabled={recoverySending}
                  className="flex items-center justify-center gap-[8px] h-[48px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="w-[16px] h-[16px] text-white" />
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                    {recoverySending ? "SENDING..." : "SEND ME A LINK"}
                  </span>
                </button>
              </form>
            )}
            <p className="font-heading text-[12px] text-[var(--text-muted)] text-center leading-[1.6]">
              If you landed here from an email link, go back and click the link again — sometimes email clients strip the URL parameters.
            </p>
          </div>
        ) : data?.type === "waitlist" ? (
          // ─── WAITLIST SUBSCRIBER ─────────────────────────────────
          <div className="flex flex-col gap-[20px] max-w-[500px] w-full">
            <div className="flex flex-col gap-[6px] text-center">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                WAITLIST SUBSCRIBER
              </span>
              <p className="font-heading text-[15px] text-[var(--text-secondary)]">
                {data.email}
              </p>
            </div>

            {saved && !data.subscribed ? (
              <div className="flex flex-col gap-[10px] p-[20px] bg-[var(--forest-green-light)] border border-[var(--forest-green)] text-center">
                <CheckCircle className="w-[24px] h-[24px] text-[var(--forest-green)] mx-auto" />
                <p className="font-heading font-semibold text-[16px] text-[var(--forest-green)]">
                  You&apos;ve been unsubscribed
                </p>
                <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                  You won&apos;t receive any more emails from YesChapter. Sorry to see you go.
                </p>
              </div>
            ) : data.subscribed ? (
              <>
                <div className="flex items-start gap-[12px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                  <CheckCircle className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0 mt-[2px]" />
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                      You&apos;re subscribed
                    </span>
                    <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                      You&apos;ll receive new journal post notifications as Paul publishes them.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleWaitlistUnsubscribe}
                  disabled={saving}
                  className="flex items-center justify-center gap-[8px] h-[48px] border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-red-600">
                    {saving ? "UNSUBSCRIBING..." : "UNSUBSCRIBE"}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-[10px] p-[20px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] text-center">
                <p className="font-heading text-[14px] text-[var(--text-secondary)]">
                  You&apos;re already unsubscribed from this email list.
                </p>
              </div>
            )}
          </div>
        ) : data?.type === "pledger" ? (
          // ─── PLEDGER ────────────────────────────────────────────
          <div className="flex flex-col gap-[20px] max-w-[500px] w-full">
            {data.name && (
              <p className="font-heading text-[15px] text-[var(--text-secondary)] text-center">
                Preferences for <strong>{data.name}</strong>
              </p>
            )}

            {saved && (
              <div className="flex items-center justify-center gap-[8px] p-[14px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]">
                <CheckCircle className="w-[18px] h-[18px] text-[var(--forest-green)]" />
                <span className="font-heading text-[14px] text-[var(--forest-green)] font-semibold">Preferences saved!</span>
              </div>
            )}

            {TIERS.map((tier) => (
              <button
                key={tier.value}
                onClick={() => handleSavePledgerPreference(tier.value)}
                disabled={saving}
                className={`flex flex-col gap-[8px] p-[24px] border text-left transition-colors cursor-pointer ${
                  data.emailPreference === tier.value
                    ? "border-[var(--forest-green)] bg-[var(--forest-green-light)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                    {tier.label}
                  </span>
                  {data.emailPreference === tier.value && (
                    <CheckCircle className="w-[18px] h-[18px] text-[var(--forest-green)]" />
                  )}
                </div>
                <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                  {tier.desc}
                </p>
              </button>
            ))}

            <p className="font-heading text-[12px] text-[var(--text-muted)] text-center leading-[1.6] mt-[8px]">
              Honour reminders (at the end of Paul&apos;s hike) are always sent so you can fulfil your pledge — these cannot be turned off.
            </p>
          </div>
        ) : null}
      </section>

      <Footer />
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col w-full bg-[var(--bg-warm)]">
          <Header />
          <div className="py-[120px] text-center">
            <p className="font-heading text-[var(--text-muted)]">Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
