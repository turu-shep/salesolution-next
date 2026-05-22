# Proposed Next.js Tech Stack

Optimized for a content-heavy marketing site with conversion funnels, a blog, and long-form guides. Goals: fast time-to-first-deploy, low hosting cost, easy authoring, no plugin sprawl.

## 1. Framework & language

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15+ (App Router)** | RSC for fast static pages, Metadata API for SEO parity, route handlers for forms, built-in `sitemap.ts`/`robots.ts` |
| Language | **TypeScript (strict)** | Catch shape mismatches in MDX frontmatter and JSON-LD at compile time |
| Runtime | **Node.js 20+** | Sharp image processing, modern Node APIs |
| Package manager | **pnpm** | Fast installs, strict deps |

## 2. Styling & UI

| Layer | Choice | Why |
|-------|--------|-----|
| CSS | **Tailwind CSS v4** | Zero-runtime, design tokens via CSS vars, fits the "replace Bootstrap" goal |
| Components | **shadcn/ui** primitives | Copy-into-codebase Radix wrappers — own the code, no dep |
| Icons | **lucide-react** | Tree-shakeable SVG set |
| Fonts | `next/font/google` | Self-host fonts at build time, zero CLS |
| Carousels | **Embla** | Lightweight, accessible, replaces Owl Carousel |
| Animations | **Framer Motion** (selectively) | Used only for hero/CTA reveal; tree-shake aggressively |

## 3. Content

| Need | Choice | Why |
|------|--------|-----|
| Blog posts / guides / career paths | **MDX** in `content/**` (Git-versioned) | No CMS lock-in for v1; PR-based editing; build-time rendering |
| MDX compiler | **`next-mdx-remote` (RSC)** or **Contentlayer alternative `velite`** | RSC-compatible, build-time content graph with type safety |
| Syntax highlighting | **Shiki** at build time | No client JS; uses VS Code grammars |
| Long-form prose | **`@tailwindcss/typography` (prose)** | Default readable styles |
| Open Graph images | **`@vercel/og` / Satori** | Generated at the edge per post |
| CMS (v1.1 if needed) | **Sanity** or **Payload** | Add later only if Artur wants editing without git |

## 4. Forms

| Need | Choice | Why |
|------|--------|-----|
| Form rendering | **react-hook-form** + **zod** | Type-safe validation client + server |
| Submit path | **Next.js Server Action** | No separate API needed; runs on same host |
| Persistence / lead routing | **HubSpot Forms API** (already in use today) | Keeps CRM data flowing without re-engineering |
| Fallback / spam catch | **Resend** for email + **Cloudflare Turnstile** for bot check | Privacy-friendly captcha; email-only fallback if HubSpot is down |
| Multi-step state | `react-hook-form` + URL query for resumability | Avoids losing form data on accidental reloads |

## 5. Analytics, pixels & consent

See full breakdown in [08-integrations.md](08-integrations.md). Short version:

| Tool | Implementation |
|------|----------------|
| Google Tag Manager | `@next/third-parties/google` — `<GoogleTagManager gtmId="GTM-XXXX" />` |
| GA4 | Loaded through GTM |
| Google Ads conversion (`AW-17897120027`) | Loaded through GTM |
| Meta Pixel (`1246284374271362`) | Loaded through GTM (firing rules per event) |
| HubSpot tracking | `<Script>` after consent |
| Consent | **Cookiebot** or **Klaro** or self-built — implementing Google Consent Mode v2; gates all marketing tags |

Rationale for GTM: replaces three separate WP plugins (MonsterInsights, PixelYourSite, HubSpot script injection) with one container Artur can edit without redeploying.

## 6. Hosting & deployment

| Concern | Recommendation |
|---------|----------------|
| Host | **Vercel** (best Next.js DX) or **Cloudflare Pages** (cheapest for marketing site) |
| Domain | Keep `salesolution.net`; switch nameservers to Cloudflare if not already |
| Image origin | Cloudflare R2 (or S3 + CloudFront); rewrite `/wp-content/uploads/*` → bucket |
| CI | GitHub Actions: lint, typecheck, link-check, Lighthouse CI, deploy preview per PR |
| Preview env | Vercel preview deployments per PR + a permanent `staging.salesolution.net` for stakeholder review |

## 7. Observability

