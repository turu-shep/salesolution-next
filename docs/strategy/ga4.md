# GA4 Tracking Strategy — Sale Solution

Owner: Artur Shepel  ·  Property: `G-F0DJT7P1RQ`  ·  Last revised: 2026-05-21

This document is the single source of truth for what Sale Solution measures, how each event is implemented in the Next.js App Router codebase, and how the data maps to Google Ads, Meta Pixel, and HubSpot. The site already loads GA4 through [components/integrations/Analytics.tsx](../../components/integrations/Analytics.tsx) behind a default-deny Consent Mode v2 layer ([components/integrations/ConsentBanner.tsx](../../components/integrations/ConsentBanner.tsx), [lib/consent.ts](../../lib/consent.ts)); what's missing is a deliberate event taxonomy, funnel definitions, and a single `track()` helper. That's what this plan installs.

---

## Implementation status (code audit 2026-06-18)

The instrumentation in this plan **shipped** — and was extended past this (industrial-only) spec for the multi-vertical pivot. Audited against the codebase. The account-side configuration can't be verified from the repo; it's listed below as "needs confirmation."

**Live in code (verified):**
- Consent Mode v2 default-deny layer: `components/integrations/Analytics.tsx` + `ConsentDefault`, `ConsentBanner.tsx`, `lib/consent.ts`, and the `/opt-out-preferences/` control surface.
- The `track()` helper (`lib/analytics.ts`) and the viewport hook (`lib/use-track-on-view.ts`).
- All trackers mounted in `app/layout.tsx`: `RouteChangeTracker` (App Router page_view), `OutboundLinkTracker`, `CTAClickTracker`, `MetaPixel`, `HubSpotTracking`.
- Calendly `postMessage` bridge (`CalendlyEmbed.tsx`).
- Every event in the §3 taxonomy has a real call-site: `form_view/start/step_complete/field_complete/submit/error`, `generate_lead`, `audit_request`, `book_growth_call`, `constraint_sprint_apply`, `calendly_*`, `service_view`, `pricing_tier_view`, `outbound_click`, `download`, `cta_click`, `page_view`.
- Server-side Measurement Protocol failsafe (`lib/analytics-server.ts`) wired into **three** routes — `app/api/lead`, `app/api/full-growth-quote`, `app/api/revenue-leak-audit` (the spec only planned `/api/lead`).
- Privacy policy discloses GA4 (`G-F0DJT7P1RQ`), Google Ads (`AW-17897120027`), Consent Mode v2, and the hashed `user_id`.
- Client env set: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`.

**Beyond this spec (multi-vertical additions):** new events `full_growth_quote_request` and `catalog_snapshot_request`; new forms `RevenueLeakAuditForm` + `FullGrowthQuoteForm`; new routes `/api/revenue-leak-audit` + `/api/full-growth-quote`. The Revenue Leak Audit fires `generate_lead` + `audit_request`. These aren't reflected in §2.8 (key events), §6 (cross-platform map), or the §4 funnels — those tables still describe the industrial-only set and should be updated to cover them.

**Server-side failsafe — env set locally (2026-06-18).** `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` are now present and non-empty in `.env.local`, and match the names `sendServerEvent` reads (`lib/analytics-server.ts`), so the §5.8 failsafe is live in local/dev. ⚠ `.env.local` is gitignored and does **not** deploy — add the same two vars to **Vercel → Project → Environment Variables (Production)** or the server-side hit stays a no-op in prod.

**Needs confirmation (account-side, not in the repo):**
- GA4 Admin: key events marked (§2.8), 14-month retention, referral exclusions (§2.4), internal-traffic filter (§2.5), Google Signals off (§2.6), User-ID on (§2.7), enhanced-measurement "Form interactions" OFF (§2.3).
- Google Ads conversion actions + GA4 import (§6); Meta Events Manager validation; HubSpot custom events `pe244186307_*` (§6).
- The §8 Explorations and §9 Looker Studio dashboard.
- That events actually land in production DebugView.

---

## 1. Goals & KPIs

The business is a B2B consultancy selling SEO/GEO/content services to industrial e-commerce. Measurement priorities flow from that.

| Tier | KPI | Definition | Target frequency |
|---|---|---|---|
| Primary | **Qualified-lead volume** | `generate_lead` (form submit success) + `calendly_booking_completed` | Weekly |
| Primary | **Cost per qualified lead** | Google Ads spend ÷ qualified-lead volume, per campaign | Weekly |
| Secondary | **Content-to-lead conversion rate** | Sessions starting on a blog/guide that end with `generate_lead` ÷ total blog/guide sessions | Monthly |
| Secondary | **Service-page-to-lead rate** | Sessions touching `/services/*` that end with `generate_lead` ÷ service-page sessions | Monthly |
| Tertiary | **Channel attribution** | Sessions and `generate_lead` by `source / medium / campaign`, with paid (Google Ads, Meta) broken out separately | Weekly |
| Tertiary | **AI-search referral share** | Sessions with referrer matching `chat.openai.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`, `you.com`, `copilot.microsoft.com` | Monthly |
| North star | **MQL → SQL conversion rate** | HubSpot lifecycle stage transition from MQL to SQL, joined back to GA4 via hashed `user_id` | Monthly |

The north-star deliberately spans GA4 and HubSpot — neither tool sees it alone. Section 5 ("User-ID" + "Server-side conversion API") shows the join.

---

## 2. GA4 Property Configuration

Admin steps to perform once in **Admin → Property settings**.

### 2.1 Property basics

- **Property name**: `Sale Solution — salesolution.net`
- **Industry**: Business and industrial markets
- **Reporting time zone**: Europe/Tallinn (matches business operations)
- **Currency**: USD (matches Stripe/Resend invoicing & the pricing tiers in [app/(site)/services/website-content-writing-packages](../../app/(site)/services/website-content-writing-packages))

### 2.2 Data retention

- **User and event data retention**: **14 months** (maximum on the free tier)
- **Reset user data on new activity**: **On**

### 2.3 Data streams

- Single web stream for `https://salesolution.net`
- **Enhanced measurement** — keep ON, but turn OFF *Form interactions* (we instrument forms manually; the auto signal collides with our `form_view` / `form_start` / `form_submit` and produces double-counts on the [LeadForm](../../components/forms/LeadForm.tsx)).
  | Sub-signal | State | Why |
  |---|---|---|
  | Page views | On | App Router still needs the route-change tracker (section 5) — this catches the initial doc load only |
  | Scrolls (90%) | On | Cheap engagement signal |
  | Outbound clicks | On | Backstop for `outbound_click` |
  | Site search | Off | No site search yet |
  | Video engagement | Off | No embedded video on conversion pages |
  | File downloads | On | Catches PDF guide downloads |
  | Form interactions | **Off** | Manual taxonomy below replaces it |

### 2.4 Cross-domain & referral exclusions

No cross-domain measurement — the site is single-origin. But several embedded third parties round-trip through external domains and would otherwise show up as referrers, killing real attribution.

In **Admin → Data Streams → Configure tag settings → List unwanted referrals**, add:

- `calendly.com`
- `hubspot.com`, `hsforms.com`, `hubspotusercontent-na1.net`
- `js.stripe.com`, `checkout.stripe.com`
- `paypal.com`
- `linkedin.com` (only if you run LinkedIn retargeting that bounces through their click router)

### 2.5 Internal traffic filter

In **Admin → Data Streams → Configure tag settings → Define internal traffic**:

- Office IP: (set in production by Artur)
- Home IP: (set in production by Artur)

Create an "Internal Traffic" data filter and set it to **Active** (not Testing) once the values are confirmed.

### 2.6 Google Signals

**Recommendation: Off.**

Pros of enabling: cross-device reporting, demographics, in-market segments.
Cons: forces Google to drop personalized ad cookies even when our consent layer would otherwise keep `ad_personalization='denied'`; introduces a "data thresholding" floor that hides small numbers in reports — a real problem for a B2B funnel with low absolute volumes (a tier with <50 users gets redacted).

For a lead-gen B2B site with weekly volumes in the low hundreds of users, the thresholding penalty outweighs the demographics gain.

### 2.7 User-ID

**Recommendation: On, populated with a salted SHA-256 hash of the lead's email.**

The hash is set when the user submits the [LeadForm](../../components/forms/LeadForm.tsx) (success path) and persists across sessions via localStorage. This is what enables the MQL→SQL north-star metric: HubSpot stores the same hash on the contact record, so post-hoc joins are possible without ever sending PII to Google.

Implementation: see section 5.7.

### 2.8 Conversion events ("key events" in GA4 terminology)

In **Admin → Events → Mark as key event**, register:

- `generate_lead`  *(the canonical lead conversion — value attached)*
- `calendly_booking_completed`
- `audit_request`
- `book_growth_call`
- `constraint_sprint_apply`
- `download`  *(only for gated lead-magnet downloads, not generic file fetches)*

Everything else is a measurement event, not a conversion.

---

## 3. Event Taxonomy

All events are dispatched through the `track()` helper in section 5.1, which guarantees consent gating, PII stripping, and dev-console echo. Parameter names follow GA4's snake_case convention; reserved GA4 params (`value`, `currency`, `transaction_id`, `items`, `page_location`) keep their reserved meaning.

### 3.1 Automatic / enhanced-measurement events

| Event | When | Key params |
|---|---|---|
| `page_view` | Initial doc load (auto) **and** App Router client navigation (manual, see 5.2) | `page_location`, `page_title`, `page_referrer` |
| `scroll` | 90% scroll depth (enhanced measurement) | (auto) |
| `click` | Outbound click (enhanced measurement) | `link_url`, `link_domain` |
| `file_download` | Click on `.pdf`/`.zip`/etc. | `file_name`, `link_url` |

### 3.2 Lead-form events

All target [components/forms/LeadForm.tsx](../../components/forms/LeadForm.tsx).

#### `form_view`

- **Fires when** the form root enters the viewport (IntersectionObserver, ≥50% visibility).
- **Key event?** No
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id` (string, e.g. `audit_lead_form`), `form_name`, `page_location`

#### `form_start`

- **Fires when** the user focuses or types into the first field, once per page-view.
- **Key event?** No
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id`, `form_name`, `step` (`1` or `2`)

#### `form_step_complete`

- **Fires when** the multi-step form advances (step 1 → step 2 after `trigger(STEP_FIELDS[1])` resolves true in the `next()` handler).
- **Key event?** No
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id`, `step` (number), `step_name` (`contact` | `business`)

#### `form_field_complete`

- **Fires** on each input `onBlur` whose value passes Zod validation. Throttled per field so re-blur doesn't double-fire.
- **Key event?** No
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id`, `field_name` (string — never the value), `step`
- *Note*: leave this OFF by default. Turn it on for a 2-week experiment if drop-off is suspected at a specific field. Otherwise it doubles event volume against the free-tier quota.

#### `form_submit`

- **Fires when** `/api/lead/` returns 2xx — i.e., the client-side `onSubmit` happy path in [LeadForm](../../components/forms/LeadForm.tsx) just before `window.location.href = thankYouHref`.
- **Key event?** No (use `generate_lead` for the conversion semantics)
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id`, `form_name`, `submission_id` (a UUID generated client-side and passed to `/api/lead/` for dedup; see section 5.8)

#### `form_error`

- **Fires when** `/api/lead/` returns non-2xx, the Turnstile token is missing, or the network call throws.
- **Key event?** No
- **Google Ads?** No  ·  **Meta?** No
- **Params**: `form_id`, `error_type` (`validation` | `rate_limit` | `server` | `network` | `turnstile`), `status_code` (number, optional)

#### `generate_lead`  *(GA4 recommended event)*

- **Fires alongside** `form_submit` on success. This is the canonical lead conversion.
- **Key event?** **Yes**
- **Google Ads?** **Yes** → conversion action `Lead — Audit Request` or `Lead — Sprint Application` or `Lead — Generic` (matched on `lead_type`)
- **Meta?** **Yes** → standard event `Lead`
- **Params**: `value` (number — see lead-value model below), `currency` (`'USD'`), `lead_type` (`'audit'` | `'sprint'` | `'strategy_call'` | `'contact'`), `submission_id`, `form_id`, `industry_band` (passed through from the `frustration` field's industry mapping), `revenue_band` (from the `revenue` select)

**Lead-value model** (used for `value` on `generate_lead`; informs Google Ads bidding):

| `lead_type` | `revenue_band` | Estimated value (USD) |
|---|---|---|
| `audit` | `<$50k/mo` | 80 |
| `audit` | `$50k–$250k/mo` | 220 |
| `audit` | `$250k–$1M/mo` | 500 |
| `audit` | `$1M+/mo` | 900 |
| `strategy_call` | any | 1.2× the audit value for the same revenue band |
| `sprint` | any | 2,400 (10% of avg sprint price, conservative) |
| `contact` | any | 50 |

These are expected-revenue × probability-of-close estimates, not invoices. Re-calibrate quarterly once HubSpot has 90+ days of won-deal data.

### 3.3 Page-context lead events

These wrap `generate_lead` with a page-specific name so the GA4 Reports surface them directly without filtering. All three are sent **in addition to** `generate_lead`, not instead of it.

#### `audit_request`

- **Fires when** `generate_lead` fires on `/unlock-growth-audit/`.
- **Key event?** **Yes**  ·  **Ads?** Yes (`Lead — Audit Request`)  ·  **Meta?** Yes (`Lead`, `content_name: 'audit'`)
- **Params**: same as `generate_lead`

#### `book_growth_call`

- **Fires when** `generate_lead` fires on `/book-growth-call/` (form fallback, used when Calendly URL env var is unset) **or** when `calendly_booking_completed` fires.
- **Key event?** **Yes**  ·  **Ads?** Yes (`Lead — Strategy Call`)  ·  **Meta?** Yes (`Schedule`)
- **Params**: same as `generate_lead`, plus `booking_source` (`form` | `calendly`)

#### `constraint_sprint_apply`

- **Fires when** `generate_lead` fires on `/constraint-sprint/`.
- **Key event?** **Yes**  ·  **Ads?** Yes (`Lead — Sprint Application`)  ·  **Meta?** Yes (`SubmitApplication`)
- **Params**: same as `generate_lead`

### 3.4 Calendly events

Source: Calendly emits `window.postMessage` events with `data.event` values `calendly.profile_page_viewed`, `calendly.event_type_viewed`, `calendly.date_and_time_selected`, `calendly.event_scheduled`. The bridge lives in [CalendlyEmbed](../../components/integrations/CalendlyEmbed.tsx) (section 5.5).

| GA4 event | Calendly source event | Key event? | Params |
|---|---|---|---|
| `calendly_widget_view` | `calendly.event_type_viewed` | No | `page_location`, `calendly_url` |
| `calendly_booking_started` | `calendly.date_and_time_selected` | No | `page_location`, `calendly_url` |
| `calendly_booking_completed` | `calendly.event_scheduled` | **Yes** | `page_location`, `calendly_url`, `event_uri` (the Calendly event resource URL, not PII), `value: 1.2× audit value`, `currency: 'USD'` |

`calendly_booking_completed` also triggers `book_growth_call` and `generate_lead` (with `lead_type: 'strategy_call'`).

### 3.5 Service & pricing events

#### `service_view`

- **Fires when** a `/services/[slug]/` page's main hero enters the viewport (IntersectionObserver). One fire per page view.
- **Key event?** No  ·  **Ads?** No  ·  **Meta?** Yes (`ViewContent`, `content_category: 'service'`)
- **Params**: `service_name` (string — slug-derived: `ai-seo`, `content-writing-services`, `website-content-writing-packages`, `website-development-design-services`, `outbound-email-marketing-services`), `service_category` (`seo` | `content` | `web` | `email`)

#### `pricing_tier_view`

- **Fires when** a pricing card on `/services/website-content-writing-packages/` enters the viewport. One fire per tier per page-view.
- **Key event?** No  ·  **Ads?** No  ·  **Meta?** No
- **Params**: `tier_name` (`'starter'` | `'growth'` | `'scale'` or whatever's in the page's Product/Offer JSON-LD), `tier_price` (number, USD), `tier_currency` (`'USD'`)

### 3.6 Engagement & navigation events

#### `outbound_click`

- **Fires** via a delegated `click` listener on `document.body` for any `<a href>` whose host ≠ `salesolution.net`. Manual implementation backstops enhanced-measurement's auto `click` event with richer params.
- **Key event?** No  ·  **Ads?** No  ·  **Meta?** No
- **Params**: `link_url`, `link_domain`, `link_text` (truncated to 80 chars), `outbound_category` (`'calendly'` | `'linkedin'` | `'github'` | `'reference'` | `'other'`)

#### `download`

- **Fires when** a gated lead-magnet download is initiated. Distinct from enhanced-measurement's `file_download` (which is too noisy to mark as a conversion).
- **Key event?** **Yes** (only for gated downloads)  ·  **Ads?** Yes (`Lead — Gated Download`)  ·  **Meta?** Yes (`Lead`)
- **Params**: `file_name`, `file_extension`, `asset_id` (your internal name for the asset, e.g. `seo-audit-checklist`)

#### `cta_click`

- **Fires when** a primary CTA button (any `<a>` or `<button>` with `data-cta="..."`) is clicked.
- **Key event?** No  ·  **Ads?** No  ·  **Meta?** No
- **Params**: `cta_id` (the `data-cta` value), `cta_location` (`'header'` | `'hero'` | `'mid_body'` | `'footer'`), `destination` (URL or route)

### 3.7 User properties

Set via `gtag('set', 'user_properties', {...})` on `generate_lead` success — see section 5.7. These power cohort analysis in Explore.

| Property | Source | Example values |
|---|---|---|
| `industry_band` | derived from `frustration` + `platform` | `hydraulics`, `mro`, `technical_distribution`, `other` |
| `revenue_band` | `revenue` select | `under_50k`, `50k_250k`, `250k_1m`, `1m_plus` |
| `platform` | `platform` select | `shopify`, `bigcommerce`, `magento`, `custom`, `other` |
| `primary_frustration` | `frustration` select | (raw frustration code) |
| `lead_type` | path the lead came in on | `audit`, `sprint`, `strategy_call`, `contact` |
| `has_user_id` | derived | `true` / `false` |

---

## 4. Conversion Funnels

Build each as a **GA4 → Explore → Funnel exploration**. Steps are ordered events; segments scope the funnel to the right pages.

### Funnel A — Audit request

Scoped to sessions that touched `/unlock-growth-audit/`.

1. `page_view` where `page_location` contains `/unlock-growth-audit/`
2. `form_view` where `form_id = 'audit_lead_form'`
3. `form_start` where `form_id = 'audit_lead_form'`
4. `form_step_complete` where `step_name = 'contact'`
5. `form_submit` where `form_id = 'audit_lead_form'`
6. `generate_lead` where `lead_type = 'audit'`

Open funnel. Expect biggest drop between steps 2→3 (skimmers) and 4→5 (Turnstile / friction).

### Funnel B — Strategy call booking

1. `page_view` where `page_location` contains `/book-growth-call/`
2. `calendly_widget_view`
3. `calendly_booking_started`
4. `calendly_booking_completed`

Open funnel. Step 2→3 is the time-slot-selection drop-off; step 3→4 is the form-fill drop-off inside Calendly.

### Funnel C — Content → lead

1. `page_view` where `page_location` matches `/category/blog/` OR `/guides/`
2. `page_view` where `page_location` contains `/unlock-growth-audit/` OR `/book-growth-call/` OR `/constraint-sprint/`
3. `generate_lead` (any `lead_type`)

Open funnel. Add a breakdown by step-1 `page_location` to expose which blog/guide URLs feed the funnel.

### Funnel D — Service evaluation

1. `page_view` on `/services/`
2. `service_view` (any `service_name`)
3. `pricing_tier_view` (any `tier_name`)
4. `cta_click` where `destination` matches `/book-growth-call/` or `/unlock-growth-audit/`
5. `generate_lead`

Open funnel. The 3→4 drop is the "pricing shock" signal.

### Funnel E — Constraint Sprint application

1. `page_view` on `/constraint-sprint/`
2. `form_view` where `form_id = 'sprint_lead_form'`
3. `form_start`
4. `form_submit`
5. `constraint_sprint_apply`

---

## 5. Implementation Plan

Concrete, file-by-file. Every snippet assumes Next.js App Router (the breaking-changes Next noted in [AGENTS.md](../../AGENTS.md)) and TypeScript.

### 5.1 The `track()` helper — `lib/analytics.ts`

Create [lib/analytics.ts](../../lib/analytics.ts) (new file). Discriminated-union types make `track()` autocomplete each event's correct params and refuse arbitrary keys.

```ts
// lib/analytics.ts
import { readConsent } from '@/lib/consent'

type LeadType = 'audit' | 'sprint' | 'strategy_call' | 'contact'
type FormId = 'audit_lead_form' | 'sprint_lead_form' | 'contact_lead_form' | 'strategy_call_form'
type ErrorType = 'validation' | 'rate_limit' | 'server' | 'network' | 'turnstile'

export type TrackEvent =
  | { name: 'page_view'; params: { page_location: string; page_title: string; page_referrer?: string } }
  | { name: 'form_view'; params: { form_id: FormId; form_name: string; page_location: string } }
  | { name: 'form_start'; params: { form_id: FormId; form_name: string; step: 1 | 2 } }
  | { name: 'form_step_complete'; params: { form_id: FormId; step: 1 | 2; step_name: 'contact' | 'business' } }
  | { name: 'form_field_complete'; params: { form_id: FormId; field_name: string; step: 1 | 2 } }
  | { name: 'form_submit'; params: { form_id: FormId; form_name: string; submission_id: string } }
  | { name: 'form_error'; params: { form_id: FormId; error_type: ErrorType; status_code?: number } }
  | { name: 'generate_lead'; params: { value: number; currency: 'USD'; lead_type: LeadType; submission_id: string; form_id: FormId; industry_band?: string; revenue_band?: string } }
  | { name: 'audit_request'; params: { value: number; currency: 'USD'; submission_id: string } }
  | { name: 'book_growth_call'; params: { value: number; currency: 'USD'; booking_source: 'form' | 'calendly'; submission_id?: string } }
  | { name: 'constraint_sprint_apply'; params: { value: number; currency: 'USD'; submission_id: string } }
  | { name: 'calendly_widget_view'; params: { page_location: string; calendly_url: string } }
  | { name: 'calendly_booking_started'; params: { page_location: string; calendly_url: string } }
  | { name: 'calendly_booking_completed'; params: { page_location: string; calendly_url: string; event_uri?: string; value: number; currency: 'USD' } }
  | { name: 'service_view'; params: { service_name: string; service_category: 'seo' | 'content' | 'web' | 'email' } }
  | { name: 'pricing_tier_view'; params: { tier_name: string; tier_price: number; tier_currency: 'USD' } }
  | { name: 'outbound_click'; params: { link_url: string; link_domain: string; link_text: string; outbound_category: string } }
  | { name: 'download'; params: { file_name: string; file_extension: string; asset_id: string } }
  | { name: 'cta_click'; params: { cta_id: string; cta_location: string; destination: string } }

// PII keys we strip defensively. The taxonomy never sends these — this is a backstop
// against future maintainers adding `email`/`phone` params by accident.
const PII_KEYS = new Set(['email', 'phone', 'full_name', 'fullName', 'name', 'address'])

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function track<E extends TrackEvent>(event: E): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return

  // Consent gate — analytics_storage must be granted. readConsent() is the
  // same helper the banner uses; gtag's built-in consent gate would also
  // suppress storage, but this also suppresses dataLayer pushes for tags
  // that ignore consent (e.g. some custom GTM tags).
  const consent = readConsent()
  if (!consent.analytics) return

  const cleanParams: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(event.params as Record<string, unknown>)) {
    if (PII_KEYS.has(k)) continue
    if (v === undefined || v === null) continue
    cleanParams[k] = v
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[track]', event.name, cleanParams)
  }

  window.gtag('event', event.name, cleanParams)
}

/** One-shot user-properties setter. Call on lead-submit success. */
export function setUserProperties(props: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const consent = readConsent()
  if (!consent.analytics) return
  window.gtag('set', 'user_properties', props)
}

