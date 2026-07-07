# Offer research — prompt pack

Prompts to run in **fresh Claude (Fable) sessions in this repo** to research and design the
highest-converting offer + wording per industry and niche. Written 2026-07-05, grounded in a
full audit of every live commercial surface (see `01-offer-audit-2026-07-05.md`).

## The goal these prompts serve

- **Core offer everywhere:** a **$30K+ system install** over **2–3 months** (2 if it can be
  made concentrated and credible), converting **gradually into a retainer** on every vertical.
- **The felt outcome for the buyer:** signing should feel like a done deal with an obvious
  ~10x return, fast — so that *not* doing it reads as the expensive option.
- **The method that achieves that feeling** (and survives our no-hype voice + claims hygiene):
  arithmetic, not adjectives. Leak math in the buyer's own numbers, joined to the fee on the
  same screen; payback in units they count ("clears the fee in the first two roofs"); the
  do-nothing projection; the day-90 guarantee (book-jobs) or published-price + 48h-SOW
  certainty (sell-product). Never a naked "1000% ROI" claim — that phrase converts skeptics
  into ex-visitors and violates the claims library. The dentists page already has the best
  version of this pattern; the prompts export it everywhere.
- **Pricing doctrine: value-based fees (Alan Weiss, *Value-Based Fees*).** The fee anchors to
  the value of the client's **improved condition** — we help owners build $5–50M/yr
  businesses, and the fee is a small fraction of that, never a markup on deliverables or a
  market-comp number. **$30K+ is the floor, not the price: it scales with the value at
  stake.** The core install and Full Growth Ownership are never commoditized — a buyer must
  not be able to comparison-shop them. Published bands survive only as entry doors and
  honesty artifacts (cylinders, per-SKU math). Weiss's sequence is required — objectives →
  measures → value → *then* fee (our Leak Audit and Growth Call ARE that conversation; the
  number lands after value is established, in writing, same day) — as is his "choice of
  yeses": three options escalating by value, not scope. Retainers are re-framed his way:
  ongoing access to the operator + ownership of a compounding system, not monthly tasks.

## How to run

1. Open a fresh Claude Code session in this repo.
2. Paste a prompt file's **PROMPT** section verbatim. Prefix with `ultracode` for maximum
   research depth (multi-agent). The Ahrefs + DataForSEO MCPs are available for demand data.
3. Each prompt writes its output to `docs/strategy/offer-research/…` so results accumulate in one place.
4. Every number a prompt proposes for live copy needs a source URL + date and **GATE:HUMAN**
   (your sign-off) before it ships — the prompts enforce this.

## Run order — status as of 2026-07-07

| # | File | Produced | Status |
|---|------|----------|--------|
| 1 | `02-prompt-offer-architecture.md` | `docs/strategy/offer-research/00-offer-architecture.md` | ✅ **SIGNED** (D1–D12 + §16 corrections) |
| 2 | `03-prompt-industrial.md` | `industrial-offer-spec.md` (48 verified claims, +§4b) | ✅ done, GATE:HUMAN pending |
| 3 | `04-prompt-home-services.md` | `home-services-offer-spec.md` (C-07…C-13, +§3b) | ✅ done, GATE:HUMAN pending |
| 4 | `05-prompt-medical-dentists.md` | `medical-dental-offer-spec.md` (C-06 unblocked) | ✅ done, GATE:HUMAN pending |
| 5 | `06-prompt-consumer-jewelry.md` | `consumer-jewelry-offer-spec.md` (calculator defect fixed, +§4.4) | ✅ done, GATE:HUMAN pending |
| 6 | `07-prompt-proof-roi-engine.md` | **REWRITTEN 2026-07-07 → consolidation prompt**: unified payback component, the single sign-off sheet, SEARCH-row verification sweep, proposal templates, the sequenced build plan → `03-migration-build-plan.md` + `04-signoff-sheet.md` | ▶️ **next** |
| 7 | `08-prompt-niche-template.md` | Per-niche spec (**roofing queued first** — lead numbers banked in home-services §12) | as earned (after #6) |

**Also in `docs/strategy/offer-research/` (born from the Beautiful Smiles deal, 2026-07-07):**
`01-anchor-ladder.md` (D13 wide ladder $30/$45/$200K-class — **PARKED by founder**, future) ·
`02-visible-value-pass.md` (D14 priced-foundations proposal layer, rules R1–R9 — folded into
the three vertical specs' §3b/§4.4/§4b; proposal artifacts only, never pages).

## Non-negotiables baked into every prompt

- Motion decides the commercial model (guarantee/voice/price-disclosure/CTA) — never mix.
- Only Approved-Claims-Library stats in copy; new stats need source + date + GATE:HUMAN.
- No fabricated proof, testimonials, or results. `[PROOF-SLOT]` placeholders until real data.
- No manufactured urgency/countdowns/scarcity — legitimate urgency only (seasonality,
  genuine one-operator capacity, market-window data).
- Voice: operator register, kill-list enforced, humanizer pass before finalizing wording.
- Competitor-policy names never appear in body copy.
