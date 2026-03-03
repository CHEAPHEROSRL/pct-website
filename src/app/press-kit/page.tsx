import { Mail, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const storyAngles = [
  {
    num: "01",
    title: "A Son's Tribute: Walking 2,650 Miles for the Parents He Lost",
    description:
      "A deeply personal story of grief, love, and purpose. Paul's journey is a living memorial to his father and mother — and a message to everyone fighting cancer that they are not alone.",
  },
  {
    num: "02",
    title:
      "What Does 2,650 Miles Actually Look Like? The Science of a Thru-Hike",
    description:
      "The physical and mental demands of thru-hiking the PCT — training, nutrition, gear, and the psychological challenge of walking every single day for six months through some of America's most extreme landscapes.",
  },
  {
    num: "03",
    title: "Cancer by the Numbers: Why Fundraising Walks Like This Matter",
    description:
      "With 1 in 3 people receiving a cancer diagnosis in their lifetime, community-funded awareness campaigns play a critical role. This angle explores how individual acts of endurance translate into real research funding.",
  },
];

const photos = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    caption: "Southern Desert Section",
    credit: "Unsplash",
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    caption: "Sierra Nevada High Country",
    credit: "Unsplash",
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    caption: "Pacific Northwest Forest",
    credit: "Unsplash",
  },
];

export default function PressKitPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551632811-561732d1e306?w=1440&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1F1AEE] to-[#1C1F1A99]" />
        <div className="relative z-10 flex flex-col justify-center gap-[16px] h-full px-6 md:px-12 lg:px-[120px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
            PRESS KIT
          </span>
          <h1 className="font-heading font-semibold text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1] tracking-[-1px] text-[var(--text-white)]">
            Cover Paul&apos;s Story
          </h1>
          <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[#FFFFFFCC] max-w-[600px]">
            A 2,650-mile walk from Mexico to Canada in honor of two parents lost
            to cancer. Everything you need to tell this story.
          </p>
        </div>
      </section>

      {/* Facts bar */}
      <section className="flex flex-wrap justify-around gap-6 px-6 md:px-12 lg:px-[120px] py-[28px] bg-[var(--bg-dark)] w-full">
        {[
          { value: "2,650", label: "MILES ON TRAIL" },
          { value: "~180", label: "DAYS HIKING" },
          { value: "2026", label: "YEAR OF THE HIKE", highlight: true },
          { value: "Mexico → Canada", label: "SOUTHERN TO NORTHERN TERMINUS" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-[4px]">
            <span
              className={`font-heading font-semibold text-[28px] md:text-[32px] ${
                f.highlight
                  ? "text-[var(--burnt-orange)]"
                  : "text-[var(--text-white)]"
              }`}
            >
              {f.value}
            </span>
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              {f.label}
            </span>
          </div>
        ))}
      </section>

      {/* Bio */}
      <section className="flex flex-col md:flex-row items-center gap-[64px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-white)] w-full">
        <div className="w-full md:w-[400px] shrink-0">
          <div
            className="w-full h-[380px] md:h-[480px] rounded-[2px] bg-cover bg-center bg-[var(--bg-warm)]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80')",
            }}
          />
        </div>
        <div className="flex flex-col gap-[24px] w-full">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
            ABOUT PAUL
          </span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[36px] leading-[1.2] tracking-[-0.5px] text-[var(--text-primary)]">
            The Man Behind the Walk
          </h2>
          <p className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)]">
            Paul Barry lost both of his parents to cancer. His father passed in
            2018, his mother in 2022. In their honor — and for every family
            walking the same painful road — Paul is thru-hiking the Pacific
            Crest Trail in 2026.
          </p>
          <p className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)]">
            The PCT runs 2,650 miles from the Mexican border to Manning Park in
            British Columbia, Canada, through some of the most remote and
            beautiful terrain in North America. Paul will walk it all — desert,
            mountains, and rain forests — in approximately 180 days.
          </p>
          <div className="border-l-[4px] border-[var(--burnt-orange)] pl-[20px] flex flex-col gap-[8px]">
            <p className="font-heading font-semibold italic text-[16px] leading-[1.6] text-[var(--text-primary)]">
              &ldquo;Every mile I walk is a mile closer to a world where fewer
              families have to say goodbye too soon.&rdquo;
            </p>
            <span className="font-label font-semibold text-[12px] tracking-[1px] text-[var(--burnt-orange)]">
              — Paul Barry
            </span>
          </div>
        </div>
      </section>

      {/* Story angles */}
      <section className="flex flex-col items-center gap-[40px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          STORY ANGLES
        </span>
        <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Ways to Cover This Story
        </h2>
        <div className="flex flex-col gap-[16px] w-full">
          {storyAngles.map((a) => (
            <div
              key={a.num}
              className="flex flex-col gap-[12px] bg-[var(--bg-white)] px-[32px] py-[28px] rounded-[2px] border border-[var(--border-subtle)]"
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">
                {a.num}
              </span>
              <h3 className="font-heading font-semibold text-[18px] md:text-[20px] leading-[1.3] text-[var(--text-primary)]">
                {a.title}
              </h3>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          MEDIA ASSETS
        </span>
        <h2 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
          Photos &amp; Graphics
        </h2>
        <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-muted)] -mt-[20px]">
          High-resolution photos available for editorial use. Please credit:{" "}
          <span className="text-[var(--text-secondary)]">
            Paul Barry / paulbarrypct.com
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px]">
          {photos.map((p) => (
            <div key={p.caption} className="flex flex-col gap-[12px]">
              <div
                className="w-full h-[220px] rounded-[2px] bg-cover bg-center bg-[var(--bg-warm)]"
                style={{ backgroundImage: `url('${p.src}')` }}
              />
              <span className="font-label font-semibold text-[12px] tracking-[1px] text-[var(--text-muted)]">
                {p.caption}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Media contact */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[80px] bg-[var(--bg-dark)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          MEDIA CONTACT
        </span>
        <h2 className="font-heading font-semibold text-[28px] md:text-[36px] text-[var(--text-white)] text-center">
          Get in Touch
        </h2>
        <p className="font-heading text-[16px] leading-[1.7] text-[#FFFFFFAA] text-center max-w-[480px]">
          For interview requests, high-res assets, or press inquiries, please
          reach out directly.
        </p>
        <div className="flex flex-col items-center gap-[24px] border border-[#FFFFFF15] bg-[#FFFFFF0D] rounded-[4px] px-[48px] py-[40px]">
          <span className="font-heading font-semibold text-[22px] text-[var(--text-white)]">
            Paul Barry
          </span>
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            PCT THRU-HIKER &amp; FUNDRAISER
          </span>
          <div className="w-[48px] h-[1px] bg-[#FFFFFF22]" />
          <a
            href="mailto:paul@paulbarrypct.com"
            className="flex items-center gap-[10px] hover:opacity-80 transition-opacity"
          >
            <Mail className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
            <span className="font-label font-semibold text-[15px] tracking-[0.5px] text-[var(--text-white)]">
              paul@paulbarrypct.com
            </span>
          </a>
          <div className="flex items-center gap-[10px]">
            <Globe className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
            <span className="font-label font-semibold text-[15px] tracking-[0.5px] text-[var(--text-white)]">
              paulbarrypct.com
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
