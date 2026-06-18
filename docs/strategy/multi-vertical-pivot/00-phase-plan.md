# Multi-vertical pivot — phase plan

**Status:** in progress (started 2026-06-14)
**Owner:** Artur
**Source research:** 12-agent audit + strategy + adversarial-verify workflow (run `wf_70fe281e-fb0`)

## The pivot in one paragraph

Salesolution is moving from a single-vertical positioning (industrial / technical-distribution
e-commerce) to a multi-vertical operator brand. The new verticals are home-services contractors
(roofing-forward) and dental practices, served by a **separate productized offer** — the
**Revenue Engine** (see `docs/strategy/roofing/revenue-engine-site-injection-spec.md`). The
homepage becomes navigation + authority + case studies, routing each visitor to the cluster that
fits them. Case studies become a first-class, Sanity-driven proof spine across both clusters.

## Architecture: two parallel clusters + a routing layer

```
/                              ← Industry router + authority + case-study spine
├── /services/                 ← 6 services, industrial-distribution buyer
│   ├── ai-seo/ catalog-ai/ editorial-authority/
│   ├── website-development-design-services/
│   ├── outbound-email-marketing-services/ full-growth-ownership/
├── /revenue-engine/           ← Productized offer, new verticals
│   ├── /                      ← Pillar (engine/fuel, 5 steps, pricing, guarantee)
│   ├── home-services/         ← roofing-forward (was "contractors" — renamed, see below)
│   └── dentists/
├── /case-studies/             ← Sanity, industry+service tagged, proof for both
└── /catalog-snapshot/         ← already exists = Catalog AI's conversion funnel
```

**`/industries/*` namespace — proof-gated (amended 2026-06-16).** Originally "no
namespace, route tiles directly." Amended: the ban was only ever about avoiding
*near-empty* hubs. So — a nav **menu** (ships now) and a hub **anchored by real
proof** are both allowed; a thin/empty hub is not. An industry earns its own
`/industries/<slug>/` page only when it has case studies OR real search demand
behind it. Until then it routes to the page that already exists: Industrial →
`/services/`, Home Services → `/revenue-engine/home-services/`, Dental →
`/revenue-engine/dentists/`. URL namespace = `/industries/*`; visible nav label =
"Who We Serve" (the two need not match).

## Two-funnel model (CTA strategy)

Two ICPs, two doors — do not merge:
- **Industrial / services side** ($5M+ ARR, complex sale): primary CTA `/book-growth-call/`.
  The legacy free-growth-audit funnel (`/unlock-growth-audit/`) is **demoted to a secondary
  "written diagnostic" door**, not deleted (the book-growth-call page's own FAQ already frames
  it that way).
- **Revenue Engine side** (home services + dental, $3–5K/mo productized): primary CTA
  **Revenue Leak Audit** via GHL embed, only on `/revenue-engine/*`.

## Naming decisions made

- `/revenue-engine/contractors/` → **`/revenue-engine/home-services/`**. "Contractor" is
  ambiguous (white-collar = freelancer/consultant; blue-collar = trades). "Home Services" is the
  industry-standard category term, unambiguously blue-collar local service businesses. Copy stays
  roofing-forward.
- Package name: **Revenue Engine** (working name, renameable before leaving orphan stage).
- Audit name: **Revenue Leak Audit** (spec default).
- Operator bio: horizontal/multi-vertical framing (per Artur).
- Northern Hydraulics naming collision: **rename the v2-1 composite** to a generic descriptor
  (v2-1 is noindex and being repurposed; safest fix).
- Sub-verticals (residential vs commercial roofing, DSO vs single-location): revisit as it scales.

## Phases

### Phase 0 — Unlock work (no new UI; CTAs, copy, data) ← CURRENT
- Sweep cross-page audit CTAs → `/book-growth-call/` (nav `primaryCta`, sitewide `FinalCTARail`,
  `FinalCTA`). Keep audit as secondary door. Homepage-only `HeroProbe`/`Signals` deferred to Phase 4.
- Broaden disqualifying copy on the 5 service pages (keep real ARR floors, soften industrial-
  exclusive language).
- Resolve Northern Hydraulics (rename v2-1 composite).
- Rewrite operator bio to horizontal framing.

### Phase 1 — Sanity foundation + Revenue Engine pillar
- Sanity `industry` doc type + optional reference fields on caseStudy/service; backfill seeded
  studies → `industrial-distribution`.
- Build `/revenue-engine/` pillar (spec §6.1) + CAPTURE→RESPOND→BOOK→RECOVER→PROVE SVG. Orphan-stage.

### Phase 2 — Revenue Engine verticals + proof
- `/revenue-engine/home-services/` (spec §6.2), `/revenue-engine/dentists/` (spec §6.3).
- GHL audit embed (needs `{{GHL_AUDIT_EMBED}}` from Artur). Seed composite case studies per vertical.

### Phase 3 — Catalog AI funnel rehoming
- Salvage v2-1 design into Catalog AI's funnel. (Destination TBD — `/catalog-snapshot/` already
  exists; decide replace vs merge.) Delete `/v2-1/` route after.

### Phase 4 — Homepage rebuild + nav
- New homepage (IndustryRouterHero → AuthorityBar → CaseStudyShelf → ServicesGrid →
  RevenueEngineCallout → Operator → FAQ → DualCloseCTA). Retire HeroProbe/Evidence/Signals.
- nav: add Revenue Engine, promote Case Studies, collapse Resources into Insights.
- sitemap: recover missing catalog-ai + full-growth-ownership, add revenue-engine + industry feed.

### Phase 5 — Tracking + content cluster (ongoing)
- GA4/GTM events on Revenue Engine, Service + FAQPage schema, 8-post content cluster, contextual
  CTA insertions, A/B test pillar headline.

## Open decisions (needed by phase)
- **Phase 2:** GHL audit embed ID; FL/CA pricing display (both rate cards vs default FL).
- **Phase 3:** v2-1 destination (replace `/catalog-snapshot/` vs new route).
- **Phase 4:** ~~Industries dropdown in nav, or direct tile routing only.~~ RESOLVED
  2026-06-16 — BOTH. Shipped a "Who We Serve" nav dropdown routing to existing
  pages (`lib/navigation.ts`), added the Revenue Engine routes to `app/sitemap.ts`
  (ends orphan stage), and laid the Sanity `industry` taxonomy foundation (new
  `industry` doc type, `industryRef` on `caseStudyClient`, `allIndustries` +
  `caseStudiesByIndustry` queries, `scripts/seed-industries.mjs` backfill).
  Still open: real `/industries/*` landing pages (dental first by demand, then
  roofing/home-services), industrial hub + case-study faceting UI, and the
  GHL audit-embed funnel fix that gates the Revenue Engine items being promoted.

## WordPress spec → Next.js mapping
The Revenue Engine spec targets WordPress; we're Next.js + Sanity. Architecture, copy standards,
claims policy, gradual-injection sequence, and self-QA checklist port verbatim. Tooling does not:
WP MCP → file commits/PR; WP revisions → git revert + `lib/redirects.ts`; "publish as draft" →
branch + preview deploy; page builder → Next components matching existing design tokens. Manifests
→ plain JSON under `.agents/manifests/`. `GATE:HUMAN` = review before merge to `main`;
`AUTO:QA` = merge after self-QA.
```
