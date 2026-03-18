import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import HomeTrailProgress from "@/components/HomeTrailProgress";
import ScrollReveal from "@/components/ScrollReveal";
import HeroParallax from "@/components/HeroParallax";
import {
  Heart,
  Calendar,
  Tent,
  Smartphone,
  Shield,
  Sun,
  ChevronDown,
  ArrowRight,
} from "lucide-react";


export default function Home() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header transparent />
      {/* Hero Section — negative margin pulls it behind sticky header + banner */}
      <section className="relative w-full h-[560px] md:h-[680px] lg:h-[800px] overflow-hidden -mt-[112px] md:-mt-[120px] lg:-mt-[132px]">
        <HeroParallax>
          <Image
            src="/images/hiking/FB_IMG_1771991299919.jpg"
            alt="Pacific Crest Trail"
            fill
            className="object-cover object-[center_70%]"
            priority
          />
        </HeroParallax>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #1C1F1A88 0%, #1C1F1A44 40%, #1C1F1ADD 100%)",
          }}
        />
        <div className="relative flex flex-col justify-end gap-[16px] md:gap-[24px] h-full px-6 md:px-12 lg:px-[120px] pb-[40px] md:pb-[60px] lg:pb-[80px]">
          <div className="animate-fade-up flex items-center bg-[var(--burnt-orange)] px-[16px] py-[6px] w-fit">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">
              247 PLEDGERS &nbsp;&middot;&nbsp; $12,450 PLEDGED &nbsp;&middot;&nbsp; PCT 2026
            </span>
          </div>
          <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[40px] lg:text-[56px] leading-[1.1] tracking-[-1px] text-[var(--text-white)] w-full lg:w-[800px]">
            One man. One trail.{"\n"}One cause worth walking for.
          </h1>
          <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] leading-[1.6] text-[#FFFFFFCC]">
            2,650 miles. Mexico to Canada. Walking for cancer.
          </p>
          <div className="animate-fade-up stagger-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-[16px]">
            <Link
              href="/pledge"
              className="flex items-center justify-center gap-[10px] border-2 border-white px-[28px] lg:px-[40px] py-[14px] lg:py-[18px] hover:bg-white/10 transition-colors"
            >
              <span className="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[var(--text-white)]">
                PLEDGE NOW
              </span>
              <Heart className="w-[16px] h-[16px] text-[var(--text-white)]" />
            </Link>
            <Link
              href="/trail-map"
              className="flex items-center justify-center gap-[10px] px-[28px] lg:px-[40px] py-[14px] lg:py-[18px] hover:bg-white/10 transition-colors"
            >
              <span className="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[#FFFFFF66]">
                FOLLOW THE JOURNEY
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* About The Journey */}
      <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[16px] w-full">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">THE JOURNEY</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
              2,650 Miles From Mexico to Canada
            </h2>
            <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center w-full lg:w-[720px]">
              The Pacific Crest Trail stretches from the Mexican border at Campo, California to Manning Park at the Canadian border in Washington. Paul will traverse deserts, mountain passes, and ancient forests — documenting every step of his journey.
            </p>
          </div>
        </ScrollReveal>
        <div className="flex flex-col gap-[24px] w-full">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row gap-[24px]">
            <ScrollReveal animation="fade-up" className="flex-1">
              <div className="flex flex-col gap-[20px] h-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
                <Calendar className="w-[32px] h-[32px] text-[var(--forest-green)]" />
                <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Starting March 2026</span>
                <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  Beginning at the Southern Terminus near Campo, CA. Walking northbound through California, Oregon, and Washington.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={120} className="flex-1">
              <div className="flex flex-col gap-[20px] h-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
                <Tent className="w-[32px] h-[32px] text-[var(--forest-green)]" />
                <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Living Simply</span>
                <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  Sleeping in a tent, carrying everything on his back. No luxury — just the trail, the sky, and the mission that drives him forward every day.
                </p>
              </div>
            </ScrollReveal>
          </div>
          {/* Row 2 */}
          <ScrollReveal animation="fade-up" delay={240}>
            <div className="flex flex-col gap-[20px] w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
              <Smartphone className="w-[32px] h-[32px] text-[var(--forest-green)]" />
              <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Daily Documentation</span>
              <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                Every day, Paul will share photos, videos, and reflections from the trail. Follow his progress and experience the PCT through his eyes.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trail Progress — Live Map */}
      <ScrollReveal animation="fade-in">
        <HomeTrailProgress />
      </ScrollReveal>

      {/* The Cause */}
      <section className="flex flex-col lg:flex-row w-full bg-[var(--bg-dark)]">
        <ScrollReveal animation="slide-right" className="relative w-full lg:w-[580px] h-[300px] md:h-[400px] lg:h-[700px] shrink-0 overflow-hidden">
          <Image
            src="/images/family/FB_IMG_1729964832568.jpg"
            alt="The Cause"
            fill
            className="object-cover"
          />
        </ScrollReveal>
        <ScrollReveal animation="slide-left" className="flex flex-col justify-center gap-[24px] lg:gap-[32px] flex-1 p-6 md:p-12 lg:p-[80px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">WHY I WALK</span>
          <h2 className="font-heading font-semibold text-[26px] md:text-[32px] lg:text-[38px] leading-[1.2] tracking-[-0.5px] text-[var(--text-white)]">
            For My Parents.{"\n"}For Everyone Fighting.
          </h2>
          <p className="font-heading italic text-[18px] leading-[1.7] text-[#FFFFFFAA]">
            &quot;In the last few years, I lost both of my parents to cancer. This trail isn&apos;t just a walk — it&apos;s a promise. A promise that their struggle wasn&apos;t in vain, and that we can do more to prevent others from going through the same pain.&quot;
          </p>
          <span className="font-label font-semibold text-[13px] tracking-[1px] text-[var(--burnt-orange)]">— Paul Barry</span>
          <div className="w-[60px] h-[3px] bg-[var(--burnt-orange)]" />
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[12px]">
              <Heart className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Supporting cancer survivors and patients</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <Shield className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Raising awareness for cancer prevention</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <Sun className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Promoting healthy lifestyle habits that reduce cancer risk</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Pledger Wall */}
      <section className="flex flex-col items-center gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[16px] w-full">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">PLEDGER WALL</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
              People Who Make This Possible
            </h2>
            <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center">
              Every pledge brings us closer to the goal. Thank you to everyone walking with Paul.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] w-full">
          <ScrollReveal animation="fade-up" className="flex flex-col gap-[12px]">
            <DonorCard name="Sarah Mitchell" amount="$0.25/mi" color="#3D7A5A" />
            <DonorCard name="James O'Connor" amount="$1.00/mi" color="#C45C26" />
            <DonorCard name="Linda Chen" amount="$0.10/mi" color="#8B7355" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100} className="flex flex-col gap-[12px]">
            <DonorCard name="Robert Williams" amount="$2.00/mi" color="#6B8E7B" />
            <DonorCard name="Maria Rodriguez" amount="$0.05/mi" color="#7B6B8E" />
            <DonorCard name="Tom & Lisa Park" amount="$0.50/mi" color="#3D7A5A" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200} className="flex flex-col gap-[12px]">
            <DonorCard name="David Thompson" amount="$0.10/mi" color="#A68B5B" />
            <DonorCard name="Anonymous" amount="$5.00/mi" color="#5B8EA6" />
            <DonorCard name="Emily Watson" amount="$0.01/mi" color="#C45C26" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300} className="flex flex-col gap-[12px]">
            <DonorCard name="Rachel Kim" amount="$0.25/mi" color="#6B7B5B" />
            <DonorCard name="Michael Foster" amount="$1.00/mi" color="#8E6B7B" />
            <DonorCard name="Dr. Amanda Brooks" amount="$0.50/mi" color="#5B6B8E" />
          </ScrollReveal>
        </div>
        <Link
          href="/pledgers"
          className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px]"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">VIEW ALL PLEDGERS</span>
          <ChevronDown className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
        </Link>
      </section>

      {/* Blog / Vlog */}
      <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-warm)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0 w-full">
            <div className="flex flex-col gap-[16px]">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL JOURNAL</span>
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
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">VIEW ALL POSTS</span>
              <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
          {/* Blog Post 1 */}
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="relative w-full h-[220px]">
                <Image
                  src="/images/hiking/20250802_160435.jpg"
                  alt="The First Step"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[12px] p-[24px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 1</span>
                  <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; MARCH 28, 2026</span>
                </div>
                <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">The First Step</span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  Standing at the southern monument, looking north toward Canada. 2,650 miles of trail ahead. This is the moment everything changes.
                </p>
                <div className="flex gap-[8px]">
                  <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">BLOG</span>
                  <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">VIDEO</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Blog Post 2 */}
          <ScrollReveal animation="fade-up" delay={120}>
            <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="relative w-full h-[220px]">
                <Image
                  src="/images/hiking/20220822_134557.jpg"
                  alt="Through the Desert Wind"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[12px] p-[24px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 15</span>
                  <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; APRIL 11, 2026</span>
                </div>
                <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Through the Desert Wind</span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  The heat is relentless, but the sunsets make it all worthwhile. Today I met a fellow hiker who lost her mother to breast cancer.
                </p>
                <div className="flex gap-[8px]">
                  <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">BLOG</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Blog Post 3 */}
          <ScrollReveal animation="fade-up" delay={240}>
            <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="relative w-full h-[220px]">
                <Image
                  src="/images/hiking/20230824_122513.jpg"
                  alt="Sierra Nights"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[12px] p-[24px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 30</span>
                  <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; APRIL 26, 2026</span>
                </div>
                <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Sierra Nights</span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  The stars out here remind me of camping with my dad. I can feel him walking with me. Tonight&apos;s vlog is for him.
                </p>
                <div className="flex gap-[8px]">
                  <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">VLOG</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="relative w-full h-[420px] md:h-[450px] lg:h-[480px] overflow-hidden">
        <HeroParallax>
          <Image
            src="/images/hiking/FB_IMG_1771992929191.jpg"
            alt="Mountain sunset"
            fill
            className="object-cover"
          />
        </HeroParallax>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #1C1F1ADD 0%, #1C1F1ACC 100%)",
          }}
        />
        <div className="relative flex flex-col items-center justify-center gap-[16px] md:gap-[24px] h-full px-6 md:px-12 lg:px-[120px]">
          <ScrollReveal animation="fade-up">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">EVERY MILE MATTERS</span>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="font-heading font-semibold text-[24px] md:text-[34px] lg:text-[42px] leading-[1.2] tracking-[-0.5px] text-[var(--text-white)] text-center w-full lg:w-[800px]">
              Walk With Paul.{"\n"}Join the Fight Against Cancer.
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="font-heading text-[15px] md:text-[18px] leading-[1.6] text-[#FFFFFFAA] text-center w-full lg:w-[600px]">
              Pledge per mile for <Link href="/foundations" className="underline hover:text-white">two cancer foundations</Link> — one in California, one in Sydney. Pay nothing now — pledge directly to the foundations when Paul reaches Canada. You can also support Paul directly on the trail.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-[16px]">
              <Link
                href="/pledge"
                className="flex items-center justify-center gap-[10px] bg-[var(--burnt-orange)] px-[32px] lg:px-[48px] py-[16px] lg:py-[20px] hover:opacity-90 transition-opacity"
              >
                <span className="font-label font-bold text-[13px] lg:text-[15px] tracking-[2px] text-[var(--text-white)]">PLEDGE NOW</span>
                <Heart className="w-[18px] h-[18px] text-[var(--text-white)]" />
              </Link>
              <ShareButton
                className="flex items-center justify-center gap-[10px] border border-[#FFFFFF66] px-[32px] lg:px-[48px] py-[16px] lg:py-[20px] hover:bg-white/10 transition-colors cursor-pointer"
                label="SHARE THIS CAUSE"
                labelClassName="font-label font-bold text-[13px] lg:text-[15px] tracking-[2px] text-[var(--text-white)]"
              />
            </div>
          </ScrollReveal>
          <Link
            href="/support"
            className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white underline underline-offset-4"
          >
            Or support Paul directly on the trail →
          </Link>
          <span className="font-label font-medium text-[13px] tracking-[1px] text-[#FFFFFF88]">$12,450 pledged toward $50,000 goal</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DonorCard({ name, amount, color }: { name: string; amount: string; color: string }) {
  return (
    <div className="flex items-center gap-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[16px]">
      <div className="w-[36px] h-[36px] rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex flex-col gap-[2px]">
        <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">{name}</span>
        <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--forest-green)]">{amount}</span>
      </div>
    </div>
  );
}
