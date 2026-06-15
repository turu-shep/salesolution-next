# Case-study fact ledger — Phase 1: lock the truth

**Purpose.** Every public number on every case study, pinned to its provenance, checked for
internal consistency, and mapped to the external source that must confirm it. This is the
verification spine: a number is "locked" only when the **Confirm against** column is satisfied
against real data (CRM export, GSC, citation-tracker, launch retro) and the **Status** is ✅.

**Status legend**
- ✅ **Internally consistent** — arithmetic and cross-references check out (done in-repo). Still needs external confirmation unless noted.
- ⚠ **Needs external confirm** — value traces to a prior on-site component but no source-of-truth artifact has been attached yet.
- 🔴 **Placeholder** — value is provisional and known to be a guess (e.g. engagement window). Must be replaced before the study is credible.

**What "locked" requires (per the market research on credible case studies):** every number needs a
**baseline + timeframe + named source**. Attach the artifact (screenshot/export) to the study's
`internalNotes` in Sanity, then flip the row to ✅ locked.

Seeded content lives in `scripts/seed-case-studies.mjs`; each study's `internalNotes` field carries
the same VERIFY flags summarized here. All five studies are currently seeded
`disclosure: 'anonymized'` — **that is a safe default, not a verified decision** (see §Disclosure).

---

## The single most important decision: per-study disclosure

`anonymized` asserts a **real** engagement with the name withheld. `composite` asserts the numbers
are **aggregated from several engagements** and describe no single client. Picking wrong in either
direction is a problem: calling a composite "anonymized" overstates; calling a real engagement
"composite" needlessly weakens it. The test is simple and binary:

> **Does a single client's retro / CRM record / analytics property exist that produces these exact numbers?**
> Yes → `anonymized` (or `named`, with sign-off). No → `composite`, and the copy must stop implying one client.

Fill this in before anything else — it gates the copy, the proof artifacts, and the disclaimer.

| Study | Seeded as | Single real source exists? | Final call |
|---|---|---|---|
| hydraulics-distributor-catalog-ai-qualified-leads | anonymized | ☐ confirm | ☐ |
| automation-distributor-editorial-authority-aio-citations | anonymized | ☐ confirm | ☐ |
| hydraulics-distributor-headless-replatform | anonymized | ☐ confirm | ☐ |
| fluid-power-oem-greenfield-aio-launch | anonymized | ☐ confirm | ☐ |
| fasteners-distributor-shopify-plus-migration | anonymized | ☐ confirm | ☐ |

> ⚠ **Naming hazard (hard block).** Do **not** set a `publicName` or flip any hydraulics study to
> `named` until resolved: "Northern Hydraulics" is a **real** logo-strip client
> (`lib/client-logos.ts`, northernhydraulics.net) that the v2-1 prototype wrongly called "a
> representative composite." The two hydraulics studies must be confirmed as belonging to a real,
> consenting client before any naming.

---

## 1. hydraulics-distributor-catalog-ai-qualified-leads *(flagship · Catalog AI · featured)*

Provenance: consolidated from `Evidence.tsx` + `catalog-ai/CatalogCaseStudyCallout.tsx` (the two
committed copies **agree** on the headline numbers). Chart values come from `Evidence.tsx`
(`LEAD_PATH`), whose own provenance is unstated.

