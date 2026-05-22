# Launch Checklist

Live tracking of what's done and what's left before pointing salesolution.net at Vercel. Update this file as items are completed or new issues surface.

**Last updated:** 2026-05-21 *(added security headers, AI bot rules, llms.txt, security.txt, branded 404, Vercel Analytics, Upstash rate limiter, Sentry integration)*

---

## ✅ Done

### Routing & redirects
- [x] Added redirects for `/unlock-growth-audit/book-slot/`, `/content-restricted/`, `/sitemap/`, `/feed/`, `/comments/feed/`
- [x] Wildcard redirect `/guide/:slug*` → `/guides/:slug*` (covers singular legacy URLs)
- [x] Redirects for 2 unmigrated career paths → `/career-paths/` hub
- [x] All redirects verified at 308 via smoke test against local prod build

### SEO files
- [x] `robots.txt` aligned to modern best practice (minimal disallow set)
- [x] **AI / LLM crawler rules** in `robots.txt` — explicit ALLOW for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider, CCBot, cohere-ai, Amazonbot, YouBot, DuckAssistBot
- [x] `sitemap.xml` already wired — pulls dynamic routes from Sanity at build time
- [x] `/llms.txt` — LLM-friendly site index ([public/llms.txt](public/llms.txt))

### Brand assets (all generated via `next/og`, no PNGs to maintain)
- [x] `/icon` — 32×32 favicon ([app/icon.tsx](app/icon.tsx))
- [x] `/apple-icon` — 180×180 iOS icon ([app/apple-icon.tsx](app/apple-icon.tsx))
- [x] `/logo.png` — 512×512 for JSON-LD ([app/logo.png/route.tsx](app/logo.png/route.tsx))
- [x] `/opengraph-image` — 1200×630 default social card ([app/opengraph-image.tsx](app/opengraph-image.tsx))

### Legal (FL law, AAA Miami-Dade arbitration, $100/6-mo liability cap, 1-year SoL)
- [x] [app/(site)/privacy-policy/page.tsx](app/(site)/privacy-policy/page.tsx) — multi-jurisdiction (GDPR/UK, CCPA/CPRA, Virginia CDPA, Colorado CPA, Florida FDBR, COPPA), names every processor, GPC honored
- [x] [app/(site)/terms-of-service/page.tsx](app/(site)/terms-of-service/page.tsx) — 23 clauses, refunds via signed engagement letter
- [x] [app/(site)/disclaimer/page.tsx](app/(site)/disclaimer/page.tsx) — editorial honesty + hard legal protection merged
- [x] Physical address (CAN-SPAM compliance) rendered in footer via [components/layout/Footer.tsx](components/layout/Footer.tsx)
- [x] Consent banner with Consent Mode v2 default-deny ([components/integrations/ConsentBanner.tsx](components/integrations/ConsentBanner.tsx))
- [x] `/.well-known/security.txt` — vulnerability disclosure contact ([public/.well-known/security.txt](public/.well-known/security.txt))

### Security
- [x] HTTP security headers in [next.config.ts](next.config.ts): HSTS (2yr, preload), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- [x] Rate limiting on `/api/lead` (5 req / 10 min / IP) — **Upstash-backed sliding window** with in-memory fallback ([lib/rate-limit.ts](lib/rate-limit.ts))
- [x] Server-side Zod validation on lead form
- [x] Turnstile bot-check support (env-gated; activate by setting `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`)
- [x] Sentry instrumentation env-gated ([instrumentation.ts](instrumentation.ts), [instrumentation-client.ts](instrumentation-client.ts)) — activate by setting `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`

