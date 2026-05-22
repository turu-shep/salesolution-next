# Risks & Open Questions

Issues discovered during the audit that need a decision from Artur before (or during) implementation. Sorted by blocking-ness.

---

## Blocking — must resolve before launch

### Address inconsistency

Three different physical addresses appear across the live site:

| Source | Address |
|--------|---------|
| Homepage JSON-LD (`Organization.address`) | 200 Kings Point Dr **apt. 1208**, **Sunny Isles Beach**, FL 33160 |
| `/contact-me/` page body | 200 Kings Point Dr, **Suite 1107**, **North Miami Beach**, FL 33160 |
| `/services/` page body | **17071 W Dixie Hwy**, North Miami Beach, FL 33160 |

This matters because:
- Google uses Organization schema for knowledge-panel info
- NAP (Name/Address/Phone) consistency is a local SEO ranking factor
- Conflicting addresses across the site reduce trust signals

**Decision needed:** which address is the canonical business address? Whichever it is, all three places must align in the Next.js build, and Google Business Profile + any citations (Yelp, BBB, etc.) need to match.

### Schema leak: Cloudways staging URL

The Person schema (`Artur Shepel`) currently includes:

```json
"sameAs": ["https://wordpress-1371894-5059308.cloudwaysapps.com"]
```

This exposes the hosting provider's internal staging URL. It also dilutes the entity graph for the Artur Shepel person entity. **Action:** drop in the rebuild; replace with real public profile URLs (LinkedIn, X, GitHub, About.me).

### Rank Math redirects export

There may be active 301s configured inside Rank Math's Redirections module that are not visible from outside. **Action:** before WordPress is decommissioned, export the redirection list (WP admin → Rank Math → Redirections → Export → JSON/CSV) and bake into `next.config.js`. Without this, any historical redirects break silently.

### `/wp-content/uploads/*` images

