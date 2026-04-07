"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import type { JournalPostPublic } from "@/lib/types";

/**
 * Homepage "Stories From the Trail" section.
 *
 * Renders nothing (the entire <section> is hidden) when there are zero
 * published journal posts. As soon as Paul has at least one published post,
 * the section appears with up to 3 of the most recent ones. No fallback /
 * sample posts — the section is genuinely absent until real content exists.
 */
export default function HomeJournalSection() {
  const [posts, setPosts] = useState<JournalPostPublic[] | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data: JournalPostPublic[]) => {
        if (!Array.isArray(data)) {
          setPosts([]);
          return;
        }
        // Public API already filters to published-only and sorts by dayNumber desc
        setPosts(data.filter((p) => !p.isDraft).slice(0, 3));
      })
      .catch(() => setPosts([]));
  }, []);

  // Loading or zero posts → render nothing
  if (posts === null || posts.length === 0) return null;

  return (
    <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-warm)] w-full">
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0 w-full">
          <div className="flex flex-col gap-[16px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
              TRAIL JOURNAL
            </span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)]">
              Stories From the Trail
            </h2>
            <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)]">
              Daily photos, videos, and reflections from Paul&apos;s PCT journey.
            </p>
          </div>
          <Link
            href="/journal"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[12px]"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
              VIEW ALL POSTS
            </span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
        {posts.map((post, i) => {
          const tag =
            post.tags?.find((t) =>
              ["BLOG", "VLOG", "GIF", "INTERVIEWS", "PHOTOS"].includes(t)
            ) || "BLOG";
          const isVlog = tag === "VLOG" || !!post.youtubeUrl;
          const formattedDate = post.date
            ? new Date(post.date + "T12:00:00")
                .toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
                .toUpperCase()
            : "";
          return (
            <ScrollReveal key={post.id} animation="fade-up" delay={i * 120}>
              <Link
                href={`/journal/${post.slug}`}
                className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative w-full h-[220px]">
                  <Image
                    src={post.coverImage || "/images/hiking/20230903_090215.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col gap-[12px] p-[24px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
                      DAY {post.dayNumber}
                    </span>
                    {formattedDate && (
                      <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">
                        &middot;&nbsp; {formattedDate}
                      </span>
                    )}
                  </div>
                  <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)] line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex gap-[8px]">
                    <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">
                      {tag}
                    </span>
                    {isVlog && tag !== "VLOG" && (
                      <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">
                        VIDEO
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
