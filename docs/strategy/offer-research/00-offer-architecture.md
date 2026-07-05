# 00 — Offer Architecture (Canonical)

**Status:** DRAFT for founder sign-off. Nothing here ships to a page without explicit approval. All copy-adjacent lines are marked **GATE:HUMAN**.
**Date:** 2026-07-05
**Owner:** Artur (decisions) / this doc (spec of record once signed)

## 0. Ground-truth note — read this first

The repo files referenced in the brief were not reachable from this session, so ground truth was rebuilt from two sources: **(a)** a full crawl of salesolution.net on 2026-07-05 (hub, all 12 service/cylinder pages, revenue-engine pillar + dentists, all 4 industry pages, all 5 landing pages, tools, case studies), and **(b)** the working sessions where the Revenue Engine spec, rate card, and per-service tiers were built (June 23 spec: 5-step engine, rate card, verbatim guarantee, anti-personas; May 25 session: per-service tier economics and the $300/hr floor analysis). The two together cover everything the migration table needs. Items that must still be verified against the repo before sign-off are listed in §15. The approved ROI stats (2.5x-in-12-months, 5.2x-lifetime) are taken as given from `lib/stats.ts` per the brief; 2.5x is confirmed live on the homepage and /services/ai-seo/ proof bars; 5.2x-lifetime was not found deployed anywhere on the live site — it is approved inventory, currently unused.

Ahrefs CPC/demand pulls were skipped (tool approval not granted mid-run). Sub-niche qualification in §10 is built on unit economics from the live calculators plus sourced market pricing instead; a CPC pass is an optional follow-up, not a blocker.

---

## 1. The doctrine, applied

Weiss's system, compressed to what governs every page and proposal here:

**Fee = f(improved condition), never f(effort).** The formula is (tangible outcomes × annualization + intangible outcomes × emotional impact + peripheral benefits) ÷ fee = ROI, with the fee fixed and the ROI kept dramatic — "if you must use a formula, fix it at 20:1 or better; 10:1 is just fine" [S1, S2]. The buyer stipulates the value; we never announce it to them. Sequence is non-negotiable: **objectives → measures of progress → value → then fee.** Options escalate by value, not scope, built backward from the stipulated number (option 1 ≈ 20:1, each next option +20%, +10–20% for uniqueness) [S2]. Retainers are **access to the operator + ownership of a compounding condition**, sized on Weiss's three retainer variables — who has access, scope of access, response time [S3] — never a monthly task bundle.

**How "a done deal with an obvious ~10x return, fast" is constructed without hype.** The 10x is never a claim on a page. It is a *structural property of the fee*: because the fee is set at roughly one-tenth of a 12-month value the buyer themselves stipulated during the audit or call, the ROI is arithmetic they already agreed to before they ever saw a price. Three load-bearing parts, all already live in embryo:

1. **Mechanism** — the 5-step engine (Capture → Respond → Book → Recover → Prove) and the two-lines report. The buyer can see *why* the money appears and *where* it will be counted.
2. **Arithmetic in their numbers** — the vertical-page calculators and the audit/call walkthrough put *their* average case, *their* missed-call rate, *their* quote backlog into the model. Weiss: the buyer tells you the value; you don't tell them [S4].
3. **Risk reversal** — day-90 guarantee against the system-driven line (book-jobs) or published prices + 48h SOW + week-4 work shown + exits (sell-product). "Not buying is the expensive choice" is then a fact the calculator displays ("Do nothing and $398,200 leaks"), not a pressure line.

The only ROI proof permitted in copy: **2.5x average ROI in 12 months** and **5.2x lifetime ROI** (`lib/stats.ts`). The 2.5x is aggregate engagement proof, which is exactly the right register — it reads as an audited average, not a promise. Note the deliberate gap: our *fee math* targets ~10:1 on stipulated value; our *published proof* says 2.5x on total investment including media. Never bridge that gap in copy; the buyer's own calculator output is what makes their specific case read as ~10x.

---

## 2. The canonical ladder — one spine, two motions

```
                       ┌──────────────────────── SELL-PRODUCT MOTION ────────────────────────┐
                       │  voice: engineering, published prices, no outcome guarantee          │
 ENTRY DOORS           │  CTA: Book a Growth Call                                             │
 (free, value convo)   │                                                                      │
 ┌──────────────────┐  │   ┌────────────────┐   ┌──────────────────────┐   ┌───────────────┐ │
 │ Growth Call 15m  │──┼──▶│ CYLINDER SPRINT │──▶│ ENGINE INSTALL       │──▶│ OPERATOR      │ │
 │ Growth Audit 24h │  │   │ per-cyl band,   │   │ from $30K one-time,  │   │ RETAINER      │─┼─▶ FGO
 │ Catalog Snapshot │  │   │ $6–35K, 4–6 wks │   │ scaled to value,     │   │ cylinders     │ │  from $20K/mo
 │ AI-vis calculator│  │   │ 100% credits to │   │ ~90 days             │   │ $4–15K/mo ea. │ │  Shape A/B
 └──────────────────┘  │   │ install ≤90 days│   └──────────────────────┘   └───────────────┘ │
                       └───┴─────────────────┴──────────────────────────────────────────────-┘

                       ┌──────────────────────── BOOK-JOBS MOTION ───────────────────────────┐
                       │  voice: first-person operator, model published / number in audit,    │
 ┌──────────────────┐  │  CTA: Revenue Leak Audit, day-90 guarantee                           │
 │ Revenue Leak     │  │   ┌──────────────────────────────┐   ┌───────────────────────────┐  │
 │ Audit ~20 min    │──┼──▶│ ENGINE INSTALL               │──▶│ OPERATOR RETAINER         │──┼─▶ FULL ENGINE
 │ (their numbers,  │  │   │ from $30K one-time, scaled;  │   │ month 4+, access + system │  │  (+ media mgmt,
 │  theirs to keep) │  │   │ installed by day 60,         │   │ ownership; system line    │  │  + expansion,
 └──────────────────┘  │   │ proving by day 90;           │   │ must clear the fee        │  │  multi-location)
                       │   │ includes first 90 days' op   │   └───────────────────────────┘  │
                       └───┴──────────────────────────────┴─────────────────────────────────-┘
```

**The spine is: door → install → retainer → top tier.** Everything else folds into it:

- **Per-service ladders become cylinder entry doors.** The AI Search Sprint, Outbound Pilot, Editorial Pillar Pack, and Build Sprint are no longer parallel offers; they are "prove it on one cylinder" doors whose fee **credits 100% toward the engine install if taken within 90 days** (§11, D7). Their pages keep their published bands.
- **The base+cylinders model and the Sprint/Retainer/FGO model stop coexisting as rivals.** Base+cylinders IS the spine; Sprint/Retainer/FGO is how a *single cylinder* is bought before or alongside it. One diagram, told the same way on every page.
- **Book-jobs has no separate "cheap" ladder.** The old rate card ($2,997–4,997/mo + setup) is retired as a public anchor and survives only as the internal floor for the month-4+ Operator Retainer (§10, D4).
- **The install is never a commodity SKU.** "From $30K" is a floor with a published scaling *principle* ("scaled to the value at stake — your exact number comes out of the audit, in writing, the same day"), never a menu price. What's *inside* the install per motion is specified in §8 so the comparison to setup-fee vendors never starts.

