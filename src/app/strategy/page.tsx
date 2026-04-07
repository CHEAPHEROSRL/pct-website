import { Mountain, Flag, Mail, ArrowRight, CheckCircle, MapPin, Share2, Calendar, Heart, Shield, DollarSign, Users, Globe, Clock, Bell, UserPlus, Award, Building2, FileText, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
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
          Seven email templates to keep pledgers connected from day one through honouring their pledges at the end of the hike. Welcome drip, weekly updates, milestones, community celebrations, and honour flow.
        </p>
        <span className="font-label font-semibold text-[11px] tracking-[2px] text-[#FFFFFF44] mt-[24px]">
          YOUR EMAIL STRATEGY &middot; MARCH 2026 &middot; V2
        </span>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 1: WEEKLY UPDATE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 1 OF 7</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Weekly <span className="text-[var(--burnt-orange)]">Update</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Sent every Monday during the hike. Keeps pledgers emotionally invested by showing your progress and their growing pledge total. This is the heartbeat of engagement.
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
              <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">$211.75 to City of Hope &middot; $211.75 to Leukaemia Foundation</span>
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
            <DetailItem label="FREQUENCY">Sent every Monday morning. Pledgers start their week seeing your progress.</DetailItem>
            <DetailItem label="PERSONAL RUNNING TOTAL">The big orange number ($423.50) is the most important element. Watching it grow from $12 to $200 to $662 over 6 months creates ownership. It&apos;s <em>their</em> number.</DetailItem>
            <DetailItem label="TRAIL PROGRESS BAR">Visual representation of how far you&apos;ve walked. Green-to-orange gradient matches the brand. Percentage gives concrete sense of completion.</DetailItem>
            <DetailItem label="JOURNAL EXCERPT">Emotional connection. A short quote from your trail journal humanizes the numbers. Links to full entry on yeschapter.com to drive site traffic.</DetailItem>
            <DetailItem label="50/50 SPLIT SHOWN">Every email reinforces where the money goes: half to City of Hope, half to the Leukaemia Foundation. Builds trust.</DetailItem>
            <DetailItem label="DYNAMIC CONTENT">Every field is personalized: pledge rate, total, miles, days, journal excerpt. No two pledgers see the same email.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 2: MILESTONE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 2 OF 7</SectionBadge>
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
              <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">$125.00 to City of Hope &middot; $125.00 to Leukaemia Foundation</span>
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
            <DetailItem label="&ldquo;YOUR PLEDGE IS NOW&rdquo;">Reframes the milestone around the pledger. It&apos;s not just your achievement &mdash; the pledger&apos;s commitment grew too. This creates shared ownership.</DetailItem>
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
          <SectionBadge>TEMPLATE 3 OF 7</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Paul Made It &mdash; <span className="text-[var(--burnt-orange)]">Honor</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            The most important email we&apos;ll ever send. Triggered at the end of the hike — whether you reach Manning Park or have to stop earlier. Converts pledges into real donations to the two cancer foundations.
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
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">City of Hope</span>
                  <span className="font-heading font-semibold text-[17px] text-[var(--forest-green)]">$331.25</span>
                </div>
                <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">Duarte, California &middot; NCI-Designated &middot; Tax deductible in the US</span>
                <div className="flex justify-center items-center py-[10px] bg-[var(--forest-green)]">
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)]">HONOR MY PLEDGE &mdash; CITY OF HOPE ($331.25)</span>
                </div>
              </div>
              {/* Leukaemia Foundation */}
              <div className="flex flex-col gap-[10px] bg-[var(--burnt-orange-light)] rounded-[4px] p-[16px]">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">Leukaemia Foundation</span>
                  <span className="font-heading font-semibold text-[17px] text-[var(--burnt-orange)]">$331.25</span>
                </div>
                <span className="font-label font-medium text-[10px] text-[var(--text-muted)]">Australia (National) &middot; ACNC Registered &middot; Tax deductible in Australia</span>
                <div className="flex justify-center items-center py-[10px] bg-[var(--burnt-orange)]">
                  <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-white)]">HONOR MY PLEDGE &mdash; LEUKAEMIA FOUNDATION ($331.25)</span>
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
            <DetailItem label="FINISH LINE PHOTO">Real photo from Manning Park. Emotional anchor &mdash; the pledger sees the moment their journey with you ends.</DetailItem>
            <DetailItem label="FINAL TOTAL — HUGE">$662.50 at 52px. This is the number they&apos;ve watched grow for 6 months. Now it&apos;s real and it&apos;s time to act.</DetailItem>
            <DetailItem label="TWO FOUNDATION BUTTONS">Color-coded cards with pre-calculated amounts. Green for City of Hope (US), Orange for Leukaemia Foundation (AU). Each has a full-width honor button linking directly to the foundation&apos;s donation page. No math, no confusion.</DetailItem>
            <DetailItem label="TAX DEDUCTION INFO">Each card shows the tax status: 501(c)(3) for US donors, DGR for Australian donors. Direct donations = cleanest tax receipts.</DetailItem>
            <DetailItem label="&ldquo;I&apos;VE HONORED&rdquo; BUTTON">Self-report confirmation. Updates their profile, adds them to the Wall of Honor, changes their map bubble from grey to green.</DetailItem>
            <DetailItem label="INSTALLMENT OPTION">For large totals ($500+), honor over 3 months. Monthly reminders with 1/3 amount. Empathetic, not pushy.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 4: WELCOME DAY 1 */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 4 OF 7 &mdash; V2</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Welcome <span className="text-[var(--burnt-orange)]">Day 1</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Sent 24 hours after pledge. Fills the silence gap between pledge confirmation and the first Monday update. Teaches them how to track progress.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            <div className="flex flex-col gap-[16px] px-[32px] py-[32px] bg-[var(--bg-white)]">
              <h3 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">Welcome aboard, Sarah!</h3>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                You pledged <strong className="text-[var(--burnt-orange)]">$0.25/mile</strong> &mdash; that&apos;s
                <strong>$662.50</strong> if Paul completes all 2,650 miles. Here&apos;s how to stay in the loop:
              </p>
              <div className="flex flex-col gap-[8px] p-[20px] bg-[var(--bg-warm)]">
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">Your pledge dashboard</span>
                <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  Bookmark <strong>yeschapter.com/my-pledge</strong> &mdash; enter your email anytime to see
                  your running total, pledge history, and how much has been earned for cancer research.
                </p>
              </div>
              <div className="flex flex-col gap-[8px] p-[20px] bg-[var(--forest-green-light)]">
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">Live trail map</span>
                <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  Watch Paul move in real time at <strong>yeschapter.com/trail-map</strong>.
                </p>
              </div>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                You&apos;re now one of <strong className="text-[var(--forest-green)]">247 people</strong> walking with Paul.
              </p>
              <div className="flex justify-center py-[8px]">
                <div className="flex items-center gap-[6px] bg-[var(--forest-green)] px-[28px] py-[12px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">VIEW MY PLEDGE DASHBOARD</span>
                </div>
              </div>
            </div>
            <EmailFooter detail="Sent 24 hours after pledge · You can change frequency in Email Preferences" />
          </div>

          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="TIMING">Sent ~24 hours after pledge (checked by cron every 6 hours). Fills the silence between confirmation and next Monday.</DetailItem>
            <DetailItem label="ONBOARDING">Teaches two habits: checking /my-pledge dashboard and watching the trail map. These are the main engagement loops.</DetailItem>
            <DetailItem label="COMMUNITY COUNT">Shows how many pledgers exist. Social proof from day one &mdash; they&apos;re part of something.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 5: WELCOME DAY 3 */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 5 OF 7 &mdash; V2</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Welcome <span className="text-[var(--burnt-orange)]">Day 3</span> &mdash; Bring a Friend
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Sent 72 hours after pledge. The pledger is settled in &mdash; now ask them to recruit. Links to the personalized /join referral page.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            <div className="flex flex-col gap-[16px] px-[32px] py-[32px] bg-[var(--bg-white)]">
              <h3 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">Know someone who&apos;d care?</h3>
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                Sarah, you&apos;re part of a community of <strong className="text-[var(--forest-green)]">247 pledgers</strong> walking with Paul. Every new person who joins makes the impact bigger.
              </p>
              <div className="flex flex-col items-center gap-[12px] p-[24px] bg-[var(--burnt-orange-light)]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">SHARE YOUR PLEDGE</span>
                <p className="font-heading text-[13px] text-[var(--text-secondary)] text-center">Share this link with a friend, colleague, or on social media:</p>
                <div className="flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[28px] py-[12px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">SHARE WITH A FRIEND &rarr;</span>
                </div>
              </div>
              <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                Already want to do more? You can <strong className="text-[var(--burnt-orange)]">increase your pledge</strong> anytime from your dashboard.
              </p>
            </div>
            <EmailFooter detail="Sent 72 hours after pledge · You can change frequency in Email Preferences" />
          </div>

          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="TIMING">72 hours &mdash; pledger has had time to settle but the excitement is still fresh.</DetailItem>
            <DetailItem label="REFERRAL PAGE">Share link goes to /join?ref=Name &mdash; personalized landing page that says &ldquo;Sarah is walking with Paul. Join them.&rdquo;</DetailItem>
            <DetailItem label="INCREASE NUDGE">Subtle mention of increasing pledge. Plant the seed early, don&apos;t push hard.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 6: HONOR CONFIRMATION */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 6 OF 7 &mdash; V2</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Honor <span className="text-[var(--burnt-orange)]">Confirmation</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Sent immediately after a pledger clicks &ldquo;I&apos;ve honored my pledge&rdquo; on /honor. Closes the gratitude loop and encourages sharing.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            <div className="flex flex-col items-center gap-[10px] px-[32px] py-[36px] bg-[var(--forest-green)] text-center">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[#FFFFFF88]">PLEDGE HONORED</span>
              <h3 className="font-heading font-semibold text-[28px] text-[var(--text-white)]">Thank you, Sarah.</h3>
              <p className="font-heading text-[16px] text-[#FFFFFFCC]">You honored your $662.50 pledge.</p>
            </div>
            <div className="flex flex-col gap-[16px] px-[32px] py-[28px] bg-[var(--bg-white)]">
              <div className="flex flex-col gap-[6px] p-[20px] bg-[var(--bg-warm)]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">YOUR DONATION SUMMARY</span>
                <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.8]">
                  $331.25 &rarr; City of Hope<br/>
                  $331.25 &rarr; Leukaemia Foundation<br/>
                  <strong>$662.50 total to cancer research</strong>
                </p>
              </div>
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                You&apos;re one of <strong className="text-[var(--forest-green)]">89</strong> pledgers who&apos;ve honored so far &mdash; that&apos;s <strong className="text-[var(--forest-green)]">72%</strong> of all 124 pledgers.
              </p>
              <p className="font-heading text-[14px] text-[var(--text-muted)] leading-[1.6]">
                Paul never touches a cent. Every dollar goes directly to the foundations.
              </p>
              <div className="flex flex-col items-center gap-[8px] pt-[8px]">
                <div className="flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[28px] py-[12px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">TELL A FRIEND WHAT YOU DID &rarr;</span>
                </div>
                <span className="font-heading text-[12px] text-[var(--text-muted)]">Inspire someone else to join the walk.</span>
              </div>
            </div>
            <EmailFooter detail="Sent after you marked your pledge as honored on yeschapter.com/honor" />
          </div>

          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="GRATITUDE">Green hero says &ldquo;PLEDGE HONORED&rdquo; &mdash; recognition and warmth. The pledger did something meaningful and the email reflects that.</DetailItem>
            <DetailItem label="DONATION SUMMARY">Shows the 50/50 split. Receipts come from the foundations, but this email reinforces where the money went.</DetailItem>
            <DetailItem label="COMMUNITY PROGRESS">Shows honor rate (72%). Social proof that others are honoring too. Creates momentum.</DetailItem>
            <DetailItem label="SHARE CTA">&ldquo;Tell a friend what you did&rdquo; &mdash; honored pledgers are the best ambassadors. Link goes to /join referral page.</DetailItem>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TEMPLATE 7: COMMUNITY MILESTONE */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>TEMPLATE 7 OF 7 &mdash; V2</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Community <span className="text-[var(--burnt-orange)]">Milestone</span> Email
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[600px] leading-[1.6]">
            Triggered when the community hits a threshold: 25/50/100/200/500 pledgers or $5K/$10K/$25K/$50K total pledged. Creates social proof and FOMO.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          <div className="w-full lg:w-[480px] shrink-0 rounded-[4px] overflow-hidden shadow-lg">
            <EmailHeader />
            <div className="flex flex-col items-center gap-[10px] px-[32px] py-[36px] bg-[var(--burnt-orange)] text-center">
              <span className="font-label font-bold text-[11px] tracking-[3px] text-[#FFFFFF88]">COMMUNITY MILESTONE</span>
              <h3 className="font-heading font-semibold text-[26px] text-[var(--text-white)]">100 People Walking With Paul</h3>
            </div>
            <div className="flex flex-col gap-[16px] px-[32px] py-[28px] bg-[var(--bg-white)]">
              <p className="font-heading text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                Sarah, the YesChapter community just reached <strong>100 pledgers</strong>. That&apos;s 100 people who believe every mile matters.
              </p>
              <div className="flex justify-around p-[20px] bg-[var(--bg-warm)]">
                <div className="flex flex-col items-center">
                  <span className="font-heading font-semibold text-[22px] text-[var(--forest-green)]">100</span>
                  <span className="font-label font-semibold text-[9px] tracking-[2px] text-[var(--text-muted)]">PLEDGERS</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-heading font-semibold text-[22px] text-[var(--burnt-orange)]">$12,450</span>
                  <span className="font-label font-semibold text-[9px] tracking-[2px] text-[var(--text-muted)]">TOTAL PLEDGED</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-[12px] pt-[8px]">
                <div className="flex items-center gap-[6px] bg-[var(--forest-green)] px-[28px] py-[12px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">INCREASE MY PLEDGE</span>
                </div>
                <div className="flex items-center gap-[6px] bg-[var(--burnt-orange)] px-[28px] py-[12px]">
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">SHARE WITH A FRIEND &rarr;</span>
                </div>
              </div>
            </div>
            <EmailFooter detail="Community milestone · Only sent to pledgers with 'All Updates' preference" />
          </div>

          <div className="flex flex-col gap-[20px] flex-1">
            <h3 className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Key Design Decisions</h3>
            <DetailItem label="TRIGGER THRESHOLDS">
              <strong>Pledger count:</strong> 25, 50, 100, 200, 500, 1000<br />
              <strong>Total pledged:</strong> $5K, $10K, $25K, $50K, $100K<br />
              Triggered in real-time when a new pledge crosses the threshold.
            </DetailItem>
            <DetailItem label="ORANGE HERO">Celebration color &mdash; different from weekly (dark) and milestone (orange hero but about Paul). This is about the <em>community</em>.</DetailItem>
            <DetailItem label="DUAL CTA">Both &ldquo;Increase My Pledge&rdquo; and &ldquo;Share With a Friend&rdquo;. Community milestones are natural share moments.</DetailItem>
            <DetailItem label="DEDUPLICATION">Tracked in Redis set emails:community:sent. Each threshold fires once, ever. No repeat sends.</DetailItem>
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
                { when: "Immediately", phase: "WELCOME", phaseColor: "bg-[#E8F0EB] text-[var(--forest-green)]", email: "Pledge Confirmation", purpose: "Thank you + pledge math + share CTA" },
                { when: "+24 hours", phase: "WELCOME", phaseColor: "bg-[#E8F0EB] text-[var(--forest-green)]", email: "Welcome Day 1", purpose: "How to track: /my-pledge + /trail-map" },
                { when: "+72 hours", phase: "WELCOME", phaseColor: "bg-[#E8F0EB] text-[var(--forest-green)]", email: "Welcome Day 3", purpose: "\"Bring a friend\" — referral link to /join" },
                { when: "Every Monday", phase: "DURING", phaseColor: "bg-[var(--forest-green-light)] text-[var(--forest-green)]", email: "Weekly Update", purpose: "Running total + trail progress + journal excerpt" },
                { when: "Threshold crossed", phase: "COMMUNITY", phaseColor: "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]", email: "Community Milestone", purpose: "\"We hit 100 pledgers!\" — social proof + FOMO" },
                { when: "Near milestone", phase: "DURING", phaseColor: "bg-[var(--forest-green-light)] text-[var(--forest-green)]", email: "Pre-Milestone Nudge", purpose: "\"500 miles is coming!\" + increase CTA" },
                { when: "500 / 1000 / 1325 mi", phase: "MILESTONE", phaseColor: "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]", email: "Milestone Celebration", purpose: "Celebrate achievement + growing pledge total" },
                { when: "State crossings", phase: "MILESTONE", phaseColor: "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]", email: "\"Paul entered Oregon!\"", purpose: "Geographic progress + local connection" },
                { when: "200 mi from Canada", phase: "FINISH", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Near-Finish (3 emails)", purpose: "200mi → 100mi → Finish sequence" },
                { when: "Paul finishes", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "\"Paul Made It!\"", purpose: "Final total + foundation links + honor CTA" },
                { when: "+5 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Honor Reminder", purpose: "Gentle nudge to un-honored pledgers" },
                { when: "+14 days", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Final Reminder", purpose: "Last nudge — then we stop" },
                { when: "After honor", phase: "HONOR", phaseColor: "bg-[#333333] text-[#FFFFFFCC]", email: "Honor Confirmation", purpose: "Thank you + donation summary + share CTA" },
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
            Every email includes the pledger&apos;s <strong className="text-[var(--text-white)]">personal running total</strong>. Watching it grow from $12 to $200 to $662 over 6 months creates ownership. It&apos;s not abstract &mdash; it&apos;s <em>their</em> number. Every email includes an <strong className="text-[var(--text-white)]">unsubscribe link</strong> with 3 frequency tiers: All Updates, Milestones Only, or Finish Only. Honor reminders always send regardless. After 14 days post-finish, we stop. No guilt. No harassment.
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
            We evaluated Pledge.to (formerly Pledgeling) thoroughly. Here&apos;s why your custom system is the right approach.
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
                { req: "You never touch foundation money", pledgeto: "No — your card gets charged", ours: "Yes — pledgers pay foundations directly" },
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
      {/* Compound Effect on Pledges */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[16px] max-w-[700px]">
          <SectionBadge>THE COMPOUND EFFECT ON PLEDGES</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] md:text-[38px] tracking-[-0.5px] text-[var(--text-primary)]">
            Why Magic Links Generate More Pledges
          </h2>
          <p className="font-heading text-[17px] leading-[1.7] text-[var(--text-secondary)]">
            Most fundraising platforms treat authentication as a security checkbox. We treat it as a growth mechanic. The magic link system isn&apos;t just about convenience — it&apos;s a psychological and social engine that multiplies pledge volume through four compounding forces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
          {/* Force 1 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[32px]">
            <div className="flex items-center gap-[12px]">
              <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange)] shrink-0">
                <UserPlus className="w-[20px] h-[20px] text-white" />
              </div>
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">ZERO-FRICTION PLEDGE</span>
            </div>
            <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">The pledge takes 30 seconds — and so does re-entry</h3>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              Passwords kill conversion. Every &quot;forgot password&quot; click is a potential pledger lost. With magic links, there&apos;s no account to create and no password to remember. Email is identity. The link is the key. Someone pledging on a phone while watching a reel doesn&apos;t stop to invent a new password — they just pledge.
            </p>
            <div className="flex items-center gap-[8px] bg-[var(--bg-white)] p-[12px] border-l-[3px] border-[var(--burnt-orange)]">
              <span className="font-heading italic text-[13px] text-[var(--text-secondary)]">&ldquo;The commitment happens at the moment of inspiration — not three screens later.&rdquo;</span>
            </div>
          </div>

          {/* Force 2 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[32px]">
            <div className="flex items-center gap-[12px]">
              <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--forest-green)] shrink-0">
                <Bell className="w-[20px] h-[20px] text-white" />
              </div>
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--forest-green)]">PASSIVE RE-AUTHENTICATION</span>
            </div>
            <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Weekly emails silently keep pledgers logged in</h3>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              Every milestone update email we send contains a magic link — not as a sign-in prompt, but as the natural &quot;View My Pledge&quot; button. Clicking it re-establishes the session invisibly. Pledgers feel they&apos;re just checking their dashboard; in reality they&apos;re re-engaging with the cause every week. Their pledge total grows as Paul hikes. The emotional investment deepens.
            </p>
            <div className="flex items-center gap-[8px] bg-[var(--bg-white)] p-[12px] border-l-[3px] border-[var(--forest-green)]">
              <span className="font-heading italic text-[13px] text-[var(--text-secondary)]">&ldquo;Engagement without effort — for the pledger and for us.&rdquo;</span>
            </div>
          </div>

          {/* Force 3 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[32px]">
            <div className="flex items-center gap-[12px]">
              <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange)] shrink-0">
                <Share2 className="w-[20px] h-[20px] text-white" />
              </div>
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--burnt-orange)]">REFERRAL MECHANICS</span>
            </div>
            <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Authenticated pledgers share with personal referral codes</h3>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              Once authenticated, every pledger has a personal share badge with their name, rate, and a referral link. When their friend pledges through that link, both see it reflected in their dashboard. This creates a social layer — pledgers don&apos;t just watch Paul&apos;s progress, they watch their own social impact grow. A pledger who has referred three friends is invested in a fundamentally different way than one who hasn&apos;t.
            </p>
            <div className="flex items-center gap-[8px] bg-[var(--bg-white)] p-[12px] border-l-[3px] border-[var(--burnt-orange)]">
              <span className="font-heading italic text-[13px] text-[var(--text-secondary)]">&ldquo;Identity and ownership — not just participation.&rdquo;</span>
            </div>
          </div>

          {/* Force 4 */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-[32px]">
            <div className="flex items-center gap-[12px]">
              <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--forest-green)] shrink-0">
                <Award className="w-[20px] h-[20px] text-white" />
              </div>
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--forest-green)]">COMMITMENT ESCALATION</span>
            </div>
            <h3 className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Logged-in pledgers are more likely to increase their pledge</h3>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              Seeing your running total update in real time — &ldquo;you&apos;ve committed $47.25 so far&rdquo; — creates a psychological anchor. Challenge boost prompts (e.g. &ldquo;Paul is attempting the hardest 100-mile stretch — will you commit an extra $0.05/mile?&rdquo;) are surfaced only to authenticated pledgers. The dashboard becomes a low-stakes game: pledgers return to see their number go up. Each return visit is another opportunity to boost.
            </p>
            <div className="flex items-center gap-[8px] bg-[var(--bg-white)] p-[12px] border-l-[3px] border-[var(--forest-green)]">
              <span className="font-heading italic text-[13px] text-[var(--text-secondary)]">&ldquo;Watching your impact grow in real time is addictive in the best way.&rdquo;</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-[16px] bg-[var(--bg-dark)] p-[40px] max-w-[800px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">THE NET RESULT</span>
          <p className="font-heading text-[18px] leading-[1.7] text-[#FFFFFFCC]">
            Each of these four forces compounds on the others. A zero-friction pledge creates a pledger. Weekly re-auth keeps them engaged. The social wall motivates them to share. The dashboard motivates them to boost. The result is a pledge base that grows in both <strong className="text-white">number</strong> and <strong className="text-white">value</strong> throughout the hike — without any manual outreach.
          </p>
          <div className="flex flex-wrap gap-[12px] mt-[8px]">
            {["No passwords", "30-second pledge", "Weekly passive re-auth", "Social referral layer", "Challenge boosts", "Real-time totals"].map((tag) => (
              <span key={tag} className="px-[12px] py-[6px] bg-[#FFFFFF11] font-label font-semibold text-[11px] tracking-[1px] text-[#FFFFFFAA]">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-dark)] w-full text-center">
        <SectionBadge>THE SHORT VERSION</SectionBadge>
        <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-white)] max-w-[700px]">
          Here&apos;s the <span className="text-[var(--burnt-orange)]">Deal</span>
        </h2>

        <div className="flex flex-col gap-[20px] max-w-[640px] text-left">
          {[
            "We don't need Pledge.to or any third party. Our system is simpler and better.",
            "Pledgers promise during the hike. They watch their total grow. They feel invested.",
            "At the end of the hike (regardless of how far you got), we send everyone a personalised email with their total and direct links to donate to each foundation.",
            "They click, they pay the foundations directly, they get proper tax receipts.",
            "You touch $0 of foundation money. Ever.",
            "The only payments you receive are trail support gifts (meals, boots, hostel) through Stripe — completely separate and already working on the site.",
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

      {/* ═══════════════════════════════════════ */}
      {/* BUSINESS SPONSORSHIP — HOW IT WORKS */}
      {/* ═══════════════════════════════════════ */}
      <section className="flex flex-col gap-[48px] px-6 md:px-12 lg:px-[120px] py-[64px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col gap-[8px]">
          <SectionBadge>BUSINESS SPONSORSHIP</SectionBadge>
          <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
            Trail Section <span className="text-[var(--burnt-orange)]">Sponsorship</span> — How It Works
          </h2>
          <p className="font-heading text-[16px] text-[var(--text-secondary)] max-w-[700px] leading-[1.6]">
            Companies can pledge $5,000+ to sponsor a named section of the Pacific Crest Trail on the website. This is a premium tier that gives businesses visible acknowledgment while supporting cancer research foundations. Here&apos;s how every piece fits together.
          </p>
        </div>

        {/* Step-by-step flow */}
        <div className="flex flex-col gap-[24px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">THE SPONSORSHIP FLOW</span>

          {/* Step 1 */}
          <div className="flex gap-[20px] items-start">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] shrink-0">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)]">1</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[17px] text-[var(--text-primary)]">Visitor slides the pledge calculator past $5,000</span>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                On the <Link href="/pledge" className="text-[var(--burnt-orange)] underline underline-offset-4 hover:opacity-80">Pledge Page</Link>, anyone can use the per-mile slider. When the total pledge crosses $5,000 (~$1.89/mi × 2,650 miles), the &quot;SET MY PLEDGE&quot; button is replaced with a &quot;GET IN TOUCH&quot; card that asks: &quot;Are you a business? Sponsors at this level can have their logo displayed on a section of the Pacific Crest Trail map.&quot;
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-[20px] items-start">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] shrink-0">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)]">2</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[17px] text-[var(--text-primary)]">They email Paul directly</span>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                The &quot;GET IN TOUCH&quot; button opens a pre-filled email to <strong>paul@yeschapter.com</strong> with subject &quot;Trail Section Sponsorship Inquiry.&quot; This starts a personal conversation — not an automated flow. Paul can vet the company, discuss which trail section they want, and answer questions about the cause.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-[20px] items-start">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] shrink-0">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)]">3</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[17px] text-[var(--text-primary)]">Paul sends the Sponsorship Agreement</span>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                Once aligned, Paul sends the <Link href="/sponsor-agreement" className="text-[var(--burnt-orange)] underline underline-offset-4 hover:opacity-80">Trail Section Sponsorship Agreement</Link> — a formal document covering sponsorship amount, trail section, logo placement terms, tax disclaimers, and legal protections for both parties. <strong>Both parties sign it.</strong>
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-[20px] items-start">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] shrink-0">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)]">4</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[17px] text-[var(--text-primary)]">The company pays the foundations directly</span>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                <strong>Paul never touches the money.</strong> The sponsor pays their commitment (split 50/50) directly into City of Hope&apos;s and the Leukaemia Foundation&apos;s bank accounts. The foundations issue official donation receipts. Paul provides the payment details but is never a middleman.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-[20px] items-start">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)] shrink-0">
              <span className="font-label font-bold text-[16px] text-[var(--burnt-orange)]">5</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-heading font-semibold text-[17px] text-[var(--text-primary)]">Logo goes up on the trail map</span>
              <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                Once payment is confirmed, Paul adds the sponsor&apos;s logo to their chosen trail section on the <Link href="/trail-map" className="text-[var(--burnt-orange)] underline underline-offset-4 hover:opacity-80">Trail Map</Link>. The logo stays for at least 12 months. Social media acknowledgment follows. Value-neutral language only — no promotional claims (this keeps it IRS-compliant as a &quot;qualified sponsorship&quot;).
              </p>
            </div>
          </div>
        </div>

        {/* Available Sections */}
        <div className="flex flex-col gap-[16px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">AVAILABLE TRAIL SECTIONS (5 TOTAL)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
            {[
              { name: "Southern California", miles: "Mi 0–700", desc: "Campo to Kennedy Meadows — desert, mountains, heat" },
              { name: "Sierra Nevada", miles: "Mi 700–1,100", desc: "Kennedy Meadows to Tuolumne — high passes, snow" },
              { name: "Northern California", miles: "Mi 1,100–1,691", desc: "Tuolumne to Ashland — volcanic, remote" },
              { name: "Oregon", miles: "Mi 1,691–2,147", desc: "Ashland to Cascade Locks — forests, Crater Lake" },
              { name: "Washington", miles: "Mi 2,147–2,650", desc: "Cascade Locks to Manning Park — final push, glaciers" },
            ].map((section) => (
              <div key={section.name} className="flex flex-col gap-[6px] p-[20px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)]">{section.name}</span>
                <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">{section.miles}</span>
                <span className="font-heading text-[13px] text-[var(--text-muted)] leading-[1.5]">{section.desc}</span>
              </div>
            ))}
          </div>
          <p className="font-heading text-[14px] text-[var(--text-muted)] italic">
            Each section can have one primary sponsor. Sections are first-come, first-served.
          </p>
        </div>

        {/* Tax & Legal Explainer */}
        <div className="flex flex-col gap-[16px] bg-[var(--bg-dark)] p-[32px] md:p-[40px]">
          <div className="flex items-center gap-[10px]">
            <Shield className="w-[20px] h-[20px] text-[var(--burnt-orange)]" />
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-white)]">TAX & LEGAL — WHY THIS MATTERS</span>
          </div>
          <p className="font-heading text-[15px] leading-[1.8] text-[#FFFFFFCC]">
            Paul, this section is important. When a business sponsors a trail section, there are real tax and legal implications. Here&apos;s what you need to know:
          </p>
          <div className="flex flex-col gap-[16px]">
            {[
              {
                title: "You are NOT a charity",
                body: "YesChapter is not a 501(c)(3). You cannot issue tax receipts. The foundations do that. You are a facilitator — you connect sponsors to the cause, display their logo, and never touch their money.",
              },
              {
                title: "Three ways sponsors can deduct",
                body: "Their payment to City of Hope (a 501(c)(3)) may be deductible as a charitable contribution. OR they can treat it as a business/advertising expense (often better — no income cap). OR as a qualified sponsorship payment under IRS Section 513(i). Their tax advisor decides — you never promise any specific tax treatment.",
              },
              {
                title: "Keep logo acknowledgment clean",
                body: "Display: logo, company name, website link, neutral description. Never use promotional language like 'the best,' 'leading,' or 'buy from.' This keeps it as a 'qualified sponsorship' rather than taxable advertising, which protects both the foundations and the sponsors.",
              },
              {
                title: "The agreement protects you both",
                body: "The Sponsorship Agreement makes clear: you don't handle money, you can't guarantee tax outcomes, the logo stays up regardless of hike completion, and you can decline sponsors whose values conflict with the cause (tobacco, etc.).",
              },
              {
                title: "Contact the foundations",
                body: "Before your first sponsor, reach out to City of Hope and Leukaemia Foundation to establish a formal peer-to-peer fundraising relationship. This gives legal cover for charitable solicitation and gives sponsors confidence. Most major nonprofits already have programs for this.",
              },
              {
                title: "Consider a one-time legal review",
                body: "Having a nonprofit attorney review the sponsorship agreement template once ($500–$1,500) provides significant protection — especially around state charitable solicitation requirements. 39 states require registration for charitable solicitation. The foundations' existing registrations may cover you if you operate under their umbrella.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-[16px] items-start">
                <CheckCircle className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0 mt-[2px]" />
                <div className="flex flex-col gap-[4px]">
                  <span className="font-heading font-semibold text-[15px] text-[var(--text-white)]">{item.title}</span>
                  <p className="font-heading text-[14px] leading-[1.7] text-[#FFFFFFAA]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link to Agreement */}
        <div className="flex flex-col gap-[16px] p-[32px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]">
          <div className="flex items-center gap-[12px]">
            <FileText className="w-[24px] h-[24px] text-[var(--burnt-orange)]" />
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Sponsorship Agreement Document</span>
          </div>
          <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            A complete, ready-to-use agreement template covering all 12 sections: parties, purpose, sponsorship details, benefits, tax considerations, representations, hike contingencies, no-endorsement clause, right to decline, liability limits, term, and governing law. Fill in the blanks and send to potential sponsors.
          </p>
          <Link
            href="/sponsor-agreement"
            className="flex items-center gap-[10px] w-fit bg-[var(--burnt-orange)] px-[24px] py-[14px] hover:opacity-90 transition-opacity"
          >
            <FileText className="w-[18px] h-[18px] text-[var(--text-primary)]" />
            <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-primary)]">VIEW AGREEMENT</span>
            <ExternalLink className="w-[14px] h-[14px] text-[var(--text-primary)]" />
          </Link>
          <div className="flex items-start gap-[10px]">
            <AlertTriangle className="w-[16px] h-[16px] text-[var(--burnt-orange)] shrink-0 mt-[2px]" />
            <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-muted)]">
              This is a template based on research, not legal advice. Have an attorney review it before first use. Tax treatment depends on each sponsor&apos;s circumstances.
            </p>
          </div>
        </div>

        {/* Quick Reference Links */}
        <div className="flex flex-col gap-[12px]">
          <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">RELATED PAGES ON THE WEBSITE</span>
          <div className="flex flex-wrap gap-[12px]">
            {[
              { label: "Pledge Page", href: "/pledge", desc: "Where the $5K cap triggers" },
              { label: "Trail Map", href: "/trail-map", desc: "Where sponsor logos appear" },
              { label: "Transparency", href: "/transparency", desc: "How pledges & money work" },
              { label: "Foundations", href: "/foundations", desc: "City of Hope & Leukaemia Foundation" },
              { label: "Sponsor Agreement", href: "/sponsor-agreement", desc: "The legal document" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-[4px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors min-w-[180px]"
              >
                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">{link.label}</span>
                <span className="font-heading text-[12px] text-[var(--text-muted)]">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
