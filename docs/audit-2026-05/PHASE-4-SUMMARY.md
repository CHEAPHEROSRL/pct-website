# Phase 4 — Dependency Vulnerabilities

**Status:** ✅ 7 of 9 CVEs fixed, 2 documented residuals
**Method:** `npm audit` + targeted upgrades

## Before

`npm audit` initial state: **6 vulnerabilities (3 moderate, 3 high)**

| Severity | Package | Issue | CVE |
|---|---|---|---|
| 🔴 High | picomatch | Method Injection in POSIX Character Classes — incorrect glob matching | GHSA-3v7f-55p6-f55p |
| 🔴 High | picomatch | ReDoS via extglob quantifiers | GHSA-c2c7-rcm5-vvqj |
| 🟡 Moderate | protocol-buffers-schema | Prototype pollution | GHSA-j452-xhg8-qg39 |
| 🟡 Moderate | postcss | XSS via Unescaped `</style>` in CSS Stringify Output | GHSA-qx2v-qp2m-jg93 |

After `npm audit fix` ran, **4 more high-severity Next.js CVEs surfaced** (these were transitive but only fully reported once direct deps stabilized):

| Severity | Package | Issue | CVE |
|---|---|---|---|
| 🔴 High | next < 16.2.6 | Middleware / Proxy bypass via dynamic route parameter injection | GHSA-492v-c6pp-mqqv |
| 🔴 High | next < 16.2.6 | Cache poisoning in React Server Component responses | GHSA-wfc6-r584-vfw7 |
| 🔴 High | next < 16.2.6 | Middleware bypass in App Router via segment-prefetch routes | GHSA-267c-6grr-h53f |
| 🔴 High | next < 16.2.6 | Middleware bypass in Pages Router via i18n | GHSA-36qx-fr4f-26g5 |

Two of these directly affect our auth surface (middleware bypass).

## What was done

### Safe fix
`npm audit fix` resolved picomatch + protocol-buffers-schema cleanly.

### Next.js minor bump
`npm audit fix --force` bumped Next.js 16.1.6 → 16.2.6 (minor within same major). This closed all four Next.js CVEs above.

### Build verification
`npm run build` after the bump exited clean. No source changes required; only `package.json` (`next: "16.1.6"` → `"^16.2.6"`) and `package-lock.json`.

## After

`npm audit` final state: **2 moderate vulnerabilities remaining**, both in transitive `postcss` via `next`.

| Severity | Package | Issue | "Fix" |
|---|---|---|---|
| 🟡 Moderate | postcss (transitive via next) | XSS via Unescaped `</style>` in CSS Stringify Output | Suggested downgrade to next@9.3.3 |

### Why we're leaving these as-is

The advisory is about CSS-stringification XSS — exploitable only when an app stringifies CSS at runtime with user-controlled input. **This app does not do that.** All CSS is generated at build time by Tailwind / PostCSS toolchain, never with runtime user input.

The "fix" npm audit suggests is `npm audit fix --force` which would downgrade Next.js from v16 to v9 — a massive breaking change that would break the entire app. The cure is much worse than the disease.

**Decision: accept the residual moderate-severity postcss CVE. Re-evaluate when a higher Next.js version ships with a newer postcss.**

## Score

- **9 CVEs initially flagged** (after fix-cascade revealed transitives)
- **7 fixed**, all the high-severity ones
- **2 remaining**, both non-exploitable in this app

## Commit

Will be in the same commit as the rest of the audit work this session.

## Time

- Estimated: 15 min
- Actual: ~20 min (includes the cascade-discovery of the Next.js CVEs)
