"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Heart, Check, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const presetAmounts = [25, 50, 100, 250];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | "other">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const displayAmount =
    selectedAmount === "other"
      ? customAmount
        ? `$${customAmount}`
        : "$0"
      : `$${selectedAmount}`;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header />
        <section className="flex flex-col items-center justify-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[80px] md:py-[120px] bg-[var(--bg-white)] w-full">
          <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--forest-green)] rounded-full">
            <Heart className="w-[28px] h-[28px] text-white" />
          </div>
          <h1 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            Thank You for Your Generosity!
          </h1>
          <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[520px]">
            Your {displayAmount} donation will make a real difference in the fight against cancer.
            Paul will carry your support with every step on the trail.
          </p>
          <Link
            href="/"
            className="flex items-center justify-center gap-[10px] h-[48px] px-[32px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity mt-[16px]"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              BACK TO HOME
            </span>
          </Link>
        </section>
        <Footer />
      </div>
    );
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
                <input type="text" required placeholder="John" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
              <div className="flex flex-col gap-[6px] flex-1">
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Last Name</span>
                <input type="text" required placeholder="Doe" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Email Address</span>
              <input type="email" required placeholder="john@example.com" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Leave a Message (Optional)</span>
              <textarea placeholder="Share a word of encouragement for Paul..." className="h-[100px] px-[16px] py-[12px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none w-full" />
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

          {/* Submit */}
          <button
            type="submit"
            className="flex items-center justify-center gap-[10px] h-[56px] bg-[var(--burnt-orange)] w-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[16px] tracking-[2px] text-[var(--text-white)]">DONATE {displayAmount}</span>
            <Heart className="w-[18px] h-[18px] text-[var(--text-white)]" />
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
              <span className="font-heading font-semibold text-[32px] tracking-[-1px] text-[var(--forest-green)]">$12,450</span>
              <span className="font-heading text-[16px] text-[var(--text-secondary)]">of $50,000</span>
            </div>
            <div className="relative w-full h-[10px] bg-[#E8E5E0]">
              <div className="absolute top-0 left-0 h-[10px] bg-[var(--forest-green)] w-[91px]" />
            </div>
            <div className="flex justify-between w-full">
              <span className="font-label font-medium text-[12px] text-[var(--text-muted)]">47 donors</span>
              <span className="font-label font-semibold text-[12px] text-[var(--forest-green)]">25% funded</span>
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
            {[
              { name: "Sarah Mitchell", info: "$250 · 2 hours ago", color: "#3D7A5A" },
              { name: "Anonymous", info: "$100 · 5 hours ago", color: "#7B6B8E" },
              { name: "Tom & Lisa Park", info: "$300 · 1 day ago", color: "#C45C26" },
            ].map((d) => (
              <div key={d.name + d.info} className="flex items-center gap-[10px]">
                <div className="w-[28px] h-[28px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex flex-col gap-[1px]">
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">{d.name}</span>
                  <span className="font-label font-medium text-[10px] tracking-[0.5px] text-[var(--text-muted)]">{d.info}</span>
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