**Numbers on pages, one line:** hub shows the model + floor + bands; pillar shows model only; vertical pages show model + calculator + floor; cylinder pages show their own sprint/retainer band (sell-product) or no numbers (book-jobs); product pages (Catalog AI) show full per-SKU math; the exact install fee and the exact retainer number appear **nowhere** — they exist only in the same-day written rate (book-jobs) or 48h SOW (sell-product). Full matrix in §9.

---

## 3. Value-based fee mechanics — the fee fraction, per ICP

### 3.1 The improved-condition math (why the fee scales)

The condition we sell is not "more leads." It is: *recovered and new revenue this year* + *what the business is now worth* + *the owner's time and certainty*. All three go into the value conversation; the fee anchors to the total.

**Enterprise-value arithmetic (sourced, for internal use and for the value conversation — numbers themselves are GATE:HUMAN before any page use):**

| ICP | EBITDA multiple band (2025–26, lower-middle-market) | Source |
|---|---|---|
| Industrial distributor, $1–3M EBITDA | ~6.4x (rising to 8.9x at $3–5M, 11.4x at $5–10M) | FirstPageSage distributor report, Q1 2025 [S5] |
| Home services / roofing / HVAC | ~4–6x; 52 named PE platforms actively buying | CT Acquisitions 2026 benchmarks + platform map [S6, S7] |
| Dental — general | 3.5–5.5x (65–85% of collections); specialty 5–7x; DSO platform 9–11x | CT Acquisitions dental playbook 2026; FOCUS Bankers 2026 [S8, S9] |
| Cash-pay medical aesthetics / derm | trades above insurance-dependent healthcare; healthcare services PE median 13.5x (platform-level) | Praxis Rock / PCE 2025 data [S10] |
| Middle-market composite | 7.2–7.5x (GF Data, PE deals); 9.8x avg all-type (Capstone 2025) | [S10, S11] |

