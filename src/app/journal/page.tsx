"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, ChevronRight, ChevronLeft, Instagram, ExternalLink, Play, Images } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import type { JournalPostPublic } from "@/lib/types";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import type { InstagramPost } from "@/lib/instagram";
import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";
import type { YoutubeVideo } from "@/lib/youtube-feed";

const filterOptions = ["ALL", "BLOG", "VLOG", "GIF", "INTERVIEWS", "PHOTOS"] as const;
type Filter = (typeof filterOptions)[number];

interface JournalEntry {
  slug: string;
  img: string;
  day: string;
  date: string;
  title: string;
  excerpt: string;
  tag: "BLOG" | "VLOG" | "GIF" | "INTERVIEWS" | "PHOTOS";
  videoUrl?: string;
  gifUrl?: string;
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
    tag: (post.tags[0] as "BLOG" | "VLOG" | "GIF" | "INTERVIEWS" | "PHOTOS") || "BLOG",
    videoUrl: post.youtubeUrl || undefined,
  };
}

const fallbackFeaturedPost: JournalEntry = {
  slug: "how-pledging-works",
  img: "/images/hiking/FB_IMG_1771992929191.jpg",
  day: "GUIDE",
  date: "MARCH 10, 2026",
  title: "How Pledging Works \u2014 A Complete Guide",
  excerpt: "Everything you need to know about pledging per mile: how it works, when you pay, where the money goes, and why this model keeps Paul accountable.",
  tag: "BLOG",
};

const fallbackEntries: JournalEntry[] = [];

const PER_PAGE = 6;

