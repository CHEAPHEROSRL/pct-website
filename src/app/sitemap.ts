import type { MetadataRoute } from "next";
import { Redis } from "@upstash/redis";
import { safeParse } from "@/lib/redis-safe";
import type { JournalPost } from "@/lib/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

// Regenerate at most hourly. Without this, Next.js generates the sitemap
// at build time — when Redis credentials may not be available and no journal
// posts get listed. Hourly is a fine cadence for a charity site; search
// engines don't re-crawl more aggressively than that anyway.
export const revalidate = 3600;

/**
 * Next.js App Router sitemap generator. Served at /sitemap.xml.
 *
 * Covers static public routes plus dynamically-generated journal posts.
 * Admin, draft, press-kit, and Stripe callback routes are deliberately
 * omitted — we don't want crawlers indexing those.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/trail-map`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE}/the-cause`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/journal`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/foundations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/transparency`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/pledge`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/pledgers`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/supporters`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/donate`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms-of-use`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic journal posts — only PUBLISHED, never drafts
  const journalRoutes: MetadataRoute.Sitemap = [];
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      const rawPosts = await redis.lrange<string>("journal:posts", 0, -1);
      for (const raw of rawPosts || []) {
        const post = safeParse<JournalPost | null>(raw, null);
        if (!post || !post.published || !post.slug) continue;
        journalRoutes.push({
          url: `${SITE}/journal/${post.slug}`,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } catch {
      // Redis unavailable — ship static routes alone rather than failing the build
    }
  }

  return [...staticRoutes, ...journalRoutes];
}
