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

**Research (web + your judgment; use Ahrefs/DataForSEO MCPs where demand data helps):**
1. **Install-fee economics.** What do productized agencies / GHL-style operators / fractional
   firms charge as setup vs monthly in 2025–26, and what setup:monthly ratio survives? Is a
   $30K+ install defensible at our ICP sizes ($5–75M industrial; $1–10M local-service;
   DTC brands), and what must be IN the install to justify it per motion?
2. **2 vs 3 months.** Evidence and operational logic for a concentrated 60-day install
   (higher perceived momentum, tighter guarantee window: "installed by day 60, proving by
   day 90") vs the current 90-day. What scope must move or drop to make 60 credible? Note
   the interaction with the day-90 guarantee and the 3-month minimum.
3. **The install→retainer bridge.** Design the mechanism that makes the retainer feel
   inevitable rather than upsold: what happens at day 45/60/90 (the two-lines report, the
   guarantee settlement, the "system needs an operator" frame, cylinder expansion "as they
   pay for themselves"). Where do successful productized services put this conversion point?
4. **Price-model reconciliation.** The site currently runs TWO models (base+cylinders vs
   Sprint/Operator-Retainer/FGO) side by side, plus per-service ladders. Decide: one model
   everywhere, or one **spine** model (install → retainer → FGO) with per-service ladders
   as on-ramps that fold INTO it — and exactly which numbers appear on which page type
   (hub / pillar / niche / cylinder / product page). Resolve the Sprint-band conflict
   ($12–24K vs $9–35K vs $15–35K) with one canonical band or a per-cylinder rule.
5. **Book-jobs pricing disclosure.** Today the model is published but the number withheld
   ("in the audit, in writing, same day") while the spec's rate card (~$3–5K/mo + setup) is
   far below the $30K+ core-offer target. Recommend: (a) whether the book-jobs install
   moves to $30K+ (and for which sub-niches the unit economics support it — use the
   calculators' math), or tiers (e.g. cosmetic-dental yes, solo tradesman no → qualify
   harder), and (b) whether to show a floor ("installs from $X") so buyers self-qualify
   without killing the audit CTA.
6. **Risk-reversal architecture.** Per motion: how the day-90 guarantee should read against
   a $30K install (book-jobs), and what carries the same weight on sell-product where a
   guarantee is banned (published price, week-4 work shown, 48h SOW, pilot/snapshot doors,
   exit terms). Assess a "pilot-priced first cylinder credits toward the install" mechanic.

**Deliverable → write to `docs/strategy/offers/00-offer-architecture.md`:**
- The canonical ladder (one diagram): entry doors → install (price, length, contents per
  motion) → retainer (bands) → FGO. Which numbers appear on which page type.
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
