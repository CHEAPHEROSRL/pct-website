"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Mail, HeartHandshake, Camera, Upload, Youtube, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SupportSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  // Media upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [consentMap, setConsentMap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!sessionId || (!imageFile && !youtubeUrl.trim())) return;
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      if (imageFile) formData.append("image", imageFile);
      if (youtubeUrl.trim()) formData.append("youtubeUrl", youtubeUrl.trim());

      const res = await fetch("/api/support/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploaded(true);
      } else {
        const data = await res.json();
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[var(--bg-warm)]">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center gap-[28px] px-6 md:px-12 lg:px-[120px] py-[60px] md:py-[80px] bg-[var(--bg-white)] w-full">
        <div className="flex items-center justify-center w-[96px] h-[96px] bg-[#E8F5E9] rounded-full">
          <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--forest-green)] rounded-full">
            <Check className="w-[32px] h-[32px] text-white" />
          </div>
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[36px] lg:text-[44px] tracking-[-0.5px] leading-[1.15] text-[var(--text-primary)] text-center">
          Thank You for Supporting
          <br />
          Paul on the Trail!
        </h1>
        <p className="font-heading text-[16px] md:text-[18px] leading-[1.7] text-[var(--text-secondary)] text-center max-w-[560px]">
          Your gift will help keep Paul going on his 2,650-mile journey. Every meal, rest day, and piece of gear makes a real difference.
        </p>
        <div className="flex items-center gap-[10px] bg-[var(--bg-warm)] px-[24px] py-[14px] rounded-[4px]">
          <Mail className="w-[16px] h-[16px] text-[var(--text-muted)]" />
          <span className="font-label font-medium text-[13px] tracking-[0.5px] text-[var(--text-muted)]">
            A receipt has been sent to your email by Stripe
          </span>
        </div>
      </section>

      {/* Leave Your Mark — Media Upload */}
      {sessionId && !uploaded && (
        <section className="flex flex-col items-center gap-[24px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-white)] border-t border-[var(--border-subtle)] w-full">
          <div className="flex flex-col items-center gap-[12px] max-w-[520px]">
            <Camera className="w-[28px] h-[28px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--forest-green)]">
              LEAVE YOUR MARK ON THE TRAIL
            </span>
            <p className="font-heading text-[15px] leading-[1.6] text-[var(--text-secondary)] text-center">
              Share a photo or video message — it&apos;ll appear on Paul&apos;s trail map for everyone to see. Completely optional!
            </p>
          </div>

          <div className="flex flex-col gap-[16px] w-full max-w-[480px]">
            {/* Image upload */}
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                PHOTO (OPTIONAL)
              </span>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-[240px] object-cover rounded-[4px] border border-[var(--border-subtle)]"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 flex items-center justify-center w-[28px] h-[28px] bg-white/90 rounded-full cursor-pointer hover:bg-white"
                  >
                    <X className="w-[14px] h-[14px] text-[var(--text-primary)]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-[8px] h-[120px] w-full border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--forest-green)] transition-colors cursor-pointer"
                >
                  <Upload className="w-[20px] h-[20px] text-[var(--text-muted)]" />
                  <span className="font-label font-medium text-[12px] text-[var(--text-muted)]">
                    Click to upload a photo (max 5MB)
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* YouTube URL */}
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                YOUTUBE VIDEO LINK (OPTIONAL)
              </span>
              <div className="flex items-center gap-[10px] h-[44px] px-[14px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <Youtube className="w-[16px] h-[16px] text-[var(--text-muted)] shrink-0" />
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1 h-full font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Consent checkbox */}
            <label className="flex items-start gap-[10px] cursor-pointer">
              <input
                type="checkbox"
                checked={consentMap}
                onChange={(e) => setConsentMap(e.target.checked)}
                className="mt-[3px] w-[16px] h-[16px] accent-[var(--forest-green)] cursor-pointer"
              />
              <span className="font-heading text-[13px] leading-[1.5] text-[var(--text-secondary)]">
                I agree to display my photo, video, and message on the public trail map. All submissions are reviewed before appearing.
              </span>
            </label>

            {uploadError && (
              <p className="font-heading text-[13px] text-red-600">{uploadError}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !consentMap || (!imageFile && !youtubeUrl.trim())}
              className="flex items-center justify-center gap-[8px] h-[48px] w-full bg-[var(--forest-green)] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-[16px] h-[16px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                {uploading ? "UPLOADING..." : "SHARE ON THE TRAIL MAP"}
              </span>
            </button>

            <p className="font-heading text-[12px] text-[var(--text-muted)] text-center">
              Your photo will be reviewed before appearing on the map.
            </p>
          </div>
        </section>
      )}

      {/* Upload success message */}
      {uploaded && (
        <section className="flex flex-col items-center gap-[16px] px-6 md:px-12 lg:px-[120px] py-[40px] bg-[var(--forest-green-light)] border-t border-[var(--border-subtle)] w-full">
          <div className="flex items-center gap-[10px]">
            <Check className="w-[20px] h-[20px] text-[var(--forest-green)]" />
            <span className="font-heading font-semibold text-[16px] text-[var(--forest-green)]">
              Your photo has been submitted!
            </span>
          </div>
          <p className="font-heading text-[14px] text-[var(--text-secondary)] text-center">
            It will appear on the trail map once reviewed. Thank you for leaving your mark on Paul&apos;s journey.
          </p>
        </section>
      )}

      {/* Cross-sell */}
      <section className="flex flex-col items-center gap-[32px] px-6 md:px-12 lg:px-[120px] py-[48px] bg-[var(--bg-warm)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--burnt-orange)]">
          WALK WITH PAUL FOR THE CAUSE
        </span>
        <div className="flex flex-col items-center gap-[16px] max-w-[560px]">
          <HeartHandshake className="w-[32px] h-[32px] text-[var(--burnt-orange)]" />
          <p className="font-heading text-[16px] leading-[1.7] text-[var(--text-secondary)] text-center">
            Want to support cancer research too? Pledge per mile — 100% goes directly to two cancer foundations. Paul receives nothing from pledges.
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col items-center gap-[20px] px-6 md:px-12 lg:px-[120px] py-[48px] md:py-[64px] bg-[var(--bg-white)] w-full">
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">
          WHAT&apos;S NEXT
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-[16px]">
          <Link
            href="/pledge"
            className="flex items-center justify-center h-[48px] px-[36px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-white)]">
              PLEDGE PER MILE
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center h-[48px] px-[36px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
              BACK TO HOME
            </span>
          </Link>
          <Link
            href="/journal"
            className="flex items-center justify-center h-[48px] px-[36px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <span className="font-label font-bold text-[14px] tracking-[2px] text-[var(--text-primary)]">
              FOLLOW THE JOURNEY
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
