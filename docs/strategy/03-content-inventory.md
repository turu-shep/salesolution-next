# Content Inventory

Every URL classified by template type, with the notes needed to rebuild it in Next.js. Source: live-site analysis 2026-05-16. Full URL list lives in [02-information-architecture.md](02-information-architecture.md).

## 1. Pages by template type

### Home (`/`)

- **Page title:** "Digital Marketing & Sales: SEO Expert Guides and Services - SaleSolution"
- **H1:** "Pioneering AI-Driven SEO for Technical B2B & Industrial E-commerce"
- **Sections (top→bottom):**
  1. Header / nav / "Get Free Growth Audit" CTA
  2. Hero (H1 + sub + "Get Free AI-Readiness Assessment" button)
  3. Client logo strip (Deventor, MWF, NH, Hosebox, Longhorn)
  4. Problem statement — 3 cards (Declining Organic Traffic, Traditional SEO Insufficient, Product Discovery Shift)
  5. "AI Adaptation Framework" — 3 phases with checkpoints
  6. Phase 1 details — 4 focus areas
  7. Phase 2 details — 5 focus areas
  8. Phase 3 details — 5 focus areas
  9. CTA: "Get Quote" → `/book-growth-call/`
  10. Comprehensive AI-Ready Services — 4 categories
  11. Authority / GEO section — 4 strategy pillars
  12. PPC section — 4 strategic elements
  13. CTA: "Get Quote"
  14. "Who We Serve" — 2 subsections
  15. "Are These Your AI Search Concerns?" — 5 pain points
  16. Testimonials — 4 customer reviews, 5-star
  17. Final CTA: "Get Your Free Growth Audit"
  18. Footer

### Service hub (`/services/`)

- **H1:** "Generate-Engine Optimization For x3 Faster Revenue"
- **Sections:** hero + metrics → market challenges → GEO solution → 4-phase framework → comparison table (us vs typical agency vs in-house) → pricing model → strategy dev process → FAQ (11 questions) → PPC section → final CTA
- **Important elements to rebuild:**
  - Stats row: $378M, 91%, 2.5x, 96 NPS, 5.2x, $575k ARR
  - Comparison table (3 columns)
  - FAQ (11 Q&A) — needs `FAQPage` JSON-LD
  - Performance-based pricing copy + "Double Your Investment" guarantee

### Service child page (`/services/ai-seo/`)

- **H1:** "Generate-Engine Optimization For x3 Faster Revenue" (overlaps with hub — copy needs differentiation post-migration)
- Same 4-phase framework + 11-question FAQ
- This page largely duplicates the hub; in the rebuild, the hub should preview each service and the child should be unique. **Content decision required** (see [10-risks-and-open-questions.md](10-risks-and-open-questions.md)).

### Service child — Content Writing (`/services/content-writing-services/`)

- **Title:** "Blog and Content Writing Services | Content Writing Company"
- 3 core offerings: Fully Managed, Publish-Ready, Expertise Right For You
- 5 packages: "Let's Give It a Try", Niche, Vanguard, Way to Domination, Excelsior
- Volume + long-term discounts (5% 6-mo, 15% 12-mo)
- Case study: 150% traffic increase
- FAQs

### Service child — Web Dev (`/services/website-development-design-services/`)

- **Title:** "High-Performance Website Development and Design Services - SaleSolution"
- Offerings: E-Commerce, Niche Blogs, Corporate, plus discounted Educational/Non-Profit
- Support: audits, perf optimization, upgrades
- Timeline: 4–6 weeks
- No public pricing

### Service child — Content Packages (`/services/website-content-writing-packages/`)

- Pricing table with **explicit prices** — preserve verbatim:

| Package | Price | Includes |
|---------|-------|----------|
| Let's Give It a Try | $500 | One 2,500-word article |
| Niche | $2,400/mo | Four 3,000-word articles + custom graphics |
| Vanguard | $4,000/mo | 2×3K + 2×4.5K articles, bi-monthly 6K pillar |
| Way to Domination | $7,500/mo | 4×2.5K + 4×4.5K articles, one 7K pillar |
| Excelsior | $15,000/mo | 8×2.5K + 8×4.5K articles, three 8K pillars |
| Custom | Variable | Tailored mix |