const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "@yeschapter";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`;

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dynamicFeatured, setDynamicFeatured] = useState<JournalEntry | null>(null);
  const [dynamicEntries, setDynamicEntries] = useState<JournalEntry[] | null>(null);

  const { posts: instagramPosts } = useInstagramPosts();
  const { videos: youtubeVideos } = useYoutubeVideos();

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
      <section className="relative flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[52px] md:py-[72px] lg:py-[88px] w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hiking/20230903_090215.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[var(--bg-white)]/88" />
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-[16px]">
          <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL JOURNAL</span>
          <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            Stories From the Trail
          </h1>
          <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center w-full lg:w-[640px]">
            Daily photos, videos, and reflections from Paul&apos;s 2,650-mile PCT journey. Follow along as he walks from Mexico to Canada.
          </p>
        </div>
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

      {/* YouTube Vlog Gallery — only rendered when videos are available */}
      {youtubeVideos.length > 0 && (
        <YoutubeGallery videos={youtubeVideos} />
      )}

      {/* Instagram Gallery — only rendered when posts are available */}
      {instagramPosts.length > 0 && (
        <InstagramGallery posts={instagramPosts} handle={INSTAGRAM_HANDLE} profileUrl={INSTAGRAM_URL} />
      )}

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Instagram Gallery
// ---------------------------------------------------------------------------

function InstagramGallery({
  posts,
  handle,
  profileUrl,
}: {
  posts: InstagramPost[];
  handle: string;
  profileUrl: string;
}) {
  // Show at most 12 posts in the grid (3×4 on desktop, 2×6 on tablet, 1×12 on mobile)
  const visible = posts.slice(0, 12);

  return (
    <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full border-t border-[var(--border-subtle)]">
      {/* Header */}
      <div className="flex flex-col gap-[12px]">
        {/* Label row */}
        <div className="flex items-center gap-[8px]">
          <Instagram className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            FOLLOW THE JOURNEY
          </span>
        </div>
        {/* Title + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
          <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
            From the Trail{" "}
            <span className="text-[var(--text-muted)] font-normal">{handle}</span>
          </h2>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[8px] bg-[var(--bg-dark)] px-[20px] py-[10px] hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
          >
            <Instagram className="w-[14px] h-[14px] text-white" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-white">
              FOLLOW ON INSTAGRAM
            </span>
            <ExternalLink className="w-[11px] h-[11px] text-white/60" />
          </a>
        </div>
        <p className="font-heading text-[15px] md:text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[640px]">
          Paul shares daily moments, landscapes, wildlife encounters and camp life between journal posts. Follow along in real time.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[8px] md:gap-[12px] w-full">
        {visible.map((post) => (
          <InstagramCard key={post.id} post={post} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-[10px] border border-[var(--border-subtle)] px-[32px] py-[14px] hover:bg-[var(--bg-warm)] transition-colors"
        >
          <Instagram className="w-[16px] h-[16px] text-[var(--text-secondary)]" />
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
            VIEW ALL POSTS ON INSTAGRAM
          </span>
          <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
        </a>
      </div>
    </section>
  );
}

function InstagramCard({ post }: { post: InstagramPost }) {
  const isVideo = post.mediaType === "VIDEO";
  const isCarousel = post.mediaType === "CAROUSEL_ALBUM";

  // Truncate caption for the overlay
  const shortCaption =
    post.caption.length > 90
      ? post.caption.slice(0, 90).trimEnd() + "…"
      : post.caption;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden bg-[var(--warm-stone)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.mediaUrl}
        alt={shortCaption || "Instagram post"}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Media type badge — top right */}
      {(isVideo || isCarousel) && (
        <div className="absolute top-[8px] right-[8px]">
          {isVideo ? (
            <Play className="w-[16px] h-[16px] text-white drop-shadow-md" fill="white" />
          ) : (
            <Images className="w-[16px] h-[16px] text-white drop-shadow-md" />
          )}
        </div>
      )}

      {/* Caption overlay — slides up on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-[12px] md:p-[14px]">
        {shortCaption && (
          <p className="font-heading text-[12px] md:text-[13px] leading-[1.5] text-white line-clamp-3">
            {shortCaption}
          </p>
        )}
        <div className="flex items-center gap-[4px] mt-[6px]">
          <ExternalLink className="w-[10px] h-[10px] text-white/60" />
          <span className="font-label font-semibold text-[10px] tracking-[1px] text-white/60">
            VIEW ON INSTAGRAM
          </span>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// YouTube Gallery
// ---------------------------------------------------------------------------

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@YesChapter";

function YoutubeGallery({ videos }: { videos: YoutubeVideo[] }) {
  const visible = videos.slice(0, 6);

  return (
    <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-dark)] w-full">
      {/* Header */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <Play className="w-[14px] h-[14px] text-[var(--burnt-orange)]" fill="currentColor" />
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            PAUL&apos;S VLOGS
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
          <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-white)]">
            Watch the Journey{" "}
            <span className="text-[#FFFFFF66] font-normal">@YesChapter</span>
          </h2>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[8px] bg-[#FF0000] px-[20px] py-[10px] hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
          >
            <Play className="w-[13px] h-[13px] text-white" fill="white" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-white">
              SUBSCRIBE ON YOUTUBE
            </span>
            <ExternalLink className="w-[11px] h-[11px] text-white/60" />
          </a>
        </div>
        <p className="font-heading text-[15px] md:text-[16px] leading-[1.6] text-[#FFFFFFAA] max-w-[640px]">
          Every video Paul publishes on his YouTube channel appears here automatically. Watch raw trail footage, daily vlogs, and stories from the PCT.
        </p>
      </div>

      {/* Grid — 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] w-full">
        {visible.map((video) => (
          <YoutubeCard key={video.id} video={video} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center">
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-[10px] border border-[#FFFFFF33] px-[32px] py-[14px] hover:bg-white/10 transition-colors"
        >
          <Play className="w-[14px] h-[14px] text-[#FFFFFFAA]" />
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[#FFFFFFAA]">
            VIEW ALL VIDEOS ON YOUTUBE
          </span>
          <ArrowRight className="w-[14px] h-[14px] text-[#FFFFFFAA]" />
        </a>
      </div>
    </section>
  );
}

function YoutubeCard({ video }: { video: YoutubeVideo }) {
  const date = new Date(video.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-[#FFFFFF0D] border border-[#FFFFFF1A] overflow-hidden hover:border-[#FFFFFF33] transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-[#111]">
        <Image
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[52px] h-[52px] rounded-full bg-black/60 flex items-center justify-center group-hover:bg-[#FF0000] transition-colors duration-300">
            <Play className="w-[22px] h-[22px] text-white ml-[2px]" fill="white" />
          </div>
        </div>
        {/* YouTube badge */}
        <div className="absolute top-[10px] right-[10px] bg-[#FF0000] px-[8px] py-[3px]">
          <span className="font-label font-bold text-[9px] tracking-[1px] text-white">YOUTUBE</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-[8px] p-[18px]">
        <span className="font-label font-medium text-[11px] tracking-[1px] text-[#FFFFFF66]">{date}</span>
        <h3 className="font-heading font-semibold text-[16px] leading-[1.4] text-[var(--text-white)] line-clamp-2">
          {video.title}
        </h3>
        {video.description && (
          <p className="font-heading text-[13px] leading-[1.5] text-[#FFFFFFAA] line-clamp-2">
            {video.description}
          </p>
        )}
        <div className="flex items-center gap-[6px] mt-[4px]">
          <ExternalLink className="w-[10px] h-[10px] text-[#FFFFFF44]" />
          <span className="font-label font-semibold text-[10px] tracking-[1px] text-[#FFFFFF44]">
            WATCH ON YOUTUBE
          </span>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Blog Card
// ---------------------------------------------------------------------------

function BlogCard({ slug, img, day, date, title, excerpt, tag, videoUrl, gifUrl }: JournalEntry) {
  const tagStyle =
    tag === "INTERVIEWS"
      ? "bg-[#EDE9FE] text-[#6D28D9]"
      : tag === "VLOG"
        ? "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
        : tag === "GIF"
          ? "bg-[#E0F2FE] text-[#0369A1]"
          : "bg-[var(--forest-green-light)] text-[var(--forest-green)]";

  const isVideo = tag === "VLOG" || !!videoUrl;
  const isGif = tag === "GIF" || !!gifUrl;
  const coverSrc = gifUrl || img;

  return (
    <Link href={`/journal/${slug}`} className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative w-full h-[200px] overflow-hidden">
        <Image
          src={coverSrc}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
          unoptimized={isGif}
        />
        {/* Video play button overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-[48px] h-[48px] rounded-full bg-black/60 flex items-center justify-center group-hover:bg-[var(--burnt-orange)] transition-colors duration-300">
              <Play className="w-[20px] h-[20px] text-white ml-[2px]" fill="white" />
            </div>
          </div>
        )}
        {isGif && (
          <div className="absolute top-[10px] left-[10px] bg-[#0369A1] px-[8px] py-[3px]">
            <span className="font-label font-bold text-[9px] tracking-[1px] text-white">GIF</span>
          </div>
        )}
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
