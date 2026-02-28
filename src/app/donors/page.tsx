import Link from "next/link";
import { Mountain, Heart, Search, ChevronRight } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const donors = [
  { name: "Robert Williams", amount: "$1,000", date: "Feb 15, 2026", message: "Go Paul! My father fought cancer for 3 years. Walk strong.", color: "#3D7A5A" },
  { name: "Anonymous", amount: "$2,000", date: "Feb 12, 2026", message: "In memory of Susan. Keep walking.", color: "#5B8EA6" },
  { name: "Dr. Amanda Brooks", amount: "$750", date: "Feb 10, 2026", message: "As an oncologist, this cause is close to my heart.", color: "#C45C26" },
  { name: "James O'Connor", amount: "$500", date: "Feb 8, 2026", message: "Walk on, brother. The world needs more people like you.", color: "#7B6B8E" },
  { name: "Sarah Mitchell", amount: "$250", date: "Feb 5, 2026", message: "For my mom, a 5-year survivor. You're an inspiration.", color: "#A68B5B" },
  { name: "Tom & Lisa Park", amount: "$300", date: "Feb 1, 2026", message: "We're cheering for you from Oregon!", color: "#6B8E7B" },
];

export default function DonorsPage() {
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
          <span className="font-heading text-[15px] font-semibold text-[var(--burnt-orange)]">Donors</span>
          <Link href="/donate" className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[28px] py-[12px] hover:opacity-90 transition-opacity">
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        </nav>
        <MobileNav activeItem="Donors" />
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center gap-[24px] md:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">DONOR WALL</span>
          <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            People Who Make This Possible
          </h1>
          <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center w-full max-w-[640px]">
            Every donation fuels another mile. Thank you to everyone who has contributed to Paul&apos;s journey and the fight against cancer.
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[20px] md:p-[32px] w-full max-w-[640px]">
          <div className="flex items-end justify-between w-full">
            <div className="flex items-end gap-[8px]">
              <span className="font-heading font-semibold text-[36px] tracking-[-1px] text-[var(--forest-green)]">$12,450</span>
              <span className="font-heading text-[16px] text-[var(--text-secondary)]">raised of $50,000</span>
            </div>
            <span className="font-label font-bold text-[18px] text-[var(--forest-green)]">25%</span>
          </div>
          <div className="relative w-full h-[12px] bg-[#E8E5E0]">
            <div className="absolute top-0 left-0 h-[12px] bg-[var(--forest-green)] w-[144px]" />
          </div>
          <div className="flex justify-around w-full">
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">47</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">DONORS</span>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">$265</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">AVERAGE</span>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">$2,000</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">LARGEST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-6 md:px-12 lg:px-[120px] py-[16px] bg-[var(--bg-warm)] w-full">
        <div className="flex items-center gap-[10px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px] w-full md:w-auto">
          <Search className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <span className="font-heading text-[14px] text-[var(--text-muted)]">Search donors...</span>
        </div>
        <div className="flex items-center gap-[12px] flex-wrap">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">SORT BY</span>
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)] bg-[var(--bg-dark)] px-[16px] py-[8px]">RECENT</span>
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)] border border-[var(--border-subtle)] px-[16px] py-[8px]">AMOUNT</span>
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)] border border-[var(--border-subtle)] px-[16px] py-[8px]">NAME</span>
        </div>
        <span className="font-label font-semibold text-[11px] tracking-[2px] text-[var(--text-muted)] hidden md:inline">47 DONORS</span>
      </div>

      {/* Donor List */}
      <section className="flex flex-col px-6 md:px-12 lg:px-[120px] pb-[48px] md:pb-[80px] bg-[var(--bg-warm)] w-full">
        {/* Desktop Table Header */}
        <div className="hidden md:flex bg-[var(--bg-dark)] px-[20px] py-[12px] w-full">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[360px]">DONOR</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[120px]">AMOUNT</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[140px]">DATE</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">MESSAGE</span>
        </div>

        {/* Desktop Rows */}
        {donors.map((d, i) => (
          <div key={i} className={`hidden md:flex items-center px-[20px] py-[16px] border-b border-[var(--border-subtle)] w-full ${i % 2 === 0 ? "bg-[var(--bg-white)]" : "bg-[var(--bg-card)]"}`}>
            <div className="flex items-center gap-[12px] w-[360px]">
              <div className="w-[32px] h-[32px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{d.name}</span>
            </div>
            <span className="font-heading font-semibold text-[15px] text-[var(--forest-green)] w-[120px]">{d.amount}</span>
            <span className="font-label font-medium text-[13px] text-[var(--text-muted)] w-[140px]">{d.date}</span>
            <span className="font-heading italic text-[13px] text-[var(--text-secondary)] flex-1">{d.message}</span>
          </div>
        ))}

        {/* Mobile Card Layout */}
        {donors.map((d, i) => (
          <div key={`mobile-${i}`} className={`flex md:hidden flex-col gap-[8px] p-[16px] border-b border-[var(--border-subtle)] ${i % 2 === 0 ? "bg-[var(--bg-white)]" : "bg-[var(--bg-card)]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[32px] h-[32px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{d.name}</span>
              </div>
              <span className="font-heading font-semibold text-[15px] text-[var(--forest-green)]">{d.amount}</span>
            </div>
            <p className="font-heading italic text-[13px] text-[var(--text-secondary)]">{d.message}</p>
            <span className="font-label font-medium text-[11px] text-[var(--text-muted)]">{d.date}</span>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-[8px] pt-[24px] w-full">
          <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--bg-dark)]">
            <span className="font-label font-bold text-[13px] text-[var(--text-white)]">1</span>
          </div>
          <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
            <span className="font-label font-semibold text-[13px] text-[var(--text-secondary)]">2</span>
          </div>
          <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
            <span className="font-label font-semibold text-[13px] text-[var(--text-secondary)]">3</span>
          </div>
          <div className="flex items-center gap-[6px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px]">
            <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">NEXT</span>
            <ChevronRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
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
        <div className="flex gap-[16px]">
          <span className="font-label text-[13px] text-[var(--text-muted)]">IG</span>
          <span className="font-label text-[13px] text-[var(--text-muted)]">YT</span>
          <span className="font-label text-[13px] text-[var(--text-muted)]">X</span>
        </div>
      </footer>
    </div>
  );
}
