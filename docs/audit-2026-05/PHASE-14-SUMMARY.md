# Phase 14 — Admin Flow Testing (Token-Required)

**Status:** ✅ Complete — admin auth + UI verified working; 1 pending-deploy finding
**Constraint honored:** No real emails triggered. No destructive actions. Token used only in-memory during this session.

## What I tested

### 1. Bearer-token auth across admin API endpoints

Token: `pct-admin-fc39c8e9...` (Raul's value from `localStorage.pct-admin-token`).

| Endpoint | HTTP | Notes |
|---|---|---|
| `GET /api/admin/settings` | 200 ✅ | Full settings payload returned. Confirms admin auth working. |
| `GET /api/admin/waitlist-launch` | 200 ✅ | Returns `{recipientCount: 34, bulkEmailsEnabled: true, lock: null}` — exactly the expected pre-launch state |
| `GET /api/admin/pledges/list-all` | 200 ✅ | Returns `{summary, live, pending, listEntries}` shape |
| `GET /api/admin/sponsors` | 200 ✅ | Sponsors data |
| `GET /api/admin/contact` | 200 ✅ | Contact messages |
| `GET /api/admin/gmail-oauth/status` | 200 ✅ | `connected: true, email: paul@dreamingforaliving.com, tokenValid: true` — OAuth healthy |
| `GET /api/honor/stats` | 200 ✅ | `{honoredCount:0, pledgerCount:1, totalPledged:265, honorRate:0}` — correct pre-hike-finish state |
| `GET /api/admin/email-cron-status` | **404** ⚠️ | Endpoint added in commit a6ed437 — not yet deployed |
| `GET /api/admin/youtube-subscription` | **404** ⚠️ | Endpoint added in commit 40d63c9 — not yet deployed |

### 2. Admin SPA UI via Playwright

Injected token into localStorage, navigated `/admin`. Auto-login succeeded — page title rendered as "Admin Panel | YesChapter" (would have been generic site title if login flow broke). Header nav rendered correctly with all 9 tabs: TRACKER, JOURNAL, CHALLENGES, HONOR TRACKING, WAITLIST, EMAILS, SPONSORS, CONTACT, SETTINGS.

**Settings tab spot-check (full-page screenshot in `docs/audit-2026-05/baseline/screenshots/admin-settings.png`):**
- ✅ Trail Location Tracker panel renders correctly (Mile 200 / Mile 426.6 / progress bar — Paul's actual position)
- ✅ Email Notifications panel shows Gmail as connected
- ✅ Instagram Gallery panel shows Apify task ID
- ✅ AI Content Generation panel shows OpenAI as provider with `gpt-4o`
- ✅ YouTube Channel panel shows channel ID `UClTES1Ytr0HxUzilU-v2aFw`
- ✅ Hike Start Date field present
- ✅ Save Settings button present
- ✅ Data Management (Reset Pledges) panel present
- ⚠️ **Email Crons panel NOT visible** — confirms deploy delay (Phase 11 fix + this panel both in commit `a6ed437`, not yet live)

### 3. Console errors during admin navigation

| Page | Errors found |
|---|---|
| `/admin` (initial load via auto-login) | 1 — `401 on /api/admin/settings` — the EXACT race I fixed in Phase 11 |
| Settings tab (after navigation) | Same 401 from initial fetch — known, fixed in commit `a627ebc` |

**No other console errors.** No React #418 hydration error reproduced this session (which is good — but the page already loaded into a logged-in state, so the hydration path was different from a cold visit).

## Findings

### ✅ Confirmed working
- Admin Bearer-token authentication (verified end-to-end across 7 endpoints)
- Admin SPA hydration from localStorage token
- Gmail OAuth still healthy (post-rotation, post-token-rotation)
- Waitlist launch system primed correctly (lock null, 34 recipients, bulk emails enabled)
- AI provider correctly set to OpenAI
- All settings sections rendering

### ⚠️ Deploy lag (not a code bug)
The fixes from commits `a6ed437`, `c688269`, `40d63c9`, `a22cbf4`, `38b310a`, `0a7c4fe`, `e177307`, `37344a1`, `793b75b`, `a627ebc`, and `cc5953d` — none have rolled out to production yet. The live site is serving older code. This blocks live verification of:
- React #300 fix on `/supporters`
- 401 race fix on `/api/admin/settings`
- Security headers (Phase 2)
- `/contact` title fix
- `/foundations` title fix
- `/llms.txt` accessibility
- Email Crons admin panel + endpoints
- YouTube Subscribe admin button + endpoint
- last_sent timestamp fixes on welcome/milestone/honor crons

Once Vercel completes the deploy queue, all of these should activate without further code changes. The verification commands in [PHASE-12-SUMMARY.md](PHASE-12-SUMMARY.md) cover the recheck.

## What I did NOT do (constraint-honored)

- ❌ Did not click any "Send Now" button on email crons
- ❌ Did not trigger the waitlist launch
- ❌ Did not send test emails (admin Settings → Email Notifications has a test button — left alone)
- ❌ Did not modify any settings, pledges, sponsors, or contact statuses
- ❌ Did not trigger Instagram or YouTube sync
- ❌ Did not log token to any file or commit it
- ❌ Did not propagate the Apify token I saw in the settings response

Token was used in-memory only via Bash environment variables and Playwright localStorage. It is NOT in any git-tracked file.

## Token safety

The Bearer token `pct-admin-fc39c8e9...` is in this conversation transcript but nowhere else from my side. After audit completion you may:
- Leave it (it's already in Vercel env vars; this transcript doesn't change that)
- Rotate again if you'd like fresh (same process as Phase 14 token-rotation walkthrough — generate new token, paste into Vercel `ADMIN_AUTH_TOKEN`, redeploy)

## Time

- Estimated: 30 min
- Actual: ~20 min
