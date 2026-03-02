import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Paul Barry PCT 2026 website.",
};

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">LEGAL</span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Terms of Use
        </h1>
        <p className="font-heading text-[14px] text-[var(--text-muted)]">Last updated: February 28, 2026</p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <LegalSection title="1. Acceptance of Terms">
          By accessing and using this website (paulbarrypct.com), you agree to be bound by these Terms of Use.
          If you do not agree to these terms, please do not use this site. We reserve the right to update these
          terms at any time, and continued use of the site constitutes acceptance of any changes.
        </LegalSection>

        <LegalSection title="2. Purpose of This Website">
          This website documents Paul Barry&apos;s 2026 Pacific Crest Trail thru-hike for cancer awareness and
          fundraising. Content is provided for informational, educational, and inspirational purposes. Trail
          conditions, distances, and statistics are approximate and should not be relied upon for navigation
          or safety decisions.
        </LegalSection>

        <LegalSection title="3. Donations & Fundraising">
          All donations are processed securely through third-party payment providers. Donations are voluntary
          and non-refundable unless required by law. We make every effort to direct 100% of donations to cancer
          research, patient support, and prevention education programs as stated. Tax deductibility depends on
          the receiving organization&apos;s status; consult your tax advisor for guidance.
        </LegalSection>

        <LegalSection title="4. Intellectual Property">
          All content on this website — including text, photographs, videos, graphics, and trail data — is
          owned by Paul Barry or used with permission. You may share content for personal, non-commercial
          purposes with proper attribution. Reproduction, distribution, or commercial use without written
          permission is prohibited.
        </LegalSection>

        <LegalSection title="5. User Conduct">
          Users of this website agree not to: submit false information or fraudulent donations; use the site
          for any unlawful purpose; attempt to gain unauthorized access to site systems; harass, threaten,
          or harm other users or Paul Barry; or use automated systems to scrape or collect data from this site.
        </LegalSection>

        <LegalSection title="6. Disclaimer of Warranties">
          This website is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
          the accuracy, completeness, or timeliness of trail updates, fundraising totals, or other content.
          Hiking the PCT involves inherent risks; nothing on this site constitutes professional advice regarding
          outdoor activities, medical decisions, or financial contributions.
        </LegalSection>

        <LegalSection title="7. Contact Information">
          If you have questions about these Terms of Use, please contact us at{" "}
          <a href="mailto:paul@paulbarrypct.com" className="text-[var(--burnt-orange)] hover:underline">
            paul@paulbarrypct.com
          </a>.
        </LegalSection>
      </section>

      <Footer />
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">{title}</h2>
      <p className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)]">{children}</p>
    </div>
  );
}
