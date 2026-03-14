"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export default function Turnstile({ onVerify, onExpire, onError, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  // Keep callback refs up to date
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return; // Already rendered

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY not set — Turnstile disabled");
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      size: "invisible",
      callback: (token: string) => onVerifyRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onErrorRef.current?.(),
    });
  }, []);

  useEffect(() => {
    // If Turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Load the script
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (!existingScript) {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // Script exists but maybe not loaded yet
      const check = setInterval(() => {
        if (window.turnstile) {
          clearInterval(check);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(check);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} className={className} />;
}
