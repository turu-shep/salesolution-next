# Prompt 7 — Niche template (reusable for any future niche)

Fill the {PLACEHOLDERS}, then paste below the line into a fresh Claude Code session.
Prefix with `ultracode` for depth. Use when a niche is earned (a real client or real
search demand) per the Phase-6 lazy-build rule.

Examples: HVAC, plumbing, med spa, orthodontics, watches, flooring showrooms.

---

You are researching the offer and wording for a new Sale Solution niche page:
**Revenue Engine for {NICHE}** (e.g. "HVAC contractors", "med spas", "watch dealers"),
which will live at {URL — /revenue-engine/{slug}/ for book-jobs niches, or under
/industries/… for sell-product} beneath the {PARENT PILLAR} pillar. I'm the founder.
Deliverable: a niche offer spec + wording kit + full page outline.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md`,
`docs/strategy/offers/00-offer-architecture.md` (canonical prices — inherit, don't
reinvent), `docs/strategy/offers/{PARENT}-offer-spec.md` (the parent vertical's research,
if it exists), `.agents/product-marketing-context.md` (motion rules decide guarantee/
voice/CTA — the niche's `motion` field, never its breadcrumb), and
`app/(site)/revenue-engine/dentists/page.tsx` (the reference niche page pattern:
retain-led wedge, WholeFlowLeak calculator with fee slider + do-nothing chart, published
model, day-90 guarantee with the founder's name on it, on-page audit form).

**Research:**
1. **Unit economics + the improved condition.** {NICHE}'s average ticket, customer LTV,
   close/book rates, missed-call and follow-up failure rates, seasonality — sourced from
   2024–26 industry data (trade associations, vertical SaaS benchmark reports, credible
   trade press). Verdict: does this niche clear a ≥10x model on the $30K+ install floor?
   If not, the qualification floor (size/revenue/mix) that does. Then the Weiss value
   anchor (see the architecture doc — it governs the fee): what the business becomes
   worth with owned demand and a working Retain loop ({NICHE}'s valuation multiples,
   sourced) — the fee is a fraction of that condition, scaled to the operation's size,
   presented as three options named by outcome, never by scope.
2. **The leak formula in THEIR units.** Bring/Convert/Retain inputs with sourced
   defaults, tuned so honest defaults land 5–15x the fee. Every number: URL + date +
   GATE:HUMAN. Recovery rates conservative, "round down" survives.
3. **Their words.** How {NICHE} owners describe the pain (forums, trade subreddits,
   association surveys, review sites of their current vendors). The wedge in their
   vocabulary, and the 3 objections unique to this niche (beyond the standard library).
4. **The install for this niche.** What's live by week 2 / day 30 / day 60; any
   compliance analog (HIPAA-equivalent, licensing, TCPA sensitivity); integrations that
   matter ({PMS/CRM/FSM equivalents}).
5. **Competition check.** What the niche's incumbent marketers sell and charge, so the
   offer reads as a different category. Their names never in copy.
6. **Demand check.** Search volumes for "{NICHE} + near me / marketing / answering"
   patterns (DataForSEO/Ahrefs MCPs) to size the SEO play and pick the page's target
   query per the keyword-ownership rules ("Revenue Engine for {niche}" + job-verb).

**Wording kit (motion decides voice; kill-list enforced; humanizer pass):** 3 hero
options, the joined leak-math block with the payback line in {NICHE} units, offer
presentation (inherited prices), 5 niche-specific objection rewrites, CTA microcopy,
the not-doing-this close, FAQ additions (schema-bound).

**Deliverable → `docs/strategy/offers/{slug}-niche-spec.md`:** go/no-go verdict with the
qualification floor, offer table, sourced number bank (GATE:HUMAN), wording kit, full
page outline mapped to the dentists-page section pattern, and the measurement plan
(target query, data-cta tags). Constraints: no fabricated proof; inherit canonical
prices; the motion's commercial block only (guarantee XOR published bands — never both);
no manufactured urgency.
