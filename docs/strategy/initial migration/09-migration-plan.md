# Migration Execution Plan

Phased execution. Each phase has a clear exit criterion. Phases 1–4 can run in parallel where independent.

## Phase 0 — Decisions before code (1–2 days)

Block on these answers from Artur (collected in [10-risks-and-open-questions.md](10-risks-and-open-questions.md)):

- [ ] **Canonical office address** (3 different addresses appear today)
- [ ] **Keep WooCommerce or not?** (`/shop/`, `/cart/`, `/checkout/`, `/my-account/`)
- [ ] **Keep client portal?** (`/clients/`, `/client-portal-login/`)
- [ ] **Service-areas: programmatic or remove?** (currently "Coming Soon" placeholders)
- [ ] **Keep blog comments?**
- [ ] **CMS preference**: MDX-in-Git for v1, or skip ahead to Sanity/Payload?
- [ ] **Newsletter platform** for "Weekly Turbulence Brief" (if not already chosen)
- [ ] **Hosting target**: Vercel vs. Cloudflare Pages
- [ ] **Consent banner vendor**: Cookiebot (paid, easiest) vs. Klaro/self-built (free)

## Phase 1 — Foundation (Week 1)

**Goal**: Empty Next.js app builds, deploys to preview URL, with global shell.

- [ ] Init repo: `pnpm create next-app salesolution-next --typescript --tailwind --app --src-dir`
- [ ] Set `trailingSlash: true` in `next.config.js`
- [ ] Install: shadcn/ui, react-hook-form, zod, lucide-react, embla-carousel, velite (or next-mdx-remote)
- [ ] Add ESLint, Prettier, Husky, lint-staged
- [ ] Configure Tailwind v4 with brand tokens (placeholder palette — refine after screenshots)
- [ ] Build `Header`, `Footer`, root `layout.tsx`, root `page.tsx` (placeholder)
- [ ] Wire `lib/business.ts` with NAP + social URLs (single source of truth)
- [ ] Add `app/sitemap.ts`, `app/robots.ts` (minimal)
- [ ] Add `<JsonLd>` for global Organization + WebSite schema
- [ ] CI: lint + typecheck + build + Lighthouse against home
- [ ] Deploy to Vercel preview, set up `staging.salesolution.net`

**Exit**: Preview URL renders a blank but valid Next.js page with correct schema, sitemap, robots.

## Phase 2 — Static page rebuilds (Weeks 2–4)

**Goal**: All 36 pages render with correct content, metadata, and schema.

Order by traffic value (highest first; estimate via Search Console if available):

1. `/` (home)
2. `/services/`
3. `/services/[slug]/` (all 5 children)
4. `/contact-me/`
5. `/unlock-growth-audit/` + sub-pages
6. `/book-growth-call/`
7. `/future-proof-your-seo/`
8. `/constraint-sprint/` + sub-page
9. `/category/blog/` (blog hub)
10. `/guides/` (guide hub) + 3 category pages
11. `/career-paths/` + 2 entries
12. `/service-areas/`
13. All legal pages (privacy, terms, disclaimer, opt-out, communication preferences)

For each page:
- Build template & components
- Wire content (MDX or inline props)
- Add `generateMetadata` with parity-matched title/desc/OG/canonical
- Add per-page JSON-LD (Service / FAQPage / etc.)
- Add `<Breadcrumbs>` where deep
- Verify against the live page (visual diff + content diff)

**Exit**: All 36 pages render. Each one validated in Rich Results Test.

## Phase 3 — Content migration (parallel with Phase 2; Weeks 2–4)

**Goal**: All 19 posts, 9 guides, 2 career paths live as MDX.

For each post/guide:
- Pull current HTML from production (`curl <url>`)
- Convert to MDX (script: `node scripts/wp-to-mdx.mjs <url>` — write a one-off)
  - Strip WP shortcodes
  - Extract frontmatter: title, slug, publishedAt, updatedAt, coverImage, faq (if present)
  - Preserve image URLs (`/wp-content/uploads/*`) — these will be rewritten at edge
  - Re-anchor headings if needed
- Manual QA: read through each piece, fix any conversion artifacts
- Add `related` field per post

**Exit**: Diff between live HTML and rendered MDX is purely structural (Next.js prose styles vs. WP styles), with zero content loss.

## Phase 4 — Forms & integrations (Week 4)

**Goal**: Every conversion path works on staging, end-to-end.

