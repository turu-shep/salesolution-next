# Salesolution.net → Next.js Migration — Strategy Overview

**Status:** Research & strategy phase (no code yet)
**Owner:** Artur Shepel (a.shepel@salesolution.net)
**Source site audited:** https://salesolution.net (WordPress 6.9.4, custom `salesolution` theme, hosted on Cloudways)
**Audit date:** 2026-05-16

---

## 1. Why migrate

Current implementation is a custom WordPress theme using an aging front-end stack (jQuery 3.3.1, Bootstrap, Owl Carousel) layered with seven heavyweight commercial plugins. Pain points:

- **Iteration speed.** Marketing changes (new landing pages, A/B tests, copy edits) require theme edits or Gutenberg work. Tooling friction discourages frequent updates — the site positions itself around "AI-Driven SEO" and "GEO," a fast-moving domain.
- **Performance ceiling.** Multiple form/tracking plugins (PixelYourSite, MonsterInsights, HubSpot, Complianz, Link Whisper) load synchronously and stack render-blocking JS.
- **Plugin lock-in & cost.** Premium plugins (Rank Math Pro, Complianz Premium, Link Whisper Premium, MonsterInsights, PixelYourSite) carry annual renewals.
- **SEO + schema is brittle.** Rank Math controls the entire `@graph` JSON-LD — debugging requires WP-admin access, not git.
- **Content modeling.** Two contradictory page hierarchies (`/services/*` vs. `/services/ai-seo/`, `/contact/` vs. `/contact-me/`) point at WordPress's free-form page tree allowing cruft.

## 2. Goals of the rebuild

| # | Goal | Success metric |
|---|------|----------------|
| 1 | **Zero SEO regression** at cutover | Same indexed URLs, no 4xx/5xx in Search Console for 30 days |
| 2 | **Faster shipping** of marketing pages | New landing page from spec → live in < 2 hours via MDX |
| 3 | **Performance** | Mobile Lighthouse ≥ 90 across all template types |
| 4 | **Decouple content from code** | Marketing copy edits without redeploy (CMS or Git-driven MDX) |
| 5 | **Replace plugin sprawl** | All 7 premium WP plugins replaced by native Next.js + 2-3 SaaS APIs |
| 6 | **Preserve all conversion mechanics** | Forms, pixels, gtag, GA4, cookie consent all parity at launch |

## 3. Scope

**In scope**
- All 36 pages from `page-sitemap.xml`
- All 19 blog posts from `post-sitemap.xml`
- All 9 guides from `guide-sitemap.xml`
- All 2 career-path entries from `careers-sitemap.xml`
- Lead-gen funnels (`/unlock-growth-audit/`, `/future-proof-your-seo/`, `/book-growth-call/`, `/constraint-sprint/`)
- Multi-step contact forms with field-conditional logic
- Analytics + Pixel + Google Ads tag + Cookie consent
- Schema.org JSON-LD parity
- Service-area landing page system (currently mostly "Coming Soon" placeholders)

**Out of scope (initial launch)**
- WooCommerce shop, cart, checkout, my-account (currently blocked in robots — confirm if dead or paused)
- `/client-portal-login/` and `/clients/` (also blocked in robots — appears unused)
- Comments system on blog posts (low signal; reconsider if engagement data shows otherwise)
- Migrating away from Rank Math redirect rules (audit and bake into Next.js redirects)

**Deferred for v1.1**
- CMS choice (initial launch can be MDX-in-Git; CMS layered in v1.1 if Artur wants non-dev edit access)
- Service-area programmatic pages (50 states × cities)
- Newsletter ("Weekly Turbulence Brief") signup flow if not live

## 4. Document index

| File | Purpose |
|------|---------|
| [00-overview.md](00-overview.md) | This file — strategy summary |
| [01-current-state-audit.md](01-current-state-audit.md) | What the existing WordPress site runs on, plugin-by-plugin |
| [02-information-architecture.md](02-information-architecture.md) | Full URL inventory + nav structure + URL keep/redirect/drop decisions |
| [03-content-inventory.md](03-content-inventory.md) | Every page, post, guide classified by template type with notes |
| [04-page-templates.md](04-page-templates.md) | Template patterns to build in Next.js (home, service, landing, blog, guide) |
| [05-seo-strategy.md](05-seo-strategy.md) | Robots, sitemap, redirects, metadata API, JSON-LD plan |
| [06-nextjs-tech-stack.md](06-nextjs-tech-stack.md) | Proposed framework, libraries, hosting |
| [07-design-and-components.md](07-design-and-components.md) | Visual system + reusable component inventory |
| [08-integrations.md](08-integrations.md) | Analytics, Meta Pixel, Google Ads, HubSpot, forms, calendar, consent |
| [09-migration-plan.md](09-migration-plan.md) | Phased execution plan with cutover checklist |
| [10-risks-and-open-questions.md](10-risks-and-open-questions.md) | Inconsistencies found + decisions needed before coding |
| [11-screenshots-capture-guide.md](11-screenshots-capture-guide.md) | Playbook to capture visual baselines (must be run locally) |
| [design-tokens.md](design-tokens.md) | **Extracted** colors, fonts, radii, shadows pulled from live computed styles (2026-05-16) |
| [design-tokens.json](design-tokens.json) | Raw extractor output (77 KB) — every sampled element with computed CSS |
| [screenshots/](screenshots/) | 54 full-page screenshots, 1440 / 768 / 375 viewports |
| [scripts/](scripts/) | Self-contained Playwright tooling (capture-screenshots.mjs, extract-tokens.mjs) |

## 5. Constraints worth flagging upfront

- **The current site is the live business.** Migration must be staged on a preview domain and cut over atomically (DNS swap + 301 map). No partial reads from prod.
- **Marketing pixels are revenue-attached.** Meta Pixel `1246284374271362` and Google Ads conversion tag `AW-17897120027` must fire identically before cutover or attribution breaks.
- **Schema is currently emitted by Rank Math.** Removing Rank Math without parity in Next.js will drop rich results.
- **Multiple addresses appear in different parts of the site** (see [10-risks-and-open-questions.md](10-risks-and-open-questions.md#address-inconsistency)) — must be reconciled before NAP-sensitive schema is regenerated.
