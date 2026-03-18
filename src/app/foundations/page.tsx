import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Partner Foundations — YesChapter",
  description:
    "Meet the two cancer foundations receiving 100% of YesChapter pledges. City of Hope (California) and the Leukaemia Foundation of Australia.",
};

const foundations = [
  {
    region: "AUSTRALIA",
    regionColor: "var(--forest-green)",
    name: "Leukaemia Foundation",
    tagline:
      "Cure and conquer every blood cancer — zero lives lost to blood cancer by 2035.",
    about:
      "The Leukaemia Foundation is Australia\u2019s only national charity dedicated exclusively to blood cancers, founded in 1975 and now operating across all states. They serve the ~150,000 Australians currently living with blood cancer — 18 of whom die every day — through patient support services, research funding, and national advocacy.",
    programs: [
      "Patient Support — Free accommodation for regional/rural patients travelling for treatment (700+ families/year) and transport services covering 1M+ km/year, plus counselling and financial assistance",
      "Research Funding — $61M+ committed to blood cancer research since 2000, funding clinical trials and laboratory research across Australia",
      "Advocacy — Developed Australia\u2019s National Strategic Action Plan for Blood Cancer; campaigns for equitable treatment access across all states",
    ],
    facts: [
      { label: "Founded", value: "1975" },
      { label: "Location", value: "National (HQ Brisbane, QLD)" },
      { label: "Research Funding", value: "$61M+ since 2000" },
      { label: "Website", value: "leukaemia.org.au", url: "https://www.leukaemia.org.au" },
    ],
    bgClass: "bg-[var(--bg-warm)]",
    honor: "Honoring Paul\u2019s mother",
  },
  {
    region: "CALIFORNIA, USA",
    regionColor: "var(--burnt-orange)",
    name: "City of Hope",
    tagline:
      "The Miracle of Science With Soul — pioneering cancer research and compassionate treatment since 1913.",
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
      { label: "NCI Status", value: "NCI-Designated Comprehensive\nCancer Center (since 1998)" },
      { label: "Website", value: "cityofhope.org", url: "https://www.cityofhope.org" },
    ],
    bgClass: "bg-[var(--bg-white)]",
    honor: "Honoring Paul\u2019s father",
  },
];

export default function FoundationsPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          WHERE YOUR PLEDGE GOES
        </span>
        <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Our Partner Foundations
        </h1>
        <p className="animate-fade-up stagger-4 font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[700px]">
          Every dollar you pledge is split equally between two cancer foundations — one in California, one in
          Sydney — honoring both of Paul&apos;s parents.
        </p>
      </section>

      {/* Two Foundations */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-warm)] w-full">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-center gap-[12px] text-center max-w-[700px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">WHERE YOUR PLEDGE GOES</span>
            <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
              Paul lost his father in California and his mother in Sydney. Pledges are split equally between one foundation in each region — honoring both of his parents.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
          <ScrollReveal animation="slide-right">
            <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] border border-[var(--border-subtle)] rounded-[4px] p-[32px] md:p-[40px] h-full">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--forest-green)]">SYDNEY, AUSTRALIA &#127462;&#127482;</span>
              <h3 className="font-heading font-semibold text-[26px] tracking-[-0.5px] text-[var(--text-primary)]">Leukaemia Foundation</h3>
              <div className="w-[48px] h-[3px] bg-[var(--forest-green)]" />
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                Australia&apos;s only national charity exclusively for blood cancers. Founded 1975, serving 150,000 Australians living with blood cancer — 18 of whom die every day. Free support services for patients and families nationwide.
              </p>
              <ul className="flex flex-col gap-[8px]">
                {["Free accommodation for 700+ regional families travelling for treatment", "Transport covering 1M+ km/year so patients can access care", "Counselling, financial assistance, and blood cancer research funding"].map(p => (
                  <li key={p} className="flex items-start gap-[10px] font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                    <span className="text-[var(--forest-green)] mt-[3px] shrink-0">→</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-left">
            <div className="flex flex-col gap-[16px] bg-[var(--bg-white)] border border-[var(--border-subtle)] rounded-[4px] p-[32px] md:p-[40px] h-full">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">CALIFORNIA, USA &#127482;&#127480;</span>
              <h3 className="font-heading font-semibold text-[26px] tracking-[-0.5px] text-[var(--text-primary)]">City of Hope</h3>
              <div className="w-[48px] h-[3px] bg-[var(--burnt-orange)]" />
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                One of only 57 NCI-designated comprehensive cancer centres in the US. Founded 1913, treating ~134,000 patients annually. Developed the foundational science behind Herceptin, Rituxan, and Avastin.
              </p>
              <ul className="flex flex-col gap-[8px]">
                {["Breakthrough cancer research & clinical trials", "13,000+ stem cell transplants — outcomes above national averages", "First centre to offer CAR T-cell therapy for acute myeloid leukemia"].map(p => (
                  <li key={p} className="flex items-start gap-[10px] font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                    <span className="text-[var(--burnt-orange)] mt-[3px] shrink-0">→</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Foundation Profiles */}
      {foundations.map((f) => (
        <section key={f.name} className={`flex flex-col gap-[32px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[64px] w-full ${f.bgClass}`}>
          {/* Foundation Header */}
          <ScrollReveal animation="fade-up"><div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[12px] tracking-[3px]" style={{ color: f.regionColor }}>
              {f.region}
            </span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] text-[var(--text-primary)]">
              {f.name}
            </h2>
            <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] max-w-[800px]">
              {f.tagline}
            </p>
          </div></ScrollReveal>

          {/* Details Grid */}
          <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px]">
            {/* Left: About + Programs */}
            <div className="flex flex-col gap-[20px] flex-1">
              <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">About</h3>
              <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">{f.about}</p>

              <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Key Programs</h3>
              <ul className="flex flex-col gap-[8px] list-disc pl-6">
                {f.programs.map((p) => (
                  <li key={p} className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Quick Facts */}
            <div className="flex flex-col gap-[16px] w-full lg:w-[320px] lg:min-w-[320px]">
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                Quick Facts
              </span>
              {f.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-[4px]">
                  <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--text-muted)]">
                    {fact.label}
                  </span>
                  {fact.url ? (
                    <a
                      href={fact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading font-semibold text-[16px] hover:underline flex items-center gap-[6px]"
                      style={{ color: f.regionColor }}
                    >
                      {fact.value}
                      <ExternalLink className="w-[14px] h-[14px]" />
                    </a>
                  ) : (
                    <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)] whitespace-pre-line">
                      {fact.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <ScrollReveal animation="fade-up">
          <h2 className="font-heading font-semibold text-[28px] md:text-[32px] text-[var(--text-primary)] text-center">
            Support the Cause
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[500px]">
            Every pledge goes directly to these foundations. Paul takes nothing.
          </p>
        </ScrollReveal>
        <div className="flex flex-col sm:flex-row gap-[16px] items-center">
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">PLEDGE PER MILE</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">SUPPORT PAUL ON TRAIL</span>
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
