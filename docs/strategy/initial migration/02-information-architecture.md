# Information Architecture & URL Inventory

Source: Rank Math sitemap index at `https://salesolution.net/sitemap_index.xml`, retrieved 2026-05-16.

## 1. Top-level navigation (current)

From the homepage `<nav>` and footer:

**Primary nav**
- Services → `/services/`
- Insights → `/category/blog/`
- Contact me → `/contact-me/`
- Resources (dropdown):
  - AI Search Readiness Checklist → `/future-proof-your-seo/`
  - Guides → `/guides/`
  - Learning Hub → `/career-paths/`

**Header CTA**: "Get Your Free Growth Audit" → `/unlock-growth-audit`

**Footer columns**
- Learning → Insights, Career Paths, Guides
- Cooperation → Services, Contact me
- Connect → Facebook, Twitter/X, LinkedIn
- Legal → Privacy Policy, Terms of Service

## 2. Full URL inventory (66 indexable URLs)

### 2.1 Pages (`page-sitemap.xml`, 36 URLs)

| # | URL | Last mod | Category | Migration decision |
|---|-----|----------|----------|---------------------|
| 1 | `/` | 2023-08-31 | Home | Keep — rebuild |
| 2 | `/services/` | 2025-07-26 (via subpage) | Service hub | Keep — rebuild |
| 3 | `/services/ai-seo/` | 2025-07-26 | Service child | Keep — rebuild |
| 4 | `/services/content-writing-services/` | 2023-09-15 | Service child | Keep — rebuild |
| 5 | `/services/website-content-writing-packages/` | 2023-09-16 | Service child (pricing) | Keep — rebuild |
| 6 | `/services/website-development-design-services/` | 2023-10-24 | Service child | Keep — rebuild |
| 7 | `/services/outbound-email-marketing-services/` | 2023-11-03 | Service child | Keep — rebuild |
| 8 | `/contact-me/` | 2025-07-21 | Contact (primary) | Keep — rebuild |
| 9 | `/contact/` | 2025-07-15 | Contact (duplicate) | **Redirect 301 → `/contact-me/`** |
| 10 | `/unlock-growth-audit/` | 2025-07-30 | Lead-gen funnel | Keep — rebuild |
| 11 | `/unlock-growth-audit/book-slot/` | 2026-03-15 | Funnel step | Keep — rebuild |
| 12 | `/unlock-growth-audit/thank-you/` | 2026-03-15 | Confirmation | Keep — rebuild (noindex) |
| 13 | `/book-growth-call/` | 2025-07-28 | Lead-gen funnel | Keep — rebuild |
| 14 | `/future-proof-your-seo/` | 2025-07-28 | Lead-gen funnel | Keep — rebuild |
| 15 | `/constraint-sprint/` | 2026-03-18 | Productized offer | Keep — rebuild |
| 16 | `/constraint-sprint/thank-you/` | 2026-03-18 | Confirmation | Keep — rebuild (noindex) |
| 17 | `/strategy-session/` | 2024-06-22 | Lead-gen (older) | Audit — likely redirect to `/book-growth-call/` |
| 18 | `/service-areas/` | 2025-10-21 | Local SEO hub | Keep — rebuild |
| 19 | `/guides/` | 2023-10-17 | Guide hub | Keep — rebuild |
| 20 | `/guides/seo-guides/` | 2023-11-29 | Guide category | Keep — rebuild |
| 21 | `/guides/website-development-and-design-guides/` | 2023-11-29 | Guide category | Keep — rebuild |
| 22 | `/guides/email-marketing-guides/` | 2023-08-15 | Guide category | Keep — rebuild |
| 23 | `/career-paths/` | 2023-08-27 | Career hub | Keep — rebuild |
| 24 | `/career-paths/content-strategy-specialist-qualifications/` | 2024-02-13 | Career path entry | Keep — rebuild |
| 25 | `/privacy-policy/` | 2023-12-07 | Legal | Keep — port content |
| 26 | `/terms-of-service/` | 2023-12-07 | Legal | Keep — port content |
| 27 | `/disclaimer/` | 2023-11-11 | Legal | Keep — port content |
| 28 | `/opt-out-preferences/` | 2023-11-11 | Consent UI (Complianz) | Replace with new consent system |
| 29 | `/communication-preferences/` | 2023-11-11 | Email pref center | Audit — likely HubSpot-managed |
| 30 | `/content-restricted/` | 2023-11-11 | WP membership? | Drop unless tied to active flow |
| 31 | `/sitemap/` | 2023-11-03 | HTML sitemap | Drop or auto-generate from `app/sitemap.ts` |
| 32 | `/shop/` | 2023-11-03 | WooCommerce | **Decision needed** — keep ecommerce? |
| 33 | `/cart/` | 2023-10-26 | WooCommerce | Drop if shop dropped |
| 34 | `/checkout/` | 2023-10-26 | WooCommerce | Drop if shop dropped |
| 35 | `/my-account/` | 2023-10-26 | WooCommerce | Drop if shop dropped |
| 36 | `/client-portal-login/` | 2023-10-27 | Portal | Drop — already robots-disallowed |
| (37) | `/clients/` | 2023-10-27 | Portal hub | Drop — already robots-disallowed |

