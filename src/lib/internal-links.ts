/**
 * Internal link auto-linker for AI-generated blog posts.
 *
 * After the AI generates a markdown blog body, we run it through this module
 * to add 2–3 contextual links to relevant pages on yeschapter.com. The link
 * map is curated and deterministic — no AI hallucination, no broken URLs.
 *
 * Rules:
 *   - Each entry's first matching phrase in the body becomes a link
 *   - The same URL is never linked twice in one post
 *   - Phrases inside existing markdown links (`[...](...)`) are skipped
 *   - Phrases inside markdown image syntax (`![...](...)`) are skipped
 *   - Phrases inside code blocks are skipped
 *   - Maximum N links per post (default 3)
 *
 * Add a new page? Add an entry to LINK_MAP. That's it.
 */

interface LinkMapEntry {
  /** URL on yeschapter.com (always relative) */
  url: string;
  /** Phrases to look for in the blog body, longest/most-specific first */
  phrases: string[];
  /**
   * Higher = preferred. When two entries match in the same paragraph we link
   * the higher-priority one first.
   */
  priority: number;
}

const LINK_MAP: LinkMapEntry[] = [
  {
    url: "/pledge",
    phrases: [
      "pledge per mile",
      "per-mile pledge",
      "pledging",
      "pledge",
    ],
    priority: 10,
  },
  {
    url: "/the-cause",
    phrases: [
      "cancer prevention",
      "cancer research",
      "cancer foundations",
      "the cause",
      "fight against cancer",
      "fighting cancer",
      "honor my parents",
      "my parents",
    ],
    priority: 9,
  },
  {
    url: "/foundations",
    phrases: [
      "Ka Foundation",
      "City of Hope",
      "partner foundations",
      "two foundations",
      "the foundations",
    ],
    priority: 9,
  },
  {
    url: "/trail-map",
    phrases: [
      "trail map",
      "follow my progress",
      "see where I am",
      "track my progress",
      "Pacific Crest Trail map",
      "the route",
    ],
    priority: 8,
  },
  {
    url: "/support",
    phrases: [
      "buy me a meal",
      "trail meal",
      "support me on the trail",
      "support Paul on the trail",
      "trail support",
      "fuel the journey",
    ],
    priority: 7,
  },
  {
    url: "/journal",
    phrases: [
      "journal entries",
      "follow the journey",
      "read more from the trail",
      "earlier entries",
      "the journal",
    ],
    priority: 6,
  },
  {
    url: "/transparency",
    phrases: [
      "where the money goes",
      "100% of donations",
      "how it works",
      "transparency",
    ],
    priority: 6,
  },
  {
    url: "/pledgers",
    phrases: [
      "pledgers wall",
      "the pledgers",
      "people who have pledged",
      "see who's pledged",
    ],
    priority: 5,
  },
];

const MAX_LINKS_PER_POST = 3;

/**
 * Replace markdown image syntax / existing links / fenced code with placeholder
 * tokens so we don't accidentally link inside them. Returns the protected text
 * and a function to restore the originals.
 */
function protectExistingMarkdown(body: string): {
  protectedText: string;
  restore: (text: string) => string;
} {
  const stash: string[] = [];
  const placeholder = (i: number) => `\u0000PROTECT${i}\u0000`;

  const stashOne = (match: string) => {
    const token = placeholder(stash.length);
    stash.push(match);
    return token;
  };

  let out = body;

  // 1. Fenced code blocks
  out = out.replace(/```[\s\S]*?```/g, stashOne);
  // 2. Inline code
  out = out.replace(/`[^`\n]+`/g, stashOne);
  // 3. Markdown images ![alt](url "caption")
  out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, stashOne);
  // 4. Existing markdown links [text](url)
  out = out.replace(/\[[^\]]+\]\([^)]+\)/g, stashOne);

  return {
    protectedText: out,
    restore: (text: string) =>
      text.replace(/\u0000PROTECT(\d+)\u0000/g, (_, i) => stash[Number(i)]),
  };
}

/**
 * Escape a phrase for use in a regex.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Inject internal links into a markdown blog body. Returns a new string with
 * up to MAX_LINKS_PER_POST internal links added in-place.
 */
export function addInternalLinks(body: string): string {
  if (!body) return body;

  const { protectedText, restore } = protectExistingMarkdown(body);

  // Sort entries by priority (high → low). Within an entry, longest phrase
  // first so we match "pledge per mile" before "pledge".
  const sortedEntries = [...LINK_MAP]
    .sort((a, b) => b.priority - a.priority)
    .map((e) => ({
      ...e,
      phrases: [...e.phrases].sort((a, b) => b.length - a.length),
    }));

  let working = protectedText;
  const usedUrls = new Set<string>();
  let linksAdded = 0;

  for (const entry of sortedEntries) {
    if (linksAdded >= MAX_LINKS_PER_POST) break;
    if (usedUrls.has(entry.url)) continue;

    let linkedThisEntry = false;
    for (const phrase of entry.phrases) {
      // Word-boundary, case-insensitive, only the FIRST occurrence
      const pattern = new RegExp(`\\b(${escapeRegex(phrase)})\\b`, "i");
      const match = working.match(pattern);
      if (!match) continue;

      const matched = match[1];
      const replacement = `[${matched}](${entry.url})`;
      working = working.replace(pattern, replacement);
      usedUrls.add(entry.url);
      linksAdded++;
      linkedThisEntry = true;
      break;
    }

    if (linkedThisEntry) continue;
  }

  return restore(working);
}