- [ ] Build `LeadForm` component (multi-step, react-hook-form + zod)
- [ ] Server action: submit to HubSpot Forms API
- [ ] Fallback: Resend internal notification
- [ ] Add Turnstile to forms
- [ ] Build GTM container with all tags (GA4, Google Ads, Meta Pixel)
- [ ] Wire Cookiebot (or chosen consent vendor) with Google Consent Mode v2 default
- [ ] Test form submit → HubSpot record appears → Meta Pixel `Lead` event in Test Events → Google Ads conversion in Tag Assistant

**Exit**: 3 dry-run submissions per funnel land in HubSpot with correct properties and fire all expected tags.

## Phase 5 — SEO verification (Week 5)

**Goal**: Confidence that cutover won't regress search visibility.

- [ ] Write `scripts/verify-parity.mjs` that, for each URL in inventory:
  - Fetches live URL and staging URL
  - Compares `<title>`, meta description, canonical, OG tags, JSON-LD types
  - Reports diffs
- [ ] Fix every reported diff
- [ ] Run Lighthouse against staging — 5 representative pages per template type
- [ ] Validate sitemap.xml against XML schema
- [ ] Run schema.org validator on 5 representative pages
- [ ] Run broken-link check across all internal links
- [ ] Manual review: top 10 pages by organic traffic, side-by-side with live

**Exit**: Zero parity diffs; Lighthouse mobile ≥ 90; no broken links.

## Phase 6 — Cutover (1 day, scheduled low-traffic window)

**Pre-cutover (T-7 days)**:
- [ ] Lower TTL on `salesolution.net` DNS records to 5 minutes
- [ ] Export Rank Math Redirections list; bake into `next.config.js`
- [ ] Lock content edits on WordPress (no new posts during transition)
- [ ] Final staging walkthrough with Artur

**Cutover hour**:
- [ ] Take final WordPress backup
- [ ] Final content sync: any posts added since last MDX export, mirror them
- [ ] DNS swap: point `salesolution.net` A/CNAME to Vercel/Cloudflare
- [ ] Submit new sitemap in Google Search Console immediately
- [ ] Submit new sitemap in Bing Webmaster Tools

**Post-cutover (T+1 hour)**:
- [ ] Curl every URL in inventory; confirm 200 or correct 301
- [ ] Confirm GA4 realtime shows traffic
- [ ] Confirm Meta Pixel Events Manager shows events
- [ ] Confirm one test form submit lands in HubSpot
- [ ] Test a Google Ads conversion fire

**Post-cutover (T+24 hours)**:
- [ ] Compare 24h traffic to 7-day average (GA4)
- [ ] Compare 24h impressions to 7-day average (Search Console)
- [ ] Crawl with Screaming Frog or equivalent; check status code distribution
- [ ] Check Sentry for client errors

**Exit**: 24h of clean metrics, no error spikes.

## Phase 7 — Stabilization & decommission (Weeks 6–8)

- [ ] Daily Search Console review for 30 days; address any "Crawled — currently not indexed" or 4xx
- [ ] After 30 days clean: cancel WP plugin licenses (see [08-integrations.md](08-integrations.md#decommission-checklist))
- [ ] After 30 days clean: spin down WordPress instance, keep DB export
- [ ] Post-mortem document: what worked, what to improve next time

## Estimated timeline

| Phase | Duration | Can parallelize with |
|-------|---------|----------------------|
| 0 — Decisions | 1–2 days | — |
| 1 — Foundation | 1 week | — |
| 2 — Static pages | 3 weeks | 3, 4 |
| 3 — Content migration | 3 weeks | 2, 4 |
| 4 — Forms & integrations | 1 week | 2, 3 |
| 5 — SEO verification | 1 week | — |
| 6 — Cutover | 1 day | — |
| 7 — Stabilization | 4 weeks | — |

**Total wall-clock: ~6–8 weeks** assuming solo dev + Artur as PM and content QA.

## Rollback plan

If post-cutover something breaks badly:

1. Within first 24h: DNS-revert to WordPress IPs (5-min TTL change means propagation is fast)
2. After 24h: identify the specific issue and patch on Next.js (rollback gets harder once new HubSpot contacts have flowed in via the new path)
3. Keep WordPress instance warm for **at least 30 days** post-cutover — do not delete

## Communication plan

- [ ] Inform any active retainer clients of brief planned maintenance window (even if zero downtime is expected)
- [ ] Post on LinkedIn / X about the new site once stable (also serves as backlink signal)
- [ ] Update Google Business Profile if address changed in the process