Worked example for the value conversation, dental cosmetic (uses the live calculator's own conservative defaults): audit models **$205,080/yr recovered** on a $5,000 average case. At ~60–70% marginal flow-through on recovered production, that is roughly **$125–145K of EBITDA**, which at even the general-dentistry 3.5–5.5x band is **$440–790K of enterprise value created** — on top of the cash. The owner stipulates these numbers during the audit; we only supply the multiple band with its source. Same structure for a distributor: an $8M distributor at ~8–10% EBITDA sits near $640–800K EBITDA; a modeled $600K revenue gain at ~30% contribution adds ~$180K EBITDA → **$1.1–1.6M of EV at 6.4–8.9x** [S5]. This is how a $30K–$60K fee is made to *read small without a single hype word*.

### 3.2 The fee fraction rule (the value-scaling rule the ladder publishes as a principle)

**RULE (internal, canonical):**

- **Install fee = max( $30K , ~10% of the audit/call-modeled 12-month tangible gain ).**
- **Year-one engagement total (install + months 4–12 retainer) ≤ ~15% of the *stipulated* first-year value** (tangible + intangible + peripheral, annualized). Never above 20%.
- **Retainer (book-jobs) is additionally bound by the guarantee test:** the system-driven line must clear it monthly. If the modeled recovery can't clear a $4K/mo retainer with room, the account is priced down or qualified out — the guarantee makes over-pricing self-punishing, which is exactly why it's credible.
- **A $40M distributor and an $8M distributor never pay the same install.** Applied: modeled 12-month gain $600K → install $60K; gain $3M → install $150K+ (and the conversation moves to FGO). Modeled gain $250–300K → install sits at the $30K floor. Below that → not an install client (see §10).

This is Weiss's step-4-through-6 made operational: work backward from stipulated value at a conservative return, then ladder the options up by ~20% each and add 10–20% for uniqueness (the two-lines dashboard, the dispute-proof log, and the named-operator model are the uniqueness premium here) [S2].

### 3.3 What the fraction produces at each ICP (reference table, internal only)

| Buyer | Modeled 12-mo tangible gain (audit output) | Install | Month-4+ retainer | Year-one total | Year-one total vs stipulated value* |
|---|---|---|---|---|---|
| Solo tradesman, $400 avg ticket | <$150K | — (qualify out) | — | — | fails 10:1 at floor |
| 2–3 crew roofer, $12K avg job | $300–500K | $30–50K | $4–6K/mo | $66–104K | ~8–4:1 cash; >10:1 with EV |
| General dental, $1.5M collections | $150–250K | $30K only if ≥$250K modeled | $3–4K/mo | $57–66K | borderline — qualify hard |
| Cosmetic/implant dental | $400K–1M+ | $40–100K | $5–8K/mo | $85–170K | ~10:1+ incl. EV |
| Med-aesthetics multi-provider | $300–800K | $30–80K | $4–7K/mo | — | ~10:1 incl. EV |
| Distributor $8M | $500K–1M | $30–60K (floor–scaled) | cylinders $8–14K/mo | $100–185K | ~10:1 only with EV in the convo |
| Distributor $40M | $2–5M | $80–200K | cylinders/FGO $15–35K/mo | $250K+ | 10–20:1 |

\* "Stipulated value" = tangible gain + EV effect + intangibles the buyer names (owner hours, dispute protection, sale-readiness). The table is why the EV line **must** be in every value conversation for the fee to be Weiss-clean: on cash alone, mid-size accounts run 3–5:1 in year one, which is defensible but not "obvious."

---

## 4. The three-options proposal — Weiss's choice of yeses, per motion

Options are named by the **condition each buys**, escalate by **value and access** (Weiss's retainer variables: who has access, scope, response time [S3]), and are built backward from the buyer's stipulated number. Every proposal shows all three; the middle option is the designed default. Option names below are working names — **GATE:HUMAN** before any of them touch a proposal template or page.

### 4.1 Book-jobs (delivered in writing, same day as the Revenue Leak Audit)

| | Option 1 — **"Sealed"** | Option 2 — **"Sealed & Fed"** (default) | Option 3 — **"Owned"** |
|---|---|---|---|
| The condition you're buying | No sale lost to a missed call or a dead quote. The system-driven line visible on your report every month. | The leak sealed **and** demand pointed at your door: map-pack presence and paid demand at cost, converting through the sealed system. | The whole machine, with the operator's hands on it: growth handled, owner out of marketing operations. |
| What's inside | Engine install (Respond, Book, Recover, Prove) + 90 days of me operating it + the guarantee | Option 1 + Bring cylinders (Local SEO & Maps, GBP program) + media management on your account at cost | Option 2 + database reactivation program + review-velocity engine + quarterly re-aim + priority access |
| Access (the Weiss variable) | Monthly report call | + direct line during install, 1-business-day response | + same-day response SLA, your office manager and partner both have my number |
| Fee shape | Install (floor $30K, scaled per §3.2), retainer from month 4 | Install +20–25% over Option 1; retainer includes media mgmt line | Install +20–25% over Option 2; retainer priced to the maintained condition |
| Guarantee | Day-90 guarantee, verbatim current wording | Same | Same |

### 4.2 Sell-product (delivered as the written SOW within 48h of the Growth Call)

| | Option 1 — **"Proof on one cylinder"** | Option 2 — **"The engine installed"** (default) | Option 3 — **"Full Growth Ownership"** |
|---|---|---|---|
| The condition | The mechanism demonstrated on your own catalog/category, in your stack, inside 6 weeks. | One accountable system: base installed, first two cylinders firing, both revenue lines on your report by week 12. | The growth function owned: weakest cylinder re-aimed every cycle without you in the loop. |
| What's inside | The relevant cylinder sprint at its published band (fixed scope, artifacts transfer) | Engine install (floor $30K, scaled) + two cylinders quarter one under Operator Retainer | Shape A (from $20K/mo, 6-mo min) or Shape B (from $12K/mo, 3-mo min), per current FGO page |
| Bridge | **100% of the sprint fee credits toward Option 2 within 90 days** (D7) | Cylinders added "as they pay for themselves" | — |
| Access | Executive readout | Direct Slack to operator, monthly outcome reviews | Embedded: your leadership meetings, your dashboards |
| Risk reversal | Sprint's own terms (Constraint Sprint keeps its week-1 diagnostic refund) | 48h SOW, week-4 work shown, 90-day exit, artifacts transfer | 30-day exit after minimum, written quote in 24h |

Weiss's pricing ladder applies inside each proposal: Option 1 is set near ~20:1 on the stipulated value, Options 2 and 3 step up ~20% each plus the uniqueness increment [S2]. The buyer's question stops being "should we hire?" and becomes "which condition do we want?"

---

## 5. The value-conversation scripts — the doors already are Weiss's sequence

The two doors need almost no restructuring; they need **discipline about when the number lands**. Both scripts below map to what the live pages already promise, beat for beat.

### 5.1 Revenue Leak Audit (~20 min) → same-day written rate + three options

1. **Objectives (min 0–4).** "Before I show you anything — what does a good year look like, in booked jobs or production dollars? And what's the thing you'd stop worrying about if it worked?" (Second question harvests the intangibles: owner hours, storm-season chaos, front-desk stress. Write their words down; they return in the proposal verbatim.)
2. **Measures (min 4–12).** The audit walkthrough as built: missed-call count, real response time, GBP state, quote/treatment-plan follow-up gap. Each metric is named as *the number we'll move* — these become the measures-of-progress column in the proposal.
3. **Value (min 12–18).** The calculator with **their** figures replacing the defaults. Beat A: the leak total ("do nothing and $X leaks over 12 months"). Beat B: conservative recovery. Beat C — **the EV line, new**: "and for a practice/company like yours, recovered production of $X a year is worth roughly N× that if you ever sell — that's the band buyers pay in your sector" (§3.1 source cited verbally). Then the stipulation question, Weiss's hinge: **"Does that number feel conservative to you?"** The buyer says yes — they set it, we didn't.
4. **Fee (post-call, same day, in writing).** Never on the call. If pressed: *"The model's published on the page. Your exact number comes out of what we just measured — you'll have it in writing today."* (Matches live copy: "in the audit, in writing, the same day.") The written rate arrives as the §4.1 three options, each referencing their stipulated numbers and their own intangible words.

### 5.2 Growth Call (15 min) → 48h written SOW + three options

1. **Objectives (min 0–2).** As built ("the one constraint") plus one added dollar question: "what does removing it need to be worth over 12 months for this to be an obvious decision?" Their number, on record.
2. **Measures (min 2–10).** The live URL walkthrough as built — schema completeness, AIO citation gaps, category revenue exposure. Each finding is tied to the metric that will show progress.
3. **Value (min 10–13).** "The one highest-payback change" beat, extended with the same stipulation move: size the 12-month effect of that change in their revenue terms, add the EV band for owners with an exit horizon ($1–3M-EBITDA distributors: ~6.4x [S5]), ask if the number is conservative.
4. **Fee (min 13–15 + 48h).** Honest fit-check as built; the SOW lands within 48h carrying the three options of §4.2, the stipulated value at the top, the fee beneath it — Weiss's order preserved on paper even though the call ends before pricing.

**One discipline rule for both doors:** if value could not be stipulated (buyer won't give numbers, audit data too thin), no proposal goes out — a shorter "here's what we'd need to measure first" note goes instead. A fee without a stipulated value is how the offer collapses back into a commodity.

---

## 6. The install → retainer bridge — designed inevitability, not an upsell

The retainer must be *decided at day 0 and earned by day 90*. The mechanism:

- **Day 0 (SOW/rate letter).** The month-4 retainer number is **in the install document**, framed once and permanently: *"The install includes 90 days of me operating the system. From month 4, the only question is whether the second line on your report justifies keeping me on it — that number is $X/mo, and the report will answer it before I do."* No surprise, no re-open, no negotiation event later. The retainer is defined as **continued access to the operator (response SLA, direct line) + ownership of a compounding system (the dashboards, sequences, and review velocity keep improving)** — never a task list. Anti-line-item clause in every SOW: the retainer has no deliverable menu, deliberately; it maintains and grows a condition.
- **Day 45 — the first two-lines report (partial) + a one-paragraph "what I'd re-aim next" note.** Purpose: demonstrate the *judgment* being retained, not just the plumbing installed. This is the retainer's sales document and it costs nothing extra to produce.
- **Day 60 — install-complete walkthrough.** The written punch-list from the SOW is checked off item by item (this is also the install's risk-reversal artifact, §11). The operator frame lands here, once, plainly: *"The machine is in. Machines drift without an operator — response times creep, reviews stall, sequences go stale. Months 1–3 you had one included."* Cylinder expansion is offered only in the live FAQ's existing frame: **"we add cylinders as they pay for themselves"** — the day-60 report names the single cylinder with the best payback case, with its expected line on the report.
- **Day 90 — guarantee settlement.** The system-driven line vs the fee, on their dashboard, in their numbers. Two outcomes: line clears fee → retainer begins with the fee already justified by a visible line item (cancelling now means switching off a line they watched exceed the cost); line doesn't clear → the guarantee executes exactly as written and the retainer conversation waits until it does. Either way the guarantee's honest test **is** the bridge — it converts the retainer from "another agency bill" into "the number the second line already covers."
- **Month 4+ ritual.** Quarterly re-aim (already live on the pillar: "read the two lines, re-aim the weakest cylinder"). Each quarter's re-aim memo doubles as the retainer's ongoing justification and the natural moment for the next paid-back cylinder.

Sell-product runs the same skeleton with its own artifacts: week-4 work shown (already promised on the industrial page), day-60 = install complete + first citation-share movement, day-90 = both revenue lines on the report; retainer = Operator Retainer per cylinder, expansion by the same "pays for itself" rule; no guarantee — the 90-day exit is the symmetric pressure (they can leave, so staying is a monthly re-decision the report keeps winning).

---

## 7. Two months vs three — recommendation: **60-day install inside the 3-month engagement**

**Recommendation:** Keep the 3-month minimum and the day-90 guarantee untouched. Compress the *install* to 60 days on book-jobs and say so: **"Installed by day 60. Proving by day 90."** Sell-product base install stays at ~90 days (catalog/schema/citation cycles genuinely need it); its momentum device is already the cylinder sprint (4–6 weeks) and week-4 work shown.

**Why this is the right split (evidence + operational logic):**

- The response/booking/recovery layers are fast by nature — the live home-services FAQ already says first automations are live "within the first couple of weeks." Nothing in Respond/Book/Recover requires 90 days; holding them to a 90-day install narrative under-sells our actual speed.
- The layers that *can't* prove in 60 days are exactly the ones the guarantee window covers: paid media needs its 4–6-week learning period (Google's own evaluation-window guidance for PMax; bid strategies take up to ~3 weeks or 1–2 conversion cycles to calibrate) [S12, S13], and SEO/GBP moves on a 3–6-month curve (Google's own 3–4-month guidance; 2026 practitioner data) [S14, S15]. A 60-day *engagement* would orphan the day-90 guarantee and force us to prove during learning-phase noise. A 60-day *install* inside a 90-day proving window aligns the promise with how the platforms actually behave.
- Perceived momentum: "installed by day 60" gives the concentrated-install feel the brief wants, and the day-60 install-complete walkthrough (§6) becomes a hard, checkable event — tighter than the current soft "~90 days."

**What must move to make 60 credible (scope changes):** GBP/local-page work starts day 1, not after the response layer (it has the longest lag); media, when included, launches by day 14 so the learning period burns inside the window [S12]; the two-lines dashboard ships at day 30 in partial form (it currently reads as an end-state artifact); the audit's calculator numbers pre-load the SOW so day 0 already carries the baseline; and anything genuinely 90-day by nature (deep PMS integrations, multi-location rollouts) is explicitly scoped as post-install retainer work, not install scope. **What drops from install scope:** nothing is deleted; slow-curve items are re-labeled as "proving-window" or "retainer" work so the day-60 punch-list contains only checkable installs.

**Interaction with the guarantee and minimum:** unchanged and now cleaner — install (60) < guarantee (90) = minimum (3 months). The guarantee settles on a system that has had 30 days of full operation, which is also the honest minimum for the system-driven line to mean anything.

---

## 8. The commodity baseline — what we position against (never price from)

Internal reference only. **Competitor and platform names below never appear in copy** (existing policy). The point of this table is (a) to know what number is in the buyer's head, and (b) to define what must be *inside* our install so the comparison never starts.

| Commodity pool | Setup / one-time | Monthly | Source (2025–26) |
|---|---|---|---|
| GHL-style local operators (home services, dental) | often $0–2K | $297–2,500/mo; "HVAC, roofing, dental: $500–2,000/mo is normal" | GHL agency pricing guides, June 2026 [S16]; platform itself $97–497/mo [S17] |
| SEO agencies (broad market) | — | 64% charge <$1,000/mo; only 2% >$5K/mo | SE Ranking survey of 260 agencies, 2025 [S18] |
| SMB full-service retainers | onboarding $500–3K, or 50–100% of month 1 | median $5–8K/mo (Clutch 2025 median B2B SMB $5–10K; single-channel avg $4.8K, multi-channel $9.2K) | Searchlab 2026 compilation of Clutch/AgencyAnalytics [S19]; Scopic 2026 [S20] |
| Mid-market agencies | — | $10–25K/mo | [S19] |
| Fractional CMO | — | ~$7.5K/mo average; $8–25.5K range | Whatagraph aggregation [S21] |
| Our own published anchor (live hub) | — | "You already spend $15–40K a month on agencies" | salesolution.net/services/, 2026-07-05 |

**Read of the field:** the buyer's reference points cluster at **$500–2,000/mo (book-jobs)** and **$5–10K/mo (sell-product SMB)**, with setup fees under $3K nearly everywhere. A "$30K setup" parsed in that frame looks 10–60× the market. So the install must be constitutionally *unparseable* as a setup fee. Two moves accomplish that:

1. **Category language.** The install is "the engine, installed once" — a capital asset with a punch-list, an owner's manual, and transfer-on-exit terms — never "onboarding," "setup," or "month one." The word "setup" is banned from install contexts (it survives only in the legacy exit-terms sentence until migrated).
2. **Contents no commodity vendor ships** — this is the §-2 answer to "what must be IN the install per motion":
   - *Book-jobs install:* the dispute-proof lead log (every call recorded + classified); the two-lines attribution dashboard wired to *their* dashboard, not our spreadsheet; signed BAAs across the stack (dental) — a compliance artifact GHL operators almost never produce; brand-voice-trained response scripts with the human-reachable rule; the written day-60 punch-list; the keep-your-assets exit clause (ad account, data, Google profile — already live); and 90 days of named-operator operation *included*. 
   - *Sell-product install:* the base measurement layer (both revenue lines instrumented before any cylinder fires); schema/feed foundation at catalog level; the citation-tracking baseline vs named competitors; SOW-grade scope documents per cylinder; artifacts-transfer terms; week-4 work-shown checkpoint.
   
   Every one of these is (a) genuinely valuable, (b) checkable at day 60, and (c) absent from the $500–2,000/mo pool — which is what makes "can't I get this for $1,500 a month?" answer itself.

---

## 9. Price-model reconciliation — the transparency vs commoditization tension, resolved

**The tension, stated honestly:** published prices are the trust signal that de-risks an agency-burned buyer (and the live site's strongest differentiator: "Published model. No games on a call."). Weiss says published bands turn you into a comparable [S1]. Both are right about different layers of the ladder.

**The synthesis (recommended, matches the brief's hypothesis with one sharpening):**

> **Published numbers survive only where they are entry doors or honesty artifacts. Value-priced numbers exist only downstream of a value conversation. No number may be both.**

- **Entry doors keep hard published prices:** cylinder sprints/pilots per their own bands, Catalog AI per-SKU math, the $500 single article. These are deliberately comparable — they're how a skeptic buys proof.
- **Honesty artifacts keep published *structure*:** the cylinder monthly band ($4–15K/mo each), the FGO floors (from $20K / from $12K Shape B), the terms (3-month minimum, exits, zero markup), and the calculators. Structure published, totals never.
- **The install and FGO are value-priced with a published floor + scaling principle:** "from $30K, scaled to the value at stake — your number comes out of the audit/call, in writing." The floor self-qualifies; the principle tells the buyer *why* two companies pay differently, which is itself a trust signal ("they price to my situation") rather than a games signal.
- **The exact fee never appears on any page**, in any FAQ, or on any call before value is stipulated. It exists in exactly two artifacts: the same-day written rate (book-jobs) and the 48h SOW (sell-product).

### 9.1 The page-type number matrix (canonical — this table decides every future page)

| Page type | Model/diagram | Floor lines | Bands | Exact numbers | Calculator | Guarantee |
|---|---|---|---|---|---|---|
| **Hub** (/services/) | full ladder diagram | install "from $30K, scaled"; FGO "from $20K" | cylinders $4–15K/mo; combo table (harmonized) | never | no | no (links to motions) |
| **Pillar** (/revenue-engine/) | full 5-step model | none (unchanged) | none | never | no | present as principle, links down |
| **Vertical/niche** (dentists, home-services, med-aesthetics, contractors-when-built) | model applied to trade | **NEW:** "Installs start at $30,000, scaled to what the audit finds" (D3, GATE:HUMAN) | none | never — "in the audit, in writing, same day" | yes — re-anchored (D12) | yes, verbatim day-90 |
| **Industry (sell-product)** (industrial-distribution, consumer-brands) | model + engine pricing block | install floor + FGO floor | per-cylinder rule sentence (see 9.2) | never | optional | never (motion rule) |
| **Cylinder page — sell-product** (ai-seo, catalog-ai, editorial, outbound, webdev) | own ladder as entry door | own sprint band + own retainer band + credit line (D7) | yes (their own only) | never | tools where built | never |
| **Cylinder page — book-jobs** (answer-and-book, local-seo-maps, recover-reactivate, reviews-reputation, conversion-cro, paid-acquisition) | leak → mechanism | none | **none** (unchanged) | never | no | link to vertical page's guarantee |
| **Product page** (Catalog AI table, Snapshot) | tiers | minimums ($3K / $25K) | full per-SKU math | yes — this is the one page type where the whole price is public | readiness tool | never |
| **Doors** (audit, growth call, snapshot pages) | what happens, beat by beat | none | Sprint referenced at its own band only | never | no | door-level only (Sprint week-1 refund) |

### 9.2 The Sprint-band conflict — resolved by a per-cylinder rule

Live today: **$12–24K** (AI Search Sprint, on /services/ai-seo/, /book-growth-call/, /constraint-sprint/), **$9K–$35K** (generic "Sprint" in the industrial-distribution FAQ), **$15–35K** (Build Sprint, webdev page). Also inconsistent: Operator Retainer "$8–14K/mo" (ai-seo) vs "$4K–$15K/month" (ind-dist FAQ) vs cylinders "$4–15K/mo" (hub).

**Rule (canonical): there is no generic Sprint price. Each cylinder publishes its own sprint band and its own retainer band on its own page; every cross-reference states the rule, not a range.**

- Canonical per-cylinder sprint bands (as live/analyzed): AI Search Sprint $12–24K · Build Sprint $15–35K · Outbound Pilot $9–14K · Editorial Pillar Pack $6–14K · Catalog AI by per-SKU minimums.
- Canonical cross-reference sentence (**GATE:HUMAN**): *"Any cylinder can run first as a fixed-scope sprint — each cylinder's page shows its band ($6K–$35K depending on the cylinder) — and the sprint fee credits toward the engine install."*
- Canonical retainer sentence: *"Cylinders run $4–15K/month each; each cylinder's page shows its own band."* (The hub's $4–15K stands as the envelope; ai-seo's $8–14K stands as that cylinder's band; the ind-dist FAQ is rewritten to the rule.)

---

## 10. Book-jobs pricing disclosure — the rate card vs the $30K floor

**Current state:** model published, number withheld ("in the audit, in writing, the same day") — already Weiss-shaped. The internal rate card (~$2,997–4,997/mo + $2.5–3.5K setup, FL/CA split) is far below the core-offer floor, and the live dental calculator *illustrates* "$2,500/mo" — an anchor that actively fights the $30K+ install.

**(a) Does the book-jobs install move to $30K+? Yes — where the calculators' own math supports it, with hard qualification elsewhere.** Applying §3.2's rule (install ≈ 10% of modeled 12-month recovery, floored at $30K):

- **Clears the floor comfortably:** cosmetic/implant dental (live calculator: $205K/yr recovered on conservative defaults → and that's the *conservative* preset; typical case mix models $300–500K), multi-crew roofing/HVAC with $8–15K average tickets (three recovered jobs a quarter ≈ $100–180K/yr), med-aesthetics with package LTVs. These verticals get the $30K+ install as the only engine offer.
- **Borderline:** general-dentistry/hygiene-heavy practices under ~$1.5M collections; single-crew contractors with mid tickets. Rule: the audit's modeled recovery decides — ≥$250–300K models to the floor install; below it, decline the install rather than discount it.
- **Fails:** solo tradesmen, low-ticket service calls. Already anti-personas in spirit ("businesses wanting cheap shared leads"); this makes it arithmetic. **The legacy $3–5K/mo + setup shape is retired as an acquisition offer** — it survives only as (i) the internal floor for the month-4+ Operator Retainer and (ii) a grandfathering reference for any accounts sold on it.
- Optional follow-up (not blocking): an Ahrefs CPC pass per sub-niche to confirm which trades' customer-acquisition markets are expensive enough to make the recovered-demand math obvious (high CPC ⇒ every recovered lead is provably expensive to replace).

**(b) Show a floor? Yes.** Add one line to the vertical pages' pricing block, directly under "Published model. No games on a call.": **"Installs start at $30,000, scaled to what the audit finds." (GATE:HUMAN)**. Placement matters: the calculator sits *above* the pricing block on those pages, so the buyer meets the floor only after seeing six figures of their own leak — the floor reads small in that order. Self-qualification without collapsing the fee into a comparable: the *number* they'd comparison-shop still doesn't exist. Trade-off owned in D3.

**Calculator re-anchor (D12):** the illustrative "$2,500/mo" line is replaced with install-frame math: *"If the install runs $30,000, the recovered work above covers it in the first N cases — and the month-to-month fee after that has to clear the second line on your report, or I work free until it does."* (**GATE:HUMAN**; N computed live from their inputs.)

---

## 11. Risk-reversal architecture — per motion

**Book-jobs.** The guarantee's wording stays verbatim — it is the best sentence on the site and it already carries the mechanism ("counted in your own dashboard, not my spreadsheet"). What changes is coverage *around* the install, because a $30K+ one-time fee is the new locus of perceived risk:

1. **Staged install billing tied to the punch-list:** 50% at signature / 25% at day-30 dashboard-live / 25% at day-60 install-complete walkthrough. The buyer never has more money out than installed system in. (Weiss favors full-upfront with a discount [S2]; offer that as the alternative — "or 100% at signature, minus 5%" — so the stage plan reads as accommodation, not doubt.)
2. **The written day-60 punch-list** in the SOW: every install item checkable, the walkthrough scheduled at signing. This is the install's guarantee-equivalent — a completion warranty rather than an outcome warranty, which keeps the outcome guarantee exclusively on the system line where it's honest.
3. **Existing exits stand:** 3-month minimum, month-to-month after, keep-your-assets clause. No refund guarantee on the install (misaligned incentives; and the motion rule reserves outcome promises for the system-attributed line only).
4. Guarantee sentence unmodified; the FAQ answer already ties it to the day-90 settlement (§6).

**Sell-product (guarantee banned).** The equal-weight stack, mostly live, now made systematic: published floors and per-cylinder bands (the price *is* the risk reversal for an agency-burned buyer); written diagnostic in 24h; SOW in 48h with out-of-scope named; **work shown in week 4** (live on the industrial page — promote it to every cylinder page's "what happens after you book" strip); artifacts transfer in editable form; 90-day exit / 30-day after minimum; Constraint Sprint's week-1 diagnostic refund stays (it warrants the *diagnosis*, not the outcome — motion-consistent).

**The pilot-credit mechanic — adopt (D7).** *"Any cylinder sprint or pilot credits 100% toward the engine install within 90 days."* Assessment: it converts the cheapest published door into a deposit on the spine, makes the sprint a fraction of the install rather than an alternative to it, and it prices the skeptic's caution at $0. Costs: a fully-credited sprint compresses install margin by the sprint amount (acceptable — the sprint already carried $300+/hr economics, and the credited path is the *designed* path); and some straight-to-install buyers will detour through the slower sprint (mitigate: every sprint readout ships with the full three-option proposal, and Option 2's math shows the credit already applied). Guard-rails: credit expires at 90 days, applies to install fee only (not retainer), one credit per client.

---

## 12. Decisions needed (each: recommendation + the trade-off in one line)

| # | Decision | Recommendation | Trade-off (one line) |
|---|---|---|---|
| D1 | One spine (door → install → retainer → FGO); per-service ladders fold in as cylinder entry doors | Adopt | Simpler story and cross-sell logic, but every page touching pricing needs the §13 migration pass at once, not gradually. |
| D2 | Value-scaling rule: install = max($30K, ~10% of modeled 12-mo gain); year-one ≤ ~15% of stipulated value | Adopt | Bigger fees on bigger accounts, but the audit/call must now produce a defensible modeled number every time — no number, no proposal. |
| D3 | Publish "Installs start at $30,000, scaled to what the audit finds" on book-jobs vertical pages | Yes | Filters out sub-floor volume (intended) at the cost of scaring some borderline mid-market before they run the calculator. |
| D4 | Retire the $3–5K/mo + setup rate card as an acquisition offer; it becomes the internal month-4+ retainer floor | Adopt | Cleaner premium position, but any live pipeline sold on the old card needs a grandfather note before pages change. |
| D5 | "Installed by day 60, proving by day 90" on book-jobs; sell-product base install stays ~90 days | Adopt | Stronger momentum claim, but day-60 becomes a hard, checkable deadline — a missed punch-list now visibly costs credibility (and stage-3 billing). |
| D6 | Per-cylinder sprint/retainer band rule; kill the generic $9–35K band | Adopt | Consistency across pages, but the ind-dist FAQ loses its one-line "all three shapes" simplicity and needs the rule sentence instead. |
| D7 | 100% sprint-fee credit toward install within 90 days | Adopt | Powerful bridge and de-risker, but compresses install margin on credited deals and may slow buyers who'd have gone straight to install. |
| D8 | Install de-risked by staged billing + written day-60 punch-list; guarantee wording untouched; no install refund | Adopt | Keeps the outcome promise honest and singular, but staged billing softens upfront cash vs Weiss's preferred full payment (offset with the 5% full-pay option). |
| D9 | Install contents per motion fixed to the §8 list (log, two-lines dashboard, BAAs, punch-list, transfer terms) | Adopt | Makes the install incomparable to setup-fee vendors, but every item is now a delivery commitment audited at day 60. |
| D10 | Retainer copy reframed as access + compounding ownership; response-SLA tiers added to options | Adopt | Weiss-clean and harder to line-item, but SLAs are real obligations on a solo operator — set them at levels one person can honor. |
| D11 | FGO public floor stays "from $20K/mo" (Shape A); SOWs quote $22K+ where the May analysis showed the floor is tight | Adopt | Page consistency preserved, but the $20K public floor keeps attracting buyers whose value math lands below the internal $22K target. |
| D12 | Replace the calculators' "$2,500/mo" illustration with the install-frame line (§10) | Adopt | Removes the strongest low anchor on the site, but the calculator's "fee cleared in N cases" beat must be rebuilt and QA'd per vertical. |

---

## 13. Migration table — page → what changes

| Page (live 2026-07-05) | Old number/model | New (post sign-off) | Gate |
|---|---|---|---|
| **/services/ (hub)** | Base $30K one-time · cylinders $4–15K/mo · FGO from $20K/mo · combo table $13–22K etc. | Keep structure; install line becomes "from $30K, scaled to the value at stake"; add credit-rule sentence; harmonize combo table to per-cylinder bands; "setup" wording banned | GATE:HUMAN (copy lines) |
| **/services/ai-seo/** | Sprint $12–24K · Operator Retainer $8–14K/mo · FGO from $20K/from $12K | Unchanged bands; add credit line to Sprint card; FAQ "$12–24K" refs stay | GATE:HUMAN (credit line) |
| **/services/website-development…/** | Build Sprint $15–35K · Full-build refs · FGO cross-sell | Unchanged; add credit line; ensure "written quote in 24 hours" vs 48h SOW harmonized to 48h | GATE:HUMAN |
| **/services/outbound-email…/** | Pilot $9–14K · retainer $6–14K | Unchanged; add credit line | GATE:HUMAN |
| **/services/editorial-authority/** | $500 single · Pillar Pack $6–14K · retainer $4–14K/mo tiers | Unchanged; add credit line | GATE:HUMAN |
| **/services/catalog-ai/ + /catalog-snapshot/** | $3.00/$7.00 per SKU, minimums $3K/$25K | Unchanged (honesty artifact); Snapshot unchanged | — |
| **/services/full-growth-ownership/** | Shape A from $20K (6-mo min) · Shape B from $12K (3-mo min) | Floors unchanged (D11); add access/SLA tiering language per §4 options | GATE:HUMAN |
| **Book-jobs cylinder pages** (answer-and-book, local-seo-maps, conversion-cro, recover-reactivate, reviews-reputation, paid-acquisition) | No prices; **CTA currently "Book a Growth Call"** on Answer & Book — a motion mix (book-jobs cylinder, sell-product door) | No prices (unchanged); **fix CTA to Revenue Leak Audit on every book-jobs-facing cylinder page**; add link to vertical-page guarantee | Fix is mechanical; CTA copy GATE:HUMAN |
| **/revenue-engine/ (pillar)** | Model only, no numbers, no guarantee text | Unchanged; ensure fork copy reflects "installed by day 60, proving by day 90" once D5 signs | GATE:HUMAN |
| **/revenue-engine/dentists/** | "90 days, one-time fee" · calculator illustrates $2,500/mo · guarantee verbatim · "in the audit, in writing, same day" | Add floor line (D3); calculator re-anchor (D12); "installed by day 60, proving by day 90" (D5); guarantee untouched | GATE:HUMAN |
| **/industries/home-services/** | Same model as dentists; "90-day setup is on me"; first automations in weeks | Same changes as dentists; replace "setup" wording; build /revenue-engine/contractors/ or keep industry page as the vertical (decide at build) | GATE:HUMAN |
| **/industries/medical-aesthetics/** | Calculator ($174,720 recovery figures) | Same vertical-page changes; confirm floor clears per §10 | GATE:HUMAN |
| **/industries/industrial-distribution/** | FAQ: "Sprint $9K–$35K · Operator Retainer $4K–$15K/mo · FGO from $20K"; engine block $30K/$20K; "$35K/mo" FGO comparison | Rewrite FAQ to the per-cylinder rule sentence (D6); engine block gets "scaled" wording; comparisons unchanged | GATE:HUMAN |
| **/industries/consumer-brands/** | $30K/$20K blocks present | Same "scaled" wording pass | GATE:HUMAN |
| **/book-growth-call/** | FAQ cites Sprint $12–24K for sub-$200K/mo | Keep; add one line that sprint fees credit toward the install | GATE:HUMAN |
| **/unlock-growth-audit/** | 24h written audit; "42 e-commerce brands" | Unchanged; ensure it feeds the §5.2 stipulation beats (internal script change only) | — |
| **/constraint-sprint/** | $12–24K; week-1 refund; "60% roll into $8–14K retainer"; "42 sprints" | Keep refund + band; add credit line; the "60% roll into retainer" stat must be verifiable or removed (no fabricated proof) | GATE:HUMAN + verify stat |
| **Home page + /services/ai-seo/ proof bars** | $378M · 91% · 2.5x · NPS 96 | 2.5x stays (approved). $378M / 91% / 96 must be confirmed present in the Approved Claims Library or removed — outside this spec's scope but flagged | Verify vs `lib/stats.ts` |
| **Proposal/SOW templates (off-site)** | Single-option quotes | Three-options structure per §4; value-stipulation header; retainer-at-day-0 clause; punch-list; staged billing | GATE:HUMAN |

---

## 14. Sources (external numbers)

Every external number above traces to one of these. None of these numbers is approved for live copy; copy uses only `lib/stats.ts` claims.

- **[S1]** Alan Weiss, "Formula for Value-Based Fees," alanweiss.com/formula-for-value-based-fees/ (accessed 2026-07-05).
- **[S2]** *Value-Based Fees* summary incl. the 20:1 baseline, option-ladder steps, uniqueness increments, payment terms — marketingfirst.co.nz/2014/01/value-based-fees…-by-alan-weiss/ (accessed 2026-07-05).
- **[S3]** Weiss retainer variables (numbers/scope/response time) — nateliason.com/notes/million-dollar-consulting-alan-weiss; alanweiss.com/value-based-fees-and-the-law/ (accessed 2026-07-05).
- **[S4]** Buyer-stipulated value mechanics — consultingsuccess.com/value-based-pricing (updated Apr 24, 2026).
- **[S5]** FirstPageSage, "Distribution Company EBITDA & Valuation Multiples – 2025 Report" (Feb 6, 2025): Industrial distributors 6.4x ($1–3M EBITDA) / 8.9x ($3–5M) / 11.4x ($5–10M).
- **[S6]** CT Acquisitions, "EBITDA Multiple by Industry: 2026 Valuation Benchmarks" (accessed 2026-07-05): home services 4–6x; size-band guidance.
- **[S7]** CT Acquisitions, "2026 PE Platform Map" (accessed 2026-07-05): 52 named home-services platforms; 49 healthcare-services platforms.
- **[S8]** CT Acquisitions, "How to Buy a Dental Practice in 2026" (updated Apr 27, 2026): general 3.5–5.5x / 65–85% of collections; specialty 5–7x.
- **[S9]** FOCUS Investment Banking, "Dental Practice EBITDA Multiples: 2026 Report" (Feb 6, 2026): platform 9–11x, add-on 5–8x.
- **[S10]** Praxis Rock, "Average EBITDA Multiples by Industry (2026 Data)" (accessed 2026-07-05): GF Data middle-market 7.2–7.5x; healthcare services PE median 13.5x (PCE); cash-pay specialties premium.
- **[S11]** Capstone Partners, Middle Market M&A Valuations Index (Apr 2026): 2025 average 9.8x EV/EBITDA.
- **[S12]** Google Ads Help, "Duration of the learning period for campaigns" — support.google.com/google-ads/answer/13020501 (accessed 2026-07-05): up to ~3 weeks or 1–2 conversion cycles to calibrate.
- **[S13]** PMax learning-phase practitioner guidance: ~4–6-week evaluation window, 50+ conv/mo — groas.com learning-phase guides (May 2026); clicksinmind.com/en/performance-max-learning-phase/ (2025).
- **[S14]** Shopify, "How Long Does SEO Take? (2026)": measurable results 3–6 months; 60–90-day ranking trial periods.
- **[S15]** HigherVisibility, "How Long Does SEO Take to Show Results?" (updated 2025): 3–4 months per Google's own guidance.
- **[S16]** GHL agency pricing guides (June 2026): client retainers $297–2,500/mo; HVAC/roofing/dental $500–2,000/mo "normal" — ghl-services-playbooks…ghost.io + netpartners.marketing/gohighlevel-agency-pricing-guide/.
- **[S17]** gohighlevel.com/pricing + 2026 breakdowns (ghlcrm.me): platform $97/$297/$497/mo.
- **[S18]** SE Ranking 2025 agency survey via wayfront.com/blog/retainer-pricing (Jul 2025): 64% of SEO agencies <$1K/mo; 2% >$5K/mo.
- **[S19]** Searchlab, "Marketing Agency Cost: 2026 Reality Check" (Apr 2026): SMB median $5–8K/mo; Clutch 2025 median $5–10K; AgencyAnalytics $4.8K single-channel / $9.2K multi-channel; mid-market $10–25K.
- **[S20]** Scopic Studios, "Digital Marketing Agency Pricing" (Jun 2026): onboarding/setup $500–3,000 SMB; %-of-spend 10–20%.
- **[S21]** Whatagraph retainer-fee compilation (accessed 2026-07-05): fractional CMO $8–25.5K/mo, avg ~$7.5K.
- Live-site ground truth: salesolution.net crawl, 2026-07-05 (all pages listed in §13).

## 15. Verify against the repo before sign-off — ✅ DONE, see §16

1. `lib/stats.ts` — confirm 2.5x/5.2x exact phrasing + whether $378M / 91% retention / NPS 96 are in the Approved Claims Library (they are live on two pages).
2. `.agents/product-marketing-context.md` — confirm no voice rule conflicts with the §4 option names, the floor line (D3), or the credit-rule sentence; confirm the "setup"-word ban doesn't collide with an approved phrase.
3. `docs/strategy/multi-vertical-pivot/00-phase-plan.md` — confirm the two-funnel page inventory matches §13 (esp. whether /revenue-engine/contractors/ is planned or the /industries/home-services/ page is the canonical vertical).
4. `docs/strategy/roofing/` rate card — confirm the FL/CA rate rows and media add-on figures before D4's grandfathering note is written.
5. `docs/handoff/06/29/services-hub.md` — confirm the $30K base was signed as one-time (the live hub says one-time; this spec assumes it) and whether the 90-day base install already has scope notes that constrain D5.
6. Constraint Sprint's "60% roll into a retainer" and "never invoked in 42 sprints" — confirm these are Approved-Claims entries; if not, they violate the no-fabricated-proof rule and must come down in the same migration pass.

---

## 16. Repo verification results (2026-07-05, 3-agent sweep — resolves §15)

| §15 item | Verdict | What it means for this doc |
|---|---|---|
| 1. `lib/stats.ts` phrasing + approval | **CONFIRMED, with one binding correction** | All six stats are approved (`.agents/product-marketing-context.md:253-259`). Exact labels: 2.5x = "Average ROI in 12 months"; 5.2x = "Average client ROI" (the word "lifetime" lives only in the claims docs). $378M/91%/2.5x/96 render on exactly the two pages §13 says. 5.2x + $575k render **nowhere** (approved inventory, unused — as §1 assumed). **THE CORRECTION: `docs/strategy/sales/_claims-library.md:39` restricts all six stats to the industrial/services side — "Do not blend them into a Revenue Engine page or a local-service cold call."** §1's "only ROI proof permitted in copy" is therefore **sell-product-motion only**; on book-jobs surfaces the calculators + guarantee carry the entire ROI story, with no published multiple at all. |
| 2. Voice conflicts (§4 names, D3 line, credit sentence) | **PARTIAL/CONFLICT** | Sell-product option names all fit canon ("Proof on one cylinder" / "The engine installed" / "Full Growth Ownership" — gloss "cylinder" once in cold proposals). Book-jobs names fail: "Sealed & Fed" leans on the demoted fuel metaphor; bare "Owned" parses as the *buyer* being owned — the exact lock-in fear the copy disarms; "Sealed" works only downstream of the leak frame. **Rename the book-jobs trio in concrete canon language mirroring the sell-product ladder** (working direction: "The leak sealed" / "Sealed, plus demand" / "The whole flow, run for you" — GATE:HUMAN). D3 floor line: replace "scaled to what the audit finds" (brushes the banned scalable-family) with the approved formula — **"Installs start at $30,000. The exact number comes from the audit — in writing, same day."** — and note D3 revises the locked never-quoted-cold stance in `product-marketing-context.md:30`, which must be updated in the same pass. Credit sentence: split it (double em-dash violates the one-per-paragraph rule) and scope it to the five sell-product cylinders — "each cylinder's page shows its band" is **false today** for the six book-jobs cylinders (zero prices); either the band lives in the proposal or publishing bands becomes a build dependency. Band range itself is defensible (sprints live at $6–14K editorial pack → $12–24K AI Search → $15–35K Build Sprint). |
| 3. Phase plan / contractors page | **CONFIRMED — resolves §13's open row** | No `/revenue-engine/contractors/` exists or is planned; the slug was renamed on day one (ambiguity) and the Phase-5 remap deleted `/revenue-engine/home-services/` with a 308. **The canonical contractor vertical IS `/industries/home-services/`.** A trade niche page (e.g. Roofing) is permitted only under the Phase-6 lazy rule — earned by a real client or real search demand — at flat `/revenue-engine/{niche}/`. |
| 4. Rate card | **CONFIRMED verbatim** | `docs/strategy/roofing/revenue-engine-site-injection-spec.md:41-47`: home FL $2,997/mo + $2,500 setup, CA $3,997 + $3,000; dental FL $3,997 + $3,000, CA $4,997 + $3,500; media +$997/+$1,497; "copy must match exactly," display per DP-2. D4's grandfathering note can now be written against these rows. Note: the spec's terms bind pricing language to "90-day system install" — D5's 60-day install must explicitly re-scope this line too. |
| 5. $30K one-time + 90-day scope | **CONFIRMED** | The handoff states $30K **one-time** three times (founder-supplied 2026-06-30). Constraint on D5: the $30K is framed against "~90 days / 3-month engagement" in the handoff, the rate-card terms, and DP-2's display line — a 60-day install must explicitly decouple install length from the 3-month minimum and the day-90 guarantee clock (which §7 already does; now it's a documented re-scope, not a drift). Also pinned: the live guarantee component says "beat my **monthly** fee" (`Guarantee.tsx:28-31`) — quote THAT as the untouched baseline, not the spec's variant without "monthly." |
| 6. Constraint Sprint / audit-page claims | **CONFLICT — fabricated proof live on site** | "Never been invoked in **42 sprints**" (constraint-sprint page + SprintDeliverables — introduced during the rebuild, absent from the legacy page per the migration inventory) and the "**60/30/10** roll-into-retainer split" (constraint-sprint FAQ; legacy page had no split, and the band silently widened $8K→$8–14K) exist in **no approved-claims source**. On `/unlock-growth-audit/`: "42 e-commerce brands" / +32% CVR / 4.9-Clutch are legacy-inherited (recorded, never approved) and the rebuild ADDED unsourced specifics ("in the last 18 months," a 30/70 engage-vs-DIY split, "14 reviews"). Related proof-shaped strays: "About 60% of builds pair with Catalog AI" (webdev page + ServicesIndex). **Founder must attest the real ones (→ claims-library rows) or they come down in the migration pass.** |

**Orphaned components to clean in the same migration pass:** `ComparisonTable.tsx` (hard-coded $575k with a drifted label + an unapproved "+$150k typical" comparator — mounted nowhere, but a landmine if ever imported), `RevenueRateCard.tsx` (renders a literal "+ $X setup" line; never imported), `StatRow.tsx` (unused). The "setup"-ban itself verified **cheap**: `RevenuePricing.tsx` and the SSOT already say "install" — the migration is 6 straggler locations (the `Setup:` hero-spec labels on 4 live pages + previews, and `PlanByPillar.tsx:88`'s "the 90-day setup is on me"), plus optionally 5 fee-adjacent lines.
