# Execution Roadmap — Locked Decisions & Step Sequence

Live working document for the build phase. Captures decisions as they're locked, so the strategy docs stay reference and this stays operational.

**Status:** Step 1 (foundation scaffold) in progress.

---

## Locked decisions (2026-05-19)

| # | Decision | Pick | Why |
|---|----------|------|-----|
| D1 | Display font | **Manrope** via `next/font/google` | Free; variable axis 200–800; ~95% visual continuity with Circular Std; no Lineto license headache |
| D2 | Primary CTA color strategy | **Keep all three** semantically | Blue `#2652ef` for audit funnels, green `#09bc8a` for strategy calls, purple `#9826ef` for packages page — preserves current intent rather than flattening it |
| D3 | WooCommerce + Client Portal | **Drop both** | `/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `/clients/`, `/client-portal-login/` return 410 Gone. If ecommerce is needed later, separate subdomain (`shop.salesolution.net`) |
| D4 | CMS | **Sanity v3** with embedded Studio at `/studio` | Satisfies admin UI + AI write API + draft-preview-URL workflow. Free up to 10k docs. |
| D4a | Internal dashboard (`/admin`) | **Build later** as separate Next.js route, post-launch | For non-content needs: lead pipeline view, content-generation queue, internal project status. Data layer TBD when scope concrete (likely Supabase). HubSpot remains canonical for forms/leads. |

## Deferred decisions (will block specific later steps)

| # | Decision | Blocks step | Note |
|---|----------|-------------|------|
| D5 | Canonical business address | ~~Step 4~~ **LOCKED 2026-05-19**: `17071 W Dixie Hwy, North Miami Beach, FL 33160`. Sweep WordPress + Google Business Profile at cutover. | — |
| D6 | Hosting target | ~~Step 14~~ **LOCKED 2026-05-20**: **Vercel**. See [vercel-deploy.md](vercel-deploy.md) for the deploy guide. | — |
| D7 | Consent banner vendor | ~~Step 13~~ **LOCKED 2026-05-20**: **self-built** (default-deny, Consent Mode v2). Swap to Cookiebot/Klaro later by replacing one component. | — |
| D8 | Newsletter platform | Step 7 (lead-gen rebuild) | "Weekly Turbulence Brief" — HubSpot, ConvertKit, Beehiiv, Buttondown |
| D9 | Service-areas: programmatic or remove? | Step 11 | Currently "Coming Soon" placeholders. Recommendation: stub the hub, build programmatic pages later |
| D10 | Comments on blog/guides | Step 9/10 | Default: drop (low signal). Confirm before launch |
| D11 | Address mismatch reconciliation everywhere it appears | Step 14 (cutover) | Once D5 is picked, sweep all pages + Google Business Profile |

---

## Step sequence

Each step ships as one reviewable chunk. Mark complete here when each step's verification criterion passes.

| # | Step | Verification | Status |
|---|------|--------------|--------|
| 1 | **Scaffold**: Next.js 15 + TS + Tailwind v4 + App Router, trailingSlash on, `pnpm dev` boots | Hitting `localhost:3000` renders the default Next.js page | ⏳ in progress |
| 2 | **Sanity CMS**: install `sanity`, `next-sanity`, embed Studio at `/studio`, define `post` / `guide` / `careerPath` / `testimonial` / `service` / `faq` schema types, draft mode wired | `/studio` loads, can create a draft post and view its preview URL | pending |
| 3 | **Design system**: `globals.css` with the `@theme` block from `design-tokens.md`, Manrope + Inter wired via `next/font`, base `prose` styles | `/_dev/styleguide` shows the H1–H4 ramp, button variants, card shadows, color swatches | pending |
| 4 | **Global shell**: `Header` + `Footer` + root `layout.tsx`, `lib/business.ts` (NAP from D5), global Organization + WebSite JSON-LD | Every route renders the shell; Rich Results Test validates the schema | pending |
| 5 | **SEO foundation**: `app/sitemap.ts`, `app/robots.ts`, redirect map in `next.config.ts`, `<JsonLd>` component, `<Breadcrumbs>` | `/sitemap.xml` lists every planned URL; `/robots.txt` matches spec | pending |
| 6 | **Home (`/`)**: all 18 sections, 3 viewports | Side-by-side diff vs `screenshots/desktop-1440/home.png` | pending |
| 7 | **Lead-gen funnels** (4 pages + thank-yous): `/unlock-growth-audit/`, `/future-proof-your-seo/`, `/book-growth-call/`, `/constraint-sprint/` | Side-by-side diff per page; CTA per funnel matches D2 color mapping | pending |
| 8 | **Service hub + 5 children**: `/services/`, `/services/[slug]/` for ai-seo, content-writing, web-dev, content-packages, outbound-email | Side-by-side diff per page | pending |
| 9 | **Contact form**: `<LeadForm>` reusable component, multi-step, server action → HubSpot Forms API + Resend fallback, Turnstile bot check | Test submission lands in HubSpot with all fields | pending |
| 10 | **Blog hub + post template**: `/category/blog/`, `/[slug]/` for 19 posts (Sanity-managed) | Posts render, TOC, related, JSON-LD `Article` | pending |
| 11 | **Guides hub + guide template**: `/guides/`, `/guides/[slug]/` for 9 guides, series navigation | Diff vs screenshots | pending |
| 12 | **Remaining pages**: career paths, service-areas hub, 5 legal pages, sitemap HTML page if kept | All paths return 200 | pending |
| 13 | **Integrations**: GTM container, GA4, Google Ads (`AW-17897120027`), Meta Pixel (`1246284374271362`), consent banner (D7), HubSpot tracking | Tag Assistant shows all tags firing post-consent | pending |
| 14 | **Pre-launch QA**: parity script vs production, Lighthouse ≥90 mobile, broken-link check, Rich Results Test on 5 templates, redirect-map verification, hosting (D6), DNS plan | All checks green | pending |
| 15 | **Cutover**: DNS swap, Search Console resubmit, monitor 24h | Traffic + impressions match 7-day pre-cutover baseline | pending |
| 16 | **Internal `/admin` dashboard** (post-launch): leads beyond HubSpot, content-gen queue, project tracking. Data layer chosen when scope is concrete (likely Supabase). | Auth-gated `/admin` route loads, shows leads + content queue | pending |

---

## Stack locked

```
Framework         Next.js 15 (App Router)
Language          TypeScript (strict)
Package manager   pnpm
Styling           Tailwind CSS v4 (@theme tokens)
UI primitives     shadcn/ui (Radix-wrapped, copied into repo)
Icons             lucide-react
Carousel          embla-carousel-react
Forms             react-hook-form + zod
Forms backend     Next.js Server Actions → HubSpot Forms API; Resend fallback
Bot check         Cloudflare Turnstile
CMS               Sanity v3 (embedded Studio at /studio)
Content rendering @portabletext/react for Sanity body content
Display font      Manrope (next/font/google)
UI font           Inter (next/font/google)
Analytics         Google Tag Manager (container for GA4, Google Ads, Meta Pixel, HubSpot)
Consent           TBD (D7)
Error tracking    Sentry
Hosting           TBD (D6)
```

---

## File-system layout (target)

```
salesolution-next/                  ← workspace root (this folder)
├── app/                            ← Next.js App Router
├── components/                     ← React components
├── content/                        ← MDX legal pages only (Sanity for posts/guides)
├── lib/                            ← business.ts, schema.ts, etc.
├── public/                         ← static assets
├── sanity/                         ← Sanity schema + config
│   ├── schemas/
│   ├── lib/
│   └── env.ts
├── scripts/                        ← maintenance scripts
├── styles/
├── docs/                           ← strategy + this roadmap
│   └── strategy/
│       ├── screenshots/
│       ├── scripts/                ← capture-screenshots.mjs, extract-tokens.mjs
│       ├── design-tokens.{md,json}
│       └── ...
├── backup/                         ← reference templates (not deployed)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts (or via @theme in globals.css for v4)
└── package.json
```
