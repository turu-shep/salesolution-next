# 03 — Migration build plan

**Date:** 2026-07-07
**Status:** DRAFT — pending `04-signoff-sheet.md`. Nothing here builds until the sign-off sheet clears the GATE:HUMAN copy blocks and decision rows. This is reconciliation + sequencing, not new design.
**Owner:** Artur (sign-off) / this doc (build spec of record for the migration pass).

**Binding inputs (read order):**
- `00-offer-architecture.md` — SIGNED 2026-07-05. D1–D12 + §16 win on everything; **§16 wins over the architecture body.**
- `02-visible-value-pass.md` — rules **R1–R9** + D14-a…f, binding on proposal artifacts only.
- Four vertical specs: `industrial-offer-spec.md` (sell-product), `home-services-offer-spec.md` (book-jobs), `medical-dental-offer-spec.md` (book-jobs), `consumer-jewelry-offer-spec.md` (sell-product).
- `01-anchor-ladder.md` — **PARKED by founder (D13). Build nothing from it.** Template-only interactions noted where flagged.
- `docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md` — live reference implementation (becomes the book-jobs template).
- `docs/strategy/sales/_claims-library.md`, `lib/stats.ts`, `components/sections/revenue-engine/WholeFlowLeak.tsx` (417 lines, mounted only on dentists), `Concept3Calculator.tsx` (the one being replaced).

**What lives elsewhere:** Task 3 (the founder sign-off sheet — every pending decision + every proposed claims row) and Task 7 (the per-row SEARCH-verification results) live in `04-signoff-sheet.md`. A short Task-7 net is folded in at the end of this doc.

**Hard constraints carried through this doc:** no signed decision changes; D13 parked; R1–R9 binding on proposal artifacts; the guarantee sentence is untouchable and quoted verbatim wherever it appears; no new stats beyond the Task-7 URL sweep; **competitor/platform names never appear in a customer-facing copy block or template** (vendor names live in internal source columns only); **every canonical copy block below carries GATE:HUMAN until `04-signoff-sheet.md` clears it.**

---

## Task 1 — The unified payback component spec

`WholeFlowLeak` is the vehicle. All four specs chose it. One component, extended, serves every money page. `Concept3Calculator` is retired.

### 1.1 Two motion variants (the only per-motion branch)

| | **book-jobs** | **sell-product** |
|---|---|---|
| Pages | dentists, home-services, medical-aesthetics (+ revenue-engine previews) | consumer-brands, industrial (deferred), future jewelry niche |
| Anchor | install-frame, `$30,000` floor `+ scaling clause` | install-frame, `$30,000` floor + pieces framing |
| Payback | N in their unit (`ceil(30000/avg)`) | N in their unit (pieces / accounts) |
| Hand-off | → **verbatim `<Guarantee>` follows** | → 48h-SOW line, **no guarantee language** |
| Extra | — | optional "recovers ~{M} {unit}s a year" line |
| Fee slider | **removed** (D12/R8) | **removed** (D12/R8) |

### 1.2 Load-bearing code changes (both variants)

Two changes carry the whole rebuild; the three-pillar math is untouched (`BRING_TO_JOB=0.02`, `RECOVER={bring:0.4,convert:0.6,retain:0.5}`).

1. **Kill the fee slider (D12/R8).** Remove `feeMo` state (`WholeFlowLeak.tsx:130`), the fee-slider block (`:270–292`), the `usd(feeMo)/mo` label (`:275`), and the `feeYr` "The fee" polyline in `Projection` (it depended on the slider). Keep the "Leaking, do nothing" vs "Recovered with the engine" lines.
2. **Repoint the payback.** Change `jobsToFee = ceil(feeYr / avg)` (`:148`) → **`installPayback = ceil(installFloor / avg)`** with `installFloor=30000` default. This is the `$2,500/mo` bare-monthly → install-frame swap the whole reconciliation turns on.
3. **Add a `motion` prop** to switch the anchor/hand-off block (§1.4). Only per-motion branch in the component.

### 1.3 Props / API (extends the live signature)

```ts
export function WholeFlowLeak({
  id,
  presets = DEFAULT_PRESETS,      // existing
  fields  = DEFAULT_FIELDS,       // existing
  avgLabel = 'Your average job',  // existing — "…case" (dental/medical), "…sale" (jewelry)
  unitLabel = 'job',              // existing — payback noun; per-trade override below
  heading = DEFAULT_HEADING,      // existing
  // ── new ──────────────────────────────────────────────
  motion = 'book-jobs',           // 'book-jobs' | 'sell-product'
  installFloor = 30000,           // N = ceil(installFloor / avg)
  scalingLine,                    // book-jobs anchor tail, e.g. "scaled to what the audit models"
  recoveredUnitsLine = false,     // sell-product: show "recovers ~{M} pieces a year"
}: WholeFlowLeakProps) { … }
```

