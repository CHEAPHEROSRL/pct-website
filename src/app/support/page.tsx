"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Footprints,
  Tent,
  Package,
  BedDouble,
  Heart,
  HeartHandshake,
  ArrowRight,
  Check,
  X,
  EyeOff,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountdownBanner from "@/components/CountdownBanner";
import ScrollReveal from "@/components/ScrollReveal";
import { useSupporterData } from "@/hooks/useSupporterData";
import { GIFT_ESTIMATES } from "@/lib/gift-estimates";

interface GiftOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  price: number;
  cta: string;
}

const giftOptions: GiftOption[] = [
  {
    icon: <UtensilsCrossed className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "A Trail Meal",
    description:
      "Buy Paul a hot meal at a trail town diner — a welcome break from freeze-dried food after days in the wilderness.",
    price: 15,
    cta: "GIFT A MEAL",
  },
  {
    icon: <Footprints className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "Hiking Socks",
    description:
      "Good socks are everything on the trail. Keep Paul's feet blister-free for another hundred miles.",
    price: 20,
    cta: "GIFT SOCKS",
  },
  {
    icon: <Tent className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "A Night at Camp",
    description:
      "Cover a night at a campsite with a hot shower, a power outlet, and a flat spot to sleep.",
    price: 25,
    cta: "GIFT A CAMP NIGHT",
  },
  {
    icon: <Package className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "A Resupply Box",
    description:
      "Help cover a resupply box — food, fuel, and essentials shipped to a trail town post office ahead of Paul.",
    price: 75,
    cta: "GIFT A RESUPPLY",
  },
  {
    icon: <BedDouble className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "A Rest Day in Town",
    description:
      "Give Paul a day off — a motel bed, laundry, and time to recover before the next stretch.",
    price: 100,
    cta: "GIFT A REST DAY",
  },
  {
    icon: <Footprints className="w-[28px] h-[28px] text-[var(--forest-green)]" />,
    title: "Trail Boots",
    description:
      "A new pair of boots when the old ones wear out — Paul will go through 3-4 pairs on the trail.",
    price: 150,
    cta: "GIFT TRAIL BOOTS",
  },
];

