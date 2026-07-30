"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLocationData } from "@/hooks/useLocationData";
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
const TOTAL_MILES = 2650;

/**
 * Which distance the money figures are measured against.
 *
 *   "full"    — what a pledge is worth if Paul walks all 2,650 miles. This is
 *               the number the rest of the site calls "total pledged", so it's
 *               the default; switching it would silently restate every figure
 *               a visitor has already seen elsewhere.
 *   "current" — what the same pledge is worth at the mile Paul has actually
 *               reached today.
 */
type DistanceMode = "full" | "current";

/**
 * A pledge's value at an arbitrary distance.
 *
 * Derived from totalPledge rather than by parsing the "$0.10/mi" rate string:
 * totalPledge is always rate x 2,650 / interval, so scaling it by the fraction
 * of the trail walked gives the same answer for per-mile, per-10-mile and
 * per-100-mile pledges alike, with no string parsing and no extra API fields.
 */
function valueAtMiles(totalPledge: number, miles: number): number {
  const fraction = Math.min(1, Math.max(0, miles / TOTAL_MILES));
  return totalPledge * fraction;
}

function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export default function HomePledgerWall() {
  const [pledgers, setPledgers] = useState<PledgePublic[]>([]);
  const [totalPledged, setTotalPledged] = useState(0);
  const [pledgerCount, setPledgerCount] = useState(0);
  const [mode, setMode] = useState<DistanceMode>("full");
  const { data: location } = useLocationData();

  useEffect(() => {
    let active = true;
    fetch("/api/pledges/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.topPledgers) ? data.topPledgers : [];
        setPledgers(list.slice(0, MAX_NAMED));
        setTotalPledged(data?.stats?.totalPledged ?? 0);
        setPledgerCount(data?.stats?.pledgerCount ?? 0);
      })
      .catch(() => {
        // Keep the placeholder-only wall rather than showing an error state
      });
    return () => {
      active = false;
    };
  }, []);

  const milesWalked = location?.stats?.totalMiles ?? 0;

  // The toggle is only meaningful once we know how far Paul has walked. If the
  // location endpoint hasn't answered, we quietly show full-distance figures
  // only — better than offering a switch that would read $0.
  const canToggle = milesWalked > 0;
  const showCurrent = mode === "current" && canToggle;

  const displayedTotal = showCurrent
    ? valueAtMiles(totalPledged, milesWalked)
    : totalPledged;

  // Build all 12 slots up front, then deal them into columns. Doing it in one
  // pass keeps the named/open boundary in a single place.
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) =>
    i < pledgers.length ? (
      <PledgerCard
        key={`p-${pledgers[i].name}-${i}`}
        pledger={pledgers[i]}
        amount={
          showCurrent
            ? valueAtMiles(pledgers[i].totalPledge, milesWalked)
            : pledgers[i].totalPledge
        }
      />
    ) : (
      <PlaceholderCard
        key={`open-${i}`}
        label={i % 2 === 0 ? "This could be you" : "Your name here"}
      />
    )
  );

  return (
    // id is a deep-link target: yeschapter.com/#pledger-wall, used in the
    // progress reports sent to Paul so a link lands on the wall itself
    // rather than the top of a long homepage.
    <section
      id="pledger-wall"
      className="flex flex-col items-center gap-[32px] md:gap-[40px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full scroll-mt-[120px]"
    >
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

      {/* Cumulative total + distance toggle — only once there's a real pledge */}
      {pledgerCount > 0 && (
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[14px]">
            <span className="font-heading font-semibold text-[40px] md:text-[52px] leading-[1] tracking-[-1px] text-[var(--forest-green)]">
              {money(displayedTotal)}
            </span>
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)] text-center">
              {showCurrent
                ? `PLEDGED AT MILE ${Math.round(milesWalked).toLocaleString("en-US")}`
                : "PLEDGED IF PAUL FINISHES ALL 2,650 MILES"}
            </span>
            <span className="font-heading text-[14px] text-[var(--text-secondary)]">
              from {pledgerCount} {pledgerCount === 1 ? "pledger" : "pledgers"}
            </span>

            {canToggle && (
              <div className="flex items-center border border-[var(--border-subtle)] mt-[4px]">
                <button
                  onClick={() => setMode("current")}
                  aria-pressed={mode === "current"}
                  className={`font-label font-bold text-[11px] tracking-[2px] px-[16px] py-[8px] cursor-pointer transition-colors ${
                    mode === "current"
                      ? "bg-[var(--burnt-orange)] text-[var(--text-white)]"
                      : "bg-[var(--bg-white)] text-[var(--text-muted)] hover:bg-[var(--bg-warm)]"
                  }`}
                >
                  SO FAR
                </button>
                <button
                  onClick={() => setMode("full")}
                  aria-pressed={mode === "full"}
                  className={`font-label font-bold text-[11px] tracking-[2px] px-[16px] py-[8px] cursor-pointer transition-colors ${
                    mode === "full"
                      ? "bg-[var(--burnt-orange)] text-[var(--text-white)]"
                      : "bg-[var(--bg-white)] text-[var(--text-muted)] hover:bg-[var(--bg-warm)]"
                  }`}
                >
                  FULL HIKE
                </button>
              </div>
            )}

            <span className="font-heading text-[12px] leading-[1.5] text-[var(--text-muted)] text-center max-w-[420px]">
              Pledges are promises, not payments. Pledgers donate directly to the
              two foundations when Paul finishes. Paul receives nothing.
            </span>
          </div>
        </ScrollReveal>
      )}

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
function PledgerCard({
  pledger,
  amount,
}: {
  pledger: PledgePublic;
  amount: number;
}) {
  const initial = (pledger.name || "?").trim().charAt(0).toUpperCase() || "?";
  // Only ever present when the pledger allowed it — the API omits the field
  // entirely otherwise, so there's nothing to accidentally render.
  const message = pledger.message?.trim();
  return (
    <div className="flex flex-col gap-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[16px]">
      <div className="flex items-center gap-[12px]">
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
            {pledger.rate} &middot; {money(amount)}
          </span>
        </div>
      </div>
      {message && (
        <p className="font-heading italic text-[13px] leading-[1.55] text-[var(--text-secondary)] border-l-2 border-[var(--warm-stone)] pl-[10px] line-clamp-3">
          &ldquo;{message}&rdquo;
        </p>
      )}
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
