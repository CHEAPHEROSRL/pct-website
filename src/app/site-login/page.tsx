"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mountain, Lock } from "lucide-react";

export default function SiteLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/site-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-dark)] px-6">
      <div className="flex flex-col items-center gap-[32px] w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-[12px]">
          <Mountain className="w-[40px] h-[40px] text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[18px] tracking-[4px] text-white">
            YESCHAPTER
          </span>
          <span className="font-label text-[11px] tracking-[2px] text-[#FFFFFF66]">
            PRIVATE PREVIEW
          </span>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[20px] w-full bg-[var(--bg-white)] p-[32px] md:p-[40px]"
        >
          <div className="flex items-center gap-[10px]">
            <Lock className="w-[16px] h-[16px] text-[var(--text-muted)]" />
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-muted)]">
              ACCESS REQUIRED
            </span>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full border border-[var(--border-subtle)] px-[16px] py-[12px] font-heading text-[15px] text-[var(--text-primary)] bg-[var(--bg-white)] outline-none focus:border-[var(--forest-green)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)]">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full border border-[var(--border-subtle)] px-[16px] py-[12px] font-heading text-[15px] text-[var(--text-primary)] bg-[var(--bg-white)] outline-none focus:border-[var(--forest-green)] transition-colors"
            />
          </div>

          {error && (
            <p className="font-label text-[12px] tracking-[0.5px] text-[var(--burnt-orange)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--forest-green)] px-[24px] py-[14px] font-label font-bold text-[13px] tracking-[2px] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="font-label text-[11px] tracking-[1px] text-[#FFFFFF44] text-center">
          This site is in private preview. Access is by invitation only.
        </p>
      </div>
    </div>
  );
}