Recommended addition to `Preset` so one home-services mount speaks per-trade units (the current single `unitLabel` can't do roofs/installs/jobs on one mount):

```ts
export type Preset = { key: string; label: string; unit?: string } & Vals
// payback copy reads the selected preset's `unit` if present, else falls back to unitLabel
```

### 1.4 D12 join-line — ONE canonical pattern (slots) [GATE:HUMAN until 04-signoff clears]

N = `ceil(installFloor / avg)`, computed live. This is the single pattern; `motion` branches only the FLOOR_LINE and HAND-OFF slots.

> **Anchor:** `[FLOOR_LINE]`
> **Payback:** At your average `[UNIT]`, the recovered work above covers the install in the first **{N}** `[UNIT_PLURAL]`.
> **Hand-off:** `[HANDOFF]`
> **Footer:** Your numbers, your assumptions. I round down. The audit replaces every estimate with your real figures.

| Slot | book-jobs | sell-product |
|---|---|---|
| `[FLOOR_LINE]` | "The install starts at $30,000`[, scaled to what the audit models]`." | "The install starts at $30,000. At your average `[UNIT]`, that's {N} `[UNIT_PLURAL]` — once." |
| `[UNIT]/[UNIT_PLURAL]` | roofing roof/roofs · hvac install/installs · plumbing & electrical job/jobs · dental case/cases | jewelry/consumer piece/pieces · industrial **account/accounts** (one recovered *house account*, not one order — §1.6) |
| `[HANDOFF]` | "After that, the fee is monthly and it has one test: the recovered line on your report beats it — the guarantee below." **→ verbatim `<Guarantee>` follows.** | "Everything after that is return. `[+ The model above recovers about {M} [UNIT_PLURAL] a year.]` Your exact number comes in the written SOW, within 48 hours." **No guarantee language.** |

**Hard rule (D12/R8):** no bare monthly figure (`"$2,500/mo"`) in the anchor, the calculator, or the proposal. Medical Variant C (the "$2,500 a month across the first year" line) is **REJECTED** — it is the exact D12-retired anchor and the same removal the visible-value pass already made to Beautiful Smiles v5 (BREAK #2). The architecture body's D12 draft ("clear the report line") had the direction inverted; the correct direction is **recovered line beats the fee** (matches `Guarantee.tsx` and the medical/home-services correction). This is direction-consistency with the untouchable guarantee, not a signed-decision change.

### 1.5 Preset registry (numbers + sources)

**Home-services trades** — source: home-services §5.3 + live `DEFAULT_PRESETS` (`WholeFlowLeak.tsx:35–40`). Blended service+replacement tickets, set at/below sourced service-ticket data ("defensibly conservative — keep them").

| key | label | avg | bvol | brate | cvol | crate | rvol | rrate | unit | note |
|---|---|---|---|---|---|---|---|---|---|---|
| roofing | Roofing | 4500 | 180 | 25 | 5 | 24 | 300 | 8 | roofs | leak ≈ $500K+/yr; install ≈ 7 jobs at $4,500 (2–4 at real replacement tickets) |
| hvac | HVAC | 1200 | 300 | 25 | 8 | 30 | 500 | 14 | installs | |
| plumbing | Plumbing | 450 | 500 | 25 | 15 | 35 | 700 | 20 | jobs | |
| electrical | Electrical | 600 | 300 | 25 | 10 | 33 | 450 | 16 | jobs | **presets/eyebrow only — fails the $30K floor; never a lead trade** |

Optional caption (§5.3, verbatim): "Average-job defaults are blended (service + replacement) and set low on purpose."

**Dental** — source: `DENTAL_PRESETS` live in `dentists/page.tsx`; illustrative avg marked GATE:HUMAN at `page.tsx:44`. Retain-led. Cosmetic **avg 5,000**, unit **"case"**, `N=6`. Keep $5,000 default (medical §8 #4). Slider caption (verbatim): *"For scale: a single implant runs $3,000–$6,000, and a full-arch case is $20,000 or more. The $5,000 default is conservative."*

**Medical** (port target — replaces the $1,200 `Concept3` undersell). Default **avg = $6,000** (medical §8 #2). Volume sliders (bvol/cvol/rvol) **GATE:HUMAN — set from the §1 recovery-stack model, Retain-led like dental** (not fixed in the spec).

| sub-niche | avg case | source |
|---|---|---|
| Dental (cosmetic) | 6,000 | implant $4,800 avg / full-arch $20–27K/arch (Authority Dental; §2.2) |
| Ortho | 6,100 | $6,121 braces / $6,373 aligners (Levin via Orthodontic Products; §2.3) |
| Plastic surgery | 10,000 | facelift $12–19K, tummy $8–13.5K, rhino $7.5–12.5K (ASPS 2024; §2.3) — **guarantee counts booked/scheduled surgery value** |
| Med spa | 527 | AmSpa $527 spend/visit (cite one, never with Zenoti's $164 POS ticket) |
| Injectables | 500 | toxin ~$435, HA filler ~$715 (ASPS; §2.3) |

**Jewelry / consumer** — source: jewelry §3.2 (VERBATIM; DataForSEO 2026-07-05 demand; The Knot / Backlinko / 411 Locals sourcing map). Recovery at 40/60/50% per pillar; unit **"pieces"**.

| preset | avg | bvol | brate | cvol | crate | rvol | rrate | default leak/yr | recovered/yr |
|---|---|---|---|---|---|---|---|---|---|
| Jewelry — bridal & custom | 4600 | 150 | 25 | 3 | 18 | 600 | 4 | $363,768 (12.1×) | $182,380 (6.1×) |
| Jewelry — fine & gifts | 2700 | 250 | 25 | 5 | 20 | 1000 | 5 | $396,900 (13.2×) | $200,340 (6.7×) |
| Furniture showroom | 1600 | 500 | 25 | 8 | 20 | 1200 | 6 | $392,320 (13.1×) | $195,072 (6.5×) |
| Flooring showroom | 3200 | 200 | 25 | 5 | 20 | 400 | 5 | $345,600 (11.5×) | $177,920 (5.9×) |
| Hot tub & spa dealer | 12000 | 60 | 25 | 2 | 15 | 300 | 3 | $424,800 (14.2×) | $218,160 (7.3×) |
| *(niche variant)* Custom & natural | 7000 | 150 | 25 | 2 | 18 | 500 | 3 | $425,040 | $206,724 (install = 5 pieces) |

**Industrial** — **no preset ships initially.** Its RFQ leak model (RFQs/wk 60 · avg quoted order $2,000 · quotes never chased 25% · lapsed accounts #/$/yr; margin ~27¢/$1, US Census AWTS 2021 = 26.9%) does not map onto Bring/Convert/Retain. Ship the **static three-line block first** (industrial §6.2), **no fee slider**. A later widget needs a custom `fields` FieldSet mapping RFQ-leak → three pillars (Convert = RFQ response · Retain = lapsed accounts · Bring = AI-search visibility) + `motion='sell-product'` + unit **"accounts"** (framed against recovered account value/yr, not per-order). Deferred/optional.

### 1.6 Component-level divergences (resolved)

| # | Divergence | Resolution |
|---|---|---|
| Calculator vehicle (A9) | HS/medical/jewelry swap to `WholeFlowLeak`; industrial names none | **One component.** Three live pillars swap; industrial ships the static three-line block first, widget deferred (needs RFQ FieldSet). |
| Payback code (A22) | `jobsToFee` computes against the editable fee | Change to `installPayback = ceil(installFloor/avg)` (§1.2). |
| Units (A15) | roofs/installs/jobs/cases vs pieces vs accounts | Per-preset `unit` field; industrial frames against recovered **account value/yr**, not a per-order "7 pieces" literal. |
| Capacity-in-calc (A11) | HS "N engines a quarter" vs medical "2–6 recovered cases/quarter" | Do **not** render a capacity count inside the calculator. Capacity is a copy block (§2, A11), single founder input, currently unset; medical's "2–6 cases" is recovery modeling, a different meaning — never a public install count. |
| Concept3 CTA gap (§4g) | `Concept3Calculator` emits no `data-cta` | Swapping to `WholeFlowLeak` adds `data-cta="revenue_leak_audit__calculator"` on the book-jobs mounts; sell-product mounts need a motion-appropriate id (see Task 9). |

### 1.7 Mount map + `Concept3Calculator` disposition per mount

| Page | New mount | `Concept3Calculator` today |
|---|---|---|
| `/revenue-engine/dentists/` | `WholeFlowLeak` **book-jobs**, `DENTAL_PRESETS`, avgLabel "Your average case", unit "case" — already mounted (`page.tsx:303`); **remove fee slider, add D12 anchor + guarantee hand-off** | not mounted here |
| `/industries/home-services/` | `WholeFlowLeak` **book-jobs**, trade presets (roofing default), per-trade units | **replace** (`page.tsx:141`) |
| `/industries/medical-aesthetics/` | `WholeFlowLeak` **book-jobs**, MEDICAL presets, avgLabel "Your average case", unit "case", default $6,000 | **replace** (`page.tsx:192`) — *AuditCTA `vertical="dental"` fix already applied, uncommitted* |
| `/industries/consumer-brands/` | `WholeFlowLeak` **sell-product**, jewelry/consumer presets (§3.2), pieces framing, 48h-SOW hand-off, **no guarantee** | **replace** (`page.tsx:189`) |
| `/industries/industrial-distribution/` | **No swap day one** — static three-line leak block first; sell-product `WholeFlowLeak` optional/deferred (custom RFQ FieldSet) | not mounted here |
| `/revenue-engine/spine-preview/` | `WholeFlowLeak` defaults → align to **book-jobs** variant or leave as internal preview (`page.tsx:129`) | not mounted here |
| `/revenue-engine/full-preview/` | update to `WholeFlowLeak` **book-jobs** (home-services presets) or leave as internal preview | **replace / internal** (`page.tsx:97`, `data={hs}`) |
| `/revenue-engine/leak-concepts/` (`LeakConceptsShowcase`) | design showcase — retire with `Concept3Calculator` or keep as internal reference | showcase harness (`:82`) |
| *(future)* `/revenue-engine/jewelry/` (Phase 6) | `WholeFlowLeak` **sell-product**, jewelry presets incl. "Custom & natural $7,000" | — |

**Net `Concept3Calculator` disposition:** replaced on all three live industries pillars (home-services, medical-aesthetics, consumer-brands) + `full-preview`; showcase (`leak-concepts`) retires or stays internal. After migration it has **zero money-page mounts** → deletion candidate alongside the orphans (Task 6). The task brief said "four mounts"; the code found **five** — the fifth is the internal `LeakConceptsShowcase` harness (`Concept3Calculator.tsx:5` mount).

---

## Task 2 — Cross-spec copy reconciliation

One canonical, slot-parameterized block per shared element. Four sessions wrote four specs; every drift is settled below. **Each block carries GATE:HUMAN until `04-signoff-sheet.md` clears it.** The guarantee sentence is the one exception — it is untouchable and quoted verbatim, never slotted.

### 2.1 Floor line (A1) [GATE:HUMAN]

§16 wins for book-jobs, verbatim, with **no** "scaled" clause inside the sentence. Divergence is the delivery clause (audit-same-day vs 48h-SOW) plus the sell-product scaling gloss. "Scaled to what the audit **finds**" is dead everywhere (brushes the banned scalable-family).

> `[LEAD]` $30,000`[, one-time]``[ — floor, not price]`. `[SCALING]` The exact number comes `[DELIVERY]`.

| Slot | book-jobs | sell-product |
|---|---|---|
| `[LEAD]` | "Installs start at" (§16-pinned, no scaling clause inside) | "From" / "The Revenue Engine — from" |
| `[SCALING]` | *(separate adjacent line only)* | "Scaled to the value at stake`[ — a $40M distributor doesn't pay what an $8M one pays]`." |
| `[DELIVERY]` | "from the audit — in writing, same day." | "in a written SOW, within 48 hours`[ of the call]`." |

**Canonical book-jobs floor line (verbatim, §16 / home-services §4.2 / medical §5):** *"Installs start at $30,000. The exact number comes from the audit — in writing, same day."*

### 2.2 Scaling principle (A2) [GATE:HUMAN]

"Scaled to the value at stake" = architecture-sanctioned (§13 page-map wording) → **canonical, both motions.** "Scaled to what the audit **models**" (home-services) is acceptable ("models" ≠ banned "finds") and may skin the book-jobs calculator anchor. Install formula is identical everywhere and non-divergent: **`install = max($30K, ~10% of modeled 12-mo gain)`; year-one ≤ ~15% of stipulated value, never > 20%.**

### 2.3 Credit sentence (A3) [GATE:HUMAN]

§16 wins: split into two sentences, scope to the **five sell-product cylinders** (AI Search, Build Sprint, Outbound Pilot, Editorial Pillar Pack, Catalog AI). "Each cylinder's page shows its band" is **false today** for the six book-jobs cylinders (zero prices) — so on book-jobs the credit mechanic lives **only in the rate letter / proposal**, never as an on-page band claim.

**Sell-product on-page (verbatim, jewelry §5.1 form):**
> Any of the five service cylinders can run first as a fixed-scope sprint at its published band. Take the install within 90 days and the sprint fee credits toward it, in full.
> *Guard-rails (D7): credit expires at 90 days · applies to the install fee only, not the retainer · one credit per client.*

**Book-jobs:** credit mechanic stated in the same-day rate letter only ("Option 1 = the committed $30,000 … no decision needed before day 90").

### 2.4 Terms line (A4) [GATE:HUMAN]

> `[INSTALL_TIMELINE]` · one-time install fee · `[MINIMUM]` · `[EXIT]` · staged billing 50/25/25 (or 100% −5%) · `[RISK_REVERSAL]`

| Slot | book-jobs | sell-product |
|---|---|---|
| `[INSTALL_TIMELINE]` | "Installed by day 60, proving by day 90" | "Installed in ~90 days, work shown week 4" |
| `[MINIMUM]` | "3-month minimum, month-to-month after" | "3-month minimum, month-to-month after" |
| `[EXIT]` | "cancel with 30 days' notice; you keep your data, `[Google profile / patient records / …]`" | "leave on 90 days' notice; everything transfers" |
| `[RISK_REVERSAL]` | **verbatim guarantee** (§2.9) | "no outcome guarantee — the absence is the trust signal" |

Exit notice legitimately differs by motion (A14): sell-product engagement = 90 days' notice; book-jobs retainer = month-to-month / 30 days; FGO-after-minimum = 30 days. See Task 6 for the one live bug (industrial CMO card "30 days" → 90).

**Canonical book-jobs terms (verbatim, home-services §11 row 10):** *"Installed by day 60, proving by day 90 · one-time install fee · 3-month minimum, month-to-month after · staged billing 50/25/25 (or 100% −5%)"*

### 2.5 Staged billing (A5) [GATE:HUMAN]

Percentages 50/25/25 and the 100%−5% alternative are architecture-fixed (§11) and non-divergent. Only the **milestone anchors bind to the install clock** — a ~90-day sell-product install can't say "day-60," so industrial's generalization is the honest form (exact staging GATE:HUMAN per industrial §2.4).

> Staged billing: 50% at signature / 25% at `[MILESTONE_2]` / 25% at `[MILESTONE_3]` — or 100% at signature, minus 5%.
> You're never more money out than installed system in.

| Slot | book-jobs | sell-product |
|---|---|---|
| `[MILESTONE_2]` | "day-30 dashboard-live" | "the mid-install checkpoint" |
| `[MILESTONE_3]` | "the day-60 punch-list walkthrough" | "the install-complete walkthrough" |

### 2.6 "Setup" → "Install" ban (A6) [GATE:HUMAN]

Ban confirmed (architecture §8/§16). Label is always **"Install"**. Value differs by motion. Six stragglers migrate (Task 6 for file:line). Non-install "setup" prose stays (outbound "compliance/domain setup", ai-seo "headless setups"/"setup cost doesn't amortise", catalog-ai "setup cost", constraint-sprint "WooCommerce setup") — out of scope.

- Label → `"Install"`; value = book-jobs **"by day 60, one-time fee"** / sell-product **"~90 days, one-time fee"** (jewelry keeps "90 days, one-time fee").
- `PlanByPillar.tsx:88` (book-jobs) "the 90-day setup is on me" → **"I install and run all of it — the 60-day install is on me."**

### 2.7 Hero spec labels / card (A7) [GATE:HUMAN]

No card schema is architecture-mandated. Book-jobs drift resolves to the **medical form** (row 3 carries both the 3-month minimum and no-lock-in — strictly more informative). Sell-product cards vary in length; both legitimate. $30K **floor** is publishable (the exact fee stays off-page).

> `[WHO_RUNS_IT?]` · Install · `[INSTALL_SPEC]` · `[MIDDLE_ROW]` · `[EXIT_ROW]`

| Slot | book-jobs | sell-product |
|---|---|---|
| `[WHO_RUNS_IT?]` | *(omit)* | "Who runs it: Artur Shepel. We run every account ourselves." |
| `[INSTALL_SPEC]` | "by day 60, one-time fee" | "from $30,000, one-time — scaled to the value at stake" *or* "~90 days, one-time fee" |
| `[MIDDLE_ROW]` | "Proving · by day 90" | "Work shown · week 4; two revenue lines monthly after" *or* "Pricing · published, in full" |
| `[EXIT_ROW]` | "Minimum · 3 months, no lock-in" | "Exit · 90 days' notice; the work stays yours" |

### 2.8 Three-option proposal names (A12) [GATE:HUMAN — final wording on the template]

One three-rung structure, +20–25% same-condition step. Sell-product trio is architecture-approved canon. Book-jobs trio is the §16 direction; the old "Sealed & Fed"/"Owned" failed voice review and are dead. Vertical skins allowed if they stay in concrete canon language.

| Rung | book-jobs (dental skin) | sell-product |
|---|---|---|
| Opt 1 | "The leak sealed" ("The cases you already earned") | "Proof on one cylinder" |
| Opt 2 (default) | "Sealed, plus demand" ("Earned, plus new patients") | "The engine installed" |
| Opt 3 | "The whole flow, run for you" ("The whole practice, run for you") | "Full Growth Ownership" |

### 2.9 Guarantee usage (A10) — motion gate, not a slot [book-jobs only; verbatim, locked]

Untouchable, verbatim (`Guarantee.tsx:29–31`; note the word **"monthly"**):

> **"If the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does."**

In-component mechanism sentence (also not paraphrased): *"That's the second line on your report — the work the system brings back, counted in your own dashboard, not my spreadsheet. That's what makes it safe to promise."*

- **book-jobs:** verbatim, on every option, quoted with "monthly"; the D12 join-line hands off to the `Guarantee` component, never paraphrasing it.
- **sell-product:** **no guarantee language.** Risk-reversal stack in its place; week-4 work-shown carries the early-evidence job — honest line: *"the monthly report re-earns the retainer or it doesn't — and the report is yours either way."*

### 2.10 Capacity number (A11) [GATE:HUMAN — single founder input, currently unset]

One honest capacity number, unresolved across all specs. If published, it is an **install-capacity count**, stated once, never a countdown, true and honored (real obligation on a solo operator, D10). Never conflate with medical's "2–6 recovered cases/quarter" (recovery modeling). Tier-3 "two a year" stays PARKED with D13.

> `[If N set]`: "We take `[N]` installs a quarter. The queue is the queue." (book-jobs: "I install `[N]` engines a quarter.")
> `[If N unset — fallback]`: "I run every account myself." / "We run every account ourselves." (no count)

### 2.11 48h-SOW line (A16) + 24h harmonization (sell-product) [GATE:HUMAN]

Sell-product SOW turnaround = **48 hours, date-stamped**. Harmonize the residual FGO "written quote in 24h" mentions (industrial §4 Opt 3; jewelry §8 Opt 3) to **48h** (architecture §13 webdev row already harmonizes 24h→48h). Book-jobs stays "in writing, same day" (rate letter) / "24h" (the separate free written diagnostic).

> Your exact number lands in a written SOW within 48 hours `[of the call]` — date-stamped with the install-complete and work-shown dates, yours to keep either way.

### 2.12 Pieces-not-percentages (A15) — sell-product device [GATE:HUMAN]

`[UNIT]` = jewelry/consumer **"pieces"** (`N = ceil(30000/avg)` on avg sale; at $4,600 the $30K install = 7 pieces once, default model recovers ~40 pieces/yr); industrial **"house accounts"** (framed against recovered account value/yr, not per-order — the $2,000 avg order makes "7 pieces" literal math wrong). Book-jobs uses the guarantee, not pieces.

---

## Task 4 — ROI-stat deployment map

§16 Item 1 binds: `lib/stats.ts` restricts all six stats to the industrial/services side — *"Do not blend them into a Revenue Engine page or a local-service cold call."* **Sell-product surfaces only.** Book-jobs surfaces carry the entire ROI story through the calculator + guarantee, with **no published multiple at all.**

| Stat (exact `lib/stats.ts` label) | Renders on | Status |
|---|---|---|
| `2.5x` — "Average ROI in 12 months" | Home page proof bar · `/services/ai-seo/` proof bar | Approved (§16 Item 1), render on the two pages |
| `$378M` — "Revenue driven for clients" | Home page · `/services/ai-seo/` proof bars | Approved (§16 Item 1), render on the two pages |
| `91%` — "Client retention rate" | Home page · `/services/ai-seo/` proof bars | Approved (§16 Item 1), render on the two pages |
| `96` — "Net Promoter Score" | Home page · `/services/ai-seo/` proof bars | Approved (§16 Item 1), render on the two pages |
| `5.2x` — "Average client ROI" | **nowhere** | Approved inventory, unused — keep unused |
| `$575k` — "Annual ARR added per client" | **nowhere** | Approved inventory, unused — keep unused ("lifetime" lives only in claims docs) |

**NEVER (any of the six):** `/revenue-engine/*` (dentists, spine-preview, full-preview), `/industries/home-services/`, `/industries/medical-aesthetics/`, the six book-jobs cylinder pages, or local-service cold calls. On those surfaces the calculators + guarantee are the whole proof story. Note the file's own internal inconsistency (`2.5x` "Average ROI in 12 months" vs `5.2x` "Average client ROI" both live at once) — keep the exact labels; do not reconcile them into one number.

---

## Task 5 — Proof roadmap

### 5.1 Now-mechanisms (live, no case study required)

| Mechanism | Where | Rule |
|---|---|---|
| Disclosed formulas | `WholeFlowLeak` footnote (`:316–321`) | "bring assumes a conservative 2% … recovers 60% of convert, 40% of bring, 50% of retain"; "Your numbers, your assumptions." |
| Round-down | calculator footer + `Concept3` string | "I round down" — stays verbatim in both variants |
| Week-4 work-shown | sell-product surfaces + template | carries the early-evidence job the guarantee carries on book-jobs |
| Founder-name guarantee | book-jobs surfaces | verbatim `<Guarantee>`, "my name on it," `Guarantee.tsx:29–31` |
| Artifact CTAs | calculator `data-cta`; the same-day rate letter + 48h SOW as the take-home artifacts | R4: "personalized for [name] — not for redistribution" |

### 5.2 Activation plan

| First case | Motion | Path | Claims-row process | Disclosure |
|---|---|---|---|---|
| **Beautiful Smiles** | book-jobs (first cohort-data candidate) | active dental deal, $30K install proposed 2026-07 (`docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md`). When it produces real recovered-revenue numbers, that becomes the first book-jobs proof. | measured first-party data → file a `_claims-library.md` row **AND** the spec §4 source table row, with source + status, GATE:HUMAN. **State as ours, never as research.** | ranges/own-dashboard framing; no fabricated proof until real numbers land (PROOF-SLOT stays empty) |
| **Liori Diamonds** (D-C4) | sell-product (first named case) | consent ask now, request named (jewelers/luxury DTC trade on recognition); anonymized-but-specific fallback ("a DTC diamond brand with a $X,XXX average sale"). PROOF-SLOT stays empty until answered. | on grant: named case needs consent + attested numbers → claims row + spec source row, GATE:HUMAN | R4 redistribution wall on any artifact; no `lib/stats.ts` six on this surface |

### 5.3 Disclosure badges (per fact-ledger rules)

No element is literally named "disclosure badge"; the governing rules are:
- **R7** — every bought-alone figure GATE:HUMAN per row, **OPENED at its URL before printing**; floors ("from $X") where market spread misleads.
- **R4** — value stack is proposal-only, personalized 1:1; every artifact carries "personalized for [name] — not for redistribution."
- **R9** — one statutory penalty figure per artifact max, beside the not-legal-advice fineprint; never lead with penalty math.
- **Buyer-facing ledger prints ranges only** ("prevailing market ranges" in the fineprint). **Vendor/source names live in the internal source column only, never in the artifact** (competitor-name constraint).
- **Provenance caveat (02 header):** the visible-value research verification pass did NOT run — no bought-alone row is adversarially verified. D14-f makes re-opening every SEARCH row **required before first use** (Task 7 ran that sweep — see the Task-7 net).

---

## Task 6 — Removals + fixes batch (all signed — SEQUENCE only)

All items below are already decided. This is ordering + file:line targets, not re-adjudication. Sub-batches run in this order; steps A–B–C are independent and parallelize.

### A. Commit the already-applied fix (S, zero risk — do first)

- **Medical `AuditCTA vertical="dental"`** — the one-line fix is **already applied and uncommitted** in the working tree (`git status`: `M app/(site)/industries/medical-aesthetics/page.tsx`; diff adds `vertical="dental"` to the FREE-AUDIT CLOSE `<AuditCTA>`). **Commit it.** Do not re-implement. (No `'medical'` enum exists; `'dental'` is the closest — add a `'medical'` union member only if a medical-specific form is later wanted.)

### B. Orphan deletions (S — confirmed dead code, zero imports)

| Component | File:line | Status |
|---|---|---|
| `ComparisonTable` | `components/sections/services/ComparisonTable.tsx:53` | ORPHAN — delete (hard-coded `$575k`, drifted label) |
| `RevenueRateCard` | `components/sections/revenue-engine/RevenueRateCard.tsx:21` | ORPHAN — delete (dead "90-day system install" `:89`, dead `data-cta` `:96`, "+ $X setup") |
| `StatRow` | `components/sections/StatRow.tsx:10` | ORPHAN — delete |

### C. Fabricated-claims removals (S — attest-or-remove; default = remove per signed decision)

| Claim | File:line | Action |
|---|---|---|
| "…invoked in 42 sprints." | `app/(site)/constraint-sprint/page.tsx:106` | attest (claims-library row) or remove |
| "Never been invoked in 42 sprints." | `components/sections/constraint-sprint/SprintDeliverables.tsx:107` | attest or remove |
| "60/30/10" roll-into-retainer split | — | **ZERO code hits** — already absent; nothing to remove |
| "42 e-commerce brands" / +32% CVR / 4.9-Clutch / "in the last 18 months" / 30/70 split / "14 reviews" | `/unlock-growth-audit/` | attest or remove (§16 item 6) |
| "About 60% of builds are paired with…" | `app/(site)/services/website-development-design-services/page.tsx:178` | attest or remove |
| "About 60% of builds pair with Catalog AI" | `components/sections/services/ServicesIndex.tsx:212` | attest or remove |

### D. "Setup" stragglers → "Install" (S — the 6 locations)

| File:line | Current | New |
|---|---|---|
| `app/(site)/industries/home-services/page.tsx:111` | `{ label: 'Setup', value: '90 days, one-time fee' }` | `{ label: 'Install', value: 'by day 60, one-time fee' }` |
| `app/(site)/industries/medical-aesthetics/page.tsx:162` | same | `{ label: 'Install', value: 'by day 60, one-time fee' }` |
| `app/(site)/revenue-engine/dentists/page.tsx:31` | same | `{ label: 'Install', value: 'by day 60, one-time fee' }` |
| `app/(site)/revenue-engine/spine-preview/page.tsx:27` | same | `{ label: 'Install', value: 'by day 60, one-time fee' }` |
| `app/(site)/industries/consumer-brands/page.tsx:160` | same | `{ label: 'Install', value: '90 days, one-time fee' }` *(sell-product — value stays)* |
| `components/sections/revenue-engine/PlanByPillar.tsx:88` | "…the 90-day setup is on me." | "I install and run all of it — the 60-day install is on me." |

Rides along: `RevenuePricing.tsx:26` `'90-day install, one-time fee'` → book-jobs terms *"Installed by day 60, proving by day 90"*; add a `floorLine?: string` prop (medical §6.2 / A30) so the floor isn't hard-coded per vertical. `RevenueRateCard.tsx:89` "90-day system install" is orphan/dead (deleted in batch B).

### E. Industrial 90-vs-30-day notice (S)

- **Bug:** the live CMO-replacement anchor card on `app/(site)/industries/industrial-distribution/page.tsx` (§9 section) says the engagement "scales down on **30 days' notice**" — wrong for a sell-product engagement. **Fix → "90 days' notice."** (Locate the "30 days' notice" string inside the CMO-anchor band; the grep sweep didn't surface an exact line — GATE to confirm the line at edit time.) 30-day notice is correct only in FGO-after-minimum (`FullGrowthComparison.tsx:51`, `CatalogTiers.tsx:75`) and book-jobs month-to-month (`RevenuePricing.tsx:91`) — leave those.

### F. Editorial retainer-band headline (S — reconcile)

- `app/(site)/services/editorial-authority/page.tsx:22` and `:195` metadata/description both say "Editorial Retainer **from $4K/mo**, Pillar Pack from $6K fixed, $500 single-piece trial. Three volume tiers." Actual `RETAINER_TIERS` in `components/sections/editorial-authority/EditorialPricing.tsx:24–40` = Focused $4K / Standard $7.5K / Aggressive $15K. Floor ($4K) matches; reconcile the headline band + Pillar-Pack "$6K fixed" against the on-card figures so the meta and the tiers agree. GATE:HUMAN on the canonical band.

### G. `briefs.generated.ts` regeneration (M — via the niche-brief workflows, NEVER hand-edit)

File: `lib/strategy/niches/briefs.generated.ts`. Regenerate through the two niche-brief workflows (see the strategy-section memory). Corrections to fold on next regeneration:

Home-services §10.6:
1. CallConley plumbing LTV = **$3,500–$10,000**, not "$4–5K".
2. HomeGuide repipe = **~$4,000–$15,000**, not "$6–15K".
3. CallJolt URL typo `/blog/guide/` → `/blog/guides/`.
4. "80% need 5+ follow-ups / 44% quit after one" bundles two sources under one citation — split or drop the 44%.
5. Reconcile the ~44% map-pack click-share attribution (Moz 2015 in roofing brief vs Backlinko in plumbing brief) before any claims-bank use.

Medical §7.2 (`med-spa` brief, slug `med-spa`, landingPage `medical`):
6. ~80% / 5-minute speed-to-lead misattributed to `frontdesk.care` — trace to InsideSales/Lead Response Management; fix in `leak.points[Convert]` and `keyStats`.
7. "Memberships drive 20–30% of revenue" unsupported as attributed — use Workee's 40–60%-within-18-months or the confirmed 24%-membership-growth-2024 figure.

---

## Task 8 — Proposal templates

Two markdown templates, written in parallel to this doc, at the paths below. R1–R9 embedded as source comments; not-legal-advice fineprint on both; R4 wall ("personalized for [name] — not for redistribution"); `[slots]` for stipulated values; the §16 working option names; guarantee verbatim on book-jobs, none on sell-product.

**`docs/strategy/sales/proposals/templates/book-jobs-proposal-template.md`** — generalized from the Beautiful Smiles v5 sheet (02 §4 item 1): audit slots → two faces → priced ledger → condition stack → 60/90 clock → Day-91 bridge + owner's manual → wide-ladder options → guarantee band → terms. Option names: "The leak sealed" / "Sealed, plus demand" / "The whole flow, run for you" (dental skin: "The cases you already earned" / "Earned, plus new patients" / "The whole practice, run for you"). Credit mechanic lives here (not on page). Guarantee verbatim on all three options.

**`docs/strategy/sales/proposals/templates/sell-product-proposal-template.md`** — per 02 §4 item 2: leak in their units → grow-it/keep-it → priced ledger → condition stack (EV beats, value stipulated first) → ~90-day install clock with week-4 work-shown → transfer-vs-cylinders columns → three options (Tier 3 = FGO with annual figure, ~$20K/mo ≈ $240K/yr) → risk-reversal stack → terms. Option names: "Proof on one cylinder" / "The engine installed" / "Full Growth Ownership". 48h-SOW line, date-stamped. Pieces-not-percentages device. **No guarantee language.**

**D13 template-only interaction (PARKED — build nothing):** if D13 later signs, only these two templates change — a wide Tier-3 (~$200K-class, "a different condition") replaces the +20–25% step **in the rate letter / 48h SOW only**; the credit path extends Tier1→Tier3 within 12 months; a "two a year" Tier-3 capacity number appears. **Nothing on any page changes; the published $30K floor never moves.**

---

## Task 9 — Measurement plan

### 9.1 data-cta coverage on the new blocks

| Surface | Today | After migration |
|---|---|---|
| Three live industries calculators (home-services, medical-aesthetics, consumer-brands) | `Concept3Calculator` emits **no `data-cta`** — no measured conversion inside the calculator (§4g gap) | book-jobs mounts inherit `WholeFlowLeak.tsx:299` `data-cta="revenue_leak_audit__calculator"` → gap closed |
| `/industries/consumer-brands/` + industrial (sell-product) | — | CTA is **Book a Growth Call / written diagnostic**, not Revenue Leak Audit — needs a **motion-appropriate `data-cta` id** (e.g. `growth_call__calculator`), not the reused `revenue_leak_audit__calculator`. GATE at build. |
| Industrial static three-line leak block | not built | its CTA needs a `data-cta` when it ships |
| `RevenueLeakAuditForm` submit (via `AuditCTA`) | form POST, not tagged | leave as-is (form handles its own conversion event) |

Tracking mechanism unchanged: `components/integrations/CTAClickTracker.tsx` (capture-phase `closest('[data-cta]')`, consent-gated). Any element with `data-cta` is measured.

### 9.2 Before/after metrics for the offer push

Baseline captured before the migration PR, compared after. Consent-gated `cta_click` + GA4 (`docs/strategy/ga4.md`).

| Metric | Motion | Source event |
|---|---|---|
| Audit bookings | book-jobs | `revenue_leak_audit__*` clicks + `RevenueLeakAuditForm` submits |
| Growth calls | sell-product | `book_call__primary_nav` + `growth_call__*` clicks → booking |
| Proposal → close rate | both | template-driven; track pick-rate per option (Opt 1/2/3) per the D13 prove-on-3-5-proposals rule (ladder earns page-level presence only if middle-tier distribution shows up in reality) |

---

## Task 10 — Build sequence

Five batches. Sizes S/M/L. Batches 1–2 parallelize; per-page migration (batch 3) is gated on the component build + the sign-off sheet.

| # | Batch | Size | Parallelizes | GATE:HUMAN checkpoint |
|---|---|---|---|---|
| 0 | `04-signoff-sheet.md` cleared (decisions + claims rows + hero picks + capacity-N) | — | — | **BLOCKS batches 3–4.** No copy block ships until cleared. |
| 1 | Removals + fixes (Task 6 A–G) | S–M | A/B/C independent; G is its own workflow | Task 6 C attest-or-remove; F band; E line-locate |
| 2 | Component build — `WholeFlowLeak` (kill slider, `motion` prop, `installPayback`, `Preset.unit`, `RevenuePricing.floorLine`) | M | with batch 1 | D12 join-line copy (§1.4) |
| 3 | Per-page migration (table below) | L | services-book rows parallelize; revenue-engine rows serialize behind batch 2 | every row GATE:HUMAN on copy |
| 4 | Proposal templates (Task 8) | M | with batch 3 | option names + all copy blocks |
| 5 | Measurement (Task 9 — data-cta ids, baseline capture) | S | after batches 3–4 land | motion-appropriate `data-cta` ids |

### 10.1 Per-page migration table (architecture §13 merged with all four spec page-maps)

| Page | Change | Source-spec | Gate |
|---|---|---|---|
| `/services/` (hub) | install line → "from $30K, scaled to the value at stake"; add credit-rule sentence; harmonize combo table to per-cylinder bands; "setup" banned | arch §13 + industrial §7 (EngagementShapes shared) | GATE:HUMAN |
| `/services/ai-seo/` | add credit line to Sprint card; FAQ "$12–24K" refs stay | arch §13 | GATE:HUMAN |
| `/services/website-development-design-services/` | add credit line; harmonize "written quote in 24h" → 48h | arch §13 | GATE:HUMAN |
| `/services/outbound-email-marketing-services/` | add credit line | arch §13 | GATE:HUMAN |
| `/services/editorial-authority/` | add credit line; reconcile retainer-band headline (Task 6 F) | arch §13 | GATE:HUMAN |
| `/services/catalog-ai/` + `/catalog-snapshot/` | unchanged (honesty artifact) | arch §13 | — |
| `/services/full-growth-ownership/` | floors unchanged (D11); add access/SLA tiering language | arch §13 | GATE:HUMAN |
| Book-jobs cylinder pages (answer-and-book, local-seo-maps, conversion-cro, recover-reactivate, reviews-reputation, paid-acquisition) | fix CTA → Revenue Leak Audit on every one; add link to vertical-page guarantee; **no prices** | arch §13 | fix mechanical; CTA copy GATE:HUMAN |
| `/revenue-engine/` (pillar) | fork copy reflects "installed by day 60, proving by day 90" | arch §13 | GATE:HUMAN |
| `/revenue-engine/dentists/` | `WholeFlowLeak` book-jobs already mounted — remove fee slider, add D12 anchor + guarantee hand-off; floor line (D3); D5 timing; Setup→Install; guarantee untouched; `RevenuePricing.floorLine` + terms | medical §6.2 + arch §13 | GATE:HUMAN |
| `/industries/home-services/` | `Concept3`→`WholeFlowLeak` book-jobs (trade presets); D12 re-anchor; hero §9.1 (rec A); Setup→Install (60-day); `PlanByPillar:88`; terms line; FAQ | home-services §11 + arch §13 | GATE:HUMAN |
| `/industries/medical-aesthetics/` | `Concept3`→`WholeFlowLeak` book-jobs (medical presets, $6,000 default); D12; hero §5.1; floor line; specs; FAQ; **AuditCTA fix = commit (Task 6 A)** | medical §6.1 + arch §13 | GATE:HUMAN |
| `/industries/consumer-brands/` | `Concept3`→`WholeFlowLeak` sell-product (§3.2 presets), pieces framing, 48h-SOW hand-off, **no guarantee**; EngagementShapes wording; FAQ "How is it priced?" rewrite; hero §5.1 Opt A; metadata "not six vendors"→five-vendor; Setup→Install (value stays) | jewelry §6 + arch §13 | GATE:HUMAN |
| `/industries/industrial-distribution/` | **no calculator swap day one** — static three-line leak block first; hero swap (rec B); EngagementShapes "$30K one-time"→"from $30,000, scaled to the value at stake" + credit; CMO-anchor band replace + **fix "30 days"→"90 days" (Task 6 E)**; FAQ → per-cylinder rule (§6.7); ProcessTimeline de-jargon; §4b SOW layer stays off-page | industrial §7 + arch §13 | GATE:HUMAN |
| `/book-growth-call/` | add one line: sprint fees credit toward the install | arch §13 | GATE:HUMAN |
| `/unlock-growth-audit/` | on-page unchanged; legacy claims held out until attested (Task 6 C); feeds §5.2 stipulation (internal script only) | arch §13 + §16 item 6 | — / verify |
| `/constraint-sprint/` | keep refund + band; add credit line; "42 sprints" + "60% roll into retainer" attest-or-remove (Task 6 C) | arch §13 | GATE:HUMAN + verify stat |
| `/revenue-engine/spine-preview/` | `WholeFlowLeak` book-jobs align or internal preview; Setup→Install | reconciler §1.7 | GATE:HUMAN |
| `/revenue-engine/full-preview/` | `Concept3`→`WholeFlowLeak` book-jobs (hs presets) or internal preview | reconciler §1.7 | GATE:HUMAN |
| `/revenue-engine/leak-concepts/` (showcase) | retire with `Concept3Calculator` or keep internal reference | reconciler §1.7 | — |
| Home page + `/services/ai-seo/` proof bars | 2.5x stays; $378M / 91% / 96 approved (§16 Item 1), render on these two pages | arch §13 | resolved (§16 Item 1) |
| Proposal / SOW templates (off-site) | three-options; value-stipulation header; retainer-at-day-0; punch-list; staged billing | arch §13 + 02 §4 | GATE:HUMAN (batch 4) |
| *(future)* `/revenue-engine/jewelry/` (Phase 6) | `WholeFlowLeak` sell-product, jewelry presets incl. "Custom & natural $7,000" | jewelry §7 | build-when-earned (Phase-6 lazy rule) |

---

## Task-7 note (the one research task — ran today)

The SEARCH-row verification sweep (R7 / D14-f) **ran 2026-07-07.** Every SEARCH-flagged ledger row in the three visible-value tables (02 §3, home-services §3b, jewelry §4.4, industrial §4b) was opened at its URL, confirmed/corrected/struck, and the flags flipped in the source tables. Per-row dispositions + URLs live in `04-signoff-sheet.md`. Net:

- **OPENED / CONFIRMED (URL now supplied):** HS trade content (per-article $250–500, total labeled derived) · HS Google Ads mgmt band + LSA $149/mo (Footbridge) · HS review/reputation (reframe to an openable analysis, not the lead-gated vendor page) · jewelry site custom $10–30K (cartcoders) · jewelry review/reputation $299–449/location (costbench — the jewelry-specific sweep confirms what an earlier generic sweep struck) · jewelry/HS response layer ("$40–120 typical, up to $300") · industrial editorial rate ($0.50–1.50/word, biztoolkit — ClearVoice URL is DNS-dead; **internal rate guidance, never buyer-printed**, R7).
- **CORRECTED (band narrowed):** jewelry content library ($150–**$700**/article jewelry-specific; total derived) · jewelry Local SEO (**drop the $1,500 floor and the $6K tier** → $500–3,000/mo typical ~$1,000) · HS Google Ads LSA setup/upper (reframe — the "$2,650 upper"/"$500–1,500 setup" not openable).
- **STRUCK / blocking-until-sourced (do not put in front of a buyer):** HS **call-answering** portion (+ the ~$1,725 top + the ~$300–1,900/mo composite) · jewelry **email-retention setup ($1,000–5,000) + platform-tier** figures (mgmt $2,500–10K is fine). *(HS retention/reactivation engine is now sourceable via Setsail $500–3,000/mo, but note it as general email-agency comp, not home-services-DFY-specific.)*
- **Reconciliation:** industrial ledger flag mismatch (punch-list #5 "two SEARCH rows" vs one visible) resolved by opening Editorial **plus** the site/catalog corroborator before buyer use.

**No new stats were introduced beyond these URL-opening corrections.** Every buyer-facing ledger still prints ranges only; vendor names stay in the internal source column.


---

## Task 11 — Offer Mirror run — 2026-07-25 (filed 2026-07-26)

Source: the Offer Mirror full ladder (docs/handoff/offers/), all five stages complete. Evidence: `lib/strategy/offers/{mirror,drift,perception}.generated.ts`, dashboard at `/strategy/offers`. IDs: U-xx claims · F-xx findings · D-xx drift rows · DD-xx deploy divergences · P-xx perception records. Founder decisions FD1–FD9 (2026-07-25, chat, recorded verbatim in drift grades) supersede both copy and older canon where they conflict. This block is append-only; it enters the Task 10 build sequence as **batch 6** (no edits made to Task 10's table per the append-only rule).

### 11.0 — Ratify the founder decisions (GATE:HUMAN, blocks 11.2)

FD1–FD9 collide with signed fences (D1–D12 + §16, the verbatim guarantee, R1–R9). Do not silently edit signed docs. One dated amendment: **§17 on `00-offer-architecture.md`** recording FD1 (no published-pricing claim), FD2 (all pricing unpublished except Catalog AI per-SKU; sprints/pilots retired; install-first), FD3 (no outcome guarantees; enablement + KPI-tracking posture), FD4 ($2M/yr industrial floor, $200k+/mo e-com as aspiration), FD5 (industrial promise = installed future-proof system; citations = mechanism; reopens IND-2), FD6 (12 cylinders), FD7 (no duped-buyer framing), FD8 (machine layer regenerated from registry), FD9 (no absolute privacy claims; capture-copy-first sequencing) — plus a rider on `04-signoff-sheet.md`.

### 11.1 — P0 execution batch (no fence conflict; mostly already-signed work never executed)

1. **D-23 / F-01** Proof integrity: execute the fact-ledger resolution (rename the noindex v2-1 composite); collapse each headline metric to ONE attributed engagement; reconcile date windows. Blocks all outreach scaling (perception fix #8).
2. **F-02** Wire or remove `/future-proof-your-seo/` (form is a stub); send real confirmations on the four silent funnels or rewrite thank-you copy; per-funnel thank-yous (D-19).
3. **F-10 + DD-02** Gate or delete the four preview routes (two carry live forms + the $30K anchor); stop rendering GATE:HUMAN-unsigned calculator presets as crawl-visible text.
4. **D-17** Execute signed ARCH-3 removals + three new strays: "8–15% positive reply rate by week six", "zero-lock-in clause in every SOW since 2021", the 87%-vs-parker.com artifact naming a real client.
5. **Voice breach**: remove the **LSEO** citation + link from `sanity:glossaryTerm/answer-engine-optimization` (banned competitor named in published, indexed copy).
6. **D-18** Commit + deploy the uncommitted medical-options fix; add a `medical` union member.
7. **D-20 / F-21** Delete the orphaned components (extend Task 6 B list: GEOPPCBoost, RealResults, ServicesSystem, ServicesByLeak, BuildOptimizeAmplify, PhaseDetailedFramework, CTABand, ServicesIndex, ContactJourney, TheLeak, VerticalFork, unused concept files).
8. **F-20** Hygiene sweep: kill the demo post (example.com link, phantom glossary slug), set authors on all 20 posts, publish `industry` docs or drop the dead query, strip `(Source: docs/strategy/…)` internal paths from six career-path pages.
9. **DD-01** Deploy the current homepage title; GSC recrawl requests for `/` and `/book-growth-call/`.
10. **F-22 / D-19** FooterSwitch route-awareness (pillars get the right footer); register or remove `/bots` + `/ai-readiness/` dead refs.
11. **F-25** Add one vertical self-ID field across forms → thank-yous → CRM (every industrial lead currently buckets to "other").

### 11.2 — FD-driven copy program (blocked on 11.0)

1. **Pricing removal sweep (FD1+FD2)**: hub combo table + "$4–15K/mo" bands + FGO floors + sprint/pilot tiers and anchors (`/constraint-sprint/` retires with redirect; EngagementModel sprint tier; book-growth-call "$12–24k" anchor; outbound pilot card) — Catalog AI per-SKU survives. "Published pricing model" claim struck everywhere (SSOT patch). **$30K install floor = open decision 11.3.2 — untouched until decided.**
2. **Guarantee replacement (FD3)**: retire the day-90 sentence everywhere it renders (dentists, medical, home-services, LP, previews) and the anti-guarantee taunt on consumer ("A guarantee is what you reach for when the fee is hidden" — indicts nothing once no one guarantees). Direction drafts (GATE:HUMAN before shipping), one per vertical, same skeleton — *we run the system; the close is yours; we install, train, and track*:
   - Trades: "We build and run the system that answers, books, and chases. Whether the job closes still comes down to your crew — the estimate, the price, how you show up. So we don't promise your outcomes. We install the best system we know, train your people on it, and sit on the numbers with you every month until the KPIs move."
   - Dental: "The system reopens quiet treatment plans and catches the calls your desk can't. Case acceptance still happens chairside — how the plan is presented, how financing is offered. That's yours. We install, train the front desk, and track recall, reopened plans, and booked chairs with you."
   - Consumer: "We put your store in the answers and chase every quote and cart. Whether the piece sells is still your floor — merchandising, pricing, the conversation at the counter. No outcome guarantee: the best-known system, your team trained on it, the sales line reviewed monthly."
   - Industrial: "We install the system that gets you found, quoted, and re-ordered. Winning the RFQ is still your counter — pricing, stock, response speed. We don't guarantee quote counts. We install, train inside sales on it, and review the numbers with you every month."
3. **Wedge reframe (FD7)**: replace "You've been sold pieces" family (ProblemShift, ProductWedge, FlowBlock, medical hero E candidates) with complete-system gain framing; re-check the homepage FLOW-1 arc.
4. **Industrial promise re-cut (FD5)**: hero + `/services/ai-seo/` lead with the installed future-proof system; citations as mechanism ("named by AI" stays as evidence, not headline). Reopen IND-2. Humanize U-12's line in the same pass (keep the insight, kill the robotic cadence).
5. **Floor change (FD4)**: `/book-growth-call/` + `/unlock-growth-audit/` fit copy → $2M/yr floor, $200k+/mo e-com as "where we do our best work"; ICP + SSOT patch.
6. **Taxonomy sweep (FD6 + D-09/D-14/D-31)**: 12 everywhere; Sell→Convert in previews (if previews survive 11.1.3); Prove phrased as the measurement layer.
7. **Machine layer (FD8/D-11)**: build-step generation of llms.txt + Organization JSON-LD from `lib/revenue-engine.ts`; four verticals, 12 cylinders, canonical tagline; wire `business.tagline` into schema slogan (D-15).
8. **Instrument claims (FD9/D-12)**: replace "No sign-up, nothing saved" / "No newsletter · No call · Just the runs" with honest-light capture copy; **sequencing rule: no warming of any email captured under the old copy**; align privacy claims with actual flows (CCPA one SLA; banner claim vs GA4 user_id — D-26-adjacent compliance pass).
9. **Voice debt (drift voicePass)**: metadata-first de-jargon pass on the industrial book (ai-seo title leads with "GEO Agency"; hub description acronym stack); em-dash density on RE vertical pages; adjudicate the three list conflicts (dashboard vs words-to-use; GEO/SEO as product names; PIM-in-glossary exempt ruling).

### 11.3 — Founder calls needed (each one line, decide in any order)

1. **G5 / D-25**: canonical Revenue Leak Audit URL — `/revenue-engine/` router vs `/industries/home-services/#audit` (canon disagrees with itself; every audit CTA waits on this).
2. **D-04**: does the $30K install floor stay published on vertical pages, or does FD2 silence it too? (If it goes, the calculator join-line re-specs.)
3. **D-26 / F-04**: which entity string is legally true — "IT Sale Solution LLC (FL)", "Sale Solution" (SSOT), or the Delaware C-corp line? One address. Then one sweep.
4. **D-24**: sign C-07/C-08 (sourced) or make the live "1 in 3 calls" line qualitative.
5. **D-27 / F-13**: ToS §5 ML-training ban vs llms.txt invitation — counsel carve-out for retrieval/citation, or accept knowingly.
6. **D-28**: confirm the hub-lede umbrella re-scope (content stays industrial-weighted; recommendation already adopted in the blog pack).

### 11.4 — External-impact fixes (perception.fixList, ranked; full rationale in perception.generated.ts)

Third-party profile refresh (Clutch price bands, Crunchbase, ZoomInfo, LinkedIn) → deploy+recrawl freshness (DD-01/DD-04) → machine-layer regen (11.2.7) → category-answer inventory (blog relaunch pack + roundup/directory placement; consumer-DTC is the open lane) → entity hardening for name collisions → attested wins into diligence surfaces as they land → tomba.io removal request → proof-integrity fix first (11.1.1).

### 11.5 — Content program

The educate-lane rebuild runs as its own gated program: **`docs/handoff/new-blog/01-prompt-blog-relaunch.md`** (triage ledger for the 29 legacy docs → founder gate → engine-pipeline rewrites, FD-compliant by construction). The ~950 voice violations in legacy Sanity content resolve there, not by patching 2023 posts in place.

**11.3.3 — ANSWERED (2026-07-26).** Entity: IT Sale Solution LLC, a Florida limited liability company, d/b/a Salesolution. Address: 17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160. Canonical inbound: connect@salesolution.net. Identity sweep executed in working tree (F-04/D-26); display-brand spelling (Sale Solution vs Salesolution) remains the open F-17 wordmark call.

**11.2.8 — EXECUTED (2026-07-27).** F-06/FD9 privacy batch: false storage/leave-site absolutes removed; CCPA SLAs scoped per request type (45 days access/deletion, 15 business days opt-out); probe capture copy now honest-light (future marketing allowed, one-click unsubscribe); tools claim scoped to the in-browser calculators; legal Last-updated bumped to July 27, 2026. Founder decision: pre-existing unlock captures go into campaigns — flagged FTC-deception/CCPA purpose-consistency risk + unverified-address deliverability; mitigation offered (first email doubles as notice). Ops item, off-repo.

**11.1.2 — EXECUTED (2026-07-27).** F-02: checklist funnel wired (asset created at /checklists/ai-search-survival/, GATE:HUMAN QA before deploy; instant delivery email); prospect acknowledgments added to audit, catalog-snapshot, sprint, contact, call-fallback, and revenue-leak-audit funnels — instant ack, honest delivery window, gated on successful capture. Contact/call shared thank-you page routing stays F-22 scope.

**11.2.1 — EXECUTED (2026-07-27) + 11.3.2 — ANSWERED.** F-03/FD1/FD2: founder confirmed the $30K install floor stays published; Catalog AI per-SKU remains the one fully-priced page. All other price figures removed from rendered surfaces (hub combo table, cylinder bands, retainer/sprint/pilot/build bands, FGO floors, ServicesTabs shapes); published-pricing claim replaced with floor-honest framing; /constraint-sprint retired (deleted + 308 → /book-growth-call/, sitemap updated); catalog-snapshot turnaround aligned to 2 business days. Guarantee-adjacent copy untouched pending the F-07 decision.

**11.2.2 — EXECUTED (2026-07-28) + F-07 DECIDED.** Guarantee replaced sitewide: 120-day cost-recovery (system-attributed revenue ≥ install + fees paid, clock from signing, install by day 60, remedy = work free until covered), book-jobs verticals only. Sell-product (industrial, consumer) keeps no-guarantee with the cycle-length + counter-control rationale; the fee-hidden taunt and the published-prices trade are retired. Canonical sentence lives in Guarantee.tsx. SSOT patch suggestions: 00 §6/§11 settlement math, 03 §2.9 protected string, home-services §3/§9, medical-dental §3, product-marketing-context §Guarantee.
