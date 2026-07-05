# Prompt 6 — The proof & payback engine (cross-page system)

Paste below the line into a fresh Claude Code session. Prefix with `ultracode` for depth.
Run after (or alongside) the vertical prompts.

---

You are designing the cross-page system that makes every Sale Solution offer FEEL like a
done deal with an obvious ~10x return — using arithmetic, proof, and risk reversal instead
of hype, because the buyer is agency-burned and the voice rules ban manufactured urgency
and unsourced claims. I'm the founder. Deliverable: a system spec + component-level plan.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md` (the gap list is
your work order), `docs/strategy/offers/00-offer-architecture.md` (if present),
`.agents/product-marketing-context.md`, `lib/stats.ts` (approved: $378M driven, 91%
retention, **2.5x avg ROI in 12 months**, **5.2x lifetime**, 96 NPS, $575K ARR/client),
`app/(site)/revenue-engine/dentists/page.tsx` (the reference pattern: fee slider,
"clears the fee in the first N cases," 12-month do-nothing chart, "I round down"),
`components/sections/revenue-engine/{Concept3Calculator,TwoRevenueLines}.tsx`.

**Design tasks:**
1. **The joined payback block (one component, every money page).** Spec a reusable
   section: leak math (buyer's own inputs) → the fee, visible → payback in the buyer's
   unit (jobs/cases/rings/RFQs) → the 12-month do-nothing line. Per-motion variants
   (guarantee restated inside it on book-jobs; published-price certainty on
   sell-product). Where it mounts on each page (hub, 4 pillars, dentists, /revenue-engine/,
   homepage?). The dentists implementation is the template — generalize it without
   flattening it.
2. **Deploy the approved ROI stats.** 2.5x-in-12-months and 5.2x-lifetime are approved
   and almost unused. Where do they carry weight without reading like a stock chart
   (beside the guarantee? inside the payback block? the FAQ answer to "too good to be
   true"?), and what phrasing keeps the two windows distinct (the labels are locked)?
3. **The proof roadmap for a zero-case-study site.** Rank every proof mechanism we can
   run BEFORE cohort data exists: the disclosed-formula calculator, "I round down,"
   week-4 work-shown, the two-lines report mock with PROOF-SLOT, recorded-call counts,
   the founder's-name guarantee, third-party stats beside claims, the free artifact CTAs
   (probe, snapshot, written diagnostic, leak audit). Then the activation plan for when
   the first cohort data lands (which PROOF-SLOT fills first; case-study disclosure
   badges per the fact-ledger rules).
4. **Legitimate urgency library, per vertical.** Storm season (home services), install-
   before-peak (jewelry Q4, engagement season), recall-decay ("every month overdue makes
   reactivation ~X% less likely" — source it), AI-search land-grab (citation-window
   data), one-operator capacity (only with my confirmation of real numbers). Each entry:
   the mechanism, the sourced stat, the one-line copy pattern, where it mounts.
5. **The "not doing this costs more" close, systematized.** One pattern per motion that
   turns the calculator output into the close ("Do nothing and $X is gone by month 12"
   exists on dentists — spec the generalized version) without scare tactics.
6. **Measurement.** Which numbers on which pages need conversion tracking (data-cta tags
   exist) so we learn which anchors/blocks move audit bookings and growth calls — define
   the before/after metrics for this whole offer push.

**Deliverable → `docs/strategy/offers/proof-payback-system.md`:** the payback-block spec
(props, variants, mount map), the ROI-stat deployment map, the proof roadmap (now vs
first-cohort), the urgency library (sourced, GATE:HUMAN), the close patterns, the
measurement plan, and a build-order list sized S/M/L per component. Constraints: no
fabricated anything; approved stats verbatim with locked labels; calculators always
disclose the formula and stay editable; no countdowns/false scarcity ever.