export default function SupportPage() {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { data: supporterData } = useSupporterData();
  const giftCounts = supporterData?.giftCounts ?? {};

  // Pre-checkout personalization
  const [pendingGift, setPendingGift] = useState<{ title: string; price: number } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const openCheckoutPanel = (title: string, price: number) => {
    setPendingGift({ title, price });
    setFirstName("");
    setGiftMessage("");
    setAnonymous(false);
  };

  const closeCheckoutPanel = () => {
    setPendingGift(null);
  };

  const proceedToCheckout = async () => {
    if (!pendingGift) return;
    setCheckingOut(true);
    setSelectedGift(pendingGift.title);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pendingGift.price,
          giftTitle: pendingGift.title,
          firstName: firstName.trim() || undefined,
          message: giftMessage.trim() || undefined,
          anonymous,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setSelectedGift(null);
      setCheckingOut(false);
    }
  };

  const handleGift = (title: string) => {
    const gift = giftOptions.find((g) => g.title === title);
    if (!gift) return;
    openCheckoutPanel(gift.title, gift.price);
  };

  const handleCustom = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    openCheckoutPanel("Custom Gift", Math.round(amount));
  };

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <CountdownBanner />

      {/* Hero */}
      <section className="flex flex-col gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] md:py-[56px] bg-[var(--bg-white)] w-full">
        <span className="animate-fade-up font-label font-bold text-[12px] tracking-[3px] text-[var(--forest-green)]">
          SUPPORT PAUL ON THE TRAIL
        </span>
        <h1 className="animate-fade-up stagger-2 font-heading font-semibold text-[28px] md:text-[34px] lg:text-[36px] tracking-[-0.5px] text-[var(--text-primary)] max-w-[800px]">
          Help Fuel Paul&apos;s Journey
        </h1>
        <p className="animate-fade-up stagger-4 font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[750px]">
          Paul carries everything on his back for 2,650 miles. Buy him a meal, a
          pair of boots, or a rest day. These go directly to Paul — keeping him
          on the trail so he can walk for the cause.
        </p>
      </section>

      {/* Two-Stream Banner */}
      <section className="flex flex-col sm:flex-row items-center gap-[16px] sm:gap-[32px] px-6 md:px-12 lg:px-[120px] py-[16px] md:py-[20px] bg-[var(--bg-dark)] w-full">
        <div className="flex items-center gap-[12px]">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--forest-green)] shrink-0" />
          <span className="font-heading font-semibold text-[14px] text-[var(--text-white)]">
            Trail support goes directly to Paul
          </span>
        </div>
        <div className="hidden sm:block w-[1px] h-[24px] bg-[#FFFFFF33]" />
        <div className="flex items-center gap-[12px]">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--burnt-orange)] shrink-0" />
          <span className="font-heading font-semibold text-[14px] text-[var(--text-white)]">
            Pledges go 100% to cancer foundations
          </span>
        </div>
        <span className="font-heading italic text-[13px] text-[#FFFFFF88]">
          Two causes. One journey. They never mix.
        </span>
      </section>

      {/* Gift Cards */}
      <section className="flex flex-col gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
          CHOOSE HOW TO SUPPORT PAUL
        </span>

        {/* Row 1: $15, $20, $25 */}
        <ScrollReveal animation="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full">
          {giftOptions.slice(0, 3).map((gift) => (
            <GiftCard
              key={gift.title}
              gift={gift}
              selected={selectedGift === gift.title}
              onSelect={handleGift}
              gifted={giftCounts[gift.title] ?? 0}
              needed={GIFT_ESTIMATES[gift.title]?.needed}
            />
          ))}
        </ScrollReveal>

        {/* Row 2: $75, $100 */}
        <ScrollReveal animation="fade-up" delay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
          {giftOptions.slice(3, 5).map((gift) => (
            <GiftCard
              key={gift.title}
              gift={gift}
              selected={selectedGift === gift.title}
              onSelect={handleGift}
              gifted={giftCounts[gift.title] ?? 0}
              needed={GIFT_ESTIMATES[gift.title]?.needed}
            />
          ))}
        </ScrollReveal>

        {/* Row 3: $150, Custom */}
        <ScrollReveal animation="fade-up" delay={200} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
          {giftOptions.slice(5).map((gift) => (
            <GiftCard
              key={gift.title}
              gift={gift}
              selected={selectedGift === gift.title}
              onSelect={handleGift}
              gifted={giftCounts[gift.title] ?? 0}
              needed={GIFT_ESTIMATES[gift.title]?.needed}
            />
          ))}

          {/* Custom Amount Card */}
          <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
            <Heart className="w-[28px] h-[28px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">
              Custom Amount
            </span>
            <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
              Choose your own amount to support Paul directly on the trail —
              every dollar helps.
            </p>
            <div className="flex items-center w-full h-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <span className="font-heading text-[16px] text-[var(--text-muted)] ml-[14px]">
                US$
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 h-full px-[8px] font-heading text-[16px] italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent"
              />
            </div>
            <button
              onClick={handleCustom}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className={`flex items-center justify-center gap-[8px] h-[48px] w-full transition-opacity ${
                !customAmount || parseFloat(customAmount) <= 0
                  ? "bg-[var(--text-muted)] cursor-not-allowed"
                  : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
              }`}
            >
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                SUPPORT PAUL
              </span>
            </button>
            {selectedGift === "Custom" && (
              <div className="flex items-center gap-[8px] text-[var(--forest-green)]">
                <Check className="w-[16px] h-[16px]" />
                <span className="font-label font-semibold text-[12px] tracking-[0.5px]">
                  Thank you!
                </span>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* Pledge Cross-sell */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[56px] bg-[var(--bg-warm)] border-t border-[var(--border-subtle)] w-full">
        <ScrollReveal animation="scale-up">
        <HeartHandshake className="w-[36px] h-[36px] text-[var(--burnt-orange)]" />
        <h2 className="font-heading font-semibold text-[22px] text-[var(--text-primary)] text-center max-w-[600px]">
          Already supporting Paul? Pledge per mile for cancer foundations.
        </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
        <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)] text-center max-w-[600px]">
          100% of pledges go to <Link href="/foundations" className="text-[var(--burnt-orange)] hover:underline">two cancer foundations</Link> — one in California, one
          in Sydney. Paul receives nothing from pledges. Two causes, one journey.
        </p>
        </ScrollReveal>
        <Link
          href="/pledge"
          className="flex items-center justify-center gap-[10px] bg-[var(--burnt-orange)] px-[40px] py-[16px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
            PLEDGE PER MILE
          </span>
          <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />
        </Link>
      </section>

      {/* Pre-Checkout Personalization Panel */}
      {pendingGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="flex flex-col gap-[20px] bg-[var(--bg-white)] w-full max-w-[480px] p-[32px] shadow-xl relative">
            <button
              onClick={closeCheckoutPanel}
              className="absolute top-[16px] right-[16px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-[20px] h-[20px]" />
            </button>

            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--forest-green)]">
                PERSONALIZE YOUR GIFT
              </span>
              <span className="font-heading font-semibold text-[22px] text-[var(--text-primary)]">
                {pendingGift.title} — US${pendingGift.price}
              </span>
              <p className="font-heading text-[14px] text-[var(--text-secondary)]">
                Add your name and a message — or stay anonymous. All fields are optional.
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                className="w-full h-[44px] px-[14px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] outline-none focus:border-[var(--forest-green)]"
              />
              <textarea
                placeholder="Leave a message for Paul (optional)"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full px-[14px] py-[10px] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] outline-none focus:border-[var(--forest-green)] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="font-label text-[11px] text-[var(--text-muted)]">
                  {giftMessage.length}/200
                </span>
              </div>
            </div>

            <label className="flex items-center gap-[10px] cursor-pointer">
              <div
                onClick={() => setAnonymous(!anonymous)}
                className={`flex items-center justify-center w-[20px] h-[20px] border-2 transition-colors cursor-pointer ${
                  anonymous
                    ? "bg-[var(--forest-green)] border-[var(--forest-green)]"
                    : "bg-[var(--bg-white)] border-[var(--border-subtle)]"
                }`}
              >
                {anonymous && <Check className="w-[14px] h-[14px] text-[var(--text-white)]" />}
              </div>
              <div className="flex items-center gap-[6px]">
                <EyeOff className="w-[14px] h-[14px] text-[var(--text-muted)]" />
                <span className="font-heading text-[14px] text-[var(--text-secondary)]">
                  Keep my gift anonymous
                </span>
              </div>
            </label>

            <button
              onClick={proceedToCheckout}
              disabled={checkingOut}
              className="flex items-center justify-center gap-[8px] h-[52px] w-full bg-[var(--forest-green)] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
                {checkingOut ? "REDIRECTING TO CHECKOUT..." : "PROCEED TO CHECKOUT"}
              </span>
              {!checkingOut && <ArrowRight className="w-[16px] h-[16px] text-[var(--text-white)]" />}
            </button>

            <p className="font-heading text-[12px] text-[var(--text-muted)] text-center">
              Securely processed by Stripe. Your gift goes directly to Paul.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function GiftCard({
  gift,
  selected,
  onSelect,
  gifted = 0,
  needed,
}: {
  gift: GiftOption;
  selected: boolean;
  onSelect: (title: string) => void;
  gifted?: number;
  needed?: number;
}) {
  const pct = needed ? Math.min(100, Math.round((gifted / needed) * 100)) : 0;

  return (
    <div className="flex flex-col gap-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-[28px]">
      {gift.icon}
      <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">
        {gift.title}
      </span>
      <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
        {gift.description}
      </p>
      <span className="font-label font-bold text-[28px] text-[var(--forest-green)]">
        US${gift.price}
      </span>
      {needed != null && (
        <div className="flex flex-col gap-[6px]">
          <div className="w-full h-[3px] bg-[var(--warm-stone)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--forest-green)] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-label font-semibold text-[11px] tracking-[0.5px] text-[var(--text-muted)]">
            {gifted} of {needed} gifted
          </span>
        </div>
      )}
      <button
        onClick={() => onSelect(gift.title)}
        className="flex items-center justify-center gap-[8px] h-[48px] w-full bg-[var(--forest-green)] cursor-pointer hover:opacity-90 transition-opacity"
      >
        <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
          {gift.cta}
        </span>
      </button>
      {selected && (
        <div className="flex items-center gap-[8px] text-[var(--forest-green)]">
          <Check className="w-[16px] h-[16px]" />
          <span className="font-label font-semibold text-[12px] tracking-[0.5px]">
            Thank you!
          </span>
        </div>
      )}
    </div>
  );
}
