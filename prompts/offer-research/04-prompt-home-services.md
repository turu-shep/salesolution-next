# Prompt 3 — Home services (roofing-forward): offer + wording

Paste below the line into a fresh Claude Code session. Prefix with `ultracode` for depth.
Run after the offer-architecture prompt (read its output if it exists).

---

You are researching the highest-converting offer and wording for Sale Solution's
home-services vertical: `/industries/home-services/` (which hosts the #audit form the whole
book-jobs funnel converges on) and, later, per-trade niche pages. I'm the founder.
Deliverable: an offer spec + wording kit.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md`,
`docs/strategy/offers/00-offer-architecture.md` (if present — it wins on prices),
`.agents/product-marketing-context.md`, `docs/strategy/roofing/` (the full Revenue Engine
spec: rate card, claims C-01…C-06, guarantee terms), then the live page
`app/(site)/industries/home-services/page.tsx` and
`components/sections/revenue-engine/{Concept3Calculator,RevenuePricing,Guarantee}.tsx`.

**The buyer:** the owner on the roof. Misses calls because he's working. Pays for leads
nobody calls back. Problem-aware, solution-unaware; agency-burned; allergic to hype and
lock-in. Book-jobs rules: day-90 fee-beating guarantee, "I" voice, CTA Revenue Leak Audit,
number delivered in the audit in writing same day.

**The tension you must resolve:** my core-offer target is a **$30K+ install** — but the
current spec rate card is ~$3–4K/mo + $2.5–3K setup (≈$11–15K first quarter), and the
live page shows no number at all. The calculator says the average visitor leaks
**$336,960/yr at defaults**. Research whether the $30K+ concentrated install holds here:

1. **Unit economics per trade.** Average job values, close rates, annual customer value,
   and season length for roofing / HVAC / plumbing / electrical (sourced: trade
   associations, ServiceTitan/Jobber/Housecall Pro industry reports, 2024–26). Which trades
   support a $30K install with a modeled ≥10x first-year recovery, and which need a lower
   entry or harder qualification (min crew size / revenue floor)? Roofing insurance-restoration
   vs retail-replacement split matters — run both.
2. **Offer shape for a 2-month concentrated install.** What must be live by week 2 (call
   answering + missed-call text-back already are), by day 30, by day 60 — so the guarantee
   window ("installed by day 60, proving by day 90") writes itself. Compare against what
   GHL-productized competitors bundle at $2–5K/mo so ours reads like a different category,
   not a pricier version of the same thing.
3. **Pricing display.** Recommend: show a floor ("installs from $X, exact rate in the
   audit")? Show the install price and hold the monthly? The guarantee currently de-risks
   an unknown fee — an anchored fee + guarantee should convert harder. Evidence either way.
4. **The 10x join.** The calculator ($336K/yr) never meets a price. Design the joined
   block: leak → fee → "the system clears its fee in the first N jobs" (N in THEIR unit:
   roofs, service calls) → 12-month do-nothing line. Steal the dentists page's pattern
   (fee slider, "I round down", do-nothing chart) — it's our best.
5. **Legitimate urgency.** Storm season (already used), install lead-time before peak
   season, one-operator capacity ("I install N systems a quarter" — only if true; ask me).
6. **Claims expansion.** Beyond C-01…C-05: find 3–5 new sourced stats (missed-call rates,
   speed-to-lead conversion decay, quote follow-up rates in trades). URL + date + GATE:HUMAN.
7. **The improved condition (Weiss value anchor — governs the fee, see the architecture
   doc).** A $1.5M/yr contractor becoming a $4M/yr business that books jobs without the
   owner answering the phone is a different asset: home-services businesses trade on
   SDE/EBITDA multiples where documented systems and recurring demand expand the multiple
   (source 2024–26 trade-business brokerage data). The install is building a sellable
   business, not buying leads — and the fee is a fraction of that condition, floor $30K+,
   scaled to the value at stake. Draft the three-options proposal for this vertical,
   options named by outcome condition, not scope.

**Wording kit (voice: first-person "I", plain trade language, no unexplained acronyms,
kill-list enforced; humanizer pass on every block):**
- 3 hero options; the guarantee restated against the (now visible?) price; the joined
  leak-math block; the install timeline as a story (day 1 → week 2 → day 60 → day 90:
  the report that settles the guarantee); 5 objection rewrites sharpened for a bigger
  ticket ("$30K when the other guys charge $500/mo" is the one that decides this page);
  audit CTA microcopy naming the artifact ("your numbers, in writing, yours to keep");
  the not-doing-this close in jobs and quotes, not percentages.

**Deliverable → `docs/strategy/offers/home-services-offer-spec.md`:** offer table per trade
tier, sourced number bank (GATE:HUMAN), wording kit, page-map of what replaces what, and
the per-trade niche short-list (which trade earns the first niche page and the 3 numbers
its page leads with). Constraints: no fabricated proof; C-06-class unsourced stats stay
qualitative; no manufactured urgency; the day-90 guarantee wording changes only with my
sign-off.
