import { Mountain, Flag, Mail, ArrowRight, CheckCircle, MapPin, Share2, Calendar, Heart, Shield, DollarSign, Users, Globe, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
      {children}
    </span>
  );
}

function EmailHeader() {
  return (
    <div className="flex justify-between items-center px-[28px] py-[14px] bg-[var(--bg-dark)]">
      <span className="font-label font-bold text-[14px] tracking-[3px] text-[var(--text-white)]">YESCHAPTER</span>
      <span className="font-label font-semibold text-[9px] tracking-[2px] text-[#FFFFFF66]">WALKING FOR CANCER</span>
    </div>
  );
}

function EmailFooter({ detail }: { detail: string }) {
  return (
    <div className="flex flex-col items-center gap-[10px] px-[32px] py-[20px] bg-[var(--bg-dark)]">
      <span className="font-label font-bold text-[12px] tracking-[3px] text-[#FFFFFF88]">YESCHAPTER</span>
      <p className="font-heading text-[11px] text-[#FFFFFF66] text-center leading-[1.6]">{detail}</p>
      <span className="font-label font-medium text-[10px] text-[#FFFFFF44]">View My Pledge &middot; Unsubscribe &middot; yeschapter.com</span>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="relative w-full h-[10px] bg-[var(--warm-stone)] rounded-[5px] overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-[5px]"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, var(--forest-green), var(--burnt-orange))",
          }}
        />
      </div>
      <div className="flex justify-between w-full">
        <span className="font-label font-medium text-[9px] tracking-[1px] text-[var(--text-muted)]">Mexico</span>
        <span className="font-label font-bold text-[9px] tracking-[1px] text-[var(--burnt-orange)]">{percent}% complete</span>
        <span className="font-label font-medium text-[9px] tracking-[1px] text-[var(--text-muted)]">Canada</span>
      </div>
    </div>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">{label}</span>
      <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.5]">{children}</p>
    </div>
  );
}

