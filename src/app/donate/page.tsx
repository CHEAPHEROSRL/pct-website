import Link from "next/link";
import { Mountain, Heart, Check, Lock } from "lucide-react";
import MobileNav from "@/components/MobileNav";

export default function DonatePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 lg:px-[80px] py-[16px] md:py-[20px] bg-[#FFFFFFEE] w-full relative z-50">
        <Link href="/" className="flex items-center gap-[12px]">
          <Mountain className="w-[28px] h-[28px] text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[16px] tracking-[3px] text-[var(--text-primary)]">PAUL BARRY</span>
          <span className="font-label font-medium text-[11px] tracking-[2px] text-[var(--text-muted)] hidden sm:inline">PCT 2026</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-[40px]">
          <Link href="/" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">The Journey</Link>
          <Link href="/trail-map" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Trail Map</Link>
          <Link href="/the-cause" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">The Cause</Link>
          <Link href="/journal" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Journal</Link>
          <Link href="/donors" className="font-heading text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Donors</Link>
          <Link href="/donate" className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        </nav>
        <MobileNav />
      </header>

      {/* Main Content */}
      <section className="flex flex-col lg:flex-row gap-[32px] lg:gap-[64px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        {/* Form Side */}
        <div className="flex flex-col gap-[32px] flex-1">
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
            {["$25", "$50", "$100", "$250", "Other"].map((amt) => (
              <div key={amt} className={`flex items-center justify-center h-[48px] md:h-[56px] ${amt === "$100" ? "bg-[var(--burnt-orange)]" : "border border-[var(--border-subtle)]"}`}>
                <span className={`font-heading ${amt === "Other" ? "text-[16px] font-normal" : "text-[20px] font-semibold"} ${amt === "$100" ? "text-[var(--text-white)]" : amt === "Other" ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                  {amt}
                </span>
              </div>
            ))}
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-[20px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">YOUR INFORMATION</span>
            <div className="flex flex-col sm:flex-row gap-[16px] w-full">
              <div className="flex flex-col gap-[6px] flex-1">
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">First Name</span>
                <input type="text" placeholder="John" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
              <div className="flex flex-col gap-[6px] flex-1">
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Last Name</span>
                <input type="text" placeholder="Doe" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Email Address</span>
              <input type="email" placeholder="john@example.com" className="h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Leave a Message (Optional)</span>
              <textarea placeholder="Share a word of encouragement for Paul..." className="h-[100px] px-[16px] py-[12px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none w-full" />
            </div>
            <div className="flex items-center gap-[10px]">
              <div className="w-[20px] h-[20px] border border-[var(--border-subtle)]" />
              <span className="font-heading text-[14px] text-[var(--text-secondary)]">Make my donation anonymous</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-center gap-[10px] h-[56px] bg-[var(--burnt-orange)] w-full cursor-pointer hover:opacity-90 transition-opacity">
            <span className="font-label font-bold text-[16px] tracking-[2px] text-[var(--text-white)]">DONATE $100</span>
            <Heart className="w-[18px] h-[18px] text-[var(--text-white)]" />
          </div>
          <div className="flex items-center justify-center gap-[8px]">
            <Lock className="w-[14px] h-[14px] text-[var(--text-muted)]" />
            <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">Secure payment processed by Stripe</span>
          </div>
        </div>

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

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-6 md:px-12 lg:px-[120px] py-[24px] md:py-[32px] bg-[var(--bg-dark)] w-full">
        <div className="flex items-center gap-[12px]">
          <Mountain className="w-[20px] h-[20px] text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[14px] tracking-[3px] text-[var(--text-white)]">PAUL BARRY</span>
        </div>
        <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[#FFFFFF55]">&copy; 2026 Paul Barry PCT Walk for Cancer</span>
      </footer>
    </div>
  );
}