This page is **revenue-attached** — preserve copy and structure carefully.

### Service child — Outbound Email (`/services/outbound-email-marketing-services/`)

- 5 value props (rapid reach, multiple touchpoints, segmentation, metrics, "42:1 ROI" claim)
- 4-step process: Consultation → Strategy → Execution → Optimization

### Contact (`/contact-me/`)

- 2-step form:
  1. Service category selection: GEO/AI-Search · E-Commerce SEO · Personal Brand Engine
  2. Form fields: Full Name (req), Email (req), Phone (req), Website, Monthly revenue (req dropdown), Platform (req: WooCommerce / Shopify / Other), Primary marketing frustration (req dropdown, 10+ options)
- "Your Journey With Us" section
- Office address block (note: address inconsistency — see risks)
- Contact methods: phone `561-531-4339`, two email aliases (CloudFlare-obfuscated)
- "100% ROI-First Guarantee"
- **No calendar embed** — booking happens after form submission

### Lead-gen — Free Growth Audit (`/unlock-growth-audit/`)

- Hero: 15-min audit, 42 brands cited, "no sales pitch"
- 3 audit pillars: Technical Deep-Dive · CRO & UX · AI-Search Readiness
- Social proof: +32% CVR, 95% satisfaction, 4.9/5 Clutch, 4 testimonials
- Same multi-step form as `/contact-me/`
- Eligibility: best fit $200K+/mo
- Deliverables: 60-point crawl, CRO heat-map, "$2k Implementation Checklist" bonus, 24h turnaround
- Sub-page `/unlock-growth-audit/book-slot/` and `/unlock-growth-audit/thank-you/`

### Lead-gen — AI Search Survival (`/future-proof-your-seo/`)

- Hero: "AI Search Is About to Erase 1 in 3 Clicks" (−34% CTR, 40–60% traffic drops, <24mo timeline)
- AI Search Timeline 2024–2027
- Lead magnet: "10-Minute Survival Checklist" ($2k claimed value)
- Form fields: Email, annual revenue slider ($0–$1M+), organic search % (10–70%), traffic type (Informational/Transactional/Mixed), timeline (6–24 months)
- FAQ accordions across 4 categories (11+ questions)
- Recovery story case study (Frank Walker / Marcus L. — note: this might be a synthetic persona; verify)
- Newsletter signup: "Weekly Turbulence Brief"

### Lead-gen — Book Growth Call (`/book-growth-call/`)

- Same form as `/contact-me/` and `/unlock-growth-audit/`
- 4.9/5 Clutch, +375% ARR avg, 24h turnaround, 98% retention
- 4-step process: Discovery → Proposal → 30-Day Pilot → Scale
- FAQ section

### Productized offer — Constraint Sprint (`/constraint-sprint/`)

- **Explicit pricing: $12,000** (4-week diagnostic + implementation)
- Target: $2M–$20M annual revenue e-commerce
- 4 deliverables: Revenue Leak Scan, Scoreboard, One Installed Asset, Ticket Pack + 90-day Fix Order
- Optional retainer: $8K/mo
- Money-back guarantee if no constraint identified in Week 1
- Sub-page `/constraint-sprint/thank-you/`

### Blog hub (`/category/blog/`)

- Card grid: featured image, headline, date, read-time
- 9 topic tag filters: B2B, B2B Marketing, Content Marketing, Content Writing, E-Commerce, Marketing Strategy, SEO, Traffic, WooCommerce
- Pagination (currently 2 pages × 9 posts ≈ 18, matches 19-post inventory)

### Blog post template (`/<slug>/`)

Sample analyzed: `/generative-engine-optimization-basic-to-advanced/`

