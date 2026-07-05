# Prompt 1 — Offer architecture (run first)

Paste everything below the line into a fresh Claude Code session in this repo.
Prefix with `ultracode` for multi-agent depth.

---

You are designing the canonical commercial offer for Sale Solution. I'm the founder. The
deliverable is a decision-ready offer spec, not copy.

**Read first, in order:** `prompts/offer-research/01-offer-audit-2026-07-05.md` (ground
truth of what every page sells today), `.agents/product-marketing-context.md` (voice, ICPs,
claims hygiene, motion rules), `docs/strategy/multi-vertical-pivot/00-phase-plan.md`
(two-funnel model), `docs/strategy/roofing/` (Revenue Engine spec + rate card),
`lib/stats.ts` (approved proof stats), `docs/handoff/06/29/services-hub.md` (the $30K-base
decision context).

**My direction, which you optimize rather than debate:**
- The core offer on every vertical is a **$30K+ system install**, run over **3 months — or
  2 if a concentrated install can be made credible** — followed by **gradual conversion to
  a monthly retainer**. Install first, retainer earned.
- The buyer should experience the offer as a **done deal with an obvious ~10x return,
  fast** — so that not buying reads as the expensive choice. Achieve that with mechanism,
  arithmetic in their own numbers, and risk reversal. Never with hype: the voice rules ban
  manufactured urgency and unsourced claims, and this buyer is agency-burned — a naked
  "1000% ROI" line would kill the sale. Same feeling, defensible construction.
- **Pricing doctrine — Alan Weiss, *Value-Based Fees*. This governs everything below.**
  Fees anchor to the value of the client's **improved condition** (tangible + intangible +
  peripheral, annualized), never to hours, deliverables, cost-plus, or market comps. We
  help owners build **$5–50M/yr businesses**; the fee is a small fraction of that value —
  which is why **$30K+ is a FLOOR that scales with the value at stake**, not a price tag,
  and why the install and FGO must never read as commodities a buyer can comparison-shop.
  Required shapes: Weiss's sequence (objectives → measures of progress → value → THEN fee —
  never fee first) and his "choice of yeses" (three options escalating by **value**, not
  scope). The retainer is re-framed his way: ongoing access to the operator + ownership of
  a compounding system — never a bundle of monthly tasks. Where you research what others
  charge, treat it strictly as the **commodity baseline to position against**, never as an
  anchor for our fee.

**Research (web + your judgment; use Ahrefs/DataForSEO MCPs where demand data helps):**
1. **Value-based fee mechanics (the spine of this whole spec).** Apply *Value-Based Fees*
   to our two funnels: script how the value conversation runs inside the Revenue Leak
   Audit and the Growth Call (they ARE Weiss's objectives → measures → value sequence in
   disguise — the fee lands only after value is established, "in writing, same day").
   Determine what fraction of modeled first-year recovery + improved-condition value is a
   defensible fee at each ICP size (a $40M distributor and an $8M one should not pay the
   same install). Design the **three-options proposal** per motion — e.g. install-only /
   install + operator retainer / Full Growth Ownership — each option framed by the
   outcome condition it buys, never by scope lists. Include the improved-condition math
   itself: revenue growth toward $5–50M and what that does to what the business is worth
   to its owner (sector enterprise-value/EBITDA multiples, sourced).
2. **The commodity baseline (to position against, not to price from).** What productized
   agencies / GHL-style operators / fractional firms charge as setup vs monthly in
   2025–26 — so our offer reads as a different category, and so we know exactly what the
   buyer will compare us to if we let them. What must be IN the install per motion so the
   comparison never starts?
3. **2 vs 3 months.** Evidence and operational logic for a concentrated 60-day install
   (higher perceived momentum, tighter guarantee window: "installed by day 60, proving by
   day 90") vs the current 90-day. What scope must move or drop to make 60 credible? Note
   the interaction with the day-90 guarantee and the 3-month minimum.
4. **The install→retainer bridge.** Design the mechanism that makes the retainer feel
   inevitable rather than upsold: what happens at day 45/60/90 (the two-lines report, the
   guarantee settlement, the "system needs an operator" frame, cylinder expansion "as they
   pay for themselves"). Frame the retainer per Weiss — continued access to the operator
   + ownership of a compounding system, priced against the condition it maintains and
   grows — never as a monthly task bundle a procurement mind can line-item.
5. **Price-model reconciliation — transparency vs commoditization, resolved explicitly.**
   The site currently runs TWO models (base+cylinders vs Sprint/Operator-Retainer/FGO)
   side by side, plus per-service ladders. AND it has a strategic tension you must
   resolve, not paper over: published prices are our trust signal for an agency-burned
   buyer, while Weiss says published bands commoditize. Recommended synthesis to test:
   published bands survive **only as entry doors and honesty artifacts** (cylinders,
   per-SKU math), while the install and FGO are value-priced — "from $30K, scaled to the
   value at stake" — with the exact number always downstream of the value conversation.
   Decide one spine model (install → retainer → FGO) with per-service ladders as on-ramps
   that fold INTO it, and exactly which numbers appear on which page type (hub / pillar /
   niche / cylinder / product page). Resolve the Sprint-band conflict ($12–24K vs $9–35K
   vs $15–35K) with one canonical band or a per-cylinder rule.
6. **Book-jobs pricing disclosure.** Today the model is published but the number withheld
   ("in the audit, in writing, same day") — which is already Weiss-shaped: the audit is
   the value conversation and the fee follows it. The spec's rate card (~$3–5K/mo +
   setup) is far below the $30K+ core-offer floor. Recommend: (a) whether the book-jobs
   install moves to $30K+ (and for which sub-niches the unit economics support it — use
   the calculators' math), or value-scaled tiers (cosmetic-dental yes, solo tradesman no
   → qualify harder), and (b) whether to show a floor ("installs from $X") so buyers
   self-qualify without collapsing the fee into a comparable number.
7. **Risk-reversal architecture.** Per motion: how the day-90 guarantee should read against
   a $30K+ install (book-jobs), and what carries the same weight on sell-product where a
   guarantee is banned (published price, week-4 work shown, 48h SOW, pilot/snapshot doors,
   exit terms). Assess a "pilot-priced first cylinder credits toward the install" mechanic.

**Deliverable → write to `docs/strategy/offers/00-offer-architecture.md`:**
- The canonical ladder (one diagram): entry doors → install (floor price + value-scaling
  rule, length, contents per motion) → retainer (framed as access + ownership) → FGO.
  Which numbers appear on which page type, and which are never published.
- The three-options proposal structure per motion (Weiss's choice of yeses), with each
  option named by the condition it buys.
- The value-conversation script for each door (audit / growth call): objectives →
  measures → value → fee, mapped to what those calls already do.
- The install→retainer bridge script (day 0 / 45 / 60–90 / month 4+).
- 2-vs-3-month recommendation with the scope that makes it work.
- The decisions I need to make, each with your recommendation and the trade-off in one line.
- A migration table: page → what changes (old number/model → new).
- Sources for every external number (URL + date). Mark anything destined for live copy
  **GATE:HUMAN**.

**Constraints (hard):** motion decides guarantee/voice/CTA/price-disclosure — never mix.
No fabricated proof. Only Approved-Claims-Library stats in copy recommendations; the
approved 2.5x-in-12-months and 5.2x-lifetime ROI stats (`lib/stats.ts`) are the sanctioned
ROI proof — build with them. No manufactured urgency. Competitor-policy names never in copy.
Nothing in this deliverable ships to a page without my sign-off.
