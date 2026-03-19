import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Partner Foundations — YesChapter",
  description:
    "Meet the two cancer foundations receiving 100% of YesChapter pledges. City of Hope (California) and the Leukaemia Foundation of Australia.",
};

const impactStats = [
  { num: "$61M+", label: "blood cancer research funded", sub: "Leukaemia Foundation since 2000" },
  { num: "134,000", label: "patients treated annually", sub: "City of Hope national network" },
  { num: "700+", label: "families housed near treatment", sub: "Free accommodation every year" },
  { num: "13,000+", label: "stem cell transplants performed", sub: "With above-average outcomes" },
  { num: "1M+ km", label: "transport covered annually", sub: "For regional patients in Australia" },
];

const breakthroughs = [
  {
    org: "CITY OF HOPE",
    orgColor: "var(--burnt-orange)",
    year: "1978",
    title: "Synthetic Human Insulin",
    body: "City of Hope scientists were the first to synthesise human insulin using recombinant DNA — a breakthrough that transformed diabetes and cancer metabolic research globally.",
  },
  {
    org: "CITY OF HOPE",
    orgColor: "var(--burnt-orange)",
    year: "1990s–2000s",
    title: "Herceptin, Rituxan & Avastin",
    body: "Foundational monoclonal antibody research led directly to three of the world's most widely used cancer drugs — now treating millions of patients annually worldwide.",
  },
  {
    org: "LEUKAEMIA FOUNDATION",
    orgColor: "var(--forest-green)",
    year: "2020",
    title: "National Blood Cancer Plan",
    body: "Developed Australia's first National Strategic Action Plan for Blood Cancer — securing government commitment to equitable treatment access across all states and territories.",
  },
  {
    org: "CITY OF HOPE",
    orgColor: "var(--burnt-orange)",
    year: "2023",
    title: "First CAR T-Cell for AML",
    body: "City of Hope became the first centre to offer CAR T-cell immunotherapy targeting acute myeloid leukemia — a disease with historically poor prognosis now entering a new era.",
  },
];

const foundations = [
  {
    region: "AUSTRALIA",
    regionColor: "var(--forest-green)",
    name: "Leukaemia Foundation",
    tagline: "Cure and conquer every blood cancer — zero lives lost to blood cancer by 2035.",
    honor: "Honoring Paul's mother",
    honorColor: "var(--forest-green)",
    bgClass: "bg-[var(--bg-warm)]",
    about:
      "The Leukaemia Foundation is Australia's only national charity dedicated exclusively to blood cancers, founded in 1975 and now operating across all states. They serve the ~150,000 Australians currently living with blood cancer — 18 of whom die every day — through patient support services, research funding, and national advocacy.",
    programs: [
      "Patient Support — Free accommodation for regional/rural patients travelling for treatment (700+ families/year) and transport services covering 1M+ km/year, plus counselling and financial assistance",
      "Research Funding — $61M+ committed to blood cancer research since 2000, funding clinical trials and laboratory research across Australia",
      "Advocacy — Developed Australia's National Strategic Action Plan for Blood Cancer; campaigns for equitable treatment access across all states",
    ],
    facts: [
      { label: "Founded", value: "1975" },
      { label: "Location", value: "National (HQ Brisbane, QLD)" },
      { label: "Research Funding", value: "$61M+ since 2000" },
      { label: "Patients Served", value: "~150,000 Australians living with blood cancer" },
      { label: "Annual Impact", value: "700+ families housed · 1M+ km transport" },
      { label: "Website", value: "leukaemia.org.au", url: "https://www.leukaemia.org.au" },
    ],
    quote: "\"18 Australians die from blood cancer every single day. The Leukaemia Foundation exists so that one day, not one more family has to go through what Paul's did.\"",
    quoteSource: "Leukaemia Foundation, Annual Report",
    quoteColor: "var(--forest-green)",
    quoteBg: "bg-[var(--forest-green-light)]",
  },
  {
    region: "CALIFORNIA, USA",
    regionColor: "var(--burnt-orange)",
    name: "City of Hope",
    tagline: "The Miracle of Science With Soul — pioneering cancer research and compassionate treatment since 1913.",
    honor: "Honoring Paul's father",
    honorColor: "var(--burnt-orange)",
    bgClass: "bg-[var(--bg-white)]",
    about:
      "Founded in 1913, City of Hope is one of the largest cancer research and treatment organisations in the United States, located in Duarte, California. As one of only 57 NCI-designated comprehensive cancer centres, they combine world-class research with compassionate patient care — treating ~134,000 patients annually across their national network.",
    programs: [
      "Breakthrough Research — Developed synthetic human insulin and the foundational monoclonal antibody technology behind blockbuster cancer drugs Herceptin, Rituxan, and Avastin",
      "Cancer Treatment — World-class care for blood cancers, solid tumors, and rare cancers; 13,000+ stem cell transplants performed with outcomes exceeding national averages",
      "Clinical Trials — Hundreds of blood cancer trials yearly; first centre to offer CAR T-cell therapy targeting acute myeloid leukemia",
    ],
    facts: [
      { label: "Founded", value: "1913" },
      { label: "Location", value: "Duarte, California" },
      { label: "NCI Status", value: "NCI-Designated Comprehensive Cancer Center (since 1998)" },
      { label: "Annual Patients", value: "~134,000 across national network" },
      { label: "Stem Cell Transplants", value: "13,000+ with above-average outcomes" },
      { label: "Website", value: "cityofhope.org", url: "https://www.cityofhope.org" },
    ],
    quote: "\"City of Hope is not just a hospital. It's a place where the science of cancer meets the humanity of healing — where researchers and doctors work side-by-side to turn today's discoveries into tomorrow's cures.\"",
    quoteSource: "City of Hope, Mission Statement",
    quoteColor: "var(--burnt-orange)",
    quoteBg: "bg-[var(--burnt-orange-light)]",
  },
];