### Observability
- [x] Vercel Web Analytics + Speed Insights wired in [app/layout.tsx](app/layout.tsx) — cookie-free, no env vars needed (toggle in Vercel dashboard)
- [x] **GA4 tracking strategy + implementation plan** documented in [docs/strategy/ga4.md](docs/strategy/ga4.md)
- [x] **GA4 tracking implementation COMPLETE** (final QA score 9.5/10):
  - [x] [lib/analytics.ts](lib/analytics.ts) — typed `track()`, `setUserProperties`, `setUserId`, `getGaClientId`, `sha256Hex`; discriminated union covers 18 events; consent-gated; PII deny-list; dev-mode echo
  - [x] [lib/analytics-server.ts](lib/analytics-server.ts) — Measurement Protocol failsafe (server-side `generate_lead` dedup'd via `transaction_id`)
  - [x] [lib/use-track-on-view.ts](lib/use-track-on-view.ts) — IntersectionObserver hook for viewport triggers
  - [x] [components/integrations/RouteChangeTracker.tsx](components/integrations/RouteChangeTracker.tsx) — App Router `page_view` on client navigation (Suspense-wrapped)
  - [x] [components/integrations/OutboundLinkTracker.tsx](components/integrations/OutboundLinkTracker.tsx) — delegated `outbound_click` listener
  - [x] [components/integrations/CTAClickTracker.tsx](components/integrations/CTAClickTracker.tsx) — delegated `cta_click` listener with `data-cta` attributes on 31 primary CTAs across 22 files
  - [x] [components/integrations/CalendlyEmbed.tsx](components/integrations/CalendlyEmbed.tsx) — postMessage bridge for `calendly_widget_view` / `calendly_booking_started` / `calendly_booking_completed` + `book_growth_call`, origin-validated
  - [x] [components/forms/LeadForm.tsx](components/forms/LeadForm.tsx) — wired `form_view`/`form_start`/`form_step_complete`/`form_submit`/`form_error`/`generate_lead` + page-specific echoes + hashed-email `setUserId` + `setUserProperties` (5 callsites updated with `formId`/`formName`/`leadType` props)
  - [x] [components/sections/services/ServicesHero.tsx](components/sections/services/ServicesHero.tsx) — `service_view` viewport event on 5 service pages
  - [x] [components/sections/content-packages/PackagesGrid.tsx](components/sections/content-packages/PackagesGrid.tsx) — `pricing_tier_view` per tier card
  - [x] [app/api/lead/route.ts](app/api/lead/route.ts) — Measurement Protocol failsafe on lead success, with `computeLeadValue` helper
  - [x] [lib/lead-form/schema.ts](lib/lead-form/schema.ts) — accepts `gaClientId` + `submissionId` from client
  - [x] [lib/consent.ts](lib/consent.ts) — **GPC honored** (`navigator.globalPrivacyControl` overrides marketing consent per CCPA/CPRA + Colorado CPA)
  - [x] [app/(site)/privacy-policy/page.tsx](app/(site)/privacy-policy/page.tsx) — discloses SHA-256 hashed `user_id` sent to GA4 (raw email never sent)

### UX
- [x] Branded 404 page ([app/not-found.tsx](app/not-found.tsx))
- [x] Sticky TOC on legal pages
- [x] Calendly inline widget on `/book-growth-call/` with LeadForm fallback

### Metadata
- [x] Root `metadataBase`, default `openGraph`, Twitter card in [app/layout.tsx](app/layout.tsx)
- [x] JSON-LD: Organization + WebSite global graph, per-page Article/Service/Product+Offers/Breadcrumb/FAQ schemas
- [x] Canonical absolute URLs on every page

### Sanity content diff
- [x] 19/19 blog posts present
- [x] 9/9 guides present
- [x] 2/2 career paths missing — covered by redirects (re-migrate to Sanity if you want them live)

---

## 🔄 Pre-DNS-cutover (Vercel project)

### Environment variables — Production + Preview
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` (from sanity.io/manage)
- [ ] `NEXT_PUBLIC_SANITY_DATASET=production`
- [ ] `NEXT_PUBLIC_SANITY_API_VERSION=2026-05-19`
- [ ] `SANITY_API_READ_TOKEN` (Sanity → Manage → API → Tokens → Viewer)
- [ ] `SANITY_PREVIEW_SECRET` — generate with `openssl rand -hex 32`
- [ ] `SANITY_WEBHOOK_SECRET` — generate with `openssl rand -hex 32`
- [ ] `NEXT_PUBLIC_GA4_ID=G-F0DJT7P1RQ`
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17897120027`
- [ ] `NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244186307`
- [ ] `NEXT_PUBLIC_META_PIXEL_ID=1246284374271362` *(confirm in Meta Business Manager)*
- [ ] `HUBSPOT_PORTAL_ID=244186307`
- [ ] `HUBSPOT_FORM_ID` — from HubSpot form embed code
- [ ] `RESEND_API_KEY` — from resend.com/api-keys
- [ ] `RESEND_FROM_EMAIL=leads@salesolution.net`
- [ ] `RESEND_TO_EMAIL` — your inbox for lead notifications
- [ ] `NEXT_PUBLIC_CALENDLY_URL` — `https://calendly.com/<your-handle>/<event-slug>`
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — production rate limiter ([console.upstash.com](https://console.upstash.com)). Without these, `/api/lead` uses an in-memory limiter that won't actually block determined spammers across Vercel cold starts.
- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` — error tracking ([sentry.io](https://sentry.io); free tier covers 5k errors/month). Without these, JS exceptions in production are invisible.
- [ ] `SENTRY_AUTH_TOKEN` (optional) — uploads source maps so stack traces show real line numbers

### DNS / email deliverability
- [ ] Verify `salesolution.net` is a verified sender in Resend (SPF + DKIM records on DNS)
- [ ] **DMARC policy** — add TXT record `_dmarc.salesolution.net` with `v=DMARC1; p=quarantine; rua=mailto:dmarc@salesolution.net; pct=100`. Without DMARC, lead notification emails may go to spam.
- [ ] Verify MX records are configured (need at least one mailbox provider — Google Workspace, Fastmail, etc.) so `privacy@`, `legal@`, `security@`, `leads@` actually receive mail
- [ ] Set up email forwarding for `security@salesolution.net` (referenced in `/.well-known/security.txt`)

### Third-party / CRM config
- [ ] Configure Sanity webhook → `https://salesolution.net/api/revalidate` with `SANITY_WEBHOOK_SECRET`
- [ ] Export active Rank Math redirects from WordPress admin (Rank Math → Redirections → Export) and merge into [lib/redirects.ts](lib/redirects.ts)
- [ ] HubSpot — verify the form ID maps to the right form, and that any auto-responder emails sent by HubSpot include the physical address + unsubscribe link (CAN-SPAM)
- [ ] Calendly — verify the event has correct duration, buffer times, notification template, and post-booking confirmation copy
- [ ] Turnstile (optional) — create site key at dash.cloudflare.com/?to=/:account/turnstile if you want production bot protection

---

## 🚀 Cutover

- [ ] Add custom domain `salesolution.net` in Vercel (and `www` → redirect to apex)
- [ ] Update DNS at registrar:
  - A record `@` → `76.76.21.21`
  - CNAME `www` → `cname.vercel-dns.com`
- [ ] Wait for SSL cert provisioning (~5 min)
- [ ] Verify domain ownership in Google Search Console (TXT record method to avoid having to re-verify after launch)
- [ ] Re-test in Vercel preview before flipping DNS:
  - [ ] Lead form submission lands in inbox + HubSpot
  - [ ] Book-call page renders Calendly widget
  - [ ] All three legal pages render at full length with sticky TOC
  - [ ] `/icon`, `/logo.png`, `/opengraph-image` return images
  - [ ] `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/.well-known/security.txt` return correct content
  - [ ] At least 3 spot-check redirects fire (e.g. `/feed/`, `/contact/`, `/wp-admin/`)
  - [ ] Visit a 404 URL → branded "Wrong turn. No page here." renders
  - [ ] Security headers present in response (check Network tab for HSTS, X-Frame-Options, etc.)
  - [ ] Cookie banner appears on first visit and persists choice on reload

---

## 📈 Post-launch verification

### Search & indexing
- [ ] Submit new sitemap in Google Search Console: `https://salesolution.net/sitemap.xml`
- [ ] In GSC, request re-indexing for `/services/` (was a 301 to `/services/ai-seo/` on the old site; now a real hub)
- [ ] Submit sitemap in Bing Webmaster Tools (powers Bing + DuckDuckGo + ChatGPT search index)
- [ ] Validate JSON-LD: paste a few URLs into [Google Rich Results Test](https://search.google.com/test/rich-results) — confirm Organization, BreadcrumbList, Article schemas pass
- [ ] Validate OG cards: paste homepage + 2 blog URLs into [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Run [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) on a few URLs

### Analytics
- [ ] Verify GA4 Realtime shows production traffic
- [ ] Verify Meta Pixel is firing in Meta Events Manager → Test Events
- [ ] Verify HubSpot tracking is recording sessions in HubSpot Activities
- [ ] Confirm Consent Mode v2 signals reach GA4 (Admin → Data display → Consent Settings)

### Performance + accessibility (run [Lighthouse](https://pagespeed.web.dev/) on these URLs)
- [ ] Homepage — target ≥90 across Perf / Accessibility / Best Practices / SEO
- [ ] `/services/ai-seo/` — same
- [ ] `/book-growth-call/` (after Calendly URL configured)
- [ ] One blog post and one guide
- [ ] Fix any "Insufficient color contrast" or "Image missing alt" warnings (ADA exposure)
- [ ] Verify all images use `next/image` for automatic optimization

---

## 📋 Recommended (not blockers, but high-value)

### Legal / compliance
- [ ] **Have a Florida-licensed attorney review the three legal pages.** Drafted to be enforceable, but local counsel can flag insurance/IP/contract specifics
- [ ] **Errors & Omissions (E&O) / Professional Liability insurance** — strongly recommended for consultancy work; complements the liability cap in ToS
- [ ] **Master Services Agreement (MSA) template** — engagement letters reference it; ensure you have one drafted (separately from site ToS)
- [ ] **Data Processing Addendum (DPA) template** — needed when EU/UK clients ask for one under GDPR Article 28
- [ ] **Subprocessor list** — publish if you process EU client data (Vercel, Sanity, Resend, HubSpot, etc.)

### Operations
- [x] **Error tracking** — Sentry integration wired (set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` in Vercel to activate)
- [x] **Vercel Web Analytics + Speed Insights** — wired in code; just toggle on in Vercel project settings
- [x] **Production-grade rate limiter** — Upstash sliding-window backed (set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
- [ ] **Uptime monitoring** — [Better Uptime](https://betteruptime.com) or [UptimeRobot](https://uptimerobot.com); alert on `/api/lead` 5xx so failed leads don't vanish silently
- [ ] **Create Upstash Redis database** at [console.upstash.com](https://console.upstash.com) (free tier: 10k commands/day, more than enough for rate-limit traffic)
- [ ] **Create Sentry project** at [sentry.io](https://sentry.io) and grab the DSN

### GA4 admin configuration (do in GA4 web UI, post-launch)
- [x] ~~Code-side implementation~~ — complete (see Observability section above)
- [x] ~~Privacy policy disclosure of hashed `user_id`~~ — done
- [ ] **Configure GA4 admin per [docs/strategy/ga4.md](docs/strategy/ga4.md) §2** — set data retention to 14 months; add referral exclusions for `calendly.com`, `hubspot.com`, `stripe.com`; turn Google Signals OFF (privacy-first); register key events: `generate_lead`, `audit_request`, `book_growth_call`, `constraint_sprint_apply`, `calendly_booking_completed`
- [ ] **Generate `GA4_API_SECRET`** in GA4 admin → Data Streams → Web → Measurement Protocol API secrets → Create; paste into Vercel env vars
- [ ] **Build Funnel Explorations** A–E per [docs/strategy/ga4.md](docs/strategy/ga4.md) §4 (Audit / Strategy call / Content→lead / Service evaluation / Constraint Sprint)
- [ ] **Build 6 Explore reports** per §8 (Lead conversion overview, Form funnel, Content attribution, Service heatmap, Calendly funnel, Anonymous vs MQL)
- [ ] **Mirror conversions in Google Ads** per §6 (`Lead — Audit Request`, `Lead — Strategy Call`, `Lead — Sprint Application`, `Lead — Generic`)
- [ ] **Run QA checklist** per [docs/strategy/ga4.md](docs/strategy/ga4.md) §12 in DebugView before declaring tracking live

### SEO polish
- [ ] **Per-service OG images** — service pages currently inherit the default `/opengraph-image`; custom-per-service would lift CTR on social shares
- [ ] **Bing Webmaster Tools** verification (powers Bing + ChatGPT search index)
- [ ] **IndexNow** — submit URL changes to Bing/Yandex in real-time (Vercel can do this automatically)
- [ ] **Internal-link audit** — run [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) or `npx unlighthouse` to find orphan pages and broken links
- [ ] **Re-upload `/locations.kml`** to `/public/locations.kml` if you care about local Google Business SEO
- [ ] **Migrate the 2 career-path pages** back into Sanity if you want them live (currently redirected to hub)

### Nice-to-haves
- [ ] **PWA manifest** at `/public/manifest.json` if you want install-to-home-screen support
- [ ] **`/humans.txt`** — old-school credits file; harmless brand signal
- [ ] **GTM container** consolidation — easier tag management without code deploys
- [ ] **Site search** — currently no internal search; not claimed in schema (correct), but worth considering for the guides library

---

## 🐛 Known issues / decisions

- **`/icon` and `/opengraph-image` 308-redirect to their trailing-slash variants.** This is `trailingSlash: true` in [next.config.ts](next.config.ts) applied universally. Browsers follow the 308 transparently — slight perf cost on cold cache, but functional. Not worth the config complexity to except them.
- **Career paths retired.** The two career-path qualification pages from the legacy site (SEO Specialist, Content Strategy Specialist) were 2023/2024 content. Decided to redirect to the hub rather than block launch on content migration. Re-port to Sanity if you want them back.
- **No GTM container.** Direct gtag chosen to match the live site's setup and avoid attribution gap at cutover. Can move to GTM later if tag management becomes painful.
- **No Content-Security-Policy header.** gtag, GTM, Meta Pixel, HubSpot, and Calendly all inject inline + cross-origin scripts that would each require per-vendor nonces or strict-dynamic. Tradeoff is "risk a CSP that silently breaks tracking" vs "no CSP." Skipped for now. Revisit when consolidating tags inside a GTM container — single source of inline scripts makes CSP feasible.
- **Rate limiter falls back to in-memory** when Upstash env vars are not set. In production on Vercel, set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` so the limiter survives cold starts and works across serverless instances.
