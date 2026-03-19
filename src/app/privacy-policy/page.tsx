import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the YesChapter website.",
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
        <p className="font-heading text-[14px] text-[var(--text-muted)]">Last updated: March 10, 2026</p>
      </section>

      {/* Body */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[320px] py-[40px] md:py-[60px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <LegalSection title="1. Information We Collect">
          <p>We collect information in the following ways:</p>
          <ul>
            <li><strong>Donations:</strong> When you make a donation, we collect your first name, last name, email address, and an optional message. Payment card details are processed directly by Stripe and are never stored on our servers.</li>
            <li><strong>Pledges:</strong> When you make a pledge-per-mile commitment, we collect your email address, display name (optional), pledge amount, and pledge interval. Your email is hashed for secure storage and used to look up your pledge status.</li>
            <li><strong>IP Geolocation:</strong> When you submit a pledge, we automatically collect your approximate geographic location (city and country) via your IP address. This is used to display pledger locations on an aggregate map. We also use IP-based geolocation on the trail map to show your approximate distance from Paul.</li>
            <li><strong>GPS Tracker Data:</strong> Paul&apos;s real-time location is collected via his phone&apos;s GPS and displayed publicly on the trail map.</li>
            <li><strong>Analytics:</strong> We collect anonymous, aggregate analytics data including page views, browser type, and device information. This data does not personally identify you.</li>
            <li><strong>Cookies &amp; Local Storage:</strong> We use essential cookies for site functionality. We also store your approximate location in your browser&apos;s localStorage to power the distance tracker feature. This data never leaves your device unless you submit a pledge.</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          <p>Your information is used to:</p>
          <ul>
            <li>Process and acknowledge donations via Stripe</li>
            <li>Display donor names and messages on the public Donor Wall (unless you opt for anonymity)</li>
            <li>Track and display your pledge-per-mile commitment</li>
            <li>Display pledger names on the public Pledger Wall (unless you opt for anonymity)</li>
            <li>Show aggregate pledger locations on the trail map</li>
            <li>Send transactional emails: pledge confirmations, challenge notifications, and challenge results</li>
            <li>Calculate and display your distance from Paul on the trail</li>
            <li>Improve website functionality and content through anonymous analytics</li>
          </ul>
          <p>We never sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        </LegalSection>

        <LegalSection title="3. Data Storage & Retention">
          <p>Your data is stored securely using the following services:</p>
          <ul>
            <li><strong>Upstash Redis</strong> (cloud database): Stores donation records, pledge records, pledger locations, and GPS tracking data. Hosted on encrypted infrastructure.</li>
            <li><strong>Stripe:</strong> Processes and stores payment information under PCI DSS compliance. We do not store card numbers, CVVs, or other payment credentials.</li>
            <li><strong>Vercel:</strong> Hosts the website. Server logs are retained per Vercel&apos;s standard policy.</li>
          </ul>
          <p>Retention periods:</p>
          <ul>
            <li>Donation records: Retained indefinitely for fundraising transparency</li>
            <li>Pledge records: Retained for the duration of the PCT hike and 12 months after completion</li>
            <li>GPS location history: Automatically deleted after 90 days</li>
            <li>Email addresses: Retained until you request deletion</li>
            <li>Browser localStorage data: Stored on your device until you clear it</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Email Communications">
          <p>We send transactional emails only — never marketing spam. You may receive:</p>
          <ul>
            <li>Pledge confirmation when you register a pledge</li>
            <li>Challenge notifications when Paul starts a trail challenge</li>
            <li>Challenge results when a challenge ends (including any boost applied to your pledge)</li>
          </ul>
          <p>
            Emails are sent via Resend, a third-party email delivery service. You can opt out of challenge notifications
            by contacting us at{" "}
            <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>.
            Pledge confirmation emails cannot be opted out of as they serve as your receipt.
          </p>
        </LegalSection>

        <LegalSection title="5. Third-Party Services">
          <p>This website integrates with the following third-party services, each with their own privacy policies:</p>
          <ul>
            <li><strong>Stripe</strong> — Payment processing (PCI DSS Level 1 compliant)</li>
            <li><strong>Upstash</strong> — Cloud database (encrypted at rest and in transit)</li>
            <li><strong>Vercel</strong> — Website hosting and serverless functions</li>
            <li><strong>OpenStreetMap / OpenTopoMap</strong> — Trail map tiles</li>
            <li><strong>Resend</strong> — Transactional email delivery</li>
            <li><strong>ip-api.com</strong> — IP-based geolocation (city/country only)</li>
            <li><strong>YouTube</strong> — Embedded video content and caption extraction</li>
            <li><strong>Anthropic (Claude AI)</strong> — Blog post generation from video transcripts (no user data is sent to this service)</li>
          </ul>
          <p>We encourage you to review the privacy policies of these services.</p>
        </LegalSection>

        <LegalSection title="6. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your personal data</li>
            <li>Request that your donation or pledge be displayed as &ldquo;Anonymous&rdquo;</li>
            <li>Opt out of challenge notification emails</li>
            <li>Request deletion of your pledge record entirely</li>
            <li>Clear your browser&apos;s localStorage to remove locally stored location data</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>.
            We will respond to data requests within 30 days.
          </p>
          <p>
            Note: Pledge lookups are available via email address without a password. If you are concerned about
            unauthorized access to your pledge information, contact us to discuss additional security measures.
          </p>
        </LegalSection>

        <LegalSection title="7. Data Security">
          <p>We implement reasonable security measures to protect your personal information:</p>
          <ul>
            <li>All data transmission is encrypted via HTTPS/TLS</li>
            <li>Payment data is handled exclusively by Stripe (PCI DSS compliant)</li>
            <li>Email addresses are stored as SHA-256 hashes for pledge lookups</li>
            <li>GPS tracker updates require authentication via a secret token</li>
            <li>The admin panel is protected by a separate authentication token</li>
          </ul>
          <p>However, no method of internet transmission is 100% secure. We cannot guarantee absolute security of your data.</p>
        </LegalSection>

        <LegalSection title="8. Children's Privacy">
          <p>
            This website is not directed at children under 13. We do not knowingly collect personal information
            from children. If you believe a child has provided us with personal data, please contact us at{" "}
            <a href="mailto:info@yeschapter.com" className="text-[var(--burnt-orange)] hover:underline">info@yeschapter.com</a>{" "}
            and we will promptly delete the information.
          </p>
        </LegalSection>

        <LegalSection title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
            &ldquo;Last updated&rdquo; date. Continued use of the website after changes constitutes acceptance of the revised policy.
          </p>
        </LegalSection>

        <LegalSection title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at{" "}
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