| Number | Value | Provenance | Check | Status | Confirm against |
|---|---|---|---|---|---|
| Baseline leads/mo | 1,840 | Evidence + Callout agree | — | ⚠ | CRM: Aug-2024 qualified-inbound count |
| End leads/mo | 2,640 | Evidence + Callout agree | — | ⚠ | CRM: Jan-2025 qualified-inbound count |
| Lift % | +43.5% | computed | (2640−1840)/1840 = 43.48% ✅ | ✅ | follows once baseline+end confirmed |
| Added leads/mo | +800 | computed | 2640−1840 = 800 ✅ | ✅ | — |
| Monthly path | 1840/1990/2210/2360/2480/2640 | Evidence `LEAD_PATH` | monotonic, ends match ✅ | ⚠ | CRM monthly export (Aug→Jan) |
| Category pages | 150+ | Evidence + Callout | — | ⚠ | engagement scope doc |
| SKUs | ~8,500 | Evidence + Callout | matches replatform study ✅ | ⚠ | catalog count |
| "No new ad spend" | claim | Evidence | — | ⚠ | ad-account spend flat Aug-24→Jan-25 |
| Quote | Operations Director | Evidence (trimmed) | "doubled" sentence removed ✅ | ⚠ | client approval of attribution+text |

**Window:** Aug 2024 – Jan 2025 (both committed copies agree — treat as ✅ pending retro sign-off).
**Resolved already:** the "qualified leads doubled inside two quarters" quote sentence was dropped
because it contradicts +43.5% over the same 6 months. Don't reinstate.
**Open:** confirm chart values against the CRM; decide anonymized vs composite.

## 2. automation-distributor-editorial-authority-aio-citations *(Editorial Authority)*

Provenance: `editorial-authority/EditorialCaseStudy.tsx`. Retainer scope matches `EditorialPricing`
Standard tier ($7.5K/mo, 8 pieces + 1 pillar).

| Number | Value | Provenance | Check | Status | Confirm against |
|---|---|---|---|---|---|
| AIO citations start | 4 | EditorialCaseStudy | — | ⚠ | citation-tracker baseline export |
| AIO citations end | 34 | EditorialCaseStudy | — | ⚠ | citation-tracker 24-week export |
| Citation lift | ×8.5 | computed | 34/4 = 8.5 ✅ | ✅ | follows once 4 & 34 confirmed |
| Organic leads | 2× | EditorialCaseStudy | — | ⚠ | analytics: informational-page lead forms |
| Retainer cadence | 8 + 1 /mo | EditorialCaseStudy / EditorialPricing | consistent ✅ | ✅ | engagement SOW |
| SKUs | ~12K | EditorialCaseStudy | ⚠ collides w/ fasteners ~12k — different firms | ⚠ | client catalog count |
| **Window** | **"2025"** | placeholder | — | 🔴 | **real calendar months** |

**Open:** real window (🔴); citation-tracker exports for 4→34; analytics basis for "2× organic
leads"; keep the ~12K-SKU collision with the fasteners client straight (two different companies).

## 3. hydraulics-distributor-headless-replatform *(Website Dev · same client as #1)*

