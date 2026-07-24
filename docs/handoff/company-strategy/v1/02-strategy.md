# 02 — The strategy

## A. Kernel

**Diagnosis (from 01):** a one-operator firm with a signed offer architecture, a complete sales playbook, and working diagnostic tools has spent five weeks building and zero weeks selling. Its industrial buyer is unreachable by search (outbound-only, and the channel is empty of competitors). Its GEO category is commoditized at the label but winnable at the niche + citation level. Its Revenue Engine rides the one rising demand curve in the dataset, inside a narrowing mid-curve window. Proof is thin but sufficient to start.

**Guiding policy:** *sell with the diagnostic; ship before you build; agents produce everything that isn't a conversation.*

**Coherent actions:** turn the key (P0) → close the live deal (P1) → sweep the warm book (P1.5) → run two founder selling lanes daily (P2 dental, P3 industrial) → deploy the probe as the public wedge (P4) → make proof publishable (P5) → run the authority engine at fixed agent cadence (P6) → ignite paid + partnerships only after tracking and proof exist (P7, P8) → keep the pipeline honest (P9). Cards in [03-execution-plays.md](03-execution-plays.md).

## B. The focus decision (where founder hours go for 90 days)

**Before either lane: the warm book.** F-01 attests seven real vertical engagements (industrial, jewelry, motorsports, wood flooring, dental, roofing, manufacturing). For a firm with thin cold proof, the highest-conversion revenue is sitting there: expansion asks, referrals, testimonial/case-study consents, and any proposal that went quiet. P1.5 sweeps it in week 1. Cold lanes build the future; the warm book pays for the quarter.

**Primary cold lanes: dental (book-jobs) and industrial distribution (sell-product).** One lane per motion, deliberately.

Why dental:
- The only live deal (Beautiful Smiles, call-ready $30K proposal) and the best conversion page on the site (`/revenue-engine/dentists/`).
- The one signed quantified claim (C-06) and a HIPAA story already built.
- "ai receptionist" is the only commercial term in the demand data still rising.
- Highest-LTV local vertical (patient LTV $4,000–$7,500) with referral density (study clubs, DSO adjacency) for later.

Why industrial:
- The biggest tickets ($30K floor scaling to $80–200K) and the strongest value ledger of all four verticals (lean à-la-carte alternative ≈ 3.5× the floor).
- An empty outbound channel: the buyer's vocabulary has zero search volume, so nobody reaches him through search, and nobody else is calling him about the AI answer either. The scripts, ICP, and objection cards for exactly this call are already written. Honest caveat: an empty channel is also unproven demand — the lane runs a 2-week validation gate (P3) before it earns a permanent daily block.
- The AI-answer check is a demonstrable, honest wedge ("I asked ChatGPT who stocks [category]. It named someone else.") that doubles as the service demo.

**Secondary lane: home services (roofing-forward).** Storm season is now, the scanner's leak types were designed for it, and the playbook's roofing track is live. It runs on scanner-armed calls only — no page builds — until the dental motion proves the weekly rhythm. Note the honest gap: there is no public roofing page (M2 split is decision-gated on SAL-436); calls land on `/industries/home-services/`.

**Parked for 90 days:** consumer/jewelry (Liori consent is recorded; the vertical waits), med-spa/plastic-surgery/local-retail pages, all Tier-1 expansion niches from `docs/strategy/revenue-engine/niche-research.md` (pest control, pool, GLP-1 clinics…), the anchor ladder (D13 — stays parked), and any new site surface not demanded by a play. The expansion bench exists; it is earned by two closed installs, not by enthusiasm.

## C. Offer × funnel map (what gets sold, through which door)