/** Set the GA4 user_id (hashed email) for cross-session identity. */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const consent = readConsent()
  if (!consent.analytics) return
  // Configure on all loaded GA4/Ads IDs — the existing Analytics component
  // calls gtag('config', id, ...) for each. We re-run config with user_id.
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  if (ga4Id) window.gtag('config', ga4Id, { user_id: userId })
}
```

### 5.2 Page-view tracking — `<RouteChangeTracker />`

App Router does NOT auto-fire `page_view` on client navigation. The current [Analytics](../../components/integrations/Analytics.tsx) sets `send_page_view: true` in the `config` call, which only catches the initial document load. Add this client component and render it once in [app/layout.tsx](../../app/layout.tsx), above `{children}`:

```tsx
// components/integrations/RouteChangeTracker.tsx
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

export function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPath = useRef<string | null>(null)

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    // Skip first render — the initial document load was already counted by
    // gtag('config', { send_page_view: true }).
    if (prevPath.current === null) {
      prevPath.current = url
      return
    }
    if (prevPath.current === url) return
    prevPath.current = url

    track({
      name: 'page_view',
      params: {
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: document.referrer,
      },
    })
  }, [pathname, searchParams])

  return null
}
```

### 5.3 Viewport trigger hook — `useTrackOnView`

```ts
// lib/use-track-on-view.ts
'use client'
import { useEffect, useRef } from 'react'

