# Phase 12 — Regression Sweep

**Status:** ⏳ Partial — local builds all clean; live verification pending Vercel deploy (slow today)

## What I verified locally ✅

- `npm run build` exits clean after ALL phase-2/4/7/10/11 code changes (verified after each phase individually + final)
- No TypeScript errors
- No new lint warnings
- All source changes are minimal and scoped — the entire diff is dependency bumps + 3 small `redis.set` additions + 1 hook reorder + 1 closure fix + Footer contrast string change + 1 new layout file + next.config.ts headers config + `public/llms.txt`

## What I tried to verify on production

Pushed three commits today: `37344a1`, `793b75b`, `a627ebc`. Vercel's deploy from the latest commit (`a627ebc`) wasn't live after 5+ minutes of polling. Live site still shows old chunk hashes and no new headers / no `/llms.txt` route. Either deploy queue is backed up or there's a slow build.

**This blocks live verification of:**
- Security headers (X-Frame-Options etc) from Phase 2
- React #300 fix on `/supporters` from Phase 11
- Footer contrast fix from Phase 7
- `/contact` page title fix from Phase 10
- `/foundations` title double-suffix fix from Phase 10
- `/llms.txt` existence

**Action for Raul:** once Vercel shows ✅ on the latest deploy in the Deployments tab, run the verification commands in the next section.

## Verification commands (run after Vercel deploy completes)

### 1. Security headers (Phase 2)
```bash
curl -sI https://www.yeschapter.com/ | grep -iE "x-frame|x-content|referrer|permissions"
```
Expect to see all four headers. If missing → check Vercel build logs.

### 2. llms.txt (Phase 10)
```bash
curl -sI https://www.yeschapter.com/llms.txt
```
Expect `HTTP/1.1 200 OK` + `Content-Type: text/plain`.

### 3. React #300 fix on /supporters (Phase 11)
Open `/supporters` in Chrome DevTools → Console tab. **Expect zero errors.** Before fix this would show `Error: Minified React error #300`.

### 4. Footer contrast (Phase 7)
Visually check footer on any page. The text "© 2026 YesChapter…", "Privacy Policy", "Terms of Use" should be **noticeably more readable** than before (was 33% opacity, now 70%).

### 5. /contact + /foundations titles (Phase 10)
```bash
curl -sL https://www.yeschapter.com/contact | grep -oE "<title[^>]*>[^<]+</title>"
curl -sL https://www.yeschapter.com/foundations | grep -oE "<title[^>]*>[^<]+</title>"
```
Expect:
- Contact: `<title>Contact | YesChapter</title>` (was the generic site fallback)
- Foundations: `<title>Our Partner Foundations | YesChapter</title>` (was doubled "...YesChapter | YesChapter")

### 6. Lighthouse re-run
```bash
npx lighthouse https://www.yeschapter.com/ --output=json --output-path=docs/audit-2026-05/after/lighthouse/home.json --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo --quiet
```
Compare Performance + A11y to baseline ([PHASE-0-SUMMARY.md](baseline/PHASE-0-SUMMARY.md)). Expect:
- Performance: similar or slightly better (the apex→www 784ms redirect is still there — user-action item)
- A11y: 95-98 → 98-100 (Footer contrast fix should bump every page that shows the Footer)

### 7. /api/automation/instagram-sync + youtube-sync (Phase 1 fix)
```bash
# These should now return 401 (was returning 405 before, meaning Vercel cron silently failed)
curl -sL -o /dev/null -w "%{http_code}\n" https://www.yeschapter.com/api/automation/instagram-sync
curl -sL -o /dev/null -w "%{http_code}\n" https://www.yeschapter.com/api/automation/youtube-sync
```
Expect `401` on both (correctly auth-gated). The next scheduled cron run (Instagram 14:00 UTC, YouTube 15:00 UTC daily) will then actually execute.

## Time

- Estimated: 20 min
- Actual: ~15 min, but partial — full verification deferred to post-deploy
