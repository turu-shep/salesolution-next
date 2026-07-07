# 04 — Offer Consolidation Sign-off Sheet

**Date:** 2026-07-07 · **Owner:** Artur · **Companion:** `03-migration-build-plan.md` (tasks 1–2, 4–6, 8–10). This sheet is task 3 + task 7 folded in.

> **✅ §A SIGNED 2026-07-07 (founder, via session):** all §A1 rows + the §A2 C-06 claims row signed **as recommended**, with two riders: **(1) MED-hero = OPEN** — founder asked to see the §5.1 A/B/C texts before picking; the medical hero swap holds until the pick (everything else on the pillar migrates). **(2) MED-8.5 = SIGNED, dental skin adopted** — "The cases you already earned" / "Earned, plus new patients" / "The whole practice, run for you" (03 §2.8), proposal-template-only, re-wordable per rate letter. Fabricated-proof strays (ARCH-3) proceed as the pre-signed default: **removed, none attested**. §B and the claims tables (C-07…C-13, industrial/jewelry banks) remain open — pages ship qualitative until signed per row. §D13 stays PARKED. Build authorized from this session, batches per 03 Task 10.

## How to sign
Write **SIGNED**, **REJECTED**, or **DEFER** next to each **row id** below (front of the id cell is fine). One pass, top to bottom. A signed row clears the GATE:HUMAN on the copy blocks it governs; a rejected row leaves the page shipping its current/qualitative version; a deferred row parks with no build impact. Sign **§A first** — those rows gate the migration PR and the live Beautiful Smiles deal. **§B and the claims/ledger tables can wait.** **§D13 is PARKED — do not sign; build nothing from it.**

## Read-me / the fences (nothing below re-opens these)
- **D1–D12 + §16 are SIGNED and win on everything; §16 wins over the architecture body.** Nothing here re-opens them.
- **The guarantee sentence is untouchable — quoted verbatim only, never paraphrased:** *"If the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does."* Live baseline pin: `Guarantee.tsx:28-31` = "beat my **monthly** fee" (verified 2026-07-07). No row edits it.
- **R1–R9 (`02-visible-value-pass.md` §1) are binding on every proposal artifact.** No row overrides them.
- **Competitor / platform / vendor names never enter a customer-facing copy block or template.** Vendor names appear only in the internal *source status* column (as sourcing provenance).
- **Every copy block listed stays GATE:HUMAN until this sheet clears it.** Recommendations are quoted from the specs; where a spec made none the cell reads "no recommendation — founder call." No recommendation is invented.
- **Task-7 verification sweep (2026-07-07) is folded in:** ledger rows whose URL opened clean read **OPENED 2026-07-07**; corrected rows carry the corrected figure; **STRIKE** rows stay listed, marked struck with the reason, so what died is visible. No new stats beyond that sweep.

**Bucket rule (build-sequence, not importance):** *SIGN TO UNBLOCK* = gates the one-PR migration pass (all pricing surfaces at once, D1) and/or the live Beautiful Smiles book-jobs proposal (active dental deal, this month). *CAN WAIT* = proposal-layer polish, page stat-arming that ships qualitative today, ledgers not yet facing a buyer, and the Phase-6 jewelry niche page.