export function useTrackOnView(
  ref: React.RefObject<HTMLElement | null>,
  onView: () => void,
  options: IntersectionObserverInit = { threshold: 0.5 },
) {
  const fired = useRef(false)
  useEffect(() => {
    if (!ref.current || fired.current) return
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !fired.current) {
          fired.current = true
          onView()
          io.disconnect()
        }
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
  }, [ref, onView, options])
}
```

Use it for `form_view`, `service_view`, `pricing_tier_view`.

### 5.4 Wiring the LeadForm

Patches to [components/forms/LeadForm.tsx](../../components/forms/LeadForm.tsx). Pseudo-diff:

```tsx
// Add at top of LeadForm.tsx
import { track, setUserProperties, setUserId } from '@/lib/analytics'
import { useTrackOnView } from '@/lib/use-track-on-view'
import { useRef, useCallback } from 'react'

// Inside LeadForm(), accept new prop:
// formId: FormId; formName: string; leadType: LeadType
// Then:

const rootRef = useRef<HTMLFormElement>(null)
const startedRef = useRef(false)
const submissionIdRef = useRef<string>(crypto.randomUUID())

useTrackOnView(rootRef, () => {
  track({ name: 'form_view', params: { form_id: formId, form_name: formName, page_location: window.location.href } })
})

