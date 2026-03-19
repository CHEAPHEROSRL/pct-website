import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footprints, Apple, Sun, ScanSearch, CigaretteOff, HeartPulse } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import HeroParallax from "@/components/HeroParallax";
import ShareButton from "@/components/ShareButton";
import CountdownBanner from "@/components/CountdownBanner";

export const metadata: Metadata = {
  title: "The Cause — Cancer Prevention & Awareness",
  description: "Learn why Paul Barry is walking the PCT — supporting cancer survivors, promoting prevention education, and funding life-saving research.",
};

export default function TheCausePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="The Cause" transparent />
      <CountdownBanner belowFixedHeader />

      {/* Hero — negative margin pulls it behind sticky header + banner */}
      <section className="relative w-full h-[400px] md:h-[480px] lg:h-[560px] overflow-hidden -mt-[112px] md:-mt-[120px] lg:-mt-[132px]">
        <HeroParallax>
          <Image
            src="/images/hiking/20250821_175814.jpg"
            alt="The Cause"
            fill
            className="object-cover"
            priority
          />
        </HeroParallax>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1C1F1AEE 0%, #1C1F1A88 60%, #1C1F1A44 100%)" }} />
        <div className="relative flex flex-col justify-center gap-[16px] md:gap-[24px] h-full px-6 md:px-12 lg:px-[120px]">
          <span className="font-label font-bold text-[13px] tracking-[4px] text-[var(--burnt-orange)] animate-fade-up">THE CAUSE</span>
          <h1 className="font-heading font-semibold text-[28px] md:text-[40px] lg:text-[56px] tracking-[-1px] leading-[1.15] text-[var(--text-white)] w-full lg:w-[700px] animate-fade-up stagger-2">
            Walking 2,650 Miles{"\n"}for Cancer Awareness
          </h1>
          <p className="font-heading text-[16px] md:text-[18px] lg:text-[20px] leading-[1.6] text-[#FFFFFFAA] w-full lg:w-[600px] animate-fade-up stagger-4">
            Because prevention starts with awareness, and awareness{"\n"}starts with one step.
          </p>
        </div>
      </section>

      {/* Paul's Story */}
      <section className="flex flex-col lg:flex-row gap-[40px] lg:gap-[80px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[72px] lg:py-[100px] w-full">
        <ScrollReveal animation="slide-right">
          <div className="relative w-full lg:w-[480px] h-[300px] md:h-[400px] lg:h-[580px] shrink-0">
            <Image
              src="/images/family/2026-03-18.jpeg"
              alt="Paul with his parents at a restaurant, shortly before the hike"
              fill
              className="object-cover object-top"
            />
          </div>
        </ScrollReveal>
        <ScrollReveal animation="slide-left">
          <div className="flex flex-col justify-center gap-[28px] flex-1">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">PAUL&apos;S STORY</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[42px] tracking-[-0.5px] text-[var(--text-primary)]">From Grief to Purpose</h2>
            <div className="w-[60px] h-[3px] bg-[var(--burnt-orange)]" />
            <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
              In 2023, I lost my mother to pancreatic cancer. Just fourteen months later, my father was diagnosed with lung cancer. He passed away in early 2025. In the span of two years, cancer took both of my parents from me.
            </p>
            <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
              The grief was overwhelming. But somewhere in that darkness, I found a spark of purpose. I realized that while I couldn&apos;t change what happened to my parents, I could help others — by raising awareness about cancer prevention and the lifestyle choices that can reduce risk.
            </p>
            <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
              So in March 2026, I&apos;m lacing up my boots and walking the entire Pacific Crest Trail — 2,650 miles from the Mexican border to Canada — to honor my parents and raise awareness and pledges for cancer research and prevention programs.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Quote */}
      <section className="flex flex-col items-center gap-[24px] px-6 md:px-16 lg:px-[200px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-dark)] w-full">
        <ScrollReveal animation="scale-up">
          <span className="font-heading font-semibold text-[60px] md:text-[80px] lg:text-[120px] leading-[0.5] text-[var(--burnt-orange)]">&ldquo;</span>
        </ScrollReveal>
        <ScrollReveal animation="fade-in" delay={200}>
          <p className="font-heading italic text-[20px] md:text-[24px] lg:text-[28px] leading-[1.7] text-[#FFFFFFCC] text-center w-full lg:w-[800px]">
            Every mile I walk is a mile closer to a world where fewer families have to say goodbye too soon. This trail is my protest against cancer — one step at a time.
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fade-in" delay={400}>
          <span className="font-label font-semibold text-[14px] tracking-[2px] text-[var(--burnt-orange)]">— Paul Barry</span>
        </ScrollReveal>
      </section>

      {/* Interview Videos */}
      <section className="flex flex-col items-center gap-[40px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] md:py-[80px] bg-[var(--bg-dark)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[16px] text-center">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">IN HIS OWN WORDS</span>
            <h2 className="font-heading font-semibold text-[32px] md:text-[40px] tracking-[-0.5px] text-[var(--text-white)]">Hear Paul&apos;s Story</h2>
            <p className="font-heading text-[17px] leading-[1.6] text-[#FFFFFFAA] max-w-[600px]">
              Two conversations about what drives a father&apos;s son to walk 2,650 miles.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
          {/* Video 1 */}
          <ScrollReveal animation="slide-right">
            <div className="flex flex-col rounded overflow-hidden border border-[#FFFFFF15]">
              <div className="relative w-full h-[240px] md:h-[300px] bg-[#2A2D28] flex items-center justify-center group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF20] flex items-center justify-center group-hover:bg-[#FFFFFF30] transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="translate-x-[2px]">
                    <polygon points="5,3 19,12 5,21" fill="white" />
                  </svg>
                </div>
                <span className="absolute bottom-3 right-3 font-label text-[11px] font-bold tracking-[1px] text-[#FFFFFFAA] bg-[#00000066] px-2 py-1 rounded">COMING SOON</span>
              </div>
              <div className="flex flex-col gap-[8px] p-[20px] md:p-[24px] bg-[#1C1F1A]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">INTERVIEW · 8 MIN</span>
                <h3 className="font-heading font-semibold text-[20px] leading-[1.3] text-[var(--text-white)]">&ldquo;Why I Said Yes to This Chapter&rdquo;</h3>
                <p className="font-heading text-[14px] leading-[1.6] text-[#FFFFFFAA]">
                  Paul talks about losing both parents, the decision to walk 2,650 miles, and what he hopes people take away from YesChapter.
                </p>
              </div>
            </div>
          </ScrollReveal>
          {/* Video 2 */}
          <ScrollReveal animation="slide-left">
            <div className="flex flex-col rounded overflow-hidden border border-[#FFFFFF15]">
              <div className="relative w-full h-[240px] md:h-[300px] bg-[#2A2D28] flex items-center justify-center group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF20] flex items-center justify-center group-hover:bg-[#FFFFFF30] transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="translate-x-[2px]">
                    <polygon points="5,3 19,12 5,21" fill="white" />
                  </svg>
                </div>
                <span className="absolute bottom-3 right-3 font-label text-[11px] font-bold tracking-[1px] text-[#FFFFFFAA] bg-[#00000066] px-2 py-1 rounded">COMING SOON</span>
              </div>
              <div className="flex flex-col gap-[8px] p-[20px] md:p-[24px] bg-[#1C1F1A]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">INTERVIEW · 12 MIN</span>
                <h3 className="font-heading font-semibold text-[20px] leading-[1.3] text-[var(--text-white)]">&ldquo;Cancer Took My Parents — But Not My Hope&rdquo;</h3>
                <p className="font-heading text-[14px] leading-[1.6] text-[#FFFFFFAA]">
                  A raw, honest conversation about grief, purpose, and why Paul believes every mile walked makes a difference for future families.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Prevention Section */}
      <section className="flex flex-col items-center gap-[40px] md:gap-[60px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[72px] lg:py-[100px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[16px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">CANCER PREVENTION</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[42px] tracking-[-0.5px] text-[var(--text-primary)] text-center">Prevention Starts With Lifestyle</h2>
            <p className="font-heading text-[15px] md:text-[17px] leading-[1.7] text-[var(--text-secondary)] text-center w-full lg:w-[700px]">
              Research shows that up to 50% of cancers could be prevented through healthy lifestyle choices. Here are the habits that can make a real difference.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] lg:gap-[32px] w-full">
          <TipCard icon={<Footprints className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Stay Active" desc="Regular physical activity reduces risk for several cancers including colon, breast, and lung cancer. Even 30 minutes of daily walking makes a difference." />
          <TipCard icon={<Apple className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Eat Well" desc="A diet rich in fruits, vegetables, and whole grains while limiting processed meats and alcohol can significantly lower cancer risk. Nourish your body." />
          <TipCard icon={<Sun className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Sun Safety" desc="Protect your skin from UV radiation. Use sunscreen, wear protective clothing, and avoid tanning beds. Skin cancer is the most common but also one of the most preventable." />
          <TipCard icon={<ScanSearch className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Get Screened" desc="Regular screening can catch cancer early when it's most treatable. Talk to your doctor about recommended screenings for your age and risk factors." />
          <TipCard icon={<CigaretteOff className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Quit Smoking" desc="Tobacco use remains the single largest preventable cause of cancer. Quitting at any age reduces your risk. It's never too late to start." />
          <TipCard icon={<HeartPulse className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Know Your Body" desc="Pay attention to changes in your body. Unexplained weight loss, persistent pain, or unusual lumps should be discussed with a healthcare provider promptly." />
        </div>
        </ScrollReveal>
      </section>

      {/* Impact Section */}
      <section className="flex flex-col items-center gap-[40px] md:gap-[60px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[72px] lg:py-[100px] bg-[var(--forest-green-light)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[16px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">WHERE YOUR PLEDGE GOES</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[42px] tracking-[-0.5px] text-[var(--text-primary)] text-center">Making a Real Difference</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] lg:gap-[32px] w-full">
          {[
            { pct: "50%", title: "Cancer Research", desc: "Funding breakthrough research into early detection and treatment of pancreatic and lung cancers." },
            { pct: "25%", title: "Patient Support", desc: "Helping cancer patients and their families with counseling, resources, and access to treatment." },
            { pct: "25%", title: "Prevention Programs", desc: "Community education programs promoting healthy lifestyles, early screening, and cancer prevention awareness." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-[16px] bg-[var(--bg-white)] p-[24px] md:p-[32px] lg:p-[40px]">
              <span className="font-heading font-bold text-[48px] text-[var(--forest-green)]">{item.pct}</span>
              <span className="font-label font-bold text-[16px] tracking-[1px] text-[var(--text-primary)]">{item.title}</span>
              <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)] text-center">{item.desc}</p>
            </div>
          ))}
        </div>
        </ScrollReveal>
        <Link href="/foundations" className="font-heading font-semibold text-[15px] text-[var(--forest-green)] hover:underline">
          Meet our partner foundations &rarr;
        </Link>
      </section>

      {/* CTA */}
      <section className="relative w-full h-[360px] md:h-[380px] lg:h-[400px] overflow-hidden">
        <HeroParallax>
          <Image
            src="/images/hiking/FB_IMG_1771992939135.jpg"
            alt="CTA background"
            fill
            className="object-cover"
          />
        </HeroParallax>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1C1F1ADD 0%, #1C1F1ACC 100%)" }} />
        <div className="relative flex flex-col items-center justify-center gap-[20px] md:gap-[28px] h-full px-6 md:px-12 lg:px-[120px]">
          <ScrollReveal animation="fade-up">
            <h2 className="font-heading font-semibold text-[26px] md:text-[36px] lg:text-[44px] text-[var(--text-white)] text-center">Join the Walk Against Cancer</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="font-heading text-[15px] md:text-[18px] leading-[1.6] text-[#FFFFFFAA] text-center w-full lg:w-[600px]">
              Every pledge, no matter how small, brings us one step closer to a cancer-free future.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-[20px]">
              <Link href="/pledge" className="bg-[var(--burnt-orange)] px-[32px] lg:px-[48px] py-[14px] lg:py-[16px] text-center">
                <span className="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[var(--text-white)]">PLEDGE NOW</span>
              </Link>
              <ShareButton
                className="flex items-center justify-center gap-[10px] border border-[#FFFFFF66] px-[32px] lg:px-[48px] py-[14px] lg:py-[16px] hover:bg-white/10 transition-colors cursor-pointer"
                label="SHARE THE CAUSE"
                labelClassName="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[var(--text-white)]"
              />
            </div>
          </ScrollReveal>
          <Link
            href="/support"
            className="font-heading text-[14px] text-[#FFFFFFAA] hover:text-white underline underline-offset-4"
          >
            Or support Paul directly on the trail →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TipCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
      {icon}
      <span className="font-heading font-semibold text-[22px] text-[var(--text-primary)]">{title}</span>
      <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">{desc}</p>
    </div>
  );
}
