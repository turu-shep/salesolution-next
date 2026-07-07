# Medical & Dental — Offer Spec + Wording Kit

**Status:** DRAFT for founder sign-off (2026-07-05). Everything priced or claimed here inherits from the signed **`00-offer-architecture.md`** (D1–D12) and the **`_claims-library.md`** discipline. Copy lines carry **GATE:HUMAN**; the day-90 guarantee wording changes only with Artur's sign-off.
**Scope:** the medical vertical — `/industries/medical-aesthetics/` (pillar) and `/revenue-engine/dentists/` (the one live niche, and the best conversion page on the site). Improve the dentists page surgically; give the pillar the join it lacks.
**Method:** a 5-agent sourced-research sweep (dental economics, med spa/ortho/plastic/derm, DSO valuation, incumbents, claims bank) with an adversarial URL-level verification pass on every bank candidate. Verdicts are recorded per number in §2.

---

## 0. The one-paragraph read

The research closes the biggest gap first: **treatment-plan acceptance is now sourceable.** Henry Schein One's 2026 Catalyst Index (45% average / 75% top-decile) is verified verbatim at two of its own URLs and survived adversarial verification — so **C-06 can come off DO-NOT-USE** with a real attribution (§2, §7). The qualification math holds up: cosmetic/implant-leaning dental clears the $30K install honestly, general/hygiene dental does not, and the same case-value logic sorts the four medical sub-niches (ortho is the strongest structural fit after dental; plastic surgery has the highest per-case value but a guarantee-timing wrinkle; general derm mostly declines). The install compresses to **"installed by day 60, proving by day 90"** cleanly. And the pillar has two live defects to fix in the migration pass: a **wrong-vertical `AuditCTA`** (contractor wording + wrong form submission on the highest-ticket buyer) and a **calculator that undersells its own economics** ($1,200 first-year value against a $6,000-case story).

---

## 1. Qualification tiers — who gets the $30K+ install, who gets standard, who we decline