const onFirstFocus = useCallback(() => {
  if (startedRef.current) return
  startedRef.current = true
  track({ name: 'form_start', params: { form_id: formId, form_name: formName, step: 1 } })
}, [formId, formName])

// In next():
async function next() {
  const ok = await trigger(STEP_FIELDS[1])
  if (ok) {
    track({ name: 'form_step_complete', params: { form_id: formId, step: 1, step_name: 'contact' } })
    setStep(2)
  }
}

// In onSubmit() success path, AFTER res.ok is true and BEFORE the redirect:
const value = computeLeadValue(leadType, data.revenue)  // table from §3.2
track({ name: 'form_submit', params: { form_id: formId, form_name: formName, submission_id: submissionIdRef.current } })
track({ name: 'generate_lead', params: {
  value, currency: 'USD', lead_type: leadType,
  submission_id: submissionIdRef.current, form_id: formId,
  industry_band: deriveIndustryBand(data.platform, data.frustration),
  revenue_band: data.revenue,
}})
// Page-specific echoes:
if (leadType === 'audit') track({ name: 'audit_request', params: { value, currency: 'USD', submission_id: submissionIdRef.current } })
if (leadType === 'sprint') track({ name: 'constraint_sprint_apply', params: { value, currency: 'USD', submission_id: submissionIdRef.current } })
if (leadType === 'strategy_call') track({ name: 'book_growth_call', params: { value, currency: 'USD', booking_source: 'form', submission_id: submissionIdRef.current } })

