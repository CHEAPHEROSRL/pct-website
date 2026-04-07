import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import type { VideoTranscript } from "./youtube";
import { addInternalLinks } from "./internal-links";
import {
  buildAssetPool,
  formatAssetPoolForPrompt,
  resolveAssetPlaceholders,
  type BlogAsset,
} from "./blog-assets";

export interface GeneratedPost {
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  instagramCaption: string;
}

export interface GeneratedPostPair {
  post1: GeneratedPost;
  post2: GeneratedPost;
}

type AIProvider = "anthropic" | "openai";

const SYSTEM_PROMPT = `You are a ghostwriter for Paul Barry, a cancer awareness advocate who is thru-hiking the Pacific Crest Trail (PCT) in 2026 — walking 2,650 miles from Mexico to Canada in honor of both his parents who he lost to cancer. He's raising funds for cancer research, patient support, and prevention.

PAUL'S VOICE
- Warm, reflective, and genuine
- Conversational but thoughtful — he speaks plainly without being simplistic
- He shares vulnerable moments honestly
- He connects trail experiences to bigger life themes
- He uses sensory details (what he sees, hears, feels on the trail)
- He occasionally uses dry humor
- He never sounds preachy about the cause — the walk speaks for itself

FORMATTING — write rich, magazine-style markdown
The blog is written in first person as Paul. Use Markdown formatting that makes posts visually engaging and easy to read. Specifically:

- Break the post into 3–5 short sections using \`##\` headers — each section should feel like a small chapter with its own beat
- Use \`>\` blockquotes 1–2 times per post to highlight a powerful line, a quote-worthy reflection, or a moment that deserves to breathe on its own. Keep blockquotes short (1–2 sentences max)
- Use \`**bold**\` sparingly to emphasize key phrases or emotional pivots — never bold whole sentences
- Use bulleted or numbered lists when listing concrete items (gear, miles, observations, lessons learned). Don't force lists where prose flows better
- Vary paragraph length — mix short punchy paragraphs (1–2 sentences) with longer reflective ones (4–6 sentences)
- Use \`---\` horizontal rules sparingly to mark a major shift in time, place, or mood
- Do NOT include a top-level \`#\` heading — the post title is rendered separately
- Do NOT use code blocks or tables — this is editorial writing

The result should feel like a well-edited magazine essay, not a wall of plain paragraphs.`;

// ---------------------------------------------------------------------------
// Provider detection — checks Redis settings first, then env vars
// ---------------------------------------------------------------------------

const SETTINGS_KEY = "admin:settings";

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

async function getAIConfig(): Promise<AIConfig | null> {
  // Try Redis settings first
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (url && token) {
      const redis = new Redis({ url, token });
      const raw = await redis.get<string>(SETTINGS_KEY);
      if (raw) {
        const settings = typeof raw === "string" ? JSON.parse(raw) : raw;

        // Determine provider: explicit setting OR infer from which key is present
        const provider: AIProvider | null =
          settings.aiProvider === "openai" || settings.aiProvider === "anthropic"
            ? settings.aiProvider
            : settings.openaiApiKey
              ? "openai"
              : settings.anthropicApiKey
                ? "anthropic"
                : null;

        if (provider === "openai") {
          const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
          if (apiKey) {
            return {
              provider: "openai",
              apiKey,
              model: settings.openaiModel || "gpt-4o",
            };
          }
        }
        if (provider === "anthropic") {
          const apiKey = settings.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
          if (apiKey) {
            return {
              provider: "anthropic",
              apiKey,
              model: settings.anthropicModel || "claude-sonnet-4-5-20250514",
            };
          }
        }
      }
    }
  } catch {
    // Fall through to env vars
  }

  // Fall back to environment variables
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-sonnet-4-5-20250514",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Unified completion function
// ---------------------------------------------------------------------------

