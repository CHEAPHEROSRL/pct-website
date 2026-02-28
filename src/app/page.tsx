import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Heart,
  Calendar,
  Tent,
  Smartphone,
  MapPin,
  Shield,
  Sun,
  ChevronDown,
  ArrowRight,
  Share2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full h-[480px] md:h-[600px] lg:h-[720px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1732396768887-33cfea69bbf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNTk4ODl8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Pacific Crest Trail"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #1C1F1ACC 0%, #1C1F1A99 50%, #1C1F1AEE 100%)",
          }}
        />
        <div className="relative flex flex-col justify-end gap-[16px] md:gap-[24px] h-full px-6 md:px-12 lg:px-[120px] pb-[40px] md:pb-[60px] lg:pb-[80px]">
          <div className="flex items-center bg-[var(--burnt-orange)] px-[16px] py-[6px] w-fit">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-white)]">
              PACIFIC CREST TRAIL &nbsp;&middot;&nbsp; 2,650 MILES &nbsp;&middot;&nbsp; MARCH 2026
            </span>
          </div>
          <h1 className="font-heading font-semibold text-[28px] md:text-[40px] lg:text-[56px] leading-[1.1] tracking-[-1px] text-[var(--text-white)] w-full lg:w-[800px]">
            One man. One trail.{"\n"}One cause worth walking for.
          </h1>
          <p className="font-heading text-[16px] md:text-[18px] lg:text-[20px] leading-[1.6] text-[#FFFFFFCC] w-full lg:w-[700px]">
            Paul Barry is walking the entire Pacific Crest Trail to raise awareness{"\n"}and funds for cancer survivors, patients, and prevention.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-[16px]">
            <Link
              href="/donate"
              className="flex items-center justify-center gap-[10px] bg-[var(--burnt-orange)] px-[28px] lg:px-[40px] py-[14px] lg:py-[18px] hover:opacity-90 transition-opacity"
            >
              <span className="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[var(--text-white)]">
                SUPPORT THE CAUSE
              </span>
              <Heart className="w-[16px] h-[16px] text-[var(--text-white)]" />
            </Link>
            <Link
              href="/trail-map"
              className="flex items-center justify-center gap-[10px] border border-[#FFFFFF66] px-[28px] lg:px-[40px] py-[14px] lg:py-[18px] hover:bg-white/10 transition-colors"
            >
              <span className="font-label font-bold text-[13px] lg:text-[14px] tracking-[2px] text-[var(--text-white)]">
                FOLLOW THE JOURNEY
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-12 lg:px-[80px] py-[20px] md:py-[28px] bg-[var(--bg-dark)] w-full">
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-heading font-semibold text-[24px] md:text-[30px] lg:text-[36px] tracking-[-1px] text-[var(--burnt-orange)]">2,650</span>
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[3px] text-[var(--text-muted)]">MILES TO WALK</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-heading font-semibold text-[24px] md:text-[30px] lg:text-[36px] tracking-[-1px] text-[var(--burnt-orange)]">6-7</span>
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[3px] text-[var(--text-muted)]">MONTHS ON TRAIL</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-heading font-semibold text-[24px] md:text-[30px] lg:text-[36px] tracking-[-1px] text-[var(--burnt-orange)]">3</span>
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[3px] text-[var(--text-muted)]">STATES TRAVERSED</span>
        </div>
        <div className="flex flex-col items-center gap-[4px]">
          <span className="font-heading font-semibold text-[24px] md:text-[30px] lg:text-[36px] tracking-[-1px] text-[var(--forest-green)]">$50K</span>
          <span className="font-label font-bold text-[9px] md:text-[10px] tracking-[3px] text-[var(--text-muted)]">FUNDRAISING GOAL</span>
        </div>
      </section>

      {/* About The Journey */}
      <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col items-center gap-[16px] w-full">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">THE JOURNEY</span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            2,650 Miles From Mexico to Canada
          </h2>
          <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center w-full lg:w-[720px]">
            The Pacific Crest Trail stretches from the Mexican border at Campo, California to Manning Park at the Canadian border in Washington. Paul will traverse deserts, mountain passes, and ancient forests — documenting every step of his journey.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-[24px] w-full">
          <div className="flex flex-col gap-[20px] flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
            <Calendar className="w-[32px] h-[32px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Starting March 2026</span>
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Beginning at the Southern Terminus near Campo, CA. Walking northbound through California, Oregon, and Washington.
            </p>
          </div>
          <div className="flex flex-col gap-[20px] flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
            <Tent className="w-[32px] h-[32px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Living Simply</span>
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Sleeping in a tent, carrying everything on his back. No luxury — just the trail, the sky, and the mission that drives him forward every day.
            </p>
          </div>
          <div className="flex flex-col gap-[20px] flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[24px] md:p-[32px]">
            <Smartphone className="w-[32px] h-[32px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Daily Documentation</span>
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Every day, Paul will share photos, videos, and reflections from the trail. Follow his progress and experience the PCT through his eyes.
            </p>
          </div>
        </div>
      </section>

      {/* Trail Progress */}
      <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col items-center gap-[16px] w-full">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL PROGRESS</span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            Follow Paul on the Trail
          </h2>
          <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center">
            Track the journey in real-time as Paul walks from Mexico to Canada.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[32px] w-full">
          {/* Map Container */}
          <div className="relative w-full lg:w-[720px] h-[300px] md:h-[400px] lg:h-[560px] bg-[#E8E5E0] border border-[var(--border-subtle)] overflow-hidden shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1732396768887-33cfea69bbf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80"
              alt="Trail Map"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-[#F4F1EC44]" />
            <div className="absolute left-[340px] top-[440px] flex flex-col items-center gap-[4px]">
              <MapPin className="w-[32px] h-[32px] text-[var(--burnt-orange)]" />
              <div className="bg-[var(--burnt-orange)] px-[10px] py-[4px]">
                <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-white)]">DAY 1 &middot; CAMPO, CA</span>
              </div>
            </div>
          </div>

          {/* Map Sidebar */}
          <div className="flex flex-col gap-[24px] flex-1">
            {/* Current Location */}
            <div className="flex flex-col gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">CURRENT LOCATION</span>
              <span className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">Campo, CA</span>
              <span className="font-heading text-[15px] text-[var(--text-secondary)]">Mile 0 of 2,650</span>
              <div className="relative w-full h-[8px] bg-[#E8E5E0]">
                <div className="absolute top-0 left-0 h-[8px] bg-[var(--forest-green)] w-[10px]" />
              </div>
              <span className="font-label font-medium text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
                0% Complete — Journey begins March 28, 2026
              </span>
            </div>

            {/* Key Milestones */}
            <div className="flex flex-col gap-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">KEY MILESTONES</span>
              <div className="flex items-center gap-[12px]">
                <div className="w-[10px] h-[10px] bg-[var(--forest-green)] shrink-0" />
                <span className="font-heading text-[14px] text-[var(--text-primary)]">Campo, CA — Mile 0</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[10px] h-[10px] bg-[#D9D7D4] shrink-0" />
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">Kennedy Meadows — Mile 702</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[10px] h-[10px] bg-[#D9D7D4] shrink-0" />
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">Ashland, OR — Mile 1,719</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[10px] h-[10px] bg-[#D9D7D4] shrink-0" />
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">Manning Park, BC — Mile 2,650</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cause */}
      <section className="flex flex-col lg:flex-row w-full bg-[var(--bg-dark)]">
        <div className="relative w-full lg:w-[580px] h-[300px] md:h-[400px] lg:h-[700px] shrink-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1767189522336-1a68f4dbea6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNTk5OTR8&ixlib=rb-4.1.0&q=80&w=1080"
            alt="The Cause"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-[24px] lg:gap-[32px] flex-1 p-6 md:p-12 lg:p-[80px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">WHY I WALK</span>
          <h2 className="font-heading font-semibold text-[26px] md:text-[32px] lg:text-[38px] leading-[1.2] tracking-[-0.5px] text-[var(--text-white)]">
            For My Parents.{"\n"}For Everyone Fighting.
          </h2>
          <p className="font-heading italic text-[18px] leading-[1.7] text-[#FFFFFFAA]">
            &quot;In the last few years, I lost both of my parents to cancer. This trail isn&apos;t just a walk — it&apos;s a promise. A promise that their struggle wasn&apos;t in vain, and that we can do more to prevent others from going through the same pain.&quot;
          </p>
          <span className="font-label font-semibold text-[13px] tracking-[1px] text-[var(--burnt-orange)]">— Paul Barry</span>
          <div className="w-[60px] h-[3px] bg-[var(--burnt-orange)]" />
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[12px]">
              <Heart className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Supporting cancer survivors and patients</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <Shield className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Raising awareness for cancer prevention</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <Sun className="w-[18px] h-[18px] text-[var(--forest-green)] shrink-0" />
              <span className="font-heading text-[16px] text-[#FFFFFFCC]">Promoting healthy lifestyle habits that reduce cancer risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Wall */}
      <section className="flex flex-col items-center gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col items-center gap-[16px] w-full">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">DONOR WALL</span>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)] text-center">
            People Who Make This Possible
          </h2>
          <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)] text-center">
            Every donation fuels another mile. Thank you to everyone who has contributed to this cause.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] w-full">
          {/* Column 1 */}
          <div className="flex flex-col gap-[12px]">
            <DonorCard name="Sarah Mitchell" amount="$250" color="#3D7A5A" />
            <DonorCard name="James O'Connor" amount="$500" color="#C45C26" />
            <DonorCard name="Linda Chen" amount="$100" color="#8B7355" />
          </div>
          {/* Column 2 */}
          <div className="flex flex-col gap-[12px]">
            <DonorCard name="Robert Williams" amount="$1,000" color="#6B8E7B" />
            <DonorCard name="Maria Rodriguez" amount="$75" color="#7B6B8E" />
            <DonorCard name="Tom & Lisa Park" amount="$300" color="#3D7A5A" />
          </div>
          {/* Column 3 */}
          <div className="flex flex-col gap-[12px]">
            <DonorCard name="David Thompson" amount="$150" color="#A68B5B" />
            <DonorCard name="Anonymous" amount="$2,000" color="#5B8EA6" />
            <DonorCard name="Emily Watson" amount="$50" color="#C45C26" />
          </div>
          {/* Column 4 */}
          <div className="flex flex-col gap-[12px]">
            <DonorCard name="Rachel Kim" amount="$125" color="#6B7B5B" />
            <DonorCard name="Michael Foster" amount="$400" color="#8E6B7B" />
            <DonorCard name="Dr. Amanda Brooks" amount="$750" color="#5B6B8E" />
          </div>
        </div>
        <Link
          href="/donors"
          className="flex items-center justify-center gap-[8px] border border-[var(--border-subtle)] px-[32px] py-[14px]"
        >
          <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">VIEW ALL 47 DONORS</span>
          <ChevronDown className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
        </Link>
      </section>

      {/* Blog / Vlog */}
      <section className="flex flex-col gap-[32px] md:gap-[48px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] lg:py-[80px] bg-[var(--bg-warm)] w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0 w-full">
          <div className="flex flex-col gap-[16px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">TRAIL JOURNAL</span>
            <h2 className="font-heading font-semibold text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.5px] text-[var(--text-primary)]">
              Stories From the Trail
            </h2>
            <p className="font-heading text-[18px] leading-[1.6] text-[var(--text-secondary)]">
              Daily photos, videos, and reflections from Paul&apos;s PCT journey.
            </p>
          </div>
          <Link
            href="/journal"
            className="flex items-center gap-[8px] border border-[var(--border-subtle)] px-[24px] py-[12px]"
          >
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">VIEW ALL POSTS</span>
            <ArrowRight className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
          {/* Blog Post 1 */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="relative w-full h-[220px]">
              <Image
                src="https://images.unsplash.com/photo-1621341917840-8aa7744c1108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjAwOTV8&ixlib=rb-4.1.0&q=80&w=1080"
                alt="The First Step"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[12px] p-[24px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 1</span>
                <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; MARCH 28, 2026</span>
              </div>
              <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">The First Step</span>
              <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                Standing at the southern monument, looking north toward Canada. 2,650 miles of trail ahead. This is the moment everything changes.
              </p>
              <div className="flex gap-[8px]">
                <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">BLOG</span>
                <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">VIDEO</span>
              </div>
            </div>
          </div>

          {/* Blog Post 2 */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="relative w-full h-[220px]">
              <Image
                src="https://images.unsplash.com/photo-1759046258329-24e108c78425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjAxMDZ8&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Through the Desert Wind"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[12px] p-[24px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 15</span>
                <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; APRIL 11, 2026</span>
              </div>
              <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Through the Desert Wind</span>
              <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                The heat is relentless, but the sunsets make it all worthwhile. Today I met a fellow hiker who lost her mother to breast cancer.
              </p>
              <div className="flex gap-[8px]">
                <span className="bg-[var(--forest-green-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--forest-green)]">BLOG</span>
              </div>
            </div>
          </div>

          {/* Blog Post 3 */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="relative w-full h-[220px]">
              <Image
                src="https://images.unsplash.com/photo-1761671600698-597651a68568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjAxMTJ8&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Sierra Nights"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[12px] p-[24px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">DAY 30</span>
                <span className="font-label font-medium text-[11px] tracking-[1px] text-[var(--text-muted)]">&middot;&nbsp; APRIL 26, 2026</span>
              </div>
              <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Sierra Nights</span>
              <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                The stars out here remind me of camping with my dad. I can feel him walking with me. Tonight&apos;s vlog is for him.
              </p>
              <div className="flex gap-[8px]">
                <span className="bg-[var(--burnt-orange-light)] px-[10px] py-[4px] font-label font-semibold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">VLOG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="relative w-full h-[420px] md:h-[450px] lg:h-[480px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1760685468640-dddb93b7a10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjAxMzF8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Mountain sunset"
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #1C1F1ADD 0%, #1C1F1ACC 100%)",
          }}
        />
        <div className="relative flex flex-col items-center justify-center gap-[16px] md:gap-[24px] h-full px-6 md:px-12 lg:px-[120px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">EVERY MILE MATTERS</span>
          <h2 className="font-heading font-semibold text-[24px] md:text-[34px] lg:text-[42px] leading-[1.2] tracking-[-0.5px] text-[var(--text-white)] text-center w-full lg:w-[800px]">
            Help Paul Complete This Journey{"\n"}For Those Who Can&apos;t Walk It Themselves
          </h2>
          <p className="font-heading text-[15px] md:text-[18px] leading-[1.6] text-[#FFFFFFAA] text-center w-full lg:w-[600px]">
            100% of donations go directly to cancer research, patient support, and prevention education.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-[16px]">
            <Link
              href="/donate"
              className="flex items-center justify-center gap-[10px] bg-[var(--burnt-orange)] px-[32px] lg:px-[48px] py-[16px] lg:py-[20px] hover:opacity-90 transition-opacity"
            >
              <span className="font-label font-bold text-[13px] lg:text-[15px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
              <Heart className="w-[18px] h-[18px] text-[var(--text-white)]" />
            </Link>
            <button className="flex items-center justify-center gap-[10px] border border-[#FFFFFF66] px-[32px] lg:px-[48px] py-[16px] lg:py-[20px] hover:bg-white/10 transition-colors">
              <span className="font-label font-bold text-[13px] lg:text-[15px] tracking-[2px] text-[var(--text-white)]">SHARE THIS CAUSE</span>
              <Share2 className="w-[18px] h-[18px] text-[var(--text-white)]" />
            </button>
          </div>
          <span className="font-label font-medium text-[13px] tracking-[1px] text-[#FFFFFF88]">$12,450 raised of $50,000 goal</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DonorCard({ name, amount, color }: { name: string; amount: string; color: string }) {
  return (
    <div className="flex items-center gap-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[16px]">
      <div className="w-[36px] h-[36px] rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex flex-col gap-[2px]">
        <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">{name}</span>
        <span className="font-label font-semibold text-[11px] tracking-[1px] text-[var(--forest-green)]">{amount}</span>
      </div>
    </div>
  );
}
