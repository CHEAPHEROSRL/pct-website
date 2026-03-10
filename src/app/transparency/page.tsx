import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Foundation Partnerships — Transparency",
  description:
    "How YesChapter directs donations to cancer foundations. Full transparency on fund distribution, partnerships, and accountability.",
};

export default function TransparencyPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
          TRANSPARENCY
        </span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Foundation Partnerships
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[600px]">
          How your donations reach the people who need them most
        </p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <TransparencySection title="1. Our Commitment to Transparency">
          <p>
            YesChapter is Paul Barry&apos;s personal fundraising campaign for his 2026 Pacific Crest Trail thru-hike.
            Every dollar donated goes directly to cancer research, patient support, and prevention through our partner
            foundations. Paul does not receive any compensation, salary, or personal benefit from donations made through
            this website.
          </p>
          <p>
            This page exists to provide full transparency about how your donations are handled, which organizations
            receive funds, and how money is distributed.
          </p>
        </TransparencySection>

        <TransparencySection title="2. Paul Takes Nothing">
          <p>
            Paul Barry personally funds his own hike — including gear, food, permits, travel, and all expenses.
            Zero percent of your donation goes toward Paul&apos;s hiking costs or personal expenses. This is a personal
            commitment, and Paul covers 100% of his own way.
          </p>
          <p>
            Your donation is passed through in full to our partner cancer foundations, minus only standard payment
            processing fees charged by Stripe (approximately 2.9% + $0.30 per transaction). YesChapter does not add
            any additional fees or administrative charges.
          </p>
        </TransparencySection>

        <TransparencySection title="3. Partner Foundations">
          <p>
            YesChapter partners with established, registered cancer foundations to ensure your donations have maximum
            impact. Our partner foundations are selected based on their track record, transparency, and alignment with
            our mission of funding cancer research, patient support, and prevention programs.
          </p>
          <p>
            Partner foundations will be announced prior to the hike start date. Each partner undergoes due diligence to
            confirm their charitable registration status, financial transparency, and program effectiveness. Details about
            each partner — including their mission, programs, and registration numbers — are published on
            our <Link href="/foundations" className="text-[var(--burnt-orange)] hover:underline">Our Foundations</Link> page.
          </p>
        </TransparencySection>

        <TransparencySection title="4. Fund Distribution">
          <p>
            Donations are split equally (50/50) between two geographic regions to honor both of Paul&apos;s parents —
            his father in California and his mother in Sydney, Australia. This means:
          </p>
          <ul>
            <li>50% goes to a US-based cancer foundation (California focus)</li>
            <li>50% goes to an Australian cancer foundation (Sydney focus)</li>
          </ul>
          <p>
            This split reflects Paul&apos;s personal connection to both regions and ensures funds support cancer patients
            and research in the communities closest to his family&apos;s story.
          </p>
        </TransparencySection>

        <TransparencySection title="5. Legal Relationship">
          <p>
            YesChapter is a personal fundraising initiative operated by Paul Barry. It is not a registered charity,
            nonprofit organization, or 501(c)(3) entity. Donations made through YesChapter are directed to our partner
            foundations, which are independently registered charitable organizations in their respective jurisdictions.
          </p>
          <p>
            Tax deductibility of your donation depends on the partner foundation receiving the funds and your local tax
            laws. We recommend consulting a tax professional for guidance specific to your situation. Partner foundation
            registration details and tax-exempt status information will be listed in their respective profiles above.
          </p>
        </TransparencySection>

        <TransparencySection title="6. Partnership Agreements">
          <p>
            Formal partnership agreements are established between Paul Barry (operating as YesChapter) and each partner
            foundation. These agreements outline:
          </p>
          <ul>
            <li>The scope of the fundraising relationship</li>
            <li>Fund transfer schedules and methods</li>
            <li>Reporting obligations (how foundations report fund usage back to donors)</li>
            <li>Use-of-name and branding permissions</li>
            <li>Duration of the partnership</li>
            <li>Termination conditions and procedures</li>
          </ul>
          <p>
            Copies of partnership agreements (or summaries) may be made available upon request by emailing{" "}
            <a href="mailto:paul@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">paul@yeschapter.com</a>.
          </p>
        </TransparencySection>

        <TransparencySection title="7. How Funds Are Transferred">
          <p>
            Donations collected through Stripe are held in YesChapter&apos;s Stripe account and transferred to partner
            foundations on a regular schedule (monthly or at agreed milestones). Transfers are made via bank transfer or
            check directly to the foundation&apos;s verified accounts.
          </p>
          <p>
            A running total of funds raised and distributed will be published on this page. We aim to transfer funds
            within 30 days of collection, though timing may vary based on partnership agreement terms.
          </p>
        </TransparencySection>

        <TransparencySection title="8. Accountability & Reporting">
          <p>We believe donors deserve to know exactly where their money goes. To that end, we commit to:</p>
          <ul>
            <li>Publishing the total amount raised and distributed on this page</li>
            <li>Sharing confirmation receipts from partner foundations when funds are transferred</li>
            <li>Providing periodic updates through the Journal about the impact of donations</li>
            <li>Making ourselves available to answer donor questions via{" "}
              <a href="mailto:paul@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">paul@yeschapter.com</a>
            </li>
          </ul>
          <p>
            If a partnership with a foundation ends or changes, donors will be notified through the website and any
            undistributed funds will be redirected to an alternative qualified cancer foundation.
          </p>
        </TransparencySection>

        <TransparencySection title="9. Questions & Contact">
          <p>
            If you have questions about our foundation partnerships, how funds are distributed, or anything related to
            the transparency of this campaign, please reach out:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:paul@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">paul@yeschapter.com</a>
            <br />
            Website: yeschapter.com
          </p>
          <p>
            We welcome questions and believe transparency builds trust. Paul is personally committed to answering every
            donor inquiry.
          </p>
        </TransparencySection>
      </section>

      <Footer />
    </div>
  );
}

function TransparencySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">{title}</h2>
      <div className="font-heading text-[16px] leading-[1.8] text-[var(--text-secondary)] flex flex-col gap-[12px] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[8px] [&_strong]:text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}
