"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { JournalPostPublic } from "@/lib/types";

const filterOptions = ["ALL", "BLOG", "VLOG", "PHOTOS"] as const;
type Filter = (typeof filterOptions)[number];

interface JournalEntry {
  img: string;
  day: string;
  date: string;
  title: string;
  excerpt: string;
  tag: "BLOG" | "VLOG" | "PHOTOS";
}

function mapPostToEntry(post: JournalPostPublic): JournalEntry {
  return {
    img:
      post.coverImage ||
      "https://images.unsplash.com/photo-1609657096517-438da7ed2423?w=1080",
    day: `DAY ${post.dayNumber}`,
    date: new Date(post.date + "T12:00:00")
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase(),
    title: post.title,
    excerpt: post.excerpt,
    tag: (post.tags[0] as "BLOG" | "VLOG" | "PHOTOS") || "BLOG",
  };
}

const fallbackFeaturedPost: JournalEntry = {
  img: "https://images.unsplash.com/photo-1764092816494-c165d9a24d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjA0MzV8&ixlib=rb-4.1.0&q=80&w=1080",
  day: "DAY 1",
  date: "MARCH 28, 2026",
  title: "The First Step: Standing at the Southern Terminus",
  excerpt: "Standing at the southern monument, looking north toward Canada. 2,650 miles of trail ahead. The sun is barely up and the desert air is still cool. This is the moment I\u2019ve been preparing for \u2014 the moment everything changes. For mom. For dad. For everyone still fighting.",
  tag: "BLOG",
};

const fallbackEntries: JournalEntry[] = [
  { img: "https://images.unsplash.com/photo-1609657096517-438da7ed2423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 2", date: "MARCH 29, 2026", title: "Finding My Rhythm", excerpt: "20 miles in and my feet are already talking to me. But the desert sunrise was worth every blister.", tag: "BLOG" },
  { img: "https://images.unsplash.com/photo-1723995594361-46b69891c6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 5", date: "APRIL 1, 2026", title: "Water and Gratitude", excerpt: "Found a perfect stream today. Sat with my feet in the cold water and thought about Mom\u2019s garden.", tag: "VLOG" },
  { img: "https://images.unsplash.com/photo-1763058138710-7d8e263223ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 8", date: "APRIL 4, 2026", title: "Stars Like I've Never Seen", excerpt: "No light pollution out here. The Milky Way stretches above like a river of light. Dad would have loved this.", tag: "PHOTOS" },
  { img: "https://images.unsplash.com/photo-1688057951002-a159e26c7f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 15", date: "APRIL 11, 2026", title: "Through the Desert Wind", excerpt: "The heat is relentless, but the sunsets make it all worthwhile. Met a fellow hiker who lost her mother to breast cancer.", tag: "BLOG" },
  { img: "https://images.unsplash.com/photo-1759491265362-3bd88910a036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 20", date: "APRIL 16, 2026", title: "Wildflower Season", excerpt: "The desert is blooming. Purple, yellow, orange \u2014 everywhere. Nature\u2019s reminder that beauty follows hardship.", tag: "PHOTOS" },
  { img: "https://images.unsplash.com/photo-1759150954328-8b0b005ade84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80", day: "DAY 30", date: "APRIL 26, 2026", title: "Sierra Nights", excerpt: "The stars remind me of camping with my dad. I can feel him walking with me. Tonight\u2019s vlog is for him.", tag: "VLOG" },
];

