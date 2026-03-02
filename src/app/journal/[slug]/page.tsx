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
      .catch(() => {
        // Fall back to hardcoded sample posts for demo
        const fallback = getFallbackPost(slug);
        if (fallback) {
          setData(fallback);
        } else {
          setError(true);
        }
      })
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

/* ---------- Fallback sample posts ---------- */
const fallbackPosts: JournalPostDetailResponse[] = [
  {
    post: {
      id: "fb-1", title: "The First Step: Standing at the Southern Terminus", slug: "the-first-step-standing-at-the-southern-terminus",
      dayNumber: 1, date: "2026-03-28", excerpt: "Standing at the southern monument, looking north toward Canada.",
      coverImage: "https://images.unsplash.com/photo-1764092816494-c165d9a24d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["BLOG"],
      body: `I stood at the southern terminus monument, my pack heavy on my shoulders, staring north into the desert. The morning air was cool but I could already feel the promise of heat in the sun climbing above the hills. Behind me, the metal border fence stretched east and west. Ahead, 2,650 miles of trail.

## The Weight of Beginning

There's something surreal about starting a journey this long. You've planned for months — gear lists, resupply boxes, training hikes — and then suddenly you're just... walking. One foot in front of the other. The trail doesn't care about your spreadsheets.

> "The trail provides." I'd heard this phrase a dozen times in planning. Today, standing at mile zero, I chose to believe it.

The first water source was 20 miles away. I'd cached water at Lake Morena, but between here and there was nothing but chaparral, rocky switchbacks, and the kind of quiet that makes you hear your own heartbeat. My legs felt strong. My spirit felt ready. I took my first step north.

---

By noon I'd covered eight miles and found shade under a scrubby oak tree. I ate a tortilla with peanut butter and watched a lizard do push-ups on a rock. This is the kind of lunch meeting I can get behind.

## For Mom and Dad

Every step I take out here is a step toward something bigger than me. Mom fought cancer with a grace I'll never fully understand. Dad stood beside her through every round of chemo. This walk is for them — and for every family that knows what that fight feels like.

If you're reading this and you've been touched by cancer, know that you're part of why I'm out here. Every mile matters. Every dollar donated to cancer research matters. And I'm going to walk all 2,650 of them.`,
    },
    prevPost: null,
    nextPost: { slug: "finding-my-rhythm", title: "Finding My Rhythm", dayNumber: 2 },
  },
  {
    post: {
      id: "fb-2", title: "Finding My Rhythm", slug: "finding-my-rhythm",
      dayNumber: 2, date: "2026-03-29", excerpt: "20 miles in and my feet are already talking to me.",
      coverImage: "https://images.unsplash.com/photo-1609657096517-438da7ed2423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["BLOG"],
      body: `Twenty miles in and my feet are already talking to me. But the desert sunrise was worth every blister. The sky turned from deep purple to blazing orange in what felt like seconds, painting the rocks around me in warm light.

## Learning to Walk Again

You'd think walking is simple. Left foot, right foot, repeat. But trail walking is different. You're reading the ground constantly — loose gravel, embedded rocks, sandy patches that swallow your shoe. Your ankles become little gyroscopes working overtime.

I passed through a field of boulders today that looked like they'd been scattered by a giant playing marbles. The trail wound between them in a way that felt almost playful.

> The desert teaches patience. You can't rush it. The sun won't let you.

## The Blister Report

Let's talk blisters. I've got two forming on my right heel and one on my left pinky toe. I drained them, taped them up with Leukotape, and kept moving. Trail lesson number one: your feet will complain. Your job is to listen, treat, and keep walking.

Met two other hikers at the water cache — "Sunshine" and "Tripod." Trail names already. I haven't earned mine yet. Give it time.`,
    },
    prevPost: { slug: "the-first-step-standing-at-the-southern-terminus", title: "The First Step: Standing at the Southern Terminus", dayNumber: 1 },
    nextPost: { slug: "water-and-gratitude", title: "Water and Gratitude", dayNumber: 5 },
  },
  {
    post: {
      id: "fb-3", title: "Water and Gratitude", slug: "water-and-gratitude",
      dayNumber: 5, date: "2026-04-01", excerpt: "Found a perfect stream today.",
      coverImage: "https://images.unsplash.com/photo-1723995594361-46b69891c6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["VLOG"],
      body: `Found a perfect stream today. Sat with my feet in the cold water and thought about Mom's garden. She always said water was the most honest thing in nature — it goes where it needs to go, no pretense, no hesitation.

## The Vlog

Today's video captures the sound of that stream and the quiet of the canyon around it. I set up my phone on a rock and just talked for a while about why I'm out here. Sometimes you need to hear yourself say it out loud.

The desert section has been dry, so finding running water felt like finding treasure. I filtered two liters, drank one on the spot, and carried the other. Water management is everything out here.

## Trail Magic

A trail angel had left a cooler at the road crossing near mile 40. Inside: cold Gatorade, oranges, and a handwritten note that said "You're doing something amazing." I sat on a rock and cried into my orange. The trail provides, indeed.`,
    },
    prevPost: { slug: "finding-my-rhythm", title: "Finding My Rhythm", dayNumber: 2 },
    nextPost: { slug: "stars-like-ive-never-seen", title: "Stars Like I've Never Seen", dayNumber: 8 },
  },
  {
    post: {
      id: "fb-4", title: "Stars Like I've Never Seen", slug: "stars-like-ive-never-seen",
      dayNumber: 8, date: "2026-04-04", excerpt: "No light pollution out here.",
      coverImage: "https://images.unsplash.com/photo-1763058138710-7d8e263223ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&q=80",
        "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1080&q=80",
        "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1080&q=80",
      ],
      youtubeUrl: "", tags: ["PHOTOS"],
      body: `No light pollution out here. The Milky Way stretches above like a river of light. Dad would have loved this. He was the one who taught me to find Orion, to trace the Big Dipper, to understand that we're small in the best possible way.

## The Night Sky Gallery

I stayed up past midnight to photograph the stars. My phone camera isn't great for astrophotography, but I did my best. The photos below capture a fraction of what it actually looked like — imagine it ten times brighter, with shooting stars every few minutes.

The silence at night in the desert is almost loud. No cars, no planes, no hum of electricity. Just the occasional rustle of a kangaroo rat and the vast, breathing quiet of the earth.

## Dad's Stars

Dad used to take me to the backyard with a flashlight and a star chart. "See that bright one? That's Sirius. The Dog Star." He knew them all. Standing out here, eight days into a walk that would have made him proud, I can feel him looking up with me.

This walk is for you too, Dad. Every star I see, I see through your eyes.`,
    },
    prevPost: { slug: "water-and-gratitude", title: "Water and Gratitude", dayNumber: 5 },
    nextPost: { slug: "through-the-desert-wind", title: "Through the Desert Wind", dayNumber: 15 },
  },
  {
    post: {
      id: "fb-5", title: "Through the Desert Wind", slug: "through-the-desert-wind",
      dayNumber: 15, date: "2026-04-11", excerpt: "The heat is relentless, but the sunsets make it all worthwhile.",
      coverImage: "https://images.unsplash.com/photo-1688057951002-a159e26c7f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["BLOG"],
      body: `The heat is relentless, but the sunsets make it all worthwhile. Day 15 and I've settled into a rhythm: wake at 5am, hike until 11, rest through the worst heat, hike again from 3pm until dark.

## Meeting Sarah

Met a fellow hiker today who lost her mother to breast cancer last year. Her name is Sarah, trail name "Phoenix." We walked together for ten miles and shared stories about our moms. She's hiking the PCT as her own form of healing.

> "Grief doesn't have a finish line," she said. "But walking helps you carry it."

We exchanged numbers and promised to check in at each resupply town. The trail community is something special — strangers become family in the span of a shared water break.

## The Desert Wind

The wind picked up around 2pm and didn't stop. Sand in my eyes, in my teeth, in every fold of my pack. I pulled my buff over my face and pushed through. The desert tests you differently than mountains do. Mountains test your legs. The desert tests your will.

But then — the sunset. Orange and gold and purple streaking across a sky so wide it made me dizzy. I stood on a ridge and watched the sun sink below the horizon, painting the desert floor in colors I don't have names for. Worth every grain of sand.`,
    },
    prevPost: { slug: "stars-like-ive-never-seen", title: "Stars Like I've Never Seen", dayNumber: 8 },
    nextPost: { slug: "wildflower-season", title: "Wildflower Season", dayNumber: 20 },
  },
  {
    post: {
      id: "fb-6", title: "Wildflower Season", slug: "wildflower-season",
      dayNumber: 20, date: "2026-04-16", excerpt: "The desert is blooming.",
      coverImage: "https://images.unsplash.com/photo-1759491265362-3bd88910a036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [
        "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1080&q=80",
        "https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=1080&q=80",
        "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1080&q=80",
      ],
      youtubeUrl: "", tags: ["PHOTOS"],
      body: `The desert is blooming. Purple, yellow, orange — everywhere. Nature's reminder that beauty follows hardship. After weeks of browns and tans, the wildflowers have arrived like a surprise party thrown by the earth.

## The Super Bloom

This year's wildflower season is exceptional. A wet winter meant more water in the soil, and the desert responded with an explosion of color. Lupines, poppies, desert marigolds — fields of them stretching to the horizon.

I stopped for an hour today just to sit among the flowers and take photos. Other hikers passed me with knowing smiles. Nobody rushes through a wildflower field.

## Beauty After Hardship

Mom had a saying: "The best gardens grow after the hardest winters." She wasn't just talking about flowers. After her diagnosis, after the treatment, after the hardest year of our family's life, she planted a garden. Sunflowers, tomatoes, basil. She said it was her way of telling the universe she wasn't done yet.

These wildflowers remind me of her garden. They push through hard, dry earth and bloom anyway. That's what people fighting cancer do. They bloom anyway.`,
    },
    prevPost: { slug: "through-the-desert-wind", title: "Through the Desert Wind", dayNumber: 15 },
    nextPost: { slug: "sierra-nights", title: "Sierra Nights", dayNumber: 30 },
  },
  {
    post: {
      id: "fb-7", title: "Sierra Nights", slug: "sierra-nights",
      dayNumber: 30, date: "2026-04-26", excerpt: "The stars remind me of camping with my dad.",
      coverImage: "https://images.unsplash.com/photo-1759150954328-8b0b005ade84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["VLOG"],
      body: `The stars remind me of camping with my dad. I can feel him walking with me. Tonight's vlog is for him. Thirty days on the trail, and I'm approaching the Sierra Nevada — the real mountains begin.

## The Vlog

In tonight's video I talk about the transition from desert to mountains, the gear changes I'm making, and a quiet moment around the campfire where I read a letter Dad wrote me before he passed. It's the first time I've read it on camera.

## Entering the Sierra

The terrain is shifting. More pine trees, cooler nights, and the first patches of snow on distant peaks. I'll need my microspikes and ice axe soon. The desert was hard in its dryness; the Sierra will be hard in its altitude and snow.

> My pack weighs 28 pounds now. In the Sierra, it'll be 35 with the bear canister and extra layers. My knees are already filing a formal complaint.

## One Month Down

Thirty days. Roughly 450 miles. I've worn through one pair of shoes, eaten approximately 90 tortillas, and seen things that will stay with me forever. The fundraising total is climbing — every notification on my phone reminds me that people believe in this mission.

Five more months to go. One step at a time.`,
    },
    prevPost: { slug: "wildflower-season", title: "Wildflower Season", dayNumber: 20 },
    nextPost: null,
  },
];

function getFallbackPost(slug: string): JournalPostDetailResponse | null {
  return fallbackPosts.find((p) => p.post.slug === slug) || null;
}
