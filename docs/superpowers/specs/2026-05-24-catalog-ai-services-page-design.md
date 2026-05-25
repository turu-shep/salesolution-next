# Catalog AI service page — implementation design

**Date:** 2026-05-24
**Source spec:** Catalog AI Offer Spec v2 (provided by Artur, replaces v1)
**Owner:** Artur Shepel

## Goal

Add Catalog AI as a productized service line at `/services/catalog-ai/`, alongside the existing five services. Create a conversion form at `/catalog-snapshot/` mirroring the existing `/unlock-growth-audit/` pattern. Update the `/services/` hub to list Catalog AI as a sixth service.

Voice and visual language match the new `/services/ai-seo/` page — operator-grade, lowercase section headlines, transparent pricing, explicit exclusions.

## Routes

| Route | Purpose | Pattern mirrored |
|---|---|---|
| `/services/catalog-ai/` | Landing page for the offer | `/services/ai-seo/` |
| `/catalog-snapshot/` | Lead form page for the free dual-version rewrite | `/unlock-growth-audit/` |
| `/catalog-snapshot/thank-you/` | Post-submission redirect | `/unlock-growth-audit/thank-you/` |

## Files to touch

### New files

```
app/(site)/services/catalog-ai/page.tsx
app/(site)/catalog-snapshot/page.tsx
app/(site)/catalog-snapshot/thank-you/page.tsx

components/sections/catalog-ai/CatalogMarketProblem.tsx
components/sections/catalog-ai/CatalogTiers.tsx
components/sections/catalog-ai/CatalogDeliverablesTable.tsx
components/sections/catalog-ai/CatalogProcess.tsx
components/sections/catalog-ai/CatalogVolumePricing.tsx
components/sections/catalog-ai/CatalogCaseStudyCallout.tsx
components/sections/catalog-ai/CatalogSnapshotCTA.tsx
components/sections/catalog-ai/CatalogExclusions.tsx

components/sections/catalog-snapshot/CatalogSnapshotHero.tsx
components/sections/catalog-snapshot/CatalogSnapshotDeliverables.tsx
components/sections/catalog-snapshot/CatalogSnapshotFit.tsx
components/sections/catalog-snapshot/CatalogSnapshotFormSection.tsx
```

### Modified files

```
components/sections/services/ServicesIndex.tsx  — add 6th service card
app/(site)/services/page.tsx                    — copy update ("Five" → "Six")
components/forms/LeadForm.tsx                   — optional SKU-range field gated on prop
lib/analytics.ts                                — add 'catalog_snapshot' to LeadType, FormId
lib/lead-form-config.ts                         — add SKU_COUNT_RANGES export
lib/lead-form/schema.ts                         — add optional skuCount field, gated by leadType
app/api/lead/route.ts                           — accept catalog_snapshot leadType
lib/lead-form/submit.ts (or equivalent)         — map skuCount to HubSpot custom field
```

## Component contracts

### CatalogTiers — three pricing cards

Props: none. Renders three vertical cards (Standard / Pro / Enterprise) in a 3-column grid on `md+`, stacked below. Middle card (Pro) gets the same emphasis treatment as the "Operator Retainer" card in `EngagementModel.tsx`:

- Border `border-ink-900`, drop shadow
- Floating chip `Most common` (accent-500 background)
- Bottom CTA on featured uses `bg-ink-900 text-white`; others use bordered ghost style

Each card surfaces: tier name, headline price ($3.00/SKU, $7.00/SKU, From $15K/mo), one-line for-whom, bullet list of 5–7 included items, CTA link.

CTAs:
- Standard → `/catalog-snapshot/?tier=standard`
- Pro → `/catalog-snapshot/?tier=pro`
- Enterprise → `/contact-me/`

### CatalogDeliverablesTable

Renders the 15-row comparison matrix from §7.4 of the spec. Layout matches `Comparison.tsx`:

- Sticky-ish first column for row labels (`font-mono`, `uppercase`, `text-ink-500`)
- Three value columns; Pro column featured with `bg-paper`
- Cell values are either `✓` (good icon, accent-500), `—` (em-dash, ink-400), or short text (e.g. "5%", "20%", "100% per operator review")

### CatalogMarketProblem

Section with stat strip on top (4 stats: 48% AIO trigger, 61% CTR drop, 14% shopping AIO, 35% citation lift) and body copy explaining why manufacturer-supplied descriptions don't get cited. Stat strip uses `font-display tabular-nums` for numbers, mono caps for labels — same pattern as existing stats sections (`MarketReality`).

### CatalogProcess

Numbered 4-step process. Either:
- Horizontal numbered cards (1 → 2 → 3 → 4) on `md+`
- Stacked numbered list on mobile

Each step: number (display font, accent-500), title (display semibold), 2-3 sentence body. No imagery.

### CatalogVolumePricing

Three small tables (one per tier) showing volume tier breaks and ongoing-maintenance pricing. Compact, dense — `text-sm`, `tabular-nums`. Sits below `CatalogTiers` to surface the volume math without cluttering the main pricing cards.

### CatalogExclusions

Plain bulleted list under a single H2 (`what we won't do.`). Renders the 10 exclusions from §5. Style: bordered card, `tone="paper"`, no fanfare. The honesty is the design.

### CatalogCaseStudyCallout

References the existing Northern Hydraulics case study. Either reuses the `Evidence` component if its existing copy fits, or pulls the same case study data into a thinner callout with one chart and one quote. Decision deferred to implementation — read `Evidence.tsx` first; reuse if it works.

### CatalogSnapshotCTA

