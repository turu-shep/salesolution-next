# Prompt 2 — Industrial distribution: offer + wording

Paste below the line into a fresh Claude Code session. Prefix with `ultracode` for depth.
Run after the offer-architecture prompt (read its output if it exists).

---

You are researching the highest-converting offer and wording for Sale Solution's industrial
vertical: `/industries/industrial-distribution/` and the sell-product services book behind
it. I'm the founder. Deliverable: an offer spec + wording kit, not shipped copy.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md`,
`docs/strategy/offers/00-offer-architecture.md` (if present — it wins on prices),
`.agents/product-marketing-context.md`, `docs/strategy/icp/industrial-distribution.md`
(the ICP in their own words + anti-jargon rules), then the live pages:
`app/(site)/industries/industrial-distribution/page.tsx`, `app/(site)/services/page.tsx`,
`app/(site)/services/full-growth-ownership/page.tsx`.

**The buyer:** owner/president of a $5–75M distributor or technical manufacturer. Measures
in quotes, RFQs, counter sales, revenue — never ARR/pipeline/CTR. Villains he already
names: Amazon, manufacturers going direct, the quieter phone. Agency-burned, hype-allergic.

**Core offer to optimize (my direction):** $30K+ install over 2–3 months → cylinders
$4–15K/mo → FGO from $20K/mo. Sell-product rules: NO guarantee (the absence is the trust
signal), published prices, SOW in 48h, "we" voice, CTA Book a Growth Call.

**Research:**
1. **The 10x arithmetic for a distributor.** This page has NO calculator — build the model
   for one: average RFQ value and close rates in industrial distribution, reorder/account
   value, the cost of a 2-day quote turnaround (source: industry benchmarks, distribution
   trade press — MDM, NAW, Distribution Strategy Group). What leak formula (in THEIR
   units: RFQs/week × close rate × average order × reorder multiple) makes $30K look like
   rounding error? Every number sourced (URL + date), marked GATE:HUMAN.
2. **Offer shape.** What do $5–75M distributors actually buy first (site/catalog fix?
   AI-search visibility? outbound?), and what should the INSTALL contain for this vertical
   so it reads concentrated and complete? Which cylinder is the natural first add-on?
3. **Anchors that work on this buyer.** Test the current ones ($300K/yr growth hire,
   $15–40K/mo agency stack, per-SKU catalog math) against alternatives: cost of one lost
   house account, margin already spent winning an RFQ that dies unchased, Amazon's take
   rate. Which 2–3 anchors carry the page?
4. **Done-deal mechanics without a guarantee.** Week-4 work shown, two revenue lines
   monthly, 90-day notice, published prices, the free written diagnostic
   (`/unlock-growth-audit/`) as the artifact CTA. What else do high-trust B2B productized
   firms use that fits our constraints? (Their names stay out of copy.)
5. **AI-search urgency, legitimately.** The land-grab data (AI Overviews share of industrial
   queries, citation-window evidence) as the honest urgency mechanism — sourced, no
   countdowns.

**Wording kit to produce (voice: operator, terse, "X, not Y", numbers before adjectives,
kill-list enforced; run the humanizer skill on every block):**
- 3 hero options (headline + sub + spec-card lines) leading with the outcome in his words.
- The leak-math block: formula, defaults, and the payback line joined to the install price
  ("the math on one recovered house account" style).
- Offer-presentation block: install → parts → FGO, one model (kill the FAQ's contradictory
  Sprint framing or fold it in per the architecture doc).
- 5 objection rewrites from the objection library, sharpened for the $30K ask ("why no
  guarantee" is the big one — the answer must make the guarantee's absence the reason to
  trust the price).
- CTA microcopy: Book a Growth Call + the written-diagnostic secondary door, each naming
  what the buyer walks away with.
- The "not doing this" close: cost-of-inaction in distributor units, no scare tactics.

**Deliverable → `docs/strategy/offers/industrial-offer-spec.md`:** offer table (price,
term, contents, bridge to retainer), the sourced number bank (GATE:HUMAN), the wording kit,
and a page-map (which block replaces which section of the live page). Constraints: no
fabricated proof or clients (Northern Hydraulics name is hard-blocked); only approved or
newly-sourced-and-gated stats; competitor names never in copy.