// Identity:
const hashed = await sha256Hex(data.email.toLowerCase().trim())
setUserId(hashed)
setUserProperties({
  industry_band: deriveIndustryBand(data.platform, data.frustration),
  revenue_band: data.revenue,
  platform: data.platform,
  primary_frustration: data.frustration,
  lead_type: leadType,
  has_user_id: true,
})

// In error paths (rate-limit, server, network):
track({ name: 'form_error', params: { form_id: formId, error_type: 'rate_limit', status_code: 429 } })
// ...etc for each branch.

// Wire onFirstFocus to the form root via onFocus={onFirstFocus} on the <form>.
```

`sha256Hex` is a small `crypto.subtle.digest('SHA-256', …)` wrapper — no library needed.

### 5.5 Calendly events

Patch [components/integrations/CalendlyEmbed.tsx](../../components/integrations/CalendlyEmbed.tsx) to subscribe to Calendly's `postMessage` events. Calendly broadcasts them from its iframe with `event.origin === 'https://calendly.com'`.

```tsx
'use client'
import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'
import { useTrackOnView } from '@/lib/use-track-on-view'

const AUDIT_VALUE_FOR_BOOKING = 240  // ~1.2× mid-tier audit value, see §3.2

export function CalendlyEmbed({ url, minHeight = 700, className = '' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useTrackOnView(wrapperRef, () => {
    track({ name: 'calendly_widget_view', params: { page_location: window.location.href, calendly_url: url } })
  })

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== 'object' || e.data === null) return
      if (!('event' in e.data) || typeof e.data.event !== 'string') return
      if (!e.data.event.startsWith('calendly.')) return

      const eventUri = e.data?.payload?.event?.uri as string | undefined

      switch (e.data.event) {
        case 'calendly.date_and_time_selected':
          track({ name: 'calendly_booking_started', params: { page_location: window.location.href, calendly_url: url } })
          break
        case 'calendly.event_scheduled':
          track({ name: 'calendly_booking_completed', params: {
            page_location: window.location.href, calendly_url: url, event_uri: eventUri,
            value: AUDIT_VALUE_FOR_BOOKING, currency: 'USD',
          }})
          track({ name: 'book_growth_call', params: {
            value: AUDIT_VALUE_FOR_BOOKING, currency: 'USD', booking_source: 'calendly',
          }})
          break
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [url])

  if (!url) return null

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      <div ref={wrapperRef} className={`calendly-inline-widget ${className}`} data-url={url} style={{ minWidth: '320px', height: `${minHeight}px` }} />
    </>
  )
}
```

### 5.6 Outbound-link tracking

Add a single delegated listener mounted by a client component in [app/layout.tsx](../../app/layout.tsx) alongside `<RouteChangeTracker />`:

```tsx
// components/integrations/OutboundLinkTracker.tsx
'use client'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const SELF = 'salesolution.net'

