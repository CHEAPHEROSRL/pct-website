# Email Setup — Gmail API via Google Cloud OAuth2

This is the one-time setup needed to make YesChapter able to send emails (new
post notifications, weekly updates, milestone alerts, honor reminders, magic
links, etc).

## What you'll end up with

Four environment variables in Vercel (Production):

| Variable | What it is |
|---|---|
| `GMAIL_CLIENT_ID` | OAuth2 client ID from Google Cloud Console |
| `GMAIL_CLIENT_SECRET` | OAuth2 client secret from Google Cloud Console |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token from OAuth Playground |
| `EMAIL_FROM` | Sender display, e.g. `YesChapter <paul@yeschapter.com>` |

Once those are set, the existing email code in `src/lib/email.ts` works
automatically — no code changes required.

## Who needs to do this

You need to be signed in as the Google account that will *send* the emails.
Two scenarios:

1. **Use `paul@yeschapter.com`** (Google Workspace) — Paul does the OAuth
   step on his account, or shares access temporarily. The "From" address on
   sent mail will be `paul@yeschapter.com`. Recommended for branding.
2. **Use a different Gmail account** (e.g. your own personal Gmail) — Faster
   to set up alone, but the "From" address will be that personal account
   unless you also set up "send mail as" forwarding inside Gmail.

The steps below are the same either way. Sign in as whichever account when
the OAuth Playground asks you to authorize.

## Step-by-step

### 1. Create the Google Cloud project

1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → **New Project**
3. Name it `YesChapter Email` (or anything)
4. Click **Create**, then make sure that project is selected

### 2. Enable the Gmail API

1. In the left sidebar, **APIs & Services → Library**
2. Search for **Gmail API**
3. Click it, then click **Enable**

### 3. Configure the OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. User type: **External**, then **Create**
3. Fill in:
   - App name: `YesChapter`
   - User support email: your email
   - Developer contact: your email
4. **Save and Continue** through the Scopes step (no need to add any here)
5. On the Test users step, add the email address that will be sending
   emails (e.g. `paul@yeschapter.com`). **Save and Continue**.
6. On the Summary step, click **Back to Dashboard**

You can leave the app in "Testing" mode — that's fine for our use case
because the only "user" of the OAuth app is the sending account itself.
Refresh tokens for test apps expire after 7 days, so we'll need to either:
- Publish the app (click **Publish App** on the OAuth consent screen — this
  doesn't actually publish anything publicly because we're not using
  sensitive scopes), OR
- Re-generate the refresh token every week (annoying)

**Recommended:** click **Publish App**. The `gmail.send` scope is not
"sensitive" so Google won't require verification.

### 4. Create OAuth 2.0 credentials

1. **APIs & Services → Credentials**
2. **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `YesChapter Web Client`
5. Under **Authorized redirect URIs**, click **Add URI** and paste:
   ```
   https://developers.google.com/oauthplayground
   ```
6. Click **Create**
7. A popup shows your **Client ID** and **Client Secret** — copy both into a
   safe place. You can also download the JSON.

### 5. Get a refresh token from OAuth Playground

1. Go to https://developers.google.com/oauthplayground
2. Click the **gear icon** (top right)
3. Tick **Use your own OAuth credentials**
4. Paste the **OAuth Client ID** and **OAuth Client secret** from step 4
5. Close the gear panel
6. In the left sidebar, scroll to **Gmail API v1**
7. Expand it, find and tick:
   ```
   https://www.googleapis.com/auth/gmail.send
   ```
8. Click **Authorize APIs**
9. Sign in as the Google account that should send emails (e.g.
   `paul@yeschapter.com`). Approve the consent screen.
10. You'll be back at the playground with an **Authorization code** in
    Step 2. Click **Exchange authorization code for tokens**.
11. Copy the **Refresh token** value (the long string).

### 6. Add the variables to Vercel

1. Go to https://vercel.com/raul-ciocans-projects/pct-website/settings/environment-variables
2. Add each of these (Environment: **Production**):

| Name | Value |
|---|---|
| `GMAIL_CLIENT_ID` | (from step 4) |
| `GMAIL_CLIENT_SECRET` | (from step 4) |
| `GMAIL_REFRESH_TOKEN` | (from step 5) |
| `EMAIL_FROM` | `YesChapter <paul@yeschapter.com>` |

3. After adding all four, redeploy the site (or push any commit) so the new
   env vars take effect.

### 7. Test it

1. Go to `yeschapter.com/admin` → log in → **Settings** tab
2. Scroll to **EMAIL NOTIFICATIONS (GMAIL)** section
3. In the **SEND A TEST EMAIL** box, the field is pre-filled with your
   address. Click **SEND TEST**
4. Check the inbox (and spam folder) of that address within ~30 seconds
5. If you receive the test email, you're done. If you get an error, the
   error message will appear right below the button — most common issues:
   - **"Email service not configured"** → env vars not set or deploy didn't
     pick them up. Try redeploying.
   - **"invalid_grant"** → refresh token expired or was revoked. Re-do
     step 5 to get a new one.
   - **"Token has been expired or revoked"** → same fix as above.

## How emails get sent in production

Once configured, emails are sent automatically from these places:

| Trigger | Recipients | Code |
|---|---|---|
| New journal post published | All waitlist subscribers + pledgers with `emailPreference="all"` | `/api/emails/new-post` |
| Weekly update (cron, Mondays 15:00 UTC) | All pledgers | `/api/emails/weekly` |
| Milestone reached (cron, daily 09:00 UTC) | All pledgers | `/api/emails/milestone` |
| Honor reminders (cron, daily 12:00 UTC) | Pledgers post-hike | `/api/emails/honor` |
| Welcome series (cron, daily 08:00 UTC) | New pledgers (day 1 + day 3) | `/api/emails/welcome` |
| Magic link login | The pledger requesting login | `/api/auth/magic` |

All routes share the same `send()` function in `src/lib/email.ts` — fix Gmail
once and everything works.

## Daily quotas

| Account type | Daily send limit |
|---|---|
| Free Gmail | 500 |
| Google Workspace (paid) | 2,000 |

For Paul's launch (24 waitlist subscribers), free Gmail is plenty. If the
audience grows past 500 subscribers, switch to Workspace or move to a
dedicated provider (Resend, SendGrid, Postmark).