- Featured image
- Single H1
- 7–8 H2 sections, 20+ H3 subsections
- Table of contents (auto-anchored)
- Estimated 4,500–5,200 words; 21-min read
- "Related posts" — 3 cards
- Author block: Artur Shepel with tagline
- Sharing widgets: LinkedIn, Twitter
- Comment form (drop-able)
- Optional FAQ accordion (use `FAQPage` schema)
- CTA: "Get Your Free Growth Audit"

### Guide template (`/guides/<slug>/`)

Sample analyzed: `/guide/website-launch-checklist-series-part-1-seo-and-crawling/`

- Breadcrumb: Home > Guides > Article
- Featured image
- Date + read-time metadata
- Long-form structured content (H1→H4) with code snippets, screenshots, tool references
- **Series navigation** at bottom: linked list of all 8 parts (this is a custom component)
- "Read next" recommendation
- Author block
- Comment form

### Guide hub (`/guides/`)

- Tag-based filters: All · B2B · B2B Marketing · Marketing Strategy · E-Commerce · WooCommerce
- Sort: oldest/newest
- 8-part Website Launch Checklist Series spotlight
- Individual guide cards: thumbnail, description, timestamp, read-time

### Career-path hub (`/career-paths/`)

- Currently thin: highlights "SEO Specialist Qualification" as featured entry
- Free educational program positioning
- Build as a learning paths directory

### Career-path entry (`/career-paths/<slug>/`)

- Two examples exist; treat as the same template
- Educational article with qualifications/curriculum sections

### Service-areas hub (`/service-areas/`)

- Claims 50-state coverage, 300+ cities
- Reality: nearly every state shows "Coming Soon"
- 5 regions: West Coast, Northeast, Southeast, Midwest, Southwest
- Single physical office in North Miami Beach
- **Decision needed:** keep stub for SEO play and build programmatic state/city pages, or remove until ready

### Legal pages

- `/privacy-policy/`, `/terms-of-service/`, `/disclaimer/`, `/opt-out-preferences/`, `/communication-preferences/`
- Standard long-form legal copy
- Port content verbatim from current site

## 2. Content type → Next.js model

| Template type | Count | Suggested data source | Suggested route |
|---------------|------:|------------------------|------------------|
| Marketing pages (home, lead-gen, services) | ~14 | React components per page (MDX optional) | `app/[path]/page.tsx` per page |
| Service detail | 5 | MDX with shared layout | `app/services/[slug]/page.tsx` |
| Blog post | 19 | MDX in `content/posts/` | `app/[slug]/page.tsx` (preserve root URLs) |
| Guide | 9 | MDX in `content/guides/` | `app/guides/[slug]/page.tsx` |
| Career path | 2 | MDX in `content/career-paths/` | `app/career-paths/[slug]/page.tsx` |
| Guide category | 3 | Derived from guide frontmatter `category` | `app/guides/[category]/page.tsx` |
| Legal | 5 | MDX in `content/legal/` | `app/[slug]/page.tsx` |
| Thank-yous | 2 | Simple components, noindex | `app/[funnel]/thank-you/page.tsx` |
| KML | 1 | Static file or Route Handler | `app/locations.kml/route.ts` |

## 3. Shared content/data

Things repeated across many pages — extract to a single config to keep DRY:

| Data | Used on | Source of truth proposal |
|------|---------|--------------------------|
| Phone `561-531-4339` | Contact, services, footer, lead-gen | `lib/business.ts` |
| Email aliases | Contact, lead-gen, services | `lib/business.ts` |
| Office address(es) | Contact, services, footer, schema | `lib/business.ts` **after** reconciling — see risks |
| Social URLs | Footer, schema | `lib/business.ts` |
| Stat block ($378M, 91%, 2.5x ROI, 96 NPS, etc.) | Home, services, lead-gen | `lib/stats.ts` (one source — currently varies by page) |
| Client logos | Home, services, lead-gen | `components/ClientLogos.tsx` |
| Testimonials | Home, services, lead-gen | `content/testimonials/*.mdx` |
| FAQ items | Services pages, future-proof page | `content/faqs/*.mdx` keyed by page |
| CTA buttons | Everywhere | `<Button>` variants in design system |
