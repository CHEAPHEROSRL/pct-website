"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Heart, Check, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { DonorPublic, DonationStats } from "@/lib/types";

const presetAmounts = [25, 50, 100, 250];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | "other">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live donor data for sidebar
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [recentDonors, setRecentDonors] = useState<DonorPublic[]>([]);

  useEffect(() => {
    fetch("/api/donors")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.donors) setRecentDonors(data.donors.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const displayAmount =
    selectedAmount === "other"
      ? customAmount
        ? `$${customAmount}`
        : "$0"
      : `$${selectedAmount}`;

  const totalRaised = stats?.totalRaised ?? 12450;
  const donorCount = stats?.donorCount ?? 47;
  const goalAmount = stats?.goalAmount ?? 50000;
  const progressPercent = Math.round((totalRaised / goalAmount) * 100);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const amount =
      selectedAmount === "other" ? Number(customAmount) : selectedAmount;

    if (!amount || amount < 1) {
      setError("Please enter a valid donation amount.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          message: formData.get("message") || "",
          anonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Main Content */}
      <section className="flex flex-col lg:flex-row gap-[32px] lg:gap-[64px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        {/* Form Side */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[32px] flex-1">
          {/* Header */}
          <div className="flex flex-col gap-[12px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">SUPPORT THE CAUSE</span>
            <h1 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)]">Make a Donation</h1>
            <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)]">
              100% of your donation goes directly to cancer research, patient support, and prevention education programs.
            </p>
          </div>

          {/* Amount Selection */}
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">CHOOSE AN AMOUNT</span>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-[12px] w-full">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`flex items-center justify-center h-[48px] md:h-[56px] cursor-pointer transition-colors ${selectedAmount === amt ? "bg-[var(--burnt-orange)]" : "border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)]"}`}
              >
                <span className={`font-heading text-[20px] font-semibold ${selectedAmount === amt ? "text-[var(--text-white)]" : "text-[var(--text-primary)]"}`}>
                  ${amt}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedAmount("other")}
              className={`flex items-center justify-center h-[48px] md:h-[56px] cursor-pointer transition-colors ${selectedAmount === "other" ? "bg-[var(--burnt-orange)]" : "border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)]"}`}
            >
              <span className={`font-heading text-[16px] font-normal ${selectedAmount === "other" ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"}`}>
                Other
              </span>
            </button>
          </div>
          {selectedAmount === "other" && (
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Custom Amount</span>
              <div className="flex items-center h-[48px] border border-[var(--border-subtle)]">
                <span className="flex items-center justify-center w-[48px] h-full bg-[var(--bg-warm)] border-r border-[var(--border-subtle)] font-heading font-semibold text-[18px] text-[var(--text-muted)]">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 h-full px-[16px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="flex flex-col gap-[20px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">YOUR INFORMATION</span>
            <div className="flex flex-col sm:flex-row gap-[16px] w-full">
              <div className="flex flex-col gap-[6px] flex-1">
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">First Name</span>
                <input type="text" name="firstName" required placeholder="John" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
              <div className="flex flex-col gap-[6px] flex-1">
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Last Name</span>
                <input type="text" name="lastName" required placeholder="Doe" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Email Address</span>
              <input type="email" name="email" required placeholder="john@example.com" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Leave a Message (Optional)</span>
              <textarea name="message" placeholder="Share a word of encouragement for Paul..." className="h-[100px] px-[16px] py-[12px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none w-full" />
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className="flex items-center gap-[10px] cursor-pointer"
            >
              <div className={`flex items-center justify-center w-[20px] h-[20px] border ${anonymous ? "bg-[var(--forest-green)] border-[var(--forest-green)]" : "border-[var(--border-subtle)]"} transition-colors`}>
                {anonymous && <Check className="w-[14px] h-[14px] text-white" />}
              </div>
              <span className="font-heading text-[14px] text-[var(--text-secondary)]">Make my donation anonymous</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-[8px] bg-red-50 border border-red-200 px-[16px] py-[12px]">
              <span className="font-heading text-[14px] text-red-700">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-[10px] h-[56px] w-full transition-opacity ${
              loading
                ? "bg-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--burnt-orange)] cursor-pointer hover:opacity-90"
            }`}
          >
            <span className="font-label font-bold text-[16px] tracking-[2px] text-[var(--text-white)]">
              {loading ? "REDIRECTING TO PAYMENT..." : `DONATE ${displayAmount}`}
            </span>
            {!loading && <Heart className="w-[18px] h-[18px] text-[var(--text-white)]" />}
          </button>
          <div className="flex items-center justify-center gap-[8px]">
            <Lock className="w-[14px] h-[14px] text-[var(--text-muted)]" />
            <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">Secure payment processed by Stripe</span>
          </div>
        </form>

        {/* Info Side */}
        <div className="flex flex-col gap-[24px] w-full lg:w-[420px] shrink-0">
          {/* Progress */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">FUNDRAISING PROGRESS</span>
            <div className="flex items-end gap-[8px]">
              <span className="font-heading font-semibold text-[32px] tracking-[-1px] text-[var(--forest-green)]">
                ${totalRaised.toLocaleString()}
              </span>
              <span className="font-heading text-[16px] text-[var(--text-secondary)]">of ${goalAmount.toLocaleString()}</span>
            </div>
            <div className="relative w-full h-[10px] bg-[#E8E5E0]">
              <div
                className="absolute top-0 left-0 h-[10px] bg-[var(--forest-green)] transition-all duration-1000"
                style={{ width: `max(10px, ${progressPercent}%)` }}
              />
            </div>
            <div className="flex justify-between w-full">
              <span className="font-label font-medium text-[12px] text-[var(--text-muted)]">{donorCount} donors</span>
              <span className="font-label font-semibold text-[12px] text-[var(--forest-green)]">{progressPercent}% funded</span>
            </div>
          </div>

          {/* Impact */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">YOUR IMPACT</span>
            {[
              "$25 funds one day of trail meals",
              "$100 supports a cancer screening event",
              "$250 funds prevention education workshops",
              "$500 supports a cancer survivor family",
            ].map((text) => (
              <div key={text} className="flex items-center gap-[12px]">
                <Check className="w-[16px] h-[16px] text-[var(--forest-green)] shrink-0" />
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">{text}</span>
              </div>
            ))}
          </div>

          {/* Recent Donors */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">RECENT DONORS</span>
            {(recentDonors.length > 0
              ? recentDonors
              : [
                  { name: "Sarah Mitchell", amount: "$250", date: "2 hours ago", color: "#3D7A5A", amountNum: 250, message: "" },
                  { name: "Anonymous", amount: "$100", date: "5 hours ago", color: "#7B6B8E", amountNum: 100, message: "" },
                  { name: "Tom & Lisa Park", amount: "$300", date: "1 day ago", color: "#C45C26", amountNum: 300, message: "" },
                ]
            ).map((d, i) => (
              <div key={d.name + i} className="flex items-center gap-[10px]">
                <div className="w-[28px] h-[28px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex flex-col gap-[1px]">
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">{d.name}</span>
                  <span className="font-label font-medium text-[10px] tracking-[0.5px] text-[var(--text-muted)]">{d.amount} · {d.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
