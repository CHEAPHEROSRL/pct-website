"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronRight as ChevRight,
  ChevronLeft as ChevLeft,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { JournalPostDetailResponse, PostNavLink } from "@/lib/types";

export default function JournalPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<JournalPostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/journal/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header activeItem="Journal" />
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <div className="w-[40px] h-[40px] border-4 border-[var(--border-subtle)] border-t-[var(--burnt-orange)] rounded-full animate-spin" />
          <span className="font-label text-[14px] text-[var(--text-muted)]">
            Loading...
          </span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col w-full bg-[var(--bg-warm)]">
        <Header activeItem="Journal" />
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">
            Post Not Found
          </span>
          <p className="font-heading text-[16px] text-[var(--text-secondary)]">
            This journal entry doesn&apos;t exist or hasn&apos;t been published
            yet.
          </p>
          <Link
            href="/journal"
            className="flex items-center gap-[8px] mt-[16px] group"
          >
            <ArrowLeft className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)] group-hover:underline">
              BACK TO JOURNAL
            </span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { post, prevPost, nextPost } = data;
  const isVlog = !!post.youtubeUrl;
  const formattedDate = new Date(post.date + "T12:00:00")
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Journal" />

      {isVlog ? (
        <VlogHero
          post={post}
          formattedDate={formattedDate}
        />
      ) : (
        <BlogHero
          post={post}
          formattedDate={formattedDate}
        />
      )}

      {/* Article Body */}
      <section className="flex justify-center px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="w-full max-w-[720px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)] mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-heading font-semibold text-[28px] tracking-[-0.5px] text-[var(--text-primary)] mt-10 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-heading font-semibold text-[22px] text-[var(--text-primary)] mt-8 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="font-heading text-[17px] md:text-[18px] leading-[1.8] text-[var(--text-secondary)] mb-6">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[var(--burnt-orange)] pl-6 my-8 italic">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[var(--burnt-orange)] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
                  {children}
                </li>
              ),
              hr: () => (
                <hr className="my-10 border-[var(--border-subtle)]" />
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>
      </section>

      {/* Photo Gallery */}
      {post.images.length > 0 && <PhotoGallery images={post.images} />}

      {/* Post Navigation */}
      <PostNavigation prevPost={prevPost} nextPost={nextPost} />

      <Footer />
    </div>
  );
}