Provenance: `website-dev/PortfolioGrid.tsx` Case 01 ("Stack, scope, and delivered numbers … verbatim
from the launch retros"). **Growth claim deliberately routed to study #1** so +43% isn't claimed by
two narratives.

| Number | Value | Provenance | Check | Status | Confirm against |
|---|---|---|---|---|---|
| SKUs | 8,500 | PortfolioGrid | matches study #1 ✅ | ⚠ | catalog count |
| INP (before) | 600ms+ | PortfolioGrid | "before" only; no after recorded | ⚠ | audit measurement |
| Stack | Next.js + Shopify Hydrogen | PortfolioGrid | — | ⚠ | launch retro |
| Configurators | JIC/NPT | PortfolioGrid | — | ⚠ | launch retro |
| Duration | 6 months | PortfolioGrid | — | ⚠ | launch retro |
| **Window** | **"2024"** | placeholder | — | 🔴 | **real calendar months** |

**Open:** real window (🔴); **confirm the sequence** — copy asserts replatform *then* the
Aug-2024→Jan-2025 catalog engagement; this ordering is inferred, not sourced. Is there a publishable
*post*-rebuild INP number (the retro only recorded the "before")?

## 4. fluid-power-oem-greenfield-aio-launch *(Website Dev)*

Provenance: `PortfolioGrid.tsx` Case 04 ("AIO-ready from launch, cited in AIO inside 90 days"; card
metric "12 wk").

| Number | Value | Provenance | Check | Status | Confirm against |
|---|---|---|---|---|---|
| Time to 1st AIO citation | 12 wk | PortfolioGrid card | 12wk = 84d, consistent w/ "inside 90 days" ✅ | ⚠ | citation-tracker first-hit date |
| SKUs | 22k | PortfolioGrid | — | ⚠ | catalog count |
| Duration | 5 months | PortfolioGrid | — | ⚠ | launch retro |
| Stack / PIM | Next.js + Saleor / Acumatica | PortfolioGrid | — | ⚠ | launch retro |
| **Window** | **"2025"** | placeholder | — | 🔴 | **real calendar months** |

**Open:** real window (🔴); is "12 wk" the exact first-citation date or a rounding of "inside 90
days"? Name the tracked query set for the citation claim.

## 5. fasteners-distributor-shopify-plus-migration *(Website Dev)*

Provenance: `PortfolioGrid.tsx` Case 02.

| Number | Value | Provenance | Check | Status | Confirm against |
|---|---|---|---|---|---|
| CLS before→after | 0.31 → 0.02 | PortfolioGrid | — | ⚠ | CrUX/Lighthouse before+after |
| Plugins before→after | 61 → 4 | PortfolioGrid | — | ⚠ | launch retro |
| SKUs / brands | 12k / 17 | PortfolioGrid | ⚠ ~12k collides w/ automation firm | ⚠ | catalog count |
| Duration | 10 weeks | PortfolioGrid | — | ⚠ | launch retro |
| **Window** | **"2024"** | placeholder | — | 🔴 | **real calendar months** |

**Open:** real window (🔴); CLS measured at launch vs sustained?

---

## Cross-study integrity (checked in-repo)

- ✅ **+43% double-claim resolved.** Study #3 (replatform) reports build facts only; the qualified-lead
  growth lives solely on study #1. Verify this holds if either is re-edited.
- ⚠ **~12K-SKU collision.** Automation distributor (#2) and fasteners distributor (#5) are different
  companies that both happen to sit near 12k SKUs. Keep internal names distinct in Sanity.
- ✅ **Arithmetic** for every derived figure (+43.5%, +800, ×8.5, 12wk↔90d) recomputed and correct.

## Adjacent stat surface (audited 2026-06-14)

- ✅ `lib/stats.ts` (locked 2026-05-19) is the single source: $378M revenue, **91%** retention, 2.5x
  ROI/12mo, 96 NPS, 5.2x lifetime ROI, $575k ARR/client. **No live page contradicts it** — the
  Evidence homepage section renders these verbatim.
- ⚠ **Confirm intentional:** `2.5x` ("Average ROI in 12 months") and `5.2x` ("Average client ROI")
  coexist. The labels distinguish 12-month vs lifetime; confirm that's deliberate or collapse to one.
- 🧹 **Orphan cleanup (recommend).** `services/ComparisonTable.tsx` ("Double your investment"
  guarantee) and `services/BuildOptimizeAmplify.tsx` ("25% higher ROI") and `services/RealResults.tsx`
  (ScaleFast / "Marcus L." composites) are **imported by no live page** but still carry risky/stale
  claims — the "Double your investment guarantee" directly contradicts the disclaimer's no-guarantee
  stance. Delete to prevent accidental re-import. (Not done here — deletion is your call.)

## What only you can supply (the gate to ✅ locked)

1. **Disclosure decision** per study (the §table above) — the one thing that gates everything.
2. **Three real engagement windows** (🔴): studies #2, #3, #4, #5 carry placeholder years.
3. **Source artifacts** to attach per study: CRM monthly export (#1), citation-tracker exports
   (#2, #4), GSC/analytics for the "2× organic leads" and CLS claims, launch retros (#3, #4, #5).
4. **Sequence confirmation** for the hydraulics client (replatform → catalog engagement).
