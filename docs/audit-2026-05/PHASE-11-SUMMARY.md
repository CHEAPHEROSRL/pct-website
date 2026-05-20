# Phase 11 — Known Bugs

**Status:** ✅ 4 of 5 bugs fixed (1 deferred with documented reason)

## Bug #1 — ✅ FIXED — React #300 infinite render loop on `/supporters`

**Severity:** 🔴 High (real user-visible bug, console-spamming)

**Root cause:** Rules-of-Hooks violation. `useMemo` was declared AFTER an early conditional return in `src/app/supporters/page.tsx`. When the pledger-gate condition was true the `useMemo` didn't run; when false it did. React saw inconsistent hook order between renders → throws #300 "Maximum update depth exceeded" trying to reconcile.

**Fix:** Moved the `useMemo` (and the comment explaining why) BEFORE the conditional early return. All hooks now declared in the same order every render. Build clean.

**File:** [src/app/supporters/page.tsx](src/app/supporters/page.tsx)

## Bug #2 — ⏭️ DEFERRED — React #418 hydration mismatch on `/admin`

**Severity:** 🟡 Medium (cosmetic console noise, page works)

**Investigation:** No Rules-of-Hooks issue (all hooks come before any early return). No direct `window`/`localStorage` access during render. No date-without-locale calls in initial render path. Headers/Footers not imported. Could not pinpoint exact element causing the mismatch without React's un-minified dev-mode error messages.

**Decision:** Deferred. The error is cosmetic — page functions correctly. Fix requires running `npm run dev`, opening admin in browser, and reading the un-minified React warning to locate the exact mismatching element. That's a focused 30-min debug session, not an audit-pace fix.

**Workaround if it becomes urgent:** wrap the entire return in a `hasMounted` guard (state defaults to false, useEffect flips to true after mount). Eliminates ALL hydration mismatches at cost of a tiny loading flash. Standard React escape hatch.

## Bug #3 — ✅ FIXED — 401 race on `/api/admin/settings` during auto-login

**Severity:** 🟡 Low (transient flash of error, resolves on retry)

**Root cause:** `fetchSettings` was wrapped in `useCallback(... [token])`. Inside the auto-login `useEffect`, `setToken(saved)` was scheduled but hadn't yet flushed to a new render. So the `fetchSettings` callback that was created BEFORE setToken still had the empty initial `token` in closure. When auto-login called `fetchSettings()`, the Bearer header was just `"Bearer "` → server correctly returned 401.

**Fix:** Made `fetchSettings` accept an optional `tokenOverride` parameter. Auto-login now calls `fetchSettings(saved)` with the fresh token, bypassing the stale closure.

**File:** [src/app/admin/page.tsx:706-721](src/app/admin/page.tsx#L706-L721) + [src/app/admin/page.tsx:357](src/app/admin/page.tsx#L357)

## Bug #4 — ✅ FIXED — Missing `last_sent` on welcome/milestone/honor crons

**Severity:** 🟢 Low (cosmetic — admin Email Crons panel showed "Never sent" forever)

**Root cause:** Only the weekly endpoint recorded its `last_sent` timestamp. The other three never wrote one, so the admin UI couldn't show when they last ran.

**Fix:** Added `await redis.set("emails:{which}:last_sent", Date.now())` to:
- [src/app/api/emails/welcome/route.ts](src/app/api/emails/welcome/route.ts) — at end of successful run
- [src/app/api/emails/milestone/route.ts](src/app/api/emails/milestone/route.ts) — after all three sub-sends complete
- [src/app/api/emails/honor/route.ts](src/app/api/emails/honor/route.ts) — at end of successful run

Recorded regardless of whether anything actually mailed (a "no eligible recipients" return is still a successful cron execution and should mark the panel timestamp).

## Bug #5 — ✅ FIXED in Phase 10 — `/contact` page title was generic

Handled in [PHASE-10-SUMMARY.md](PHASE-10-SUMMARY.md) — created `src/app/contact/layout.tsx` server component to provide title/description that client-component `page.tsx` couldn't export.

## Net result

| Severity | Total | Fixed | Deferred |
|---|---|---|---|
| 🔴 High | 1 | 1 | 0 |
| 🟡 Medium | 1 | 0 | 1 |
| 🟡 Low | 1 | 1 | 0 |
| 🟢 Cosmetic | 1 | 1 | 0 |

Build verified clean after all fixes.

## Time

- Estimated: 30 min
- Actual: ~35 min
