import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Trail Section Sponsorship Agreement — YesChapter",
  description: "Sponsorship agreement template for businesses pledging $5,000+ to sponsor a section of the Pacific Crest Trail on the YesChapter website.",
  robots: "noindex, nofollow",
};

export default function SponsorAgreementPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Back link */}
      <div className="px-6 md:px-12 lg:px-[120px] pt-[24px]">
        <Link href="/strategy" className="flex items-center gap-[8px] font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="w-[14px] h-[14px]" />
          BACK TO STRATEGY
        </Link>
      </div>

      {/* Header */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] bg-[var(--bg-warm)] w-full">
        <div className="flex items-center gap-[12px]">
          <FileText className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">INTERNAL DOCUMENT</span>
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
          Trail Section Sponsorship Agreement
        </h1>
        <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)] max-w-[700px]">
          This is a template agreement between Paul Barry (&quot;YesChapter&quot;) and businesses who wish to sponsor a section of the Pacific Crest Trail on the website. Paul — review this carefully before sending to any potential sponsor. Consider having a nonprofit attorney review it once (~$500–$1,500) before first use.
        </p>
        <div className="flex items-start gap-[12px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] p-[16px] max-w-[700px]">
          <AlertTriangle className="w-[20px] h-[20px] text-[var(--burnt-orange)] shrink-0 mt-[2px]" />
          <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
            <strong>Important:</strong> This document is a template, not legal advice. It has been researched against current US tax law and IRS guidelines, but you should have a licensed attorney review it before use. Tax treatment depends on each sponsor&apos;s individual circumstances.
          </p>
        </div>
      </section>

      {/* Agreement Document */}
      <section className="flex flex-col gap-[0px] px-6 md:px-12 lg:px-[120px] pb-[64px] w-full">
        <div className="bg-[var(--bg-white)] border border-[var(--border-subtle)] shadow-sm max-w-[800px]">

          {/* Document Header */}
          <div className="flex flex-col items-center gap-[8px] px-[40px] md:px-[60px] py-[40px] border-b border-[var(--border-subtle)] text-center">
            <Shield className="w-[32px] h-[32px] text-[var(--forest-green)]" />
            <h2 className="font-heading font-semibold text-[22px] tracking-[-0.5px] text-[var(--text-primary)]">
              TRAIL SECTION SPONSORSHIP AGREEMENT
            </h2>
            <p className="font-label font-medium text-[11px] tracking-[2px] text-[var(--text-muted)]">
              YESCHAPTER — PACIFIC CREST TRAIL 2026
            </p>
          </div>

          {/* Document Body */}
          <div className="flex flex-col gap-[32px] px-[40px] md:px-[60px] py-[40px]">

            {/* Parties */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">1. PARTIES</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                This Trail Section Sponsorship Agreement (&quot;Agreement&quot;) is entered into as of <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span> (the &quot;Effective Date&quot;) between:
              </p>
              <div className="flex flex-col gap-[8px] pl-[20px] border-l-[3px] border-[var(--border-subtle)]">
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>Facilitator:</strong> Paul Barry, an individual operating as &quot;YesChapter&quot; (yeschapter.com), hereinafter referred to as &quot;YesChapter.&quot;
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>Sponsor:</strong> <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span> (&quot;Sponsor&quot;), a company organized under the laws of <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span>.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>Recipient Foundations:</strong> City of Hope (a 501(c)(3) organization, EIN: 95-1644028) and the Leukaemia Foundation of Australia.
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">2. PURPOSE AND STRUCTURE</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                YesChapter is a personal project by Paul Barry to raise awareness and pledges for cancer research and prevention during his 2026 Pacific Crest Trail thru-hike (2,650 miles, Mexico to Canada). <strong>YesChapter is not a 501(c)(3) organization, charity, or nonprofit entity.</strong>
              </p>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                Under this Agreement, the Sponsor commits to making a financial contribution <strong>directly to the Recipient Foundations</strong> in exchange for acknowledgment on the YesChapter website. Paul Barry / YesChapter does not solicit, collect, hold, manage, or disburse any funds on behalf of the Recipient Foundations or the Sponsor.
              </p>
            </div>

            {/* Sponsorship Details */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">3. SPONSORSHIP DETAILS</h3>
              <div className="flex flex-col gap-[8px] pl-[20px] border-l-[3px] border-[var(--border-subtle)]">
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>3.1 Sponsorship Amount:</strong> <span className="bg-[var(--burnt-orange-light)] px-[4px]">$__________</span> (minimum $5,000 USD)
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>3.2 Trail Section:</strong> <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span> (e.g., &quot;Southern California — Miles 0 to 700&quot;)
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>3.3 Allocation:</strong> The Sponsorship Amount shall be divided equally (50/50) between City of Hope and the Leukaemia Foundation, unless otherwise agreed in writing.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>3.4 Payment Method:</strong> The Sponsor shall pay the Sponsorship Amount <strong>directly to the Recipient Foundations&apos; designated bank accounts</strong>. YesChapter will provide the foundations&apos; payment details upon execution of this Agreement. YesChapter does not accept, process, or route any sponsorship funds.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>3.5 Payment Timing:</strong> Payment shall be made within <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span> days of the Effective Date, or upon Paul Barry reaching the sponsored trail section, whichever the parties agree.
                </p>
              </div>
            </div>

            {/* Sponsor Benefits */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">4. SPONSOR ACKNOWLEDGMENT AND BENEFITS</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                In recognition of the Sponsor&apos;s contribution, YesChapter shall provide the following acknowledgment:
              </p>
              <div className="flex flex-col gap-[8px] pl-[20px] border-l-[3px] border-[var(--border-subtle)]">
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>4.1</strong> Display of the Sponsor&apos;s logo and company name on the sponsored trail section of the interactive trail map at yeschapter.com.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>4.2</strong> A link to the Sponsor&apos;s website from the trail map section.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>4.3</strong> Mention in YesChapter social media channels acknowledging the Sponsor&apos;s support (value-neutral language only).
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>4.4</strong> Duration: The Sponsor&apos;s logo shall remain displayed on the YesChapter website for a minimum of <strong>12 months</strong> from the date of publication, or until the website is decommissioned, whichever is later.
                </p>
              </div>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                Acknowledgment shall be limited to the Sponsor&apos;s name, logo, website URL, and a value-neutral description of the Sponsor&apos;s business. No promotional, comparative, or qualitative language shall be used (e.g., &quot;the best,&quot; &quot;leading provider,&quot; &quot;buy from&quot;). This is consistent with IRS qualified sponsorship guidelines under IRC Section 513(i).
              </p>
            </div>

            {/* Tax Considerations */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">5. TAX CONSIDERATIONS</h3>
              <div className="bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[20px] flex flex-col gap-[12px]">
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>5.1</strong> YesChapter is <strong>not</strong> a 501(c)(3) tax-exempt organization. This Agreement is not a charitable solicitation by YesChapter.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>5.2</strong> Payments made directly to City of Hope (a qualified 501(c)(3) organization) <strong>may</strong> be tax-deductible as charitable contributions to the extent permitted by law. The Recipient Foundation will issue a donation acknowledgment letter as required by IRS regulations for contributions over $250.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>5.3</strong> Alternatively, the Sponsor may treat the payment as an <strong>advertising or business expense</strong> under IRC Section 162, which may be fully deductible as an ordinary business expense with no percentage-of-income cap. Many companies find this treatment more favorable.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>5.4</strong> The value of the acknowledgment benefits (logo placement, website link) received by the Sponsor may reduce the tax-deductible portion of any charitable contribution claim. The Sponsor&apos;s fair market value assessment of these benefits is the Sponsor&apos;s responsibility.
                </p>
                <p className="font-heading font-semibold text-[15px] leading-[1.8] text-[var(--text-primary)]">
                  <strong>5.5</strong> The Sponsor is strongly encouraged to consult with a qualified tax advisor or CPA regarding the deductibility and proper classification of this sponsorship payment. YesChapter makes no representations or guarantees regarding tax treatment.
                </p>
              </div>
            </div>

            {/* Representations */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">6. REPRESENTATIONS AND WARRANTIES</h3>
              <div className="flex flex-col gap-[8px] pl-[20px] border-l-[3px] border-[var(--border-subtle)]">
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>6.1 YesChapter represents that:</strong> (a) Paul Barry intends to attempt a complete thru-hike of the Pacific Crest Trail beginning in 2026; (b) YesChapter will make reasonable efforts to display the Sponsor&apos;s acknowledgment as described; (c) YesChapter does not and will not collect, hold, or disburse any funds on behalf of the Recipient Foundations.
                </p>
                <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  <strong>6.2 The Sponsor represents that:</strong> (a) it has the authority to enter into this Agreement; (b) the logo and materials provided do not infringe any third-party rights; (c) the Sponsor&apos;s business and products are not in conflict with YesChapter&apos;s mission (cancer awareness and prevention).
                </p>
              </div>
            </div>

            {/* Hike Completion */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">7. HIKE COMPLETION AND CONTINGENCIES</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>7.1</strong> The Pacific Crest Trail thru-hike is an inherently uncertain undertaking. Paul Barry may not complete the entire trail due to injury, weather, permit issues, or other circumstances beyond his control.
              </p>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>7.2</strong> Regardless of hike completion, the Sponsor&apos;s logo and acknowledgment shall remain displayed on the YesChapter website for the full 12-month term described in Section 4.4. The sponsorship is for the awareness campaign as a whole, not contingent on any specific trail milestone.
              </p>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>7.3</strong> Donations already made to the Recipient Foundations are non-refundable, as they are direct charitable contributions between the Sponsor and the foundations.
              </p>
            </div>

            {/* No Endorsement */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">8. NO ENDORSEMENT</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                Display of the Sponsor&apos;s logo on the YesChapter website does not constitute an endorsement of the Sponsor&apos;s products or services by Paul Barry, YesChapter, City of Hope, or the Leukaemia Foundation. Similarly, the Sponsor&apos;s participation does not constitute an endorsement of YesChapter by the Sponsor.
              </p>
            </div>

            {/* Right to Decline */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">9. RIGHT TO DECLINE OR REMOVE</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                YesChapter reserves the right to decline any sponsorship or remove a Sponsor&apos;s logo from the website if the Sponsor&apos;s business, products, or conduct are determined to conflict with the mission of cancer awareness and prevention — including but not limited to tobacco, alcohol abuse promotion, or any activity that may be harmful to public health.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">10. LIMITATION OF LIABILITY</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>10.1</strong> YesChapter&apos;s total liability under this Agreement shall not exceed the value of the acknowledgment services provided (logo display).
              </p>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>10.2</strong> YesChapter is not liable for: (a) the tax treatment of the Sponsor&apos;s contribution; (b) actions or omissions of the Recipient Foundations; (c) website downtime, technical issues, or traffic levels; (d) non-completion of the PCT thru-hike.
              </p>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                <strong>10.3</strong> Each party shall indemnify and hold harmless the other party from any claims arising from its own breach of this Agreement or misrepresentation.
              </p>
            </div>

            {/* Term */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">11. TERM AND TERMINATION</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                This Agreement begins on the Effective Date and continues for 12 months from the date the Sponsor&apos;s logo is first published on the YesChapter website. Either party may terminate with 30 days&apos; written notice, provided that termination does not affect the Sponsor&apos;s obligation to complete payment to the Recipient Foundations for any amounts already committed.
              </p>
            </div>

            {/* Governing Law */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">12. GOVERNING LAW</h3>
              <p className="font-heading text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                This Agreement shall be governed by the laws of the State of <span className="bg-[var(--burnt-orange-light)] px-[4px]">__________</span>. Any disputes shall be resolved through good-faith negotiation and, if necessary, binding arbitration.
              </p>
            </div>

            {/* Signatures */}
            <div className="flex flex-col gap-[24px] pt-[24px] border-t border-[var(--border-subtle)]">
              <h3 className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">SIGNATURES</h3>
              <div className="flex flex-col md:flex-row gap-[40px]">
                <div className="flex flex-col gap-[16px] flex-1">
                  <p className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">YesChapter</p>
                  <div className="border-b border-[var(--text-primary)] w-full h-[40px]" />
                  <p className="font-heading text-[13px] text-[var(--text-muted)]">Paul Barry — Date: __________</p>
                </div>
                <div className="flex flex-col gap-[16px] flex-1">
                  <p className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">Sponsor</p>
                  <div className="border-b border-[var(--text-primary)] w-full h-[40px]" />
                  <p className="font-heading text-[13px] text-[var(--text-muted)]">Name / Title — Date: __________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
