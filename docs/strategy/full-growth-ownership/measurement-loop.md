# Full Growth Ownership — measurement loop

What the qualifier now measures, the funnel to build in GA4, and the
signals to watch before re-tuning the page. Pairs with the GA4 taxonomy
([docs/strategy/ga4.md](../ga4.md)) and the volume expectations in the
readiness runbook ([operational-readiness-runbook.md](operational-readiness-runbook.md) §4).

The point of this phase: **don't re-tune the page on vibes.** Ship it, let
the first 5–10 qualifiers land, then change copy/pricing/positioning to fit
the buyer who actually shows up.

---

## 1. What's instrumented

The qualifier ([components/forms/FullGrowthQuoteForm.tsx](../../../components/forms/FullGrowthQuoteForm.tsx))
fires the standard GA4 form funnel plus an FGO-specific conversion echo.
Every event is consent-gated and PII-stripped through the shared
[`track()`](../../../lib/analytics.ts) helper.

| Event | Fires when | Key params |
|---|---|---|
| `form_view` | qualifier scrolls into view | `form_id=full_growth_quote_form` |
| `form_start` | first focus into any field | `form_id`, `step=1` |
| `form_step_complete` | each step validates and advances | `step` (1/2/3), `step_name` (`shape`/`context`/`contact`) |
| `form_submit` | `POST /api/full-growth-quote/` returns 2xx | `submission_id` |
| `generate_lead` | on submit success (canonical conversion) | `value`, `lead_type=full_growth`, `revenue_band` |
| `full_growth_quote_request` | on submit success (FGO echo) | `shape`, `service_count`, `value` |
| `form_error` | each failure branch | `error_type` (`turnstile`/`rate_limit`/`server`/`network`) |

**Server failsafe.** [app/api/full-growth-quote/route.ts](../../../app/api/full-growth-quote/route.ts)
re-fires `generate_lead` + `full_growth_quote_request` via the Measurement
Protocol, deduped against the client hit on `transaction_id` (the
`submissionId` UUID). Survives ad-blockers. No-ops unless `GA4_MEASUREMENT_ID`
+ `GA4_API_SECRET` are set.

**Lead value model.** [lib/lead-form/full-growth-quote-value.ts](../../../lib/lead-form/full-growth-quote-value.ts)
scales `value` by ARR band — FGO sits above every productized lead because a
qualified fractional-GTM / coordinated-retainer buyer is worth far more:

| ARR band | `value` | vs. productized |
|---|---|---|
| under $2M | 600 | catalog_snapshot = 300, audit = 80–900 |
| $2–5M | 1,200 | |
| $5–10M | 2,000 | |
| $10–25M | 2,800 | |
| $25M+ | 3,500 | |

These are a **first-pass model** for value-based bidding, not a forecast.
Tune once enough qualifiers close to know the real shape→SOW→close economics.

**HubSpot dimensions.** When `HUBSPOT_FGO_FORM_ID` is set, every submission
also writes `fgo_shape`, `fgo_services`, `fgo_revenue_band`,
`fgo_headcount_band`, `fgo_marketing_spend_band` — the same cuts below,
available in the CRM for closed-loop analysis once deals progress.

---

## 2. The funnel to build in GA4

Create a funnel exploration (Explore → Funnel) with these steps:

1. `form_view` (`form_id = full_growth_quote_form`)
2. `form_start`
3. `form_step_complete` where `step_name = shape`
4. `form_step_complete` where `step_name = context`
5. `form_step_complete` where `step_name = contact`
6. `form_submit`

Breakdown dimension: `shape` (from `full_growth_quote_request`) once enough
submits exist. Watch where the biggest drop is — see §3.

---

## 3. What to watch (and the decision it triggers)

Low volume at this tier (spec §10: ~2–5 qualifiers/mo early). Don't
over-read any single submission; watch the **shape** of the first ~10.

| Signal | Source | If you see… | Do this |
|---|---|---|---|
| **Q1 shape split** | `full_growth_quote_request.shape` | Mostly `unsure` | The two-shape framing isn't landing — sharpen the §3 "Two shapes" copy so buyers can self-select. |
| | | Skews hard to one shape | Lead the page with that shape; demote the other to a secondary path. |
| **Service count** | `service_count` | Mostly 1 service | They don't need FGO — tighten the §4 caveat + "what if I only need one service" FAQ to redirect them to the productized tier. |
| | | Mostly 4–5 | The bundle thesis is working; make the 5-service composite the hero proof. |
| **Service mix** | HubSpot `fgo_services` | A pair dominates (e.g. AI Search + Catalog) | Build a named "starter combo" around it; it's the real entry point. |
| **Revenue band** | `generate_lead.revenue_band` | Mostly under-$2M | Below the floor — add a firmer size gate on the page or in the qualifier intro to stop unqualified volume. |
| **Step drop-off** | funnel above | Big drop at step 3 (shape) | The shape question is too abstract before any contact buy-in — consider moving contact earlier or simplifying Q1. |
| | | Big drop at step 5 (contact) | Friction or trust gap at the ask — trim contact fields or reinforce the "personal reply, no SDR" promise next to the submit button. |
| **Qualifier → close** | HubSpot pipeline | < expected (spec §10 ramp) | Diagnostic quality or speed, not the page — review the 24h SLA runbook before touching the funnel. |

---

## 4. Cadence

- **Weekly (months 1–3):** qualifier count + `form_error` rate only. Confirm
  the funnel is capturing and nothing is silently broken. Don't judge closes.
- **Monthly:** the §3 table — shape split, service mix, revenue band,
  step drop-off. One copy/positioning change per month, max. Let it run.
- **Month 3 + month 6:** re-fit the value model in
  [full-growth-quote-value.ts](../../../lib/lead-form/full-growth-quote-value.ts)
  against actual closed-deal values, and revisit the pricing-range copy if the
  ARR band that converts differs from the band the page assumes.

The trap (runbook §4, restated): in months 1–3 this is **seeding, not
harvesting**. Judge it on qualifier flow and diagnostic quality, not signed
deals — and don't starve the productized funnel to chase FGO whales.
