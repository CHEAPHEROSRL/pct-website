import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

/**
 * Next.js App Router robots.txt generator. Served at /robots.txt.
 *
 * Allows everything public. Disallows admin, API routes, auth endpoints,
 * Stripe callbacks, the hidden press-kit page, and unsubscribe pages
 * (no reason for Google to index a one-time unsubscribe link).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/auth/",
          "/press-kit",
          "/site-login",
          "/support/success",
          "/support/cancelled",
          "/donate/success",
          "/donate/cancelled",
          "/pledge/verify",
          "/unsubscribe",
          "/sponsor-agreement",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
