import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import type { VideoTranscript } from "./youtube";

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

Paul's voice is:
- Warm, reflective, and genuine
- Conversational but thoughtful — he speaks plainly without being simplistic
- He shares vulnerable moments honestly
- He connects trail experiences to bigger life themes
- He uses sensory details (what he sees, hears, feels on the trail)
- He occasionally uses dry humor
- He never sounds preachy about the cause — the walk speaks for itself

The blog is written in first person as Paul. Use Markdown formatting. Include section headers (##) to break up longer posts. Do NOT include a top-level # heading — the title is rendered separately.`;

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
 * Generate a single blog post from a video transcript.
 */
export async function generateBlogPost(
  video: VideoTranscript,
  dayNumber: number
): Promise<GeneratedPost | null> {
  const prompt = `Here is a transcript from Paul's YouTube video titled "${video.title}":

---
${video.transcript}
---

Generate a blog post from this video transcript. The post should:
1. Capture the key story/experience from the video
2. Be 600-1000 words
3. Feel like a written journal entry, not a video summary
4. Include the emotional core and any meaningful moments
5. End with a natural reflection (not a forced call-to-action)

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
    return JSON.parse(jsonMatch[0]) as GeneratedPost;
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
  dayNumber: number
): Promise<GeneratedPostPair | null> {
  const prompt = `Here is a transcript from Paul's YouTube video titled "${video.title}". This is a longer/complex video that should be split into TWO separate blog posts:

---
${video.transcript}
---

Generate TWO distinct blog posts from this transcript:

**Post 1** (publish immediately): Focus on the primary story, event, or experience.
**Post 2** (publish 2-3 days later): Focus on a secondary theme, reflection, or behind-the-scenes angle that the video also covers.

Each post should:
1. Stand alone as a complete blog entry
2. Be 500-800 words each
3. Feel like journal entries, not video summaries
4. Have distinct angles — a reader of both should not feel like they overlap

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
    return JSON.parse(jsonMatch[0]) as GeneratedPostPair;
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
