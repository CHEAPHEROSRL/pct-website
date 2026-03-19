import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Transparency — How YesChapter Works",
  description:
    "How YesChapter pledges work, how trail support works, and full transparency on foundation partnerships and accountability.",
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
          How YesChapter Works
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] text-[var(--text-secondary)] text-center max-w-[600px]">
          Full transparency on how pledges, trail support, and foundation partnerships work
        </p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <TransparencySection title="1. Two Separate Streams — They Never Mix">
          <p>
            YesChapter has two completely separate ways for people to help. These streams are independent and never mix:
          </p>
          <ul>
            <li>
              <strong>Pledges for Cancer Foundations</strong> — Visitors pledge a per-mile amount (e.g., $0.25/mile).
              No money is collected. When Paul reaches Canada, pledgers are invited to donate their total directly to
              the partner foundations. Paul never touches, handles, or routes this money.
            </li>
            <li>
              <strong>Trail Support for Paul</strong> — Visitors can buy Paul a trail meal, boots, hostel night, or gear.
              This is the only place where actual payment is collected (via Stripe). These gifts go directly to Paul to
              keep him on the trail.
            </li>
          </ul>
        </TransparencySection>

        <TransparencySection title="2. How Pledges Work">
          <p>
            A pledge is a promise, not a payment. Here&apos;s how it works:
          </p>
          <ul>
            <li>You choose a per-mile amount (from $0.01 to $5.00 per mile)</li>
            <li>No payment information is collected — just your email and pledge amount</li>
            <li>As Paul hikes, your pledge total grows (e.g., $0.25/mi × 2,650 miles = $662.50)</li>
            <li>When Paul reaches Canada, you receive an email inviting you to honor your pledge</li>
            <li>You donate your pledge total directly to the partner foundations — not through Paul or YesChapter</li>
          </ul>
          <p>
            Paul does not collect, hold, or transfer pledge money. The pledge system is a commitment tracker — the actual
            donations happen between pledgers and the foundations directly.
          </p>
        </TransparencySection>

        <TransparencySection title="3. How Trail Support Works">
          <p>
            Trail support gifts are real payments processed through Stripe. When you buy Paul a meal, boots, or a rest day,
            the payment goes directly to Paul to cover trail expenses. This is completely separate from the pledge system.
          </p>
          <p>
            Paul Barry personally funds the majority of his hike — including gear, permits, travel, and planning expenses.
            Trail support gifts help offset daily costs like food, occasional lodging, and gear replacement over the
            2,650-mile journey.
          </p>
        </TransparencySection>

        <TransparencySection title="4. Paul Takes Nothing from Pledges">
          <p>
            Paul Barry receives zero dollars from the pledge system. When pledgers honor their commitments at the end of
            the hike, they donate directly to the partner cancer foundations. Paul does not receive any compensation, salary,
            or personal benefit from pledges made through this website.
          </p>
        </TransparencySection>

        <TransparencySection title="5. Partner Foundations">
          <p>
            YesChapter partners with established, registered cancer foundations to ensure pledges have maximum
            impact. Our partner foundations are selected based on their track record, transparency, and alignment with
            our mission of funding cancer research, patient support, and prevention programs.
          </p>
          <p>
            Details about each partner — including their mission, programs, and registration numbers — are published on
            our <Link href="/foundations" className="text-[var(--burnt-orange)] hover:underline">Foundations</Link> page.
          </p>
        </TransparencySection>

        <TransparencySection title="6. Pledge Distribution">
          <p>
            Pledges are split equally (50/50) between two geographic regions to honor both of Paul&apos;s parents —
            his father in California and his mother in Sydney, Australia:
          </p>
          <ul>
            <li>50% to City of Hope (Duarte, California, USA)</li>
            <li>50% to the Leukaemia Foundation (Australia)</li>
          </ul>
          <p>
            This split reflects Paul&apos;s personal connection to both regions and ensures support reaches cancer patients
            and research in the communities closest to his family&apos;s story.
          </p>
        </TransparencySection>

        <TransparencySection title="7. Legal Relationship">
          <p>
            YesChapter is a personal awareness campaign operated by Paul Barry. It is not a registered charity,
            nonprofit organization, or 501(c)(3) entity. YesChapter does not collect or process foundation donations —
            pledgers donate directly to the partner foundations when they honor their pledges.
          </p>
          <p>
            Tax deductibility depends on the partner foundation receiving the funds and your local tax
            laws. Both partner foundations are registered charitable organizations in their respective jurisdictions.
            We recommend consulting a tax professional for guidance specific to your situation.
          </p>
        </TransparencySection>

        <TransparencySection title="8. Accountability & Reporting">
          <p>We believe in full transparency. To that end, we commit to:</p>
          <ul>
            <li>Publishing the total pledged amount on the website in real-time</li>
            <li>Providing clear instructions for pledgers to donate directly to foundations at the end of the hike</li>
            <li>Sharing periodic updates through the Journal about the journey and the cause</li>
            <li>Making ourselves available to answer questions via{" "}
              <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>
            </li>
          </ul>
          <p>
            If a partnership with a foundation ends or changes, pledgers will be notified through the website and
            directed to an alternative qualified cancer foundation.
          </p>
        </TransparencySection>

        <TransparencySection title="9. Questions & Contact">
          <p>
            If you have questions about how pledges work, our foundation partnerships, or anything related to
            the transparency of this campaign, please reach out:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>
            <br />
            Website: yeschapter.com
          </p>
          <p>
            We welcome questions and believe transparency builds trust. Paul is personally committed to answering every
            inquiry.
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