### 2.2 Posts (`post-sitemap.xml`, 19 URLs)

All live at root (no `/blog/` prefix). Keep all URLs.

| URL | Last mod |
|-----|----------|
| `/content-marketing-101/` | 2025-10-23 |
| `/generative-engine-optimization-basic-to-advanced/` | 2025-10-21 |
| `/the-art-of-profitable-words-mastering-b2b-content-writing/` | 2024-04-01 |
| `/direct-vs-organic-traffic-differences-acquisition/` | 2024-04-01 |
| `/seo-mastery-enhancing-visibility-customer-attraction/` | 2024-04-01 |
| `/on-page-seo-mastery-from-visibility-to-conversion/` | 2024-04-01 |
| `/technical-seo-mastering-website-optimization/` | 2024-04-01 |
| `/seo-strategy-template-2024-guide-goals-and-kpi/` | 2024-04-01 |
| `/crafting-an-effective-e-commerce-funnel-for-2024/` | 2024-02-23 |
| `/which-reports-indicate-how-traffic-arrived-at-a-website/` | 2024-02-23 |
| `/strategies-to-increase-e-commerce-conversion-rate/` | 2024-02-23 |
| `/mastering-e-commerce-content-writing-guide-2023/` | 2023-11-11 |
| `/what-is-content-writing-master-the-science-of-web-writing-in-2023/` | 2023-11-03 |
| `/user-intent-seo-guide-to-search-behavior-understanding/` | 2023-10-24 |
| `/off-page-seo-in-depth-guide/` | 2023-10-24 |
| `/b2b-data-driven-marketing-no-more-guesswork/` | 2023-09-01 |
| `/content-strategy-expert-backed-guide-2023/` | 2023-08-30 |
| `/ultimate-guide-mastering-keyword-research-2023/` | 2023-08-30 |
| `/long-tail-keywords-blueprint-2023/` | 2023-08-30 |

### 2.3 Guides (`guide-sitemap.xml`, 9 URLs)

**Permalink inconsistency:** the first guide uses `/guide/` singular; the rest use `/guides/` plural. This is a sign of the WP permalink being changed mid-flight. **Decision needed:** standardize on `/guides/<slug>/` and 301 the singular `/guide/...` URL.

| URL | Last mod |
|-----|----------|
| `/guide/website-launch-checklist-series-part-1-seo-and-crawling/` | 2023-12-06 |
| `/guide/website-performance-optimization-guide/` | 2023-12-06 |
| `/guides/wordpress-website-plugins-launch-checklist-part-3/` | 2023-12-06 |
| `/guides/website-legal-compliance-checklist-part-4/` | 2023-12-06 |
| `/guides/website-security-practices-website-launch-checklist-part-5/` | 2023-12-06 |
| `/guides/website-launch-checklist-part6-ui-ux-optimization/` | 2023-12-06 |
| `/guides/e-commerce-must-dos-website-launch-checklist-part-8/` | 2023-12-06 |
| `/guides/website-launch-checklist-part-7-analytics-outreach-ads/` | 2023-12-06 |
| `/guides/b2b-marketing-strategy-framework-with-example-7-step/` | 2023-12-06 |

### 2.4 Careers (`careers-sitemap.xml`, 1 URL)

