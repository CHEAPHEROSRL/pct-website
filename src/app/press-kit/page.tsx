import Image from "next/image";
import { Download, Globe, Camera, Video, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import HeroParallax from "@/components/HeroParallax";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

const storyAngles = [
  {
    num: "01",
    title: "A Son's Tribute: Walking 2,650 Miles for the Parents He Lost",
    description:
      "A deeply personal story of grief, love, and purpose. Paul's journey is a living memorial to his father and mother — and a message to everyone fighting cancer that they are not alone.",
  },
  {
    num: "02",
    title: "What Does 2,650 Miles Actually Look Like?",
    description:
      "The physical and mental demands of thru-hiking the PCT — training, nutrition, gear, and the psychological challenge of walking every single day for six months through some of America's most extreme landscapes.",
  },
  {
    num: "03",
    title: "Cancer by the Numbers: Why Pledge Walks Like This Matter",
    description:
      "With 1 in 3 people receiving a cancer diagnosis in their lifetime, community-funded awareness campaigns play a critical role. This angle explores how individual acts of endurance translate into real research funding.",
  },
  {
    num: "04",
    title: "Filming the PCT: Hands-Free, 360°, and Real",
    description:
      "Paul carries three cameras — Meta Ray-Ban smart glasses for hands-free POV hiking footage, an Insta360 for immersive 360° captures, and an iPhone for daily vlogs and social content. A rare window into what a 2,650-mile walk truly looks like.",
  },
];

const portraitPhotos = [
  {
    src: "/images/portraits/20260118_124144.jpg",
    thumb: "/images/portraits/20260118_124144.jpg",
    caption: "Paul Barry — Jan 2026",
    filename: "paul-barry-portrait-2026.jpg",
  },
  {
    src: "/images/portraits/20251214_133250.jpg",
    thumb: "/images/portraits/20251214_133250.jpg",
    caption: "Paul Barry — Dec 2025",
    filename: "paul-barry-portrait-dec-2025.jpg",
  },
  {
    src: "/images/portraits/20250517_144438.jpg",
    thumb: "/images/portraits/20250517_144438.jpg",
    caption: "Paul Barry — May 2025",
    filename: "paul-barry-portrait-may-2025.jpg",
  },
];

const actionPhotos = [
  {
    src: "/images/hiking/20260201_123623.jpg",
    thumb: "/images/hiking/20260201_123623.jpg",
    caption: "Trail Ready — Feb 2026",
    filename: "paul-barry-trail-ready-2026.jpg",
  },
  {
    src: "/images/hiking/20230824_122513.jpg",
    thumb: "/images/hiking/20230824_122513.jpg",
    caption: "High Sierra — Aug 2023",
    filename: "paul-barry-sierra-nevada-2023.jpg",
  },
  {
    src: "/images/hiking/20230821_165432.jpg",
    thumb: "/images/hiking/20230821_165432.jpg",
    caption: "Pacific Northwest Forest",
    filename: "paul-barry-pnw-forest.jpg",
  },
  {
    src: "/images/hiking/20240128_110150.jpg",
    thumb: "/images/hiking/20240128_110150.jpg",
    caption: "Desert Section Training",
    filename: "paul-barry-desert-trail.jpg",
  },
  {
    src: "/images/family/2026-03-18.jpeg",
    thumb: "/images/family/2026-03-18.jpeg",
    caption: "Paul with his parents — March 2026",
    filename: "paul-barry-family-march-2026.jpg",
  },
  {
    src: "/images/family/FB_IMG_1761627851598.jpg",
    thumb: "/images/family/FB_IMG_1761627851598.jpg",
    caption: "Paul and his father",
    filename: "paul-barry-and-father.jpg",
  },
];

const filmingGear = [
  {
    icon: Camera,
    name: "Meta Ray-Ban Smart Glasses",
    description:
      "Hands-free POV footage captured while actively hiking. No stopping, no setup — the most authentic trail perspective possible.",
    content: "Raw trail POV, wildlife encounters, daily walk footage",
  },
  {
    icon: Video,
    name: "Insta360 Camera",
    description:
      "Immersive 360° captures of iconic PCT landscapes — from desert sunrises to Sierra snowfields to Oregon's Crater Lake.",
    content: "360° immersive scenes, time-lapses, camp-life moments",
  },
  {
    icon: Smartphone,
    name: "iPhone — Daily Vlog & Social",
    description:
      "Edited daily updates, Instagram Reels, and short-form social content. Published directly to YouTube and Instagram from the trail.",
    content: "Daily vlogs, Reels, interviews, milestone moments",
  },
];

export default function PressKitPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header transparent />

      {/* Hero */}
      <section className="relative w-full h-[440px] overflow-hidden">
        <HeroParallax>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hiking/20260201_123623.jpg')" }}
          />
        </HeroParallax>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1F1AEE] to-[#1C1F1A88]" />
        <div className="relative z-10 flex flex-col justify-center gap-[16px] h-full px-6 md:px-12 lg:px-[120px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)] animate-fade-up">
            PRESS KIT · YESCHAPTER 2026
          </span>
          <h1 className="font-heading font-semibold text-[36px] md:text-[52px] lg:text-[60px] leading-[1.05] tracking-[-1px] text-[var(--text-white)] animate-fade-up stagger-2 max-w-[700px]">
            Cover Paul&apos;s Story
          </h1>
          <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[#FFFFFFCC] max-w-[560px] animate-fade-up stagger-4">
            A 2,650-mile walk from Mexico to Canada in honor of two parents lost to cancer.
            Everything a journalist, podcaster, or partner needs to tell this story.
          </p>
        </div>
      </section>

      {/* Facts bar */}
      <section className="flex flex-wrap items-center justify-around gap-6 px-6 md:px-12 lg:px-[120px] py-[28px] bg-[var(--bg-dark)] w-full">
        {[
          { value: "2,650", label: "MILES ON TRAIL" },
          { value: "~180", label: "DAYS HIKING" },
          { value: "2026", label: "YEAR OF THE HIKE", highlight: true },
          { value: "Mexico → Canada", label: "ROUTE" },
          { value: "2 Foundations", label: "BENEFITING CANCER RESEARCH" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-[4px]">
            <span className={`font-heading font-semibold text-[28px] md:text-[32px] ${f.highlight ? "text-[var(--burnt-orange)]" : "text-[var(--text-white)]"}`}>
              {f.value}
            </span>
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">{f.label}</span>
          </div>
        ))}
      </section>

      {/* Bio */}
      <section className="flex flex-col lg:flex-row items-center gap-[48px] lg:gap-[80px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="slide-right" className="w-full lg:w-[400px] shrink-0">
          <div className="relative w-full h-[420px] lg:h-[500px] overflow-hidden rounded-[2px]">
            <Image
              src="/images/portraits/20260118_124144.jpg"
              alt="Paul Barry"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
          </div>
        </ScrollReveal>
        <ScrollReveal animation="slide-left" className="flex flex-col gap-[24px] flex-1">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">ABOUT PAUL</span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[38px] leading-[1.15] tracking-[-0.5px] text-[var(--text-primary)]">
            The Man Behind the Walk
          </h2>
          <p className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)]">
            Paul Barry lost both of his parents to cancer within two years of each other. His father
            passed in California; his mother in Sydney. In their honor — and for every family walking
            the same painful road — Paul is thru-hiking the Pacific Crest Trail in 2026.
          </p>
          <p className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)]">
            The PCT runs 2,650 miles from the Mexican border to Manning Park in British Columbia,
            through desert, mountain, and rainforest. Paul will walk every mile — approximately 180
            days — while collecting pledges for the Leukaemia Foundation of Australia and City of Hope
            in California.
          </p>
          <div className="border-l-[4px] border-[var(--burnt-orange)] pl-[20px] flex flex-col gap-[8px]">
            <p className="font-heading font-semibold italic text-[16px] leading-[1.6] text-[var(--text-primary)]">
              &ldquo;I&apos;m walking for both of them. And for every person who&apos;s had to say
              goodbye too soon.&rdquo;
            </p>
            <span className="font-label font-semibold text-[12px] tracking-[1px] text-[var(--burnt-orange)]">— Paul Barry</span>
          </div>
        </ScrollReveal>
      </section>

      {/* Story Angles */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-warm)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">STORY ANGLES</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">Ways to Cover This Story</h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
          {storyAngles.map((a) => (
            <ScrollReveal key={a.num} animation="fade-up">
              <div className="flex flex-col gap-[12px] bg-[var(--bg-white)] px-[32px] py-[28px] border border-[var(--border-subtle)] h-full">
                <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">{a.num}</span>
                <h3 className="font-heading font-semibold text-[18px] md:text-[20px] leading-[1.3] text-[var(--text-primary)]">{a.title}</h3>
                <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">{a.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How Paul Films */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-dark)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">CONTENT PRODUCTION</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-white)]">How Paul Films the Trail</h2>
            <p className="font-heading text-[16px] leading-[1.7] text-[#FFFFFFAA] max-w-[600px]">
              Three cameras. Three perspectives. A documentary-quality record of every day on the PCT.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full">
          {filmingGear.map((gear) => (
            <ScrollReveal key={gear.name} animation="fade-up">
              <div className="flex flex-col gap-[16px] bg-[#FFFFFF08] border border-[#FFFFFF12] px-[28px] py-[32px] h-full">
                <gear.icon className="w-[28px] h-[28px] text-[var(--burnt-orange)]" />
                <h3 className="font-heading font-semibold text-[18px] text-[var(--text-white)]">{gear.name}</h3>
                <p className="font-heading text-[14px] leading-[1.7] text-[#FFFFFFAA]">{gear.description}</p>
                <div className="mt-auto pt-[12px] border-t border-[#FFFFFF12]">
                  <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--burnt-orange)]">CONTENT: </span>
                  <span className="font-label text-[11px] text-[#FFFFFF66]">{gear.content}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Portrait Photos */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">MEDIA ASSETS — PORTRAITS</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">Portrait Photos</h2>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-muted)]">
              Click to download. Credit: <span className="text-[var(--text-secondary)]">Paul Barry / yeschapter.com</span>
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px] w-full">
          {portraitPhotos.map((p) => (
            <PhotoDownloadCard key={p.filename} {...p} />
          ))}
        </div>
      </section>

      {/* Action & Story Photos */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-warm)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">MEDIA ASSETS — TRAIL & STORY</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">Action & Story Photos</h2>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-muted)]">
              Click to download. Credit: <span className="text-[var(--text-secondary)]">Paul Barry / yeschapter.com</span>
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] w-full">
          {actionPhotos.map((p) => (
            <PhotoDownloadCard key={p.filename} {...p} />
          ))}
        </div>
      </section>

      {/* Media Contact */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-dark)] w-full">
        <ScrollReveal animation="fade-in">
          <div className="flex flex-col items-center gap-[32px] w-full">
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">MEDIA CONTACT</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] text-[var(--text-white)] text-center">
              Ready to Tell This Story?
            </h2>
            <p className="font-heading text-[16px] leading-[1.7] text-[#FFFFFFAA] text-center max-w-[500px]">
              For interview requests, partnership inquiries, high-res assets, or press questions —
              reach out and Paul will respond personally.
            </p>
            <div className="flex flex-col items-center gap-[20px] border border-[#FFFFFF15] bg-[#FFFFFF0D] px-[48px] py-[40px] w-full max-w-[480px]">
              <span className="font-heading font-semibold text-[22px] text-[var(--text-white)]">Paul Barry</span>
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">PCT THRU-HIKER · YESCHAPTER 2026</span>
              <div className="w-[48px] h-[1px] bg-[#FFFFFF22]" />
              <ObfuscatedEmail className="font-label font-semibold text-[15px] tracking-[0.5px] text-[var(--text-white)] hover:text-[var(--burnt-orange)] transition-colors" />
              <div className="flex items-center gap-[10px]">
                <Globe className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
                <span className="font-label font-semibold text-[15px] tracking-[0.5px] text-[var(--text-white)]">yeschapter.com</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}

function PhotoDownloadCard({
  src,
  caption,
  filename,
}: {
  src: string;
  caption: string;
  filename: string;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="relative w-full h-[220px] overflow-hidden bg-[var(--bg-warm)]">
        <Image src={src} alt={caption} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      </div>
      <div className="flex items-center justify-between gap-[8px]">
        <span className="font-label font-semibold text-[12px] tracking-[1px] text-[var(--text-muted)] leading-[1.4]">{caption}</span>
        <a
          href={src}
          download={filename}
          className="flex items-center gap-[6px] shrink-0 bg-[var(--burnt-orange)] px-[14px] py-[8px] hover:opacity-90 transition-opacity"
        >
          <Download className="w-[12px] h-[12px] text-white" />
          <span className="font-label font-bold text-[10px] tracking-[1px] text-white">DOWNLOAD</span>
        </a>
      </div>
    </div>
  );
}
