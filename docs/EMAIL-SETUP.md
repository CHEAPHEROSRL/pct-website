# Email Setup — Complete Walkthrough

This is a self-contained, start-to-finish guide for getting **two-way
email** working on `yeschapter.com`:

- **Inbound:** When someone replies to a website-sent email, the reply
  forwards to Paul's real inbox (`paul@dreamingforaliving.com`) so he
  can read it.
- **Outbound:** The website sends notifications, magic links, weekly
  updates, etc. as `paul@yeschapter.com` via the Gmail API.

**Scenario this is written for:**

- The domain `yeschapter.com` lives at **Namecheap** (and stays there)
- You manage Namecheap's DNS panel
- Paul has an existing Google Workspace mailbox at
  `paul@dreamingforaliving.com` and wants to keep being able to send
  manually as `paul@yeschapter.com` from his Gmail "Send mail as"
  feature
- Paul is on the trail with **mobile-only** access. His total time
  commitment for this entire setup is ~2 minutes (one OAuth tap, plus
  optionally 5 minutes if we add DKIM)
- You set up everything else on your own laptop using your personal
  Google account (`ciocanraul@gmail.com` or similar)

**Total cost: $0/month forever.** No new subscriptions, no service
changes, no domain migrations.

**Total time:** ~30–40 minutes for you, ~2 minutes for Paul.

---

## What you'll end up with

### Inbound (Namecheap email forwarding)
One forwarding rule in Namecheap → `paul@yeschapter.com` →
`paul@dreamingforaliving.com`. Replies land in his real inbox. **No
mailbox to buy.** Namecheap's MX records are already pointing at their
free forwarding service — we just add the rule.

### Outbound (Google Cloud + Gmail API)
Four environment variables in Vercel:

| Variable | What it is | Example |
|---|---|---|
| `GMAIL_CLIENT_ID` | OAuth2 client ID from Google Cloud Console | `123456789-abc...apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | OAuth2 client secret from Google Cloud Console | `GOCSPX-abc123...` |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token (Paul's one-tap output) | `1//04abc123...` |
| `EMAIL_FROM` | Sender display string | `YesChapter <paul@yeschapter.com>` |

The website's existing email code in `src/lib/email.ts` reads these
automatically — no code changes needed.

---

## How this works in plain language

There are two completely separate problems that share a domain name:

### Receiving (inbound)
Mail to `paul@yeschapter.com` needs to land somewhere a human can read.
**Namecheap's free email forwarding** handles this for us. The MX
records on `yeschapter.com` already point to Namecheap's mail servers
(`eforward1-5.registrar-servers.com`), so all we need to do is add a
**rule inside Namecheap's panel** that says "anything sent to
`paul@yeschapter.com`, forward to `paul@dreamingforaliving.com`".

That's it — no third-party service, no nameserver changes, no extra
DNS records needed for forwarding to work.

### Sending (outbound)
The website needs to send mail **as** `paul@yeschapter.com`. This is
where **Google's Gmail API + OAuth2** comes in.

Google has a system called **OAuth** where any app can ask permission
to do something on a user's behalf. The user clicks "Allow" once, and
from that moment on the app is allowed to do **only that one specific
thing** — never the password, never the whole account.

We're setting up the website as an "app" that asks Paul for **one very
narrow permission — `gmail.send`**. That's the only thing it can ever
do: send email as `paul@yeschapter.com`. It cannot:

- Read his inbox
- Delete or modify any emails
- See his contacts, calendar, or Drive
- Change anything else on his account

