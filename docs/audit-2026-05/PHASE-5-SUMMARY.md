# Phase 5 — Email DNS (SPF / DKIM / DMARC)

**Status:** ✅ Audit complete — 2 critical user action items + 1 info note
**Scope:** Both domains (yeschapter.com brand + dreamingforaliving.com actual sender)

## Background

Per [Email Setup](../../C:/Users/User/.claude/projects/c--Users-User-Documents-pct-website/memory/project_email_setup.md):
- Mail is sent FROM `paul@dreamingforaliving.com` (the real Workspace mailbox)
- `paul@yeschapter.com` is a forwarding alias (Namecheap forwarder → dreamingforaliving)
- The brand-correct sender (`paul@yeschapter.com` in From) requires a Google Workspace "Send mail as" alias — not yet configured

So **email auth on dreamingforaliving.com is what matters most** right now. yeschapter.com email auth becomes critical once the send-as alias is in place.

## What's working ✅

### SPF (Sender Policy Framework)

| Domain | Record | Status |
|---|---|---|
| dreamingforaliving.com | `v=spf1 include:_spf.google.com ~all` | ✅ Good — authorizes Google to send, soft-fail anything else |
| yeschapter.com | `v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com ~all` | ✅ Good — authorizes Namecheap forwarder + Google |

Soft-fail (`~all`) is fine for the current transition phase. Could tighten to hard-fail (`-all`) later once you're confident no legit mail goes through unlisted servers.

### MX records

| Domain | MX | Status |
|---|---|---|
| dreamingforaliving.com | aspmx.l.google.com + alts | ✅ Google Workspace |
| yeschapter.com | eforward*.registrar-servers.com | ✅ Namecheap email forwarder |

## What's missing ❌

### DKIM (DomainKeys Identified Mail)

| Selector tested | dreamingforaliving | yeschapter |
|---|---|---|
| google._domainkey | ❌ not found | ❌ not found |
| default._domainkey | ❌ not found | ❌ not found |
| (six other common selectors) | ❌ not found | ❌ not found |

**🔴 DKIM is not configured on either domain.** This is consistent with the default Google Workspace setup — DKIM is opt-in, you have to manually enable it in the admin console and publish the generated TXT record.

Impact: every email sent from `paul@dreamingforaliving.com` lacks a cryptographic signature. Gmail, Outlook, Yahoo etc. will accept these emails (because SPF is present) but may flag them as lower-trust. Some volume thresholds will trigger spam folder placement without DKIM.

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

| Domain | _dmarc record | Status |
|---|---|---|
| dreamingforaliving.com | none found | ❌ Missing |
| yeschapter.com | none found | ❌ Missing |

**🔴 DMARC is missing on both domains.** Modern email senders (Gmail in particular since 2024) require DMARC for bulk senders. Without it:
- Mailbox providers have weaker guidance on handling spoofed mail claiming to be from these domains
- Your domain reputation suffers
- Emails are more likely to land in spam

## User action items (DNS changes — I cannot do these from here)

### 1. 🔴 Enable DKIM in Google Workspace for dreamingforaliving.com

1. Go to **https://admin.google.com**
2. Sign in with your Google Workspace super-admin account
3. **Apps → Google Workspace → Gmail → Authenticate email**
4. Select domain: **dreamingforaliving.com**
5. Click **Generate new record** (default 2048-bit key)
6. Google will give you a TXT record like:
   - **Host name:** `google._domainkey`
   - **Value:** `v=DKIM1; k=rsa; p=<long base64 public key>`
7. Add this TXT record at your DNS provider (Cloudflare / Namecheap / wherever dreamingforaliving.com DNS lives)
8. Wait ~5-30 min for DNS propagation
9. Go back to Google Admin → **Start authentication**
10. Verify with: `nslookup -type=TXT google._domainkey.dreamingforaliving.com 8.8.8.8`

### 2. 🔴 Add DMARC TXT record for dreamingforaliving.com

At your DNS provider for dreamingforaliving.com, add a new TXT record:

- **Host name:** `_dmarc`
- **Value (start with monitor-only):**
  ```
  v=DMARC1; p=none; rua=mailto:paul@dreamingforaliving.com; pct=100
  ```

**What `p=none` means:** "Monitor only — don't take action on failures, but send me aggregate reports." This is the safe starting point. After a week of reports landing in paul@dreamingforaliving.com, you'll see if any legit mail is failing alignment. Then tighten to:
- `p=quarantine` → "send failing mail to spam" (medium strictness)
- `p=reject` → "bounce failing mail entirely" (highest strictness; only after confidence)

**Don't skip straight to `p=reject`** — you'll bounce your own legit mail if anything is misaligned.

### 3. 🟡 Add DMARC TXT record for yeschapter.com (lower priority)

Same pattern, on yeschapter.com:

- **Host name:** `_dmarc`
- **Value:**
  ```
  v=DMARC1; p=none; rua=mailto:paul@dreamingforaliving.com; pct=100
  ```

Since no mail is currently SENT from `@yeschapter.com` (only forwarded), this is mostly anti-spoofing hygiene. Important once the send-as alias is set up.

### 4. 🟢 (Future) After DKIM + DMARC are live, run Mail-Tester

1. Send any test email from admin → ciocanraul@gmail.com
2. Compare the same kind of email sent to a fresh address at **https://mail-tester.com** (they give you a one-time inbox address)
3. They'll grade you 0–10 on deliverability — target 9+

## Summary

| Auth method | dreamingforaliving | yeschapter |
|---|---|---|
| SPF | ✅ | ✅ |
| DKIM | ❌ MISSING | ❌ MISSING |
| DMARC | ❌ MISSING | ❌ MISSING |

After the user fixes #1 + #2 above (~20 min of work in Google Admin + DNS), email deliverability will jump materially. Worth doing BEFORE the LinkedIn launch posts drive new traffic that might trigger waitlist signups → welcome emails.

## Time

- Estimated: 10 min
- Actual: ~15 min
