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
    nextPost: { slug: "how-pledging-works", title: "How Pledging Works — A Complete Guide", dayNumber: 0 },
  },
  {
    post: {
      id: "fb-guide-1", title: "How Pledging Works — A Complete Guide", slug: "how-pledging-works",
      dayNumber: 0, date: "2026-03-10", excerpt: "Everything you need to know about pledging per mile: how it works, when you pay, where the money goes, and why this model keeps Paul accountable.",
      coverImage: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["BLOG"],
      body: `This is a complete guide to how the pledge-per-mile system works for Paul's PCT fundraiser. Whether you're considering making a pledge or you've already pledged and want to understand the details, this post covers everything.

## The Big Idea

Instead of donating a lump sum upfront, you pledge a small amount per mile that Paul walks on the Pacific Crest Trail. The more miles Paul completes, the more your pledge is worth. **You pay nothing now.** Payment only happens after Paul finishes — and only for the miles he actually walked.

This model does two important things:
1. **It keeps Paul accountable.** If he doesn't walk, you don't pay. Every dollar of your pledge is earned on the trail, mile by mile.
2. **It creates momentum.** As Paul racks up miles, the total fundraising amount grows in real-time — creating excitement and encouraging others to join.

---

## Step by Step: How It Works

### Step 1 — Set Your Pledge

Go to the [Pledge page](/pledge) and choose how much you want to pledge per mile. You can pick a preset like 10¢/mile or $1/mile, or set a custom amount with the slider.

You'll also choose a **pledge interval** — every mile, every 10 miles, or every 100 miles. This just changes the unit, not the math. For example:
- **$0.10 per mile** = $265 total if Paul completes all 2,650 miles
- **$1.00 per 10 miles** = also $265 total
- **$10.00 per 100 miles** = also $265 total

All three are equivalent. Pick whichever feels most natural to you.

### Step 2 — Paul Walks

Once your pledge is set, that's it for now. Paul hits the trail and you follow along. You can:
- Track his progress on the [Trail Map](/trail-map)
- Read his [Journal](/journal) entries
- Watch your running total grow on your [Pledge Dashboard](/my-pledge)
- Participate in trail challenges to boost your pledge (more on that below)

**You are not charged anything during this phase.** Your pledge is a commitment of intent, not a payment.

### Step 3 — Paul Finishes (or Doesn't)

When Paul reaches Manning Park, BC — the northern terminus of the PCT — you'll receive an email with:
- A personal thank-you video from Paul
- Your final pledge total (based on actual miles walked)
- A link to donate your pledge amount directly to the two cancer foundations

**If Paul doesn't finish the full trail**, your pledge total is calculated based on the miles he actually completed. If he walks 1,500 of 2,650 miles, a $0.10/mile pledge would be $150, not $265.

---

## Where Does the Money Go?

**100% of your pledge goes to two cancer foundations.** Paul receives $0 from pledges and donations.

The two foundations are:
- **Cancer Foundation — California** (50% of your pledge)
- **Cancer Foundation — Sydney, Australia** (50% of your pledge)

These foundations fund cancer research, patient support programs, screening events, and prevention education. Paul chose one in each hemisphere to honor both his parents — his mother, who was treated in Sydney, and his father, who was treated in California.

> **Paul takes nothing.** Not a cent. Pledges and donations go directly to the foundations. If you want to support Paul on the trail (food, gear, rest days), that's a separate stream through the [Support Paul](/support) page.

---

## The Pledge Dashboard

After you pledge, you can check your [Pledge Dashboard](/my-pledge) anytime by entering the email you used. Your dashboard shows:

- **Your running total** — how much your pledge is currently worth based on miles Paul has walked so far
- **Your pledge rate** — your per-mile amount, including any challenge boosts
- **Foundation split** — how your pledge will be divided between the two foundations
- **Pledge history** — your original pledge and any boosts from challenges

---

## Challenge Boosts

During the hike, Paul will occasionally set **trail challenges** — time-boxed goals like "Hike 30 miles in 24 hours" or "Summit Mt. Whitney by Friday." When a challenge is active, you can **boost your pledge** by committing extra cents per mile.

Here's how it works:
1. A challenge goes live (you'll see a banner across the site)
2. You enter your email and a boost amount (e.g., +$0.05/mile)
3. The boost is **pre-committed** — it only applies if Paul succeeds
4. If Paul completes the challenge, your boost is permanently added to your pledge rate
5. If Paul fails, nothing changes — no boost is applied

Boosts stack. If you boost during three challenges, all three amounts are added to your base pledge. You can see your complete boost history on your Pledge Dashboard.

---

## Frequently Asked Questions

**When do I actually pay?**
Only after Paul reaches Canada (or stops hiking). You'll receive an email with a donation link. Payment is voluntary — you won't be auto-charged.

**Is there a minimum pledge?**
Yes, the minimum is $0.01 per mile ($26.50 total if Paul finishes). There's no maximum.

**Can I change my pledge?**
You can increase your pledge anytime by visiting the [Pledge page](/pledge) again with the same email. Challenge boosts also increase your pledge automatically.

**What if I can't pay the full amount at the end?**
That's okay. The pledge is a commitment of intent, not a binding contract. Donate what you can when the time comes. Every dollar helps.

**Is my pledge anonymous?**
If you leave the name field blank when pledging, you'll appear as "Anonymous" on the pledger wall. Your email is never displayed publicly.

**Can I also make a one-time donation?**
Absolutely. Visit the [Donate page](/donate) to make a one-time donation anytime. Donations also go 100% to the two cancer foundations.

**What about supporting Paul directly?**
If you want to buy Paul a meal, new boots, or fund a rest day, visit the [Support Paul](/support) page. Trail support goes directly to Paul and is completely separate from the cancer foundation fundraiser.

---

## Why This Model?

Paul chose the pledge-per-mile model because it aligns everyone's incentives:
- **You** only pay for real miles walked
- **Paul** is motivated to complete every mile, knowing each step grows the total
- **The foundations** benefit from a system that encourages participation and builds over time

It turns a solo hike into a team effort. Every mile Paul walks, hundreds of pledgers are walking with him in spirit — and in dollars.

---

## Ready to Pledge?

[Set your pledge now →](/pledge) — it takes 30 seconds and costs nothing upfront.

Already pledged? [Check your dashboard →](/my-pledge) to see your running total.`,
    },
    prevPost: { slug: "sierra-nights", title: "Sierra Nights", dayNumber: 30 },
    nextPost: { slug: "as-a-man-thinketh", title: "As a Man Thinketh — The Book That Made Me Walk", dayNumber: 0 },
  },
  {
    post: {
      id: "fb-guide-2", title: "As a Man Thinketh — The Book That Made Me Walk", slug: "as-a-man-thinketh",
      dayNumber: 0, date: "2026-03-15", excerpt: "A small book from 1903 changed how I see this entire journey. James Allen wrote that your thoughts shape your reality. I believe him — and that belief is why I'm walking 2,650 miles.",
      coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      images: [], youtubeUrl: "", tags: ["BLOG"],
      body: `There's a book I keep coming back to. It's barely 30 pages long. It was written in 1903 by a man named James Allen, and it's called *As a Man Thinketh*. I first read it years ago, long before I ever considered walking 2,650 miles through the wilderness. But when I look back at every decision that led me to this trail, I can trace them all back to the ideas in that book.

I want to share what it means to me, and why I think it matters — not just for this hike, but for anyone facing something hard.

---

## The Book

James Allen was a British writer and philosopher. He lived a quiet life and died in 1912 at the age of 47. He wasn't famous during his lifetime. He didn't have a huge following or a bestseller. But *As a Man Thinketh* outlived him by a century and then some, because it says something true in a way that doesn't expire.

The central idea is simple: **you become what you think about.** Not in a magical, wish-it-into-existence way. In a practical, daily, brick-by-brick way. Your thoughts shape your character. Your character shapes your actions. Your actions shape your life.

Allen wrote:

> "A man is literally what he thinks, his character being the complete sum of all his thoughts."

That line hit me the first time I read it. It hit me again when Mom was diagnosed. And again when Dad was. And again when I decided to walk.

---

## How It Changed My Thinking

When both my parents were fighting cancer, I had a lot of dark thoughts. That's natural. That's human. But I noticed something — the more I dwelled in helplessness, the more helpless I became. Not because thinking positively would cure cancer. It wouldn't. But because my thoughts were determining what I *did* with my grief.

Allen writes about this beautifully:

> "A man cannot directly choose his circumstances, but he can choose his thoughts, and so indirectly, yet surely, shape his circumstances."

I couldn't choose what happened to Mom and Dad. But I could choose what to do with the weight of losing them. I could sit with it, or I could walk with it. I chose to walk.

That choice didn't come from nowhere. It came from years of reading Allen's words and slowly absorbing his core belief: that we are not victims of our circumstances, but sculptors of our response to them.

---

## The Stoic Thread

*As a Man Thinketh* is often grouped with Stoic philosophy, and I think that's right. The Stoics — Marcus Aurelius, Epictetus, Seneca — all said versions of the same thing: **you control your mind, and your mind controls your experience.**

Epictetus said: "It's not what happens to you, but how you react to it that matters."

Marcus Aurelius said: "The happiness of your life depends upon the quality of your thoughts."

Allen was walking the same path, 1,800 years later. And now I'm walking mine.

There's something about Stoic philosophy that makes more sense on a trail than in a classroom. Out here, you face discomfort every day. Blisters, heat, rain, exhaustion, loneliness. You can't control any of it. But you can control how you meet it — and that, the Stoics would say, is the only thing that matters.

---

## Why I'm Really Walking

People ask me all the time: "Why walk 2,650 miles? Why not just donate the money yourself? Why put yourself through this?"

And the honest answer is: because of what Allen taught me about purpose.

He wrote:

> "Until thought is linked with purpose there is no intelligent accomplishment."

I had grief. I had anger at cancer. I had love for my parents. But I didn't have a *purpose* — something to channel all of that into. The PCT gave me that. Every mile is a mile walked with intention. Every dollar raised is a dollar aimed at something meaningful. Every step is a thought made physical.

That's what Allen means when he says thought becomes action becomes destiny. This walk *is* my thinking made manifest. The 2,650 miles are what it looks like when grief is transformed into purpose.

---

## What Allen Says About Suffering

There's a passage in the book that I've carried with me since losing Dad. Allen writes:

> "Suffering is always the effect of wrong thought in some direction. It is an indication that the individual is out of harmony with himself."

Now, I don't think he means that people who suffer deserve it, or that sick people brought it on themselves. That would be cruel and wrong. I think what he means is this: when we suffer *mentally* — when we're consumed by bitterness, resentment, or despair — it's a signal that we need to realign our thinking.

Mom and Dad suffered physically. That wasn't their fault. But I was suffering *mentally* in a way that was entirely within my control. I was angry at the world. I was asking "why us?" over and over. And that anger was eating me alive.

Allen helped me see that the anger wasn't serving them. It was only hurting me. And the moment I redirected that energy — into this walk, into this fundraiser, into something that might actually help other families — the suffering didn't disappear, but it became bearable. It became *useful*.

---

## A Book for the Trail

I'm carrying a physical copy of *As a Man Thinketh* on this hike. It weighs almost nothing — maybe two ounces. In ultralight hiking, every ounce matters. But this book earns its place in my pack.

When I'm tired and my feet hurt and the trail feels endless, I read a page or two. And I'm reminded that the trail isn't happening *to* me. I chose it. My thoughts chose it. And my thoughts can carry me through it.

Allen's final chapter is called "Visions and Ideals." He writes:

> "The dreamers are the saviors of the world. He who cherishes a beautiful vision, a lofty ideal in his heart, will one day realize it."

I dream of a world where fewer families go through what mine did. That's the vision. The PCT is the vehicle. And the fundraiser — your pledges, your donations — that's the fuel.

---

## Why I'm Telling You This

I'm not writing this to tell you to think positive and everything will be fine. Life doesn't work like that. Cancer doesn't care about your mindset.

But I am writing this because I believe — deeply, in my bones — that what we think about determines what we do. And what we do determines who we become.

If you're reading this and you're going through something hard, I want you to know: you get to choose your next thought. You get to choose what you do with your pain. You can't always control what happens to you, but you can control the direction you walk.

That's what *As a Man Thinketh* taught me. That's what this trail is teaching me every day. And that's why I think everyone should read this little book at least once.

---

## Read the Book

*As a Man Thinketh* by James Allen is in the public domain. You can read it for free online, or pick up a copy for a few dollars. It takes about 30 minutes to read. It might take a lifetime to fully absorb.

If you read it, I'd love to hear what you think. Drop a message when you [pledge](/pledge) or [donate](/donate) — tell me your favorite line.

And if you're walking with me on this journey — literally or through your support — thank you. Every step, every pledge, every dollar is a thought made real. Allen would be proud.`,
    },
    prevPost: { slug: "how-pledging-works", title: "How Pledging Works — A Complete Guide", dayNumber: 0 },
    nextPost: null,
  },
];

function getFallbackPost(slug: string): JournalPostDetailResponse | null {
  return fallbackPosts.find((p) => p.post.slug === slug) || null;
}
