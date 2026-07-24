# Phase 0 baseline — summary

**Date:** 2026-07-24 · **Commit:** `dd66f3c` (local main, 8 ahead of origin — probe v2 not yet deployed) · **Run by:** fable-5 main loop + opus-5 agents (funnels, tests map)

| Area | Call | The numbers |
|---|---|---|
| Types & build | 🟢 | tsc clean in 2.6s; build clean in 25.2s (Turbopack); 202 static pages in 2.2s |
| Tests | 🔴 | 34/34 pass but they cover **4 of 72 lib files (5.6%)**, all `.mjs`. The SSRF layer, both auth modules, both rate limiters, and the token codec are **structurally untestable** on Node 20.16 (no TS loading). One test is green over a module it never executes. Runner decision blocks wave 3 (F-009). |
| Lint | 🔴 | `pnpm lint` never completes (>5min — lints `.engine/`, `seo-project/`, `docs/`). Scoped run: **44 errors, 9 warnings** in `app/ components/ lib/ sanity/ scripts/` (F-007, F-008). |
| Vitals (production) | 🟡 | SEO **100/100 on all 8 pages**. But homepage **LCP 4.19s / perf 78** (F-010); best-practices pinned at 77 site-wide (tag stack); `/book-growth-call/` **5.95MB** (F-011); ~2MB weight floor everywhere. |
| Bundle | 🟡 | **~1.3MB uncompressed first-party JS on every page** — a shared baseline bundle all marketing pages pay (31–35 files). Next 16 no longer reports per-route sizes; measured empirically. |
| A11y | 🟡 | 0 critical / **122 serious** nodes, but concentrated: one rule (`color-contrast`, 116 nodes, same shared component leading on every page) + 6 undersized touch targets on the homepage HeroProbe toggles (F-012). |
| Funnels | 🔴 | Live stub form discarding leads on a sitemap-registered page (F-004); all three lead routes return success with zero delivery channels configured (F-014); `/revenue-engine/` main CTA routes every vertical to the roofing form; four funnels terminate on a thank-you page describing a different product; AI-read rate-limited state is a dead end. Full map + 23 flags in `funnels.md`. |
| Deps | 🟡 | 67 advisories (1 critical, 26 high) — most in build/tooling chains, but `next@16.2.6` itself carries a Turbopack-middleware-bypass high (this build IS Turbopack; no middleware.ts exists — lens A verifies exposure), and `undici`/`sharp` are runtime. Node 20 is **past EOL**. `playwright` devDep unused. |
| Security posture (seeded) | 🔴 | F-001 (forgeable gate cookie via published fallback secret) and F-002 (unthrottled password brute force) remain CONFIRMED and unfixed; F-003/F-005/F-006 await verification. |

## Five things to look at first (if auditing today)

1. **F-001 + F-002** — the two S1s. Both are small fixes (fail-closed secret; reuse the existing limiter). Everything else is noise until these land.
2. **Lead integrity end to end** — F-004 (stub form live on an indexed page) and F-014 (silent-drop success path in all three submit handlers). This is the revenue plumbing.
3. **F-009** — pick the test-runner unblock (recommendation: `tsx` loader now, Node 24 upgrade separately). Nothing high-risk becomes testable until it's decided.
4. **Homepage: LCP 4.19s + 37 contrast nodes + 6 touch targets** — the funnel entry is the site's worst page on perf and a11y simultaneously.
5. **Funnel misroutes** — the `/revenue-engine/` pillar CTA (every vertical → roofing form) and the four-funnels-one-wrong-thank-you problem. Fixes touch copy, so they'll be PROPOSED rows needing sign-off.

## Measurement gaps (recorded, not fabricated)

- Lighthouse ran against **deployed production**, which is 8 commits behind local main — probe v2 pages don't exist there yet; axe ran against the **local build** which includes them. The two sets are labeled and must not be cross-compared.
- Next 16 emits no per-route first-load JS; the bundle table is an empirical first-party measurement (uncompressed, local).
- Mobile Lighthouse not run (DataForSEO endpoint ran desktop); mobile LCP on `/` will be worse than the 4.19s desktop figure.
- Vercel env/runtime state (which env vars are actually set in production — decisive for F-001, F-014, Turnstile posture) is not readable from the repo and needs a dashboard check.