async function generateCompletion(
  userPrompt: string,
  maxTokens: number
): Promise<string | null> {
  const config = await getAIConfig();
  if (!config) return null;

  if (config.provider === "anthropic") {
    try {
      const client = new Anthropic({ apiKey: config.apiKey });
      const response = await client.messages.create({
        model: config.model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0].type === "text" ? response.content[0].text : null;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("AI generation failed:", config.provider, msg);
      return null;
    }
  }

  // OpenAI
  try {
    const client = new OpenAI({ apiKey: config.apiKey });
    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    return response.choices[0]?.message?.content ?? null;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("AI generation failed:", config.provider, msg);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Blog post generation
// ---------------------------------------------------------------------------

/**
 * Asset embedding instructions block — appended to every generation prompt
 * so the AI knows it can pick from a pool of pre-approved images.
 */
function buildAssetInstructions(assets: BlogAsset[]): string {
  if (assets.length === 0) return "";

  return `
INLINE IMAGES — embed 1–3 images from the asset pool below where they fit naturally
You may embed up to 3 images from this curated pool inside the blog body.
Use the EXACT id from the pool. Do not invent ids and do not link external images.

Asset pool:
${formatAssetPoolForPrompt(assets)}

To embed an image, use this exact markdown syntax:
\`\`\`
![alt text describing the photo](pool:<id>)
\`\`\`

For example: \`![sunset over the valley](pool:local-3)\` or \`![Paul's first IG post](pool:ig-1)\`

Rules:
- Pick images that genuinely illustrate the story — never force them
- Place each image on its own line, between paragraphs (not inline with text)
- Always include descriptive alt text
- Never use the same image twice in one post
- It's perfectly fine to skip images entirely if none of them fit. Quality over quantity.
- Prefer Instagram or YouTube assets when the post references those platforms;
  use local hiking photos for general scenery
`;
}

/**
 * Run the AI-generated body through deterministic post-processors:
 *   1. Replace pool:id placeholders with real image markdown
 *   2. Add 2–3 internal links to relevant pages
 */
function postProcessBody(body: string, assets: BlogAsset[]): string {
  let out = body;
  out = resolveAssetPlaceholders(out, assets);
  out = addInternalLinks(out);
  return out;
}

/**
 * Optional inputs that can be added when generating or regenerating a post.
 */
export interface BlogGenerationOptions {
  /**
   * Free-form thoughts Paul (or the admin) wants to inject into the post —
   * extra context the video transcript didn't capture.
   */
  extraThoughts?: string;
  /**
   * Free-form instructions for how to change the post on regeneration.
   * Combined with `improvementPills` if both are present.
   */
  regenerationInstructions?: string;
  /**
   * Multi-select pill selections from the regenerate dialog. Each pill maps
   * to a specific human-readable instruction included in the prompt.
   */
  improvementPills?: string[];
  /**
   * The previous body of the post being regenerated. Used so the AI can take
   * a different angle / structure rather than reword the same thing.
   */
  previousBody?: string;
}

const PILL_INSTRUCTIONS: Record<string, string> = {
  shorter: "Make the post noticeably shorter and more concise — cut filler, tighten every paragraph.",
  longer: "Expand the post — add more depth, more sensory detail, more reflection.",
  "more-emotional": "Lean harder into the emotional core — make the reader feel what Paul felt.",
  "more-factual": "Lean harder into concrete facts — miles walked, terrain, gear, conditions, time of day.",
  "different-angle": "Take a completely different angle on the same content — frame it around a different theme or moment.",
  "more-reflective": "Make it more reflective — slow down and dwell on what the experience meant.",
  "more-sensory": "Add more sensory detail — what Paul saw, heard, smelled, felt physically.",
  "more-humor": "Add some of Paul's dry humor — keep it tasteful, never forced.",
};

function buildContextualInstructions(opts: BlogGenerationOptions | undefined): string {
  if (!opts) return "";

  const sections: string[] = [];

  if (opts.extraThoughts && opts.extraThoughts.trim()) {
    sections.push(
      `PAUL'S ADDITIONAL THOUGHTS — extra context the transcript didn't capture\n` +
      `Treat these as first-person notes from Paul that should be woven into the post naturally:\n\n` +
      `"""\n${opts.extraThoughts.trim()}\n"""\n`
    );
  }

  const pillInstructions = (opts.improvementPills || [])
    .map((p) => PILL_INSTRUCTIONS[p])
    .filter(Boolean);

  if (pillInstructions.length > 0 || (opts.regenerationInstructions && opts.regenerationInstructions.trim())) {
    const lines: string[] = [
      `REGENERATION INSTRUCTIONS — this is a regeneration of an existing post`,
    ];
    if (pillInstructions.length > 0) {
      lines.push("Apply ALL of these adjustments:");
      pillInstructions.forEach((p) => lines.push(`- ${p}`));
    }
    if (opts.regenerationInstructions && opts.regenerationInstructions.trim()) {
      lines.push("");
      lines.push(`Additional guidance from the editor: ${opts.regenerationInstructions.trim()}`);
    }
    sections.push(lines.join("\n"));
  }

  if (opts.previousBody && opts.previousBody.trim()) {
    sections.push(
      `PREVIOUS VERSION — what you wrote before. Take a genuinely different approach.\n` +
      `Don't just reword this — change the structure, the angle, or the emphasis.\n\n` +
      `"""\n${opts.previousBody.trim()}\n"""\n`
    );
  }

  return sections.length > 0 ? "\n" + sections.join("\n\n") + "\n" : "";
}

/**
 * Generate a single blog post from a video transcript.
 */
export async function generateBlogPost(
  video: VideoTranscript,
  dayNumber: number,
  opts?: BlogGenerationOptions
): Promise<GeneratedPost | null> {
  const assets = await buildAssetPool();
  const assetInstructions = buildAssetInstructions(assets);
  const contextualInstructions = buildContextualInstructions(opts);

  const prompt = `Here is a transcript from Paul's YouTube video titled "${video.title}":

---
${video.transcript}
---
${contextualInstructions}
Generate a blog post from this video transcript. The post should:
1. Capture the key story/experience from the video
2. Be 600-1000 words
3. Feel like a written journal entry, not a video summary
4. Include the emotional core and any meaningful moments
5. End with a natural reflection (not a forced call-to-action)
6. Use the rich formatting described in the system prompt — multiple sections,
   at least one blockquote, varied paragraph length, occasional bold emphasis
${assetInstructions}
Also determine the appropriate tags. Choose from:
- VLOG (if the video is primarily trail footage / day-in-the-life)
- BLOG (if the content is more reflective / story-driven)
- INTERVIEWS (if Paul interviews someone on the trail with his "YesChapter" question: "What's a time in your life where you could go back and change the answer to YES?")

Respond in this exact JSON format:
{
  "title": "A compelling blog post title (not the same as the video title)",
  "body": "The full Markdown blog post content",
  "excerpt": "A 1-2 sentence teaser (max 200 chars)",
  "tags": ["VLOG"],
  "instagramCaption": "A short Instagram caption (2-3 sentences) with relevant hashtags. Include #YesChapter #PCT2026 #WalkingForCancer #PacificCrestTrail and 3-5 relevant ones."
}`;

  try {
    const text = await generateCompletion(prompt, 4000);
    if (!text) {
      console.error("generateBlogPost: AI completion returned null for video:", video.title);
      return null;
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("generateBlogPost: No JSON found in AI response for video:", video.title);
      return null;
    }
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedPost;
    parsed.body = postProcessBody(parsed.body, assets);
    return parsed;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("generateBlogPost: JSON parse failed for video:", video.title, msg);
    return null;
  }
}

/**
 * Generate two blog posts from a longer/complex video transcript.
 * Post 1 publishes immediately, Post 2 is saved as draft for scheduled publishing.
 */
export async function generateBlogPostPair(
  video: VideoTranscript,
  dayNumber: number,
  opts?: BlogGenerationOptions
): Promise<GeneratedPostPair | null> {
  const assets = await buildAssetPool();
  const assetInstructions = buildAssetInstructions(assets);
  const contextualInstructions = buildContextualInstructions(opts);

  const prompt = `Here is a transcript from Paul's YouTube video titled "${video.title}". This is a longer/complex video that should be split into TWO separate blog posts:

---
${video.transcript}
---
${contextualInstructions}
Generate TWO distinct blog posts from this transcript:

**Post 1** (publish immediately): Focus on the primary story, event, or experience.
**Post 2** (publish 2-3 days later): Focus on a secondary theme, reflection, or behind-the-scenes angle that the video also covers.

Each post should:
1. Stand alone as a complete blog entry
2. Be 500-800 words each
3. Feel like journal entries, not video summaries
4. Have distinct angles — a reader of both should not feel like they overlap
5. Use the rich formatting described in the system prompt — multiple sections,
   at least one blockquote, varied paragraph length, occasional bold emphasis
${assetInstructions}
Determine tags for each post independently. Choose from: VLOG, BLOG, INTERVIEWS.

Respond in this exact JSON format:
{
  "post1": {
    "title": "Title for the first post",
    "body": "Full Markdown content",
    "excerpt": "1-2 sentence teaser (max 200 chars)",
    "tags": ["VLOG"],
    "instagramCaption": "Instagram caption with hashtags including #YesChapter #PCT2026 #WalkingForCancer #PacificCrestTrail"
  },
  "post2": {
    "title": "Title for the second post",
    "body": "Full Markdown content",
    "excerpt": "1-2 sentence teaser (max 200 chars)",
    "tags": ["BLOG"],
    "instagramCaption": "Instagram caption with hashtags including #YesChapter #PCT2026 #WalkingForCancer #PacificCrestTrail"
  }
}`;

  try {
    const text = await generateCompletion(prompt, 8000);
    if (!text) {
      console.error("generateBlogPostPair: AI completion returned null for video:", video.title);
      return null;
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("generateBlogPostPair: No JSON found in AI response for video:", video.title);
      return null;
    }
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedPostPair;
    parsed.post1.body = postProcessBody(parsed.post1.body, assets);
    parsed.post2.body = postProcessBody(parsed.post2.body, assets);
    return parsed;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("generateBlogPostPair: JSON parse failed for video:", video.title, msg);
    return null;
  }
}

/**
 * Determine if a video transcript is "complex" enough to warrant two posts.
 * Heuristic: long transcript (>3000 words) or multiple distinct topics.
 */
export function shouldSplitIntoTwoPosts(transcript: string): boolean {
  const wordCount = transcript.split(/\s+/).length;
  return wordCount > 3000;
}