If image URLs change, image search rankings will reset. **Decision:** keep the upload path alive (recommended — proxy to S3/R2) or rename everything (risky). See [05-seo-strategy.md](05-seo-strategy.md#image-seo).

---

## Important — should resolve before launch

### Duplicate / overlapping pages

| Pages | Issue |
|-------|-------|
| `/services/` vs. `/services/ai-seo/` | Both use H1 "Generate-Engine Optimization For x3 Faster Revenue" and largely duplicate copy. **Decision:** make hub a directory page; differentiate child page copy. |
| `/contact-me/` vs. `/contact/` | Two contact pages. **Decision:** retire `/contact/` with a 301 → `/contact-me/`. |
| `/book-growth-call/` vs. `/strategy-session/` | Likely the same offer with different framings. **Decision:** retire one with a 301. |
| `/unlock-growth-audit/` vs. `/book-growth-call/` vs. `/constraint-sprint/` | Three lead-gen funnels with overlapping forms. **Decision:** keep all three (they target different intents) but make the differentiator obvious in nav/CTAs. |

### Guide permalink split (`/guide/` vs. `/guides/`)

Two guides use `/guide/...` (singular), the other seven use `/guides/...` (plural). This is from a permalink change mid-flight. **Action:** standardize on `/guides/` and add 301s for the singular variants.

### WooCommerce orphan paths

`/shop/`, `/cart/`, `/checkout/`, `/my-account/` exist in the sitemap but are robots-disallowed. **Decisions:**

- Is the shop dormant or actively used?
- If dormant → drop pages, remove WooCommerce, redirect URLs to `/` or remove from sitemap entirely
- If active → keep WooCommerce running on a separate subdomain (`shop.salesolution.net`) so the marketing rebuild isn't blocked by ecommerce complexity

### Client portal paths (`/clients/`, `/client-portal-login/`)

Also robots-disallowed. Same question — dormant or active? If active, it's a separate auth-gated app outside the marketing rebuild scope.

### Service-areas placeholders

`/service-areas/` claims 50-state coverage but nearly every state page reads "Coming Soon." **Risks:**

- Search engines may flag thin / placeholder content
- Conflicts with E-E-A-T trust signals
- 300+ cities × placeholder content = a lot of low-quality URLs if rolled out badly

**Decision:** either (a) remove placeholders and keep just the hub until programmatic state/city pages are real, or (b) build the programmatic system properly as part of the rebuild.

### Newsletter ("Weekly Turbulence Brief")

`/future-proof-your-seo/` mentions a "Weekly Turbulence Brief" newsletter. No subscribe form found in the homepage audit. **Question:** is this live? If yes, which ESP? If no, descope.

### Synthetic personas in testimonials?

`/future-proof-your-seo/` attributes a recovery story to "Frank Walker / Marcus L., CEO at ScaleFast." Two names for one quote is unusual. **Verify:** is this a real client, a composite, or a placeholder? If composite/placeholder, FTC/UK ASA disclosure rules may apply.

### `Article` schema on the homepage

Rank Math emits `Article` schema on `/`. The homepage is not an article — this is incorrect. **Action:** in the rebuild, emit `WebPage` only (plus the global Organization/WebSite from the layout).

### Stat inconsistencies

Across pages, the headline stats differ:

| Page | Stats shown |
|------|-------------|
| Home | (no headline numbers row visible in scrape) |
| `/services/` | $378M revenue, 91% retention, 2.5x ROI, 96 NPS, 5.2x ROI, $575k ARR |
| `/contact-me/` | $378M revenue, 91% retention, 96 NPS, +$375k ARR avg client |
| `/unlock-growth-audit/` | +32% CVR, 95% satisfaction, 4.9/5 Clutch |
| `/book-growth-call/` | +375% ARR, 24h turnaround, 98% retention |
| `/constraint-sprint/` | +375% ARR (42 projects), 98% retention, 4.9/5 Clutch |

Some are clearly different metrics, but some are the same metric stated differently ("91% retention" vs "98% retention"). **Action:** lock a single canonical stats table in `lib/stats.ts` and pull the right subset per page.

---

## Nice-to-fix — can ship without resolving

### Missing OG image fallbacks

Some pages may not declare a unique OG image. **Action:** use `@vercel/og` to generate per-page OG images at build time as a fallback.

### Missing `BreadcrumbList` on deep pages

Adds rich breadcrumb display in SERPs. **Action:** emit on every nested page.

### No `Product` / `Offer` schema on pricing pages

`/services/website-content-writing-packages/` lists prices but emits no Product schema. **Action:** add — easy rich-result win.

### No `LocalBusiness` on contact page

Adds map and click-to-call in SERPs. **Action:** add once canonical address is locked.

### `/sitemap/` HTML page

There's an HTML sitemap at `/sitemap/`. Mostly redundant with the XML sitemap. **Decision:** drop or auto-generate.

### Comment system

Low-signal, high-spam-risk. **Recommendation:** drop. If engagement matters, swap to Giscus (GitHub Discussions-backed) post-launch.

---

## CMS decision (v1 vs. v1.1)

The plan suggests MDX-in-Git for v1, Sanity/Payload as v1.1 if Artur wants non-dev editing. **Question for Artur:** how often does non-engineering staff need to edit pages without a PR? If "monthly+," start with a CMS from day one.

---

## Capture before WordPress is decommissioned

A checklist of what to export from WP before turning it off:

- [ ] Full DB dump (mysqldump)
- [ ] `wp-content/uploads/` rsync to S3/R2
- [ ] Rank Math Redirections export
- [ ] Rank Math sitemap snapshot for diffing
- [ ] HubSpot plugin settings (if any local config)
- [ ] PixelYourSite settings export (full event config — useful when rebuilding in GTM)
- [ ] Complianz cookie classification export
- [ ] List of installed plugins with versions (for posterity)
- [ ] Theme files (`wp-content/themes/salesolution/`) — useful for verifying nothing in the visual design was missed
- [ ] Author profiles and Gravatar URLs (so they can be replaced with self-hosted images)
