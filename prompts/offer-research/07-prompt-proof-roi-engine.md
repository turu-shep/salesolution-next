# Prompt 6 — Consolidation: one payback system, one sign-off sheet, one build plan

**REWRITTEN 2026-07-07.** The original version of this prompt asked for the design of a
cross-page proof/payback system. That design now exists, four times over — the vertical
specs (03–06 outputs) each specified their own calculator rebuild, urgency library,
do-nothing close, and proposal layer, and `02-visible-value-pass.md` added the binding
rules (R1–R9). What's left is NOT design; it is **consolidation**: reconcile the four
specs into one component + one copy system, collect every pending decision and claims row
into a single founder sign-off sheet, and sequence the whole thing into a build plan.

Paste below the line into a fresh Claude Code session. Prefix with `ultracode`.

---

You are consolidating Sale Solution's offer-research outputs into a build-ready migration
plan. Five research docs and four vertical specs exist; none of it is built. Your job is
reconciliation and sequencing — you change no signed decision and do no new market
research (one verification sweep excepted, task 7).

**Read first, in order:**
`docs/strategy/offer-research/00-offer-architecture.md` (SIGNED — D1–D12 + §16 win on
everything), `02-visible-value-pass.md` (rules R1–R9 + D14, binding on proposal
artifacts), the four vertical specs — `industrial-offer-spec.md`,
`home-services-offer-spec.md`, `medical-dental-offer-spec.md`,
`consumer-jewelry-offer-spec.md` — each with its own page-map, number bank, and open
decisions, `01-anchor-ladder.md` (**PARKED by founder — build nothing from it**; note
interactions only where a template would have to change if D13 later signs),
`docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md` (the live
reference implementation), `docs/strategy/sales/_claims-library.md`, `lib/stats.ts`,
and the components: `components/sections/revenue-engine/WholeFlowLeak.tsx` (built,
mounted only on dentists) and `Concept3Calculator.tsx` (the one being replaced).

**Tasks:**

1. **The unified payback component spec.** `WholeFlowLeak` is the vehicle (all four specs
   chose it). Spec the single component that serves every money page: per-motion variants
   (book-jobs = install-frame anchor + N-payback in their unit + guarantee hand-off;
   sell-product = same math, no guarantee language, pieces-not-percentages, 48h-SOW
   line), the preset registry (home-services trades from its §5, medical presets from
   its spec, jewelry/consumer profiles from §3.2, industrial if its spec mounts one),
   the D12 join-line as ONE canonical pattern with slots, and the mount map (which page
   gets which variant + preset; what happens to `Concept3Calculator`). **Where the four
   specs' treatments diverge, list each divergence and resolve it** — one component,
   one copy pattern, vertical slots.
2. **The cross-spec copy reconciliation.** One canonical, slot-parameterized block for
   each shared element: the floor line (§16 wording), the credit sentence (split form,
   scoped to priced cylinders), the terms line ("Installed by day 60, proving by day 90"
   book-jobs vs "~90 days" sell-product), staged billing (50/25/25 or 100%−5%), the
   "setup"→"install" ban, hero spec labels. Four sessions wrote four specs; find and
   settle every drift.
3. **THE SIGN-OFF SHEET — the most important deliverable.** One table the founder can
   sign in a single sitting: EVERY pending decision across the docs (D14-a…f; D-C1…C-8;
   D-HS1 + home-services' open items incl. capacity-N and the electrical tier; the
   medical spec's §8; the industrial spec's punch-list items needing him; hero picks
   per page; the capacity numbers per vertical) and EVERY proposed claims-library row
   (medical's C-06 unblock via the 2026 Catalyst Index; home-services C-07…C-13; the
   page-usable candidates from the industrial 48-claim bank and the jewelry J/V banks).
   Columns: id · what · recommendation · what signing it unblocks · source status.
   Mark D13 rows PARKED. Group by "sign these to unblock the build" vs "can wait."
4. **ROI-stat deployment map** — where 2.5x/5.2x mount on **sell-product surfaces only**
   (§16 restriction; book-jobs pages get calculators + guarantee, no multiple).
5. **The proof roadmap.** Now-mechanisms (disclosed formulas, "round down", week-4
   work-shown, founder-name guarantee, artifact CTAs) → activation plan: Beautiful
   Smiles as the first book-jobs cohort-data candidate, the Liori consent ask (D-C4) as
   the first sell-product named case, the claims-row process for each, disclosure
   badges per the fact-ledger rules.
6. **The removals + fixes batch** (all already signed — sequence, don't re-decide):
   fabricated claims down (constraint-sprint "42 sprints" ×2 + "60/30/10"; audit-page
   additions; the "60% of builds" strays), the deferred bugs (medical `AuditCTA`
   vertical — CHECK the working tree first, a fix may already be sitting uncommitted;
   industrial 90-vs-30-day notice; editorial retainer band headline; the 6 "setup"
   stragglers), the orphan deletions (`ComparisonTable`, `RevenueRateCard`, `StatRow`),
   and the `briefs.generated.ts` regeneration corrections (home-services §10.6).
7. **The SEARCH-row verification sweep (the one research task).** Per R7/D14-f, every
   ledger row in the three §3b/§4.4/§4b visible-value tables marked SEARCH must be
   opened at its URL before a buyer sees it. Run that sweep now (subagents): open each,
   confirm or correct the figure, flip the flag to OPENED or strike the row.
8. **Proposal templates.** Generalize the Beautiful Smiles v5 sheet into the book-jobs
   template and build the sell-product template per `02` §4 — as markdown templates
   under `docs/strategy/sales/proposals/templates/`, R1–R9 embedded as comments, the
   §16 working option names, [slots] for stipulated values.
9. **Measurement plan.** data-cta coverage on the new blocks, the before/after metrics
   for the whole offer push (audit bookings, growth calls, proposal→close).
10. **The build sequence.** Ordered batches: removals/fixes → component build →
    per-page migration (merge architecture §13 with the four specs' page-maps into one
    table — page → change → source-spec → gate) → templates → measurement. Size each
    batch S/M/L, mark GATE:HUMAN checkpoints, say what parallelizes.

**Deliverables:** `docs/strategy/offer-research/03-migration-build-plan.md` (tasks 1–2,
4–6, 8–10) and `docs/strategy/offer-research/04-signoff-sheet.md` (task 3, with task 7's
verification results folded into the affected rows).

**Constraints:** no signed decision changes; D13 stays parked; R1–R9 binding; the
guarantee sentence is untouchable; no new stats beyond task 7's URL-opening; competitor
names never in copy; every copy block you canonicalize keeps its GATE:HUMAN until the
sign-off sheet clears it.