export default function StrategyPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* ═══════════════════════════════════════ */}
      {/* COVER HERO */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[80px] md:py-[120px] bg-[var(--bg-dark)] text-center w-full">
        <span className="font-label font-bold text-[12px] tracking-[6px] text-[#FFFFFF55]">YESCHAPTER</span>
        <h1 className="font-heading font-semibold text-[36px] md:text-[48px] tracking-[-1px] text-[var(--text-white)] max-w-[700px]">
          Email Templates for{" "}
          <span className="text-[var(--burnt-orange)]">Pledge Engagement</span>
        </h1>
        <p className="font-heading text-[18px] text-[#FFFFFFBB] max-w-[560px] leading-[1.6]">
          Three email designs to keep pledgers connected during the hike and guide them through honoring their pledges when Paul reaches Canada.
        </p>
        <span className="font-label font-semibold text-[11px] tracking-[2px] text-[#FFFFFF44] mt-[24px]">
          PREPARED FOR PAUL BARRY &middot; MARCH 2026
        </span>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 1: WEEKLY UPDATE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 1 OF 3</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Weekly <span className="text-[var(--burnt-orange)]">Update</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Sent every Monday during the hike. Keeps pledgers emotionally invested by showing Paul&apos;s progress and their growing pledge total. This is the heartbeat of engagement.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          {/* Email Render */}
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            {/* Hero */}
            <div className="flex flex-col items-center gap-[12px] px-[32px] py-[36px] bg-[var(--bg-dark)] text-center">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-white)] bg-[var(--burnt-orange)] px-[14px] py-[5px] rounded-[2px]">WEEK 12 UPDATE</span>
              <h3 className="font-heading font-semibold text-[24px] text-[var(--text-white)]">Paul Crossed Into Oregon</h3>
              <p className="font-heading text-[13px] text-[#FFFFFFAA]">Mile 1,694 of 2,650 &mdash; Day 87 on the Pacific Crest Trail</p>
              <div className="w-[50px] h-[2px] bg-[var(--burnt-orange)]" />
            </div>
            {/* Pledge Total */}
            <div className="flex flex-col items-center gap-[6px] px-[32px] py-[28px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-muted)]">YOUR RUNNING PLEDGE TOTAL</span>
              <span className="font-heading font-semibold text-[44px] tracking-[-1px] text-[var(--burnt-orange)]">$423.50</span>
              <span className="font-heading text-[12px] text-[var(--text-secondary)]">$0.25/mile &times; 1,694 miles walked</span>
              <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">$211.75 to Tower Cancer Research &middot; $211.75 to Cancer Council NSW</span>
            </div>
            {/* Progress */}
            <div className="flex flex-col gap-[8px] px-[32px] py-[18px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-muted)]">TRAIL PROGRESS</span>
              <ProgressBar percent={64} />
            </div>
            {/* Stats */}
            <div className="flex justify-around px-[32px] py-[18px] bg-[var(--bg-warm)]">
              {[
                { val: "1,694", label: "MILES WALKED", color: "var(--text-primary)" },
                { val: "87", label: "DAYS ON TRAIL", color: "var(--text-primary)" },
                { val: "6,200 ft", label: "ELEVATION", color: "var(--text-primary)" },
                { val: "1,247", label: "PLEDGERS", color: "var(--forest-green)" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="font-heading font-semibold text-[19px]" style={{ color: s.color }}>{s.val}</span>
                  <span className="font-label font-semibold text-[8px] tracking-[2px] text-[var(--text-muted)]">{s.label}</span>
                </div>
              ))}
            </div>
            {/* Journal */}
            <div className="flex flex-col gap-[12px] px-[32px] py-[28px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--burnt-orange)]">FROM PAUL&apos;S JOURNAL</span>
              <div className="w-full h-[140px] rounded-[4px] bg-gradient-to-br from-[#8BA886] via-[#D4A574] to-[#E8C9A0] flex items-center justify-center">
                <span className="font-label text-[10px] tracking-[2px] text-[#FFFFFFBB]">TRAIL PHOTO</span>
              </div>
              <p className="font-heading italic text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                &ldquo;Today I woke up above the clouds. The trail dropped into a valley of wildflowers and I thought about Mom. She would have loved this view. 87 days in and every step still feels like it matters.&rdquo;
              </p>
              <span className="font-label font-semibold text-[12px] text-[var(--burnt-orange)]">Read the full journal entry &rarr;</span>
            </div>
            {/* CTA */}
            <div className="flex flex-col items-center gap-[10px] px-[32px] py-[24px] bg-[var(--bg-warm)]">
              <p className="font-heading text-[13px] text-[var(--text-secondary)]">Follow Paul&apos;s journey in real-time</p>
              <div className="flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[28px] py-[12px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">VIEW TRAIL MAP</span>
                <ArrowRight className="w-[12px] h-[12px] text-[var(--text-white)]" />
              </div>
            </div>
            <EmailFooter detail="You're receiving this because you pledged to walk with Paul. Your pledge: $0.25/mile · Total so far: $423.50" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="FREQUENCY">Sent every Monday morning. Pledgers start their week seeing Paul&apos;s progress.</DetailItem>
            <DetailItem label="PERSONAL RUNNING TOTAL">The big orange number ($423.50) is the most important element. Watching it grow from $12 to $200 to $662 over 6 months creates ownership. It&apos;s <em>their</em> number.</DetailItem>
            <DetailItem label="TRAIL PROGRESS BAR">Visual representation of how far Paul has walked. Green-to-orange gradient matches the brand. Percentage gives concrete sense of completion.</DetailItem>
            <DetailItem label="JOURNAL EXCERPT">Emotional connection. A short quote from Paul&apos;s trail journal humanizes the numbers. Links to full entry on yeschapter.com to drive site traffic.</DetailItem>
            <DetailItem label="50/50 SPLIT SHOWN">Every email reinforces where the money goes: half to Tower Cancer Research, half to Cancer Council NSW. Builds trust.</DetailItem>
            <DetailItem label="DYNAMIC CONTENT">Every field is personalized: pledge rate, total, miles, days, journal excerpt. No two pledgers see the same email.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 2: MILESTONE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 2 OF 3</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Milestone <span className="text-[var(--burnt-orange)]">Celebration</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Triggered at key trail milestones: 500 miles, 1,000 miles, halfway (1,325), state crossings. Celebrates progress and shows the pledger&apos;s growing total.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          {/* Email Render */}
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            {/* Hero */}
            <div className="flex flex-col items-center gap-[12px] px-[32px] py-[40px] bg-[var(--burnt-orange)] text-center">
              <Mountain className="w-[36px] h-[36px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-white)] bg-[#FFFFFF22] px-[14px] py-[5px] rounded-[2px]">MILESTONE REACHED</span>
              <h3 className="font-heading font-semibold text-[26px] text-[var(--text-white)]">Paul Hit 1,000 Miles!</h3>
              <p className="font-heading text-[12px] text-[#FFFFFFCC] leading-[1.6] max-w-[380px]">
                From the Mexican border through the deserts of Southern California and into the Sierra Nevada &mdash; one thousand miles walked for cancer.
              </p>
              <div className="w-[50px] h-[2px] bg-[#FFFFFF44]" />
            </div>
            {/* Pledge */}
            <div className="flex flex-col items-center gap-[6px] px-[32px] py-[28px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-muted)]">YOUR PLEDGE IS NOW</span>
              <span className="font-heading font-semibold text-[48px] tracking-[-1px] text-[var(--burnt-orange)]">$250.00</span>
              <span className="font-heading text-[12px] text-[var(--text-secondary)]">$0.25/mile &times; 1,000 miles = $250.00 pledged so far</span>
              <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">$125.00 to Tower Cancer Research &middot; $125.00 to Cancer Council NSW</span>
            </div>
            {/* Progress */}
            <div className="flex flex-col gap-[8px] px-[32px] py-[18px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TRAIL PROGRESS &mdash; 38% COMPLETE</span>
              <ProgressBar percent={38} />
            </div>
            {/* Community */}
            <div className="flex flex-col items-center gap-[14px] px-[32px] py-[24px] bg-[var(--bg-warm)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-muted)]">THE YESCHAPTER COMMUNITY</span>
              <div className="flex gap-[36px]">
                {[
                  { val: "1,247", label: "pledgers", color: "var(--forest-green)" },
                  { val: "$32,450", label: "total pledged", color: "var(--burnt-orange)" },
                  { val: "23", label: "countries", color: "var(--text-primary)" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <span className="font-heading font-semibold text-[20px]" style={{ color: s.color }}>{s.val}</span>
                    <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA */}
            <div className="flex flex-col items-center gap-[10px] px-[32px] py-[24px] bg-[var(--bg-white)]">
              <div className="flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[28px] py-[12px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">SEE PAUL&apos;S LOCATION ON THE MAP</span>
                <MapPin className="w-[12px] h-[12px] text-[var(--text-white)]" />
              </div>
              <span className="font-label font-semibold text-[11px] text-[var(--burnt-orange)]">Share this milestone with friends &rarr;</span>
            </div>
            <EmailFooter detail="You're receiving this because you pledged to walk with Paul." />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="TRIGGER EVENTS">
              <strong>500 miles</strong> &mdash; Desert survived<br />
              <strong>1,000 miles</strong> &mdash; Sierra entered<br />
              <strong>1,325 miles</strong> &mdash; Halfway point<br />
              <strong>State crossings</strong> &mdash; CA&rarr;OR, OR&rarr;WA<br />
              <strong>2,000 miles</strong> &mdash; Final stretch
            </DetailItem>
            <DetailItem label="BURNT ORANGE HERO">Full-bleed brand color creates a celebration moment. The mountain icon and &ldquo;MILESTONE REACHED&rdquo; badge make it feel like an achievement &mdash; because it is.</DetailItem>
            <DetailItem label="&ldquo;YOUR PLEDGE IS NOW&rdquo;">Reframes the milestone around the pledger. It&apos;s not just Paul&apos;s achievement &mdash; the pledger&apos;s commitment grew too. This creates shared ownership.</DetailItem>
            <DetailItem label="COMMUNITY STATS">Social proof: 1,247 pledgers across 23 countries, $32,450 total pledged. Shows the pledger they&apos;re part of something big.</DetailItem>
            <DetailItem label="SHARE PROMPT">&ldquo;Share this milestone with friends&rdquo; encourages organic growth. Milestones are natural share moments.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 3: HONOR EMAIL */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 3 OF 3</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Paul Made It &mdash; <span className="text-[var(--burnt-orange)]">Honor</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            The most important email we&apos;ll ever send. Triggered when Paul reaches Manning Park, BC. Converts 6 months of pledges into real donations to the two cancer foundations.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          {/* Email Render */}
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            {/* Hero */}
            <div className="flex flex-col items-center gap-[14px] px-[32px] py-[44px] bg-[var(--forest-green)] text-center">
              <Flag className="w-[40px] h-[40px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[12px] tracking-[4px] text-[var(--text-white)] bg-[#FFFFFF22] px-[20px] py-[8px] rounded-[2px]">HE MADE IT</span>
              <h3 className="font-heading font-semibold text-[28px] text-[var(--text-white)]">Paul Reached Canada.</h3>
              <p className="font-heading text-[13px] text-[#FFFFFFCC] leading-[1.6] max-w-[400px]">
                2,650 miles. 6 months. Every step for cancer research, patient support, and prevention &mdash; in honor of his parents.
              </p>
              <div className="w-[50px] h-[2px] bg-[#FFFFFF44]" />
            </div>
            {/* Photo */}
            <div className="w-full h-[180px] bg-gradient-to-br from-[#D4A574] via-[#E8A040] to-[#F5D0A0] flex items-center justify-center">
              <span className="font-label text-[10px] tracking-[2px] text-[#FFFFFFBB]">FINISH LINE PHOTO</span>
            </div>
            {/* Final Pledge */}
            <div className="flex flex-col items-center gap-[6px] px-[32px] py-[32px] bg-[var(--bg-white)] text-center">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">YOUR FINAL PLEDGE TOTAL</span>
              <span className="font-heading font-semibold text-[52px] tracking-[-1px] text-[var(--burnt-orange)]">$662.50</span>
              <span className="font-heading text-[13px] text-[var(--text-secondary)]">$0.25/mile &times; 2,650 miles</span>
              <p className="font-heading text-[12px] text-[var(--text-muted)] leading-[1.6] max-w-[400px] mt-[4px]">
                It&apos;s time to honor your pledge. Pay the foundations directly &mdash; Paul receives $0. Every cent goes to cancer research.
              </p>
            </div>
            <div className="w-full h-[1px] bg-[var(--border-subtle)]" />
            {/* Foundation Split */}
            <div className="flex flex-col gap-[16px] px-[32px] py-[24px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[3px] text-[var(--text-muted)]">YOUR 50/50 SPLIT</span>
              {/* Tower */}
              <div className="flex flex-col gap-[10px] bg-[var(--forest-green-light)] rounded-[4px] p-[16px]">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">Tower Cancer Research Foundation</span>
                  <span className="font-heading font-semibold text-[17px] text-[var(--forest-green)]">$331.25</span>
                </div>
                <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">Los Angeles, California &middot; 501(c)(3) &middot; Tax deductible in the US</span>
                <div className="flex justify-center items-center py-[10px] bg-[var(--forest-green)]">
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)]">HONOR MY PLEDGE &mdash; TOWER CANCER RESEARCH ($331.25)</span>
                </div>
              </div>
              {/* Cancer Council */}
              <div className="flex flex-col gap-[10px] bg-[var(--burnt-orange-light)] rounded-[4px] p-[16px]">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">Cancer Council NSW</span>
                  <span className="font-heading font-semibold text-[17px] text-[var(--burnt-orange)]">$331.25</span>
                </div>
                <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">Sydney, Australia &middot; DGR Registered &middot; Tax deductible in Australia</span>
                <div className="flex justify-center items-center py-[10px] bg-[var(--burnt-orange)]">
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)]">HONOR MY PLEDGE &mdash; CANCER COUNCIL NSW ($331.25)</span>
                </div>
              </div>
            </div>
            {/* Confirm */}
            <div className="flex flex-col items-center gap-[10px] px-[32px] py-[24px] bg-[var(--bg-warm)]">
              <span className="font-heading text-[12px] text-[var(--text-secondary)]">After you&apos;ve donated to both foundations:</span>
              <div className="flex items-center gap-[6px] bg-[var(--bg-white)] border border-[var(--border-subtle)] px-[24px] py-[10px]">
                <CheckCircle className="w-[14px] h-[14px] text-[var(--forest-green)]" />
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--forest-green)]">I&apos;VE HONORED MY PLEDGE</span>
              </div>
              <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">This updates your profile and adds you to the Wall of Honor</span>
            </div>
            {/* Installment */}
            <div className="flex flex-col items-center gap-[6px] px-[32px] py-[20px] bg-[var(--bg-white)] text-center">
              <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">Need more time? Honor over 3 months.</span>
              <p className="font-heading text-[11px] text-[var(--text-muted)] leading-[1.6] max-w-[380px]">
                We&apos;ll send you a reminder each month: $220.83 &times; 3 payments. No pressure. No guilt. Just a gentle nudge.
              </p>
              <span className="font-label font-semibold text-[11px] text-[var(--burnt-orange)]">Set up installment plan &rarr;</span>
            </div>
            <EmailFooter detail="Thank you for walking with Paul — from Mexico to Canada. Your pledge: $0.25/mile · Final total: $662.50" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="FOREST GREEN HERO">Different color from weekly/milestone emails signals this is special. Green = completion, achievement, nature&apos;s finish line.</DetailItem>
            <DetailItem label="FINISH LINE PHOTO">Real photo from Manning Park. Emotional anchor &mdash; the pledger sees the moment their journey with Paul ends.</DetailItem>
            <DetailItem label="FINAL TOTAL — HUGE">$662.50 at 52px. This is the number they&apos;ve watched grow for 6 months. Now it&apos;s real and it&apos;s time to act.</DetailItem>
            <DetailItem label="TWO FOUNDATION BUTTONS">Color-coded cards with pre-calculated amounts. Green for Tower Cancer Research (US), Orange for Cancer Council NSW (AU). Each has a full-width honor button linking directly to the foundation&apos;s donation page. No math, no confusion.</DetailItem>
            <DetailItem label="TAX DEDUCTION INFO">Each card shows the tax status: 501(c)(3) for US donors, DGR for Australian donors. Direct donations = cleanest tax receipts.</DetailItem>
            <DetailItem label="&ldquo;I&apos;VE HONORED&rdquo; BUTTON">Self-report confirmation. Updates their profile, adds them to the Wall of Honor, changes their map bubble from grey to green.</DetailItem>
            <DetailItem label="INSTALLMENT OPTION">For large totals ($500+), honor over 3 months. Monthly reminders with 1/3 amount. Empathetic, not pushy.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* EMAIL SCHEDULE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[40px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-dark)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>EMAIL SCHEDULE</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-white)]">
            The Full <span className="text-[var(--burnt-orange)]">Communication</span> Plan
          </h2>
          <p className="font-heading text-[16px] text-[#FFFFFFBB] max-w-[600px] leading-[1.6]">
            Every email a pledger receives from Day 1 to the finish and beyond. Empathy first, never spam.
          </p>
        </div>

        <div className="flex flex-col w-full overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-[#FFFFFF22]">
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[#FFFFFF66] text-left py-[12px] px-[16px]">WHEN</th>
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[#FFFFFF66] text-left py-[12px] px-[16px]">EMAIL</th>
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[#FFFFFF66] text-left py-[12px] px-[16px]">PURPOSE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { when: "Day 1", phase: "DURING", phaseColor: "bg-[var(--forest-green-light)] text-[var(--forest-green)]", email: "\"Paul just started!\"", purpose: "Excitement + pledge confirmation" },
                { when: "Every Monday", phase: "DURING", phaseColor: "bg-[var(--forest-green-light)] text-[var(--forest-green)]", email: "Weekly Update", purpose: "Running total + trail progress + journal excerpt" },
                { when: "500 / 1000 / 1325 mi", phase: "MILESTONE", phaseColor: "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]", email: "Milestone Celebration", purpose: "Celebrate achievement + growing pledge total" },
                { when: "State crossings", phase: "MILESTONE", phaseColor: "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]", email: "\"Paul entered Oregon!\"", purpose: "Geographic progress + local connection" },
                { when: "200 mi from Canada", phase: "DURING", phaseColor: "bg-[var(--forest-green-light)] text-[var(--forest-green)]", email: "\"Almost there\"", purpose: "Anticipation + approximate final total" },
                { when: "Paul finishes", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "\"Paul Made It!\"", purpose: "Final total + foundation links + honor buttons" },
                { when: "+3 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Gentle reminder", purpose: "\"Your pledge links are ready\"" },
                { when: "+7 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Social proof", purpose: "\"X% of pledgers have honored!\"" },
                { when: "+14 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Understanding", purpose: "\"No rush — here are your links\"" },
                { when: "+30 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Purpose", purpose: "\"The foundations are counting on us\"" },
                { when: "+45 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Installment offer", purpose: "\"Honor over 3 months\" — then we stop" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#FFFFFF11]">
                  <td className="font-label font-semibold text-[13px] text-[#FFFFFFCC] py-[14px] px-[16px] whitespace-nowrap">{row.when}</td>
                  <td className="py-[14px] px-[16px]">
                    <span className={`font-label font-bold text-[9px] tracking-[2px] ${row.phaseColor} px-[10px] py-[3px] rounded-[2px] mr-[8px]`}>{row.phase}</span>
                    <span className="font-heading font-semibold text-[14px] text-[var(--text-white)]">{row.email}</span>
                  </td>
                  <td className="font-heading text-[13px] text-[#FFFFFF99] py-[14px] px-[16px]">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Principle */}
        <div className="flex flex-col gap-[8px] p-[24px] bg-[#FFFFFF0A] border-l-[3px] border-[var(--burnt-orange)]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--burnt-orange)]">KEY PRINCIPLE</span>
          <p className="font-heading text-[15px] text-[#FFFFFFCC] leading-[1.6]">
            Every email includes the pledger&apos;s <strong className="text-[var(--text-white)]">personal running total</strong>. Watching it grow from $12 to $200 to $662 over 6 months creates ownership. It&apos;s not abstract &mdash; it&apos;s <em>their</em> number. After 45 days post-finish, we stop. No guilt. No harassment.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* WHY THIS WORKS */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>THE STRATEGY</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            What Makes People <span className="text-[var(--burnt-orange)]">Honor</span> Pledges
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {[
            { icon: Heart, title: "Emotional Investment", desc: "They followed your journey for 6 months. They felt the rain, the climbs, the sunsets through your journal. This isn't abstract — they walked WITH you." },
            { icon: Users, title: "Social Proof", desc: "They see others honoring. The Wall of Honor, the map bubbles turning green, the \"X% have honored\" emails. Nobody wants to be the one who doesn't." },
            { icon: ArrowRight, title: "Frictionless Process", desc: "Pre-calculated amounts, direct foundation links, one click per foundation. No math, no confusion, no middlemen. Just click and pay." },
            { icon: DollarSign, title: "Personal Running Total", desc: "They watched $12 become $200 become $662 over 6 months. That number is THEIRS. They own it. They built it mile by mile." },
            { icon: Shield, title: "Recognition", desc: "Wall of Honor, map badges turning green, \"PLEDGE HONORED\" profile status. Public recognition for doing the right thing." },
            { icon: Clock, title: "Flexibility", desc: "Installment option for large totals. 3-month split. No pressure, no guilt. After 45 days of gentle follow-up, we stop completely." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-[16px] p-[28px] bg-[var(--bg-warm)]">
              <item.icon className="w-[28px] h-[28px] text-[var(--burnt-orange)]" />
              <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">{item.title}</span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* THE EMOTIONAL ARC */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>THE EMOTIONAL ARC</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            A Story That <span className="text-[var(--burnt-orange)]">Builds</span> Over 6 Months
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            The pledge model has a natural story arc that traditional &ldquo;donate now&rdquo; doesn&apos;t. Every email, every mile update, every journal post reinforces it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px]">
          {[
            { month: "MARCH", phase: "BEGINNING", quote: "\"I believe in this. I'm in.\"", color: "var(--forest-green)" },
            { month: "MAY — AUGUST", phase: "MIDDLE", quote: "\"My total is growing. Paul is really doing this.\"", color: "var(--burnt-orange)" },
            { month: "SEPTEMBER", phase: "CLIMAX", quote: "\"He's almost there. My pledge is $662.\"", color: "var(--burnt-orange)" },
            { month: "OCTOBER", phase: "RESOLUTION", quote: "\"He made it. Time to honor my promise.\"", color: "var(--text-primary)" },
          ].map((arc) => (
            <div key={arc.phase} className="flex flex-col gap-[12px] p-[24px] bg-[var(--bg-white)]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">{arc.month}</span>
              <span className="font-heading font-semibold text-[18px]" style={{ color: arc.color }}>{arc.phase}</span>
              <p className="font-heading italic text-[14px] text-[var(--text-secondary)] leading-[1.5]">{arc.quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* WHY NOT PLEDGE.TO */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>WHY WE BUILT OUR OWN</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Why <span className="text-[var(--burnt-orange)]">Pledge.to</span> Doesn&apos;t Work
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            We evaluated Pledge.to (formerly Pledgeling) thoroughly. Here&apos;s why our custom system is the right approach.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-[var(--border-subtle)]">
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] text-left py-[12px] px-[16px]">REQUIREMENT</th>
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] text-left py-[12px] px-[16px]">PLEDGE.TO</th>
                <th className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] text-left py-[12px] px-[16px]">OUR SYSTEM</th>
              </tr>
            </thead>
            <tbody>
              {[
                { req: "Paul never touches foundation money", pledgeto: "No — Paul's card gets charged", ours: "Yes — pledgers pay foundations directly" },
                { req: "Zero fees to foundations", pledgeto: "No — 5% + processing fees", ours: "Yes — 100% reaches foundations" },
                { req: "Supports Australian charities", pledgeto: "No — US 501(c)(3) only", ours: "Yes — direct links to both foundations" },
                { req: "Tax deductions for donors", pledgeto: "Unclear / problematic", ours: "Clean — direct donations to registered charities" },
                { req: "Per-mile pledges", pledgeto: "No", ours: "Yes — already built" },
                { req: "Donor location for map", pledgeto: "No", ours: "Yes — via geolocation" },
                { req: "Pledge-then-pay-later model", pledgeto: "No — immediate payment", ours: "Yes — this is our core model" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)]">
                  <td className="font-heading font-semibold text-[13px] text-[var(--text-primary)] py-[14px] px-[16px]">{row.req}</td>
                  <td className="font-heading text-[13px] text-red-600 py-[14px] px-[16px]">{row.pledgeto}</td>
                  <td className="font-heading text-[13px] text-[var(--forest-green)] font-semibold py-[14px] px-[16px]">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-[8px] p-[24px] bg-[var(--bg-warm)] border-l-[3px] border-[var(--burnt-orange)]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--burnt-orange)]">BOTTOM LINE</span>
          <p className="font-heading text-[15px] text-[var(--text-primary)] leading-[1.6]">
            Pledge.to is designed for businesses that donate to charity on behalf of customers (&ldquo;we plant a tree for every purchase&rdquo;). It is not designed for individual supporters making personal commitments to donate later. Our custom system is simpler, cheaper, and better for everyone &mdash; especially the foundations.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SUMMARY FOR PAUL */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-dark)] w-full text-center">
        <SectionBadge>THE SHORT VERSION</SectionBadge>
        <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-white)] max-w-[700px]">
          Summary for <span className="text-[var(--burnt-orange)]">Paul</span>
        </h2>

        <div className="flex flex-col gap-[20px] max-w-[640px] text-left">
          {[
            "We don't need Pledge.to or any third party. Our system is simpler and better.",
            "Pledgers promise during the hike. They watch their total grow. They feel invested.",
            "When you reach Canada, we send everyone a personalized email with their total and direct links to donate to each foundation.",
            "They click, they pay the foundations directly, they get proper tax receipts.",
            "You touch $0 of foundation money. Ever.",
            "The only payments you receive are trail support gifts (meals, boots, hostel) through Stripe — completely separate and already working.",
          ].map((item, i) => (
            <div key={i} className="flex gap-[16px] items-start">
              <span className="font-label font-bold text-[18px] text-[var(--burnt-orange)] shrink-0 w-[28px]">{i + 1}.</span>
              <p className="font-heading text-[16px] text-[#FFFFFFCC] leading-[1.6]">{item}</p>
            </div>
          ))}
        </div>

        <div className="w-[60px] h-[2px] bg-[var(--burnt-orange)] mt-[16px]" />
        <p className="font-heading italic text-[16px] text-[#FFFFFF88] max-w-[500px]">
          No third-party platforms. No fees. No middlemen. Clean, transparent, and exactly what YesChapter promises.
        </p>
      </section>

      <Footer />
    </div>
  );
}
