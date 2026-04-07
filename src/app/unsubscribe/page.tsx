"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Preference = "all" | "milestones" | "finish";

const TIERS: { value: Preference; label: string; desc: string }[] = [
  {
    value: "all",
    label: "ALL UPDATES",
    desc: "Weekly progress, milestones, nudges, challenges, community milestones — everything.",
  },
  {
    value: "milestones",
    label: "MILESTONES ONLY",
    desc: "Major milestones (500mi, 1000mi, halfway, state crossings) + near-finish + honor reminders.",
  },
  {
    value: "finish",
    label: "FINISH ONLY",
    desc: "Only the \"Paul made it to Canada\" email and honor reminders when it's time to donate.",
  },
];

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const action = searchParams.get("action") || "";

  const [name, setName] = useState("");
  const [preference, setPreference] = useState<Preference>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No token provided. Use the link from your email.");
      setLoading(false);
      return;
    }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setName(data.name);
          setPreference(data.emailPreference || "all");
          // Auto-set to finish-only if they clicked unsubscribe
          if (action === "unsubscribe") {
            setPreference("finish");
          }
        }
      })
      .catch(() => setError("Failed to load preferences."))
      .finally(() => setLoading(false));
  }, [token, action]);

  const handleSave = async (pref: Preference) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, preference: pref }),
      });
      if (res.ok) {
        setPreference(pref);
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

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-dark)] text-center w-full">
        <Mail className="w-[28px] h-[28px] text-white opacity-60" />
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-white">
          Email Preferences
        </h1>
        <p className="font-heading text-[15px] text-[#FFFFFFBB] max-w-[500px] leading-[1.6]">
          Choose how often you hear from YesChapter. Honor reminders are always sent regardless of preference.
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
        ) : (
          <div className="flex flex-col gap-[20px] max-w-[500px] w-full">
            {name && (
              <p className="font-heading text-[15px] text-[var(--text-secondary)] text-center">
                Preferences for <strong>{name}</strong>
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
                onClick={() => handleSave(tier.value)}
                disabled={saving}
                className={`flex flex-col gap-[8px] p-[24px] border text-left transition-colors cursor-pointer ${
                  preference === tier.value
                    ? "border-[var(--forest-green)] bg-[var(--forest-green-light)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                    {tier.label}
                  </span>
                  {preference === tier.value && (
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
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="flex flex-col w-full bg-[var(--bg-warm)]"><Header /><div className="py-[120px] text-center"><p className="font-heading text-[var(--text-muted)]">Loading...</p></div><Footer /></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