When Paul taps Allow, Google generates a **refresh token** — a long
string that proves "Paul said yes once" — and we store it as a Vercel
environment variable. The website uses it to send mail from then on,
without ever bothering Paul again. Paul can revoke it any time at
[myaccount.google.com/permissions](https://myaccount.google.com/permissions).

**Crucially:** the Google Cloud project lives on YOUR personal Google
account. It does NOT need to be on Paul's Workspace. We just add Paul
as a "Test User" so his account is allowed to consent to your app.

### Why these two don't conflict

- Adding Namecheap's email forwarding doesn't affect outbound sending
  through Gmail API (different infrastructure)
- Adding Gmail API outbound doesn't affect Namecheap forwarding
  (different infrastructure)
- Paul's existing "Send mail as paul@yeschapter.com" from his phone
  keeps working because it uses his Workspace's SMTP relay, which
  doesn't depend on any of this
- The only shared piece is the **SPF record** on `yeschapter.com`,
  which we'll expand to authorise both Namecheap (for forwarding
  bounce reports) and Google (for the website's outbound)

---

# PART 1 — INBOUND (Namecheap forwarding) ⏱️ ~5 minutes

This part fixes the bounce-back you saw earlier (`Relay access denied`)
and makes replies to website emails actually reach Paul.

## Step 1.1 — Add the forwarding rule in Namecheap

1. Log into Namecheap
2. **Domain List** → click **MANAGE** next to `yeschapter.com`
3. Look for the **Mail Settings** section/dropdown — confirm it shows
   **Email Forwarding** (it already does, that's why this works)
4. Below that, find the **REDIRECT EMAIL** table (or **Forwarding**
   section, depending on Namecheap's UI version)
5. Click **+ ADD FORWARDER** (or the equivalent button)
6. Fill in:
   - **Alias / "From":** `paul`
   - **Forward to / "Forwards to":** `paul@dreamingforaliving.com`
7. Click **Save Changes** (or the green checkmark)

✅ Checkpoint: the row `paul → paul@dreamingforaliving.com` now appears
in the redirect email table.

## Step 1.2 — Test the forward

1. From your personal Gmail (`ciocanraul@gmail.com`), send a fresh
   email to `paul@yeschapter.com` with subject "Forward test"
2. Wait ~30 seconds
3. **Ask Paul** to check his `paul@dreamingforaliving.com` inbox on
   his phone
4. He should see your test email in his inbox

✅ Checkpoint: Paul receives the test email. **Inbound is now working
forever** — no further action needed unless you want to add a second
forwarding alias later (e.g. `info@yeschapter.com` → Paul, etc.).

If the test email doesn't arrive within ~5 minutes:
- Check Paul's spam folder
- Re-confirm the forwarding rule was saved in Namecheap (the row is
  still there in the redirect table)
- DNS propagation: usually instant for forwarding rules, but can take
  up to an hour the very first time

---

# PART 2 — SPF (add ONE new TXT record) ⏱️ ~3 minutes

This step authorises Google's mail servers to send mail **as**
`yeschapter.com`. Without it, the website's Gmail-API-sent emails
will land in spam folders or be rejected entirely.

## Important context first

When **Mail Settings = Email Forwarding** in Namecheap, Namecheap
automatically publishes a hidden SPF record that authorises their own
mail forwarders. You won't see it in the **Advanced DNS** panel
(because Namecheap manages it behind the scenes), but it's there in
the actual DNS — you can verify with:

```
nslookup -type=txt yeschapter.com
```

You'll see `v=spf1 include:spf.efwd.registrar-servers.com ~all` even
though no SPF row appears in the Namecheap panel.

**To add Google's SPF authorisation, you add a NEW TXT record in the
panel that REPLACES Namecheap's auto-injected one.** Once you add a
manual SPF row, Namecheap stops auto-injecting theirs and uses yours.
This means your manual SPF record must include BOTH the Namecheap
forwarders AND Google — otherwise inbound forwarding will break.

## Step 2.1 — Add a new TXT record in Namecheap

1. Same domain in Namecheap → click the **Advanced DNS** tab at the top
2. Click **+ ADD NEW RECORD**
3. Choose record type: **TXT Record**
4. Fill in:
   - **Host:** `@`
   - **Value:** Paste exactly this (one line, no line breaks):
     ```
     v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com ~all
     ```
   - **TTL:** Automatic (or 1 min for fast propagation)
5. Save (green checkmark)

✅ Checkpoint: a new TXT row appears in the HOST RECORDS table with
host `@` and the value above.

⚠️ **Important rules about SPF:**

- A domain can have **only ONE** SPF record (one starting with
  `v=spf1`). The Google site verification TXT record (the one
  starting with `google-site-verification=...`) is a DIFFERENT TXT
  record and is allowed to coexist — DO NOT delete it.
- Your panel will now have **two TXT records both with host `@`**:
  one for the Google verification, one for SPF. That's correct.
- If Namecheap shows a warning about "duplicate SPF" or similar, it
  means you already had an SPF row — in that case **edit** the
  existing one to match the value above instead of adding a new one.

## Step 2.2 — Verify the SPF change

Wait ~5–10 minutes for DNS to propagate, then either:

**Option A — terminal:**
```
nslookup -type=txt yeschapter.com
```

**Option B — browser:** open https://mxtoolbox.com/spf.aspx and enter
`yeschapter.com`.

You should see your NEW SPF value containing both
`spf.efwd.registrar-servers.com` AND `_spf.google.com`. If you still
see the old single-include value, wait another 10 minutes.

If MXToolbox flags any error, paste the error to me — I'll fix it.

## Step 2.3 — Verify inbound forwarding STILL works

This is critical because we just changed SPF, which affects mail
authentication. Re-test the forward from Step 1.2:

1. From `ciocanraul@gmail.com`, send a fresh email to
   `paul@yeschapter.com` with subject "SPF test"
2. Wait ~30 seconds
3. Confirm Paul sees it in his `paul@dreamingforaliving.com` inbox

✅ Checkpoint: forwarding still works after the SPF update.

If forwarding broke (mail to `paul@yeschapter.com` is no longer
arriving), it means Namecheap's forwarders are now failing SPF
checks — almost always because there's a typo in your manual SPF
value. Re-check that the value is exactly:
```
v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com ~all
```
No extra spaces, no missing colons, no missing tilde before `all`.

---

# PART 3 — DKIM (optional but strongly recommended) ⏱️ ~5 min for Paul

DKIM is a cryptographic signature that proves an email **really** came
from the domain it claims to be from. Without DKIM:
- The website's emails will still send
- They have a **higher chance** of landing in Gmail/Outlook spam folders
- Some strict providers may reject them entirely

With DKIM:
- Near-perfect deliverability
- Inbox placement, not spam folder

**This step is the only one that requires admin.google.com access**,
which Paul has but you don't. If Paul is willing to spend 5 minutes,
do it. If not, skip — the site will still work, just with slightly
worse deliverability.

## Step 3.1 — Send Paul this message

> Hey mate, one optional thing for the email setup. Adds ~5 minutes
> on your end but significantly improves the chance that website
> emails land in inboxes instead of spam folders. Want to do it?
>
> If yes:
>
> 1. Open admin.google.com on your phone (sign in as
>    paul@dreamingforaliving.com — you should already be Super Admin
>    of your Workspace)
> 2. Tap the menu (☰) → **Apps** → **Google Workspace** → **Gmail**
> 3. Scroll down and tap **Authenticate email** (sometimes called
>    "Email authentication" or "DKIM")
> 4. From the domain dropdown, select **yeschapter.com**
> 5. Tap **Generate new record** (use the default 2048-bit key)
> 6. Tap **Generate**
> 7. Google shows you two values:
>    - **DNS Host name (TXT record name)** — looks like
>      `google._domainkey` or `google._domainkey.yeschapter.com`
>    - **TXT record value** — a very long string starting with
>      `v=DKIM1; k=rsa; p=MII...` (will wrap across multiple lines)
> 8. Copy BOTH values and send them to me. Don't tap "Start
>    authentication" yet — I need to add the DNS record first, then
>    you tap that button.

## Step 3.2 — Add the DKIM record to Namecheap

After Paul sends you the two values:

1. Namecheap → yeschapter.com → **Advanced DNS** tab
2. **Add New Record** → type **TXT Record**
3. **Host:** the DNS host name Paul sent you. Namecheap usually wants
   it WITHOUT the `.yeschapter.com` part — so if Paul sent you
   `google._domainkey.yeschapter.com`, you enter just `google._domainkey`
4. **Value:** the long `v=DKIM1; k=rsa; p=MII...` string Paul sent
   you. Paste the WHOLE thing on one line — Namecheap accepts long
   TXT values, no need to split.
5. **TTL:** Automatic (or 1 min for fast propagation)
6. Save

## Step 3.3 — Tell Paul to activate DKIM in admin.google.com

Wait ~10 minutes for DNS to propagate, then:

> OK, the DNS record is in. Now go back to admin.google.com → Apps →
> Gmail → Authenticate email → yeschapter.com, and tap **Start
> authentication**. You should see "Authenticating email — it may
> take up to 48 hours" turn into "Email authenticated" within a few
> minutes (usually instant).

✅ Checkpoint: Google admin shows "Authenticated" status next to
`yeschapter.com`.

---

# PART 4 — OUTBOUND (Google Cloud + Gmail API) ⏱️ ~25 min for you, 60 sec for Paul

This is the main event. We set up the website's ability to send mail
**as** `paul@yeschapter.com` via Gmail API.

## Step 4.1 — Create the Google Cloud project (on YOUR account)

1. Open https://console.cloud.google.com
2. Sign in **as your own personal Google account** (e.g.
   `ciocanraul@gmail.com`). **NOT as Paul.** The project lives on your
   account, that's deliberate.
3. At the top of the page, click the project dropdown
4. Click **New Project** (top right of the popup)
5. Project name: `YesChapter Email`
6. Leave organisation as default
7. Click **Create**
8. After ~10 seconds you'll get a notification that the project is
   ready. Click **Select Project** in that notification (or use the
   project dropdown to switch to `YesChapter Email`)

✅ Checkpoint: top of the screen shows `YesChapter Email`.

## Step 4.2 — Enable the Gmail API

1. Left sidebar → **APIs & Services** → **Library**
2. Search bar: `Gmail API`
3. Click the **Gmail API** result (the one by Google)
4. Click the blue **Enable** button
5. Wait ~5 seconds. You'll be redirected to the Gmail API overview
   page automatically.

✅ Checkpoint: page header says "Gmail API" with a "Manage" button.

## Step 4.3 — Configure the OAuth consent screen

This is where you tell Google what your "app" is called and add Paul
as an authorised test user.

1. Left sidebar → **APIs & Services** → **OAuth consent screen**
2. User type: select **External** → click **Create**
3. **App information**:
   - App name: `YesChapter Email`
   - User support email: select your own email from the dropdown
4. Skip **App logo** (optional)
5. Skip **App domain** section
6. Skip **Authorised domains** (we're not using Google Sign-In)
7. **Developer contact information**: enter your own email
8. Click **Save and Continue**
9. **Scopes** step: click **Save and Continue** (don't add scopes here
   — we'll add them in OAuth Playground later)
10. **Test users** step: click **Add Users**, type
    `paul@yeschapter.com`, press Enter, click **Add**. Then
    **Save and Continue**.
    - This is the critical step. By adding Paul as a test user, his
      account is allowed to consent to your app even though the
      project lives on your account.
11. **Summary** step: click **Back to Dashboard**

Now **publish the app** to prevent the refresh token from expiring
after 7 days:

12. Back on the OAuth consent screen, find the **Publishing status**
    section
13. Click **Publish App**
14. A popup appears. Click **Confirm**

⚠️ **"Publish App" sounds scary but it's harmless.** It changes the
app from "Testing" mode (7-day token expiry) to "In production" mode
(permanent tokens). Because we only use the `gmail.send` scope (which
Google considers non-sensitive), this does NOT require Google
verification or any review.

✅ Checkpoint: Publishing status shows **In production**.

## Step 4.4 — Create OAuth 2.0 credentials

1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `YesChapter Web Client`
5. Skip **Authorised JavaScript origins**
6. **Authorised redirect URIs** → click **+ Add URI** → paste exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
7. Click **Create**

A popup appears titled **OAuth client created** with two values:
- **Your Client ID** — long string ending in
  `.apps.googleusercontent.com`
- **Your Client Secret** — shorter string starting with `GOCSPX-`

8. **Copy both values somewhere safe** (a temporary text file).
9. You can also click **Download JSON** as a backup.
10. Close the popup.

✅ Checkpoint: Credentials page lists `YesChapter Web Client` under
"OAuth 2.0 Client IDs". You have the Client ID and Client Secret saved.

## Step 4.5 — Get Paul's refresh token (his only required action)

This is the part that needs Paul. **Total time on his end: ~60 seconds.
Mobile phone only.**

### Step 4.5a — Send Paul this exact message

Replace `[INSERT URL]` with the OAuth Playground URL after building it
(see "Building the URL" below the message):

> Hey mate, quick 60-second job, no app install needed — just your
> phone browser.
>
> I'm wiring up the website to send emails as paul@yeschapter.com
> (welcome notifications, weekly updates, magic-link logins, etc.).
> Google needs **you** to tap "Allow" once on a permission screen so
> the website is authorised to send mail on your behalf. Three things
> to know first:
>
> 1. The permission is **narrow** — just `gmail.send`. It can NEVER
>    read your inbox, delete emails, or touch anything else. Only send.
> 2. You can **revoke it any time** at myaccount.google.com/permissions
>    (look for "YesChapter Email").
> 3. If you see a warning that says "Google hasn't verified this app"
>    — that's normal. Tap **Advanced → Go to YesChapter Email
>    (unsafe)**. It's not actually unsafe, that's just Google's
>    standard warning for any app that hasn't paid for Google's
>    verification process.
>
> **Steps:**
>
> 1. Tap this URL: `[INSERT URL]`
> 2. Sign in with **paul@yeschapter.com** (sign out of your other
>    Google account first if you need to)
> 3. You'll see "Google hasn't verified this app" → tap **Advanced**
>    → tap **Go to YesChapter Email (unsafe)**
> 4. You'll see a permission screen "YesChapter Email wants access
>    to: Send email on your behalf" → tap **Allow**
> 5. You'll be redirected to the OAuth Playground developer page. On
>    the left side under "Step 2" you'll see a button **"Exchange
>    authorization code for tokens"** — tap it.
> 6. On the right side a field called **"Refresh token"** appears
>    with a long string starting with `1//`. **Copy that whole
>    string** (long press → Select All → Copy) and paste it back to me.
> 7. Done. Don't share the refresh token with anyone else — it's the
>    equivalent of a long-lived "Paul said yes" certificate.
>
> Cheers — once I have that token, the website can send as you forever
> and you never have to touch this again.

### Building the URL

The URL Paul taps has your Client ID and Client Secret baked into it
so he doesn't have to configure anything. Build it like this:

```
https://developers.google.com/oauthplayground/#step1&scopes=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&useDefaultOauthCred=unchecked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fv2%2Fauth&oauthTokenEndpointValue=https%3A%2F%2Foauth2.googleapis.com%2Ftoken&oauthClientId=YOUR_CLIENT_ID_HERE&oauthClientSecret=YOUR_CLIENT_SECRET_HERE&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&prompt=consent&response_type=code&wrapLines=on
```

Replace `YOUR_CLIENT_ID_HERE` with your Client ID and
`YOUR_CLIENT_SECRET_HERE` with your Client Secret. URL-encoding isn't
needed for typical values (Google's IDs and secrets don't contain URL-
unsafe characters).

**Easier alternative:** just paste the Client ID + Secret into your
chat with the dev assistant and ask for the URL to be built. The
Client ID is fine to share; the Secret is sensitive but you can
rotate it after the setup is done if you want.

⚠️ **The refresh token only appears once.** If Paul loses it before
sending it to you, he just goes back to the URL and does the flow
again — Google generates a new one.

## Step 4.6 — Add the variables to Vercel

1. Open https://vercel.com/raul-ciocans-projects/pct-website/settings/environment-variables
2. For each variable below, click **Add New**, select **Production**
   environment (and Preview/Development if you want them locally too):

| Name | Value |
|---|---|
| `GMAIL_CLIENT_ID` | (from Step 4.4) |
| `GMAIL_CLIENT_SECRET` | (from Step 4.4) |
| `GMAIL_REFRESH_TOKEN` | (from Paul, Step 4.5) |
| `EMAIL_FROM` | `YesChapter <paul@yeschapter.com>` |

3. After adding all four, **redeploy** so the new env vars take
   effect. Either:
   - Vercel **Deployments** tab → latest deployment → ••• menu →
     **Redeploy**
   - Or push any commit to master (Vercel auto-deploys on every push)

4. Wait for the deploy to finish (~2 minutes). Watch the Deployments
   tab until the new deploy shows the green "Ready" badge.

✅ Checkpoint: a fresh production deploy is live with all four env
vars.

## Step 4.7 — Test it from the admin panel

### Test A — Sending

1. Open https://yeschapter.com/admin → log in
2. Click the **Settings** tab
3. Scroll to the **EMAIL NOTIFICATIONS (GMAIL)** card
4. In the **SEND A TEST EMAIL** box, the field is pre-filled with
   `ciocanraul@gmail.com`. Change it if you want.
5. Click the orange **SEND TEST** button
6. Wait ~5–10 seconds. A green or red banner appears below the button.

**If green** ("Test email sent to..."):
- Check the inbox of that address (and spam folder)
- Email should arrive within 30 seconds
- Subject: `Day 0 — Test: The Night Before the PCT`
- From: `YesChapter <paul@yeschapter.com>`

✅ Outbound is working.

### Test B — Receiving (replies)

1. With the test email still open in your `ciocanraul@gmail.com`
   inbox, hit **Reply**
2. Type "Reply test" and send
3. **Ask Paul** to check his `paul@dreamingforaliving.com` inbox
4. He should see your reply within 30 seconds

✅ Inbound forwarding is working. **You're done. Forever.**

---

## Troubleshooting

### Inbound test (Step 1.2) doesn't arrive
- Wait up to 5 minutes for the first time (DNS caches)
- Check Paul's spam folder
- Confirm the forwarding rule is still saved in Namecheap
- Check that **Mail Settings** in Namecheap is set to **Email
  Forwarding** (not Custom MX or No Email Service)

### "Email service not configured" (admin SEND TEST)
- The Gmail env vars aren't being read. Check that all four are added
  in Vercel with the EXACT names (case-sensitive)
- Environment scope must include **Production**
- You must redeploy after adding env vars (env var changes don't
  apply to existing deployments)

### "invalid_grant" / "Token has been expired or revoked"
- Refresh token is no longer valid. Most common causes:
  - Paul changed his Google Workspace password → tokens are revoked
  - The OAuth consent screen is still in "Testing" mode → go back to
    Step 4.3 step 12 and click **Publish App**
  - The token was manually revoked at
    myaccount.google.com/permissions
- **Fix:** Have Paul redo Step 4.5 to get a fresh refresh token,
  update `GMAIL_REFRESH_TOKEN` in Vercel, redeploy.

### "Insufficient Permission" / "Request had insufficient authentication scopes"
- The OAuth scope is wrong. The URL in Step 4.5 includes `gmail.send`
  — make sure that's still in the URL when Paul taps it. Redo Step
  4.5 with the correct URL.

### "Delegation denied for paul@yeschapter.com"
- Means `paul@yeschapter.com` isn't a real Workspace mailbox under
  Paul's account, only an alias. The Gmail API can't authenticate
  directly as an alias.
- **Fix:** in `src/lib/email.ts`, the `From` header needs to use the
  canonical address (`paul@dreamingforaliving.com`) with display name
  `Paul Barry` and `Reply-To: paul@yeschapter.com`. The recipient
  sees "from Paul Barry <paul@dreamingforaliving.com>" but replies
  go to `paul@yeschapter.com` and forward through Namecheap to Paul's
  inbox. Less ideal aesthetically but functionally identical.
- **Alternative fix:** Paul converts `yeschapter.com` to a proper
  Workspace secondary domain in admin.google.com → Domains → Manage
  domains. Cleaner long-term.

### Email lands in spam
- Add the DKIM record (Part 3) — that's exactly what it's for
- Mark the test email as "Not spam" once and Gmail learns
- Send a few more — sender reputation builds with volume

### "Email authentication failed" in Google admin (Part 3)
- DNS hasn't propagated yet. Wait 15 minutes and try again
- Verify the TXT record is exactly correct in Namecheap (no extra
  spaces, no truncation)
- Use https://mxtoolbox.com/dkim.aspx to verify the record is
  publicly visible

---

## How emails are used in production

Once Step 4.7 passes, all of these work automatically:

| Trigger | Recipients | Code |
|---|---|---|
| New journal post published | All waitlist subscribers + pledgers (`emailPreference="all"`) | `/api/emails/new-post` |
| Weekly update (cron, Mondays 15:00 UTC) | All pledgers | `/api/emails/weekly` |
| Milestone reached (cron, daily 09:00 UTC) | All pledgers | `/api/emails/milestone` |
| Honour reminders (cron, daily 12:00 UTC) | Pledgers post-hike | `/api/emails/honor` |
| Welcome series (cron, daily 08:00 UTC) | New pledgers (day 1 + day 3) | `/api/emails/welcome` |
| Magic link login | The pledger requesting login | `/api/auth/magic` |

All routes share the same `send()` function in `src/lib/email.ts`.

---

## Daily quotas

| Account type | Daily send limit |
|---|---|
| Free Gmail (e.g. `@gmail.com`) | 500 emails/day |
| Google Workspace (`paul@dreamingforaliving.com`) | 2,000 emails/day |

For Paul's launch (24 waitlist subscribers + a handful of pledgers),
the Workspace 2,000/day quota is plenty. If the audience grows past
~1,500 recipients, batch sends across multiple days or move to a
dedicated transactional provider (Resend, Postmark, SendGrid).

---

## Replies — confirmed working after this setup

When someone replies to a website email, the reply goes to whatever
address is in the `From` header (which is `paul@yeschapter.com`).
That address now forwards through Namecheap to
`paul@dreamingforaliving.com`, which is Paul's real Workspace inbox.
He reads replies on his phone the same way he reads any other email.

---

## Things Paul keeps doing the way he always has

Nothing in this setup changes Paul's existing flows:

- ✅ He can still send mail manually as `paul@yeschapter.com` from
  his Gmail "Send mail as" feature (uses Workspace SMTP, unaffected)
- ✅ His `paul@dreamingforaliving.com` mailbox is unchanged
- ✅ His existing DNS records on `dreamingforaliving.com` are unchanged
- ✅ The Workspace Super Admin role and any users on his tenant are
  unchanged
- ✅ He can revoke the website's permission any time without affecting
  his own ability to send

---

## When you're done — Paul doesn't need to touch this again

Once Step 4.7 passes, the refresh token works **forever** as long as:

- The Google Cloud project (`YesChapter Email`) on your account stays
  active and isn't deleted
- The OAuth consent screen stays "In production" (not reverted to
  Testing)
- The OAuth client credentials in Step 4.4 aren't deleted
- Paul doesn't manually revoke "YesChapter Email" from
  myaccount.google.com/permissions

Paul has zero ongoing involvement. The website sends as him on
auto-pilot, and replies forward to his real inbox forever.
