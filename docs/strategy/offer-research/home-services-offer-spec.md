# Home-services offer spec + wording kit

**Status:** DRAFT for founder review — every number marked GATE:HUMAN needs sign-off before any page use.
**Date:** 2026-07-06
**Scope:** `/industries/home-services/` (the canonical contractor vertical per §16.3 of the architecture doc) and the future per-trade niche pages.
**Governed by:** `docs/strategy/offer-research/00-offer-architecture.md` (SIGNED 2026-07-05) — D1–D12 win on prices and structure. This spec applies them to home services; it changes no signed decision. Where a finding argues for amending one, it is flagged as a decision, not assumed.
**Research provenance:** 2-round multi-agent workflow (39 agents, 2026-07-05/06): repo extraction (4 trade briefs), 8 web research angles, and an adversarial verify pass that fetched every number-bank source URL. Verification status is shown per row in §10.
**2026-07-07:** §3b added — the visible-value proposal layer (priced foundations ledger, two faces, Day-91 bridge) with its own source-status flags and the D-HS1 install-scope decision. Rules and critique: `02-visible-value-pass.md`.

---

## 1. The tension, resolved

The brief's question: does the **$30K+ concentrated install** hold on a page whose spec rate card says ~$3–4K/mo + $2.5–3K setup, and whose calculator shows a $336,960/yr default leak but never a price?

**Verdict: yes for roofing and HVAC, yes-with-a-floor for plumbing, no for the typical electrical shop.** The signed architecture already retired the rate card (D4) and set the rule (D2: install = max($30K, ~10% of audit-modeled 12-month gain)). What the research adds is the per-trade arithmetic that says *which shops can stipulate a ≥$300K 12-month recovery* — the condition that makes the $30K floor a 10:1 fee instead of a hopeful one — and the qualification floors that keep the guarantee honest.

The felt contradiction on the live page (six-figure leak, invisible fee) is the conversion gap, not the floor. The fix is the join (§5), not a cheaper offer.

---

## 2. Offer table per trade tier

Install fee per D2: **max($30K, ~10% of modeled 12-month tangible gain)**; year-one total ≤ ~15% of stipulated value. Month-4+ operator retainer floor: $4–6K/mo internal (the retired rate card survives only here, per D4), always bound by the guarantee test. All ticket/close figures below are for the audit model and value conversation — **not page copy** unless they also appear as approved rows in §10.