export default function FoundationsPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header activeItem="Cause" />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[52px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">
          WHERE YOUR PLEDGE GOES
        </span>
        <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[30px] md:text-[40px] lg:text-[52px] tracking-[-0.5px] text-[var(--text-primary)] text-center max-w-[800px]">
          Our Partner Foundations
        </h1>
        <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[700px] leading-[1.7]">
          Every pledge is split equally between two cancer foundations — one in California, one in
          Sydney — honoring both of Paul&apos;s parents.
        </p>
        <div className="animate-fade-up stagger-6 flex flex-col sm:flex-row gap-[12px] sm:gap-[32px] mt-[12px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[var(--forest-green)] shrink-0" />
            <span className="font-label font-semibold text-[13px] text-[var(--text-secondary)]">Leukaemia Foundation — Sydney, Australia 🇦🇺</span>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
            <span className="font-label font-semibold text-[13px] text-[var(--text-secondary)]">City of Hope — California, USA 🇺🇸</span>
          </div>
        </div>
      </section>

      {/* Personal Story */}
      <section className="flex flex-col lg:flex-row w-full min-h-[420px]">
        <div className="flex flex-col gap-[24px] justify-center px-6 md:px-12 lg:px-[80px] py-[64px] bg-[var(--bg-dark)] flex-1">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            WHY THESE FOUNDATIONS
          </span>
          <h2 className="font-heading text-[40px] md:text-[52px] leading-[1.1] text-[var(--text-white)]">
            Two parents.<br />Two foundations.<br />One hike.
          </h2>
          <p className="font-heading text-[17px] leading-[1.75] text-[#FFFFFFAA] max-w-[520px]">
            Paul lost his father to cancer in California, and his mother to blood cancer in Sydney.
            This walk is for both of them — and for every family going through what his went through.
            He chose one foundation for each parent. Every pledge honors both.
          </p>
        </div>
        <div className="relative flex-1 min-h-[300px] lg:min-h-0 bg-[var(--bg-dark)] overflow-hidden">
          {/* Gradient background approximating a landscape image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A4A35] via-[#1C3028] to-[#0F1A13]" />
          <div className="absolute inset-0 flex items-end p-[40px]">
            <blockquote className="font-heading italic text-[18px] leading-[1.6] text-[#FFFFFFCC] max-w-[380px] border-l-[3px] border-[var(--forest-green)] pl-[20px]">
              &ldquo;I&apos;m walking 2,650 miles because I couldn&apos;t save them. But maybe I can help
              save someone else&apos;s mum or dad.&rdquo;
              <cite className="block font-label not-italic font-semibold text-[12px] tracking-[1px] text-[#FFFFFF66] mt-[12px]">
                — Paul Barry, YesChapter
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Combined Impact Stats */}
      <section className="flex flex-col items-center gap-[40px] px-6 md:px-12 lg:px-[80px] py-[64px] bg-[var(--forest-green)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[12px] text-center">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFFAA]">COMBINED IMPACT</span>
            <h2 className="font-heading text-[36px] font-semibold text-[var(--text-white)]">What your pledge helps fund</h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[2px] w-full">
          {impactStats.map((stat, i) => (
            <ScrollReveal key={stat.num} animation="fade-up" delay={i * 60}>
              <div className="flex flex-col items-center gap-[8px] px-[20px] py-[28px] bg-[#FFFFFF11] text-center">
                <span className="font-label font-bold text-[38px] md:text-[44px] leading-[1] text-[var(--text-white)] tracking-[-1px]">
                  {stat.num}
                </span>
                <span className="font-label font-semibold text-[12px] leading-[1.4] text-[#FFFFFFCC] tracking-[0.5px]">
                  {stat.label}
                </span>
                <span className="font-label text-[10px] leading-[1.4] text-[#FFFFFF66] tracking-[0.5px]">
                  {stat.sub}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Foundation Cards Overview */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[8px] text-center max-w-[700px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">50 / 50 SPLIT</span>
            <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
              Paul chose these foundations personally — one for each parent. Every pledge is divided equally,
              so both are honored with every mile he walks.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
          {foundations.map((f) => (
            <ScrollReveal key={f.name} animation="fade-up">
              <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] border border-[var(--border-subtle)] rounded-[4px] p-[32px] md:p-[40px] h-full">
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-[11px] tracking-[3px]" style={{ color: f.regionColor }}>
                    {f.region}
                  </span>
                  <span className="font-label font-semibold text-[11px] tracking-[1px] px-[10px] py-[4px]" style={{ color: f.honorColor, background: f.honorColor + "18" }}>
                    {f.honor}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-[26px] tracking-[-0.5px] text-[var(--text-primary)]">{f.name}</h3>
                <div className="w-[48px] h-[3px] rounded-full" style={{ background: f.regionColor }} />
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">{f.tagline}</p>
                <ul className="flex flex-col gap-[8px]">
                  {f.programs.slice(0, 3).map((p) => (
                    <li key={p} className="flex items-start gap-[10px] font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                      <span className="mt-[3px] shrink-0" style={{ color: f.regionColor }}>→</span>
                      {p.split(" — ")[0]}
                    </li>
                  ))}
                </ul>
                <a
                  href={f.facts.find((x) => x.url)?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[6px] mt-auto pt-[4px] font-label font-semibold text-[12px] tracking-[1px] hover:opacity-75 transition-opacity"
                  style={{ color: f.regionColor }}
                >
                  Visit {f.name} <ExternalLink className="w-[12px] h-[12px]" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Foundation Profiles — detailed */}
      {foundations.map((f) => (
        <section key={f.name} className={`flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[64px] w-full ${f.bgClass}`}>
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[12px] tracking-[3px]" style={{ color: f.regionColor }}>
                {f.region}
              </span>
              <div className="flex flex-col md:flex-row md:items-end gap-[12px] md:gap-[24px]">
                <h2 className="font-heading font-semibold text-[30px] md:text-[40px] text-[var(--text-primary)]">
                  {f.name}
                </h2>
                <span className="font-label font-semibold text-[12px] tracking-[1px] px-[12px] py-[5px] mb-[4px]" style={{ color: f.honorColor, background: f.honorColor + "18" }}>
                  {f.honor}
                </span>
              </div>
              <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] max-w-[800px]">
                {f.tagline}
              </p>
            </div>
          </ScrollReveal>

          {/* Details Grid */}
          <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px]">
            <div className="flex flex-col gap-[24px] flex-1">
              <div>
                <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)] mb-[12px]">About</h3>
                <p className="font-heading text-[16px] leading-[1.75] text-[var(--text-secondary)]">{f.about}</p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)] mb-[12px]">Key Programs</h3>
                <ul className="flex flex-col gap-[12px]">
                  {f.programs.map((p) => (
                    <li key={p} className="flex items-start gap-[12px] font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                      <span className="shrink-0 mt-[4px] w-[6px] h-[6px] rounded-full" style={{ background: f.regionColor }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="flex flex-col gap-[16px] w-full lg:w-[300px] lg:min-w-[300px]">
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">Quick Facts</span>
              {f.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-[4px] pb-[12px] border-b border-[var(--border-subtle)]">
                  <span className="font-label font-semibold text-[10px] tracking-[1px] text-[var(--text-muted)]">
                    {fact.label.toUpperCase()}
                  </span>
                  {fact.url ? (
                    <a
                      href={fact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading font-semibold text-[15px] hover:underline flex items-center gap-[6px]"
                      style={{ color: f.regionColor }}
                    >
                      {fact.value}
                      <ExternalLink className="w-[12px] h-[12px] shrink-0" />
                    </a>
                  ) : (
                    <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)] whitespace-pre-line">
                      {fact.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quote block */}
          <ScrollReveal animation="fade-up">
            <blockquote className={`flex flex-col gap-[12px] p-[28px] md:p-[36px] rounded-[4px] ${f.quoteBg}`}>
              <p className="font-heading italic text-[17px] md:text-[19px] leading-[1.7]" style={{ color: f.quoteColor }}>
                {f.quote}
              </p>
              <cite className="font-label not-italic font-semibold text-[11px] tracking-[1px]" style={{ color: f.quoteColor + "AA" }}>
                — {f.quoteSource}
              </cite>
            </blockquote>
          </ScrollReveal>
        </section>
      ))}

      {/* Research Breakthroughs */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[72px] bg-[var(--bg-dark)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">RESEARCH BREAKTHROUGHS</span>
              <h2 className="font-heading text-[32px] md:text-[40px] font-semibold text-[var(--text-white)]">
                Science that changed cancer care
              </h2>
            </div>
            <p className="font-heading text-[15px] text-[#FFFFFF66] max-w-[360px] leading-[1.6]">
              Both foundations have produced treatments now used by millions of patients worldwide.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
          {breakthroughs.map((b, i) => (
            <ScrollReveal key={b.title} animation="fade-up" delay={i * 60}>
              <div className="flex flex-col gap-[16px] p-[28px] md:p-[32px] bg-[#FFFFFF08] rounded-[4px] h-full">
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-[10px] tracking-[2px]" style={{ color: b.orgColor }}>
                    {b.org}
                  </span>
                  <span className="font-label font-semibold text-[11px] text-[#FFFFFF33] tracking-[1px]">
                    {b.year}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-[22px] text-[var(--text-white)]">{b.title}</h3>
                <p className="font-heading text-[15px] leading-[1.7] text-[#FFFFFF88]">{b.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <h2 className="font-heading font-semibold text-[28px] md:text-[36px] text-[var(--text-primary)] text-center max-w-[600px]">
            Every pledge goes directly to these foundations.
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={80}>
          <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[520px] leading-[1.7]">
            Paul takes nothing from pledges. 100% goes to the Leukaemia Foundation and City of Hope, split equally.
          </p>
        </ScrollReveal>
        <div className="flex flex-col sm:flex-row gap-[16px] items-center">
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[36px] py-[16px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">PLEDGE PER MILE</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[36px] py-[16px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">SUPPORT PAUL ON TRAIL</span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
        </div>
        <Link href="/transparency" className="font-heading font-semibold text-[14px] text-[var(--burnt-orange)] hover:underline">
          Read our full Transparency page &rarr;
        </Link>
      </section>

      <Footer />
    </div>
  );
}
