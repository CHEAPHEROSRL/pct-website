# Email Setup — Complete Walkthrough

This is a self-contained, start-to-finish guide for setting up email
notifications on yeschapter.com using Gmail API + Google Cloud OAuth2.

**Scenario this is written for:** You alone, after Paul grants you access to
his `paul@yeschapter.com` Google Workspace account. No back-and-forth with
Paul needed once you have the credentials.

**Time estimate:** 25–35 minutes start to finish.

---

## What you'll end up with

Four environment variables added to Vercel (Production scope):

| Variable | What it is | Example |
|---|---|---|
| `GMAIL_CLIENT_ID` | OAuth2 client ID from Google Cloud Console | `123456789-abc...apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | OAuth2 client secret from Google Cloud Console | `GOCSPX-abc123...` |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token from OAuth Playground | `1//04abc123...` |
| `EMAIL_FROM` | Sender display string | `YesChapter <paul@yeschapter.com>` |

Once those are set in Vercel, every email feature on the site works
automatically — no code changes needed.

---

## Before you start — what to ask Paul for

Send Paul this exact message:

> "Hey Paul — to set up the email notifications, I need temporary access to
> your `paul@yeschapter.com` Workspace account. The cleanest way is to add
> me as a delegated user OR just share the password for ~30 minutes while I
> do the OAuth setup. Once I'm done you can change the password and I'll be
> locked out. I won't read any of your emails — I just need to authorize a
> Google Cloud project to send on behalf of that address."

You only need access to that account during **Step 5** below (the OAuth
Playground sign-in). Once you have the refresh token, you don't need access
to the mailbox anymore — Google's OAuth refresh token lets the site send
mail forever (or until revoked) without re-authentication.

---

## Step 1 — Create the Google Cloud project

1. Open https://console.cloud.google.com
2. Sign in **as `paul@yeschapter.com`** (this matters — the project needs to
   live under that account so the OAuth consent screen can authorize that
   exact address)
3. At the top of the page, click the project dropdown (it might say
   "Select a project" or show another project name)
4. In the popup, click **New Project** (top right)
5. Project name: `YesChapter Email`
6. Leave organization as default (or YesChapter if there is one)
7. Click **Create**
8. After ~10 seconds you'll get a notification that the project is ready.
   Click the **Select Project** link in that notification (or use the
   project dropdown again to switch to `YesChapter Email`)

✅ Checkpoint: top of the screen should now say `YesChapter Email`.

---

## Step 2 — Enable the Gmail API

1. In the left sidebar, hover over **APIs & Services** → click **Library**
2. In the search bar, type: `Gmail API`
3. Click the **Gmail API** result (the one by Google)
4. Click the blue **Enable** button
5. Wait ~5 seconds for it to enable. You'll be redirected to the Gmail API
   overview page automatically.

✅ Checkpoint: page header says "Gmail API" and there's a "Manage" button
where the Enable button used to be.

---

## Step 3 — Configure the OAuth consent screen

1. Left sidebar → **APIs & Services** → **OAuth consent screen**
2. User type: select **External** → click **Create**
3. **App information** section:
   - App name: `YesChapter`
   - User support email: select `paul@yeschapter.com` from the dropdown
