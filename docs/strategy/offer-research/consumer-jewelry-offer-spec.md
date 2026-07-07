# Consumer / Jewelry — Offer Spec + Wording Kit

**Status:** DRAFT for founder review — every number marked GATE:HUMAN needs Artur's sign-off before it touches a page.
**Date:** 2026-07-07
**Scope:** `/industries/consumer-brands/` (pillar, sell-product) + the future Jewelry & Luxury niche page (Phase 6, flat `/revenue-engine/{slug}/`, sell-product motion).
**Inherits:** `00-offer-architecture.md` (SIGNED 2026-07-05) — one spine, D1–D12, §16 corrections. This spec prices nothing new; it applies the architecture to this vertical and fixes its broken math.
**Research base:** 6-lane sweep 2026-07-05/07 (jewelry economics, DataForSEO demand pull, owner voice-of-customer, deal mechanics, valuation, adjacent profiles), with adversarial verification on load-bearing numbers. Verdicts noted per row; two headline numbers were REFUTED in verification and are corrected below.
**2026-07-07:** §4.4 added — the visible-value SOW layer (priced ledger in dollars and pieces, two faces incl. the hard-print ADA line, the sell-product transfer bridge) + decisions D-C7/D-C8. Rules and critique: `02-visible-value-pass.md`.

---

## 0. The one-paragraph read

The pillar's calculator says the leak is $20,160/yr and the same page says the install is $30,000 — the page fails its own payback test because the $140 average order profiles a corner gift shop, not our buyer. The fix is the buyer, then the math: an independent jeweler's average sale is $4,600 on bridal (The Knot 2026, 10,000+ couples) and $2,739 on diamond jewelry generally (Tenoris POS 2025), local purchase-intent searches run 1.24M/month nationally at $6–11 CPCs, and roughly half of engagement-ring customers never come back for the wedding bands. Rebuilt in those units on the dentists' calculator pattern, the conservative default leak lands at **$364K/yr (12.1x the install)** with **~$182K modeled as recoverable (6.1x)** — and the install reads as **seven pieces, once**. Jewelry leads because the economics are the strongest and Liori Diamonds makes it real (PROOF-SLOT until consent); the same model clears honestly for hot-tub/spa dealers, AV integrators, flooring and furniture showrooms, and fails honestly for art galleries and anything under ~$1.5K a ticket with no service line. No guarantee anywhere on this motion — the price is in the open instead.

---

## 1. Profile tiers — who the consumer install is for, and the decline line

The bar: an honest leak model (lost local demand + missed/slow inquiries + unworked past-customer list) must credibly reach **$150K+/yr modeled leak (5x the $30K floor)** for a typical independent operator, using sourced defaults the buyer can lower. Gate on **ticket and CPC, not volume** — "bike shop near me" pulls 673K searches/mo but the market prices those clicks at $0.75; "mattress store near me" pulls 301K at $13.17. The ad market has already told us which categories bleed real money per miss.

### 1.1 Tier table