**Mechanical stragglers ride the migration without founder sign-off** (listed here so they aren't mistaken for decisions): `Setup:`→`Install:` on the 5 live spec rows + the 6th at `PlanByPillar.tsx:88`; orphan-component deletion (`ComparisonTable` / `RevenueRateCard` / `StatRow`); the `AuditCTA vertical` fix (already staged, see MED-8.3); the 6 book-jobs cylinder-page CTA fixes to Revenue Leak Audit; the signed floor-line formula; the `product-marketing-context.md:30` update (D3); `floorLine?` / D5 spec props; the `[S5]` FirstPageSage citation repoint; `briefs.generated.ts` regeneration corrections (home-services §10.6).

---

## §A. SIGN THESE TO UNBLOCK THE BUILD

### A1. Decisions (gate the migration PR and/or the live Beautiful Smiles deal)

| id | what (one line) | recommendation (from spec) | what signing it unblocks | source status |
|---|---|---|---|---|
| **IND-2** | Industrial pillar hero A/B/C (`/industries/industrial-distribution/`) | **B** ("A buyer asked ChatGPT who stocks the part. It named someone else.") — keeps AIOverviewMockup + current argument | Migration of ENGINE HERO §1 + hero spec card; can't swap hero without the pick | GATE:HUMAN (industrial spec DRAFT) |
| **HS-4** | Home-services hero A/B/C (`/industries/home-services/`) | **A** for the page ("You drove out, measured the roof, sent the quote. Then nobody chased it."); **C** held for the pricing-section lead-in | Migration of `RevenueHero` §9.1 | GATE:HUMAN |
| **MED-hero** | Medical pillar hero A/B/C (`/industries/medical-aesthetics/`) | **no recommendation — founder call** (§5.1 offers A/B/C, no single pick; spec flags current hero is Convert-only and misses the Retain pool — A, dormant-database, is the Retain angle) | Migration of `RevenueHero` + adds the §5.1 leak-math join block | GATE:HUMAN (medical DRAFT) |
| **D-C5** | Consumer-brands pillar hero (`/industries/consumer-brands/`) | **Option A** (showrooming wound, verbatim owner language) — DECIDED direction | Migration of `RevenueHero` §5.1 headline | GATE:HUMAN (decided rec) |
| **D-C6** | Consumer-brands wedge wording | **Adopt** the sharpened wedge: "They love it in your store, then buy it online — and your best past customers quietly drift to whoever reached out first." | Hero + Bring-card copy on the consumer pillar | GATE:HUMAN (VOC: PARTIAL-leaning-confirm) |
| **D12-arch** | Canonical D12 install-frame calculator line — "If the install runs $30,000, the recovered work above covers it in the first N cases — and the month-to-month fee after that has to clear the second line on your report, or I work free until it does." | **Adopt**; N computed live from inputs | Every book-jobs calculator re-anchor; replaces the retired "$2,500/mo" illustration | GATE:HUMAN (architecture; signed pattern / unsigned wording) |
| **HS-3** | Home-services D12 calculator copy set (anchor + N-payback + guarantee hand-off, §5.1/§9.3) | **Adopt the block set as written**; N = ceil($30K ÷ avg-job) | `Concept3Calculator → WholeFlowLeak` core swap on the home-services page | GATE:HUMAN (guarantee hand-off = the verbatim day-90 sentence; see header pin) |
| **D12-MED** | Medical payback-line variant | **Variant A** (guarantee-correct: revenue beats fee); Variant C carries the monthly presentation | `WholeFlowLeak` payback copy on dentists + ported pillar | GATE:HUMAN |
| **D-C1** | Swap jewelry/consumer `Concept3Calculator` → `WholeFlowLeak` + §3.2 presets + §5.1 join ("The install starts at $30,000. At your average sale, that's [N] pieces — once.") | **Adopt** — it's the defect fix (today the calc shows a ~$20K leak next to a $30K install) | Consumer pillar calculator §3; jewelry niche calc | GATE:HUMAN; real component work + per-preset QA |
| **MED-8.2** | Port dentists `WholeFlowLeak` (medical presets) to the pillar vs a minimal $6K default | **Port it** — the site's best pattern; makes the leak-math join possible | Medical pillar calculator swap; enables the §5.1 join block | GATE:HUMAN |
| **IND-3** | Industrial: ship a calculator now vs the three-line leak block first | **Three-line block first** (honest without engineering; the diagnostic carries the personalized math) | Determines the §2/§6.2 build in the migration PR | GATE:HUMAN |
| **IND-6** | Industrial leak-model defaults (RFQs/wk 60 · avg order $2,000 · never-chased 25% · lapsed #/$) | **Publish "labeled as our defaults"**; the diagnostic swaps real numbers in 24h | Leak block / optional calculator can go live | GATE:HUMAN (defaults CONFIRMED as inputs; A4 weakest, internal-only) |
| **ARCH-3** | Attest-or-remove the fabricated-proof strays (§16 Item 6): "42 sprints"/"never invoked"; "42 e-commerce brands"/+32% CVR/4.9-Clutch; "in the last 18 months"; 30/70 split; "14 reviews"; "About 60% of builds pair with Catalog AI" | **Attest the real ones → claims rows, or they come down in the migration pass** (default = removed) | constraint-sprint page + `SprintDeliverables`; `/unlock-growth-audit/`; webdev page + `ServicesIndex`. Code-verified live: "42 sprints" ×2, "60% of builds" ×2; **"60/30/10" = 0 code hits, ignore** | CONFLICT — live unsourced proof; time-boxed to the migration pass |
| **ARCH-1** | Book-jobs three-option trio **final wording** | **§16 working names are locked: "The leak sealed" / "Sealed, plus demand" / "The whole flow, run for you"** — final wording is founder call before any template | Book-jobs proposal / rate-letter template (Beautiful Smiles is live) | GATE:HUMAN (renamed per §16; old "Sealed & Fed"/"Owned" failed the voice check) |
| **MED-8.5** | Medical three-option names (§4) | **no recommendation — founder call** (§8 #5: working directions only; need Artur's wording before any proposal template; mirror the concrete sell-product ladder) | Dental/medical proposal template for the live deal | GATE:HUMAN |
| **MED-8.1** | Promote C-06 (case-acceptance) to a filed claims-library row | **Yes** — verified at two URLs, adversarial; the qualitative-only constraint was "until sourced," now sourced | dentists Recover step + medical pillar `PlanByPillar`; the live dental call (§3 proposal: "sign C-06 before call or stay qualitative") | files the **C-06** claims row (§C below) — CONFIRMED (dual-URL) |
| **MED-8.3** | Fix `AuditCTA` vertical bug now vs in the migration | **Fix now, separately** — it mis-submits the highest-ticket buyer's form today | `medical-aesthetics/page.tsx:249` | Mechanical; **already staged** — uncommitted git diff adds `vertical="dental"` (verified 2026-07-07) |

### A2. Claims row that is call-ready for the live deal

| id | claim | recommendation | what signing it unblocks | source status |
|---|---|---|---|---|
| **C-06** | "The average dental practice accepts 45% of presented treatment plans; top performers reach 75%." Attribute as "Henry Schein One 2026 Catalyst Index." | **Yes — file the row** (MED §8 #1; MED-8.1 above) | dentists Recover step; medical pillar `PlanByPillar`; the Beautiful Smiles call (§3: sign before call or stay qualitative) | CONFIRMED (dual-URL, adversarial; press release + blog, May 2026). Vendor-published; exact N + dollars-vs-procedures definition gated behind download |

---

## §B. CAN WAIT (proposal-layer, page stat-arming, future niche)

### B1. Decisions

| id | what | recommendation (from spec) | what signing it unblocks | source status |
|---|---|---|---|---|
| **D14-a** | Adopt the visible-value pattern at the **proposal layer** for all three ported verticals under R1–R9 | **Adopt** | Both proposal-sheet templates (book-jobs + sell-product) | GATE:HUMAN (visible-value pass DRAFT; verify pass did NOT run) |
| **D14-b** (= D-HS1 / HS-6) | Home-services install scope: foundation-shaped (site+content+ads in) vs engine-only | **Foundation-shaped as the proposal default; engine-only fallback** (content ~10/mo across install, growth-past-N on retainer, site scoped at signature) — "the big one" | Blocks the first contractor proposal (no contractor deal imminent) + the home-services install-contents narrative | GATE:HUMAN — decide once (same decision lives in `02` §5 and home-services §3b.1) |
| **D14-c** | Bought-alone figures proposal-only or also on pages | **Proposal-only for now** (R4/R7); revisit pages only after the ledger survives 3–5 live proposals | Keeps the §9 page matrix untouched | GATE:HUMAN |
| **D14-d** | Industrial framing "offense/defense" vs "grow it / keep it" | **"Grow it / keep it" (R5)** — anti-jargon buyer | SOW grouping only (does NOT change the page map) | GATE:HUMAN |
| **D14-e** | §2 defense-menu printability column + CCPA never-claim rule | **Adopt as written** (no vertical under ~$26.6M revenue may be sold CCPA protection) | Defense faces in both templates | GATE:HUMAN |
| **D14-f** | Re-open every SEARCH-status ledger row before any buyer sees it | **Required before first use** (subagent sweep) | First buyer use of any ledger | **Task-7 sweep executed 2026-07-07** — see §E: 4 CONFIRMED, 1 CORRECTED (LSA fee), 1 STRIKE (call-answering composite); cross-vertical rows now carry URLs |
| **HS-1** (CAP-HS) | Home-services capacity **N** ("I install N engines a quarter") | **Only ship if N is true and honored publicly; fallback = named-operator line, no count.** "Question for Artur: what is N?" | Optional §7 Seasonality capacity line (the page ships without it) | GATE:HUMAN — UNRESOLVED |
| **HS-2** | Sign the C-07…C-13 home-services claims rows (umbrella) | **Sign per row** (see §C) | Re-arms `Concept2Evidence` leak cards with 2024–26 sources | GATE:HUMAN (page ships qualitative today) |
| **HS-5** | Electrical sub-floor tier: stays dead vs amend D2 | **Keep the floor / stays dead** (default) — electrical is eyebrow + presets + audit-intake only; decline sub-$30K. Amending D2 for a $15–20K tier is **not recommended** | Whether home-services markets electrical as a lead trade | GATE:HUMAN only if the tier is wanted |
| **HS-7** | §3b home-services ledger rows + defense lines | **Adopt; open each SEARCH row at its URL first** | Home-services book-jobs proposal ledger | GATE:HUMAN — task-7 sweep 2026-07-07 folded (see §E): 1 CONFIRMED, 3 CORRECTED, **1 STRIKE** (retention engine — blocks that line until sourced) |
| **IND-1** | Approve/strike the **48-claim bank** (umbrella); B3/C8/F3 carry PARTIAL corrections | **Each approved row gets a claims-library entry before page use** | Any on-page/anchor stat on the industrial page (ships without them) | 46 CONFIRMED / 2–3 PARTIAL (see §C industrial banks) |
| **IND-4** | Exact staged-billing split "50/25/25" | **Confirm** — architecture §11 default already = 50/25/25 | Terms lines across pages (ship as the signed default) | GATE:HUMAN (exact staging) |
| **IND-5** | Tenure line (adopt Zato-style "take your accounts and data") | **Withhold until real tenure data exists** (default) | A future trust line; nothing today | GATE:HUMAN |
| **IND-7** | `/unlock-growth-audit/` legacy claims held out of this vertical until attested | **Keep OUT until attested** (matches ARCH-3) | The audit page's industrial-facing claims | §16 Item 6 — held |
| **IND-8** | Build the sell-product SOW/proposal template (§4 three options + value-stipulation header + staged billing + month-4-retainer-at-day-0 + §4b visible-value layer) | **Build; open 2 SEARCH ledger rows first** (editorial rates; Rigby/k-ecommerce corroborator) | Industrial + consumer/jewelry proposals | Mechanical/founder — task-7: editorial CORRECTED (ClearVoice DNS-fails → biztoolkit; internal guidance only). **Flag:** Rigby/k-ecommerce corroborator has no visible SEARCH row — reconcile before first use |
| **MED-8.4** | Full-arch modeling: raise cosmetic `avg` toward $20–27K vs keep $5,000 | **Keep $5,000 slider default** (blended); caption corrects the ~$15K mental model; use $20–27K/arch in audit math | Confirms `DENTAL_PRESETS` (calc already live at $5,000, labeled illustrative) | GATE:HUMAN |
| **D-C2** | Paid written demand audit (~$2,500, 15-findings pledge, 100% install credit) as jewelry's 2nd door | **Adopt** — premium-calm, market-native ($1.5–7K observed), extends D7 | New entry door on consumer/jewelry | GATE:HUMAN |
| **D-C3** (CAP-CJ) | Consumer/jewelry capacity number (installs/quarter) | **Set it honestly and publish it once** (never a countdown); fallback = named-operator | Seasonality line ("signed by early July, installed before October") on the jewelry niche (Phase 6) | GATE:HUMAN — not set |
| **D-C4** | Liori Diamonds consent ask | **Ask now, request named**; anonymized-but-specific fallback | Fills the consumer/jewelry PROOF-SLOT (empty until then) | GATE:HUMAN |
| **D-C7** | Content foundation (~30 buying-guide articles, ~10/mo) into install scope | **Adopt for SOW default** (mirrors dental; feeds Bring) — growth-past-30 lives cylinder-side | Jewelry/consumer proposal scope; article count = a checkable commitment | GATE:HUMAN |
| **D-C8** | Visible-value SOW layer (§4.4): priced ledger + two faces + transfer bridge | **Adopt, SOW-only** | Consumer/jewelry proposal artifact | GATE:HUMAN — task-7 sweep 2026-07-07 folded (see §E): all 6 jewelry rows CORRECTED/CONFIRMED, URLs attached, several bands narrowed |
| **CJ-niche-hero** | Jewelry & Luxury niche page hero (§5.2 A/B/C) | **no recommendation — founder call** (pick from §5.2 when built; Phase-6 lazy rule, earned by client/demand) | Future `/revenue-engine/jewelry/` | GATE:HUMAN — future |
| **ARCH-4** | Proof-bar stats $378M / 91% / 96 (home + `/services/ai-seo/`) | **No action — RESOLVED**: §16 Item 1 approved all six in `lib/stats.ts`; render on exactly the two pages; 5.2x/$575k unused. Sell-product surfaces ONLY | Closes the §13 "verify vs `lib/stats.ts`" flag | CONFIRMED (§16 Item 1) — no signature needed |

---

## §C. PROPOSED CLAIMS-LIBRARY ROWS

Each = founder approve/strike. Every page ships **qualitative until the row is filed** (so these are CAN-WAIT), except **C-06** which is call-ready and sits in §A2. A row enters copy only via `_claims-library.md` + the spec §4 source table, with URL + status.

### C.1 Home-services C-07 → C-13 (§10.1) — sign per row (HS-2)

| id | claim (max phrasing) | recommendation | what signing it unblocks | source status |
|---|---|---|---|---|
| **C-07** | Only 55% of home-services callers reach a person (HVAC 52%, plumbing 56%, construction 53%) | Approve | retires the unsourced C-05 "1 in 3" hedge | ✅ CONFIRMED — Invoca Home Services 2025 (60M+ calls), 2025-06-10 |
| **C-08** | 27% of calls not answered | Approve | conservative twin; repeated by Housecall Pro | ✅ CONFIRMED verbatim — Invoca blog, 2024-05-23 |
| **C-09** | Qualify odds drop 21× (5→30 min); contact odds fall >10× within the first hour | Approve — **disclose 2007 vintage** | pairs with C-01 | ✅ CONFIRMED — Oldroyd/InsideSales, 2007 |
| **C-10** | 56% never ask the caller to book/buy; 46% of handled phone leads convert on the call | Approve | backs BOOK | ✅ CONFIRMED — Invoca 2025 (p.4/p.33) |
| **C-11** | Only 16% of contractors follow up same-day on unsold estimates | Approve | backs RECOVER; roofing lead stat | ✅ CONFIRMED — ServiceTitan 2026 Roofing & Exteriors, 2026-01-14 |
| **C-12** | "Up to 85%" of unanswered callers won't call back | Approve **only** with "up to" + attribution | weakest bank row | ⚠️ hedge-only — CallRail relay, 2025-01-20 |
| **C-13** | Booking rates after 6pm: 61%→21% (large), 26%→9% (small) | Approve — **disclose 2022** | the after-hours claim that survives | ✅ CONFIRMED — ServiceTitan, 2022 |

**ID-COLLISION flag (surface before filing):** the medical supporting rows §7.1 reuse **C-07/C-08/C-09** for *medical* claims (Synchrony 92%/58% deferral; Catalyst 72%→64% retention; Heartland 60–70% answer rate, BANKED w/ CORRECTION — non-centralized subset, not "1 in 3"). These clash with the home-services C-07..C-09 above. One numbering must yield before either files into `_claims-library.md`. Medical case-value rows (implant $3–6K; full-arch $20–27K) are internal modeling refs, not on-page.

### C.2 Industrial 48-claim bank — page-usable candidates (IND-1) — all GATE:HUMAN → claims-library first

| bank | page-usable ids | recommendation | what signing it unblocks | source status |
|---|---|---|---|---|
| **A** (leak/copy anchors) | A1 (1-hr contact ~7×/>60×, HBR 2011) · A2 ("42 hours" avg reply hero anchor) · A6 (26.9% durable-wholesale margin → ~27¢/$ converter) · A7 ("up to 35% of orders contain profit leaks") · A8 (1pt retention → +20% earnings, keep qualifier) | Each approved row → a claims-library entry before page use | leak block / hero copy anchor / calculator margin line | 46 CONFIRMED / 2–3 PARTIAL run; A3/A4/A5 supporting/internal, not page |
| **B** (install argument) | B1 (25% e-com adoption $10–50M) · B2 (66% buy online before contact) · **B3 PARTIAL** (datasheets 40% of ALL buyers — use 40% unless hardware) · B4 (45% dissatisfied online) · B6 (e-com ROI satisfaction split) · B7 (distributor AI Marketing 22%→48%) · B8 (94% business buyers used AI) | Approve per row; B3 carries the correction | install-argument stats on the industrial page | CONFIRMED except **B3 PARTIAL**; B5 supporting |
| **C** (CMO/Amazon anchor band) | C1 (Amazon Business $35B+ GMV — strongest anchor) · C2 (12% referral toll ≈ $120K/yr on $1M) · C3 (mfg CPL $691/$415/$553) · C4 (comp 7.9% of revenue) · C5 (20–30% of customers = all earnings, whale curve) | Approve per row | §9 CMO-replacement anchor band | CONFIRMED; C6 supporting; **C7/C8 footnote-only** (C8 PARTIAL: 1.25–1.4× = taxes+benefits only) |
| **E** (AI-search urgency) | E1 (AIO 6.49→24.61→15.69%, show pullback) · E2 (B2B AI-trigger 36→82%, scope window) · E3 (8% vs 15% click, never "cut in half") · E4 (58% lower CTR, "we already rank #1" objection) · E5 (94% used genAI — strongest single stat) · E7 (ChatGPT citations top-10 46%) · E8 (~38% AIO-cited pages rank top-10) | Approve per row, with the strict phrasing rules | AI-search urgency stats on the industrial page | CONFIRMED; E6 restricted trendline |

*Bank D (done-deal mechanics) and Bank F (EV/succession) = internal-rationale / value-conversation / SOW — none page-usable. F1 needs a URL repoint (architecture §14 404s → repoint `[S5]`). BANNED list respected (no "78% first responder," no "clicks cut in half," no distributor-marketer-% stat).*

### C.3 Jewelry banks — page-usable candidates

| bank | ids | recommendation | what signing it unblocks | source status |
|---|---|---|---|---|
| **J** (jewelry economics) | J1 ($4,600 avg ring) · J2 (lab $4,300 / natural $7,000) · J4 ($2,739 per-item) · J6 ($1,800/couple bands) · J7 (~half never retained) · J8 (75% non-bridal / $4,063) · J9 (81.4% cart / 0.7% conv) · J12 (5 jewelers / 1–3 mo) · J13 (64% buy in-store) · J14 (seasonality 35%/20%/37%) | Approve per row; flag vintages (J6=2023, J7=2021, J14=vintage); J9 vendor-flag | jewelry niche page calculator avg, hero, leak cards, season block | CONFIRMED/BANKED at source; J3/J5/J10/J11/J15/J16 = context/qualification, not page |
| **V** (exit/EV) | **NONE page-usable** — §2.3 explicit: conversation-only, never page copy | — (no page action) | value-conversation script only | V1 (SDE median **1.94×** — **CORRECTED** from misattributed 2.49×); V2–V5 call-script only |

---

## §D. VISIBLE-VALUE LEDGER — TASK-7 SWEEP VERDICTS (2026-07-07)

The URL-opening sweep executed D14-f / R7. **No new stats beyond these corrections.** STRIKE rows stay listed but are **blocked from print** until a real source is attached. These fold into D14-f (cross-vertical), HS-7 (home-services), D-C8 (jewelry), IND-8 (industrial editorial).

| ledger row (vertical) | sweep verdict | corrected figure / reason | URL (source status) | under |
|---|---|---|---|---|
| Trade content foundation ($250–500/article; $3–8K one-time) — cross-vertical | **CONFIRMED** | $250–500/article openable; $3–8K is a derived 10–15× rollup, not a quoted figure | OPENED 2026-07-07 — thecontentwritingcraft.com | D14-f |
| Trade content foundation — home-services | **CORRECTED** | Elorites per-word backs into it; Clutch page does NOT show $3–8K; derived estimate, not quotable | OPENED 2026-07-07 — eloritescontent.com | HS-7 |
| Google Ads + LSA (LSA fee) — cross-vertical | **CORRECTED** | $650/mo mgmt confirmable; LSA-specific fee + $500–1,500 setup + $2,650 top **not openable** — re-source/reframe | OPENED 2026-07-07 — cornerclicks.com | D14-f |
| Google Ads + LSA (LSA $149/mo) — home-services | **CONFIRMED** | $149/mo + $499 setup, stated plainly | OPENED 2026-07-07 — footbridgemedia.com | HS-7 |
| Retention/reactivation engine — cross-vertical | **CONFIRMED** | $500–3,000/mo + $2K–5K setup within the source's $2K–10K one-time | OPENED 2026-07-07 — setsail.ca | D14-f |
| Retention/reactivation engine — home-services | **STRIKE** | No publisher for $2K–5K setup + $500–3K/mo (Sender = own SaaS only) — **do not print** | struck 2026-07-07 (no citable source) | HS-7 |
| Review/reputation ($299–1,000/mo tiers) — cross-vertical | **CONFIRMED** | Trustpilot $299/$629/$1,099; top tier $1,099 slightly over the rounded $1,000 | OPENED 2026-07-07 — capterra.com/Trustpilot | D14-f |
| Review/reputation program — home-services | **CORRECTED** | Cite openable analysis (reviewflowz, Birdeye $299/mo), not lead-gated vendor pages; $1,000 top ≈ Podium Enterprise | OPENED 2026-07-07 — reviewflowz.com | HS-7 |
| Call answering/tracking + two-lines dashboard — home-services + cross-vertical | **STRIKE / CORRECTED** | Tracking $45–195 CONFIRMED (cloudtalk/CallRail); **answering $250–1,725 unsourced**; composite ~$300–1,900 derived — **do not print the composite** | OPENED 2026-07-07 (tracking) — cloudtalk.io; answering struck | HS-7 / D14-f |
| Editorial foundation ($0.50–1.00/word) — cross-vertical | **CONFIRMED** | Within market (BestWriting $1.00/word avg); internal rate note, never buyer-facing as printed | OPENED 2026-07-07 — bestwriting.com | D14-f |
| Editorial foundation — industrial | **CORRECTED** | ClearVoice URL **DNS-fails**; biztoolkit corroborates $0.50–1.50/word; internal guidance only | OPENED 2026-07-07 — biztoolkit.co | IND-8 |
| Jewelry site custom band ($10–30K) | **CORRECTED** | Matches as stated; attach the URL | OPENED 2026-07-07 — cartcoders.com | D-C8 |
| Jewelry content library ($150–500/article) | **CORRECTED** | Joy Joya jewelry-specific $150–**$700**; upper is $700 not $500; $249/mo not found — correct the band | OPENED 2026-07-07 — joyjoya.com | D-C8 |
| Jewelry Local SEO + GBP ($1,500–3,000/mo, up to $6K) | **CORRECTED** | WebFX/seo.com $500–3,000 typical ~$1,000; **drop the $1,500 floor + $6K + $199 SaaS** | OPENED 2026-07-07 — webfx.com / seo.com | D-C8 |
| Jewelry Email/SMS retention ($1–5K setup + $2.5–10K/mo) | **CORRECTED** | trypropel supports $2.5–10K/mo; **$1–5K setup + platform figures not found** | OPENED 2026-07-07 — trypropel.ai | D-C8 |
| Jewelry Review/reputation ($299–449/mo per location) | **CORRECTED** | costbench confirms Starter $299/Growth $349/Dominate $449 — now sourceable | OPENED 2026-07-07 — costbench.com / birdeye.com | D-C8 |
| Jewelry Response layer ($40–300/mo) | **CONFIRMED / CORRECTED** | HelpGenie $20–300 overall, $40–120 typical; restate as "$40–120 typical, up to $300" | OPENED 2026-07-07 — helpgenie.ai | D-C8 / D14-f |

*Industrial §4b.1 ledger (site from $50K, catalog from $30K, AI-search $10–30K, measurement $7.5–15K, outbound $1.5–5K) = OPENED at research time; editorial = the one CORRECTED row above.*

---

## §D13. PARKED — anchor-ladder (`01-anchor-ladder.md`) — BUILD NOTHING

Founder has parked D13. **Nothing on any page changes if it later signs; only the proposal/rate-letter templates gain a wide Tier-3** (book-jobs same-day rate + sell-product 48h SOW). Prove on 3–5 proposals first. **Do not sign these now.**

| id | what | recommendation | template change IF it later signs | status |
|---|---|---|---|---|
| **D13-a** | Amend the signed +20–25% option-step rule (Tier 3 = different condition, 4–6× entry) | Adopt (unsigned) | Proposal step-sizing only | **PARKED** |
| **D13-b** | Tier-3 prices per vertical (~$200K-class) | GATE:HUMAN each | Rate-letter / SOW Tier-3 line | **PARKED** |
| **D13-c** | Tier-3 qualification rule (value ≥ ~$1.5–2M / exit horizon / multi-loc) | Adopt | SOW option-gating logic | **PARKED** |
| **D13-d** | Credit path Tier 1 → Tier 3 within 12 mo | Adopt | SOW credit clause | **PARKED** |
| **D13-e** | Public capacity "two a year" | Set the true number or don't ship | Only if a page ever references it (it won't under D13) | **PARKED** |

---

## Reconciliation flags (surface to founder)

1. **Claims-ID collision:** medical C-07/C-08/C-09 (Synchrony/Catalyst/Heartland) clash with home-services C-07..C-09 (Invoca/Oldroyd). One numbering must yield before either files into `_claims-library.md`.
2. **Review/reputation $299–449/location:** STRIKE in the cross-vertical sweep, CORRECTED (sourceable via costbench) in the jewelry sweep — **net sourceable; use the corrected verdict.**
3. **Industrial ledger SEARCH-row count:** the visible table shows 1 SEARCH row (editorial); punch-list #5 references 2 — the "Rigby/k-ecommerce corroborator" has no SEARCH row in the table. Reconcile before IND-8 first use.
4. **D14-b ≡ D-HS1 (≡ HS-6):** one decision in two docs (`02` §5 visible-value pass and home-services §3b.1) — decide once.
5. **STRIKE rows block their proposal lines:** home-services retention-engine and the call-answering composite cannot be printed until a real source is attached.
6. **Inventory arithmetic correction:** the base inventory footer stated §B = 29 decision rows; the actual distinct §B set is **23** (see count below).

---

## Completeness footer

- **Decision rows: 45.** §A (SIGN) = 17 · §B (CAN WAIT) = 23 · §D13 (PARKED) = 5. (D1–D12 + §16 SIGNED, correctly excluded. ARCH-4 counted but RESOLVED/no-action. D14-b/D-HS1/HS-6, HS-1/CAP-HS, D-C3/CAP-CJ each counted once.)
- **Claims rows: 42 page-usable/proposed.** Medical C-06 (1, in §A2) + home-services C-07..C-13 (7) + industrial page-usable (24: A1/A2/A6/A7/A8, B1/B2/B3/B4/B6/B7/B8, C1/C2/C3/C4/C5, E1/E2/E3/E4/E5/E7/E8) + jewelry J page-usable (10: J1/J2/J4/J6/J7/J8/J9/J12/J13/J14). **Not counted:** jewelry V1–V5 (conversation-only), industrial C7/C8 (footnote-only), medical supporting C-07/C-08/C-09 (collision-flagged addenda).
- **Ledger rows swept (task 7): 17** — 6 CONFIRMED, 8 CORRECTED, 2 STRIKE, 1 CONFIRMED/CORRECTED (response layer). Folded into D14-f, HS-7, D-C8, IND-8.
- **Sources:** `00-offer-architecture.md` (SIGNED — D1–D12 + §16) · `02-visible-value-pass.md` (R1–R9, D14-a…f) · `industrial-offer-spec.md` · `home-services-offer-spec.md` · `medical-dental-offer-spec.md` · `consumer-jewelry-offer-spec.md` · `01-anchor-ladder.md` (D13, PARKED) · `docs/strategy/sales/proposals/2026-07-beautiful-smiles-install-proposal.md` (reference implementation) · `docs/strategy/sales/_claims-library.md` · `lib/stats.ts` + component/code sweep (`Guarantee.tsx`, `WholeFlowLeak.tsx`, `Concept3Calculator.tsx`, `AuditCTA.tsx`, git working tree) · task-7 URL-opening sweep (2026-07-07).