Single-band CTA section (full-width, `tone="surface"`). Headline: "see what your catalog is missing." Sub: "send your URL. we send back 5 of your products rewritten in both standard and pro." Primary button: `Get the free catalog snapshot →` linking to `/catalog-snapshot/`. Appears twice on the landing page: once in section 7 and again before the final CTA rail.

### CatalogSnapshotHero, ...Deliverables, ...Fit, ...FormSection

Direct analogues to the `audit/*` components. Same `SectionRail` shapes, same prop signatures, same anchors pattern. The Deliverables section emphasizes the **dual-version rewrite** (Standard + Pro side-by-side) as the differentiator vs. the existing audit funnel.

## Page composition

### `/services/catalog-ai/page.tsx`

```tsx
<JsonLd data={serviceSchema({ name: 'Catalog AI', ... })} />
<ServicesHero
  eyebrow="Services / Catalog AI"
  title="your product catalog."
  titleAccent="rewritten by AI. operated by us."
  lede={...}
  primaryCta={{ label: 'Get a free catalog snapshot', href: '/catalog-snapshot/' }}
  secondaryCta={{ label: 'See the three tiers', href: '#tiers' }}
  anchors={[
    { label: 'Why now', href: '#why-now' },
    { label: 'Tiers', href: '#tiers' },
    { label: 'What we build', href: '#what-we-build' },
    { label: 'How it works', href: '#how' },
    { label: 'FAQ', href: '#faq' },
  ]}
  serviceName="catalog-ai"
  serviceCategory="catalog"
/>
<CatalogMarketProblem id="why-now" />
<CatalogTiers id="tiers" />
<CatalogVolumePricing />
<CatalogDeliverablesTable id="what-we-build" />
<CatalogProcess id="how" />
<CatalogCaseStudyCallout />
<CatalogSnapshotCTA />
<CatalogExclusions />
<FAQ id="faq" items={CATALOG_FAQ} ... />
<FinalCTARail />
```

### `/catalog-snapshot/page.tsx`

```tsx
<CatalogSnapshotHero />
<CatalogSnapshotDeliverables id="deliverables" />
<CatalogSnapshotFit id="fit" />
<CatalogSnapshotFormSection id="book" />
<FAQ id="faq" items={SNAPSHOT_FAQ} ... />
<FinalCTARail />
```

### `/services/page.tsx` updates

- Hero title: `Six services.` (was `Five services.`)
- `ServicesIndex` heading: `Six services. One operator.`
- `ServicesIndex` body: update "AI search is the gravity well" sentence to acknowledge Catalog AI as the per-SKU productized entry point.
- Add Catalog AI as the 2nd card in `SERVICES` array (after AI search) since it's the closest sibling.

## Lead form changes

### Add `'catalog_snapshot'` leadType

- `lib/analytics.ts` — `LeadType` union gains `'catalog_snapshot'`; `FormId` gains `'catalog_snapshot_form'`.
- `lib/lead-form-config.ts` — export `SKU_COUNT_RANGES` (e.g. `[under-1k, 1k-10k, 10k-50k, 50k-plus]`).
- `lib/lead-form/schema.ts` — `skuCount` optional string field, validated only when `leadType === 'catalog_snapshot'`.
- `components/forms/LeadForm.tsx` — accept optional `showSkuCount?: boolean` prop. When true, render the SKU-count select in step 2 just before the `frustration` field. Reuses existing `Field` + `select` styling.
- GA4 events — page-specific echo of `generate_lead`: `catalog_snapshot_request` (alongside `form_submit` + `generate_lead`). Mirrors `audit_request`. Lead value: $300 flat (between audit $80–$900 and sprint $2400; tunable later).
- `lib/lead-form/submit.ts` (or wherever HubSpot mapping lives) — map `skuCount` to a HubSpot custom property `catalog_sku_count_range`. Property must exist in HubSpot; spec'd as a follow-up if not — I'll log a warning + still send the email side via Resend.
- `app/api/lead/route.ts` — accept `catalog_snapshot` in the leadType discriminator.

## Out of scope

Documented for clarity; not built in this iteration:

- Stripe deposit links per tier
- Catalog Snapshot PDF template
- Cold outbound sequences and proposal templates
- HubSpot custom-property creation (manual setup outside the repo)
- Old `/services/` redirects (already done in prior commit per spec §15 last bullet — verify, don't re-do)

## Acceptance criteria

- [ ] `/services/catalog-ai/` renders end-to-end with all 11 sections from the spec
- [ ] `/catalog-snapshot/` renders with form that submits successfully (dev mode: hits `/api/lead/`, returns 200, redirects to `/catalog-snapshot/thank-you/`)
- [ ] Catalog AI card appears on `/services/` as 2nd of 6
- [ ] Pro tier card is visually emphasized
- [ ] Deliverables table shows all 15 rows from spec §7.4
- [ ] Three FAQs minimum picked from spec §12
- [ ] All exclusions from spec §5 surfaced
- [ ] Northern Hydraulics case study linked or embedded
- [ ] Catalog AI service emits `Service` JSON-LD via `serviceSchema`
- [ ] Lead form `'catalog_snapshot'` leadType is wired through analytics + API
- [ ] SKU-count field renders only on `/catalog-snapshot/`, not on other forms
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Page builds with `pnpm build`

## Open questions for implementation phase

1. Does an `Evidence` component variant exist that I can drop in for Northern Hydraulics, or do I need a thinner `CatalogCaseStudyCallout`? Decide after reading `Evidence.tsx`.
2. Does HubSpot already have a `catalog_sku_count_range` custom property? If not, the field still gets sent but HubSpot will silently ignore it. Acceptable for v1.
3. The `serviceCategory` prop on `ServicesHero` — what values does it accept? Check signature before passing `'catalog'`.

---

*End of design. Ready for implementation plan.*