**The gate (from the architecture's §3.2 rule):** install fee = `max($30,000, ~10% of the modeled 12-month recovered-revenue gain)`. The floor is honest only when the audit can model **≥$250–300K/yr of conservative recovery**. Below that, a $30K install fails the ~10:1 test and the account is either priced down (10% of its real modeled number) or declined — never discounted to fit.

**The recovery stack (what the audit adds up), in order of defensibility:**
1. **Unscheduled-treatment follow-up** — the largest and best-sourced pool. At the verified 45% average acceptance, a practice *presenting* ~$1.2M/yr of treatment leaves ~$660K/yr unscheduled; closing even a quarter of the gap toward the 75% top-decile adds ~$90K/yr, before the standing backlog.
2. **Recall reactivation** — 20–30% of the active file lapses over two years; ~35–40% of contacted 9–24-month-inactive patients book when reached (Practice Analytics). 600 lapsed patients contacted → ~210–240 visits → ~$40–90K including downstream restorative.
3. **Missed-call capture** and **4. no-show recovery** — real, but resting on vendor-grade numbers, so they sit *on top* of the conservative floor, never inside it.

### 1.1 Dental tiers

| Tier | Profile | Modeled 12-mo recovery | Offer | Screening question |
|---|---|---|---|---|
| **A — clears the floor** | Cosmetic/implant-leaning or full-arch GP, ~≥$1.5M collections, **active implant/cosmetic program** | **$300–500K+** | **$30K+ install pitched**, scaled up at 10% of modeled recovery; retainer $4–8K/mo | "Pull your unscheduled-treatment report — what's the total, and how much did you *present* last 12 months?" |
| **B — borderline** | $1–1.5M GP, moderate elective mix (crowns $1.2–2K, occasional implants) | **$120–220K** | Price install at **10% of the modeled number** (often *below* the $30K floor) — or lead with a retainer-first offer; don't force the floor | Same, plus active-patient count × lapse share |
| **C — decline the install** | ADA-median ~$800K GP, hygiene/PPO case mix (~$1.2K avg case) | **$60–120K** | **No $30K install** ($250K would be 31% of collections — not credible). Retainer-only fits: reactivation alone clears the day-90 guarantee trivially (~100 contacts/mo → ~35 booked → $10–17K/mo vs a $3–5K fee) | — |

**Why the tiering is honest, not arbitrary:** the case math for Tier A is easy once corrected. The full-arch average is **$21.5–27.5K per arch, not the ~$15K we assumed** (verified — see §2), so $250K of recovery is ~9 arches, or 52 single implants at $4.8K, or a realistic blend (4 arches + 20 implants + 4 veneer cases ≈ $256K). That's the founder's "2–6 cases a quarter" intuition, and it's *easier* than the old model because each recovered arch is worth 40–80% more than the page assumes.

**The screening variables to qualify on a call:** annual collections; whether they place/restore full arches in-house; dollars *presented* in the last 12 months (any PMS prints this); the standing unscheduled-treatment report total; active-patient count × lapse share.

### 1.2 Medical sub-niche tiers (the pillar's other segments)

| Sub-niche | Verdict | Threshold for $30K+ install | Note |
|---|---|---|---|
| **Orthodontics** | **Strong — best structural fit after dental** | ~250+ starts or ~$1.2M+ production (i.e., the *average* practice qualifies) | Pending-consult pool is the exact analogue of unscheduled treatment (~135 unstarted consults/yr at the average practice); the multi-year observation-recall pool is a recall asset no other niche has; ortho is monthly-payment-native, so financing framing maps perfectly. Decline aligner-discount mills (fees far below the $6.1–6.4K average). |
| **Plastic surgery** | **Highest per-case value; qualify carefully** | ~300+ annual consults or ~$2M+ cosmetic revenue | 2–3 recovered cases/mo at $8–15K surgeon fees clears the floor fast. **Guarantee-timing risk:** consult-to-surgery lag runs 1–6 months, so the day-90 settlement must count **booked/scheduled surgery value**, not collected cash, or month-4 retainer start collides with the pipeline lag. Decline hospital-employed surgeons (no ownership of the leak). |
| **Med spa** | **Qualifies at/above average revenue** | ~$1.2M+ revenue, multi-injector | Average spa revenue is ~$1.4M (AmSpa). Injectables recur by biology (toxin re-treatment ~3–4 months = a built-in recall clock), so the Retain pool is real. Standard install $700K–1.2M; **decline solo-injector spas under ~$700K** — the whole leak pool can't support the floor plus a $3–8K retainer under the guarantee. |
| **Cosmetic dermatology** | **Weakest — qualify only cosmetic-dominant** | ~$1M+ *cosmetic* revenue with laser/EBD packages | Per-event value is 8–15× smaller than an ortho start. In a general derm a recovered missed call books an *insurance* visit, not cash-pay — which undercuts the cash-recovery framing and drags reimbursement complexity into the PROVE line. Treat a cosmetic-dominant derm as a med-spa lookalike; otherwise decline. **Do not build the pillar around derm-specific numbers** — borrow the ASPS injectable averages and say so. |

**Anti-persona, arithmetic version:** solo/low-ticket practices, aligner mills, hospital-employed surgeons, general-derm insurance mills, and any owner who won't sign BAAs. These aren't "bad fits" in the abstract — their leak pool literally can't clear a $30K install at 10:1.

---

## 2. Sourced number bank (GATE:HUMAN)

Every figure below was fetched at its URL and put through an adversarial verifier told to refute it. **BANKED** = confirmed at the source, ready for on-page use *after* Artur's sign-off. **BANKED w/ CORRECTION** = real but must use the reworded form. **DO-NOT-BANK** = why it can't go on a page. No figure here is live copy until it enters `_claims-library.md` as a row.

### 2.1 The C-06 unblock (the headline result)

| Claim | Stat | Source | Verdict |
|---|---|---|---|
| **C-06 → sourceable** | **Average dental practice accepts 45% of presented treatment plans; top performers reach 75%.** | Henry Schein One **2026 Catalyst Index** (5th annual benchmark; released May 13–14 2026). Verified at two URLs: [press release](https://www.henryscheinone.com/about-us/press-release/henry-schein-one-releases-2026-catalyst-index/) and [blog](https://www.henryscheinone.com/insights/blogs/dso-dental-practice-case-acceptance-rate/). | **CONFIRMED** (dual-URL, adversarial). Attribute on-page as *"Henry Schein One 2026 Catalyst Index."* Caveat: exact practice count and the dollars-vs-procedures definition are gated behind the report download; vendor-published (not independent). |
| Retention decline | **Dental patient retention fell 72% → 64% year-over-year** across the Catalyst dataset. | Same Catalyst Index press release. | **CONFIRMED.** Better on-page frame for the recall module than the unverifiable "25–40% overdue" figure — it's an industry-wide worsening leak, not a practice-specific failing. |

**Recommendation:** promote C-06 from DO-NOT-USE to a filed claims-library row (proposed wording in §7.1). Until Artur signs that row, on-page copy stays qualitative with the bracketed `[IF C-06 APPROVED]` swap-in ready (§5.2 stat-map).

### 2.2 Dental economics — BANKED

| Stat | Source | Date | Verdict |
|---|---|---|---|
| Median GP-owner practice **revenue $800K** / expenses $615K (2019–23 pooled, constant 2023 $); expenses rising faster than revenue ("margin compression," ADA's word) | ADA HPI, *Update on Net Income of GP Dentists – 2023 data* ([PDF](https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/hpi/net_income_general_practitioner_dentists_2023.pdf)) | May 2024 | **CONFIRMED** (primary, read from slide 6) |
| Average GP **net income $218,710** (median $186K), 2023 | Same ADA HPI PDF | May 2024 | **CONFIRMED** (primary). Frames what a $30K install means to the owner personally. |
| **New-patient wait 16.8 days** (10.4 for patients of record), 2023; 37% of GPs "too busy/overworked" | Same ADA HPI PDF | May 2024 | **CONFIRMED** (primary). Demand-side proof the front desk is saturated — supports the missed-call narrative from a primary source. |
| Single implant (post+abutment+crown) **$3,500–$6,700, avg $4,800** | [Authority Dental](https://www.authoritydental.org/dental-implants-cost) | Upd. Jan 2026 | **CONFIRMED.** Founder's $3–6K assumption holds. Editorial estimate, DDS-reviewed; no fee-survey methodology. |
| Full-arch (All-on-4 class) **avg $21,500/arch ($15–28K)**; 2025 guides $20–35K/arch | Authority Dental; [Massey Dentistry](https://masseydentistry.com/how-much-do-all-on-4-dental-implants-cost-in-2025/) | 2025–26 | **CONFIRMED — corrects our ~$15K assumption.** $15K is the market *floor*, not the average. Model at **$20–27K/arch**. |

### 2.3 Medical sub-niche economics — BANKED

| Stat | Source | Verdict |
|---|---|---|
| Med spa **avg revenue $1,398,833** (2023); **$527 spend/visit; 245 visits/mo; 73% repeat patients; 10,488 locations** (81% single-location, 3% PE-owned) | AmSpa 2024 State of the Industry ([recap](https://www.americanmedspa.org/news/2024-medical-spa-state-of-the-industry-executive-report-recap/)) | **CONFIRMED** (industry survey, all four figures). |
| Med spa **5% no-show (highest of any category), 16% cancellation, 40% avg 24-hr rebooking vs 69% top earners**; $164 avg ticket | [Zenoti 2025 Benchmark](https://www.zenoti.com/thecheckin/beauty-wellness-industry-statistics-2025) (30K+ businesses, 2024 data) | **CONFIRMED.** Note: Zenoti's $164 POS ticket ≠ AmSpa's $527 survey spend/visit — cite one, never both uncontextualized. |
| Ortho **avg case fee $6,121 braces / $6,373 aligners** (2024); **$1,588,744 production on 287 starts, 55.5% overhead** | [Levin Group via Orthodontic Products](https://orthodonticproductsonline.com/practice-management/business-development/findings-from-the-2024-orthodontic-practice-survey/) | **CONFIRMED** (industry survey). |
| Ortho **68% actual consult-to-start** (doctors believe 80–90%) | [Gaidge](https://www.gaidge.com/blog/your-guide-to-optimizing-the-new-patient-conversion-funnel) | **BANKED** (ortho analytics standard). The perception gap is itself a pitch line. |
| Plastic surgery **2024 avg surgeon fees**: facelift $12–19K, tummy tuck $8–13.5K, rhinoplasty $7.5–12.5K, breast aug $4,575–8K, lipo $4.3–7.5K (surgeon fee only) | [ASPS 2024 Procedural Statistics](https://www.plasticsurgery.org/documents/news/statistics/2024/cosmetic-procedures-average-cost-2024.pdf) | **CONFIRMED** (primary, read from PDF p.28). ASPS switched to ranges in 2024; excludes anesthesia/facility. |
| Injectable tickets: **botulinum toxin ~$435/treatment, HA filler ~$715, non-HA $901** | ASPS cost pages ([toxin](https://www.plasticsurgery.org/cosmetic-procedures/botulinum-toxin/cost), [filler](https://www.plasticsurgery.org/cosmetic-procedures/dermal-fillers/cost)) | **BANKED** (primary). The cosmetic-derm / med-spa toxin+filler anchor. |
| Toxin re-treatment **~3–4 months (women), Dysport mean 3.9 mo** | [Systematic review, NCBI](https://www.ncbi.nlm.nih.gov/books/NBK80582/) | **BANKED** (clinical). The injectable recall-cadence anchor: a toxin patient not rebooked by ~120 days is a countable lapse. |

### 2.4 Practice value / DSO market (the improved-condition anchor) — BANKED

| Stat | Source | Verdict |
|---|---|---|
| Dental **DSO platform 9–11× EBITDA, add-on 4.2–5.1× (broader 5–8×), revenue 1.0–1.8×**; scale ladder 5–7× (<$1M EBITDA) → 11×+ ($5M+) | [FOCUS Investment Banking](https://focusbankers.com/dental-practice-valuation/) (Apr 2026) | **CONFIRMED.** Confirms our held "DSO 9–11×." |
| **DSO affiliation 7.2% (2015) → 16.1% (2024)**, more than doubled; 31% of dentists <5 yrs out are DSO-affiliated | ADA HPI, *The U.S. Dentist Workforce* ([PDF](https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/hpi/US_dentist_workforce_2025.pdf)) | **CONFIRMED w/ CORRECTION:** cite the report as **August 2025** (not Sept). Numbers exact. The buyer pool is structurally growing (age-cohort effect). |
| **~130 PE-backed DSOs** (most of any healthcare vertical); **100+ dental transactions/yr since 2021** | [FOCUS 2025 Dental Transactions Update](https://focusbankers.com/2025-dental-transactions-update/) | **CONFIRMED.** Makes "a buyer will price your recall system" a live, sourced statement. |
| **Recall compliance is a literal diligence gate:** <50% = deal disqualifier, <60% red flag, 75%+ healthy; goodwill 70–85% of price = f(retention × LTV); active-patient decline ≥10%/yr = disqualifier | [BCAT diligence guide](https://mybcat.com/blog/dental-group-acquisition-due-diligence/) (Feb 2026) | **CONFIRMED.** Strongest support that recovered recall lifts *sale* value, not just this year's P&L. (Vendor content-marketing, not a primary M&A dataset — use in the value conversation, not as a headline stat.) |
| Each **+100 active patients ≈ +$50–75K revenue and +0.1–0.2× multiple**; 1,500+ patients → 6–7× | [YourExitValue](https://www.yourexitvalue.com/industries/dental) | **BANKED** (single vendor rubric — conversation/modeling only, not a headline). |
| Marginal flow-through: a **$1 production increase yields ~$0.85 marginal profit** in a 77%-fixed-cost practice | [Focus Partners Wealth](https://www.focuspartners.com/resources/business-ownership/trends-in-dentistry-navigating-high-overhead-costs) (Oct 2024) | **BANKED** (advisory illustration, not an empirical study). Present flow-through as a **modeled 60–85% band**, low end derived from sourced cost lines. |
| Med spa multiples **4–7× EBITDA standalone** (10–12× w/ platform traits), 1.5–3.5× revenue | [FOCUS Medspa dashboard](https://focusbankers.com/medspa-valuation-multiples/) (Jan 2026) | **CONFIRMED.** |

### 2.5 Claims-bank additions — BANKED

| Stat | Source | Verdict |
|---|---|---|
| **92% would consider delaying dental care over cost; 58% say dental care is not affordable** (n=1,335, Jan 2023) | Synchrony Dental *Lifetime of Care* study ([PR](https://www.prnewswire.com/news-releases/americans-may-forgo-dental-treatments-due-to-cost-risking-overall-health-new-synchrony-research-reveals-301942034.html)) | **CONFIRMED.** Supports the **financing-framed follow-up** mechanism. Note: evidences cost-driven *deferral*, NOT a direct "financing lifts acceptance by X%" effect (no verifiable stat of that shape exists — CareCredit's provider page 403'd). |
| **Heartland practices answered only 60–70% of calls** before intervention (→95%+ after) | [Patient Prism × Heartland](https://www.patientprism.com/case-study/heartland-dental-2/) | **BANKED w/ CORRECTION:** the 60–70% is the **non-centralized subset**, not the whole 1,900+ network; source never says "1 in 3." Upgrades C-05's hedge with a concrete DSO anchor. |
| No-show cost: **$20–70K/yr from one no-show/day** | [Dental Economics](https://www.dentaleconomics.com/practice/systems/article/14294871/how-the-economic-impact-of-no-shows-at-a-student-clinic-applies-to-dental-practices) (2023) | **BANKED w/ CORRECTION:** the $20–70K/yr is a figure the article *cites* (~2014), not its own finding; the authors' own study ($17,630 / $61,490) is a **two-year** total. Use the conservative frame; the vendor "$150–240K/yr" numbers have no methodology — **do not bank those.** |
| Unscheduled pool: **~$1–1.5M/practice** | [Jarvis Analytics](https://www.jarvisanalytics.com/blog/unscheduled-treatment/) (2021) | **BANKED w/ CORRECTION:** preserve the hedge ("*could indicate*"), attribute to **Jarvis Analytics** (not ADA), drop "diagnosed" and "in practice management software" (unstated). Weakest bank candidate — prefer the prospect's own PMS report in sales. |
| Hygiene reactivation: **35–40% of 9–24-mo-inactive patients book when contacted**; 20–30% of the active file lapses over 2 yrs | [Practice Analytics](https://practiceanalytics.com/the-impact-of-hygiene-reactivation/) | **BANKED** (vendor, stated verbatim). Their $150/hygiene-visit figure looks dated — **don't print it.** |

### 2.6 DO-NOT-BANK (checked and rejected)

- **Reach "~32% of dental calls unanswered / 14% leave voicemail"** — vendor-tier, no methodology, and it *collides* with the stronger Peerlogic study already on the dentists page (62% answered implies 38% unanswered; publishing 32% and 62% together invites the reader to notice the sources disagree). Keep 32%/14% for the audit conversation only. **Exception:** the 14%-voicemail line can ride as color in a Plan step if paired with Peerlogic (§5.2), but the 32% headline does not go on-page.
- **"25–40% of active base overdue"** — no non-vendor source exists. Keep hedged where already live; prefer the verified Catalyst 72%→64% retention decline as the recall frame.
- **After-hours call share ("25–38% outside business hours")** — vendor aggregators only, no primary. Do not bank.
- **Direct "financing lifts case acceptance X%"** — nothing verifiable found. Use the Synchrony deferral stat instead.
- **Vendor no-show "$150–240K/yr"**, **per-chair-hour no-show cost**, **"Weave 35% unanswered"** — all methodology-free chains. Rejected.
- **CT Acquisitions collections/EBITDA bands** (65–85% of collections, etc.) — probably real but the site 403s every fetch, so unverifiable per the bank rule. Use the FOCUS bands on-page instead; CT stays internal color.

---

## 3. The install, concentrated — the 2-month version (D5)

Per the signed D5: **"Installed by day 60. Proving by day 90."** The 3-month minimum and the day-90 guarantee clock are unchanged; the *install* compresses, decoupled from the minimum. What's live when:

| Milestone | What's live | Why here |
|---|---|---|
| **Day 1** | GBP / local-page / review-velocity work **starts** (Bring) | It has the longest lag (SEO/GBP move on a 3–6-month curve), so it must start first to prove inside the window. |
| **Week 2** | **Call answering live** during chair time + after hours; missed-call text-back in seconds (Respond) | Response/booking layers are fast by nature — the home-services FAQ already promises "first automations in the first couple of weeks." |
| **Day 30** | **Plan-follow-up sequences live** with financing framing (CareCredit-style monthly-payment presentation); **recall reactivation running off the practice's own list**; **two-lines dashboard ships in partial form** | The dormant-database engine — the biggest recoverable pool — is producing by day 30, which is what the day-90 guarantee needs 30+ days of operation to settle honestly. |
| **Day 60** | **Install-complete walkthrough**; written punch-list checked off item by item; **PMS calendar write-back live** (Dentrix/Open Dental/Eaglesoft) | The hard, checkable deadline. Deep PMS integrations beyond calendar write-back are explicitly scoped as **post-install retainer work**, not install scope. |
| **Day 90** | **Guarantee settlement** on the recovered-revenue line, in the practice's own dashboard | Install (60) < guarantee (90) = minimum (3 months). The system has had 30 days of full operation before it's judged. |

**Guarantee interaction, per sub-niche:** dental and med spa settle on collected recovered production, which is fast. **Plastic surgery is the exception** — consult-to-surgery lag is 1–6 months, so its day-90 settlement counts **booked/scheduled surgery value**, not collected cash, or the guarantee orphans on pipeline lag. Note this in any plastic-surgery SOW.

**Risk-reversal around the install** (from architecture §11, unchanged): staged billing tied to the punch-list (50% signature / 25% day-30 dashboard-live / 25% day-60 walkthrough) with a "100% at signature minus 5%" alternative; written day-60 punch-list as the completion warranty; keep-your-assets exit. No refund on the install — the outcome guarantee stays exclusively on the system-attributed line where it's honest.

---

## 4. The three-options proposal — medical vertical (named by the condition each buys)

Weiss's choice-of-yeses, delivered in writing the same day as the Revenue Leak Audit. Options escalate by value and access, built backward from the practice's stipulated number. **Option names are working directions — GATE:HUMAN before any touch a proposal template** (and the architecture's §16 flagged the old book-jobs names as failing voice review, so these mirror the concrete sell-product ladder instead).

| | **Option 1 — "The cases you already earned"** | **Option 2 — "Earned, plus new patients"** (default) | **Option 3 — "The whole practice, run for you"** |
|---|---|---|---|
| **The condition you're buying** | No high-value case lost to a missed call or an unfollowed plan. The recovered-revenue line on your report every month. | The leak sealed **and** new high-value searches pointed at your door: map presence and demand at cost, converting through the sealed system. | Growth handled, you out of marketing operations. The weakest part re-aimed every quarter without you in the loop. |
| **What's inside** | Engine install (Respond, Book, Recover, Prove) + 90 days of me operating it + the guarantee | Option 1 + Bring cylinders (Local SEO & Maps, GBP + review velocity) + media on your account at cost | Option 2 + database-reactivation program + review-velocity engine + quarterly re-aim + priority access |
| **Access** (the Weiss variable) | Monthly report call | + direct line during install, 1-business-day response | + same-day response SLA; your office manager and partner both have my number |
| **Fee shape** | Install (floor $30K, scaled per §1) + retainer from month 4 | Install +20–25% over Opt 1; retainer includes media-mgmt line | Install +20–25% over Opt 2; retainer priced to the maintained condition |
| **Guarantee** | Day-90, verbatim | Same | Same |

**Financing presentation (without commoditizing):** the install itself gets a monthly presentation beside the real number — "$30,000, or about $2,500 a month across the first year; the written quote shows both." Practices think in CareCredit-sized monthly payments; meeting that framing lowers the felt size of the number without turning the install into a subscription SKU. The *number* they'd comparison-shop still doesn't exist until the audit produces it.

**The improved-condition anchor (the value conversation, Beat C):** for owners with any exit horizon, the recovered production is worth a multiple of itself at sale. Worked example, cosmetic-leaning practice recovering ~$205K/yr:
- $205K × 60–85% flow-through = **~$123–174K incremental EBITDA** (85% = the fixed-cost-absorption case where recovered work fills already-staffed chair time; 60–70% = charging incremental supplies/lab + hygiene labor).
- At FOCUS add-on multiples (4.2–5.1×) → **~$517–888K of enterprise value**; at the sub-$1M-EBITDA tier (5–7×) → **~$615K–1.22M** — on top of the cash, against a $30K install.
- **Second-order lever for general practices:** BCAT's gates mean fixing recall compliance can move a practice from *un-sellable* (disqualified) to sellable; and YourExitValue's +0.1–0.2× multiple per 100 active patients means reactivating 200–300 lapsed patients adds multiple across the *whole* EBITDA base — for a $500K-EBITDA practice, 0.3× × $500K = $150K of value from the multiple alone.

Say it in the conversation as: *"$205K a year of recovered production is roughly $125–175K of profit, which at what buyers pay for practices like yours — 4 to 7 times — is somewhere around half a million to a million-two of what your practice is worth, if you ever sell. Against a $30K install."* We supply the multiple band and its source; the owner stipulates their own recovery number. (Per `_claims-library.md`: the `lib/stats.ts` ROI figures stay sell-product-side; on book-jobs surfaces the calculator + guarantee + this value conversation carry the ROI story, with **no published multiple in copy** — the EV bands live in the spoken/written proposal, not on the page.)

---

## 5. Wording kits

Voice: "I", plain, HIPAA woven not shouted, financing framing, kill-list enforced, humanizer pass applied. Every landed stat carries **GATE:HUMAN**. The guarantee is verbatim and unmodified. The floor line uses the architecture-approved formula: *"Installs start at $30,000. The exact number comes from the audit — in writing, same day."*

### 5.1 Pillar (`/industries/medical-aesthetics/`)

#### Three hero options (distinct angles — pick one, or A/B)

**Hero A — the dormant database (diagnosis flip):**
> **Eyebrow:** For dental, med spa & aesthetic practices
> **Headline:** You don't have a new-patient problem. / You have a follow-up problem.
> **Lede:** Pull up your practice software and count what's sitting there: plans presented and never booked, consults that went quiet, recall running months behind. That's revenue you already earned the right to. I install the system that goes and gets it, catches the calls your desk can't grab during treatment, and proves the number in your own dashboard.

**Hero B — the owner's own scene (visceral):**
> **Eyebrow:** Medical & aesthetics · The Revenue Engine
> **Headline:** The $6,000 consult calls at 11:40. / Your whole team is chairside.
> **Lede:** A caller worth $6,000 doesn't leave a voicemail. They hang up, dial the next practice on the list, and by lunch the case is booked somewhere else. Dental, med spa, plastic surgery, derm — the leak looks the same everywhere. I install the system that answers that call, books the consult, and proves what it brought in.

**Hero C — published price, written guarantee (confidence):**
> **Eyebrow:** Published price. Written guarantee.
> **Headline:** The price is published. / The promise has a date on it.
> **Lede:** Installs start at $30,000, and your exact number comes out of the audit in writing, the same day. Installed by day 60. Proving by day 90. If the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does. No discovery-call theater. No number that moves once you sound interested.

#### Joined leak-math block (the beat the pillar lacks)

Assumes the pillar's calculator is re-anchored to a realistic case value (see §6 — the $1,200 default is the live bug). Recommended block:

> **Eyebrow:** Your leak vs my fee
> **Headline:** What comes back, / against what I cost.
> **Body:** You set every slider above — that number is yours. Now hold it against the fee. Installs start at $30,000. The exact number comes from the audit, in writing, the same day. At a $6,000 average case, the floor is five recovered cases. Not five a month. Five, total. Everything past that is revenue that was already leaking, and the dashboard shows it on its own line, separate from your ads. If your own sliders say the system can't clear that bar, don't hire me — the audit will tell you the same thing for free.
> **Micro-copy:** fee slider → *"My fee: $2,500/mo · $30,000/yr — the install floor"* · recovered line → *"What the system puts back (conservative)"* · footnote → *"Starting points, not claims. The audit swaps every slider for your real numbers — in writing, same day."*

#### Guarantee-against-price restatement

> The floor and the guarantee are one mechanism. Installs start at $30,000, and the exact number comes from the audit in writing the same day. That number stays honest because of what follows it: if the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does. Quote you more than the system can recover, and I'm the one who eats it — in free months of my own work. That's why the price can sit in public. Overpricing punishes me first.

#### Five objection rewrites

**1. Front desk (additive reframe):**
> **Q:** I'm not trying to replace my front desk. I just need the overflow caught.
> **A:** Then we want the same thing. Your team keeps every patient in front of them — nobody gets replaced. The system takes what they physically can't: the call that rings mid-procedure, the 8pm inquiry, and the stack of unscheduled plans and overdue recall nobody has time to work between check-ins. Nothing that was getting done comes off their desk. It catches what wasn't getting done at all. If your front desk answered every call now, I'd have nothing to sell you.

**2. HIPAA (plain, in writing):**
> **Q:** Whatever we use has to be HIPAA compliant. Is it?
> **A:** Yes, and you get it in writing before go-live. Every tool that touches patient data — call answering, texting, recordings, records — runs under a signed Business Associate Agreement, the contract HIPAA requires of any vendor handling patient information. Recorded patient calls are treated as protected health information and stored under HIPAA access rules, not dumped in a generic call log. Recording disclosures follow the strictest state rule that applies to you. None of this is a verbal assurance. It's paperwork you hold.

**3. PMS (no switching):**
> **Q:** Does this work with the practice software we already run, or are we migrating everything?
> **A:** You keep it. The system books into your real schedule and writes back to your practice management software — Dentrix, Open Dental, and Eaglesoft on the dental side, and the booking platforms aesthetic practices run. No second calendar to babysit, nothing to migrate, no retraining week. The specific hookup for your software gets confirmed in the audit, before any money moves. If it can't connect cleanly, you'll know then, not at go-live.

**4. Answering service (the one they already tried):**
> **Q:** We tried an answering service and patients hated it. Why would this be different?
> **A:** An answering service takes a message. The patient still isn't booked, and they've just told their story to someone who can't see your schedule or answer one question about your procedures. This one books. Callers get a fast, human-sounding reply set up from your own fees and procedures during install, a slot on your real calendar, and they can always reach a real person. Every call is recorded, so you hear exactly what it sounds like before it ever answers for you. And the phone is the smaller half — most of what this recovers comes from working your unscheduled plans and overdue recall, which no answering service ever touched.

**5. $30K vs my marketing budget (the 5–8% frame):**
> **Q:** Installs start at $30,000? My whole marketing budget isn't much more than that.
> **A:** Practices are commonly advised to invest 5–8% of gross revenue in marketing. For a $2M practice that's $100,000 to $160,000 a year, every year, most of it spent chasing strangers. The install is a one-time fraction of that, aimed at the other end: the calls that already dialed your number and the plans you already presented. At a $6,000 average case, it clears with five of them. Most owners run it as a monthly payment rather than a check — the real number stays in writing either way. And if the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does.

*(Alternate phrasings for every block above are banked in the research file — three lens-variants each. These are the curated picks.)*

### 5.2 Dentists page (`/revenue-engine/dentists/`) — surgical edits only

The site's best conversion page. These are placements and single-line swaps, not a rewrite. The close stays.

**Stat placement map** (each stat sits beside the slider/step it grounds — voice rule 7):

| Stat | Lands | Exact line |
|---|---|---|
| Implant $3–6K / All-on-4 (note: model $20–27K, see §2) | `WholeFlowLeak`, caption under the "Your average case" slider | *"For scale: a single implant runs $3,000–$6,000, and a full-arch case is $20,000 or more. The $5,000 default is conservative."* *(corrects the old ~$15K All-on-4 mental model)* |
| Peerlogic $8K missed-call LTV | `WholeFlowLeak`, caption under "New-patient calls missed a week" (Convert) | *"One missed new-patient call can be worth up to about $8,000 over that patient's lifetime (Peerlogic)."* |
| Peerlogic 62% answered / ~25% book | `WholeFlowLeak`, footnote closing the Convert group | *"In a 4,280-call study across 26 practices, 62% of calls got answered, and about 1 in 4 answered new-patient calls booked (Peerlogic, 2026). The defaults above sit on those numbers."* |
| 25–40% overdue + 15–25% reactivated | `WholeFlowLeak`, footnote closing the Retain group | *"Most practices have a big share of their active base overdue at any time, and reactivation typically rebooks 15–25% of that list inside 90 days — the defaults here sit at the low end."* *(keep "big share" qualitative — the 25–40% is vendor-tier; the live FAQ's "a quarter to 40%" line stays as-is)* |
| Reach 14% voicemail | `PlanByPillar` → Convert → Respond step | *"Only 14% of callers who hit voicemail leave a message (Reach). The rest dial the next practice."* |
| **Reach 32% unanswered** | **DOES NOT go on-page** | Collides with the stronger Peerlogic 62% already on the page; keep for the audit conversation. |
| Case acceptance (C-06) | `PlanByPillar` → Retain → Recover step, opening sentence | **Ships now (qualitative):** *"Most plans that don't schedule on the spot never do — not because the patient said no, but because nobody reopened the conversation."* · **`[IF C-06 APPROVED:` *"The average practice schedules just 45% of the treatment it presents; the top 10% reach 75% (Henry Schein One 2026 Catalyst Index). The gap is the pool this works."*`]`** |

**Payback line** (D12 — replace the illustrative $2,500/mo slider + "clears that fee in the first N cases" with install-frame math; `N = Math.ceil(30000 / avg)`, renders 6 at the $5,000 cosmetic default):

- **Variant A (recommended, guarantee-correct):** *"Installs start at $30,000. At the case value you set above, the recovered work covers that in the first {N} cases. After that, the second line on your report has to beat my monthly fee by day 90 — or I work free until it does."*
- **Variant C (carries the monthly presentation):** *"Installs start at $30,000. That's {N} cases at your average, and at the floor it runs about $2,500 a month across the first year — the written quote shows both. From there, my fee lives next to the recovered line on your own report. The line beats the fee, or I work free until it does."*

> **Fix vs the signed direction:** the D12 draft said the fee must clear the *report line*; the guarantee's actual direction is **revenue beats fee**. Variants A/C correct that while keeping the day-90 free-work hook.

**Floor-line placement** (`RevenuePricing`, intro under "Published model. No games on a call."):
> *"You see exactly how this is priced before we ever talk. Installs start at $30,000. The exact number comes from the audit — in writing, same day. If you think in monthly figures, the written quote shows it that way too, next to the full number."*
> *(replaces the vague "depends on your trade, location, and scope" sentence)*

**Specs strip fix** (D5 + "setup"-word ban):
```
SPECS = [
  { label: 'Install',  value: 'by day 60, one-time fee' },
  { label: 'Proving',  value: 'by day 90' },
  { label: 'Minimum',  value: '3 months, no lock-in' },
]
```
*(the current `{ label: 'Setup', value: '90 days, one-time fee' }` violates the setup-word ban and the D5 timing)*

**Close — keeps verbatim, one beat tighter:**
> Headline unchanged: **"That guarantee has my name on it."**
> Paragraph, tightened: *"You work with me — not a pod, not a junior handoff. I install the system, I run it, and I'm on the hook if the recovered line doesn't clear my fee."*

**Cost FAQ** (carries the floor without breaking "the number comes in writing the same day"):
> *"Installs start at $30,000. The exact number comes from the audit — in writing, same day. No games on a call. If you think in monthly payments, the written quote shows it that way too, beside the full number. After the 3-month minimum the monthly fee runs month-to-month, and if you cancel you keep your data, your Google profile, and your patient records."*

---

## 6. Page-maps + the two live bugs to fix separately

### 6.1 `/industries/medical-aesthetics/` (pillar)

| Section | Change | Gate |
|---|---|---|
| **`<AuditCTA />`** at [page.tsx:249](../../../app/(site)/industries/medical-aesthetics/page.tsx#L249) | **BUG — fix separately.** Renders without `vertical="dental"`, so `AuditCTA` falls back to its `vertical='home-services'` default ([AuditCTA.tsx:15](../../../components/sections/revenue-engine/AuditCTA.tsx#L15)) → the close reads **contractor wording and the form submits the wrong vertical** for the highest-ticket buyer on the site. One-line fix: `<AuditCTA id="audit" vertical="dental" />` (or add a `'medical'` vertical to the union if a medical-specific form is wanted). | Mechanical fix |
| **Calculator** (`Concept3Calculator`, `LEAK_DATA['medical']`) | **Undersells its own story.** Default "First-year value of a patient" is **$1,200** ([data.ts calc](../../../components/sections/revenue-engine/leak-concepts/data.ts)) against a $6,000-case timeline in the very same data block. **Two options:** (a) minimal — raise the default to a $6,000 case value and re-caption; (b) recommended — **port the dentists page's `WholeFlowLeak`** with medical presets (it's the site's best pattern, models all three pillars, and gives the leak-math join §5.1). | GATE:HUMAN |
| **Hero** (`RevenueHero`) | Swap to one of the §5.1 heroes; the current "losing its highest-value patients to voicemail" is Convert-only and misses the Retain pool. | GATE:HUMAN |
| **Leak-math join** | Add the §5.1 joined block after the calculator (the pillar currently has no fee↔leak join — the dentists page's strongest pattern). | GATE:HUMAN |
| **Floor line** | Add to `RevenuePricing` per §5.2 placement. Confirms the floor clears per §1 (medical sub-niches qualify at/above average size). | GATE:HUMAN |
| **Specs / timing** | Same D5 fix as dentists ("Installed by day 60, proving by day 90"; drop "Setup"). | GATE:HUMAN |
| **FAQ** | Swap in the five §5.1 objection rewrites; the current four are thin (esp. no answering-service, no $30K-budget, no PMS). | GATE:HUMAN |

### 6.2 `/revenue-engine/dentists/` (niche)

| Section | Change | Gate |
|---|---|---|
| `WholeFlowLeak` | Stat captions per §5.2 map; payback line → Variant A/C; **`DENTAL_PRESETS` GATE:HUMAN defaults** still need Artur's sign-off (they're marked illustrative in-code at [page.tsx:44](../../../app/(site)/revenue-engine/dentists/page.tsx#L44)). Consider raising the cosmetic `avg` toward the corrected full-arch reality, or leave conservative and let the caption carry it. | GATE:HUMAN |
| `RevenuePricing` | Floor line + specs fix per §5.2. Shared component — the floor line needs a small prop (e.g. `floorLine?: string`) so it doesn't hard-code into every vertical. | GATE:HUMAN + small build |
| `PlanByPillar` | C-06 sentence (qualitative now, bracketed swap ready) + Reach 14% in the Respond step. | GATE:HUMAN |
| Hero SPECS | D5 three-row swap. | GATE:HUMAN |
| Close | Keep verbatim; optional one-beat tighten. | GATE:HUMAN |

### 6.3 Shared-component note

`RevenuePricing` and `AuditCTA` are shared across all Revenue-Engine verticals. The floor line and the D5 specs should land as **props/config**, not per-page hard-codes, so home-services and future niches inherit them consistently (matches the architecture's migration-table intent).

---

## 7. Claims-library + brief actions (for the migration pass)

### 7.1 Proposed `_claims-library.md` rows (GATE:HUMAN — Artur attests, then they go live)

The research produced enough to file these. **Recommendation: promote C-06.**

```
| C-06 | "The average dental practice accepts 45% of presented treatment plans;
         top performers reach 75%." | Henry Schein One 2026 Catalyst Index
         (henryscheinone.com, press release + blog, May 2026) | PROPOSED — VERIFIED
         at two URLs, adversarially confirmed. Attribute as "Henry Schein One 2026
         Catalyst Index." Vendor-published benchmark; exact N and dollars-vs-procedures
         definition gated. | dentists Recover step; medical pillar. |
```

Supporting rows worth filing at the same time (all CONFIRMED in §2): **C-07** patient-financing deferral (Synchrony 92%/58%); **C-08** retention decline (Catalyst 72%→64%, the recall-module frame); **C-09** missed-call answer rate (Heartland 60–70%, upgrades C-05's hedge — use the corrected non-PSC-subset wording). Case-value rows (implant $3–6K, full-arch $20–27K) can ride as internal modeling references rather than on-page claims.

**Keep as-is:** C-01 (47-hr reply), C-04 (5–8% guidance), C-05 (1-in-3, hedged — now backed by Heartland). The `lib/stats.ts` ROI figures stay sell-product-side (do not blend into these pages).

### 7.2 Med-spa niche brief — attribution defects to fix before it ships

The existing `med-spa` brief in `lib/strategy/niches/briefs.generated.ts` (slug `med-spa`, landingPage `medical`) is mostly solid but its own `_verify` block flagged two real defects — **fix in `briefs.generated.ts` via the niche-brief workflow, not by hand:**
1. **The ~80% / 5-minute speed-to-lead stat is misattributed to `frontdesk.care`** — that page doesn't contain it (it carries a different "85% call the next provider" figure). The 80% traces to the InsideSales/Lead Response Management study. Appears in **both** `leak.points[Convert]` and `keyStats` — fix both, or replace with frontdesk.care's actual on-page stat.
2. **"Memberships drive 20–30% of revenue" is unsupported as attributed** — Workee's actual figure is 40–60% within 18 months, or just cite the confirmed 24%-membership-growth-in-2024. Drop or re-source the 20–30%.

Everything else in the brief verified (the $7,800 model-derived LTV, the $15–25 "Botox near me" CPC, the 70–80%-vs-40–50% rebook-at-checkout, 47% retention, 35% missed-calls). This spec's §2.3 AmSpa figures (avg revenue $1.4M, $527/visit, 245 visits/mo, 73% repeat) are the stronger primary anchors to fold in.

### 7.3 Med-spa as the next niche page (outline)

If med spa graduates from pillar-sub-niche to its own `/revenue-engine/med-spa/` page (Phase-6 lazy rule — earned by a real client or real demand), the shape is set:

- **Lead pillar: Retain.** Injectables recur by biology (toxin ~3–4 mo, filler 6–18 mo). The dormant list + the re-treatment window is the biggest recoverable pool — same structure as the dentists page.
- **Hook:** the injector's own words — "I'm an injector, not a marketer, so the calls roll to voicemail, the 3-month rebook never happens, and the spa down the street gets my patient."
- **Leak math:** average spa $1.4M revenue, 245 visits/mo, $527/visit; 16% cancellation + the 40%→69% rebooking gap is the leak; a solo-injector spa under ~$700K **declines** the $30K install (tier gate from §1.2).
- **Compliance block:** HIPAA BAAs **plus** the injectable-specific chain — medical-director supervision and good-faith-exam routing (the booking flow routes, never screens eligibility or gives medical advice). This is the med-spa analogue of the dental PMS reassurance.
- **Guarantee:** verbatim day-90, settling on the Retain line (rebooks + reactivations), which should clear the fee on its own.
- **Financing framing:** membership enrollment as the recurring-revenue play; present the install monthly.
- **Qualification note on the page's own CTA:** the audit qualifies — multi-injector ~$1.2M+ gets the full install; solo spas get told honestly it's not for them yet.

---

## 8. Open decisions for Artur (each: recommendation)

1. **Promote C-06?** → **Yes.** It's verified at two URLs and adversarially confirmed; the qualitative-only constraint was "until sourced," and it's now sourced. File the row (§7.1); until you sign it, the page ships the qualitative version with the bracketed swap ready.
2. **Re-anchor the pillar calculator** — minimal ($6K default) or port `WholeFlowLeak`? → **Port it.** It's the site's best pattern and it's what makes the leak-math join possible.
3. **Fix the two live bugs now or in the migration pass?** → The `AuditCTA` vertical is a one-line mechanical fix that mis-submits the highest-ticket buyer's form today — **fix it now, separately from the copy pass.** The calculator undersell rides with the migration.
4. **Full-arch modeling value** — raise the cosmetic preset's `avg` toward $20–27K, or keep $5,000 conservative? → **Keep $5,000 as the slider default** (a blended cosmetic-practice case), but use the caption to correct the ~$15K All-on-4 mental model, and use $20–27K/arch in the *audit* math where the real case mix is known.
5. **Option names** (§4) → working directions only; they need your wording before any proposal template.

---

### Sources

All external numbers trace to §2, each with its URL, date, source tier, and an adversarial verdict (CONFIRMED / CONFIRMED-with-correction). Full research analyses, every candidate claim (including the rejected ones), and three lens-variants of every wording block are banked in the run transcript. No number here is live copy until it enters `_claims-library.md`; copy uses only sourced, signed rows.
