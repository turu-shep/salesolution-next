# Baseline — bundle and route weight

**Measured:** 2026-07-24 · commit `dd66f3c` · **Measured by:** fable-5 (phase 0)

**Caveat on method:** Next 16.2.6's build output no longer prints per-route size / first-load JS, and there is no `app-build-manifest.json`. First-load JS below was measured empirically instead: a headless Chromium loaded each page against the local production build (`next start`, port 3100) and summed **first-party JS response bodies (uncompressed)**. Third-party tag weight (GTM/HubSpot/Meta/LinkedIn) is excluded here — Lighthouse in `vitals.md` captures total page weight including vendors.

## Client JS totals

- `.next/static` (all client assets, all routes): **9.3 MB**
- First-party JS actually loaded per page (uncompressed, local prod build):

| Page | First-party JS | JS files |
|---|---|---|
| `/` | 1,303 KB | 31 |
| `/services/` | 1,341 KB | 35 |
| `/revenue-engine/` | 1,303 KB | 31 |
| `/case-studies/` | 1,303 KB | 31 |
| `/glossary/` | 1,303 KB | 31 |
| `/book-growth-call/` | 1,303 KB | 31 |
| `/unlock-growth-audit/` | 1,303 KB | 31 |
| `/future-proof-your-seo/` | 1,303 KB | 31 |

The near-identical ~1.3 MB / 31 files on every page means the weight is a **shared baseline bundle**, not per-route code — every marketing page pays it. Over gzip this will be smaller on the wire (Vercel compresses; local `next start` did not), but 1.3 MB uncompressed shared JS for static marketing pages is the number for lens F (perf) to attack: what's in the shared chunks, and what's shipped to pages that never use it.

**Every route exceeds the 200 kB first-load flag threshold** from the phase 0 brief, uniformly, because of the shared bundle.

## Route table (from `pnpm build`, 2026-07-24)

Full table preserved in the build log. Shape:

- **Static (○):** all marketing pages — home, services (14 subpages), industries (4), revenue-engine (8 incl. previews/concepts), lead-gen landing pages (`/future-proof-your-seo`, `/catalog-snapshot`, `/constraint-sprint`, `/lp/home-services-revenue-leak`, `/full-growth-quote`, `/unlock-growth-audit` + thank-you pages), legal pages, `/dev/styleguide`, `/drafts`, `/contact-me`, `/service-areas`, `/about`.
- **SSG + ISR (●, revalidate 1m / expire 1y):** `/[slug]` blog (20 paths), `/case-studies/[slug]` (10) + OG images, `/glossary/[term]` (50), `/glossary/cluster/[cluster]` (5), `/career-paths/[slug]` (7) + roles-map, `/guides/[slug]` (12), `/tools/[tool]` (2, 1h revalidate), `/category/blog`.
- **ISR 1d:** `/sitemap.xml`, `/sitemaps/[file]` (8 child sitemaps).
- **Dynamic (ƒ):** all API routes (`/api/probe`, `/api/probe/ai`, `/api/probe/unlock`, `/api/lead`, `/api/revenue-leak-audit`, `/api/full-growth-quote`, `/api/sales|strategy/login|logout`, `/api/draft`, `/api/disable-draft`, `/api/revalidate`, `/api/cron/revalidate-sitemap`), `/ai-readiness/[token]` + its OG image (**dynamic = re-computed per request; flagged for lens F**), all `/sales/*` (10 routes), all `/strategy/*` (14 routes), `/studio/[[...tool]]`, `/logo.png`, `/wp-content/uploads/[...path]`.
- Static count: **202 pages** prerendered in 2.2s.

## Ten heaviest / most interesting routes

Per-route JS is uniform (~1.3 MB shared), so "heaviest" is driven by totals and dynamics:

1. `/book-growth-call/` — 5.95 MB total page weight (Lighthouse): Calendly embed chain pulls Wistia, Sentry, ZoomInfo, navattic, ketch, Optanon.
2. `/` — 2.06 MB total, LCP 4.19s in production (see `vitals.md`).
3. `/services/` — heaviest first-party JS (1,341 KB / 35 files).
4. `/ai-readiness/[token]` — dynamic, full scan per view (probe fetch + score on every request).
5. `/ai-readiness/[token]/opengraph-image` — dynamic, re-scans per unfurl.
6. All other marketing pages — ~2.05 MB total each; the ~2 MB floor is the shared JS + tag stack.

## Flags for the audit

- Shared ~1.3 MB bundle on every static marketing page (lens F: what's in it, who actually needs it).
- `/ai-readiness/[token]` and its OG image are dynamic and re-scan per request (lens F, already named in the phase 1 brief).
- `/dev/styleguide`, `/drafts`, `/revenue-engine/flow-concepts|leak-concepts|spine-preview|full-preview` are built as public static routes — indexability question for lens G.
- `/wp-content/uploads/[...path]` dynamic route exists (legacy asset shim?) — lens G/C should confirm intent.
