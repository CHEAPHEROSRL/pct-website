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
    url: "/foundations",
    phrases: [
      "Leukaemia Foundation and City of Hope",
      "Leukaemia Foundation",
      "City of Hope",
      "the two foundations",
      "two foundations",
      "both foundations",
      "partner foundations",
      "the foundations",
    ],
    priority: 10,
  },
  {
    url: "/pledge",
    phrases: [
      "pledge per mile",
      "per-mile pledge",
      "make a pledge",
      "your pledge",
      "a pledge",
      "pledging",
      "pledge",
      "commitment",
      "commit",
      "promise to donate",
    ],
    priority: 9,
  },
  {
    url: "/the-cause",
    phrases: [
      "cancer prevention",
      "cancer research",
      "fight against cancer",
      "fighting cancer",
      "cancer awareness",
      "lost to cancer",
      "this cause",
      "the cause",
      "the why",
    ],
    priority: 9,
  },
  {
    url: "/trail-map",
    phrases: [
      "trail map",
      "the route",
      "where I am",
      "follow my progress",
      "follow along on the map",
      "track my progress",
      "Pacific Crest Trail map",
      "PCT route",
    ],
    priority: 8,
  },
  {
    url: "/support",
    phrases: [
      "buy me a meal",
      "buy Paul a meal",
      "trail meal",
      "support me on the trail",
      "support Paul on the trail",
      "trail support",
      "fuel the journey",
      "keep me on the trail",
      "keep Paul on the trail",
    ],
    priority: 7,
  },
  {
    url: "/journal",
    phrases: [
      "journal entries",
      "earlier entries",
      "previous post",
      "previous entries",
      "the journal",
      "more from the trail",
      "more posts",
    ],
    priority: 6,
  },
  {
    url: "/transparency",
    phrases: [
      "where the money goes",
      "how the money flows",
      "100% of pledges",
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
      "fellow pledgers",
      "everyone who's pledged",
      "people who have pledged",
      "see who's pledged",
      "join the pledgers",
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
  const linkedPhrases: Array<{ phrase: string; url: string }> = [];

  for (const entry of sortedEntries) {
    if (linksAdded >= MAX_LINKS_PER_POST) break;
    if (usedUrls.has(entry.url)) continue;

    for (const phrase of entry.phrases) {
      // Case-insensitive, only the FIRST occurrence. Use lookbehind/lookahead
      // for "soft" word boundaries that work with phrases containing
      // punctuation, apostrophes, hyphens etc. — JavaScript's \b is too strict.
      const pattern = new RegExp(
        `(^|[\\s.,;:!?"'\`(\\[{—–-])(${escapeRegex(phrase)})(?=$|[\\s.,;:!?"'\`)\\]}—–-])`,
        "i"
      );
      const match = working.match(pattern);
      if (!match) continue;

      const prefix = match[1];
      const matched = match[2];
      const replacement = `${prefix}[${matched}](${entry.url})`;
      working = working.replace(pattern, replacement);
      usedUrls.add(entry.url);
      linksAdded++;
      linkedPhrases.push({ phrase: matched, url: entry.url });
      break;
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `[internal-links] added ${linksAdded}/${MAX_LINKS_PER_POST} links:`,
    linkedPhrases.map((l) => `"${l.phrase}" → ${l.url}`).join(", ") || "(none matched)"
  );

  return restore(working);
}