| Need | Tool |
|------|------|
| Error tracking | **Sentry** (free tier) |
| Performance / Core Web Vitals | **Vercel Analytics** or **Cloudflare Web Analytics** + Search Console |
| Uptime | **Better Stack** or Cloudflare Health Checks |
| Build-time SEO checks | `lighthouse-ci`, broken-link check, schema validation |

## 8. Development tooling

| Concern | Choice |
|---------|--------|
| Lint | ESLint w/ `next/core-web-vitals` + `@typescript-eslint` |
| Formatting | Prettier with `prettier-plugin-tailwindcss` |
| Pre-commit | Husky + lint-staged |
| Schema validation | `zod` for MDX frontmatter, `schema-dts` for JSON-LD types |
| Visual regression (optional v1.1) | Chromatic or Percy on Storybook |

## 9. Folder structure (proposed)

```
salesolution-next/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # /
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── services/
│   │   ├── page.tsx                  # /services/
│   │   └── [slug]/page.tsx           # /services/[slug]/
│   ├── (marketing)/                  # route group, no URL impact
│   │   ├── unlock-growth-audit/
│   │   ├── book-growth-call/
│   │   ├── future-proof-your-seo/
│   │   └── constraint-sprint/
│   ├── guides/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── [category]/page.tsx
│   ├── career-paths/
│   ├── service-areas/
│   ├── category/blog/page.tsx        # blog hub URL preserved
│   ├── [slug]/page.tsx               # blog posts at root (LAST — most generic dynamic route)
│   ├── contact-me/page.tsx
│   ├── opt-out-preferences/page.tsx
│   ├── privacy-policy/page.tsx
│   ├── terms-of-service/page.tsx
│   └── api/
│       ├── lead/route.ts             # form submission → HubSpot
│       └── og/route.tsx              # OG image generation
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── sections/                     # Hero, StatRow, FAQ, etc.
│   ├── content/                      # MDX-aware components
│   ├── layout/                       # Header, Footer, ConsentBanner
│   └── seo/                          # JsonLd, generateMetadata helpers
├── content/
│   ├── posts/
│   ├── guides/
│   ├── career-paths/
│   ├── services/                     # MDX for each service detail page
│   ├── legal/
│   ├── testimonials/
│   └── faqs/
├── lib/
│   ├── business.ts                   # NAP, social URLs, single source of truth
│   ├── stats.ts                      # the stat row data
│   ├── content.ts                    # MDX loaders (getAllPosts, getPost, etc.)
│   ├── schema.ts                     # JSON-LD builders
│   ├── analytics.ts                  # GTM helpers, consent state
│   └── redirects.ts                  # exported, also consumed by next.config.js
├── public/
│   ├── images/                       # new images live here
│   └── locations.kml
├── styles/
│   └── globals.css
├── docs/strategy/                    # this folder
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Important routing note**: `app/[slug]/page.tsx` (root-level blog posts) is the most generic dynamic route. It will catch anything not matched by a more specific path. Use `generateStaticParams` returning the post slug list, and add `notFound()` for unknown slugs — do not let it accidentally render arbitrary URLs.

## 10. Build & runtime characteristics

- **All routes are statically generated** at build time (RSC + `generateStaticParams`)
- Forms use server actions — minimal serverless function footprint
- ISR only on routes that need it (none expected for v1)
- Bundle: target ≤100 KB JS per route after gzip; the WP site currently ships ~600 KB+ between jQuery, Bootstrap, Owl, MonsterInsights, PixelYourSite scripts

## 11. What this replaces

| WordPress plugin | Replaced by |
|------------------|-------------|
| Rank Math SEO Pro | Next.js Metadata API + `JsonLd` component + `app/sitemap.ts` + `app/robots.ts` |
| MonsterInsights (GA Premium) | GTM via `@next/third-parties/google` |
| PixelYourSite | GTM container with custom event triggers (form submit, scroll, time on page, download) |
| Complianz GDPR Premium | Cookiebot or Klaro (with Google Consent Mode v2 wiring) |
| Link Whisper Premium | Build-time linter + manual MDX links |
| HubSpot WP plugin | HubSpot tracking script + Forms API server action |
| WordPress (CMS) | MDX in Git (v1) / Sanity (v1.1 optional) |
| Custom theme (jQuery/Bootstrap/Owl) | React/Tailwind/Embla |

All commercial plugin licenses can be cancelled post-launch — saves ~$1.5–3k/yr.
