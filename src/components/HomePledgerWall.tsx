"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { avatarColor } from "@/lib/donor-utils";
import type { PledgePublic } from "@/lib/types";

/**
 * Homepage "Pledger Wall".
 *
 * Real pledgers fill the wall from the top, and empty slots always remain
 * underneath so a visitor can see where their own name would land — the wall
 * reads as filling up rather than as either a blank grid or a closed list.
 *
 * The grid is a fixed 12 slots in 4 columns of 3, unchanged from when every
 * slot was a placeholder, so the section's height and rhythm stay put as
 * pledgers arrive. MIN_OPEN_SLOTS is what guarantees Paul's "always leave
 * extras": once there are more than 9 pledgers the wall shows the top 9 and
 * keeps 3 open, rather than filling every slot and losing the invitation.
 *
 * Fails soft in every direction. While loading, on a fetch error, or with no
 * pledgers at all, it renders 12 placeholders — exactly what this section did
 * before — so a Redis hiccup degrades to the old design instead of a gap.
 */

const TOTAL_SLOTS = 12;
const MIN_OPEN_SLOTS = 3;
const MAX_NAMED = TOTAL_SLOTS - MIN_OPEN_SLOTS;
const COLUMNS = 4;
const PER_COLUMN = TOTAL_SLOTS / COLUMNS;

export default function HomePledgerWall() {
  const [pledgers, setPledgers] = useState<PledgePublic[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/pledges/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.topPledgers) ? data.topPledgers : [];
        setPledgers(list.slice(0, MAX_NAMED));
      })
      .catch(() => {
        // Keep the placeholder-only wall rather than showing an error state
      });
    return () => {
      active = false;
    };
  }, []);

  // Build all 12 slots up front, then deal them into columns. Doing it in one
  // pass keeps the named/open boundary in a single place.
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) =>
    i < pledgers.length ? (
      <PledgerCard key={`p-${pledgers[i].name}-${i}`} pledger={pledgers[i]} />
    ) : (
      <PlaceholderCard
        key={`open-${i}`}
        label={i % 2 === 0 ? "This could be you" : "Your name here"}
      />
    )
  );

  return (
    <section className="flex flex-col items-center gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col items-center gap-[16px] w-full">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            PLEDGER WALL
          </span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            Help Make This Possible
          </h2>
          <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center">
            {pledgers.length > 0
              ? "These people are walking every mile with Paul. There's still room for your name."
              : "These spots are waiting for people like you. Pledge per mile and see your name here."}
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] w-full">
        {Array.from({ length: COLUMNS }, (_, col) => (
          <ScrollReveal
            key={col}
            animation="fade-up"
            delay={col * 100}
            className="flex flex-col gap-[12px]"
          >
            {slots.slice(col * PER_COLUMN, col * PER_COLUMN + PER_COLUMN)}
          </ScrollReveal>
        ))}
      </div>
      <Link
        href="/pledge"
        className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px]"
      >
        <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
          PLEDGE NOW
        </span>
        <Heart className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
      </Link>
    </section>
  );
}

/** A confirmed pledger. Same geometry as PlaceholderCard so the grid doesn't shift. */
function PledgerCard({ pledger }: { pledger: PledgePublic }) {
  const initial = (pledger.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex items-center gap-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[16px]">
      <div
        className="flex items-center justify-center w-[36px] h-[36px] rounded-full shrink-0"
        style={{ backgroundColor: avatarColor(pledger.name) }}
      >
        <span className="font-label font-bold text-[14px] text-[var(--text-white)]">
          {initial}
        </span>
      </div>
      <div className="flex flex-col gap-[2px] min-w-0">
        <span className="font-heading font-medium text-[14px] text-[var(--text-primary)] truncate">
          {pledger.name}
        </span>
        <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--forest-green)]">
          {pledger.rate}
        </span>
      </div>
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[12px] bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] p-[16px]">
      <div className="w-[36px] h-[36px] rounded-full shrink-0 bg-[var(--bg-warm)] border border-dashed border-[var(--border-subtle)]" />
      <div className="flex flex-col gap-[2px]">
        <span className="font-heading font-medium italic text-[14px] text-[var(--text-muted)]">
          {label}
        </span>
        <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--text-muted)]">
          $/mi
        </span>
      </div>
    </div>
  );
}