| Tier | Profile | Avg ticket (sourced) | Verdict | Qualification line |
|---|---|---|---|---|
| **Lead niche** | Jewelry — bridal & custom | $4,600 ring (The Knot 2026); $7,000 natural | **CLEARS** | $1M+ revenue (58% of independents are there — INSTORE 2025) with a bridal/custom line |
| **Lead niche** | Jewelry — fine & gifts | $2,739 diamond-jewelry item (Tenoris 2025) | **CLEARS** | $1M+ revenue, a customer book they can name |
| 2 | Hot tub / swim spa / pool dealers | $10–17K spa; $22.5K swim spa; ~$66K pool | **CLEARS** (best after jewelry: 40–50% margin + $500–1K/yr per-owner water-care spend makes win-back real) | Sells installed units, has a past-buyer list 300+ |
| 2 | Home theater / AV integrators | $20–57K project (CEDIA 2023) | **CLEARS** | Retail-facing showroom, average project $15K+ |
| 2 | Flooring showrooms | $3,159 installed job (Angi 2026); $17.61 CPC on install intent | **CLEARS** | Sells installed jobs $3K+, issues 15+ quotes/mo |
| 2 | Furniture showrooms | $1,400–1,800 sofa; 1M/mo near-me searches | **CLEARS** | $1.5M+ revenue, average ticket $1,000+ |
| 2 | Fireplace / outdoor-kitchen stores | $3,700 insert installed; $16,587 outdoor kitchen | **CLEARS** | Sells installed projects. Grill-only box retail FAILS |
| 3 | Watch dealers (pre-owned/luxury) | $13,426 avg pre-owned Rolex (Bob's Watches 2025) | **CLEARS on revenue, thin on margin** (10–27% markup) | 10+ sales/mo or $2M+ sell-through — and model their leak in **gross-profit terms**, or the owner does that math against us |
| Borderline | Mattress ($1,194 ticket, 7–10yr cycle kills win-back) · e-bike shops ($3,055 unit) · appliance dealers (rebate-thin margins) · piano dealers (near-zero repeat) | — | Case-by-case | $1.5M+ revenue and a real service/package line, else decline |
| **Decline** | Art galleries (typical dealer <$500K/yr, 57 buyers — Art Basel/UBS 2026) · lighting/plumbing showrooms (trade-driven, no sourceable ticket) · any store under ~$1.5K average sale with no service line | — | **FAILS** | A $150K modeled leak would be 30–60% of an art gallery's whole revenue. Not honest. Don't make the offer |

### 1.2 The floor, in plain terms (internal qualification rule)

Take the account when all three hold: **(1)** an installed or considered purchase of $3K+ per sale, or $10K+ at any margin; **(2)** a past-customer list of 300+ they can actually name; **(3)** either a 25K+/mo national "near me" demand category or a real service/consumable line. Below that, the honest model can't reach $150K and the install isn't offered — per the architecture's rule: decline, don't discount.

Fee scaling (§3.2 of the architecture, applied): modeled 12-month recovery ~$180K → install at the **$30K floor** (the typical $1–3M store). $3M+ or multi-location → modeled $400–700K → **$40–70K**. A DTC brand at real volume (0.7% → 1%+ conversion on luxury traffic plus cart recovery at a $2,700–4,600 AOV) scales the same way from its own numbers.

---

## 2. Sourced number bank (GATE:HUMAN on every row before page use)

### 2.1 Jewelry economics — BANKED

| # | Number | Source + date | Verification |
|---|---|---|---|
| J1 | Average engagement ring: **$4,600** (2025 engagements), down from $5,200 (2024), $5,500 (2023) | The Knot 2026 Real Weddings Study (10,000+ couples), via Rapaport 2026-02-19 | CONFIRMED |
| J2 | By stone: lab-grown **$4,300** (2.0ct avg) · natural **$7,000** (1.6ct) | Same study | CONFIRMED |
| J3 | Lab-grown = **61%** of engagement-ring purchases 2025 (+239% since 2020) | The Knot via National Jeweler 2026-06-05; Tenoris POS corroborates ~half of units | CONFIRMED |
| J4 | Diamond-jewelry per-item spend at retail: **$2,739** (2025, +10% YoY) | Tenoris "US Jewelry Market in 2025", 2026-01-09 | CONFIRMED |
| J5 | Margins: natural **40–45%** · lab-grown **60–65%** (2024), **72%** by 2025 | Gordon Brothers 2024-04-10; Tenoris 2026-01-09 | CONFIRMED |
| J6 | Wedding bands: women's **$1,200** + men's **$600** ≈ **$1,800/couple** behind every ring sale | The Knot 2023 Jewelry & Engagement Study | Banked, flag 2023 date |
| J7 | **~Half** of engagement customers industry-wide aren't retained for the band purchase; "four out of 10 jewelers appear to be leaving money on the table" | INSTORE Big Survey 2021 (citing The Knot) | Banked, flag 2021 date — most recent on this question |
| J8 | Non-bridal (gift + self-purchase) = **75%** of natural-diamond demand; 9% of US women bought natural diamond jewelry in 2025, avg **$4,063** | De Beers Diamond Acquisition Study (n=18,500) via JCK 2026-06-11 | Banked (De Beers interest noted; large panel) |
| J9 | Luxury/jewelry ecommerce: **81.4%** cart abandonment (highest of 8 categories) · **0.7%** conversion vs 2.66% all-industry | Dynamic Yield/Mastercard via eMarketer 2024-09; DY rolling benchmark accessed 2026-07 | Banked (vendor panel, 400+ brands, flagged) |
| J10 | Baymard all-industry abandonment floor: **70.2%** (50-study average) | Baymard Institute, updated 2025-09 | CONFIRMED |
| J11 | Automated-flow recovery: jewelry flows **1.85%** placed-order rate vs campaigns 0.08% (23x gap); all-industry cart flows **3.33%** avg, top decile 7.69% | Klaviyo benchmarks 2026-02 / 2024 (platform data, 183K brands) | Banked, vendor-platform flag |
| J12 | Proposers visit **5 jewelers** on average (2024; was 2 in 2022–23); 80% research 1–3 months before buying | The Knot 2025 survey; Jewelers Mutual 2024 (n=1,500+) | Banked |
| J13 | **64%** of engagement rings bought in-store after online research; 7 in 10 say in-person matters | The Knot 2026 via Rapaport | Banked |
| J14 | Seasonality: **Oct–Dec ≈ 34.7%** of annual jewelry-store sales (2019); **December ≈ 20%** alone (Census 2016; INSTORE 2025 owner-reported 20–29% for Black Friday–New Year's); **37%** of engagements Nov–Feb, December the top proposal month | Statista via The Centurion; Census via Forbes/Danziger; The Knot | Banked, flag vintage on the Census/Statista rows |
| J15 | Repair: modal ticket **$100–150** (43% of jewelers), but repair ≈ **60% of foot traffic** on ~15% of revenue | INSTORE Big Survey 2024; Edge Retail Academy via Stuller (2019) | Banked, flag 2019 date on the 60% |
| J16 | Store sizes: **58%** of independents over $1M revenue (2024); blended store ticket most common at $500–749 | INSTORE Big Survey 2025 | CONFIRMED (survey, self-reported) |

### 2.2 Demand data — BANKED (DataForSEO Labs pull 2026-07-05, US, Google Ads-derived)

| Keyword | Vol/mo (US) | CPC | Note |
|---|---|---|---|
| jewelry store near me | 673,000 | $3.55 | Dec 2025 peak 1M |
| jeweler near me | 201,000 | $2.96 | distinct Ads bucket |
| watch repair near me | 201,000 | $2.50 | |
| jewelry repair near me | 110,000 | $8.05 | Oct peak 165K |
| lab grown diamond engagement rings | 90,500 | **$11.06** | **+646% YoY**, running 135K/mo spring 2026 |
| engagement rings near me | 40,500 | $6.08 | stable year-round |
| custom engagement rings | 40,500 | $9.29 | |
| custom jewelry near me | 8,100 | $3.92 | |
| wedding bands near me | 4,400 | $5.71 | |

**Read:** ~**1.24M/mo** of local-intent jewelry searches nationally; purchase-intent CPCs cluster **$6–11**, i.e. every high-intent click a store misses costs $6–11 to buy back in ads. December runs ~1.5x. Caveats for page use: Ads volumes are bucketed order-of-magnitude figures; CPC is an advertiser bid, not a transaction value. Generalization set: mattress $13.17 CPC / flooring $8.33 (top bids to $35) / furniture 1M vol at $4.35 / **bike shops 673K vol at $0.75 — the proof that CPC, not volume, is the gate**.

### 2.3 Exit / enterprise-value practice — BANKED (the Weiss improved-condition anchor; conversation-only, never page copy)

| # | Number | Source + date | Verification |
|---|---|---|---|
| V1 | Jewelry stores, **closed comps 2021–2025**: SDE multiple median **1.94x** (avg 2.05, quartiles 1.33–2.25); revenue multiple median 0.48; median sale $214,757 on median owner earnings $131,207 | BizBuySell jewelry benchmarks page | **CORRECTED by verification** — the researcher's 2.49x was the all-industry average misattributed to jewelry |
| V2 | Appraiser ceiling: SDE **2.95–3.91x** | Peak Business Valuation (own data; vendor flag) | CONFIRMED as the optimistic end |
| V3 | Main Street ladder (closed deals, Q3 2025): 2.0x SDE <$500K → 2.5x at $500K–1M → 3.0x at $1–2M → 4.0x EBITDA at $2–5M | IBBA Market Pulse (300 brokers, 247 transactions) | CONFIRMED |
| V4 | Inventory sells **separately at cost** on top of the goodwill multiple; aged stock excluded or discounted | CT Acquisitions + broker corroboration | CONFIRMED |
| V5 | Exit wave: **747** jewelry-business discontinuances 2024 (+14%); retailers −3.0% through Q3 2025; **half of owners 60+**; **1 in 5 expects a going-out-of-business sale** (zero goodwill) | JBT via JCK 2025-01; IDEX 2025-12; Rapaport 2024-03; INSTORE 2021 | Banked, flag vintages |

**The honest EV line (call script, not page):** a jewelry store's sale price is a multiple of earnings a buyer believes transfer, plus inventory at cost. The big swing isn't turns, it's **binary**: demand that dies with the owner sells at liquidation (1 in 5 already expect exactly that); demand that transfers — search and Maps positions, a segmented customer list with attributed win-back revenue, documented response systems — is what lets the store sell at all, at the 2–3x band. On $131K median owner earnings, that's roughly a $260K goodwill check that exists or doesn't. **Never claim:** a quantified repeat-revenue multiple premium (the "3x more" figure is SaaS broker marketing — REFUTED); a raw customer list has standalone value (appraisers: worth ~nothing unless segmented, historied, and provably driving revenue — which is precisely what PROVE creates).

### 2.4 DO-NOT-BANK (checked and rejected)

- **BizBuySell jewelry SDE 2.49x** — misattributed all-industry figure; use V1's 1.94x. (REFUTED)
- **"Recurring revenue = up to 3x the multiple"** — SaaS marketing meme, vendor-circular, no retail basis. Directional only. (REFUTED)
- **Lighting/plumbing showroom ticket bundle** ($65–3,400 "packages", $2–10K "fixture-only") — stitched from per-fixture costs and a self-contradicting SaaS content farm. (REFUTED; profile stays declined)
- **Win-back flow conversion 0.9–1.4%** (Flowium agency blog) — weakest number in the bank; usable ONLY as the deliberately conservative ~1% floor, flagged as such, never as a headline stat.
- **IBISWorld jewelry −12.1% (2025)** — contradicts Tenoris +5.6% on scope/methodology; use neither for growth claims.
- **Fruchtman $2–3K/mo retainers** — third-party listicle, directional competitive context only.

---

## 3. The calculator rebuild — the defect fix

### 3.1 What's wrong and what replaces it

Live today: `Concept3Calculator` with `LEAK_DATA['retail']` — one formula (60 lapsed × 20% × **$140** × 12 = **$20,160/yr**) two sections above a $30,000 install. Replace it with **`WholeFlowLeak`** (the dentists pattern, already parameterized for presets and per-pillar labels), consumer presets, and the fee join rebuilt in install-frame per D12 — sell-product wording, so no guarantee language and no monthly-fee slider default.

Component math (unchanged): `bring = searches × (1−found%) × 0.02 × avg × 12` · `convert = missed/wk × close% × avg × 52` · `retain = book × winback% × avg` · recovery at 40/60/50% per pillar. One shared "your average sale" slider.

### 3.2 Proposed presets (GATE:HUMAN on every value)

| Preset | avg | Bring: searches/mo · found% | Convert: missed/wk · close% | Retain: book · win-back% | **Default leak/yr** | ×$30K | **Recovered/yr** | ×$30K |
|---|---|---|---|---|---|---|---|---|
| **Jewelry — bridal & custom** | $4,600 | 150 · 25% | 3 · 18% | 600 · 4% | **$363,768** | 12.1x | **$182,380** | 6.1x |
| **Jewelry — fine & gifts** | $2,700 | 250 · 25% | 5 · 20% | 1,000 · 5% | **$396,900** | 13.2x | **$200,340** | 6.7x |
| **Furniture showroom** | $1,600 | 500 · 25% | 8 · 20% | 1,200 · 6% | **$392,320** | 13.1x | **$195,072** | 6.5x |
| **Flooring showroom** | $3,200 | 200 · 25% | 5 · 20% | 400 · 5% | **$345,600** | 11.5x | **$177,920** | 5.9x |
| **Hot tub & spa dealer** | $12,000 | 60 · 25% | 2 · 15% | 300 · 3% | **$424,800** | 14.2x | **$218,160** | 7.3x |

Every default lands the leak at 11–15x and the conservative recovery at 5.9–7.3x the floor — inside the 5–15x brief target, with room for the buyer to lower inputs and still clear the install. Slider labels in buyer language: "Nearby searches a month for what you sell" / "How many find you today" / "Serious inquiries missed or answered late a week" (calls, DMs, "is this in stock," carts, quote requests) / "Would have bought" / "Past customers in your book" / "Would buy again this year if someone asked."

**Why each jewelry default is defensible (the sourcing map):**
- **avg $4,600 / $2,700** — J1, J4. Buyer raises to $7,000 if natural-led (J2).
- **150 searches/mo nearby** — 1.24M/mo national local-intent (§2.2) across ~16.8K retailers averages 74/store; metro concentration puts any real-metro store's addressable pool in the hundreds. 150 is deliberately modest.
- **25% "find you today"** — consistent with the trades' presets; grounded in 42% of local clicks going to the top three (Backlinko, already live on the retail brief).
- **3 missed/slow inquiries a week at 18%** — proposers compare 5 jewelers and research for months (J12); luxury ecommerce converts at 0.7% against 81.4% abandonment (J9); ~38% of business calls reach a live person (411 Locals, already in the brief). Three a week is the floor for any store with a phone, an Instagram, and a website.
- **600-customer book at 4%** — half of ring buyers never return for the $1,800 band sale sitting behind every ring (J6, J7); 75% of natural-diamond demand is now repeatable non-bridal occasions at $4,063 (J8); flow-based win-back at ~1% is the flagged conservative floor (§2.4), and 4% blends win-back with the band/anniversary capture the store should never have lost. Buyer can set it to 1% and Retain still shows ~$27,600.

### 3.3 The join (the line the page is missing) — copy at §5.2

Sell-product D12 adaptation: under the animated total, the install-frame line replaces any monthly-fee illustration. Pieces, not percentages: at $4,600, the $30K install is **7 pieces, once**; the default model recovers **~40 pieces a year**. `N = ceil(30,000 / avg)` computed live from the buyer's own slider.

---

## 4. Offer shape — what the consumer install contains, and the season that sells it

### 4.1 Install contents (sell-product §8 list, retail flavor — every item checkable at the walkthrough, absent from the $199–5K/mo vendor pool)

1. **Measurement layer first** — both revenue lines instrumented before anything fires; every call, DM, form, cart, walk-in logged to one record. (PROVE is the exit asset: attributed revenue is what makes the customer list worth anything at sale — §2.3.)
2. **Catalog-to-search foundation** — product feed fixed and connected so what's in the case shows up with price and availability ("in stock near me" surfaces); machine-readable product info so AI answers can cite the store.
3. **Local + AI search baseline** — Google Business Profile rebuilt, location/category pages, review velocity started, citation baseline vs the two competitors the owner names.
4. **Response layer** — every call, text, DM, and form answered in seconds, after close included; missed-call text-back live in week one.
5. **Recovery + win-back engine** — abandoned carts and open quotes chased; the past-buyer book segmented (bridal → band → anniversary pipeline) with the first win-back flows live.
6. **The paper** — SOW-grade scope per cylinder, written punch-list checked at the install-complete walkthrough, artifacts-transfer terms, week-4 work shown.

Install duration: **~90 days** (sell-product keeps 90 per D5; the 60-day compression is book-jobs). The first monthly cylinder isn't preset — **the day-60 report names the biggest of the three leak lines from their own dashboard, and that line's cylinder goes first** ("we add cylinders as they pay for themselves," per the live FAQ canon).

### 4.2 Seasonality — the legitimate urgency mechanism (calendar, not countdown)

The year is decided in one quarter: **Oct–Dec ≈ 35% of jewelry-store sales, December alone ≈ 20%** (J14), core search demand runs ~1.5x in December (§2.2), and **37% of engagements land Nov–Feb** — seeding the band, anniversary, and referral pipeline for the whole next year. A 90-day install therefore has one honest deadline: **signed by early July, installed before October, proving through the quarter that pays for the year.** Second window: signed by August, live for engagement season. This is real scheduling math plus real one-operator capacity — state the capacity number once (installs per quarter: **GATE:HUMAN**) and never a countdown. Owners already feel it: "everyone at the store has a lot of personal stuff in October, which is when we should be getting ready for Christmas" (INSTORE Brain Squad).

### 4.3 Done-deal mechanics (no guarantee allowed — what carries the risk instead)

The architecture's sell-product stack, plus four research-backed additions native to this buyer:

| Mechanic | Detail | Precedent |
|---|---|---|
| Published floor + bands | "From $30,000, scaled to the value at stake" + per-cylinder bands; exact number only in the SOW | Architecture §9; jewelers already see published menus (Punchmark $199–5K/mo), so hiding price reads worse here than anywhere |
| **48h written SOW, date-stamped** | The SOW carries calendar dates (install-complete date, work-shown date), not "fast turnaround" | Oddit prints the literal delivery week at checkout |
| Week-4 work shown | Promoted onto the pillar and niche page | Live industrial promise, now systematic |
| Staged billing | 50% signature / 25% dashboard-live / 25% install-complete walkthrough; or 100% at signature −5% | Avex (luxury-fashion agency, $25K+ minimum) bills 30/30/30/10; milestone billing is the industry norm the buyer already knows |
| **Paid diagnostic with a deliverable-count pledge** | A written demand audit at a fixed fee (~$2,500 — GATE:HUMAN, market range $1.5–7K): findings documented against their own numbers, **"if we can't document 15 findings, you don't pay"**; the buyer owns the output either way; fee credits 100% toward the install within 90 days (D7 extension — decision D-C2) | Baymard's $7K audit refunds if short of 15 improvements; Best Odds' "you own the output regardless"; Joy Joya (jewelry-native) runs exactly this ladder |
| Exit terms | 90-day exit, artifacts transfer in editable form, keep your data/profile/list | Live canon |
| **Two-track proof rule** | Independent jewelers get **named** case studies when consented — jewelers trade on peer recognition (Smart Age names Lenox, Weston, Ballantyne). Luxury/NDA clients get anonymized-but-specific: "a bridal jeweler with a $4,600 average sale, +X% booked consults." **Liori Diamonds = PROOF-SLOT until written consent; when asked, ask for named.** | Smart Age Solutions; SearchUp/IxDF NDA pattern |
| The trade's own words on guarantees | Jeweler-facing trade press already teaches "no honest agency can promise rankings — guarantee methodology and cadence instead." Say our no-guarantee stance out loud as the trust signal. | Bluelinks jeweler guide 2026 |

### 4.4 The visible-value SOW layer (added 2026-07-07 — priced foundations, two faces, the transfer bridge)

**Where it lives:** the 48h written SOW and the call walkthrough ONLY — never pages (pages keep §5/§6 as written). This vertical is the best itemization fit of the four: the buyer already shops published menus (Punchmark's tiers are public), so a priced ledger reads native. Rules and critique record: `02-visible-value-pass.md`.

**Usage rules (binding, condensed):** fee never itemized — one number for one system, and the ledger prices what the parts cost *elsewhere*; ledger appears AFTER the stipulated value ("does that number feel conservative?"), framed "assembled from 4–5 vendors, nobody accountable"; the website is jointly-delivered-only (it's the surface the measurement layer runs on — pre-empts "we already have a web agency," objection #1); no guarantee language anywhere (motion rule); **never claim privacy-law (CCPA) protection** — no sub-$26.6M client qualifies; consent/policy work is hygiene, said plainly.

**The ledger — in dollars and in pieces (GATE:HUMAN per row; SEARCH rows opened before buyer use):**

| Layer | Bought alone | Source status |
|---|---|---|
| Jewelry site (catalog-connected, conversion-built) | jewelry SaaS $199–400+/mo, no upfront · custom $10,000–$30,000+ | **OPENED (Punchmark pricing + digital-marketing pages — the strongest anchors in this vertical)** / OPENED 2026-07-07 (custom band — CartCoders: https://cartcoders.com/blog/shopify-development/jewellery-website-design-development-cost/ states "Advanced jewellery eCommerce store: $10,000 – $30,000+", matches the claimed band) |
| Content library (~30 buying-guide articles — see D-C7) | $4,500–$15,000 ($150–700/article, corrected from $150–500); jewelry comp: content marketing from $249/mo (still unsourced) | OPENED (Punchmark) / OPENED 2026-07-07 (per-article — Joy Joya: https://joyjoya.com/what-you-can-expect-to-pay-for-jewelry-marketing/ states "$150 to $700 per piece"; the $4,500–$15,000 library total is a derived 30× calc, and the $249/mo comp still needs its own openable source) |
| Local SEO + GBP program | $500–$3,000/mo (WebFX retainer range; corrected from "$1,500–$3,000/mo typical" — that sits at the top of the range, small-business avg ~$1,000/mo) (jewelry-SaaS tier from $199/mo and comprehensive to $6K/mo unconfirmed at this source) | OPENED (Punchmark) / OPENED 2026-07-07 (WebFX: https://www.webfx.com/local-seo/pricing/ states "$500 – $3,000 per month for monthly retainers") |
| Email/SMS retention engine (bridal→band→anniversary flows) | $1,000–$5,000 setup + $2,500–$10,000/mo agency mgmt + platform | OPENED 2026-07-07 (mgmt range — trypropel: https://www.trypropel.ai/resources/blogs/best-klaviyo-email-marketing-agencies states "$2,000 to $10,000+ per month", freelancer floor ~$1,500/mo; the $1,000–$5,000 setup fee and Yocto/Sequenzy/Klaviyo/Postscript platform tiers still SEARCH — need their own openable source) |
| Review/reputation | $299–$449/mo per location (Birdeye: Starter $299 / Growth $349 / Dominate $449 per location/mo; Premium 4+ = custom) | OPENED 2026-07-07 (Birdeye tiers — costbench: https://costbench.com/software/review-management/birdeye/; primary canonical: https://birdeye.com/pricing/) |
| Response layer (missed call / DM) | $40–$300/mo ($40–$120 typical small-business, up to $300+ platform tier) | OPENED 2026-07-07 (helpgenie: https://helpgenie.ai/blog/missed-call-text-back-software-pricing/ states category runs $20–$300/mo, typical $40–$120, platform $150–$300+) |
| Measurement/attribution | no clean standalone market price — present as bundled, never a priced line | — |
| 3 months managed operation | ~$9,000–$27,000 (recurring stack $3–9K/mo) | derived |
| **Σ assembled** | **~$25,000–$75,000**, clustering $30–55K — at a $4,600 average sale, that's **5–16 pieces**; the install is **7 pieces, once** | derived |

**D-C7 (scope decision):** §4.1's install carries no article library today (Editorial is a cylinder). Adding a ~30-article buying-guide foundation at ~10/month mirrors the dental deal and feeds the Bring leg the calculator models — but it's new install scope with real hours. Decide before the first jewelry SOW; if in, growth-past-30 lives on the cylinder/retainer side.

**The two faces:** *Offense* — found first (site + library + maps) · answered in seconds, after close included · carts and quotes chased · the book worked (band/anniversary pipeline) · proven monthly on its own line. *Defense (native, sourced)* — **ADA web accessibility, print hard: retail/e-commerce is 77% of the 4,000+ suits a year; settlements typically $5–20K** (OPENED) · FTC-compliant review velocity (16 CFR 465) · consent-documented texting of the customer book (TCPA $500–$1,500/message by statute) · nothing held hostage — site, list, content, data in their name · and the strongest one needs no statute: **demand that transfers sells at the 2–3× goodwill band; demand that dies with the owner sells at liquidation** (§2.3's binary, for the 60+ owner).

**The transfer bridge (sell-product rebuild — NOT the dental "Day 91"):** two columns on the SOW: **"Yours at install-complete (~day 90)"** — the site, the library, the sequences, the dashboard, artifacts in editable form, transfer terms — vs **"what the cylinders keep in motion"** — added as they pay for themselves, each month a re-decision, leave on 90 days' notice and everything goes with you. No guarantee closer (banned on this motion); week-4 work-shown carries the early-evidence job, and the honest line is: *"the monthly report re-earns the retainer or it doesn't — and the report is yours either way."*

---

## 5. Wording kits (humanizer-passed; "we" voice; premium-calm; kill-list enforced)

### 5.1 Pillar `/industries/consumer-brands/`

#### Three hero options (pick one; all profile-spanning, not jewelry-only)

**A — the showrooming wound (recommended: it's the verbatim owner pain)**
> **They love it in your store.** *Then they buy it online.*
> The shopper who tried it on. The customer who bought from you three years ago. The one asking Google who sells it nearby. Each is a sale you already earned, and each one leaks somewhere you can't see. We build the system that keeps them yours: found first, answered in seconds, brought back.
*Why: INSTORE owners say it in these exact words ("loving something in my store and buying it online"). Every showroom profile reads itself into it. Leads Convert+Retain, where the money is.*

**B — the unworked book**
> **Your past customers still buy.** *Just not from you.*
> They bought once, loved it, and never heard from you again — so whoever reached out first got their next purchase. Meanwhile every "near me" search hands new shoppers to the store that shows up. We fix both ends of that: found before the competitor, and the customers you already won, brought back.
*Why: the drift line is near-verbatim trade language ("quietly drifted to a competitor because they reached out before you did"), and owners admit the cause: the book runs on memory. Leads Retain, the cheapest revenue in the building.*

**C — be the answer (brand-canon extension)**
> **Shoppers ask Google and AI who sells it.** *Be the answer, or lose the sale unseen.*
> Someone nearby is searching for exactly what's on your floor. If the map, the search page, and the AI answer name a competitor, that sale is gone before you knew it existed. We make you the brand they find first — and the one that follows up until it's bought.
*Why: extends "Buyers ask AI. Be the answer." into retail; strongest brand fit; weakest owner-verbatim grounding (owners say "vast ocean of the internet," not "Maps"), so pair it with the showrooming evidence card right below.*

#### The rebuilt leak-math block (calculator header + join)

Header:
> Eyebrow: **Your leak, in dollars**
> H2: **Put a number on it. Then put it next to the price.**
> Intro: Pick your shelf, slide in your own numbers, and watch what walks out in a year. Conservative defaults — the audit replaces every estimate with your real figures. We round down.

The join (renders under the total; N computed live from the avg slider — GATE:HUMAN):
> **The install starts at $30,000. At your average sale, that's [N] pieces — once.**
> The model above, at settings you can lower, recovers about [M] pieces a year. Check the math; it's all on the screen. Your exact number comes in the written SOW, within 48 hours of the call.

#### The offer ladder block (EngagementShapes pass + the FAQ fix)

Install card line (replaces "$30K one-time" — GATE:HUMAN):
> **The Revenue Engine — from $30,000, one-time.** Scaled to the value at stake, never to a menu. Your exact number comes in the written SOW, within 48 hours.

Credit sentence (split per §16, scoped to the five sell-product cylinders — GATE:HUMAN):
> Any of the five service cylinders can run first as a fixed-scope sprint at its published band. Take the install within 90 days and the sprint fee counts toward it, in full.

FAQ "How is it priced?" — **replaces the live answer that still sells the retired Sprint/Operator-Retainer/FGO trio as the model** (GATE:HUMAN):
> One model, published. The engine installs once — from $30,000, scaled to what's at stake — and the parts that keep running are cylinders at $4–15K a month each, added as they pay for themselves. Want proof before the install? Any cylinder runs standalone as a fixed-scope sprint at its published band, and the fee credits toward the install within 90 days. There's no guarantee on a count of sales; the price is in the open instead.

#### Five objection rewrites (FAQ or objection strip — GATE:HUMAN each)

**"We already have a web agency."**
> Keep them. The website is one part. We install the system around it: found in search and AI answers, every inquiry answered in seconds, carts and quotes chased, past customers brought back — and every sale it touched counted on its own line. If your agency already does all that, the dashboard will say so and you don't need us.

**"Our Instagram brings the traffic."**
> Good. Keep posting. But reach you rent can be cut by an algorithm tomorrow, and you can't sell twice to a follower you never captured. The system works the audience you own: your customer book, your Google profile, the searches happening three blocks from your door. When a post lands, it makes sure the DM gets answered and the browser gets followed up. Rented reach fills the room. Owned demand keeps the lights on.

**"Why no guarantee?"**
> Because the price is in the open instead. A guarantee is what you reach for when the fee is hidden. Here you see the model, the floor, and the exit terms before we ever talk; the SOW arrives in writing within 48 hours; the work is shown by week four; and if you leave, every asset we built goes with you. Your own trade press says it plainly: nobody honest promises rankings. What we promise is method, cadence, and receipts.

**"$30K against our margin?"**
> Run it in pieces. At a $4,600 average sale, the install is seven pieces — once. The model on this page, at settings you can lower, says about forty a year are walking. And the recovered ones are your best economics: the repeat sale carries no ad cost, and nobody discounts to a customer who came back on their own.

**"We're seasonal."**
> That's the argument for the calendar, not against it. October through December is about a third of the year; engagement season runs Thanksgiving to Valentine's. The system has to be live before the quarter that decides your year — which makes this a summer project, not a someday project. We take [N — GATE:HUMAN] installs a quarter, and the ones signed by July are the ones proving through December.

#### CTA microcopy (names the artifact)

Primary button: **Book a Growth Call**
> 15 minutes on your numbers. A written plan with your exact price follows within 48 hours — yours to keep either way.

Secondary (if D-C2 adopts the paid diagnostic):
> Or start with the written audit: every leak documented in your own numbers, fixed fee, credited toward the install if you go ahead. If we can't document 15 findings, you don't pay.

#### The not-doing-this close (pieces, not percentages — GATE:HUMAN)

> Do nothing, and the model above says roughly six pieces a month keep walking: the shopper who loved it in the case and bought it online that night, the couple the mall jeweler answered first, the customer from three years ago whose next piece someone else just sold. None of them will tell you. The report would.
> **We build the engine. You sell more.** [Book a Growth Call]

### 5.2 Jewelry niche page — hero options (build-ready, see §7 for the full outline)

**A —** **You sold her the ring.** *Who's selling her the anniversary band?*
> Behind every ring you sell sits the band, the anniversary, the studs, the referral — about $1,800 of it in the first year alone. Industry-wide, half of ring customers never come back for it. We build the system that makes sure they buy the rest from you.

**B —** **They love it in your case.** *Then they buy the stone online.*
> You've heard it in your own store: "I found it $500 cheaper online." You won't win that shopper on price. You win the one before them — found first on the search, answered in seconds, followed up until the appointment books. And you keep the ones you already won.

**C —** **Someone nearby is searching "engagement rings near me" right now.** *Whoever answers gets the couple — and everything after.*
> Proposers now compare five jewelers before they buy, and most still buy in a store. The store they buy in is the one they found first and heard back from fastest. We make that store yours.

---

## 6. Page-map — `/industries/consumer-brands/` changes, section by section

| # | Section (live) | Change |
|---|---|---|
| 1 | `RevenueHero` | Swap headline to a §5.1 option. Founder spec label **"Setup" → "Install"** (banned word, one of the §16 stragglers); value "90 days, one-time fee" stays. |
| 2 | `Concept2Evidence` (leak cards) | Keep. Optional: refresh Bring card stat with the 2026 demand row (1.24M/mo, $6–11 CPC) — GATE:HUMAN. |
| 3 | `Concept3Calculator` | **Replace with `WholeFlowLeak`** + §3.2 presets + §5.1 join block. This is the defect fix. |
| 4 | `FlowBlock` | Keep. |
| 5 | `PlanByPillar` | Keep; align step copy with §4.1 install contents (catalog-to-search + measurement-first). |
| 6 | `Concept4BeforeAfter` | Keep. |
| 7 | `TwoRevenueLines` | Keep; PROOF-SLOT stays empty until real consumer proof exists (Liori pending consent). |
| 8 | `EngagementShapes` | Wording pass only: install line + credit sentences per §5.1. (Component is shared with the hub — coordinate with the hub migration row in §13 of the architecture.) |
| 9 | `FAQ` | Replace "How is it priced?" with the §5.1 rewrite (kills the Sprint-trio contradiction). Others stay. |
| 10 | Close rail | Keep "We build the engine. You sell more." Add the pieces close above the CTA (§5.1). |
| — | Metadata | Description still says "not six vendors" — align to the site-wide five-vendor frame in the same pass (already flagged in the phase plan). |

---

## 7. Jewelry & Luxury niche page — full outline (build when earned, Phase 6 lazy rule; slug at build, e.g. `/revenue-engine/jewelry/`)

Sell-product motion throughout: "we" voice, brand-blue, no guarantee, CTA **Book a Growth Call**, breadcrumb to Consumer & DTC. Numbers slotted from §2 (each stays GATE:HUMAN until this page ships).

1. **Hero** — pick from §5.2. Founder card: Install · ~90 days, one-time fee / Pricing · published, in full / Lock-in · none.
2. **The leak (three cards, jeweler units)**
   - *Bring:* "Someone three blocks away is searching 'engagement rings near me.'" — 1.24M local jewelry searches/mo nationally at $6–11 a click; proposers compare 5 jewelers; 64% still buy in-store. The store they find first gets the visit.
   - *Convert:* "The largest leak in this trade is silence." — a $10,000 ring lead tracked on a handwritten note; luxury ecommerce loses 81% of carts and converts 0.7%; the DM asking "is this in stock?" answered tomorrow is a sale answered never.
   - *Retain:* "You sold the ring. The band went to whoever asked." — $1,800 of band revenue behind every ring, half of it lost industry-wide; 75% of diamond demand is now gift and self-purchase — repeat occasions on a list most stores run from memory.
3. **Calculator** — `WholeFlowLeak`, jewelry presets: Bridal & custom $4,600 · Custom & natural $7,000 (150·25% / 2·18% / 500·3% → leak $425,040, recovered $206,724, install = 5 pieces) · Fine & gifts $2,700. Join line per §5.1.
4. **The fix** — FlowBlock + PlanByPillar with §4.1 contents in jewelry language (the case shown online with price and availability; after-close reply for the 9pm proposal-planner; the bridal→band→anniversary pipeline worked automatically; reviews compounding the map position).
5. **The season block (legitimate urgency)** — "Your year is decided by New Year's": Oct–Dec ≈ 35% of sales, 37% of engagements Nov–Feb, December searches 1.5x. Installed before October or it waits a year. Capacity line (GATE:HUMAN).
6. **Pricing** — floor + credit + 48h SOW per §5.1; per-cylinder band rule sentence; staged billing named.
7. **Objections** — the five from §5.1 plus one jewelry-native: **"My customers are relationships, not a database."** → *That's exactly why this works. The system doesn't replace the relationship; it remembers it — who bought the ring, when the anniversary lands, whose watch is due for service — and reaches out in your name so the relationship is why they come back, instead of the reason you never called.*
8. **Proof** — PROOF-SLOT (Liori pending consent; named if granted, else "a DTC diamond brand with a $X,XXX average sale" per the two-track rule). No fabricated numbers, no placeholder multiples.
9. **Close** — pieces close, jewelry cut: *"Two engagement rings a month walking to the mall jeweler is a $110,000 year. The report would have shown you both."* + Book a Growth Call + the 48h-SOW microcopy.

---

## 8. The three-options proposal — consumer/jewelry (names locked by the architecture §4.2; conditions localized)

Delivered as the written SOW within 48h of the Growth Call, value stipulated on the call first (their average sale, their book size, their season — then "does that number feel conservative?"). The EV beat (§2.3) lands in the conversation only where the owner is 55+ or names exit intent; it is never page copy.

| | Option 1 — **Proof on one cylinder** | Option 2 — **The engine installed** (default) | Option 3 — **Full Growth Ownership** |
|---|---|---|---|
| The condition | The mechanism demonstrated on your own counter: your bridal category found, cited, and converting inside 6 weeks | One accountable system: found first, answered in seconds, the book worked — both revenue lines on your report by week 12, before the quarter that decides your year | The growth function owned: every cylinder run and re-aimed for you, multi-location or DTC scale |
| What's inside | AI Search Sprint on the category that pays (published band $12–24K) or the written demand audit (D-C2) | §4.1 install, scaled from $30K; first two cylinders quarter one; week-4 work shown | Shape A from $20K/mo (6-mo min) / Shape B from $12K/mo, per the FGO page |
| The bridge | 100% credits toward Option 2 within 90 days | Cylinders added as they pay for themselves | — |
| Risk carried by | Fixed scope, published band, artifacts transfer | 48h SOW with dates, staged billing 50/25/25, punch-list walkthrough, 90-day exit | 30-day exit after minimum, written quote in 24h |

---

## 9. Decisions for Artur (each: recommendation + trade-off in one line)

| # | Decision | Recommendation | Trade-off |
|---|---|---|---|
| D-C1 | Swap the pillar's `Concept3Calculator` for `WholeFlowLeak` with §3.2 presets | **Adopt** — it's the defect fix | Real component work + QA per preset; the shared-avg model slightly overstates Retain (next piece < first piece), mitigated by the deliberately low win-back % |
| D-C2 | Paid written demand audit (~$2,500, 15-findings pledge, 100% install credit) as this vertical's second door | **Adopt** — premium-calm, market-native ($1.5–7K observed), and it extends D7's credit logic | A refund-if-short pledge is a real obligation; audit capacity competes with install capacity |
| D-C3 | Capacity number for the seasonality line (installs/quarter) | **Set it honestly and publish it once** | A published capacity is a commitment; missing it reads as manufactured scarcity — the thing we never do |
| D-C4 | Liori Diamonds consent ask | **Ask now, request named** (jewelers/luxury DTC trade on recognition); anonymized-but-specific fallback | Asking costs a favor; PROOF-SLOT stays empty until answered |
| D-C5 | Hero choice on the pillar | **Option A** (showrooming wound — verbatim owner language) | Option C is stronger brand canon but weaker VOC grounding |
| D-C6 | Wedge wording | Adopt the sharpened wedge: **"They love it in your store, then buy it online — and your best past customers quietly drift to whoever reached out first."** VOC verdict: PARTIAL leaning confirm — lead with showrooming + drift (owner-verbatim), keep "found first on Maps" as mechanism, not headline | The original "shoppers find a competitor" framing survives only as the Bring card, not the hero |
| D-C7 | Content foundation (~30 buying-guide articles, ~10/mo) added to the install scope | **Adopt for the SOW default** (mirrors dental; feeds the Bring leg the calculator models) | New install scope = real hours; growth-past-30 must live on the cylinder side, and the article count becomes a checkable commitment |
| D-C8 | Visible-value SOW layer (§4.4): priced ledger + two faces + transfer bridge | **Adopt, SOW-only** | Every SEARCH-status row must be opened at its URL before a buyer sees it; the ledger is a subordinate value floor, never the fee's basis |

---

## 10. Sources (beyond the architecture doc's list)

Research transcripts: workflow `wf_663a9d3e-4a4` (6 lanes + 24 verification agents, 2026-07-05/07). Load-bearing primaries: The Knot 2026 Real Weddings Study (via Rapaport 2026-02-19) · Tenoris "US Jewelry Market in 2025" (2026-01-09) · INSTORE Big Surveys 2021/2024/2025 + Brain Squad columns (owner quotes, named, 2023–2026) · De Beers Diamond Acquisition Study via JCK (2026-06-11) · Dynamic Yield/eMarketer (2024-09) · Baymard (2025-09) · Klaviyo benchmarks (2026-02, vendor flag) · DataForSEO Labs keyword pull (2026-07-05) · BizBuySell jewelry benchmarks (closed comps 2021–2025, verifier-corrected) · IBBA Market Pulse Q3 2025 · JBT via JCK/IDEX (2025) · Baymard/Oddit/Avex/Joy Joya/Smart Age/The Good/Vervaunt (deal-mechanics precedents, accessed 2026-07-05). Full URLs in the lane files under the session task directory and in the workflow journal.
