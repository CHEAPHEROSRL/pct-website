import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Partner Foundations — YesChapter",
  description:
    "Meet the two cancer foundations receiving 100% of YesChapter donations. Tower Cancer Research Foundation (California) and Cancer Council NSW (Sydney).",
};

const foundations = [
  {
    region: "CALIFORNIA, USA",
    regionColor: "var(--burnt-orange)",
    name: "Tower Cancer Research Foundation",
    tagline:
      "Advancing groundbreaking cancer research and providing profound support to those affected by the disease.",
    about:
      "Founded in 1996, Tower Cancer Research Foundation is a 501(c)(3) non-profit based in Beverly Hills, California. They have conducted over 400 clinical trials for the development of new and more effective cancer treatments. Their work spans research, patient support, and community education — creating outsized impact in Southern California and nationally.",
    programs: [
      "Clinical Research — Over 400 clinical trials developing new cancer treatments",
      "Magnolia House — Free survivorship program with 130+ monthly classes, workshops, and holistic services for patients and families",
      "Community Grants — Funding for childhood/young adult cancer organizations and support for underserved communities",
    ],
    facts: [
      { label: "Founded", value: "1996" },
      { label: "Location", value: "Beverly Hills, California" },
      { label: "Tax Status", value: "501(c)(3) Non-Profit\nEIN: 95-4596354" },
      { label: "Website", value: "towercancer.org", url: "https://www.towercancer.org" },
    ],
    bgClass: "bg-[var(--bg-white)]",
    honor: "Honoring Paul\u2019s father",
  },
  {
    region: "SYDNEY, AUSTRALIA",
    regionColor: "var(--forest-green)",
    name: "Cancer Council NSW",
    tagline:
      "Supporting people affected by cancer, funding research, and empowering communities to reduce cancer risk.",
    about:
      "Cancer Council NSW is one of Australia\u2019s leading cancer charities, headquartered in Sydney. They fund more than $45 million annually in cancer research, alongside education, prevention programs, and direct support services assisting thousands of patients and families across New South Wales.",
    programs: [
      "Cancer Research — $45M+ annually funding new detection and treatment methods",
      "Patient Support — Free counseling, transport, accommodation, and financial assistance for cancer patients",
      "Cancer Prevention — Community education programs promoting healthy lifestyles and early detection",
      "Cancer Information — 13 11 20 helpline providing expert information and emotional support",
    ],
    facts: [
      { label: "Location", value: "Sydney, NSW, Australia" },
      { label: "Annual Research Funding", value: "$45M+ per year" },
      { label: "Tax Status", value: "Registered Charity (ACNC)\nABN: 51 116 463 846" },
      { label: "Website", value: "cancercouncil.com.au", url: "https://www.cancercouncil.com.au" },
    ],
    bgClass: "bg-[var(--bg-warm)]",
    honor: "Honoring Paul\u2019s mother",
  },
];

export default function FoundationsPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          WHERE YOUR MONEY GOES
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Our Partner Foundations
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[700px]">
          Every dollar you donate is split equally between two cancer foundations — one in California, one in
          Sydney — honoring both of Paul&apos;s parents.
        </p>
      </section>

      {/* 50/50 Split */}
      <section className="flex flex-col items-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[48px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">
          50 / 50 SPLIT
        </span>
        <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[700px]">
          Paul lost his father in California and his mother in Sydney. In their honor, donations are divided
          equally between foundations in each region — ensuring the communities closest to his family&apos;s story
          receive direct support.
        </p>
        <div className="flex flex-col md:flex-row gap-[24px] md:gap-[32px] justify-center">
          <div className="flex flex-col items-center gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] rounded-[12px] px-[40px] py-[32px] w-[280px] md:w-[360px]">
            <span className="text-[32px]">&#127482;&#127480;</span>
            <span className="font-label font-bold text-[40px] text-[var(--burnt-orange)]">50%</span>
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">California, USA</span>
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Honoring Paul&apos;s father</span>
          </div>
          <div className="flex flex-col items-center gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] rounded-[12px] px-[40px] py-[32px] w-[280px] md:w-[360px]">
            <span className="text-[32px]">&#127462;&#127482;</span>
            <span className="font-label font-bold text-[40px] text-[var(--forest-green)]">50%</span>
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Sydney, Australia</span>
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Honoring Paul&apos;s mother</span>
          </div>
        </div>
      </section>

      {/* Foundation Profiles */}
      {foundations.map((f) => (
        <section key={f.name} className={`flex flex-col gap-[32px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[64px] w-full ${f.bgClass}`}>
          {/* Foundation Header */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[12px] tracking-[3px]" style={{ color: f.regionColor }}>
              {f.region}
            </span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[36px] text-[var(--text-primary)]">
              {f.name}
            </h2>
            <p className="font-heading text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] max-w-[800px]">
              {f.tagline}
            </p>
          </div>

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
        <h2 className="font-heading font-semibold text-[28px] md:text-[32px] text-[var(--text-primary)] text-center">
          Support the Cause
        </h2>
        <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[500px]">
          Every dollar goes directly to these foundations. Paul takes nothing.
        </p>
        <div className="flex flex-col sm:flex-row gap-[16px] items-center">
          <Link
            href="/donate"
            className="flex items-center gap-[8px] bg-[var(--burnt-orange)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
            <Heart className="w-[14px] h-[14px] text-[var(--text-white)]" />
          </Link>
          <Link
            href="/pledge"
            className="flex items-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-white)]">PLEDGE PER MILE</span>
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
