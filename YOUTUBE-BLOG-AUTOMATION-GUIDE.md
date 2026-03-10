# YouTube-to-Blog Automation — Step-by-Step Setup Guide

A step-by-step guide to setting up the automation that converts your YouTube videos into blog posts on the PCT website. This guide assumes zero prior experience.

---

## Table of Contents

1. [How It Works (Overview)](#how-it-works-overview)
2. [Get Your YouTube Channel ID](#step-1-get-your-youtube-channel-id)
3. [Get a Claude API Key](#step-2-get-a-claude-api-key)
4. [Add Environment Variables to Vercel](#step-3-add-environment-variables-to-vercel)
5. [Redeploy the Site](#step-4-redeploy-the-site)
6. [Test: Generate a Blog Post Manually](#step-5-test-generate-a-blog-post-manually)
7. [Set Up Automatic YouTube Webhooks](#step-6-set-up-automatic-youtube-webhooks)
8. [Using the Instagram Caption Feature](#step-7-using-the-instagram-caption-feature)
9. [Daily Workflow on the Trail](#step-8-daily-workflow-on-the-trail)
10. [Costs](#costs)
11. [Troubleshooting](#troubleshooting)

---

## How It Works (Overview)

Here's what happens when you upload a YouTube video:

```
You upload a video to YouTube
        |
        v
YouTube sends a notification to your website (webhook)
        |
        v
Your website extracts the video's captions/transcript (free, automatic)
        |
        v
Claude AI reads the transcript and writes a blog post in your voice
        |
        v
The blog post is saved as a DRAFT in your admin panel
        |
        v
You review it, make any edits, and click PUBLISH
        |
        v
An Instagram caption is also generated — you copy-paste it to Instagram
```

**Important:** Blog posts are always created as **drafts**. Nothing goes live without you reviewing it first.

There are two ways to use this:

- **Automatic mode:** YouTube notifies your website when you upload a new video. The blog post is generated in the background. You just log into admin and publish it.
- **Manual mode:** You paste a YouTube URL into the admin panel and click "Generate." Useful for older videos or if the webhook isn't set up yet.

---

## Step 1: Get Your YouTube Channel ID

Your Channel ID is a unique code that identifies your YouTube channel. It looks like `UCxxxxxxxxxxxxxxxxxxxxxxxx` (starts with "UC" followed by random letters and numbers).

### How to find it:

1. Open **YouTube** in your browser (not the app)
2. Make sure you are **logged in** to the Google account that owns your channel
3. Click on your **profile picture** in the top-right corner
4. Click **"Your channel"** from the dropdown menu
5. Now look at the **URL in your browser's address bar**. It will look like one of these:
   - `https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxx` — The part after `/channel/` is your Channel ID. Copy it.
   - `https://www.youtube.com/@YourChannelName` — If you see this format instead, you need one more step (see below).

### If your URL shows @YourChannelName instead of channel/UC...:

1. While on your channel page, click on **"More info"** or the **"About"** section
2. Scroll down — some channels show the Channel ID here
3. If you still can't find it, try this method:
   - Go to `https://www.youtube.com/account_advanced`
   - Your **Channel ID** is listed on this page under "Channel ID"
   - It starts with **UC** followed by 22 characters

### Alternative method (easiest):

1. Go to this website: `https://commentpicker.com/youtube-channel-id.php`
2. Paste your YouTube channel URL (like `https://www.youtube.com/@YourChannelName`)
3. Click the search/find button
4. It will show your Channel ID — copy it

**Write down your Channel ID.** You'll need it in Step 3.

Example Channel ID: `UCddiUEpeqJcYeBxX1IVBKvQ`

---

## Step 2: Get a Claude API Key

Claude is the AI that reads your video transcripts and writes blog posts. You need an API key to use it.

### Create an Anthropic account:

1. Go to **https://console.anthropic.com/**
2. Click **"Sign up"** (or "Log in" if you already have an account)
3. Enter your email and create a password
4. Verify your email by clicking the link Anthropic sends you
5. You'll land on the Anthropic Console dashboard

### Add billing (required to use the API):

1. In the Anthropic Console, look at the **left sidebar**
2. Click **"Billing"** (or look for a billing/payment section)
3. Click **"Add payment method"**
4. Enter your credit card details
5. You can set a **monthly spending limit** — I recommend starting with **$5/month**
   - Each blog post costs roughly $0.02-0.05 to generate
   - Even if you generate a post every single day, that's about $1.50/month
   - $5 gives you plenty of headroom

### Generate your API key:

1. In the Anthropic Console left sidebar, click **"API Keys"**
2. Click **"Create Key"** (it might say "+ Create key" or similar)
3. Give it a name like `pct-website`
4. Click **"Create"**
5. **IMPORTANT:** Your API key will be shown **only once**. It looks like:
   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. **Copy it immediately** and paste it somewhere safe (a text file, password manager, etc.)
7. If you lose it, you'll need to create a new one (the old one can't be recovered)

**Write down your API key.** You'll need it in Step 3.

---

## Step 3: Add Environment Variables to Vercel

Environment variables are like secret settings that your website uses but aren't visible in the code. You need to add 3 new ones.

### Go to your Vercel project:

1. Go to **https://vercel.com**
2. Log in to your account
3. Click on your **pct-website** project (or whatever it's called)
4. You should see your project dashboard

### Open Environment Variables settings:

1. Click on **"Settings"** in the top navigation bar (it's next to "Deployments", "Analytics", etc.)
2. In the left sidebar, click **"Environment Variables"**
3. You'll see a page where you can add new variables

### Add the following 3 variables:

For each variable below, do the following:
- Type the **Name** in the "Key" field
- Paste the **Value** in the "Value" field
- Make sure all three checkboxes are checked: **Production**, **Preview**, **Development**
- Click **"Save"** (or "Add")

#### Variable 1: ANTHROPIC_API_KEY

| Field | Value |
|-------|-------|
| Key   | `ANTHROPIC_API_KEY` |
| Value | Your Claude API key from Step 2 (starts with `sk-ant-`) |

#### Variable 2: YOUTUBE_CHANNEL_ID

| Field | Value |
|-------|-------|
| Key   | `YOUTUBE_CHANNEL_ID` |
| Value | Your YouTube Channel ID from Step 1 (starts with `UC`) |

#### Variable 3: YOUTUBE_WEBHOOK_SECRET

| Field | Value |
|-------|-------|
| Key   | `YOUTUBE_WEBHOOK_SECRET` |
| Value | Make up any random password, like `my-pct-webhook-2026` or `trailMagic42!` |

This is just a shared secret between YouTube and your website to verify notifications are real. It can be anything — just don't share it publicly.

### Verify all variables are saved:

After adding all three, you should see them listed on the Environment Variables page:

```
ANTHROPIC_API_KEY        ••••••••••  (encrypted)
YOUTUBE_CHANNEL_ID       UCxxxxxxxx
YOUTUBE_WEBHOOK_SECRET   ••••••••••  (encrypted)
```

These are in addition to the variables you already have (like `KV_REST_API_URL`, `ADMIN_AUTH_TOKEN`, etc.).

---

## Step 4: Redeploy the Site

After adding environment variables, Vercel needs to rebuild your site so it picks up the new settings.

1. Still in your Vercel project dashboard, click **"Deployments"** in the top navigation
2. Find the **most recent deployment** at the top of the list
3. Click the **three dots** (⋯) on the right side of that deployment
4. Click **"Redeploy"**
5. A confirmation popup will appear — click **"Redeploy"** again
6. Wait for the deployment to finish (usually 1-2 minutes)
7. The status will change from "Building" to **"Ready"** with a green checkmark

Your site is now ready to generate blog posts from videos.

---

## Step 5: Test — Generate a Blog Post Manually

Let's test that everything works by generating a blog post from an existing YouTube video.

### Requirements for this to work:

The YouTube video **must have captions/subtitles**. Most videos have auto-generated captions. To check:
1. Open the video on YouTube
2. Look for the **"CC"** button in the video player controls
3. If it's there, the video has captions and will work

### Generate your first post:

1. Go to your website's admin panel: **https://your-domain.com/admin**
   (Replace `your-domain.com` with your actual domain)
2. Enter your **admin token** and click **"Sign In"**
3. You should see the **Journal** tab with your existing posts

4. Look for the **"VIDEO → BLOG POST"** section — it's a collapsible bar with an orange video icon, right above your posts table
5. **Click on it** to expand it

6. In the **YouTube URL** field, paste a YouTube video URL, for example:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
   (Use one of your own videos for a real test!)

7. **Day # field** (optional): If you want to set a specific trail day number, type it here. If you leave it blank, it will auto-calculate based on your hike start date.

8. **"Split into 2 posts" checkbox**: Leave this **unchecked** for your first test. Check it later for longer videos (20+ minutes) where you want two separate blog posts.

9. Click the green **"GENERATE BLOG POST"** button

10. **Wait** — this takes about 10-30 seconds. The button will show a spinning icon and say "GENERATING..."

11. When done, you'll see a **green success box** showing:
    - "1 POST CREATED AS DRAFT"
    - The video title it was generated from
    - The blog post title Claude came up with
    - The tag(s) assigned (BLOG, VLOG, or INTERVIEWS)
    - An **"IG Caption"** button (more on this in Step 7)

12. **Scroll down** to the posts table — you'll see your new post listed as a **DRAFT**

13. Click **"EDIT"** next to the new post to review it

14. **Read through the blog post.** Claude writes in your voice based on what was said in the video. You can:
    - Edit the title
    - Modify the body text (it's Markdown)
    - Change the day number or date
    - Add/remove tags
    - Add a cover image URL (the YouTube thumbnail is used by default)

15. When you're happy with it:
    - Click **"PUBLISH"** to make it live on the journal page
    - Or click **"SAVE DRAFT"** to save your edits and publish later

### If something went wrong:

- **"Could not extract transcript"** — The video doesn't have captions. Add captions to the video on YouTube Studio and try again.
- **"ANTHROPIC_API_KEY not configured"** — Go back to Step 3 and make sure you added the API key correctly, then redeploy (Step 4).
- **"Blog post generation failed"** — Try clicking "Generate" again. This can happen if the AI had a temporary issue.
- **Network error** — Check your internet connection and try again.

---

## Step 6: Set Up Automatic YouTube Webhooks

This step makes it so your website **automatically** generates a blog post whenever you upload a new YouTube video. You only need to do this once.

### What are webhooks?

When you upload a video to YouTube, YouTube can send a message ("hey, a new video was uploaded!") to your website. Your website then automatically processes it. This is called a "webhook."

### Subscribe your website to YouTube notifications:

You'll do this by making a single API call. The easiest way is using your browser's developer console or a tool like Postman. Here's the simplest method:

#### Option A: Using the browser console (easiest)

1. Open your website in Chrome/Firefox/Edge: `https://your-domain.com`
2. Press **F12** (or right-click anywhere and click **"Inspect"**)
3. Click the **"Console"** tab at the top of the developer tools panel
4. Paste this code into the console (replace the two values marked with `<...>`):

```javascript
fetch('/api/automation/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <YOUR_ADMIN_TOKEN>'
  },
  body: JSON.stringify({})
}).then(r => r.json()).then(console.log)
```

Replace `<YOUR_ADMIN_TOKEN>` with your actual admin token (the same one you use to log into the admin panel).

5. Press **Enter**
6. You should see a response like:
```json
{
  "success": true,
  "channelId": "UCxxxxxxxxxx",
  "callbackUrl": "https://your-domain.com/api/webhooks/youtube",
  "message": "Subscription request sent...",
  "renewBefore": "2026-03-20T..."
}
```

### IMPORTANT: Subscription renewal

YouTube webhook subscriptions **expire after 10 days**. You need to renew them.

#### Option 1: Manual renewal
Set a recurring reminder on your phone for every 9 days to run the subscribe command above again.

#### Option 2: Automated renewal (recommended)
If your hosting provider supports cron jobs (scheduled tasks), you can set one up to call the subscribe endpoint every 8 days. On Vercel, you can use Vercel Cron Jobs:

1. In your project, there should be a file called `vercel.json` in the root folder
2. You can add a cron job configuration to auto-renew (ask me to set this up if you'd like)

### How to verify it's working:

1. Upload a test video to YouTube (can be unlisted)
2. Make sure the video has **captions enabled** (YouTube auto-generates them, but it may take a few minutes after upload)
3. Wait about 5-15 minutes (YouTube doesn't send notifications instantly)
4. Log into your admin panel at `/admin`
5. Check if a new **draft** post appeared in your journal list
6. If yes — it's working! Every future video upload will auto-create a draft.

### If it's not working:

- YouTube can take **up to 30 minutes** to send the first notification
- The video **must have captions**. YouTube auto-generates them, but this can take 5-30 minutes after upload
- Make sure you **redeployed** after adding the environment variables (Step 4)
- Try the manual generation method (Step 5) to verify the AI and transcript parts work independently

---

## Step 7: Using the Instagram Caption Feature

Every time a blog post is generated from a video (either automatically or manually), an Instagram caption is also created and stored. Here's how to use it:

### Right after generating a post:

1. In the admin panel, after generating a post, you'll see the green success box
2. Next to each created post title, there's a small **"IG Caption"** button with an Instagram icon
3. **Click it**
4. The Instagram caption will appear in a white box below the post titles
5. It includes:
   - A short, engaging caption (2-3 sentences)
   - Relevant hashtags (always includes #YesChapter #PCT2026 #WalkingForCancer #PacificCrestTrail plus 3-5 topic-specific ones)
6. Click the **"Copy"** button in the top-right corner of the caption box
7. The text "Copy" changes to **"Copied!"** — the caption is now on your clipboard
8. Open Instagram on your phone or browser
9. Create a new post, attach your photo/video
10. **Paste** the caption into the caption field
11. Post it!

### For previously generated posts:

If you generated a post earlier and want to get the Instagram caption later, the captions are stored for 30 days. You can retrieve them by clicking the "IG Caption" button in the success area, or by using the API directly at `/api/automation/instagram-caption?postId=<POST_ID>`.

---

## Step 8: Daily Workflow on the Trail

Here's what your typical day looks like with this system:

### When you upload a video:

1. **Record your video** on the trail (phone or camera)
2. **Upload it to YouTube** (you can do this from your phone on YouTube app)
   - Make sure captions are enabled (they're on by default for new uploads)
   - YouTube auto-generates captions, which may take 5-30 minutes
3. **Wait ~15-30 minutes** for the automation to run
4. **Open your admin panel** on your phone browser: `https://your-domain.com/admin`
5. **Log in** with your admin token
6. You should see a **new draft** in your journal list
7. **Tap "EDIT"** to review the AI-written blog post
8. **Make any quick edits** (fix names, add details the AI missed, etc.)
9. **Tap "PUBLISH"** when ready
10. The blog post is now live on your website!

### For Instagram:

11. Expand the **"VIDEO → BLOG POST"** section
12. If you see the caption from earlier, tap **"IG Caption"** and **"Copy"**
13. Go to Instagram, create a post with a trail photo, paste the caption
14. Done!

### For longer/complex videos (optional):

If you recorded a 20+ minute video covering multiple topics:
1. Open the **VIDEO → BLOG POST** section in admin
2. Paste the YouTube URL
3. Check **"SPLIT INTO 2 POSTS"**
4. Click **"GENERATE BLOG POST"**
5. Two drafts are created:
   - **Post 1:** The main story — publish now
   - **Post 2:** A secondary angle — saved with a date 2 days later, publish then for more content cadence

---

## Costs

| Service | Cost | Notes |
|---------|------|-------|
| YouTube transcript extraction | **Free** | Uses the free `youtube-caption-extractor` library |
| Claude AI blog generation | **~$0.02-0.05 per post** | Using Claude Sonnet model |
| YouTube webhook notifications | **Free** | Google's PubSubHubbub service |
| Upstash Redis storage | **Already set up** | Posts stored in your existing Redis |

**Monthly estimate:**
- 1 video/day = ~30 posts = **$0.60-1.50/month**
- 1 video every other day = ~15 posts = **$0.30-0.75/month**

Set your Anthropic billing limit to $5/month and you'll never have a surprise bill.

---

## Troubleshooting

### "Could not extract transcript"
- The video doesn't have captions yet
- **Fix:** Wait 10-30 minutes after uploading for YouTube to auto-generate captions, then try again
- **Check:** Open the video on YouTube and look for the CC button in the player

### "ANTHROPIC_API_KEY not configured"
- The environment variable isn't set or the site wasn't redeployed after setting it
- **Fix:** Go to Vercel > Settings > Environment Variables, verify `ANTHROPIC_API_KEY` is there, then redeploy

### "Blog post generation failed"
- The AI had a temporary issue
- **Fix:** Simply click "Generate" again — it usually works on the second try

### No draft appeared after uploading a video
- The webhook subscription may have expired (they expire every 10 days)
- **Fix:** Re-run the subscribe command from Step 6
- **Check:** Also verify the video has captions (wait 10-30 minutes after upload)

### The blog post doesn't sound right
- The AI bases the post entirely on the transcript. If the transcript is bad (poor auto-captions), the post will be too
- **Fix:** You can manually add/edit captions in YouTube Studio for better results
- **Alternative:** Edit the draft in the admin panel before publishing

### "Storage not configured" error
- Your Redis database isn't connected
- **Fix:** Make sure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in Vercel environment variables

### I lost my Claude API key
- You can't recover it, but you can create a new one
- **Fix:** Go to https://console.anthropic.com/ > API Keys > Create Key > Copy the new key > Update it in Vercel > Redeploy

### The Instagram caption is missing
- Captions are stored for 30 days, then automatically deleted
- **Fix:** Generate the post again if you need a new caption

---

## Environment Variables Summary

Here are ALL the environment variables related to this feature:

| Variable | Required | Example | Where to get it |
|----------|----------|---------|-----------------|
| `ANTHROPIC_API_KEY` | Yes | `sk-ant-api03-xxx...` | https://console.anthropic.com/ > API Keys |
| `YOUTUBE_CHANNEL_ID` | Yes | `UCddiUEpeqJcYeBxX1IVBKvQ` | YouTube > Your Channel > URL or account settings |
| `YOUTUBE_WEBHOOK_SECRET` | Yes | `mySecret123` | Make up any random string |

These are added in **Vercel > Project > Settings > Environment Variables**.

---

## API Endpoints Reference (Advanced)

For developers or if you need to debug:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/automation/generate-post` | POST | Admin token | Manually generate a blog post from a YouTube URL |
| `/api/automation/subscribe` | POST | Admin token | Subscribe to YouTube webhook notifications |
| `/api/automation/instagram-caption?postId=X` | GET | Admin token | Get the Instagram caption for a generated post |
| `/api/webhooks/youtube` | GET | None | YouTube subscription verification (handled automatically) |
| `/api/webhooks/youtube` | POST | None | Receives YouTube upload notifications (handled automatically) |
