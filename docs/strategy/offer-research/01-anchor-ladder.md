# 01 — The anchor ladder (proposed D13): $30K / $45K / $200K-class

**Status:** PROPOSED — not signed. Amends one signed rule (the §4 option-step sizing in `00-offer-architecture.md`); everything else here composes with D1–D12 unchanged. GATE:HUMAN on adoption, on every tier price, and on tier names.
**Date:** 2026-07-07
**Origin:** the Beautiful Smiles proposal evolution (v1→v4, `docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md`) — the reference implementation of the visible-value pattern this ladder completes.

---

## 1. The shape, and why

Three options per proposal, priced **wide**, not in +20–25% steps:

```
Tier 1  ~$30K      the foundation, installed — whole on its own, buyer operates after day 90
Tier 2  ~$45K      the foundation, run — the operator stays on it          ← designed default
Tier 3  ~$200K-class   a different condition entirely (12-month program)   ← rare by design
```

**Why wide beats stepped.** The current +20–25% ladder ($30K → $37.5K → $46.5K) reads as one product with upsells, so buyers anchor on Tier 1 and every step up feels like padding. A wide ladder works differently:

- **The $200K tier re-anchors the page.** Against it, $45K reads as the sane middle (compromise effect — buyers systematically prefer the middle option when extremes are present). $30K becomes the self-selected entry, not "the price."
- **Most choose the middle, some choose the top, and the $30K buyer self-calibrates** — they know they bought fewer fronts covered. That's the intended distribution: average deal moves from ~$30K to ~$45–60K without the floor ever moving.
- **Weiss-clean:** options escalate by *condition and access*, and a genuinely different condition may cost 4–6× the entry tier. The signed +20–25% step rule was written for same-condition escalation; Tier 3 is not the same condition. That's the amendment (D13), not a violation.

**Why the published floor stays $30K (founder concern, 2026-07-07, resolved):** these buyers finance purchases; a $45K *published floor* is a psychological ceiling that costs calls. So the floor line (D3) never changes. The $45K+ money arrives per deal, through the ladder and through `max($30K, ~10% of stipulated gain)` — "ten percent of the number you just called conservative" converts where a $45K sticker doesn't. Affordability is a **payment-structure** lever (staged 50/25/25; extended schedule = [DECIDE], and in writing it is a "payment schedule," never "financing"), never a package cut. When scope must give, move items across the day-90 line — don't discount.

## 2. Guardrails (the ladder fails without all four)

1. **Tier 3 is a different condition, never gold trim.** If it's the same deliverables with more meetings, it's decoration and this buyer smells it. Each vertical's Tier 3 must name a condition Tiers 1–2 cannot buy (see §3).
2. **Same guarantee at every tier (book-jobs).** Tier 1 is *fewer fronts covered*, never a worse job on the covered fronts. Differentiate by breadth, access, speed, and who operates after day 90 — expectations calibrate through "what happens after day 90," not through quality. (Sell-product: same rule with the risk-reversal stack in place of the guarantee.)
3. **Tier 3 is real, occasionally bought, and capacity-capped out loud.** "I take two of these a year" — true for a one-operator shop, and the only scarcity canon allows. A decoy nobody can actually buy poisons "published model, no games."
4. **Tier 3 appears only where the value math supports it.** Qualification rule: stipulated 12-month value ≥ ~$1.5–2M, or a named exit horizon, or multi-location. Below that, the rate letter shows two options — the *absence* of Tier 3 is itself an honesty signal.

**The credit path (D7 extended):** Tier 1 fee credits 100% toward Tier 3 within 12 months. The cautious buyer gets a ladder instead of a ceiling.

## 3. Tier 3 per vertical — the condition each buys

The $200K-class tier is always the same underlying object wearing the vertical's clothes: **the improved condition made structural — the business itself re-rated.** Every vertical's research already carries the sourced math; none of it is new.

| Vertical (motion) | Tier 3 working name | The condition | The sourced backbone (already in the spec) |
|---|---|---|---|
| **Dental / medical** (book-jobs) | "The practice, made worth more" | 12 months: growth run + practice brought to diligence-grade (recall compliance 75%+, active-patient trend, attribution data room) + quarterly valuation checkpoint | FOCUS 4.2–5.1× add-on / 5–7× sub-$1M; BCAT diligence gates; 16.1% DSO affiliation (`medical-dental-offer-spec.md`) |
| **Home services** (book-jobs) | "The sellable shop" | 12 months: the leak sealed + demand run + the shop made buyable — owner-independence documented, recurring/maintenance book built, QoE-ready call and job records | IBBA 2.0→4.0× size ladder; ~52% of HVAC listings never sell (owner dependence); 56 PE roofing platforms, 134 add-ons in 2024 (`home-services-offer-spec.md` §8) |
| **Industrial** (sell-product) | FGO, presented as the Tier-3 condition | The company re-rated: $800K → $1.5M EBITDA moves the multiple band itself (≈ +$5.2M EV in the worked example); concentration repaired (>20% customer = 20–35% valuation cut) | Banks F1–F8 (`industrial-offer-spec.md` §2.6). **Note:** FGO already IS the $200K-class tier ($20K/mo ≈ $240K/yr) — the change is presentation: state the annual figure on the proposal so the install anchors against it |
| **Consumer / jewelry** (sell-product) | "The store that sells twice" (or FGO Shape B) | 12 months: the engine run + the store made transferable — attributed customer book, documented demand systems; the difference between a 2–3× goodwill sale and a going-out-of-business sale | BizBuySell 1.94× SDE median; half of owners 60+; 1 in 5 expects zero-goodwill liquidation (`consumer-jewelry-offer-spec.md` §2.3) |

## 4. What changes where (rollout)

1. **Proposal/rate-letter templates only, first.** The ladder lives in the same-day written rate (book-jobs) and the 48h SOW (sell-product) — the two artifacts where exact numbers are allowed. Pages keep the floor line and bands per §9 of the architecture; nothing on a page changes because of D13.
2. **Prove it on 3–5 proposals** (Beautiful Smiles is deal #1 with the narrow ladder already committed — its rate letter may show the wide Tier 3 as a preview). Track pick-rates; the ladder earns page-level presence only if the middle-tier distribution shows up in reality.
3. **Then** revisit whether the vertical pages' pricing blocks reference three conditions (structure, never totals).

## 5. Decisions for Artur

| # | Decision | Recommendation |
|---|---|---|
| D13-a | Amend §4's +20–25% step rule: steps sized by condition; Tier 3 may be 4–6× Tier 1 | Adopt |
| D13-b | Tier prices per vertical (dental $30/$45/$200K shown; others per the value rule) | Set per §3, GATE:HUMAN each |
| D13-c | Tier-3 qualification rule (≥$1.5–2M stipulated value, exit horizon, or multi-location; else two options only) | Adopt |
| D13-d | Credit path Tier 1 → Tier 3 within 12 months | Adopt |
| D13-e | Public capacity number for Tier 3 ("two a year") | Set the true number or don't ship the line |