function categorize(host: string): string {
  if (host.includes('calendly.com')) return 'calendly'
  if (host.includes('linkedin.com')) return 'linkedin'
  if (host.includes('github.com')) return 'github'
  return 'other'
}

export function OutboundLinkTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest('a')
      if (!(target instanceof HTMLAnchorElement) || !target.href) return
      let host: string
      try { host = new URL(target.href).host } catch { return }
      if (host.endsWith(SELF)) return
      track({ name: 'outbound_click', params: {
        link_url: target.href,
        link_domain: host,
        link_text: (target.textContent || '').trim().slice(0, 80),
        outbound_category: categorize(host),
      }})
    }
    document.body.addEventListener('click', onClick, { capture: true })
    return () => document.body.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
```

### 5.7 User-ID and user properties

Already shown in 5.4. Two notes:

- The hashed email is SHA-256, not a salted HMAC. That's intentional: HubSpot computes the identical hash on its side via a Workflow custom-code action, enabling join-by-hash. If you switch to salted HMAC, both sides must use the same secret.
- `setUserId` is called BEFORE `track('generate_lead')` so the conversion event carries the `user_id`.

### 5.8 Server-side conversion API — Measurement Protocol

Client-side `gtag` is fragile: ad-blockers, broken JS, network failures. The server already knows when a lead submitted successfully (in [app/api/lead/route.ts](../../app/api/lead/route.ts) — it returns 200 only when at least one channel succeeded). Send a server-side Measurement Protocol hit from there as a failsafe, deduplicated against the client hit via `submission_id`.

```ts
// lib/analytics-server.ts
import 'server-only'

const ENDPOINT = 'https://www.google-analytics.com/mp/collect'

