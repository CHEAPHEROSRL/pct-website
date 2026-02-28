import Link from "next/link";
import { Footprints, Apple, Sun, ScanSearch, CigaretteOff, HeartPulse } from "lucide-react";

export default function TheCausePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      {/* Header */}
      <header className="flex items-center justify-between px-[80px] py-[20px] bg-[#FFFFFFEE] w-full">
        <Link href="/" className="flex items-center gap-[12px]">
          <span className="font-label font-bold text-[18px] tracking-[2px] text-[var(--text-primary)]">PAUL BARRY</span>
          <span className="font-label text-[12px] tracking-[1px] text-[var(--text-muted)]">PCT 2026</span>
        </Link>
        <nav className="flex items-center gap-[40px]">
          <Link href="/" className="font-label font-medium text-[14px] text-[var(--text-secondary)]">The Journey</Link>
          <Link href="/trail-map" className="font-label font-medium text-[14px] text-[var(--text-secondary)]">Trail Map</Link>
          <span className="font-label font-bold text-[14px] text-[var(--burnt-orange)]">The Cause</span>
          <Link href="/journal" className="font-label font-medium text-[14px] text-[var(--text-secondary)]">Journal</Link>
          <Link href="/donors" className="font-label font-medium text-[14px] text-[var(--text-secondary)]">Donors</Link>
          <Link href="/donate" className="bg-[var(--forest-green)] px-[28px] py-[10px]">
            <span className="font-label font-bold text-[13px] tracking-[1px] text-[var(--text-white)]">DONATE NOW</span>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative w-full h-[560px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1648547254224-ea84e019798f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjA5NTR8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="The Cause"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1C1F1AEE 0%, #1C1F1A88 60%, #1C1F1A44 100%)" }} />
        <div className="relative flex flex-col justify-center gap-[24px] h-full px-[120px]">
          <span className="font-label font-bold text-[13px] tracking-[4px] text-[var(--burnt-orange)]">THE CAUSE</span>
          <h1 className="font-heading font-semibold text-[56px] tracking-[-1px] leading-[1.15] text-[var(--text-white)] w-[700px]">
            Walking 2,650 Miles{"\n"}for Cancer Awareness
          </h1>
          <p className="font-heading text-[20px] leading-[1.6] text-[#FFFFFFAA] w-[600px]">
            Because prevention starts with awareness, and awareness{"\n"}starts with one step.
          </p>
        </div>
      </section>

      {/* Paul's Story */}
      <section className="flex gap-[80px] px-[120px] py-[100px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1762445333169-0c7d95a5e6c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjA5NzJ8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Paul"
          className="w-[480px] h-[580px] object-cover shrink-0"
        />
        <div className="flex flex-col justify-center gap-[28px] flex-1">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">PAUL&apos;S STORY</span>
          <h2 className="font-heading font-semibold text-[42px] tracking-[-0.5px] text-[var(--text-primary)]">From Grief to Purpose</h2>
          <div className="w-[60px] h-[3px] bg-[var(--burnt-orange)]" />
          <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
            In 2023, I lost my mother to pancreatic cancer. Just fourteen months later, my father was diagnosed with lung cancer. He passed away in early 2025. In the span of two years, cancer took both of my parents from me.
          </p>
          <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
            The grief was overwhelming. But somewhere in that darkness, I found a spark of purpose. I realized that while I couldn&apos;t change what happened to my parents, I could help others — by raising awareness about cancer prevention and the lifestyle choices that can reduce risk.
          </p>
          <p className="font-heading text-[17px] leading-[1.8] text-[var(--text-secondary)]">
            So in March 2026, I&apos;m lacing up my boots and walking the entire Pacific Crest Trail — 2,650 miles from the Mexican border to Canada — to honor my parents and raise funds for cancer research and prevention programs.
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="flex flex-col items-center gap-[24px] px-[200px] py-[80px] bg-[var(--bg-dark)] w-full">
        <span className="font-heading font-semibold text-[120px] leading-[0.5] text-[var(--burnt-orange)]">&ldquo;</span>
        <p className="font-heading italic text-[28px] leading-[1.7] text-[#FFFFFFCC] text-center w-[800px]">
          Every mile I walk is a mile closer to a world where fewer families have to say goodbye too soon. This trail is my protest against cancer — one step at a time.
        </p>
        <span className="font-label font-semibold text-[14px] tracking-[2px] text-[var(--burnt-orange)]">— Paul Barry</span>
      </section>

      {/* Prevention Section */}
      <section className="flex flex-col items-center gap-[60px] px-[120px] py-[100px] bg-[var(--bg-white)] w-full">
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">CANCER PREVENTION</span>
          <h2 className="font-heading font-semibold text-[42px] tracking-[-0.5px] text-[var(--text-primary)] text-center">Prevention Starts With Lifestyle</h2>
          <p className="font-heading text-[17px] leading-[1.7] text-[var(--text-secondary)] text-center w-[700px]">
            Research shows that up to 50% of cancers could be prevented through healthy lifestyle choices. Here are the habits that can make a real difference.
          </p>
        </div>
        <div className="flex gap-[32px] w-full">
          <TipCard icon={<Footprints className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Stay Active" desc="Regular physical activity reduces risk for several cancers including colon, breast, and lung cancer. Even 30 minutes of daily walking makes a difference." />
          <TipCard icon={<Apple className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Eat Well" desc="A diet rich in fruits, vegetables, and whole grains while limiting processed meats and alcohol can significantly lower cancer risk. Nourish your body." />
          <TipCard icon={<Sun className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Sun Safety" desc="Protect your skin from UV radiation. Use sunscreen, wear protective clothing, and avoid tanning beds. Skin cancer is the most common but also one of the most preventable." />
        </div>
        <div className="flex gap-[32px] w-full">
          <TipCard icon={<ScanSearch className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Get Screened" desc="Regular screening can catch cancer early when it's most treatable. Talk to your doctor about recommended screenings for your age and risk factors." />
          <TipCard icon={<CigaretteOff className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Quit Smoking" desc="Tobacco use remains the single largest preventable cause of cancer. Quitting at any age reduces your risk. It's never too late to start." />
          <TipCard icon={<HeartPulse className="w-[32px] h-[32px] text-[var(--forest-green)]" />} title="Know Your Body" desc="Pay attention to changes in your body. Unexplained weight loss, persistent pain, or unusual lumps should be discussed with a healthcare provider promptly." />
        </div>
      </section>

      {/* Impact Section */}
      <section className="flex flex-col items-center gap-[60px] px-[120px] py-[100px] bg-[var(--forest-green-light)] w-full">
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">WHERE YOUR DONATION GOES</span>
          <h2 className="font-heading font-semibold text-[42px] tracking-[-0.5px] text-[var(--text-primary)] text-center">Making a Real Difference</h2>
        </div>
        <div className="flex gap-[32px] w-full">
          {[
            { pct: "40%", title: "Cancer Research", desc: "Funding breakthrough research into early detection and treatment of pancreatic and lung cancers." },
            { pct: "30%", title: "Patient Support", desc: "Helping cancer patients and their families with financial aid, counseling, and access to treatment resources." },
            { pct: "20%", title: "Prevention Programs", desc: "Community education programs promoting healthy lifestyles, early screening, and cancer prevention awareness." },
            { pct: "10%", title: "Trail Operations", desc: "Covering essential costs of the PCT journey — equipment, permits, and documentation to share the story." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-[16px] flex-1 bg-[var(--bg-white)] p-[40px]">
              <span className="font-heading font-bold text-[48px] text-[var(--forest-green)]">{item.pct}</span>
              <span className="font-label font-bold text-[16px] tracking-[1px] text-[var(--text-primary)]">{item.title}</span>
              <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)] text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full h-[400px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1576479569327-e777337d3606?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyNjEwNTB8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="CTA background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1C1F1ADD 0%, #1C1F1ACC 100%)" }} />
        <div className="relative flex flex-col items-center justify-center gap-[28px] h-full px-[120px]">
          <h2 className="font-heading font-semibold text-[44px] text-[var(--text-white)] text-center">Join the Walk Against Cancer</h2>
          <p className="font-heading text-[18px] leading-[1.6] text-[#FFFFFFAA] text-center w-[600px]">
            Every donation, no matter how small, brings us one step closer to a cancer-free future.
          </p>
          <div className="flex gap-[20px]">
            <Link href="/donate" className="bg-[var(--burnt-orange)] px-[48px] py-[16px]">
              <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">DONATE NOW</span>
            </Link>
            <button className="border border-[#FFFFFF66] px-[48px] py-[16px]">
              <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">SHARE THE CAUSE</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-[80px] py-[24px] bg-[var(--bg-dark)] w-full">
        <span className="font-label text-[13px] text-[#FFFFFF80]">2026 Paul Barry &middot; Walking for a Cause</span>
        <div className="flex items-center gap-[32px]">
          <Link href="/" className="font-label font-medium text-[13px] text-[#FFFFFF80]">Home</Link>
          <Link href="/trail-map" className="font-label font-medium text-[13px] text-[#FFFFFF80]">Trail Map</Link>
          <Link href="/donate" className="font-label font-medium text-[13px] text-[#FFFFFFCC]">Donate</Link>
          <Link href="/journal" className="font-label font-medium text-[13px] text-[#FFFFFF80]">Journal</Link>
        </div>
      </footer>
    </div>
  );
}

function TipCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-[20px] flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[32px]">
      {icon}
      <span className="font-heading font-semibold text-[22px] text-[var(--text-primary)]">{title}</span>
      <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-secondary)]">{desc}</p>
    </div>
  );
}
