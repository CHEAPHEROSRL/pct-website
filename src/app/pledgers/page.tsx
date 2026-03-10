"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Zap,
  Trophy,
  Heart,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChallengeBanner from "@/components/ChallengeBanner";
import type { PledgePublic, PledgeStats, ChallengePublic } from "@/lib/types";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PledgersPage() {
  const [stats, setStats] = useState<PledgeStats | null>(null);
  const [topPledgers, setTopPledgers] = useState<PledgePublic[]>([]);
  const [challenges, setChallenges] = useState<ChallengePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pledgeRes, challengeRes] = await Promise.all([
          fetch("/api/pledges/stats"),
          fetch("/api/challenges"),
        ]);

        if (pledgeRes.ok) {
          const data = await pledgeRes.json();
          setStats(data.stats);
          setTopPledgers(data.topPledgers || []);
        }

        if (challengeRes.ok) {
          const data = await challengeRes.json();
          setChallenges(data.history || []);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const succeededChallenges = challenges.filter((c) => c.status === "succeeded");

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <ChallengeBanner />

      {/* Hero */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[56px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          PLEDGER WALL
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
          People Walking With Paul
        </h1>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[650px]">
          Every mile Paul walks, these pledgers are right there with him — turning
          steps into dollars for cancer research and patient support.
        </p>
      </section>

      {/* Stats Bar */}
      <section className="flex flex-col sm:flex-row items-center gap-[24px] sm:gap-0 sm:divide-x sm:divide-[var(--border-subtle)] px-6 md:px-12 lg:px-[120px] py-[24px] bg-[var(--bg-card)] border-y border-[var(--border-subtle)] w-full">
        <div className="flex items-center gap-[12px] sm:pr-[40px]">
          <Users className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {stats?.pledgerCount ?? 0}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              PLEDGERS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:px-[40px]">
          <TrendingUp className="w-[20px] h-[20px] text-[var(--forest-green)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {formatCurrency(stats?.totalPledged ?? 0)}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              TOTAL PLEDGED
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:px-[40px]">
          <Trophy className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {succeededChallenges.length}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              CHALLENGES WON
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] sm:pl-[40px]">
          <Zap className="w-[20px] h-[20px] text-[var(--forest-green)]" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)] leading-[1]">
              {stats?.totalBoosts ?? 0}
            </span>
            <span className="font-label text-[11px] tracking-[1px] text-[var(--text-muted)]">
              BOOSTS
            </span>
          </div>
        </div>
      </section>

      {/* Top Pledgers Table */}
      <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] w-full">
        <div className="flex items-center justify-between">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            TOP PLEDGERS
          </span>
          <span className="font-heading text-[13px] text-[var(--text-muted)]">
            Ranked by total pledge if Paul completes the PCT
          </span>
        </div>

        <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          {/* Table header */}
          <div className="hidden md:flex items-center px-[24px] py-[12px] bg-[var(--warm-stone)] border-b border-[var(--border-subtle)]">
            <span className="w-[60px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              RANK
            </span>
            <span className="flex-1 font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              NAME
            </span>
            <span className="w-[160px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              RATE
            </span>
            <span className="w-[140px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              BOOSTS
            </span>
            <span className="w-[160px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] text-right">
              TOTAL PLEDGE
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-[48px]">
              <span className="font-heading text-[16px] text-[var(--text-muted)]">
                Loading...
              </span>
            </div>
          ) : topPledgers.length === 0 ? (
            <div className="flex flex-col items-center gap-[12px] py-[48px]">
              <span className="font-heading text-[16px] text-[var(--text-muted)]">
                No pledgers yet
              </span>
              <span className="font-heading text-[14px] text-[var(--text-muted)]">
                Be the first to pledge!
              </span>
            </div>
          ) : (
            topPledgers.map((pledger, i) => (
              <div
                key={i}
                className={`flex flex-col md:flex-row md:items-center gap-[8px] md:gap-0 px-[24px] py-[16px] border-b border-[var(--border-subtle)] last:border-b-0 ${
                  i < 3 ? "bg-[var(--bg-white)]" : ""
                }`}
              >
                <span className={`w-[60px] font-heading font-semibold text-[16px] ${
                  i === 0
                    ? "text-[var(--burnt-orange)]"
                    : i < 3
                    ? "text-[var(--forest-green)]"
                    : "text-[var(--text-muted)]"
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 flex items-center gap-[10px]">
                  <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                    {pledger.name}
                  </span>
                  <span className="font-heading text-[12px] text-[var(--text-muted)] md:hidden">
                    · {pledger.rate}
                  </span>
                </div>
                <span className="hidden md:block w-[160px] font-heading text-[14px] text-[var(--text-secondary)]">
                  {pledger.rate}
                </span>
                <span className="hidden md:block w-[140px] font-heading text-[14px] text-[var(--text-secondary)]">
                  {pledger.boostCount > 0 ? (
                    <span className="text-[var(--forest-green)] font-semibold">
                      {pledger.boostCount} boost{pledger.boostCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </span>
                <span className="md:w-[160px] md:text-right font-heading font-semibold text-[16px] text-[var(--text-primary)]">
                  {formatCurrency(pledger.totalPledge)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      {topPledgers.length > 0 && (
        <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-card)] border-t border-[var(--border-subtle)] w-full">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            RECENT PLEDGERS
          </span>
          <div className="flex flex-wrap gap-[12px]">
            {topPledgers
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 10)
              .map((pledger, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[10px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[16px] py-[10px]"
                >
                  <Heart className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
                  <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                    {pledger.name}
                  </span>
                  <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                    {pledger.rate}
                  </span>
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    {timeAgo(pledger.createdAt)}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Challenge History */}
      {succeededChallenges.length > 0 && (
        <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            COMPLETED CHALLENGES
          </span>
          <div className="flex flex-col gap-[12px]">
            {succeededChallenges.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-[24px] py-[16px]"
              >
                <Trophy className="w-[20px] h-[20px] text-[var(--forest-green)] shrink-0" />
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">
                    {ch.title}
                  </span>
                  <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                    {ch.targetMiles} miles · {ch.commitmentCount} boosts applied
                    {ch.resolvedAt && ` · ${formatDate(ch.resolvedAt)}`}
                  </span>
                </div>
                <span className="font-label font-bold text-[10px] tracking-[1px] px-[10px] py-[4px] bg-[var(--forest-green-light)] text-[var(--forest-green)]">
                  SUCCEEDED
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
        <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)] text-center">
          Join the Wall
        </h2>
        <p className="font-heading text-[16px] text-[var(--text-secondary)] text-center max-w-[500px]">
          Pledge per mile and your name appears here. Every cent goes to <Link href="/foundations" className="text-[var(--burnt-orange)] hover:underline">cancer
          foundations</Link> — Paul gets nothing from pledges.
        </p>
        <div className="flex flex-col sm:flex-row gap-[12px]">
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <Heart className="w-[16px] h-[16px] text-[var(--text-white)]" />
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
              PLEDGE PER MILE
            </span>
          </Link>
          <Link
            href="/my-pledge"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-white)] transition-colors"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-secondary)]">
              VIEW MY PLEDGE
            </span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
