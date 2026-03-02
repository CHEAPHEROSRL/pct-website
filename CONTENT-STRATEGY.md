# PCT 2026 Website — Content Strategy & Admin Panel

## Project Overview

Paul Barry is walking the Pacific Crest Trail (2,650 miles, Mexico to Canada) to raise awareness and funds for cancer research. This website serves as his digital basecamp — tracking his location in real-time, accepting donations, and sharing his daily story with the world.

The website needs a content pipeline that allows fresh journal entries (blog posts, vlogs, photo galleries) to be published daily throughout Paul's 6-7 month journey, without requiring Paul to manage the website himself.

---

## The Challenge

While hiking the PCT, Paul will face:
- **Physical exhaustion** — walking 20-30 miles per day leaves no energy for website management
- **Limited connectivity** — large stretches of the PCT have no cell service
- **Battery conservation** — phone battery is critical for GPS tracking and emergency use
- **Weather and conditions** — cold, wet, or dusty environments make phone use difficult

Paul cannot be expected to write blog posts, edit videos, format content, or manage a CMS while on the trail.

---

## The Solution: Two-Person Workflow

### Paul's Role (On the Trail)
Paul focuses exclusively on **capturing raw material**:
- Short video clips (1-3 minutes, unedited) from his phone camera
- Photos throughout the day (landscapes, wildlife, camp setup, fellow hikers)
- Voice memos or quick text notes about the day's highlights
- GPS tracking via the `/tracker` page (already built)

### Content Manager's Role (From Home)
A dedicated content manager (the project partner) handles **everything else**:
- Receives raw material from Paul via WhatsApp, Google Drive, or iCloud
- Writes and publishes daily journal entries on the website
- Edits and uploads vlogs to YouTube, then embeds them on the website
- Curates the best photos for each post
- Manages social media cross-posting
- Monitors donations and engages with donors
- Keeps the website fresh and engaging for visitors

### Daily Workflow

```
Morning (Paul):
  Paul starts hiking, GPS tracker running on his phone

Throughout the day (Paul):
  Takes photos and short video clips
  Maybe records a quick voice memo about the day

Evening (Paul — when he has signal):
  Sends raw photos/videos/notes to content manager
  Checks in briefly via text

Evening/Next morning (Content Manager):
  Reviews raw material from Paul
  Writes the journal entry (blog post)
  Selects and uploads best photos
  If vlog material exists: edits video → uploads to YouTube
  Publishes journal entry via the Admin Panel
  Optionally cross-posts to Instagram/Facebook/Twitter
```

---

## Content Types

### 1. Blog Posts
- **Frequency**: Daily or every other day
- **Content**: Written narrative of Paul's day on the trail
- **Elements**: Title, date, day number, body text, 2-5 photos, tags
- **Tone**: Personal, reflective, connected to the cancer cause
- **Example**: "Day 15: Through the Desert Wind — Met a fellow hiker who lost her mother to breast cancer. We walked together for 10 miles in silence."

### 2. Vlogs (Video Logs)
- **Frequency**: 2-3 times per week
- **Content**: Edited video from Paul's raw footage
- **Hosting**: YouTube (embedded on the website)
- **Length**: 3-8 minutes after editing
- **Elements**: YouTube embed, title, description, thumbnail
- **Example**: "Day 30: Sierra Nights — Stars, campfire, and a message for Dad"

### 3. Photo Galleries
- **Frequency**: As available (some days are more photogenic)
- **Content**: Curated selection of the day's best photos
- **Hosting**: Vercel Blob, Cloudinary, or direct URLs
- **Elements**: Multiple images in a grid, captions
- **Example**: "Day 45: Wildflower Bloom in the Sierra — 12 photos"

---

## Admin Panel (`/admin`)

A simple, auth-protected page where the content manager creates and manages journal entries.

### Features
- **Auth token login** — same pattern as the GPS tracker (token saved in localStorage)
- **Post editor** — title, date, day number, body (Markdown), tags, cover image URL, YouTube URL
- **Post list** — view all published posts with edit/delete options
- **Image management** — paste image URLs or upload to Vercel Blob
- **Preview** — see how the post will look before publishing
- **Draft mode** — save posts as drafts before publishing

