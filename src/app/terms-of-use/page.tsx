import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the YesChapter website.",
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
        <p className="font-heading text-[14px] text-[var(--text-muted)]">Last updated: March 10, 2026</p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <LegalSection title="1. Acceptance of Terms">
          <p>
            By accessing and using yeschapter.com (the &ldquo;Website&rdquo;), you agree to be bound by these Terms of Use.
            If you do not agree to these terms, please do not use this site. We reserve the right to update these terms at
            any time, and continued use of the Website after changes constitutes acceptance of the revised terms.
          </p>
        </LegalSection>

        <LegalSection title="2. Purpose of This Website">
          <p>
            This Website documents Paul Barry&apos;s 2026 Pacific Crest Trail thru-hike for cancer awareness and
            fundraising. Content is provided for informational, educational, and inspirational purposes. Trail
            conditions, distances, and statistics are approximate and should not be relied upon for navigation
            or safety decisions.
          </p>
        </LegalSection>

        <LegalSection title="3. Donations & Fundraising">
          <p>
            All donations are processed securely through Stripe. Donations are voluntary and non-refundable unless
            required by applicable law. Funds raised are directed to the partner cancer foundations as described on
            the <Link href="/transparency" className="text-[var(--burnt-orange)] hover:underline">Transparency page</Link>.
            Paul Barry does not personally receive any portion of donations — 100% goes to the designated foundations.
            Tax deductibility depends on the receiving organization&apos;s status and your jurisdiction; consult your tax advisor.
          </p>
        </LegalSection>

        <LegalSection title="4. Pledges & Challenges">
          <p>
            Pledge-per-mile commitments are expressions of intent to donate based on miles completed. Pledges are not
            legally binding contracts. By registering a pledge, you indicate your intention to honor the amount pledged
            upon completion of the hike.
          </p>
          <p>
            Trail challenges are time-limited events where Paul attempts to cover a specified distance within a set
            timeframe. If you commit a &ldquo;boost&rdquo; to a challenge, your per-mile rate increases only if Paul succeeds.
            Challenge results are determined by GPS data and are final.
          </p>
          <p>
            Pledge amounts, boosted rates, and cumulative totals are displayed on the Pledger Wall. You may request
            anonymity at any time.
          </p>
        </LegalSection>

        <LegalSection title="5. Intellectual Property">
          <p>
            All content on this Website — including text, photographs, videos, graphics, and trail data — is
            owned by Paul Barry or used with permission. You may share content for personal, non-commercial
            purposes with proper attribution. Reproduction, distribution, or commercial use without written
            permission is prohibited.
          </p>
        </LegalSection>

        <LegalSection title="6. User Conduct">
          <p>Users of this Website agree not to:</p>
          <ul>
            <li>Submit false information or fraudulent donations</li>
            <li>Use the site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to site systems</li>
            <li>Harass, threaten, or harm other users or Paul Barry</li>
            <li>Use automated systems to scrape or collect data from this site</li>
            <li>Impersonate another person when making a donation or pledge</li>
            <li>Interfere with the GPS tracking or challenge systems</li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Foundation Partnerships & Fund Distribution">
          <p>
            Funds raised through donations and pledges are distributed to partner cancer foundations as described on
            the <Link href="/transparency" className="text-[var(--burnt-orange)] hover:underline">Transparency page</Link>.
            YesChapter acts as a fundraising platform — it is not itself a registered charity or nonprofit. The relationship
            between YesChapter and partner foundations is governed by separate agreements. Paul Barry personally receives
            no compensation from donations or pledges. For full details on fund allocation, see
            the <Link href="/transparency" className="text-[var(--burnt-orange)] hover:underline">Transparency page</Link>.
          </p>
        </LegalSection>

        <LegalSection title="8. Disclaimer of Warranties">
          <p>
            This Website is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee the accuracy,
            completeness, or timeliness of trail updates, fundraising totals, GPS tracking data, or other content. Hiking the
            PCT involves inherent risks; nothing on this site constitutes professional advice regarding outdoor activities,
            medical decisions, or financial contributions.
          </p>
        </LegalSection>

        <LegalSection title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, YesChapter and Paul Barry shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of this Website, including but not
            limited to loss of data, loss of funds, or interruption of service.
          </p>
        </LegalSection>

        <LegalSection title="10. Contact Information">
          <p>
            If you have questions about these Terms of Use, please contact us at{" "}
            <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>.
          </p>
        </LegalSection>
      </section>

      <Footer />
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">{title}</h2>
      <div className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)] flex flex-col gap-[12px] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[8px] [&_strong]:text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}
