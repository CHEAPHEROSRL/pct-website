# New Services Setup Guide — Vercel Blob, Resend Email, Cloudflare Turnstile & Cron Secret

This guide walks you through setting up the 4 new services added to the YesChapter website. Follow each section step by step. Screenshots aren't included, but every click is described.

**Time needed:** About 30-45 minutes total for all 4 services.

**What you already have (don't need to set up again):**
- Upstash Redis (KV_REST_API_URL, KV_REST_API_TOKEN) — your database
- Stripe (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) — trail support payments
- GPS Tracker (TRACKER_AUTH_TOKEN, HIKE_START_DATE) — Paul's live location
- YouTube/Claude AI (ANTHROPIC_API_KEY, YOUTUBE_CHANNEL_ID, YOUTUBE_WEBHOOK_SECRET) — blog automation

---

## Table of Contents

1. [Vercel Blob — Supporter Photo Storage](#1-vercel-blob--supporter-photo-storage)
2. [Resend — Transactional Emails](#2-resend--transactional-emails)
3. [Cloudflare Turnstile — Bot Protection](#3-cloudflare-turnstile--bot-protection)
4. [Cron Secret — Scheduled Task Protection](#4-cron-secret--scheduled-task-protection)
5. [Add All Variables to Vercel](#5-add-all-variables-to-vercel)
6. [Redeploy and Test](#6-redeploy-and-test)
7. [Complete Environment Variables Checklist](#7-complete-environment-variables-checklist)

---

## 1. Vercel Blob — Supporter Photo Storage

**What this does:** When someone buys Paul a trail gift and uploads a photo on the thank-you page, that photo is stored in Vercel Blob. It's like a file storage bucket that lives alongside your Vercel deployment.

**Cost:** Free tier includes 500MB of storage. At ~200KB per photo, that's about 2,500 photos before you'd need to pay. More than enough.

### Step 1.1: Open Your Vercel Project

1. Go to **https://vercel.com** in your browser
2. Log in if you aren't already
3. Click on your **pct-website** project from the dashboard

### Step 1.2: Go to the Storage Tab

1. Look at the **top navigation bar** of your project (it shows tabs like "Deployments", "Analytics", "Logs", "Storage", "Settings")
2. Click on **"Storage"**

### Step 1.3: Create a Blob Store

1. You should see a page that says "Storage" with options to create different types of storage
2. Look for **"Blob"** — it might be listed alongside KV (Redis), Postgres, etc.
3. Click **"Create"** next to Blob (or click "Create Database" and then choose "Blob")
4. You'll see a setup form:
   - **Name:** Type something like `pct-supporter-photos` (this is just a label for your reference)
   - **Region:** Choose the same region as your existing KV store — probably **Washington, D.C. (iad1)** or similar US East region
5. Click **"Create"**
6. Wait a few seconds — Vercel will create the blob store

### Step 1.4: Get Your Token

After creating the blob store, Vercel should show you a page with your store details.

1. Look for a section called **"Environment Variables"** or **"Credentials"** or **"Quickstart"**
2. You need the value called **`BLOB_READ_WRITE_TOKEN`**
   - It looks something like: `vercel_blob_rw_xxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Copy this token** — save it somewhere safe temporarily (you'll add it to Vercel env vars in Step 5)

**Alternative method if Vercel auto-connected it:**

Sometimes when you create a Blob store inside your Vercel project, it automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable for you. To check:

1. Go to **Settings** tab → **Environment Variables** in the left sidebar
2. Search for `BLOB_READ_WRITE_TOKEN`
3. If it's already there — you're done with this section! Skip to Section 2.

### Step 1.5: Verify It Was Connected

1. Go to **Storage** tab again
2. You should see your blob store listed (e.g., "pct-supporter-photos")
3. It should say **"Connected"** and show 0 files stored
4. If it says "Not connected to project", click the three dots (⋯) and click **"Connect to Project"**, then select your pct-website project

**That's it for Vercel Blob!**

---

## 2. Resend — Transactional Emails

**What this does:** Sends emails to pledgers and supporters — welcome emails when someone pledges, weekly trail updates, milestone celebrations (e.g., "Paul just passed 500 miles!"), and honor confirmation emails.

**Cost:** Free tier includes 3,000 emails/month and 100 emails/day. That's plenty for this site.

### Step 2.1: Create a Resend Account

1. Go to **https://resend.com** in your browser
2. Click **"Sign Up"** (top right corner)
3. You can sign up with:
   - **GitHub** (click "Continue with GitHub" — easiest if you have a GitHub account)
   - **Google** (click "Continue with Google")
   - **Email** — enter your email, create a password
4. If you signed up with email, check your inbox for a verification email and click the link
5. You'll land on the Resend dashboard

### Step 2.2: Add and Verify Your Domain

This step tells Resend that you own `yeschapter.com` so it can send emails from that domain (like `noreply@yeschapter.com`). **Without this, emails go to spam or don't send at all.**

1. In the Resend dashboard, look at the **left sidebar**
2. Click **"Domains"**
3. Click **"Add Domain"** (button, usually top right)
4. Type your domain: **`yeschapter.com`**
5. Select a **region** — choose **US East (N. Virginia)** or whichever is closest
6. Click **"Add"**

Now you need to add DNS records to prove you own the domain:

7. Resend will show you a list of **DNS records** you need to add. There will be 3-5 records that look like this:

   | Type | Name | Value |
   |------|------|-------|
   | MX | `send._domainkey.yeschapter.com` | `feedback-smtp.us-east-1.amazonses.com` |
   | TXT | `send._domainkey.yeschapter.com` | `v=DKIM1; k=rsa; p=MIG...` (long string) |
   | TXT | `yeschapter.com` | `v=spf1 include:amazonses.com ~all` |

   **Don't panic!** You just need to copy-paste these into your domain's DNS settings.

8. **Open your domain registrar** in a new tab. This is wherever you bought `yeschapter.com`. Common ones:
   - **Namecheap** → Log in → Domain List → click "Manage" next to yeschapter.com → Advanced DNS
   - **GoDaddy** → Log in → My Products → DNS → Manage
   - **Google Domains** → Log in → DNS → Manage custom records
   - **Cloudflare** → Log in → select yeschapter.com → DNS → Records
   - **Vercel Domains** → If your domain DNS is managed by Vercel, go to Vercel → project → Settings → Domains → DNS Records

9. For **each record** Resend shows you:
   - Click **"Add Record"** (or "Add New Record") in your DNS provider
   - Set the **Type** to what Resend says (MX, TXT, or CNAME)
   - Set the **Name/Host** to what Resend says (copy exactly)
   - Set the **Value/Content** to what Resend says (copy the entire string)
   - Set **TTL** to **Auto** or **300** (doesn't matter much)
   - Click **Save** or **Add**
   - Repeat for each record

10. Go back to the Resend tab
11. Click **"Verify DNS"** (or wait — Resend auto-checks every few minutes)
12. DNS changes can take anywhere from **2 minutes to 48 hours** to propagate. Usually it's under 30 minutes.
13. Once verified, the domain status changes to **"Verified"** with a green checkmark

**If you DON'T have a custom domain yet** or want to test first:

- You can skip domain verification for now
- Resend lets you send from `onboarding@resend.dev` for testing
- But for production, you MUST verify your domain — otherwise emails go to spam

### Step 2.3: Generate an API Key

1. In the Resend dashboard left sidebar, click **"API Keys"**
2. Click **"Create API Key"** (button, usually top right)
3. Fill in:
   - **Name:** `pct-website` (just a label so you remember what it's for)
   - **Permission:** Select **"Full access"** (or "Sending access" if that's an option)
   - **Domain:** Select **`yeschapter.com`** (or leave as "All domains")
4. Click **"Create"**
5. **IMPORTANT:** Your API key will be shown **only once**. It looks like:
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   It starts with `re_` followed by a long string of letters and numbers.
6. **Copy it immediately** and save it somewhere safe
7. If you lose it, you'll need to delete this key and create a new one

**Write down your API key.** You'll add it to Vercel in Step 5.

### Step 2.4: Decide Your "From" Address

The website sends emails from a specific address. The default is:

```
YesChapter <noreply@yeschapter.com>
```

If you want a different "from" address (like `paul@yeschapter.com`), you'll set the `EMAIL_FROM` environment variable in Step 5. Otherwise, the default works fine and you can skip `EMAIL_FROM`.

**That's it for Resend!**

---

## 3. Cloudflare Turnstile — Bot Protection

**What this does:** Adds invisible CAPTCHA protection to the pledge form and honor wall form. It prevents bots from submitting fake pledges. Unlike Google reCAPTCHA, Turnstile is privacy-friendly and usually invisible — real humans don't see a puzzle.

**Cost:** Completely free. No limits.

### Step 3.1: Create a Cloudflare Account (if you don't have one)

1. Go to **https://dash.cloudflare.com/sign-up** in your browser
2. Enter your email address
3. Enter a password
4. Click **"Sign Up"**
5. Verify your email by clicking the link Cloudflare sends you
6. You'll land on the Cloudflare dashboard

**Already have a Cloudflare account?** Just log in at **https://dash.cloudflare.com**

### Step 3.2: Go to Turnstile

1. In the Cloudflare dashboard, look at the **left sidebar**
2. Scroll down until you see **"Turnstile"** — it has a small icon that looks like a shield or lock
   - If you can't find it, look under the section called "Security" or use the search bar at the top
3. Click on **"Turnstile"**

### Step 3.3: Create a Turnstile Widget

1. Click **"Add site"** (or "Create widget" — button at the top)
2. Fill in the form:
   - **Site name:** `YesChapter` (just a label for your reference)
   - **Domain:** Type `yeschapter.com` and press Enter
     - Also add `pct-website-iota.vercel.app` (your Vercel preview URL) — press Enter after each one
     - Also add `localhost` if you want it to work in development
   - **Widget type:** Choose **"Managed"**
     - "Managed" means Cloudflare decides if the user needs a visual challenge. Most real users pass invisibly.
     - "Non-interactive" is fully invisible but may let some bots through
     - "Interactive" always shows a checkbox
     - **Recommended: "Managed"** — best balance of security and user experience
3. Click **"Create"**

### Step 3.4: Copy Your Keys

After creating the widget, Cloudflare shows you two keys:

1. **Site Key** — This is the PUBLIC key that goes in your website's HTML/JavaScript
   - It looks like: `0x4AAAAAAA...` (starts with `0x4A` followed by a long string)
   - This is safe to expose publicly — it's meant to be in your frontend code
   - **Copy it** and label it "TURNSTILE SITE KEY"

2. **Secret Key** — This is the PRIVATE key that your server uses to verify submissions
   - It looks like: `0x4AAAAAAA...` (similar format but different value)
   - **Never share this publicly** — it goes in your environment variables only
   - **Copy it** and label it "TURNSTILE SECRET KEY"

**Write down BOTH keys.** You'll add them to Vercel in Step 5.

### How to find your keys later:

If you need to find your keys again:
1. Go to Cloudflare Dashboard → Turnstile
2. Click on your site ("YesChapter")
3. The Site Key and Secret Key are shown in the widget settings

**That's it for Cloudflare Turnstile!**

---

## 4. Cron Secret — Scheduled Task Protection

**What this does:** Some features run on a schedule (like sending weekly trail update emails, checking for milestone celebrations, etc.). The cron secret is a password that prevents random people from triggering these scheduled tasks by visiting the URL.

**Cost:** Free — it's just a password you make up.

### Step 4.1: Generate a Cron Secret

You just need a random string. Here are three ways to get one:

**Option A — Use the terminal (best):**

Open a terminal/command prompt and run:
```bash
openssl rand -hex 32
```

This gives you something like:
```
e4f7a2b8c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

**Option B — Use an online generator:**

1. Go to **https://generate-random.org/api-key-generator**
2. Set length to 64
3. Click Generate
4. Copy the result

**Option C — Just make up a strong string:**

```
pct-cron-secret-2026-yeschapter-hike!
```

**Copy your cron secret.** You'll add it to Vercel in Step 5.

---

## 5. Add All Variables to Vercel

Now you'll add all the new environment variables to your Vercel project.

### Step 5.1: Open Environment Variables

1. Go to **https://vercel.com**
2. Click on your **pct-website** project
3. Click **"Settings"** in the top navigation bar
4. Click **"Environment Variables"** in the left sidebar

### Step 5.2: Add Each Variable

For **each** variable below:
1. Type the **Key** (name) in the "Key" field
2. Paste the **Value** in the "Value" field
3. Make sure all three environment checkboxes are checked: **Production**, **Preview**, **Development**
4. Click **"Save"** (or **"Add"**)

Here are the variables to add:

#### From Section 1 — Vercel Blob:

| Key | Value | Notes |
|-----|-------|-------|
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` | May have been auto-added when you created the blob store. Check if it's already there before adding. |

#### From Section 2 — Resend:

| Key | Value | Notes |
|-----|-------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxx...` | Your Resend API key from Step 2.3 |
| `EMAIL_FROM` | `YesChapter <noreply@yeschapter.com>` | **Optional.** Only add this if you want a custom sender address. The default is `YesChapter <noreply@yeschapter.com>` |

#### From Section 3 — Cloudflare Turnstile:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAAAAA...` | The PUBLIC Site Key from Step 3.4. Note: this variable starts with `NEXT_PUBLIC_` because it's used in the browser. |
| `TURNSTILE_SECRET_KEY` | `0x4AAAAAAA...` | The PRIVATE Secret Key from Step 3.4. Different value than the site key! |

#### From Section 4 — Cron Secret:

| Key | Value | Notes |
|-----|-------|-------|
| `CRON_SECRET` | Your random string from Step 4.1 | Used to protect scheduled email endpoints |

### Step 5.3: Verify Everything Is There

After adding all variables, scroll through the Environment Variables page. You should now have **all of these** (starred ones are new):

```
KV_REST_API_URL              (from Redis/GPS setup)
KV_REST_API_TOKEN            (from Redis/GPS setup)
TRACKER_AUTH_TOKEN            (from GPS setup)
HIKE_START_DATE               (from GPS setup)
STRIPE_SECRET_KEY             (from Stripe setup)
STRIPE_WEBHOOK_SECRET         (from Stripe setup)
ADMIN_AUTH_TOKEN              (from admin setup)
ANTHROPIC_API_KEY             (from YouTube blog setup)
YOUTUBE_CHANNEL_ID            (from YouTube blog setup)
YOUTUBE_WEBHOOK_SECRET        (from YouTube blog setup)
BLOB_READ_WRITE_TOKEN      ⭐ NEW — Vercel Blob
RESEND_API_KEY             ⭐ NEW — Resend emails
TURNSTILE_SECRET_KEY       ⭐ NEW — Cloudflare Turnstile (server)
NEXT_PUBLIC_TURNSTILE_SITE_KEY ⭐ NEW — Cloudflare Turnstile (browser)
CRON_SECRET                ⭐ NEW — Cron job protection
```

Optional (add only if you customized it):
```
EMAIL_FROM                 ⭐ NEW — Custom email sender address
NEXT_PUBLIC_SITE_URL          (defaults to https://yeschapter.com)
```

---

## 6. Redeploy and Test

### Step 6.1: Redeploy

1. Go to the **"Deployments"** tab in your Vercel project
2. Find the latest deployment at the top
3. Click the **three dots** (⋯) on the right
4. Click **"Redeploy"**
5. Wait for it to finish (1-2 minutes)

### Step 6.2: Test Vercel Blob (Photo Upload)

1. Go to your website and buy a trail gift (use Stripe test mode with card `4242 4242 4242 4242`)
2. On the thank-you page, you should see a **"Leave Your Mark"** section
3. Upload a small test photo (any JPEG/PNG under 5MB)
4. Click **"Share on the Trail Map"**
5. If you see "Your photo has been submitted!" — Vercel Blob is working!
6. Check your Vercel dashboard → Storage → Blob store — the file should appear there

### Step 6.3: Test Resend (Emails)

Emails are triggered by specific actions. The easiest test:

1. Make a test pledge on `/pledge`
2. If email is configured correctly, you should receive a welcome email at the email address you entered
3. Check your spam folder if you don't see it in your inbox

**If no email arrives:**
- Check that your domain is verified in Resend (Step 2.2)
- Check Resend dashboard → "Logs" to see if the email was attempted
- Make sure `RESEND_API_KEY` is correct in Vercel

### Step 6.4: Test Turnstile (Bot Protection)

1. Go to `/pledge` on your website
2. Fill out the pledge form
3. You should see a small Cloudflare widget appear (might be invisible if it auto-passes you)
4. Submit the form — if it goes through, Turnstile is working
5. If you see "Bot verification failed", double-check both Turnstile keys in Vercel

**If Turnstile doesn't appear at all:**
- Check browser console (F12 → Console) for errors mentioning "turnstile"
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set (note: it must start with `NEXT_PUBLIC_`)
- Make sure you added your domain to the Turnstile widget in Cloudflare (Step 3.3)

### Step 6.5: Test Cron Secret

This protects endpoints like `/api/emails/weekly` and `/api/honor/stats`. You can test it:

1. Open your browser and go to: `https://your-domain.com/api/honor/stats`
2. You should see an error like "Unauthorized" or "Missing cron secret" — this means the protection is working!
3. The endpoint only works when called with the correct secret header (which Vercel Cron adds automatically)

---

## 7. Complete Environment Variables Checklist

Here's every single environment variable the site uses, all in one place. Check them off as you go.

### Required — Core Infrastructure

| Variable | Source | Guide |
|----------|--------|-------|
| `KV_REST_API_URL` | Auto-created by Vercel when you set up KV Redis | GPS-TRACKER-MANUAL.md |
| `KV_REST_API_TOKEN` | Auto-created by Vercel when you set up KV Redis | GPS-TRACKER-MANUAL.md |
| `ADMIN_AUTH_TOKEN` | You made this up — it's your admin panel password | (any strong string) |

### Required — Stripe (Trail Support Payments)

| Variable | Source | Guide |
|----------|--------|-------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys | STRIPE-SETUP-MANUAL.md |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret | STRIPE-SETUP-MANUAL.md |

### Required — GPS Tracker

| Variable | Source | Guide |
|----------|--------|-------|
| `TRACKER_AUTH_TOKEN` | You made this up — Paul types it into his phone | GPS-TRACKER-MANUAL.md |
| `HIKE_START_DATE` | The date Paul starts hiking, like `2026-03-28` | GPS-TRACKER-MANUAL.md |

### Required — New Services (this guide)

| Variable | Source | Guide |
|----------|--------|-------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → Storage → Blob store | Section 1 above |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | Section 2 above |
| `TURNSTILE_SECRET_KEY` | Cloudflare Dashboard → Turnstile → your widget | Section 3 above |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Dashboard → Turnstile → your widget | Section 3 above |
| `CRON_SECRET` | You generate this yourself | Section 4 above |

### Optional — YouTube Blog Automation

| Variable | Source | Guide |
|----------|--------|-------|
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | YOUTUBE-BLOG-AUTOMATION-GUIDE.md |
| `YOUTUBE_CHANNEL_ID` | Your YouTube channel URL or account settings | YOUTUBE-BLOG-AUTOMATION-GUIDE.md |
| `YOUTUBE_WEBHOOK_SECRET` | You made this up | YOUTUBE-BLOG-AUTOMATION-GUIDE.md |

### Optional — Customization

| Variable | Default | When to set |
|----------|---------|-------------|
| `EMAIL_FROM` | `YesChapter <noreply@yeschapter.com>` | Only if you want a different sender address |
| `NEXT_PUBLIC_SITE_URL` | `https://yeschapter.com` | Only if your site URL is different |

---

## Troubleshooting

### Vercel Blob

| Problem | Cause | Fix |
|---------|-------|-----|
| "Storage not configured" on photo upload | Missing `BLOB_READ_WRITE_TOKEN` | Add the env var and redeploy |
| Photo upload says "Upload failed" | Token is invalid or blob store isn't connected to project | Go to Vercel → Storage → check blob store is connected to your project |
| Photos upload but don't appear on map | Photos need admin approval first | Log into `/admin` → approve the photo in the Media Queue |

### Resend

| Problem | Cause | Fix |
|---------|-------|-----|
| Emails not sending at all | Missing or wrong `RESEND_API_KEY` | Verify the key in Vercel, create a new one in Resend if needed |
| Emails going to spam | Domain not verified in Resend | Complete Step 2.2 — add all DNS records |
| "Sender address not verified" | Sending from a domain you haven't verified | Verify your domain in Resend (Step 2.2) |
| Resend dashboard shows "Bounced" | Recipient email doesn't exist | Normal — not every email address is real |

### Cloudflare Turnstile

| Problem | Cause | Fix |
|---------|-------|-----|
| Turnstile widget doesn't appear | Wrong site key or domain not added | Check `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is correct; add your domain in Cloudflare Turnstile settings |
| "Bot verification failed" after submitting | Wrong secret key | Check `TURNSTILE_SECRET_KEY` in Vercel matches the secret in Cloudflare |
| Works on production but not localhost | `localhost` not added to Turnstile widget domains | Add `localhost` to your Turnstile widget in Cloudflare (Step 3.3) |
| Turnstile blocks real users | Widget type too aggressive | Change widget type from "Interactive" to "Managed" in Cloudflare |

### Cron Jobs

| Problem | Cause | Fix |
|---------|-------|-----|
| Scheduled emails not sending | Cron jobs not configured in Vercel | You need a `vercel.json` with cron config — ask me to set this up |
| "Unauthorized" when testing cron endpoint | Working correctly! | Cron endpoints reject direct browser visits. They only work when called by Vercel's cron scheduler with the correct secret. |

---

## What Each Service Does (Summary)

| Service | What It Does | Where It's Used |
|---------|-------------|-----------------|
| **Vercel Blob** | Stores supporter photos | Thank-you page photo upload → appears on trail map |
| **Resend** | Sends emails | Welcome drip, weekly updates, milestone celebrations, honor confirmations |
| **Cloudflare Turnstile** | Blocks bots | Pledge form, honor wall form — invisible to real users |
| **Cron Secret** | Protects scheduled tasks | Weekly email sender, milestone checker, honor stats updater |