4. **App logo**: skip (optional)
5. **App domain** section: skip all fields
6. **Authorized domains**: skip (we're not using Google Sign-In)
7. **Developer contact information**: enter `paul@yeschapter.com` (or your
   own email — this is just where Google sends notices about the project)
8. Click **Save and Continue**
9. **Scopes** step: click **Save and Continue** (don't add any scopes here —
   we'll add them in OAuth Playground later)
10. **Test users** step: click **Add Users**, type `paul@yeschapter.com`,
    press Enter, click **Add**. Then **Save and Continue**
11. **Summary** step: click **Back to Dashboard**

Now **publish the app** (this prevents the refresh token from expiring after
7 days):

12. Back on the OAuth consent screen page, find the **Publishing status**
    section
13. Click **Publish App**
14. A confirmation popup appears. Click **Confirm**

⚠️ **Don't worry** — "Publish App" sounds scary but it doesn't actually
publish anything publicly. It just changes the app from "Testing" mode
(7-day token expiry) to "In production" mode (permanent tokens). Because
we're only using the `gmail.send` scope (which Google considers
non-sensitive), this does NOT require Google verification or any review.

✅ Checkpoint: Publishing status now shows **In production**.

---

## Step 4 — Create OAuth 2.0 credentials

1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** at the top → **OAuth client ID**
3. Application type: **Web application**
4. Name: `YesChapter Web Client`
5. Skip **Authorized JavaScript origins** (leave empty)
6. **Authorized redirect URIs** → click **+ Add URI** → paste exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
7. Click **Create**

A popup appears titled **OAuth client created** with two values:
- **Your Client ID** — long string ending in `.apps.googleusercontent.com`
- **Your Client Secret** — shorter string starting with `GOCSPX-`

8. **Copy both values somewhere safe** (a temporary text file). You'll need
   them in Step 5 and Step 6.
9. You can also click **Download JSON** as a backup
10. Close the popup

✅ Checkpoint: the Credentials page now lists `YesChapter Web Client` under
"OAuth 2.0 Client IDs".

---

## Step 5 — Get a refresh token from OAuth Playground

This is the step where you actually need to be signed in as
`paul@yeschapter.com`.

1. Open a new tab → https://developers.google.com/oauthplayground
2. **Click the gear icon** at the top right (it's labeled "OAuth 2.0
   configuration")
3. In the panel that opens:
   - **Tick** the checkbox **Use your own OAuth credentials**
   - **OAuth Client ID**: paste the Client ID from Step 4
   - **OAuth Client secret**: paste the Client Secret from Step 4
4. Click **Close** (or click the gear icon again to close the panel)
5. In the **left sidebar** of the playground, scroll down through the API
   list until you find **Gmail API v1**
6. Click **Gmail API v1** to expand it
7. Find and **tick** this scope (only this one):
   ```
   https://www.googleapis.com/auth/gmail.send
   ```
8. Click **Authorize APIs** (the blue button below the scope list)
9. A Google sign-in popup appears. **Sign in as `paul@yeschapter.com`**
   (this is the critical step — whichever account signs in here is the
   account whose mail will be sent)
10. You'll see a warning **"Google hasn't verified this app"** — click
    **Advanced** → **Go to YesChapter (unsafe)**. This is fine; we
    published the app under our own account, so we know it's safe.
11. On the consent screen, click **Continue** to grant the
    `gmail.send` permission
12. You're redirected back to the OAuth Playground. The left side now shows
    **Step 2** with an **Authorization code** value
13. Click the **Exchange authorization code for tokens** button
14. The right side now shows two values:
    - **Refresh token** — long string starting with `1//`
    - **Access token** — also a long string (we don't need this)
15. **Copy the Refresh token** to your safe place (with the Client ID and
    Client Secret from Step 4)

⚠️ **The refresh token only appears once.** If you lose it, you'll have to
redo this step. Save it now.

✅ Checkpoint: you have all three values saved:
- `GMAIL_CLIENT_ID` (from Step 4)
- `GMAIL_CLIENT_SECRET` (from Step 4)
- `GMAIL_REFRESH_TOKEN` (from Step 5)

---

## Step 6 — Add the variables to Vercel

1. Open https://vercel.com/raul-ciocans-projects/pct-website/settings/environment-variables
2. For each of the four variables below, click **Add New**, fill in the
   form, and select **Production** (and optionally Preview + Development if
   you want them to work locally too):

| Name | Value |
|---|---|
| `GMAIL_CLIENT_ID` | (paste from Step 4) |
| `GMAIL_CLIENT_SECRET` | (paste from Step 4) |
| `GMAIL_REFRESH_TOKEN` | (paste from Step 5) |
| `EMAIL_FROM` | `YesChapter <paul@yeschapter.com>` |

3. After adding all four, you need to **redeploy** so the new env vars take
   effect. Two ways:
   - **Easy:** go to the **Deployments** tab in the Vercel project, find
     the latest deployment, click the three-dot menu (•••) on the right,
     and click **Redeploy**. Confirm.
   - **Or:** push any new commit to the master branch (e.g. update a
     comment somewhere) — Vercel auto-deploys on every push.

4. Wait for the deploy to finish (~2 minutes). Watch the Deployments tab
   until the new deploy shows the green "Ready" badge.

✅ Checkpoint: a fresh production deploy is live and includes all four
new env vars.

---

## Step 7 — Test it from the admin panel

1. Open https://yeschapter.com/admin → log in (username `paul`,
   password is in your password manager)
2. Click the **Settings** tab
3. Scroll down to the **EMAIL NOTIFICATIONS (GMAIL)** card
4. In the **SEND A TEST EMAIL** box, the field is pre-filled with
   `ciocanraul@gmail.com`. Change it if you want to test a different
   address.
5. Click the orange **SEND TEST** button
6. Wait ~5–10 seconds. A green or red banner appears below the button.

**If you see a green banner** ("Test email sent to..."):
- Check the inbox of the address you used
- Also check the spam/junk folder
- The email should arrive within 30 seconds
- Subject: `Day 0 — Test: The Night Before the PCT`
- From: `YesChapter <paul@yeschapter.com>`

✅ **You're done!** All email features on the site now work.

**If you see a red banner**, the message tells you what's wrong. Common
errors and fixes are in the troubleshooting section below.

---

## Troubleshooting

### "Email service not configured"
The Gmail env vars aren't being read by the production server. Check:
- All four variables are added in Vercel **with the exact names** shown
  above (case-sensitive)
- The environment scope is **Production** (not just Preview)
- You triggered a redeploy AFTER adding the variables (env var changes
  don't apply to existing deployments)

### "invalid_grant" or "Token has been expired or revoked"
The refresh token is no longer valid. Most common causes:
- Paul changed his Google Workspace password → tokens are revoked
- The OAuth consent screen is still in "Testing" mode (7-day expiry) →
  go back to Step 3 and click **Publish App**
- The token was manually revoked at https://myaccount.google.com/permissions

**Fix:** redo Step 5 to get a fresh refresh token, then update the
`GMAIL_REFRESH_TOKEN` variable in Vercel and redeploy.

### "Insufficient Permission" or "Request had insufficient authentication scopes"
The OAuth scope is wrong. Make sure in Step 5 you ticked
`https://www.googleapis.com/auth/gmail.send` specifically — not
`gmail.readonly` or any other scope. Redo Step 5 with the correct scope.

### Email arrives but goes to spam
Normal for a brand new sending domain with no SPF/DKIM history. Mark it as
"Not spam" once and Gmail will learn. For long-term deliverability you'll
eventually want to set up SPF + DKIM + DMARC DNS records on the
yeschapter.com domain — that's a separate task and not blocking launch.

### Test send works but real new-post emails don't
Different code path. The new-post route also dedupes (won't send twice for
the same post). To force a re-send, clear the dedupe key in Redis:
`emails:newpost:<postId>` or just edit the post slightly to bump the ID.

---

## How emails are used in production

Once Step 7 passes, all of these work automatically:

| Trigger | Recipients | Code |
|---|---|---|
| New journal post published | All waitlist subscribers + pledgers (`emailPreference="all"`) | `/api/emails/new-post` |
| Weekly update (cron, Mondays 15:00 UTC) | All pledgers | `/api/emails/weekly` |
| Milestone reached (cron, daily 09:00 UTC) | All pledgers | `/api/emails/milestone` |
| Honor reminders (cron, daily 12:00 UTC) | Pledgers post-hike | `/api/emails/honor` |
| Welcome series (cron, daily 08:00 UTC) | New pledgers (day 1 + day 3) | `/api/emails/welcome` |
| Magic link login | The pledger requesting login | `/api/auth/magic` |

All routes share the same `send()` function in `src/lib/email.ts`. Once
Gmail is configured, everything just works.

---

## Daily quotas

| Account type | Daily send limit |
|---|---|
| Free Gmail (e.g. `@gmail.com`) | 500 emails/day |
| Google Workspace (`paul@yeschapter.com`) | 2,000 emails/day |

For Paul's launch (24 waitlist subscribers + a handful of pledgers), the
Workspace 2,000/day quota is plenty. If the audience grows past ~1,500
recipients, batch sends across multiple days or move to a dedicated
provider (Resend, Postmark, SendGrid).

---

## When you're done — give Paul access back

Once Step 7 passes, you no longer need access to `paul@yeschapter.com`. The
refresh token in Vercel handles all future authentication. Tell Paul he can:

1. Change his Workspace password back (or to a new one)
2. Remove you as a delegated user if applicable
3. Keep an eye on https://myaccount.google.com/permissions — the
   "YesChapter" OAuth app should appear there. Don't revoke it; that's the
   site's permission to send mail.

The token will keep working forever as long as:
- The Google Cloud project (`YesChapter Email`) stays active and not deleted
- The OAuth consent screen stays "In production" (not reverted to Testing)
- The OAuth client credentials in Step 4 aren't deleted
- Paul doesn't manually revoke the YesChapter app from the permissions page
