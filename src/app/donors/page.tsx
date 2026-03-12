"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronLeft, Users, TrendingUp, Heart, Target } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChallengeBanner from "@/components/ChallengeBanner";
import ScrollReveal from "@/components/ScrollReveal";
import { useDonorData } from "@/hooks/useDonorData";

type SortKey = "RECENT" | "AMOUNT" | "NAME";
const PER_PAGE = 6;

export default function DonorsPage() {
  const { data } = useDonorData();
  const donors = data?.donors ?? [];
  const stats = data?.stats;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("RECENT");
  const [page, setPage] = useState(1);

  const totalRaised = stats?.totalRaised ?? 12450;
  const donorCount = stats?.donorCount ?? 47;
  const averageDonation = stats?.averageDonation ?? 265;
  const largestDonation = stats?.largestDonation ?? 2000;
  const goalAmount = stats?.goalAmount ?? 50000;
  const progressPercent = Math.round((totalRaised / goalAmount) * 100);

  const processed = useMemo(() => {
    let result = [...donors];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.message.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "AMOUNT":
        result.sort((a, b) => b.amountNum - a.amountNum);
        break;
      case "NAME":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "RECENT":
      default:
        break;
    }

    return result;
  }, [donors, search, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Donors" />
      <ChallengeBanner />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[24px] md:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col items-center gap-[16px]">
          <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL SUPPORTERS</span>
          <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            People Who Keep Paul Going
          </h1>
          <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center w-full max-w-[640px]">
            These amazing people have supported Paul directly on the trail — buying meals, gear, and rest days to keep him walking for the cause.
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[20px] md:p-[32px] w-full max-w-[640px]">
          <div className="flex items-end justify-between w-full">
            <div className="flex items-end gap-[8px]">
              <span className="font-heading font-semibold text-[36px] tracking-[-1px] text-[var(--forest-green)]">${totalRaised.toLocaleString("en-US")}</span>
              <span className="font-heading text-[16px] text-[var(--text-secondary)]">raised of ${goalAmount.toLocaleString("en-US")}</span>
            </div>
            <span className="font-label font-bold text-[18px] text-[var(--forest-green)]">{progressPercent}%</span>
          </div>
          <div className="relative w-full h-[12px] bg-[#E8E5E0]">
            <div
              className="absolute top-0 left-0 h-[12px] bg-[var(--forest-green)] transition-all duration-1000"
              style={{ width: `max(12px, ${progressPercent}%)` }}
            />
          </div>
          <div className="flex justify-around w-full">
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">{donorCount}</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">DONORS</span>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">${averageDonation.toLocaleString("en-US")}</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">AVERAGE</span>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">${largestDonation.toLocaleString("en-US")}</span>
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">LARGEST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="flex flex-col sm:flex-row items-center gap-[24px] sm:gap-0 sm:divide-x sm:divide-[var(--border-subtle)] px-6 md:px-12 lg:px-[120px] py-[24px] bg-[var(--bg-card)] border-y border-[var(--border-subtle)] w-full">
        <div className="flex items-center gap-[12px] sm:pr-[40px]">
          <TrendingUp className="w-[20px] h-[20px] text-[var(--forest-green)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              ${totalRaised.toLocaleString("en-US")}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              TOTAL RAISED
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:px-[40px]">
          <Users className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {donorCount}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              DONORS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:px-[40px]">
          <Heart className="w-[20px] h-[20px] text-[var(--forest-green)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              ${averageDonation.toLocaleString("en-US")}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              AVERAGE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:pl-[40px]">
          <Target className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {progressPercent}%
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              OF ${goalAmount.toLocaleString("en-US")} GOAL
            </span>
          </div>
        </div>
      </section>

      {/* Recent Donors */}
      {donors.length > 0 && (
        <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[24px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)] w-full">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            RECENT DONORS
          </span>
          <div className="flex flex-wrap gap-[12px]">
            {donors.slice(0, 8).map((d, i) => (
              <div
                key={`recent-${i}`}
                className="flex items-center gap-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-[16px] py-[10px]"
              >
                <div className="w-[24px] h-[24px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                  {d.name}
                </span>
                <span className="font-heading font-semibold text-[14px] text-[var(--forest-green)]">
                  {d.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-6 md:px-12 lg:px-[120px] py-[16px] bg-[var(--bg-warm)] w-full">
        <div className="flex items-center gap-[10px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px] w-full md:w-auto">
          <Search className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search donors..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent w-full md:w-[180px]"
          />
        </div>
        <div className="flex items-center gap-[12px] flex-wrap">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">SORT BY</span>
          {(["RECENT", "AMOUNT", "NAME"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => { setSort(s); setPage(1); }}
              className={`font-label font-bold text-[11px] tracking-[2px] px-[16px] py-[8px] cursor-pointer transition-colors ${sort === s ? "text-[var(--text-white)] bg-[var(--bg-dark)]" : "text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="font-label font-semibold text-[11px] tracking-[2px] text-[var(--text-muted)] hidden md:inline">
          {processed.length} DONOR{processed.length !== 1 ? "S" : ""}
        </span>
      </div>

      {/* Donor List */}
      <section className="flex flex-col px-6 md:px-12 lg:px-[120px] pb-[48px] md:pb-[80px] bg-[var(--bg-warm)] w-full">
        {/* Desktop Table Header */}
        <div className="hidden md:flex bg-[var(--bg-dark)] px-[20px] py-[12px] w-full">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[60px]">#</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[300px]">DONOR</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[120px]">AMOUNT</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[140px]">DATE</span>
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">MESSAGE</span>
        </div>

        {paged.length === 0 ? (
          <div className="flex flex-col items-center gap-[12px] py-[48px]">
            <span className="font-heading text-[18px] text-[var(--text-muted)]">No donors found</span>
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)] cursor-pointer"
            >
              CLEAR SEARCH
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Rows */}
            {paged.map((d, i) => {
              const rank = (currentPage - 1) * PER_PAGE + i + 1;
              return (
                <div key={d.name + d.date} className={`hidden md:flex items-center px-[20px] py-[16px] border-b border-[var(--border-subtle)] w-full ${i % 2 === 0 ? "bg-[var(--bg-white)]" : "bg-[var(--bg-card)]"}`}>
                  <span className={`font-heading font-semibold text-[16px] w-[60px] ${rank <= 3 ? "text-[var(--burnt-orange)]" : "text-[var(--text-muted)]"}`}>
                    {rank}
                  </span>
                  <div className="flex items-center gap-[12px] w-[300px]">
                    <div className="w-[32px] h-[32px] rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{d.name}</span>
                  </div>
                  <span className="font-heading font-semibold text-[15px] text-[var(--forest-green)] w-[120px]">{d.amount}</span>
                  <span className="font-label font-medium text-[13px] text-[var(--text-muted)] w-[140px]">{d.date}</span>
                  <span className="font-heading italic text-[13px] text-[var(--text-secondary)] flex-1">{d.message}</span>
                </div>
              );
            })}

            {/* Mobile Card Layout */}
            {paged.map((d, i) => (
              <div key={`mobile-${d.name}${d.date}`} className={`flex md:hidden flex-col gap-[8px] p-[16px] border-b border-[var(--border-subtle)] ${i % 2 === 0 ? "bg-[var(--bg-white)]" : "bg-[var(--bg-card)]"}`}>
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
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] pt-[24px] w-full">
            {currentPage > 1 && (
              <button
                onClick={() => setPage(currentPage - 1)}
                className="flex items-center gap-[6px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px] cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
              >
                <ChevronLeft className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
                <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">PREV</span>
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex items-center justify-center w-[40px] h-[40px] cursor-pointer transition-colors ${p === currentPage ? "bg-[var(--bg-dark)]" : "bg-[var(--bg-white)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]"}`}
              >
                <span className={`font-label font-bold text-[13px] ${p === currentPage ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"}`}>{p}</span>
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                onClick={() => setPage(currentPage + 1)}
                className="flex items-center gap-[6px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px] cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
              >
                <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">NEXT</span>
                <ChevronRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
        <ScrollReveal animation="fade-up">
        <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)] text-center">
          Support Paul on the Trail
        </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
        <p className="font-heading text-[16px] text-[var(--text-secondary)] text-center max-w-[500px]">
          Buy Paul a meal, boots, or a rest day. Trail support goes directly to Paul — keeping him on the trail so he can walk for the cause.
        </p>
        </ScrollReveal>
        <div className="flex flex-col sm:flex-row gap-[12px]">
          <Link
            href="/support"
            className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <Heart className="w-[16px] h-[16px] text-[var(--text-white)]" />
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
              SUPPORT PAUL
            </span>
          </Link>
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-card)] transition-colors"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
              OR PLEDGE PER MILE
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
