import Anthropic from "@anthropic-ai/sdk";
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

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

/**
 * Generate a single blog post from a video transcript.
 */
export async function generateBlogPost(
  video: VideoTranscript,
  dayNumber: number
): Promise<GeneratedPost | null> {
  const client = getAnthropicClient();
  if (!client) return null;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is a transcript from Paul's YouTube video titled "${video.title}":

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
}`,
      },
    ],
  });

  try {
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as GeneratedPost;
  } catch {
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
  const client = getAnthropicClient();
  if (!client) return null;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is a transcript from Paul's YouTube video titled "${video.title}". This is a longer/complex video that should be split into TWO separate blog posts:

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
}`,
      },
    ],
  });

  try {
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as GeneratedPostPair;
  } catch {
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