| | **Roofing** | **HVAC** | **Plumbing** | **Electrical** |
|---|---|---|---|---|
| Big ticket (sourced) | Retail replacement ~$9,500 avg, $9–18K asphalt (Angi 2026); **insurance-claim reroof $17,631 avg 2025, +33%** (Verisk) | Replacement $7,500 avg, $5–12.5K typical (HomeAdvisor 2026); mid-market $8–10K, affluent $12–14K+ (ServiceTitan F25) | Repipe ~$9K/2,000 sq ft; water heater $1,345; sewer line $3,319 (HomeAdvisor 2026) | Panel $1,345 ($518–2,190); EV charger $967; rewire $1.5–10K (HomeAdvisor 2026) |
| Service ticket | Repair $1,171 retail (Angi) / $4,699 insurance claim (Verisk 2025) | Repair $1,205 avg 2025, +47% since 2021 (Housecall Pro, ~2M jobs) | $340 avg job; $182–500 typical (HomeAdvisor) | $350 avg project (HomeAdvisor) |
| Close / booking rates | 30–40% blended "good"; retail inbound 45–70%, storm door-knock 8–14% (vendor-grade — model only) | 38% without financing → 49% with (ACCA/Farmington, 1,000+ contractors) | 43% avg call-booking, best of trades; 45%+ of shops close 70%+ of jobs (ServiceTitan '22; Jobber '26) | 41% avg call-booking; only 21% reply to leads within an hour (Jobber '26) |
| Season shape | Storm-compressed: ~6–8 revenue months; May peak hail month, hurricane peak Sep 10 | First heat wave = the year's biggest surge (+90% daily revenue); October busiest month (Samsara 65M trips) | Flat baseline (±25–41%); Jan freeze spikes ("frozen pipes" ~31x summer floor) | Flattest of all trades (<30% swing) — no honest seasonal urgency |
| Qualified shop | 2+ crews, **≥$1.5M** in a hail/insurance market, **≥$2M** retail-led; ~30+ estimates/mo in season | **≥$2M** (~7+ techs), ≥~150 replacement quotes/yr; $1.5M only with a severe audited leak | **≥$2M** (~4–5 trucks), 24/7 emergency mix a plus | **≥$2.5M majority-residential** (structurally rare: 42% of firms ≤$1M, residential >50% only under 10 employees — NECA 2024) |
| Modeled 12-mo recovery at that floor | $300–500K (unclosed-estimate pool alone ≈ $3.5–4M/yr at a $2M shop; 16% same-day follow-up gap) | $300K+ (20–30 recovered replacements + repairs + memberships) | $300K (missed-call capture + 24%→toward-59% booking lift + $3–15K estimate follow-up) | Typically $100–160K → **fails the floor** |
| Install verdict | **$30–50K holds** | **$30–40K holds** | **$30K holds at the floor** | **Floor fails for the typical shop** — see below |
| Install ≈ first N of their unit | **2 insurance roofs** or **4 retail roofs** | **4 replacements** | **3 repipes** or ~9 sewer lines | ~22 panels (the number itself says no) |
| Retainer month 4+ | $4–6K/mo | $4–6K/mo | $4–5K/mo | — |

**Electrical (decision, default = hold the floor):** D2 permits no sub-$30K install and §10 of the architecture says decline rather than discount. Applied honestly, electrical is an *audit-and-qualify* trade, not a lead trade: keep it in the hero eyebrow and the calculator presets, price the rare ≥$2.5M residential shop normally, and decline the rest — the audit does the declining ("your leak models to $120K; a $30K install isn't a 10x deal for you, so I won't sell it to you" is itself a trust artifact). The alternative — a scaled-down $15–20K electrical entry tier — would require amending D2 and re-opening the floor everywhere. Not recommended; flagged for completeness. **GATE:HUMAN if you want the tier.**

**Roofing split note (the brief asked):** insurance restoration vs retail changes the *unit math*, not the verdict. Insurance jobs claim-average $17,631 but price per comparable roof BELOW retail (Xactimate compression; margins ~28–34% vs 38–45% retail — vendor-grade, model only), and buyers of roofing businesses value storm revenue at only 0.5–0.7x the multiple of steady retail/repair revenue (§8). So: insurance-market roofers qualify at lower revenue (bigger tickets, faster payback — the install is *two roofs*), but the **value conversation should weight retail/repair recovery**, because that's the revenue that compounds business value. The engine's honest pitch to a storm roofer: it converts storm surges you already win into a documented, repeatable retail/repair base a buyer will actually pay for.

---

## 3. Offer shape — the 60-day concentrated install (D5 applied)

What must be live when, so "installed by day 60, proving by day 90" writes itself. This is the punch-list skeleton (D8/D9); every item is checkable at the day-60 walkthrough.

| When | Live | Why this order |
|---|---|---|
| **Day 1** | Audit numbers + exact rate in writing (same day); SOW with punch-list, day-60 walkthrough scheduled, month-4 retainer number stated once (§6 of architecture); **Google Business Profile / local-page work starts** | GBP has the longest lag (3–6 month curve) — it burns runway inside the window instead of after it |
| **Week 2** | Call answering 24/7 + missed-call text-back + sub-60s reply; **every call recording and classifying from day 1** (the dispute-proof log starts accruing) | Already true on the live page ("within the first couple of weeks") — now it's a commitment, not a FAQ aside |
| **Day 30** | Two-lines dashboard live in partial form (system-driven vs media-driven); quote-/estimate-follow-up sequences working the open backlog; reactivation list built from their CRM; billing stage 2 (25%) | The dashboard must exist before it can prove; day-45 "what I'd re-aim next" note per architecture §6 |
| **Day 60** | Install-complete walkthrough against the written punch-list: booking + reminders, review engine, storm/seasonal templates armed (roofing/HVAC), reactivation sequences on; billing stage 3 (25%) | The completion warranty. Anything genuinely slow-curve (deep integrations, multi-location) is explicitly scoped as proving-window or retainer work, per D5 |
| **Day 90** | Guarantee settlement on the system-driven line, in their dashboard | The report that decides it — and the retainer bridge (architecture §6) |

Billing: 50% signature / 25% day-30 dashboard-live / 25% day-60 walkthrough, or 100% at signature minus 5% (D8). Buyer is never more money out than installed system.

**Why this reads as a different category from the $297–$2,500/mo GHL shelf** (all names internal-only; category language in copy):

1. **They sell duration; we sell completion.** Every rival price is a meter — per minute, per call, per seat, per month — on 12–24-month contracts. Nothing is ever "installed," no one publishes a punch-list or a done-by date. The strongest guarantee found in the category is a fee refund or "we keep working free until you get N *leads*" — the remedy is always more duration, never an outcome. Day-60 install / day-90 proof / fee-beating guarantee has no structural equivalent on that shelf.
2. **Nobody under ~$5K/mo ties calls to dollars.** Call tracking sells transcripts you interpret yourself; revenue attribution exists in this market only as an enterprise add-on (est. $500–1,500+/mo on top of a $5–50K field-service-platform implementation) or as the stated justification for $8–15K/mo enterprise agency retainers. The two-lines dashboard is included in our install by default — the low shelf can't bolt it on at any price they charge.
3. **The features are commoditized; the operated system isn't.** A field-service CRM now sells an AI receptionist add-on for $29/mo, and the entire AI stack inside a $1,200–2,500/mo agency bundle wholesales for ~$97/mo. Answering was never the hard part. Recording + classifying every call into booked/lost/recoverable, chasing the estimate backlog, splitting system from media revenue, and a named operator on a fee-beating guarantee — that's the part with no $29 version.
4. **$30K is already inside this buyer's price memory.** They see $5–50K field-service-platform implementations, $12–50K website builds, $25–60K marketing-training programs. The number isn't alien; what it buys is. Copy job: never let the install parse as a setup fee (word banned per D9/§8), always as the machine plus its first 90 days of operation.

**DIY-stack anchor for objection copy (internal math, category-anonymous in copy):** answering service + review tool + missed-call app + call tracking + CRM ≈ **$850–1,900/mo ($10–23K/yr)**, owner as unpaid integrator, no classification, no attribution, no operator, no guarantee.

---

## 3b. The visible-value proposal layer (added 2026-07-07 — priced foundations, two faces, Day-91)

**Where it lives:** the same-day written rate and the call sheet ONLY. Pages keep this spec's §4/§5 treatment unchanged; §8's multiples stay off pages per §16.1. Reference implementation: the Beautiful Smiles sheet (`docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md`); rules and critique record: `02-visible-value-pass.md`.

**Usage rules (binding, condensed):** (1) the fee is never itemized — the ledger prices what each layer costs *elsewhere*; our install carries one number; (2) the ledger is presented AFTER the stipulated condition, framed "assembled from 4–5 vendors, nobody accountable, no guarantee anywhere in the pile," and the website is scoped jointly-delivered-only (it's the surface the attribution runs on — not severable); (3) no bare monthly figure anywhere (D12 discipline); (4) at most one statutory penalty figure per artifact, beside the not-legal-advice fineprint — never lead with penalty math; (5) never claim privacy-law (CCPA-class) protection — the $26.6M threshold means no client of ours qualifies; consent/privacy work is sold as hygiene.

### 3b.1 The ledger (GATE:HUMAN per row; SEARCH rows must be opened at the URL before a buyer sees them)

| Layer | In today's install? | Bought alone | Source status |
|---|---|---|---|
| Conversion-built contractor site (custom, WCAG) | **No — scope decision D-HS1** | $8,000–$25,000 custom (template floor $3–5K exists — never claim $12K as a universal floor; enterprise to $50K) | OPENED (Skill Mammoth 2026-07-06; Hook Agency 2026-07-07) |
| Trade content foundation (~10–15 cost guides / service pages; growth on retainer) | No — D-HS1 | $3,000–$8,000 one-time (~$150–525/page, derived from Elorites per-word rates $0.10–0.35/word × 1,500-word page; was "$250–400/article") | OPENED 2026-07-07 (derived estimate — Elorites https://eloritescontent.com/research/content-writing-services-prices/ quotes per-word rates only; Clutch https://clutch.co/writing-services/pricing shows hourly bands, NOT the $3,000–8,000 range on-page) |
| Google Ads + LSA foundation (their account, tracking, first campaigns, creatives) | Partial (O2 carries campaigns today) — D-HS1 | $500–$1,500 setup + $650–2,650/mo à la carte mgmt | OPENED (mgmt band, Hook) / OPENED 2026-07-07 (LSA $149/mo + $499 one-time setup — https://www.footbridgemedia.com/services/google-local-service-ads-contractors) |
| ~~Retention/reactivation engine (email+SMS, quote-chase)~~ | ~~**Yes**~~ | ~~$2,000–$5,000 setup + $500–3,000/mo~~ | ~~SEARCH (Enflow/Sender 2025)~~ struck 2026-07-07: no citable openable source — Sender.net shows only its own SaaS tool pricing ($10–20/mo, SMS from $0.005/msg), not done-for-you agency figures; "Enflow" unverifiable; the setup/retainer range is an agency-market estimate, not a published stat a buyer can open and confirm |
| Review/reputation program (FTC-compliant velocity) | **Yes** | $299–$1,000/mo platform tiers (Birdeye Standard $299/mo billed annually; Podium Enterprise ~$999+ anchors the high end; vendor pricing pages are now lead-gated — treat as floors) | OPENED 2026-07-07 (cite openable analysis, not vendor pages: Birdeye $299/mo per https://www.reviewflowz.com/blog/how-much-does-birdeye-really-cost; Podium ~$999+ Enterprise per secondary analyses) |
| Call answering/tracking + two-lines dashboard | **Yes** | ~$300–$1,900/mo assembled (tracking $45–195 confirmed — CallRail Call Tracking $45/mo to Call Tracking Complete $195/mo month-to-month, +$3/number/mo; answering $250–1,725 remains an unsourced held estimate; total is derived) | OPENED 2026-07-07 (CallRail tiers — official pricing https://www.callrail.com/pricing is a JS SPA, cross-confirmed at https://www.cloudtalk.io/blog/callrail-pricing/) + held (answering half unsourced) |
| 90 days of operation + **the owner's manual** (architecture §8's own artifact — surface it) | **Yes** | $7,500–$30,000 (retainers $2.5–10K/mo) | OPENED (Hook Agency) |
| **Σ assembled from vendors** | | **~$22,000–$77,000** (midpoint ~$45–50K) vs the from-$30K install, one name, one guarantee | derived |

**D-HS1 (scope decision, blocks the first contractor proposal):** the dental deal folded site + content + ads INTO the install. Recommendation: the **foundation-shaped proposal is the default presentation** here too, with the hour-guards that protected the dental deal — content at ~10/month across the install with growth-past-N on the retainer, site scoped at signature, slow-curve items labeled proving-window/retainer work (D5's own rule). Engine-only remains the shape for shops with a genuinely good site.

### 3b.2 The two faces (proposal copy content — offense earns, defense keeps)

- **Offense:** every call answered · every quote chased · found for the trade's searches · past customers worked before ad dollars · proven on the two-line report · the shop worth more at diligence (§8, conversation-only).
- **Defense (native, sourced — printability per `02-visible-value-pass.md` §2):** consent-documented texting (TCPA $500–$1,500/message by statute; class filings +112% YoY Q1'25 — internal color) · **FTC-compliant review velocity** (16 CFR 465, effective 2024-10; soliciting with consent stays legal — that's our line) · cooling-off/contract hygiene (the anti-storm-chaser trust move) · license display per state rules · strictest-state recording disclosures · the dispute-proof call log (double weight in insurance-restoration disputes).

### 3b.3 The Day-91 bridge (native to this motion — same 60/90 clock as dental)

Two columns on the sheet, between the clock and the options: **"Yours at day 90, retainer or not"** (everything installed and in their name, sequences running, dashboard reporting, the owner's manual — run it themselves or hand it to the office manager) vs **"what the retainer keeps in motion"** (campaigns re-aimed, deeper reactivation waves + seasonal pushes, monthly report review, quarterly re-aim). Closer: the retainer figure is already in the written rate, month-to-month, the system line has to beat it — no decision needed before day 90. The guarantee makes the bridge honest here; it settles the day the choice opens.

---

## 4. Pricing display — recommendation

**Publish the floor as a formula, placed after the calculator, with the guarantee beside it.** Concretely on `/industries/home-services/`:

1. The calculator (§5) shows their leak first — six figures, their inputs.
2. Directly below the recovery/payback beat, the floor line (D3, §16-approved wording): **"Installs start at $30,000. The exact number comes from the audit — in writing, same day."** (GATE:HUMAN, already gated in the architecture.)
3. The scaling *principle* in the same breath: priced at roughly a tenth of what the audit models coming back in 12 months — so two companies never pay the same, and the buyer sees why.
4. The guarantee (verbatim, untouched) adjacent to the visible number — never carrying a hidden one.

Evidence, ranked (full sources §10):

- **Buyers punish hidden prices.** Missing pricing is the #1 reason B2B buyers drop a vendor (TrustRadius 2023–25 waves, N≈1,600–2,200/yr); NN/g's B2B research puts price as the top information need, with users observed leaving for competitors when it's absent. For an agency-burned owner, a hidden number reads as the game they've seen before.
- **On-vertical replication — the strongest single datapoint for this page:** **78% of homeowners say they're more likely to call a roofing contractor that shows pricing on its site** (85% of millennials), up from 66% in 2023 (Roofing Contractor 2025 Homeowner Survey, N=1,266). Our buyer *sells* inside this transparency norm daily; he expects it when he buys.
- **Anchoring runs in our favor exactly here.** Adjacent large numbers lift willingness to pay even when irrelevant (Nunes & Boatwright 2004, field experiment); arbitrary anchors move WTP dramatically (Ariely et al. 2003); even professionals can't resist a first number (Northcraft & Neale 1987). A $30K floor rendered beside a $300K+ modeled leak is judged against the leak. Hide the fee and the buyer's anchor defaults to his worst agency memory ($500/mo).
- **The guarantee amplifies a visible price; it can't de-risk an invisible one.** Money-back-style guarantees raise purchase intention and WTP premium (Suwelack et al. 2011) — but at high perceived prices, generous guarantees are believed mainly from well-known firms (Jeng 2014; Boulding & Kirmani 1993). A low-authority firm asking its guarantee to carry a hidden fee is loading its weakest signal at the worst spot.

**The counter-argument, owned:** a published floor gets read as the price (Ames & Mason 2015 — offer endpoints are taken as reservation-price signals), so a $60K audit-modeled rate can feel like drip pricing — the exact pattern this buyer is primed to detect (FTC drip-pricing literature). Mitigations, in copy: (a) the scaling rule is stated *with* the floor, never a bare "from $30,000"; (b) a worked example in the buyer's unit ("a shop leaking $400K models to a $40K install — two insurance roofs"); (c) the exact number lands same-day in writing, so there's no discovery-call ambush to resent; (d) the floor's job is self-qualification — sticker-shock filtering at $30K+ is the point, and it replaces the audit declining sub-floor shops one at a time. Weiss's "never publish fees" stance is noted and deliberately narrowed: it assumes a live consulting sale; this is a productized offer bought by self-qualifying web visitors. Publish the logic and the threshold; the fee itself stays value-set in the audit. (This is exactly the architecture's §9 synthesis — floor + principle published, number never.)

---

## 5. The 10x join — leak → fee → payback → do-nothing

**The component already exists.** `WholeFlowLeak.tsx` (the dentists page's conversion engine: trade presets, three-pillar sliders, editable fee, "clears the fee in the first N cases," 12-month do-nothing chart) ships with **roofing/HVAC/plumbing/electrical presets as its defaults** — it was built for this page and never mounted. The live page still runs the older `Concept3Calculator` (leak only, fee never meets it). The join is a swap plus the D12 re-anchor, not a build.

Changes to `WholeFlowLeak` for the home-services mount (all copy GATE:HUMAN):

1. **Kill the $2,500/mo fee slider as the anchor (D12).** Replace the "If a system like this runs $X/mo" slider block with the install frame:
   - Anchor line: *"The install starts at $30,000, scaled to what the audit models."*
   - Payback line, N computed live as ceil($30,000 ÷ their average-job slider): *"At your average job, the recovered work above covers the install in the first {N} {unit}."* Unit per trade preset: roofs / installs / jobs / jobs.
   - Guarantee hand-off: *"After that the fee is monthly, and it has one test: the system's line on your report beats it, or I work free."*
2. **Keep** the 12-month projection ("Do nothing and $X is gone by month 12"), the fee line on the chart (now the install amortization + retainer line), "I round down," and "the audit replaces every estimate with your real figures."
3. **Preset sanity vs research (GATE:HUMAN as a set):** current defaults (roofing $4,500 / HVAC $1,200 / plumbing $450 / electrical $600 average job) are *blended* tickets and sit at or below the sourced service-ticket data — defensibly conservative; keep them. Optionally add one line under the trade chips: "Average-job defaults are blended (service + replacement) and set low on purpose."
4. **Placement:** calculator stays above the pricing block (architecture §10) — the buyer meets the floor only after seeing six figures of their own leak.

At the roofing preset's conservative defaults the block reads: leak ≈ $500K+/yr → recovered ≈ mid-six-figures → "covers the install in the first 7 jobs" (at the $4,500 blended default; 2–4 at real replacement tickets) → do-nothing line. That's the dentists pattern, exported.

---

## 6. Legitimate urgency — per trade, sourced

Calendar arithmetic, not scarcity theater. Each sentence below is the strongest version the data supports; hedges are structural, not decorative. All GATE:HUMAN before page use.

- **Roofing:** *"May is the biggest hail month of the year, and 2025 logged 5,432 major hail events — an engine installed over the winter is answering when the first storm hits."* (III/NOAA SPC event counts CONFIRMED; the May-peak month claim traces to a vendor analysis of 30 years of SPC data — verify against SPC directly or drop the "May" specificity to "spring." Supporting stakes, page-usable once approved: $31B in 2024 roof claims, over half wind/hail-driven — Verisk, CONFIRMED; State Farm alone paid $5.6B in 2025 hail claims — CONFIRMED.)
  **Guardrail:** NOAA's May 2026 outlook is a *below-normal* Atlantic season (55% chance) — no hurricane-count urgency in 2026 copy; season dates (June 1–Nov 30, peak Sept 10) only.
- **HVAC:** *"The first heat wave of the year lifts an HVAC shop's daily revenue about 90% — by the fifth, 20%. The surge goes to whoever's already answering. Signed by March, the system is proving before that first wave."* (ServiceTitan platform study, ~800 shops, 2019–21 — CONFIRMED; disclose the data years. June alone carries ~a fifth of annual "ac repair" searches — Google Ads via DataForSEO, own pull 2026-07-06.)
- **Plumbing:** *"70% of the year's frozen-pipe demand lands in January and February, and when a freeze hits, calls run 7x normal for two weeks. Capacity added after the freeze recovers nothing — sign by early October."* (Google Ads seasonality, own pull; ServiceTitan Texas-freeze study 2021 — platform-measured, disclose vintage.)
- **Electrical:** none. Demand is the flattest of the trades (<30% swing). Do not manufacture a season. The only honest urgency is capacity (below).
- **The anti-CPL angle (all trades, replaces "ads get pricier" folklore):** peak-season clicks genuinely inflate — "ac repair" CPC rose 68% into the 2025 peak (Google Ads historical, own pull) — so the recovered demand the engine works (missed calls, dead quotes, dormant customers) is cheapest exactly when media is dearest. Note: roofing CPL *fell* 23% into the 2026 season in one 15-contractor dataset — do not claim seasonal CPL inflation for roofing.
- **One-operator capacity — GATE:HUMAN, blocked on you.** *"I install N engines a quarter. The queue is the queue."* Only shippable if N is true and you'll honor it publicly. **Question for Artur: what is N?** If you don't want a public number, the honest fallback is the named-operator line already in canon ("I run every account myself") with no count.

---

## 7. The three options — book-jobs trio, home-services skin

Names are the §16 working names (**GATE:HUMAN on the proposal template**, per the signed correction). Escalation by condition and access (Weiss variables), fees per D2 ladder (+20–25% per step). Delivered in writing, same day as the audit, all three on one page, middle option designed default.

| | **Option 1 — "The leak sealed"** | **Option 2 — "Sealed, plus demand"** (default) | **Option 3 — "The whole flow, run for you"** |
|---|---|---|---|
| The condition bought | No job lost to a missed call or a dead quote. The system-driven line visible on the report every month. | The leak sealed **and** demand pointed at the door: map-pack presence, storm/seasonal campaigns ready, media at cost through the sealed system. | Growth handled. Owner out of marketing operations; the machine re-aimed every quarter without him in the loop. |
| Inside (home-services skin) | Install: answering + text-back, booking + reminders, estimate-recovery sequences, review engine, dispute-proof call log, two-lines dashboard; 90 days operated; guarantee | Option 1 + Local SEO & Maps program + storm/seasonal campaign templates armed before the season + media management on their account at cost | Option 2 + database reactivation program + review-velocity engine + quarterly re-aim memo + membership/maintenance-program build-out (HVAC/plumbing retain lever) |
| Access | Monthly report call | + direct line during install, 1-business-day response | + same-day SLA; office manager and partner both have my number |
| Fee shape | Floor $30K, scaled per audit; retainer from month 4 | Install +20–25%; retainer includes media-management line | Install +20–25% over Option 2; retainer priced to the maintained condition |
| Guarantee | Day-90, verbatim | Same | Same |

The proposal opens with their stipulated numbers (leak, recovery, their intangible words from the audit) and the EV band for their trade (§8) — fee beneath value, Weiss's order preserved on paper.

---

## 8. The improved condition — what the install does to the business's price tag

This is the fee's Weiss anchor (D2's "stipulated value" needs the EV line to clear 10:1 on mid-size accounts, per architecture §3.3). **All multiples are value-conversation and proposal material — none of it goes on pages** (consistent with the §16.1 restriction on ROI stats for book-jobs surfaces; the calculators + guarantee carry the on-page ROI story).

**The verified ladder (audit-script beats):**

1. **Size and institutionalization move the multiple 2–3x on the same dollar of earnings.** Median brokered deals, Q3 2025: 2.0x SDE (<$500K) → 2.8x ($500K–1M) → 3.3x ($1M–2M) → 4.0x EBITDA ($2M–5M) → 5.3x EBITDA ($5M–50M). (IBBA/M&A Source Market Pulse, 300 advisors, 247 closed deals — **CONFIRMED against the PDF**.) Construction specifically: 3.8x (<$1M EBITDA) → 5.0x ($1–5M) → 6.2x ($5–10M) (Pepperdine 2025, Table 27 — CORRECTED series; note it dips to 4.8x at $10–25M, so don't claim monotonic).
2. **Owner-dependence is a discount and an illiquidity event.** Key-person discount 10–25% standard (valuation practice); ~52% of HVAC companies that go to market **do not sell**, with buyer hesitation typically driven by owner dependence and customer attrition (FirstPageSage 2025 — CORRECTED phrasing, use as stated). PE buy-boxes require the business to run without the founder — quotable, primary: Omnia Exterior Solutions' chairman on what contractors need: *"become more professional, have systems and processes, and do accrual accounting"* (Roofing Contractor, Feb 2025).
3. **The buyers exist, at record density.** PE-backed roofing platforms: 17 (early 2023) → 56 (end 2024), 134 roofing add-ons acquired in 2024 (+25% YoY) (Roofing Contractor — CONFIRMED-class trade press); 55 PE-backed HVAC deals in 2024, +72% (PitchBook); ~800 MEP companies PE-acquired since 2022 (WSJ/PitchBook); Apex Service Partners took a ~$2B Apollo minority at a reported ~$10B valuation (May 2026); Goldman bought Sila Services from Morgan Stanley (Nov 2024). Two-thirds of small-business sellers are at or past retirement age (IBBA Q3 2025 — CONFIRMED) — supply is coming; differentiation at sale is the leverage.
4. **What the engine specifically builds is what moves the multiple:** recurring/maintenance revenue (+0.5–1.0x turn guidance; HVAC contract books at 5–8x vs 2–4x — broker guidance, gated), documented job-level financials and call logs (QoE-ready), demand that doesn't die with the owner's phone habits. Roofing-specific modeling note: buyers value storm/insurance revenue at 0.5–0.7x the multiple of steady retail/repair revenue — the engine's retail-base compounding is the multiple play, not the storm spike.

**The worked example for the audit script (their numbers, our multiple band, sourced verbally):** a $2M roofer whose audit models $300K/yr recovered at ~35% flow-through adds ~$105K of EBITDA. At the conservative brokered-market 3–5x for his resulting size band, that's **$315–525K of enterprise value on top of the cash** — and it's built from the documented systems that make the business sellable at all (half the owner-dependent ones never sell). Then the stipulation question: *"Does that number feel conservative to you?"*

**The cleanest three-sentence version the data supports (proposal/call use):**
> "Brokered-market data prices an owner-run shop at roughly 2–3x its earnings; the same trade with management depth and $2M+ of enterprise value clears 4–5x, and PE pays 7–10x for platform-grade companies. The difference isn't the work — it's whether the business answers calls, books jobs, and keeps customers without the owner doing it personally. Every recovered, documented dollar of profit is worth roughly $3–5 at sale, and the systems that produced it are what move the multiple itself."

---

## 9. Wording kit (humanizer pass applied; guarantee sentence untouched everywhere)

All blocks GATE:HUMAN. Voice: first-person "I," trade language, numbers before adjectives, one em-dash max per paragraph, no manufactured urgency.

### 9.1 Hero options (pick one; eyebrow stays "For roofing, HVAC, plumbing & electrical")

**A — the quote that went cold (mirrors the dentists hero; leads Retain):**
> **You drove out, measured the roof, sent the quote. Then nobody chased it.**
> The estimate you spent half a day on dies in a text thread. The call that would've booked the next one rings while you're on a ladder. I run the system that catches both, and I prove what it paid you back.

**B — the missed call, priced (closest to current; sharpened):**
> **Every call you miss on a roof is a job someone else books.**
> You're not losing jobs to better contractors. You're losing them to whoever picks up first. I install the engine that answers every call, chases every quote, and shows you what it brought back — on its own line in your dashboard.

**C — the install, named (price-forward; pairs with the visible floor):**
> **One install. Sixty days. Then the leak is sealed.**
> I build one system into your business: every call answered, every quote chased, every past customer worked. Installed by day 60, proving by day 90. The proof shows up in your dashboard, not my slideshow.

Recommendation: **A** for the page (it's the pattern the dentists page proved and the least commodity-comparable claim), **C** held for the pricing section lead-in.

### 9.2 The guarantee restated against the visible price

> **Installs start at $30,000. The exact number comes from the audit — in writing, same day.**
> What makes that a safe number to read sitting here: from day 90, the revenue the system brings back has to beat my monthly fee, counted in your own dashboard, or I work free until it does. And the install has its own check before that: a written punch-list, walked item by item on day 60. You're never more money out than system in.

(First line = D3's approved formula. The guarantee blockquote itself stays verbatim in its own component: *"If the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does."* — no change proposed.)

### 9.3 The joined leak-math block (calculator copy, D12)

- Anchor: *"The install starts at $30,000, scaled to what the audit models."*
- Payback (N live): *"At your average job, the recovered work above covers the install in the first {N} {roofs|installs|jobs}."*
- Hand-off: *"After that the fee is monthly, and it has one test: the system's line on your report beats it, or I work free."*
- Footer (keep, extend): *"Your numbers, your assumptions. I round down. The audit replaces every estimate with your real figures."*

### 9.4 The install timeline as a story

> **Day 1.** The audit puts your numbers in writing: what you're missing, what it's worth, your exact rate. If you sign, the punch-list goes in the contract — every item I'm installing, checkable, with the day-60 walkthrough already on the calendar. Your Google profile work starts the same week; it has the longest runway.
> **Week 2.** The phone stops leaking first. Every call answered around the clock, missed calls get a text back in seconds, every call recorded and logged. This part doesn't wait for the rest of the build.
> **Day 30.** Your dashboard goes live with the first cut of the two lines: what your ads drove, what the system recovered. Follow-up sequences start working your open quotes.
> **Day 60.** We walk the punch-list together, item by item. Everything the contract promised is live, or I'm not done.
> **Day 90.** The report that settles the guarantee. The system's line either beats my monthly fee or I work free until it does. You read it in your own dashboard — the same numbers I read.

### 9.5 Five objections, rewritten for the bigger ticket

**"$30K? The other guys charge $500 a month."**
> They do. Price their stack: an answering service, a review tool, a missed-call app, call tracking, and a CRM run $850 to $1,900 a month — $10K to $23K a year — with you as the unpaid integrator. Nobody in that stack records and sorts every call. Nobody splits system revenue from ad revenue. Nobody's name is on a day-90 guarantee. $500 a month rents you a tool. The install builds you an asset a buyer can see working when they look at your books.

**"I've been burned by marketing companies before."**
> Most of them sold you a slice and proved the slice fired: clicks, rankings, impressions. None of them owned whether you made money. I do, in writing. The system's revenue is a line in your dashboard, and if it doesn't beat my monthly fee by day 90, I work free until it does. The install has its own check too — a written punch-list we walk on day 60.

**"Why one big install instead of monthly like everyone else?"**
> Because the work is front-loaded and you should own it. Phone lines, booking, follow-up sequences, your Google profile, the call log, the dashboard: built once, yours. Monthly-forever pricing is how vendors charge you for the same setup five years running. You pay to build it, I run it for the first 90 days included, and after that the monthly fee has one test — the system's line beats it, or I work free.

**"I can't float $30K right now."**
> You don't hand me $30K on day one. Half at signing, a quarter when your dashboard goes live around day 30, the last quarter at the day-60 punch-list walkthrough. You're never more money out than installed system. Prefer one payment? Take 5% off. Then run the calculator above with your own numbers: at your average job, the install is the first few jobs the system recovers. What you're floating right now is the leak.

**"How do I know 'revenue it brings back' isn't marketing math?"**
> Every call is recorded, transcribed, and sorted: booked, lost, recovered. The dashboard splits what your ads drove from what the system saved — and it's your dashboard. Fire me and you keep it, with every number in it. The audit works the same way: your call log, your quote list, your Google profile, in writing, yours to keep.

### 9.6 Audit CTA microcopy (names the artifact)

- Button: **Book a Revenue Leak Audit** (canon, unchanged)
- Under-button: *20 min · free · your numbers, in writing, yours to keep*
- Body addition: *"You leave with a one-page leak report: missed calls counted, real response time, your follow-up gap in dollars — and your exact install rate, in writing, the same day. Keep it whether you hire me or not."*

### 9.7 The not-doing-this close (jobs and quotes, not percentages)

> Say the calculator's close and you close this tab anyway. Next year, in jobs: the calls that ring while you're on a job get booked by whoever answered — call it {missed_jobs} over the year. The quotes you drove out for and never chased, {quote_jobs} more. That's {total_jobs} jobs at your average ticket, gone quietly. Not to a better contractor. To a faster phone. The audit is free and the numbers are yours either way. The expensive choice is not knowing them.

(Slots computed from the calculator's live inputs; static fallback uses the conservative preset defaults.)

---

## 10. Sourced number bank — **GATE:HUMAN on every row**

Verification: ✅ = adversarial verifier fetched the source URL and confirmed the figure on the page (2026-07-05/06). Use column says where the number is permitted **after your sign-off**.

### 10.1 Proposed claims-library rows (page-usable candidates)

| ID | Claim | Source · date | Verified | Use / replaces |
|---|---|---|---|---|
| **C-07** | Only 55% of callers to home-services businesses speak with a person (HVAC 52%, plumbing 56%, construction 53%) — nearly half never reach one | Invoca Call Conversion Benchmarks Report, Home Services 2025 (60M+ calls, AI-scored) · invoca.com/reports/the-invoca-call-conversion-benchmarks-report-for-the-home-services-industry-2025 · 2025-06-10 | ✅ (figures read in report PDF) | **Retires the unsourced C-05 "as many as 1 in 3" hedge** with something stronger and named |
| **C-08** | 27% of calls to home-services businesses are not answered | Invoca blog · invoca.com/blog/how-much-missed-sales-calls-cost-home-services-businesses · 2024-05-23 | ✅ (verbatim) | The conservative twin: "more than 1 in 4, platform-measured." Also independently repeated by Housecall Pro |
| **C-09** | Odds of qualifying a lead drop 21x when first response slips from 5 to 30 minutes; contact odds fall >10x within the first hour | Lead Response Management study, Oldroyd/InsideSales (15,000+ leads, 100k+ calls) · leadresponsemanagement.org/lrm_study · 2007 — **vintage must be disclosed in copy** | ✅ (on study site) | Pairs with C-01 (47-hr average): the gap vs the stakes |
| **C-10** | 56% of home-services businesses never ask the caller to book or buy; 46% of phone leads convert on the call when handled | Same Invoca 2025 report (p.4, p.33) | ✅ (report PDF) | Backs BOOK: answered ≠ closed |
| **C-11** | Only 16% of contractors follow up with homeowners the same day on unsold estimates | ServiceTitan 2026 Roofing & Exteriors Market Report (Thrive Analytics, 1,000+ companies, $5M+ revenue — skews large, so conservative for smaller shops) · servicetitan.com/press/2026-roofing-exterior-market-report · 2026-01-14 | ✅ (verbatim on press page) | Backs RECOVER; roofing niche page lead stat |
| C-12 (hedged) | "Up to 85% of customers whose calls go unanswered will not call back" | CallRail Jan-2025 report coverage (methodology unstated for this figure) · plumbermag.com relay · 2025-01-20 | ⚠️ hedge-only | Only with "up to" + CallRail attribution; weakest bank row |
| C-13 (vintage-disclosed) | Call booking rates collapse after 6 p.m. — 61%→21% (large shops), 26%→9% (small) | ServiceTitan platform data, 3,000+ businesses · servicetitan.com/blog/data-call-booking-rates · 2022 data | ✅ | The after-hours claim that survives (no defensible "X% of calls arrive after hours" source exists — the circulating 35–45%/73% figures are content-farm folklore; do not use) |

### 10.2 Trade economics (audit model + value conversation; not page copy)

| Number | Source · date | Verified |
|---|---|---|
| Roof replacement ~$9,500 avg / $9–18K asphalt (retail) | Angi 2026 (~$9,602) | ✅ via brief verify |
| Insurance reroof claim $17,631 avg 2025 (+33% vs 2021–24); repair claim $4,699 (+25%) | Verisk 2026 U.S. Roof Report · 2026-05-29 | ✅ |
| Roof claims $31B in 2024 (+~30% since 2022); >half of residential claims wind/hail; non-cat wind/hail 17%→25% 2022–24 | Verisk Roofing Realities · 2025-04-08 | ✅ |
| Retail roof repair $1,171 avg | Angi 2026 | ⚠️ secondary (403’d page; search-indexed) |
| HVAC replacement $7,500 avg ($5–12.5K typical) | HomeAdvisor, updated 2026-06-17 | ✅ |
| HVAC mid-market replacement $8–10K; affluent $12–14K+ | ServiceTitan Fall 2025 Benchmark recap | ✅ |
| HVAC repair $1,205 avg 2025 (+47% vs 2021); repairs 21.6%→31.3% of revenue 2021–25 | Housecall Pro (~2M jobs) · 2026-03-24 | ✅ |
| HVAC close 38% w/o financing → 49% with | ACCA/Farmington, 1,000+ contractors · Dec 2025 | ⚠️ corroborated 2× (source 403s) |
| Plumber $340 avg job / $182–500; water heater $1,345; sewer $3,319; repipe ~$4.50/sq ft (~$9K/2,000 sq ft) | HomeAdvisor, updated Jun 2026 | ✅ all four |
| Plumbing: 45%+ of shops close 70%+ of jobs; overall 69% of pros win >50% of quotes | Jobber 2026 Trends (N=1,050) | ✅ |
| Booking-rate spread: <5 techs 24% vs 25+ techs 59%; trade averages plumbing 43% / electrical 41% / HVAC 38% | ServiceTitan platform, 3,000+ businesses · 2022 | ✅ |
| Electrician $350 avg; panel $1,345; EV charger $967; rewire $1.5–10K | HomeAdvisor Jun 2026 | ✅ |
| Electrical structure: 51% of firms 1–9 employees; 42% ≤$1M; residential >50% of revenue only under 10 employees | NECA/EC Magazine 2024 Profile · 2024-07-16 | ⚠️ primary, one figure via search excerpt |
| 2–3 crew roofer ≈ $1.5–3M revenue; HVAC ~$250–400K/tech | Vendor consensus (Pipeline On, BaaDigi) | ✗ internal sizing only |
| Sale Solution measured baseline: roofers onboard at ~27% missed calls (first-30-day logs) | Internal · 2026-06 | first-party; honest to state as ours, never as research |

### 10.3 Enterprise value / brokerage (value conversation + proposals only)

| Number | Source · date | Verified |
|---|---|---|
| Median multiples by size, Q3 2025: 2.0x SDE (<$500K) / 2.8x ($500K–1M) / 3.3x ($1–2M) / 4.0x EBITDA ($2–5M) / 5.3x EBITDA ($5–50M) | IBBA/M&A Source Market Pulse Q3 2025 PDF | ✅ **use this series** (an earlier agent misread 2.5/3.0/6.5 from year rows — discard) |
| Construction median by EBITDA: 3.8x (<$1M) / 5.0x ($1–5M) / 6.2x ($5–10M) / 4.8x ($10–25M, dips) / 7.5x ($25M+) | Pepperdine 2025 PCMR Table 27 | ✅ corrected series |
| ~52% of HVAC companies that go to market do not sell; hesitation typically owner dependence + customer attrition | FirstPageSage 2025 HVAC report · 2025-02-06 | ✅ (corrected phrasing — use as stated) |
| FirstPageSage per-trade tiers (roofing 5.9→11.1x etc.) | FirstPageSage 2024–25 | ✅ on page, but **ceiling only** — runs 2–4 turns above broker medians |
| Key-person discount 10–25% (to 50% extreme) | Valuation practice standard (Pratt lineage) | ⚠️ practice standard, not a study |
| Roofing PE platforms 17→56 (2023→24); 134 add-ons in 2024 (+25%) | Roofing Contractor · 2025-02-20 | primary trade press |
| 55 PE-backed HVAC deals 2024 (+72%); ~800 MEP acquisitions since 2022 | PitchBook Q2-25 note; WSJ/PitchBook | headline stats public |
| Apex/Apollo ~$2B minority at ~$10B reported valuation (2026-05-28); Goldman–Sila (Nov 2024) | Business Wire releases | ✅ deal facts; valuation per trade reporting |
| Sellers: 59% Boomers + 7% Silent = two-thirds at/past retirement age (Q3 2025) | IBBA Q3 2025 PDF | ✅ |
| Storm/insurance revenue valued at 0.5–0.7x base multiple; recurring contracts +0.5–1.0x turn; owner-dependent −30–50% | Broker guidance (Profitability Partners, ClearlyAcquired, SE Advisors) | ✗ gated — conversation texture, never quoted as data |
| PE prerequisite quote: contractors "need to become more professional, have systems and processes, and do accrual accounting" — Omnia chairman | Roofing Contractor · 2025-02-20 | primary, quotable |

### 10.4 Urgency / seasonality

| Number | Source · date | Verified |
|---|---|---|
| Hurricane season June 1–Nov 30, peak Sept 10, most activity mid-Aug–mid-Oct | NOAA NHC climatology | ✅ |
| **2026 outlook BELOW normal (55%): 8–14 named storms** — guardrail, not a sales line | NOAA CPC · 2026-05-22 | ✅ |
| 5,432 major hail events 2025 (5,373 in 2024); Texas 902 | III aggregating NOAA SPC | ✅ |
| State Farm $5.6B hail claims 2025 (TX $1.4B); $3.8B home hail 2024 | State Farm Newsroom · 2026-04-21 | ✅ |
| First heat wave +~90% HVAC daily revenue, fifth +~20%; heat waves +55% avg | ServiceTitan ~800 shops, 2019–21 · 2022-04-07 | ✅ disclose years |
| Cold spells: +30% jobs at +30% ticket; IL 350%+ | ServiceTitan 2018–21 | ✅ disclose years |
| October = busiest HVAC month (trips/vehicle) | Samsara, 65M trips, 2023–25 · 2025-08-06 | ✅ |
| Texas 2021 freeze: calls 7x for two weeks; demand elevated ~4 months | ServiceTitan · 2021-06-15 | ✅ disclose event |
| "frozen pipes" searches: ~70% land Jan–Feb; Jan ~31x summer floor. "ac repair": June ~20% of year, Jun–Aug ~48%. "hail damage roof": June ~7.6x December | Google Ads via DataForSEO, own pulls · 2026-07-06 | ✅ own platform pulls, reproducible |
| "ac repair" CPC +68% Jan→Aug 2025 ($24.63→$41.28); 2024 pattern +102% | Google Ads historical via DataForSEO | ✅ own pull |
| Roofing CPL fell 23% into 2026 season ($145→$111, 15 contractors) | SearchLight Q1 2026 | counter-evidence — blocks "roofing ads get pricier" claims |
| Post-storm surge 80–120 calls/day, 48–72h window | Vendor blogs, uncited | ✗ internal shape only, never copy |

### 10.5 Competitor field (internal only — names never in copy)

DIY stack $850–1,900/mo; GHL agency tiers $297–2,500/mo on $97–497/mo platform (AI stack wholesales ~$97/mo); answering services $250–1,725/mo per-minute; Jobber AI Receptionist add-on $29/mo (✅ vendor pricing page — the "$29 version exists, that was never the hard part" anchor); attribution only as enterprise add-on est. $500–1,500+/mo atop $5–50K implementations; enterprise agencies $8–15K/mo justified by attribution; training programs $25–60K; category guarantees are lead-count/fee-refund, remedy always more free work. Full source rows in the research dump (`scratchpad/research-final.md`, task `competitor-bundles`).

### 10.6 Corrections owed to the existing niche briefs (regenerate, don't hand-edit)

The verify pass caught four issues in `lib/strategy/niches/briefs.generated.ts` to fix on next regeneration: (1) CallConley plumbing LTV is $3,500–$10,000 on the source, not "$4–5K"; (2) HomeGuide repipe is ~$4,000–$15,000, not "$6–15K"; (3) CallJolt URL typo `/blog/guide/` → `/blog/guides/`; (4) the "80% need 5+ follow-ups / 44% quit after one" pair bundles two sources (Marketing Donut + conventionally Scripted) under one citation — split or drop the 44%. Also reconcile the ~44% map-pack click-share attribution (Moz 2015 in roofing brief vs Backlinko in plumbing brief) before any claims-bank use.

---

## 11. Page map — what replaces what on `/industries/home-services/`

| # | Current section (file) | Change | Gate |
|---|---|---|---|
| 1 | `RevenueHero` — specs read "Setup: 90 days, one-time fee" | Hero copy → §9.1 option (rec: A). Specs → **"Install · 60 days, one-time fee" / "Proving · by day 90" / "Lock-in · none"** ("Setup" is a banned word per D9; D5 wording) | GATE:HUMAN |
| 2 | `Concept2Evidence` — leak cards (HBR 2011 42-hr, "1 in 3" hedge, Backlinko) | Keep structure; re-arm with C-07/C-08/C-11 once approved (evidence cards get named 2024–26 sources instead of 2011 vintage) | GATE:HUMAN (claims) |
| 3 | **`Concept3Calculator` → `WholeFlowLeak`** | The core swap (§5): trade presets already default to home services; add D12 install-frame re-anchor; fee-slider block replaced by floor + N-payback + guarantee hand-off | GATE:HUMAN (D12 copy) |
| 4 | `FlowBlock` | Unchanged | — |
| 5 | `PlanByPillar` — intro "…the 90-day setup is on me" (`PlanByPillar.tsx:88`) | → "I install and run all of it — the 60-day install is on me." (also clears a banned-word straggler the architecture already lists) | GATE:HUMAN |
| 6 | `Concept4BeforeAfter` | Unchanged | — |
| 7 | `Seasonality` | Keep the 3-point structure; upgrade intro with one sourced urgency line per §6; optional capacity line pending your N | GATE:HUMAN |
| 8 | `TwoRevenueLines` | Unchanged (PROOF-SLOT stays empty — no fabricated proof) | — |
| 9 | `Guarantee` | **Untouched, verbatim** | locked |
| 10 | `RevenuePricing` — model published, no number; terms say "90-day install, one-time fee" | Add D3 floor line under "Published model. No games on a call."; restate guarantee against it (§9.2); terms → "Installed by day 60, proving by day 90 · one-time install fee · 3-month minimum, month-to-month after · staged billing 50/25/25 (or 100% −5%)"; add install-timeline story (§9.4) here or as its own strip | GATE:HUMAN |
| 11 | `FAQ` (4 items) | Rewrite "How fast can we start?" around the 60-day punch-list; **add the "$30K vs $500/mo" objection** (§9.5 #1 — this decides the page), the staged-billing answer (#4), and the proof-integrity answer (#5) | GATE:HUMAN |
| 12 | `AuditCTA` | Add artifact-naming microcopy (§9.6) | GATE:HUMAN |

Also inherited from the architecture's migration table (not new here): the six book-jobs cylinder pages get their CTA fixed to the Revenue Leak Audit, and the medical pillar's `<AuditCTA />` missing `vertical="dental"` bug is on the known-bugs list — both outside this page but in the same build pass.

---

## 12. Per-trade niche shortlist (Phase-6 lazy rule: a page is earned, not planned)

**1. Roofing earns the first niche page** (`/revenue-engine/roofing/` per the flat-slug rule). It has the biggest verified tickets, the sharpest sourced leak stats, a real season, the hottest buy-side story, and the brief + calculator preset already built. The three numbers the page leads with (pending §10 sign-off):
1. **$17,631** — the average insurance-claim reroof in 2025, up 33% (Verisk). One saved call ≈ one install fee's worth of work in two roofs.
2. **45% of callers never reach a person** (Invoca 2025, 60M calls) — with the conservative twin "more than 1 in 4 calls go unanswered" (27%, Invoca).
3. **Only 16% of contractors follow up same-day on unsold estimates** (ServiceTitan 2026) — the estimate-recovery wedge, in the buyer's own report.

**2. HVAC second:** first-heat-wave +90% (the best install-before-the-season mechanic in any trade), repair ticket $1,205 and rising, close 38%→49% with financing (the BOOK/financing wedge), memberships ≈ 3x customer value (the Retain/retainer wedge).

**3. Plumbing third:** the 24%-vs-59% booking-rate spread is the single strongest audit lever found anywhere; freeze-event urgency writes itself in October.

**Electrical: no page.** The typical shop fails the $30K floor (§2). It stays in the eyebrow, the presets, and the audit intake — where the audit itself qualifies the rare $2.5M+ residential shop in.

---

## 13. Constraints honored (unchanged from the prompt)

- No fabricated proof; PROOF-SLOT stays empty; the internal 27% roofing baseline is stated as ours when used, never dressed as research.
- C-06-class numbers (per-channel close rates, margins by channel, LTV vendor claims) stay **qualitative in copy** — they live in the model and this doc only.
- No manufactured urgency; the NOAA below-normal 2026 outlook is an explicit guardrail; electrical gets no season.
- The day-90 guarantee sentence is quoted verbatim everywhere and changes only with your sign-off — nothing in this spec edits it.
- Competitor names stay internal; copy uses category language.
- Every number destined for a page sits in §10 with URL + date + verification status and a GATE:HUMAN.

**Open items that need you specifically:** (1) capacity number N for §6, or explicit "no public count"; (2) sign-off on the C-07…C-13 rows; (3) the D12 calculator copy set (§5/§9.3); (4) hero pick (§9.1); (5) whether the electrical sub-floor tier stays dead (recommended) or D2 gets amended; (6) **D-HS1** — foundation-shaped proposal default (site+content+ads in the install, dental-style) vs engine-only (§3b.1); (7) sign-off on the §3b ledger rows + defense lines, with every SEARCH-status row opened at its URL first.