| Lane | Offer ladder | Door | First yes | Expansion |
|---|---|---|---|---|
| Dental | Revenue Leak Audit → Engine Install (`max($30K, ~10% modeled gain)`) → retainer $4–8K/mo mo-4+ | Revenue Leak Audit (~20 min, their numbers, theirs to keep) | The audit call | Retainer → more cylinders → referrals into the vertical |
| Industrial | Growth Call → cylinder sprint ($12–24K AI Search / others per band, 100% credits to install ≤90 days) → Engine Install ($30–200K) → FGO (from $20K/mo A / $12K/mo B) | Book a Growth Call; written diagnostic secondary; probe as self-serve wedge | Often the sprint (skeptic's door) | Sprint → install → FGO |
| Home services | Revenue Leak Audit → install ($30–50K roofing / $30–40K HVAC) → retainer $4–6K/mo | Revenue Leak Audit | The audit call | Per-trade pages later (M2), ads later (P7) |

Pricing stance is signed canon and not revisited here: floor formula, year-one ≤ ~15% of stipulated value, fee never itemized, exact fee only in the same-day rate letter / 48h SOW, decline below ~$250–300K modeled. The market data validates it from both sides: SaaS receptionists at $99–399/mo make "install the AI" unsellable at $30K, while the six-foundation frame prices against a $55–120K assembled alternative and a modeled recovery — which is exactly how the Beautiful Smiles proposal is already built.

## D. Channel plan per motion

### Warm book (both motions, week 1 — P1.5)

One deliberate pass over the seven attested engagements plus dormant proposals: an expansion ask, a referral ask, and a testimonial/consent ask per account, founder's voice, agent-prepped one-pagers. These conversations also pressure-test pricing language before cold calls repeat it.

### Book-jobs (dental primary, home services secondary)

1. **Scanner-armed cold calls** — the core channel. `precall-scan.mjs` seeds and scans 100 leads/night per metro; every call opens on an observed fact ("I called your line at 6:40 last night, got voicemail"). Playbook cadence: 8 touches / ~15 working days. Target: 3 booked audits/week at 40–100 dials per booked next-step (playbook numbers, re-baselined every 2 weeks).
2. **Audit → same-day rate letter** — the conversion mechanism. Agent drafts the 3-option letter from the template + audit data within hours; Artur reviews and sends same day. "Does that number feel conservative to you?" is the hinge.
3. **Meta ads (gated)** — only after P0 tracking (Meta `Lead` event, Google Ads conversion), TCPA/A2P registration, and first proof. The plan exists (`docs/strategy/ads/`); the budget is a GATE:HUMAN in 08.
4. **Referrals (from first close)** — a scripted ask at day-90 settlement, plus the dental-vertical density play (study clubs, suppliers) in P8.

### Sell-product (industrial)

1. **Cold email, small and personal** — batches ≤50/segment (the 5.8%-reply band, vs 2.1% for blasts), observed-fact openers armed by the **AI-answer sweep** (agent runs the actual check per prospect; the honesty gate — only say "I asked the AI" if we did — is satisfied by automation). Full sender hygiene: SPF/DKIM/DMARC aligned, one-click unsubscribe, ramped volume, reply-first copy with the link only on touch 4–5 (playbook rule).
2. **Cold calls** on the industrial track for the accounts that engage or the sub-verticals with phone cultures (playbook `04-industrial-script.md`).
3. **Founder-brand LinkedIn** — 2 posts/week from real artifacts (probe findings, AI-answer screenshots, data-study cuts), plus the LinkedIn touch already inside the 8-touch cadence. This is the highest-ROI-per-hour channel for a solo high-trust seller and the market's proven motion for GEO services.
4. **The probe as public wedge** — deployed (P4), then distributed: in outreach ("your site reads 61 — report attached"), on LinkedIn, and pitched to the ICP's own media (DSG/MDM) alongside the data study.
5. **Growth Call → 48h SOW** — the conversion mechanism, sprints as the skeptic's door.

### Authority engine (serves both motions; agent-run; measured on citations + referring domains, never leads)

Priority order matters more than volume:
1. **SAL-411 money page** (`/services/ai-seo/` → "GEO agency / AI SEO agency" cluster, KD 3–15) — the only search-capture play with winnable difficulty. Folds in SAL-404.
2. **Place the 6 drafted guest posts** — they target exactly the money terms and exist already; vet hosts (≥1K organic traffic, real rankings), pitch, place.
3. **Content calendar at 2/week** through the engine (pillars first: A, E, B), engine→Sanity drafts, founder publishes. Term capture after every piece.
4. **One data study/month** ("we analyzed N AI answers for industrial part queries") — the #1 citation lever at DR 10, and it doubles as cold-call ammo for the industrial lane.
5. **Glossary queue drain** — 110 terms queued; batch of 15–20/month as drafts.
6. **Citation tracking live** (SAL-406) — Brand Radar and/or the DataForSEO LLM-mentions endpoint (which responded in this session; the "off plan" note looks stale). Without it the engine is unmeasured.

## E. Funnel math (the honest version)

Assumptions stated so they can be re-baselined with real data every 2 weeks. Planning inputs, not claims. One chain, one output.

**Founder selling capacity:** 2 hrs/day protected (90-min call block + 30-min sends and follow-ups), 5 days/week → 125–200 dials/week plus 150–250 emails/week in ≤50 batches.

| Stage | Planning number | Source |
|---|---|---|
| Dials → booked next-step | 40–100:1 | Playbook (`01-strategy-overview.md`); re-baseline at week 2 |
| Email batches → replies → calls | 3–6% reply → 1–2 calls/wk | 2026 outbound benchmarks (07 §D) |
| Booked → run (show rate) | 60–75% | Assumption; measure from week 1 |
| Run → same-day letter / 48h SOW | 100% (mechanical) | Process rule |
| Letter/SOW → close ≤14 days | **10–20% cold** · 30–50% warm book | Cold $30K+ sale with thin proof; the 2-week re-baseline replaces this first |

**The chain, compounded:** 125–200 dials + the email lane → 2–4 booked/week → 1.5–3 run/week → roughly 20–35 runs/quarter → **2–7 closes/quarter possible at the assumed close band.** Capacity binds before the top of that range: at N = 3 installs/quarter (DQ-2), the funnel is designed to produce more qualified demand than delivery can absorb. The response to excess demand is value pricing's: schedule installs forward and hold the floor. Never discount to clear inventory.

**90-day targets (PROPOSED — GATE:HUMAN, DQ-5), staggered so the acquisition peak and the delivery peak don't coincide:**
- Day 14: Beautiful Smiles decided (closed-won or clean no). C-06 filed into the claims library before the call (P1).
- Day 30: 1 install signed; warm-book sweep complete (every F-01 account touched with a specific ask); industrial lane passed or failed its validation gate.
- Day 90: 3 installs signed total (= capacity) or 2 installs + 2 sprints; ≥20 audits/calls run; 2 case studies live; probe deployed; 4+ guest posts placed; SAL-411 shipped; citation tracker baselined.
- Retainer arithmetic (each retainer starts at that install's month 4): the first $4–8K/mo retainer goes live around day 100–120; **$12–24K/mo MRR by month 6** if the three installs close on the stagger. There is no MRR target inside the first 90 days — installs and sprints carry the quarter.

**12-month shape (directional, not a commitment):** if the 90-day motion holds, $500K–$1M booked across installs, sprints, retainers, and 1–2 FGO accounts; 8–12 retained accounts; a citation footprint the tracker can graph. The retainer stack is the compounding line; installs are the acquisition events.

## F. What we deliberately do NOT do

- No new verticals, no new site surfaces, no new tools while P0–P2 are open (ship-before-build).
- No selling the AI. The receptionist tech is a commodity ($99/mo SaaS; native in Jobber/Podium/Weave). We sell the installed system, the accountability, the month-to-month terms, and the proof.
- No competing on the GEO label. We sell the niche diagnostic and the outcome; "GEO" stays in the second clause (ICP language rules).
- No paid spend before tracking + compliance + proof (the ads docs' own rule).
- No volume SEO, no rankings promises, no fabricated anything.
- No discounting below floor. The audit does the declining.

## G. Risks and pre-commitments

| Risk | Signal | Pre-committed response |
|---|---|---|
| Founder hours drift back to building | Call log empty for 3 consecutive days | Weekly review flags it red; the only allowed build work is P0 leftovers |
| Beautiful Smiles slips or dies | No decision by day 14 | Doesn't change the system — lanes P2/P3 are the strategy; the deal is upside |
| Close rate under 15% at week 6 | Re-baseline data | Diagnose stage-by-stage (booked→show→letter→close); fix the weakest stage, don't add volume |
| Delivery crowds out selling after closes | Install work eats call blocks | The weekly template reserves a real daily delivery block (05 §A); capacity N enforced; installs staggered (1 in month 1); agents carry the deliverable work they can (content foundations, build tasks, reporting) |
| Industrial demand doesn't validate | Reply <2% and zero Growth Calls by week 3 | Pre-committed: shrink the lane to LinkedIn-only while the authority engine builds; re-angle the offer before re-testing (P3 gate) |
| Deliverability burn (industrial lane) | Reply rate <1% or complaint >0.1% | Pause sends, shrink batches, re-warm; LinkedIn carries the lane meanwhile |
| RE window narrows (native AI receptionists) | Prospects say "Jobber does this" | Sell the system + accountability + report; the objection card exists (RE1/C1 pattern); revisit positioning at day 90 |
| Authority engine starves (agents produce, founder never publishes) | Sanity drafts pile up unpublished | Publishing is a scheduled founder block (Wed); review counts shipped, not drafted |