### Security
- Protected by `ADMIN_AUTH_TOKEN` environment variable
- Not linked from navigation, not indexed by search engines
- Token entered once, saved in browser localStorage

### Storage
- Posts stored in Upstash Redis (same database as GPS and donations)
- Redis key: `journal:posts` (list of post objects)
- Each post is a JSON object with all fields
- Fallback to hardcoded sample posts when no Redis data exists

---

## Technical Architecture

```
Content Manager                          Website Visitors
     |                                        |
     v                                        v
  /admin                                  /journal
  (create/edit posts)                     (read posts)
     |                                        |
     v                                        v
  POST /api/journal                      GET /api/journal
  (auth required)                        (public, cached)
     |                                        |
     +-----------> Upstash Redis <-----------+
                   (journal:posts)
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/journal` | GET | None | Returns all published posts (cached 30s) |
| `POST /api/journal` | POST | Bearer token | Create a new post |
| `PUT /api/journal` | PUT | Bearer token | Update an existing post |
| `DELETE /api/journal` | DELETE | Bearer token | Delete a post |

### Data Model

```typescript
interface JournalPost {
  id: string;              // Unique ID (generated)
  title: string;           // "Through the Desert Wind"
  slug: string;            // "through-the-desert-wind" (auto-generated)
  dayNumber: number;       // 15
  date: string;            // "2026-04-11"
  body: string;            // Markdown content
  excerpt: string;         // First 200 chars for previews
  coverImage: string;      // URL to cover photo
  images: string[];        // Additional photo URLs
  youtubeUrl: string;      // YouTube embed URL (optional)
  tags: string[];          // ["BLOG", "VLOG", "PHOTOS"]
  published: boolean;      // true = visible on journal page
  createdAt: number;       // Unix timestamp
  updatedAt: number;       // Unix timestamp
}
```

---

## Content Impact Strategy

### Why Daily Content Matters
- **Donor retention**: People who follow the journey daily are more likely to donate again or share
- **SEO**: Fresh content keeps search engines indexing the site
- **Social sharing**: Each post is shareable, expanding reach organically
- **Emotional connection**: Regular updates make visitors feel like they're walking with Paul

### Content Calendar (Sample Week)

| Day | Type | Example |
|-----|------|---------|
| Monday | Blog + Photos | "Week 3 Recap: Desert to Mountains" |
| Tuesday | Blog | "The Water Carry: 24 Miles Without a Source" |
| Wednesday | Vlog | "Sunrise at Mt. San Jacinto" (YouTube) |
| Thursday | Blog + Photos | "Trail Angels: The Kindness of Strangers" |
| Friday | Blog | "For Mom: A Letter From Mile 200" |
| Saturday | Vlog + Photos | "Weekend Trail Report" (YouTube) |
| Sunday | Rest day post | "Rest Day in Idyllwild: Laundry, Pizza, and Reflection" |

### Engagement Tactics
- End each post with a call to action ("Support the journey — donate today")
- Tag posts with emotional themes (CANCER STORY, TRAIL LIFE, MILESTONE)
- Share milestone posts more widely (Mile 100, 500, 1000, halfway, state borders)
- Include donor shoutouts in posts when appropriate

---

## Setup Requirements

### Environment Variables (Vercel)
| Variable | Description |
|----------|-------------|
| `ADMIN_AUTH_TOKEN` | Secret token for admin panel access |

### Content Manager Needs
- Access to the admin panel URL and auth token
- Access to Paul's shared Google Drive / WhatsApp for raw material
- YouTube account credentials for vlog uploads
- Image hosting account (Cloudinary free tier recommended)

---

## Summary

This content strategy ensures Paul's PCT journey is documented with consistent, high-quality content while Paul focuses on what matters most — walking. The admin panel gives the content manager a simple, purpose-built tool to publish posts without needing any technical knowledge. Combined with the live GPS tracker and donation system already built, this creates a complete digital experience for visitors following Paul's journey.