| URL | Last mod |
|-----|----------|
| `/career-paths/seo-specialist-qualification/` | 2023-08-30 |

Plus `/career-paths/content-strategy-specialist-qualifications/` (from page-sitemap, but content-typed like a career path). The CPT/page split here is messy; in Next.js treat all career paths as one collection under `/career-paths/<slug>/`.

### 2.5 Local (`local-sitemap.xml`, 1 URL)

| URL | Notes |
|-----|-------|
| `/locations.kml` | Geo KML for local SEO; regenerate from a single source of truth in Next.js if local-SEO strategy is retained |

## 3. Proposed Next.js IA

```
/                              ← home
/services/                     ← hub
/services/[slug]/              ← ai-seo, content-writing, web-dev, email-mkt, content-packages
/<post-slug>/                  ← blog posts (preserve root-level for backwards compat)
/category/blog/                ← blog hub (kept — already linked from nav)
/guides/                       ← guide hub
/guides/[slug]/                ← all guides (unified plural; redirect /guide/ singular)
/career-paths/                 ← career hub
/career-paths/[slug]/          ← career paths
/contact-me/                   ← contact
/service-areas/                ← local SEO hub
/service-areas/[state]/        ← future: state-level pages
/service-areas/[state]/[city]/ ← future: city-level pages

# Lead-gen / funnels (noindex on thank-yous)
/unlock-growth-audit/
/unlock-growth-audit/book-slot/
/unlock-growth-audit/thank-you/   ← noindex
/future-proof-your-seo/
/book-growth-call/
/constraint-sprint/
/constraint-sprint/thank-you/     ← noindex

# Legal
/privacy-policy/
/terms-of-service/
/disclaimer/
/opt-out-preferences/             ← consent center
/communication-preferences/       ← email pref center

# System
/sitemap.xml                       ← auto via app/sitemap.ts
/robots.txt                        ← auto via app/robots.ts
/locations.kml                     ← static or route handler if local SEO kept
```

## 4. Redirect map (preliminary)

To be expanded in [05-seo-strategy.md](05-seo-strategy.md#redirect-map).

| From | To | Status |
|------|-----|--------|
| `/contact/` | `/contact-me/` | 301 |
| `/guide/website-launch-checklist-series-part-1-seo-and-crawling/` | `/guides/website-launch-checklist-series-part-1-seo-and-crawling/` | 301 |
| `/guide/website-performance-optimization-guide/` | `/guides/website-performance-optimization-guide/` | 301 |
| `/strategy-session/` | `/book-growth-call/` | 301 (confirm intent) |
| `/sitemap_index.xml` | `/sitemap.xml` | 301 |
| `/post-sitemap.xml` | `/sitemap.xml` | 301 |
| `/page-sitemap.xml` | `/sitemap.xml` | 301 |
| `/guide-sitemap.xml` | `/sitemap.xml` | 301 |
| `/careers-sitemap.xml` | `/sitemap.xml` | 301 |
| `/local-sitemap.xml` | `/sitemap.xml` | 301 |
| `/wp-admin/*` | `/` | 410 (gone) — discourage scrapers |
| `/wp-login.php` | `/` | 410 |
| `/xmlrpc.php` | `/` | 410 |
| `/?p=<id>` (legacy WP) | `/<slug>/` | 301 if found in Search Console |

Plus all redirects currently in Rank Math's redirection module — **export those before WordPress is decommissioned**.

## 5. Page → URL slug inconsistencies worth fixing

| Issue | Current | Recommendation |
|-------|---------|----------------|
| Contact duplicates | `/contact-me/` + `/contact/` | Keep `/contact-me/`, 301 the other |
| Guide permalinks split | `/guide/...` + `/guides/...` | Standardize on `/guides/...` |
| Career path CPT split | `/career-paths/seo-specialist-qualification/` (CPT) + `/career-paths/content-strategy-specialist-qualifications/` (page) | Unify under one Next.js dynamic route |
| Blog at root | `/<post-slug>/` with no prefix | Keep for SEO continuity but reserve top-level slugs (don't add a page named the same as a post) |
| Blog hub at category archive | `/category/blog/` (not `/blog/`) | Keep URL — already indexed and linked; add `/blog/` as 301 alias for clarity |
