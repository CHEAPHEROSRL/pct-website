import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Paul Barry PCT 2026 website.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[12px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[52px] lg:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">LEGAL</span>
        <h1 className="font-heading font-semibold text-[28px] md:text-[38px] lg:text-[48px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
          Privacy Policy
        </h1>
        <p className="font-heading text-[14px] text-[var(--text-muted)]">Last updated: February 28, 2026</p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <LegalSection title="1. Information We Collect">
          We collect information you voluntarily provide, including: your name and email address when making
          a donation; messages and comments you submit; and email addresses if you subscribe to trail updates.
          We also automatically collect basic analytics data such as page views, browser type, and approximate
          geographic location through standard web technologies.
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          Your information is used to: process and acknowledge donations; display donor names and messages
          on the Donor Wall (unless you opt for anonymity); send trail updates if you subscribe; improve
          website functionality and content; and communicate about the cause and fundraising progress.
          We never sell, rent, or trade your personal information to third parties.
        </LegalSection>

        <LegalSection title="3. Cookies & Tracking">
          This website uses essential cookies for site functionality and analytics cookies to understand
          how visitors interact with the site. Analytics data is collected in aggregate and does not
          personally identify you. You can control cookie preferences through your browser settings.
          Third-party services (such as embedded maps or payment processors) may set their own cookies.
        </LegalSection>

        <LegalSection title="4. Data Security">
          We implement reasonable security measures to protect your personal information. Donation
          transactions are encrypted and processed through PCI-compliant payment providers (Stripe).
          However, no method of internet transmission is 100% secure, and we cannot guarantee absolute
          security of your data.
        </LegalSection>

        <LegalSection title="5. Your Rights">
          You have the right to: request access to the personal data we hold about you; request correction
          or deletion of your personal data; opt out of email communications at any time; and request that
          your donor information be made anonymous on the Donor Wall. To exercise any of these rights,
          contact us at the email address below.
        </LegalSection>

        <LegalSection title="6. Third-Party Services">
          This website integrates with third-party services including Stripe (payment processing),
          OpenStreetMap (trail maps), Unsplash (photography), and Vercel (hosting). Each service has
          its own privacy policy governing their use of your data. We encourage you to review their
          respective policies.
        </LegalSection>

        <LegalSection title="7. Contact Us">
          If you have questions about this Privacy Policy or wish to exercise your data rights, please
          contact us at{" "}
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