export async function sendServerEvent(args: {
  clientId: string                 // anon GA client_id, sent up from the client
  userId?: string                  // hashed email
  eventName: 'generate_lead' | 'audit_request' | 'constraint_sprint_apply' | 'book_growth_call'
  params: Record<string, unknown>
}) {
  const measurementId = process.env.GA4_MEASUREMENT_ID  // server-side, no NEXT_PUBLIC
  const apiSecret = process.env.GA4_API_SECRET
  if (!measurementId || !apiSecret) return

  const body = {
    client_id: args.clientId,
    user_id: args.userId,
    events: [{ name: args.eventName, params: args.params }],
  }

  await fetch(`${ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // GA4 MP doesn't return errors usefully — fire-and-forget.
  }).catch((err) => console.error('[GA4 MP] failed:', err))
}
```

Then in [app/api/lead/route.ts](../../app/api/lead/route.ts), after `submitLead` returns ok, call `sendServerEvent`. The client must include `clientId` (read from `_ga` cookie) and `submissionId` in its POST body so the server hit dedups against the client hit on `transaction_id` (GA4 dedups `generate_lead` automatically when `transaction_id` matches).

Add to [lib/lead-form/schema.ts](../../lib/lead-form/schema.ts):

```ts
gaClientId: z.string().optional(),
submissionId: z.string().uuid().optional(),
```

Client reads `_ga` like so:

```ts
function getGaClientId(): string | undefined {
  const m = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/)
  return m?.[1]
}
```

### 5.9 Service & pricing viewport events

In `app/(site)/services/[slug]/page.tsx` (or its client subcomponent), wrap the hero in a ref and call `useTrackOnView` to fire `service_view`. In `app/(site)/services/website-content-writing-packages/page.tsx`, wrap each pricing card and fire `pricing_tier_view` per card.

---

## 6. Cross-Platform Event Mapping

| GA4 event | Google Ads conversion action | Meta Pixel standard event | HubSpot custom behavioral event |
|---|---|---|---|
| `generate_lead` | `Lead — Generic` | `Lead` | `pe244186307_generate_lead` |
| `audit_request` | `Lead — Audit Request` | `Lead` (content_name: audit) | `pe244186307_audit_request` |
| `book_growth_call` | `Lead — Strategy Call` | `Schedule` | `pe244186307_book_growth_call` |
| `constraint_sprint_apply` | `Lead — Sprint Application` | `SubmitApplication` | `pe244186307_sprint_apply` |
| `calendly_widget_view` | — | `ViewContent` (booking) | — |
| `calendly_booking_started` | — | `InitiateCheckout` (high-intent proxy) | `pe244186307_calendly_started` |
| `calendly_booking_completed` | `Lead — Strategy Call` | `Schedule` | `pe244186307_calendly_completed` |
| `service_view` | — | `ViewContent` (category: service) | `pe244186307_service_view` |
| `pricing_tier_view` | — | `ViewContent` (category: pricing) | `pe244186307_pricing_view` |
| `download` | `Lead — Gated Download` (if gated) | `Lead` | `pe244186307_download` |
| `cta_click` | — | — | — |
| `outbound_click` | — | — | — |
| `form_error` | — | — | — |

HubSpot custom events use the form `pe<hubId>_<eventName>`. The hub ID is `244186307` (loaded by [HubSpotTracking](../../components/integrations/HubSpotTracking.tsx)). Fire from the same place `track()` is called:

```ts
function hsTrack(name: string, properties: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { _hsq?: unknown[][] }
  w._hsq = w._hsq || []
  w._hsq.push(['trackCustomBehavioralEvent', { name, properties }])
}
```

Wrap `hsTrack` inside the same `track()` helper so the call sites stay single-purpose.

Google Ads conversion actions must be created in Ads admin before they receive data. Use the **Import from Google Analytics 4 properties** flow rather than gtag-direct so the GA4 event params (`value`, `currency`, `transaction_id`) flow through cleanly and dedup against the Pixel.

---

## 7. Consent Mode v2 Verification

The site is wired correctly already: [Analytics.tsx](../../components/integrations/Analytics.tsx) renders `<ConsentDefault />` with `strategy="beforeInteractive"`, and [ConsentBanner](../../components/integrations/ConsentBanner.tsx) calls `updateGtagConsent` after the visitor's choice. Verification steps:

1. **Open an incognito window**, visit `https://salesolution.net`, open DevTools → Console. Type `dataLayer` and inspect.
   - First entries should be: `['consent', 'default', { ad_storage: 'denied', ... }]`. If they're not first, the `beforeInteractive` script ordering broke.
2. **Network tab** → filter `collect`. You should see **zero** `google-analytics.com/g/collect` hits before clicking "Accept all" — Consent Mode in strict mode suppresses storage *and* the hit. (Google's "modeled conversions" require Advanced Consent Mode, which requires beacons even when denied. We are running **Basic Consent Mode**, which is the privacy-correct default — accept lower visibility into the denied cohort in exchange for cleaner consent posture.)
3. Click **Accept all** in the banner. The next dataLayer entry should be `['consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ... }]`, immediately followed by GA4's queued `config` + `page_view` hits.
4. **GA4 DebugView** (Admin → DebugView): install the [GA Debug](https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) extension; events appear in DebugView within ~10 seconds of firing. Verify every event in section 3 shows up with the expected params.
5. **Denied-cohort sanity check**: in Reports → User attributes → Demographic details, you'll see fewer dimensions populated for the denied cohort. That's expected; the alternative (Advanced Consent Mode + cookieless pings) leaks more data than we want to send.

---

## 8. Reports & Dashboards in GA4 Explore

Build six explorations. Each lives under **Explore → Blank → Free form / Funnel / Path** as noted.

### 8.1 Lead conversion overview (Free form)

- Rows: `session_source / medium`
- Columns: Week
- Values: count of `generate_lead`, sum of `value`
- Filter: `event_name = generate_lead`
- Add segment: paid vs organic vs direct vs referral vs AI-search-referral (regex on `session_source`)

### 8.2 Form completion funnel (Funnel)

- Use Funnel A from section 4. Show closed funnel for the headline rate; open funnel for the realistic one.
- Breakdown dimension: `device_category`. Mobile is usually the worst step-3→4 leak.

### 8.3 Content → lead attribution (Path)

- Starting point: `landing_page` matches `/category/blog/.*` OR `/guides/.*`
- Ending point: event `generate_lead`
- Use **Path exploration**, "Step back" 1–3 nodes to expose the most common 2-hop paths from a blog post to the lead form.

### 8.4 Service interest heatmap (Free form)

- Rows: `service_name`
- Values: count of `service_view`, count of `pricing_tier_view`, count of `generate_lead` (filtered to sessions touching that service)
- Use the matrix as a heatmap — high views + low leads = a content problem, low views + high leads = a discovery problem.

### 8.5 Calendly funnel (Funnel)

- Funnel B from section 4. Two segments: traffic source = paid vs everything else.

### 8.6 Anonymous vs identified (Segment overlap)

- Segment A: `user_property: has_user_id = true`
- Segment B: `user_property: has_user_id = false`
- Overlap: sessions that contributed to each. This reveals how much of the traffic ever gets identified — the conversion rate gap is the value of getting more visitors to submit.

---

## 9. Looker Studio Dashboard

Recommended. A one-page exec view, refreshed every 12 hours via the GA4 connector.

Suggested cards:

1. **This week vs last week** scorecard: `generate_lead` count, total `value`, sessions, conversion rate.
2. **Leads by week** time series (52-week window).
3. **Top-converting URLs** table: `page_location` → count of `generate_lead`, conversion rate per `landing_page`. Filter to last 90 days.
4. **Paid vs organic split** stacked bar, weekly. Blend GA4 (`generate_lead`) with Google Ads cost via the native Ads connector to surface cost-per-lead per campaign.
5. **Funnel A conversion rate** time series — the headline efficiency metric.
6. **Calendly funnel** mini-funnel.

Refresh schedule: every 12 hours during the week. Share link with the team, no client login required (or per-link auth if you embed it on the site for transparency).

---

## 10. Privacy & Compliance

- **Privacy policy** at `/privacy-policy/` already enumerates GA4 and HubSpot. Add one paragraph for the **hashed-email user_id** ("We hash your email address with SHA-256 and pass the hash to Google Analytics and HubSpot to recognize you across sessions on this site only. The hash is irreversible, never sold, and never used for cross-site identification.") — flag this as a doc edit BEFORE the user-ID feature ships. The current [privacy-policy](../../app/(site)/privacy-policy) page should be reviewed.
- **IP anonymization**: GA4 truncates IPs server-side by default; no client config required.
- **Data retention**: 14 months (max for free tier). Aggregated reports retain indefinitely.
- **GPC opt-out**: the browser's Global Privacy Control header is respected by treating it as an explicit "Reject non-essential" choice — extend [ConsentBanner](../../components/integrations/ConsentBanner.tsx) to check `navigator.globalPrivacyControl` on first mount and short-circuit to `rejectAll()` if true. (One-line change.)
- **Children's data**: B2B site, no children. No COPPA exposure, but keep the privacy-policy phrasing explicit.
- **CCPA / Do Not Sell**: the existing default-deny posture already complies. The footer link to `/opt-out-preferences/` re-opens the banner; that's the CCPA "right to opt out" mechanism.
- **EU data**: GA4 routes EU data through EU-located edge nodes when the IP is EU-sourced (automatic). No DPA action needed beyond signing Google's standard Data Processing Terms (one-time, in Admin → Account settings).

---

## 11. Rollout Plan

| Week | Scope | Owner | Done = |
|---|---|---|---|
| 1 | `lib/analytics.ts` + `<RouteChangeTracker />` + form events on [LeadForm](../../components/forms/LeadForm.tsx) + `generate_lead` + page-specific aliases + GA4 admin (data retention, key events, internal IP, referral exclusions) | Artur | All week-1 events visible in DebugView; `generate_lead` registered as key event |
| 2 | Calendly bridge in [CalendlyEmbed](../../components/integrations/CalendlyEmbed.tsx) + `<OutboundLinkTracker />` + `service_view` + `pricing_tier_view` + `cta_click` (`data-cta` attributes added to primary CTAs) | Artur | Funnel B + service-pricing heatmap have data |
| 3 | Server-side Measurement Protocol in [app/api/lead/route.ts](../../app/api/lead/route.ts) + user-ID hashing + user properties + privacy-policy update | Artur | Conversions appear with `user_id` set; MP hits dedupe correctly against client hits |
| 4 | Six GA4 Explorations (section 8) + Looker Studio dashboard (section 9) + Google Ads conversion-action import + Meta Pixel standard event mapping + HubSpot custom-event creation | Artur | Weekly exec view is live; Google Ads sees `generate_lead` as a conversion |

---

## 12. QA Checklist (Before Calling It Done)

- [ ] **DebugView**: every event in section 3 appears with the expected params when triggered manually.
- [ ] **Consent denied**: in incognito, decline the banner, then trigger each event. **Zero** `google-analytics.com/g/collect` hits in Network tab. (Some `consent` updates are fine — those don't carry event data.)
- [ ] **Consent granted**: accept the banner, retrigger. All events fire and reach DebugView.
- [ ] **Ad-blocker test**: with uBlock Origin enabled, the client `gtag` events are blocked — confirm the server-side Measurement Protocol hit from `/api/lead/` still lands in DebugView (this is the failsafe in section 5.8).
- [ ] **No PII in dataLayer**: search `dataLayer` for the test email/phone you just submitted. Should return nothing. The hashed `user_id` is the only identity signal.
- [ ] **Dedup**: client and server `generate_lead` carry the same `submission_id` → GA4 counts one conversion, not two. (Use `transaction_id` for dedup; alias `submission_id` → `transaction_id` in the MP body.)
- [ ] **Google Ads conversion**: trigger a test lead while signed into Google Ads → Tools → Conversions; the conversion action shows a recent hit within ~3 hours.
- [ ] **Meta Pixel**: install the Meta Pixel Helper extension, submit a form, confirm `Lead` event fires once with the right `content_name`.
- [ ] **HubSpot**: in HubSpot → Reports → Custom events, the `pe244186307_generate_lead` event has events from the test submission.
- [ ] **GPC**: in a browser with GPC enabled (Brave, or Firefox with GPC extension), confirm the banner short-circuits to denied and no analytics hits fire.
- [ ] **Internal traffic**: visit from the office IP after the filter goes Active; events appear in DebugView but NOT in standard reports.
- [ ] **Funnel sanity**: in Funnel exploration, a fresh session that completed an audit shows up in all five steps of Funnel A within ~30 min.

---

## Appendix A — File map of changes

| File | Status | Purpose |
|---|---|---|
| [lib/analytics.ts](../../lib/analytics.ts) | **new** | `track()` helper + types |
| [lib/analytics-server.ts](../../lib/analytics-server.ts) | **new** | Measurement Protocol failsafe |
| [lib/use-track-on-view.ts](../../lib/use-track-on-view.ts) | **new** | IntersectionObserver hook |
| [components/integrations/RouteChangeTracker.tsx](../../components/integrations/RouteChangeTracker.tsx) | **new** | App Router page-view tracker |
| [components/integrations/OutboundLinkTracker.tsx](../../components/integrations/OutboundLinkTracker.tsx) | **new** | Delegated outbound-click listener |
| [components/integrations/CalendlyEmbed.tsx](../../components/integrations/CalendlyEmbed.tsx) | **edit** | Add postMessage bridge for Calendly events |
| [components/forms/LeadForm.tsx](../../components/forms/LeadForm.tsx) | **edit** | Wire `track()` + user-ID + user properties; accept `formId`/`formName`/`leadType` props |
| [app/api/lead/route.ts](../../app/api/lead/route.ts) | **edit** | Call `sendServerEvent` on success |
| [lib/lead-form/schema.ts](../../lib/lead-form/schema.ts) | **edit** | Accept `gaClientId` + `submissionId` |
| [app/layout.tsx](../../app/layout.tsx) | **edit** | Mount `<RouteChangeTracker />` + `<OutboundLinkTracker />` |
| [app/(site)/privacy-policy](../../app/(site)/privacy-policy) | **edit** | Disclose hashed `user_id` |

---

## Appendix B — Environment variables introduced

```bash
# .env.local
NEXT_PUBLIC_GA4_ID=G-F0DJT7P1RQ                  # already present
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17897120027         # already present
NEXT_PUBLIC_META_PIXEL_ID=1246284374271362       # already present
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244186307          # already present

# Server-only, for Measurement Protocol
GA4_MEASUREMENT_ID=G-F0DJT7P1RQ
GA4_API_SECRET=<generate in GA4 Admin → Data Streams → Measurement Protocol API secrets>
```

Never expose `GA4_API_SECRET` to the client — it would let third parties forge events into the property.
