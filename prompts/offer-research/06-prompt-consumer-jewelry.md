# Prompt 5 — Consumer & DTC brands pillar + jewelry niche: offer + wording

Paste below the line into a fresh Claude Code session. Prefix with `ultracode` for depth.
Run after the offer-architecture prompt (read its output if it exists).

---

You are researching the highest-converting offer and wording for Sale Solution's consumer
vertical: `/industries/consumer-brands/` (pillar, freshly motion-flipped to sell-product)
and the future jewelry niche page (jewelry/luxury is the confirmed lead niche — Liori
Diamonds is a real client in this space). I'm the founder. Deliverable: an offer spec +
wording kit.

**Read first:** `prompts/offer-research/01-offer-audit-2026-07-05.md`,
`docs/strategy/offers/00-offer-architecture.md` (if present — it wins on prices),
`.agents/product-marketing-context.md`, the live page
`app/(site)/industries/consumer-brands/page.tsx`, and `lib/strategy/niches/` for any
consumer briefs.

**The buyer:** owner of a jewelry/luxury or high-consideration consumer brand — DTC,
storefront, or both (the storefront is a channel; the motion is retail). Sell-product
rules: NO guarantee ("the price is in the open instead"), published bands, "we" voice,
CTA Book a Growth Call, brand-blue.

**The critical defect you must solve first:** the pillar shows the $30K install next to a
calculator whose default leak is **$20,160/yr** (60 lapsed × 20% win-back × $140 order ×
12). **The page's own math fails its own price.** This is the weakest offer-math surface
on the site. The docs also flag this vertical as thinnest-documented — no approved dollar
stats exist yet. So:

1. **Rebuild the leak model for the real ICP.** A $140 average order profiles a corner
   shop, not our buyer. For jewelry/luxury: average order values (engagement $5–7K+, lab-grown
   dynamics, repair/service LTV), repeat-purchase and referral economics, abandoned-cart
   values at high AOV, local "near me" high-intent search volumes (use DataForSEO/Ahrefs
   for demand data; industry sources: The Knot jewelry studies, Edahn Golan, IGI/GIA
   market data, 2024–26). Build the leak formula in JEWELER units (carts abandoned ×
   AOV, past buyers with no win-back × next-piece value, "engagement rings near me"
   searches lost to page 2) so the $30K install clears 10x in the model. Then generalize:
   which OTHER consumer profiles (watches, flooring showrooms, furniture, specialty)
   clear the bar, and what's the AOV/revenue floor below which we decline?
2. **Calculator defaults.** Propose new sourced defaults per profile (jewelry first) that
   make the default output land at 5–15x the visible price — honestly (buyer can lower
   them; formula stays disclosed; "we round down" survives). GATE:HUMAN on every number.
3. **Offer shape.** What does the consumer install CONTAIN (feed/catalog fix, local+AI
   search, cart/quote recovery, win-back engine, review flow) and what's the natural
   first monthly cylinder? Does a 2-month concentrated install work when seasonality
   (Q4, engagement season) argues for installing BEFORE the peak — the legitimate
   urgency mechanism for this vertical?
4. **Done-deal mechanics, sell-product style.** No guarantee allowed: published price,
   48h SOW, week-4 work shown, exit terms — plus what high-trust ecommerce agencies use
   that fits (paid pilot? snapshot audit artifact like the industrial written diagnostic?
   The Liori relationship as the eventual named case study — flag as PROOF-SLOT until
   consented).
5. **Wedge check.** Current wedge is "shoppers find a competitor; past buyers never come
   back." Validate against how jewelry owners actually describe the pain (forums, trade
   press, r/jewelers, JCK) and sharpen to their words.
6. **The improved condition (Weiss value anchor — governs the fee, see the architecture
   doc).** A jeweler whose demand is owned (search + AI + Maps + a worked customer list)
   instead of rented (Instagram, the mall's foot traffic) is a different asset: the
   customer list with a live win-back engine is enterprise value, and repeat/referral
   revenue changes what the business is worth at exit (source retail/jewelry valuation
   practice, 2024–26). The fee is a fraction of that condition — floor $30K+, scaled to
   the brand's size. Draft the three-options proposal for this vertical, options named
   by outcome condition, not scope.

**Wording kit (voice: "we", plain, premium-calm — this buyer sells luxury and smells
cheap marketing instantly; kill-list enforced; humanizer pass on every block):**
- 3 hero options for the pillar; the rebuilt joined leak-math block; the offer ladder
  block (one model, kill the FAQ's Sprint contradiction); 5 objection rewrites ("we
  already have a web agency", "our Instagram brings the traffic", "why no guarantee",
  "$30K vs our margin", "we're seasonal"); CTA microcopy naming the artifact; the
  not-doing-this close in pieces-not-percentages ("two engagement rings a month walking
  to the mall jeweler" style).
- Jewelry niche page: full outline (hero → leak → calculator → offer → objections →
  close) with the numbers bank slotted in, ready to build when the niche is earned.

**Deliverable → `docs/strategy/offers/consumer-jewelry-offer-spec.md`:** profile tiers +
floor, offer table, sourced number bank (GATE:HUMAN), wording kits, page-map for the
pillar, jewelry niche outline. Constraints: no fabricated proof (Liori usable only with
consent — PROOF-SLOT otherwise); no invented stats (this vertical has none approved —
everything you propose needs source + date + gate); no book-jobs vocabulary (no
guarantee talk, no Revenue Leak Audit CTA).
