"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader, CircleX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "redirecting" | "error">(
    error ? "error" : "loading"
  );

  useEffect(() => {
    if (error || !token) {
      setStatus("error");
      return;
    }

    // Redirect to server-side verify handler which sets the cookie
    setStatus("redirecting");
    router.replace(`/api/auth/verify?token=${token}&redirect=/my-pledge`);
  }, [token, error, router]);

  if (status === "error" || (!token && !error)) {
    return (
      <div className="flex flex-col items-center gap-[24px] px-6 py-[120px] bg-[var(--bg-white)] w-full text-center">
        <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-red-50">
          <CircleX className="w-[32px] h-[32px] text-red-600" />
        </div>
        <h2 className="font-heading font-semibold text-[32px] tracking-[-0.5px] text-[var(--text-primary)]">
          Link expired or already used
        </h2>
        <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[460px]">
          Magic links expire after 15 minutes and can only be used once.
          Request a new one from the pledge page.
        </p>
        <Link
          href="/auth/check-email"
          className="flex items-center justify-center gap-[8px] bg-[var(--forest-green)] px-[32px] py-[14px] hover:opacity-90 transition-opacity"
        >
          <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
            GET A NEW LINK
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[24px] px-6 py-[120px] bg-[var(--bg-white)] w-full text-center">
      <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[var(--forest-green-light)]">
        <Loader className="w-[32px] h-[32px] text-[var(--forest-green)] animate-spin" />
      </div>
      <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--text-muted)]">
        SIGNING YOU IN
      </span>
      <h2 className="font-heading font-semibold text-[36px] tracking-[-0.5px] text-[var(--text-primary)]">
        Verifying your link...
      </h2>
      <p className="font-heading text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[460px]">
        Hang tight — you&apos;ll be redirected to your pledge dashboard in a moment.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-[120px] bg-[var(--bg-white)] w-full">
            <Loader className="w-[32px] h-[32px] text-[var(--forest-green)] animate-spin" />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
