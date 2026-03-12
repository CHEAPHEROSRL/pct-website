"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import type { JournalPostPublic } from "@/lib/types";

const filterOptions = ["ALL", "BLOG", "VLOG", "INTERVIEWS", "PHOTOS"] as const;
type Filter = (typeof filterOptions)[number];

interface JournalEntry {
  slug: string;
  img: string;
  day: string;
  date: string;
  title: string;
  excerpt: string;
  tag: "BLOG" | "VLOG" | "INTERVIEWS" | "PHOTOS";
}

function mapPostToEntry(post: JournalPostPublic): JournalEntry {
  return {
    slug: post.slug,
    img:
      post.coverImage ||
      "/images/hiking/20230903_090215.jpg",
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
    tag: (post.tags[0] as "BLOG" | "VLOG" | "INTERVIEWS" | "PHOTOS") || "BLOG",
  };
}

const fallbackFeaturedPost: JournalEntry = {
  slug: "the-first-step-standing-at-the-southern-terminus",
  img: "/images/hiking/FB_IMG_1771992615412.jpg",
  day: "DAY 1",
  date: "MARCH 28, 2026",
  title: "The First Step: Standing at the Southern Terminus",
  excerpt: "Standing at the southern monument, looking north toward Canada. 2,650 miles of trail ahead. The sun is barely up and the desert air is still cool. This is the moment I\u2019ve been preparing for \u2014 the moment everything changes. For mom. For dad. For everyone still fighting.",
  tag: "BLOG",
};

const fallbackEntries: JournalEntry[] = [
  { slug: "finding-my-rhythm", img: "/images/hiking/20250802_160435.jpg", day: "DAY 2", date: "MARCH 29, 2026", title: "Finding My Rhythm", excerpt: "20 miles in and my feet are already talking to me. But the desert sunrise was worth every blister.", tag: "BLOG" },
  { slug: "water-and-gratitude", img: "/images/hiking/20220822_134557.jpg", day: "DAY 5", date: "APRIL 1, 2026", title: "Water and Gratitude", excerpt: "Found a perfect stream today. Sat with my feet in the cold water and thought about Mom\u2019s garden.", tag: "VLOG" },
  { slug: "stars-like-ive-never-seen", img: "/images/hiking/20230824_122513.jpg", day: "DAY 8", date: "APRIL 4, 2026", title: "Stars Like I've Never Seen", excerpt: "No light pollution out here. The Milky Way stretches above like a river of light. Dad would have loved this.", tag: "PHOTOS" },
  { slug: "through-the-desert-wind", img: "/images/hiking/20240128_110150.jpg", day: "DAY 15", date: "APRIL 11, 2026", title: "Through the Desert Wind", excerpt: "The heat is relentless, but the sunsets make it all worthwhile. Met a fellow hiker who lost her mother to breast cancer.", tag: "BLOG" },
  { slug: "wildflower-season", img: "/images/hiking/Screenshot_20240316-175047_Gallery.jpg", day: "DAY 20", date: "APRIL 16, 2026", title: "Wildflower Season", excerpt: "The desert is blooming. Purple, yellow, orange \u2014 everywhere. Nature\u2019s reminder that beauty follows hardship.", tag: "PHOTOS" },
  { slug: "sierra-nights", img: "/images/hiking/20220822_134051.jpg", day: "DAY 30", date: "APRIL 26, 2026", title: "Sierra Nights", excerpt: "The stars remind me of camping with my dad. I can feel him walking with me. Tonight\u2019s vlog is for him.", tag: "VLOG" },
  { slug: "trail-interview-sarah-portland", img: "/images/hiking/20230831_135648.jpg", day: "DAY 12", date: "APRIL 8, 2026", title: "YesChapter Interview: Sarah from Portland", excerpt: "I asked Sarah the question: 'What's a time in your life where you could go back and change the answer to YES?' Her answer stopped me in my tracks.", tag: "INTERVIEWS" },
  { slug: "trail-interview-marcus-and-elena", img: "/images/hiking/image1.jpeg", day: "DAY 25", date: "APRIL 21, 2026", title: "YesChapter Interview: Marcus & Elena — A Couple on the Trail", excerpt: "They both had different answers to the YesChapter question. Marcus wished he'd said yes to forgiving his father sooner. Elena wished she'd said yes to herself.", tag: "INTERVIEWS" },
  { slug: "how-pledging-works", img: "/images/hiking/FB_IMG_1771992929191.jpg", day: "GUIDE", date: "MARCH 10, 2026", title: "How Pledging Works \u2014 A Complete Guide", excerpt: "Everything you need to know about pledging per mile: how it works, when you pay, where the money goes, and why this model keeps Paul accountable.", tag: "BLOG" },
  { slug: "as-a-man-thinketh", img: "/images/portraits/20230823_190926.jpg", day: "REFLECTIONS", date: "MARCH 15, 2026", title: "As a Man Thinketh \u2014 The Book That Made Me Walk", excerpt: "A small book from 1903 changed how I see this entire journey. James Allen wrote that your thoughts shape your reality. I believe him.", tag: "BLOG" },
  { slug: "finding-your-ikigai", img: "/images/hiking/FB_IMG_1771992939135.jpg", day: "REFLECTIONS", date: "MARCH 18, 2026", title: "Finding Your Ikigai \u2014 Why I Started YesChapter and Walked 2,650 Miles", excerpt: "Ikigai isn\u2019t something you find sitting still. It\u2019s something you build through consistent, hard, fulfilling, and meaningful work.", tag: "BLOG" },
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
        <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL JOURNAL</span>
        <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Stories From the Trail
        </h1>
        <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center w-full lg:w-[640px]">
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
          <ScrollReveal animation="slide-right" className="relative w-full lg:w-[640px] h-[250px] md:h-[320px] lg:h-[400px] shrink-0">
            <Image
              src={featuredPost.img}
              alt={featuredPost.title}
              fill
              className="object-cover"
            />
          </ScrollReveal>
          <ScrollReveal animation="slide-left" className="flex flex-col justify-center gap-[20px] flex-1">
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
            <Link href={`/journal/${featuredPost.slug}`} className="flex items-center gap-[8px] cursor-pointer group">
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)] group-hover:underline">READ FULL ENTRY</span>
              <ArrowRight className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
            </Link>
          </ScrollReveal>
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

function BlogCard({ slug, img, day, date, title, excerpt, tag }: JournalEntry) {
  const tagStyle =
    tag === "INTERVIEWS"
      ? "bg-[#EDE9FE] text-[#6D28D9]"
      : tag === "VLOG"
        ? "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
        : "bg-[var(--forest-green-light)] text-[var(--forest-green)]";
  return (
    <Link href={`/journal/${slug}`} className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
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
          <span className={`px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] ${tagStyle}`}>{tag}</span>
        </div>
      </div>
    </Link>
  );
}
