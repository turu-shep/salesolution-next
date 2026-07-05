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
3. Each prompt writes its output to `docs/strategy/offers/…` so results accumulate in one place.
4. Every number a prompt proposes for live copy needs a source URL + date and **GATE:HUMAN**
   (your sign-off) before it ships — the prompts enforce this.

## Run order

| # | File | Produces | Run when |
|---|------|----------|----------|
| 1 | `02-prompt-offer-architecture.md` | The canonical offer ladder + pricing decisions (resolves the two contradictory models) | **First** — everything else inherits it |
| 2 | `03-prompt-industrial.md` | Industrial offer spec + wording | After #1 |
| 3 | `04-prompt-home-services.md` | Home-services offer spec + wording (roofing-forward) | After #1 |
| 4 | `05-prompt-medical-dentists.md` | Medical pillar + dentists niche offer spec + wording | After #1 |
| 5 | `06-prompt-consumer-jewelry.md` | Consumer/DTC pillar + jewelry niche offer spec + wording | After #1 |
| 6 | `07-prompt-proof-roi-engine.md` | The cross-page proof/payback system (calculators joined to price, claims library expansion, legitimate urgency) | After the verticals, or in parallel with them |
| 7 | `08-prompt-niche-template.md` | Reusable template for any future niche (HVAC, med spa, watches…) | Whenever a niche is earned |

Prompts 2–5 are independent of each other — they can run in parallel sessions.

## Non-negotiables baked into every prompt

- Motion decides the commercial model (guarantee/voice/price-disclosure/CTA) — never mix.
- Only Approved-Claims-Library stats in copy; new stats need source + date + GATE:HUMAN.
- No fabricated proof, testimonials, or results. `[PROOF-SLOT]` placeholders until real data.
- No manufactured urgency/countdowns/scarcity — legitimate urgency only (seasonality,
  genuine one-operator capacity, market-window data).
- Voice: operator register, kill-list enforced, humanizer pass before finalizing wording.
- Competitor-policy names never appear in body copy.