const PER_PAGE = 6;

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dynamicFeatured, setDynamicFeatured] = useState<JournalEntry | null>(null);
  const [dynamicEntries, setDynamicEntries] = useState<JournalEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((posts: JournalPostPublic[]) => {
        if (posts.length > 0) {
          const entries = posts.map(mapPostToEntry);
          setDynamicFeatured(entries[0]);
          setDynamicEntries(entries.slice(1));
        }
      })
      .catch(() => {});
  }, []);

  const featuredPost = dynamicFeatured ?? fallbackFeaturedPost;
  const allEntries = dynamicEntries ?? fallbackEntries;

  const filtered = useMemo(() => {
    let entries = allEntries;
    if (activeFilter !== "ALL") {
      entries = entries.filter((e) => e.tag === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q) ||
          e.day.toLowerCase().includes(q)
      );
    }
    return entries;
  }, [activeFilter, search, allEntries]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const showFeatured = activeFilter === "ALL" && !search.trim() && currentPage === 1;

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Journal" />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL JOURNAL</span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Stories From the Trail
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center w-full lg:w-[640px]">
          Daily photos, videos, and reflections from Paul&apos;s 2,650-mile PCT journey. Follow along as he walks from Mexico to Canada.
        </p>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-6 md:px-12 lg:px-[120px] py-[16px] bg-[var(--bg-white)] border-t border-b border-[var(--border-subtle)] w-full">
        <div className="flex items-center gap-[8px] flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setPage(1); }}
              className={`px-[20px] py-[8px] cursor-pointer transition-colors ${activeFilter === f ? "bg-[var(--bg-dark)]" : "border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]"}`}
            >
              <span className={`font-label font-bold text-[11px] tracking-[2px] ${activeFilter === f ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"}`}>{f}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-[10px] border border-[var(--border-subtle)] px-[16px] py-[10px]">
          <Search className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search journal entries..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent w-[180px]"
          />
        </div>
      </div>

      {/* Featured Post */}
      {showFeatured && (
        <section className="flex flex-col lg:flex-row gap-[24px] lg:gap-[40px] px-6 md:px-12 lg:px-[120px] py-[32px] md:py-[48px] bg-[var(--bg-white)] w-full">
          <div className="relative w-full lg:w-[640px] h-[250px] md:h-[320px] lg:h-[400px] shrink-0">
            <Image
              src={featuredPost.img}
              alt={featuredPost.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-[20px] flex-1">
            <div className="bg-[var(--burnt-orange)] px-[12px] py-[4px] w-fit">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-white)]">FEATURED POST</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">{featuredPost.day}</span>
              <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; {featuredPost.date}</span>
            </div>
            <h2 className="font-heading font-semibold text-[22px] md:text-[28px] lg:text-[32px] tracking-[-0.5px] leading-[1.2] text-[var(--text-primary)]">
              {featuredPost.title}
            </h2>
            <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
              {featuredPost.excerpt}
            </p>
            <div className="flex gap-[8px]">
              <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">BLOG</span>
              <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">VIDEO</span>
            </div>
            <div className="flex items-center gap-[8px] cursor-pointer">
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)]">READ FULL ENTRY</span>
              <ArrowRight className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] pt-[32px] md:pt-[48px] pb-[48px] md:pb-[80px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
          {activeFilter === "ALL" ? "ALL ENTRIES" : activeFilter}
          {search.trim() ? ` \u2014 "${search}"` : ""}
          {` (${filtered.length})`}
        </span>

        {paged.length === 0 ? (
          <div className="flex flex-col items-center gap-[12px] py-[48px]">
            <span className="font-heading text-[18px] text-[var(--text-muted)]">No entries found</span>
            <button
              onClick={() => { setActiveFilter("ALL"); setSearch(""); setPage(1); }}
              className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)] cursor-pointer"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
            {paged.map((entry) => (
              <BlogCard key={entry.day + entry.title} {...entry} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] w-full">
            {currentPage > 1 && (
              <button
                onClick={() => setPage(currentPage - 1)}
                className="flex items-center gap-[6px] border border-[var(--border-subtle)] px-[16px] py-[10px] cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
              >
                <ChevronLeft className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
                <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">PREV</span>
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex items-center justify-center w-[40px] h-[40px] cursor-pointer transition-colors ${p === currentPage ? "bg-[var(--bg-dark)]" : "border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]"}`}
              >
                <span className={`font-label font-bold text-[13px] ${p === currentPage ? "text-[var(--text-white)]" : "text-[var(--text-secondary)]"}`}>{p}</span>
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                onClick={() => setPage(currentPage + 1)}
                className="flex items-center gap-[6px] border border-[var(--border-subtle)] px-[16px] py-[10px] cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
              >
                <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">NEXT</span>
                <ChevronRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function BlogCard({ img, day, date, title, excerpt, tag }: JournalEntry) {
  const isGreen = tag === "BLOG" || tag === "PHOTOS";
  return (
    <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative w-full h-[200px]">
        <Image src={img} alt={title} fill className="object-cover" />
      </div>
      <div className="flex flex-col gap-[10px] p-[20px]">
        <div className="flex items-center gap-[8px]">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">{day}</span>
          <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; {date}</span>
        </div>
        <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">{title}</span>
        <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">{excerpt}</p>
        <div className="flex gap-[6px]">
          <span className={`px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] ${isGreen ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]" : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"}`}>{tag}</span>
        </div>
      </div>
    </div>
  );
}