/* ---------- Blog Hero ---------- */
function BlogHero({
  post,
  formattedDate,
}: {
  post: JournalPostDetailResponse["post"];
  formattedDate: string;
}) {
  const coverImage =
    post.coverImage ||
    "https://images.unsplash.com/photo-1609657096517-438da7ed2423?w=1080";

  return (
    <section className="relative w-full h-[320px] md:h-[400px] lg:h-[480px]">
      <Image
        src={coverImage}
        alt={post.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[#1C1F1ACC]" />
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-[120px] pb-[32px] md:pb-[48px] gap-[12px]">
        <Link
          href="/journal"
          className="flex items-center gap-[8px] group mb-auto mt-[32px] md:mt-[48px]"
        >
          <ArrowLeft className="w-[14px] h-[14px] text-white" />
          <span className="font-label font-bold text-[12px] tracking-[2px] text-white group-hover:underline">
            BACK TO JOURNAL
          </span>
        </Link>

        <div className="flex items-center gap-[8px]">
          <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">
            DAY {post.dayNumber}
          </span>
          <span className="font-label font-bold text-[13px] text-white/50">
            &middot;
          </span>
          <span className="font-label font-medium text-[13px] tracking-[1px] text-white/65">
            {formattedDate}
          </span>
        </div>

        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] lg:text-[44px] leading-[1.15] text-white max-w-[800px]">
          {post.title}
        </h1>

        <div className="flex gap-[10px]">
          {post.tags.map((tag) => {
            const isGreen = tag === "BLOG" || tag === "PHOTOS";
            return (
              <span
                key={tag}
                className={`px-[12px] py-[4px] rounded-[4px] font-label font-bold text-[11px] tracking-[2px] ${
                  isGreen
                    ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                    : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Vlog Hero ---------- */
function VlogHero({
  post,
  formattedDate,
}: {
  post: JournalPostDetailResponse["post"];
  formattedDate: string;
}) {
  const videoId = getYouTubeId(post.youtubeUrl);

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-[8px] px-6 md:px-12 lg:px-[120px] py-[24px] bg-[var(--bg-white)] w-full">
        <Link href="/journal" className="flex items-center gap-[8px] group">
          <ArrowLeft className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--burnt-orange)] group-hover:underline">
            BACK TO JOURNAL
          </span>
        </Link>
      </div>

      {/* Video */}
      <section className="w-full bg-[var(--bg-dark)]">
        {videoId ? (
          <div className="w-full max-w-[1200px] mx-auto">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px]">
            <span className="font-label text-[14px] text-white/50">
              Video unavailable
            </span>
          </div>
        )}

        {/* Title + metadata below video */}
        <div className="flex flex-col gap-[12px] px-6 md:px-12 lg:px-[120px] py-[32px] md:py-[40px]">
          <div className="flex items-center gap-[8px]">
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">
              DAY {post.dayNumber}
            </span>
            <span className="font-label font-bold text-[13px] text-white/50">
              &middot;
            </span>
            <span className="font-label font-medium text-[13px] tracking-[1px] text-white/65">
              {formattedDate}
            </span>
          </div>

          <h1 className="font-heading font-semibold text-[28px] md:text-[36px] lg:text-[40px] leading-[1.15] text-white max-w-[800px]">
            {post.title}
          </h1>

          <div className="flex gap-[10px]">
            {post.tags.map((tag) => {
              const isGreen = tag === "BLOG" || tag === "PHOTOS";
              return (
                <span
                  key={tag}
                  className={`px-[12px] py-[4px] rounded-[4px] font-label font-bold text-[11px] tracking-[2px] ${
                    isGreen
                      ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                      : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Photo Gallery ---------- */
function PhotoGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft" && selectedIndex > 0)
        setSelectedIndex(selectedIndex - 1);
      if (e.key === "ArrowRight" && selectedIndex < images.length - 1)
        setSelectedIndex(selectedIndex + 1);
    },
    [selectedIndex, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <section className="flex flex-col gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
          PHOTOS FROM THE TRAIL
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[12px] md:gap-[16px] w-full">
          {images.map((src, i) => (
            <button
              key={i}
              className="relative w-full h-[200px] md:h-[280px] cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
              onClick={() => setSelectedIndex(i)}
            >
              <Image
                src={src}
                alt={`Trail photo ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-[20px] right-[20px] text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-[28px] h-[28px]" />
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex - 1)}
              className="absolute left-[20px] text-white/70 hover:text-white cursor-pointer"
            >
              <ChevLeft className="w-[32px] h-[32px]" />
            </button>
          )}

          {selectedIndex < images.length - 1 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex + 1)}
              className="absolute right-[20px] text-white/70 hover:text-white cursor-pointer"
            >
              <ChevRight className="w-[32px] h-[32px]" />
            </button>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh]">
            <Image
              src={images[selectedIndex]}
              alt={`Trail photo ${selectedIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-[85vh] w-auto"
            />
          </div>

          <span className="absolute bottom-[20px] text-white/50 font-label text-[13px]">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}

/* ---------- Post Navigation ---------- */
function PostNavigation({
  prevPost,
  nextPost,
}: {
  prevPost: PostNavLink | null;
  nextPost: PostNavLink | null;
}) {
  if (!prevPost && !nextPost) return null;

  return (
    <section className="flex flex-col md:flex-row gap-[16px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
      {prevPost ? (
        <Link
          href={`/journal/${prevPost.slug}`}
          className="flex-1 flex flex-col gap-[8px] border border-[var(--border-subtle)] p-[24px] hover:shadow-md transition-shadow bg-[var(--bg-white)] rounded-[4px]"
        >
          <div className="flex items-center gap-[6px]">
            <ChevronLeft className="w-[14px] h-[14px] text-[var(--text-muted)]" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              PREVIOUS POST
            </span>
          </div>
          <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">
            {prevPost.title}
          </span>
          <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--burnt-orange)]">
            DAY {prevPost.dayNumber}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPost ? (
        <Link
          href={`/journal/${nextPost.slug}`}
          className="flex-1 flex flex-col gap-[8px] border border-[var(--border-subtle)] p-[24px] hover:shadow-md transition-shadow bg-[var(--bg-white)] rounded-[4px] items-end text-right"
        >
          <div className="flex items-center gap-[6px]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
              NEXT POST
            </span>
            <ChevronRight className="w-[14px] h-[14px] text-[var(--text-muted)]" />
          </div>
          <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">
            {nextPost.title}
          </span>
          <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--burnt-orange)]">
            DAY {nextPost.dayNumber}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
