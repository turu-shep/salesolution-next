# Alignment audit — `/` (homepage)

**Date:** 2026-07-08 · **Auditor:** per-page alignment prompt (09) · **Route:** `app/(site)/page.tsx`
**Served state verified:** dev server live, `curl http://localhost:3000/` 200 — all findings confirmed in the served HTML before fixing.
**Sections mounted (audit scope):** HeroProbe (+ AIOverviewMockup, LogoMarquee) · DemandSystem (+ lib/demand-system.ts) · ProblemShift · WhoWeServe · FrameworkTimeline · GoalIndex · Evidence · Operator · Signals · FAQ · FinalCTARail. Header/Footer are shared layout chrome, out of page scope.

---

> **Round 1 sign-off (founder, 2026-07-08) — implemented in `17139fe`.** G1 Option A (de-numbered), G4 approved (FAQ rewrites + Authority label), G5 approved (final rail → `/revenue-engine/`), G6 approved (ledger row closed), G7 Option A (tagline title; brand suffix via layout template). G2 resolved with SERP evidence (see addendum §A). **Still open: G3 (founder answers below) + the Liori-slide residual option + the flow findings (addendum §B).**

## Verdict: NEEDS CHANGES → fixed this pass → **ALIGNED WITH NITS** (7 GATE items open)

The homepage gets the hard things right: it is a true neutral front door — no floor lines, no bands, no exact fees, no guarantee language, one spine told once (Bring → Convert → Retain + Prove), pains named plural per lane instead of one pain-guess bet, both motion doors correct at the close. What was wrong was proof hygiene, not structure: a testimonial sentence the fact ledger had already killed ("qualified leads doubled inside two quarters") was back on the page; the Operator panel carried two unattested counts ("8 verticals shipped", "6 engagements active"); a fabricated dental client ("Plantation Dental") sat in the AI-answer mockup without its illustrative badge; "Leave anytime" contradicted your signed 3-month minimums; and two Revenue-Leak-Audit CTA ids were hyphenated so they fell outside the measured `revenue_leak_audit__*` family. All of that is fixed with canon-supplied wording in commit **`0bb97e4`**. What needs you: whether the three illustrative percentages in the framework stay numeric (one of them is 2.5× — the same number as your locked ROI stat, meaning something different, on the same page), whether the real-client AI-answer slides (Hosebox, Modern Wood Flooring, Liori) depict citations you can actually check — Liori's recorded consent excludes outcome claims — plus the legacy SEO title and two smaller routing/wording calls.

---

## Rubric

| # | Element | Verdict | Notes |
|---|---|---|---|
| 1 | Motion + page type | **PASS** | Cross-vertical **neutral front door**. Not a §9.1 row; nearest analogs are hub/pillar, and the neutral rule binds: no exact numbers, no guarantee — route to the motions. The page does exactly that (4-lane hero chips, WhoWeServe splitter, two-door close). |
| 2 | Numbers on page | **PASS** | Zero commercial numbers: no floor, no bands, no fees, no combo table. Non-commercial numbers audited in #11. |
| 3 | Floor line | **PASS** (absent) | Correctly absent on a neutral surface. |
| 4 | Credit sentence | **PASS** (absent) | Correctly absent — it belongs to the five priced sell-product cylinder pages. |
| 5 | Terms line | **DRIFT → fixed** | No terms block (correct), but Operator's "No lock-in. Leave anytime, keep everything" contradicted the signed 3-month minimums (both motions) and the 90-day sell-product notice. Fixed to "No annual lock-in. Leave after the minimum, keep everything" ([Operator.tsx:68](../../../../components/sections/Operator.tsx)) — "no annual lock-in" is the recorded terms phrase; "after the minimum" is motion-safe. |
| 6 | "Setup" ban | **PASS** | Zero hits in any mounted section (grep-verified). |
| 7 | Payback math | **PASS** (absent) | No calculator, no leak math on the neutral page — correct. `WholeFlowLeak` is not mounted here. |
| 8 | Guarantee | **PASS** | Zero guarantee language. FrameworkTimeline's Prove line ("The line the system recovered should clear what you pay us") states the two-lines measurement standard — no promise, no remedy, no day-90 — which is the §6 retainer-justification principle, not the guarantee. Ruled principle-framing, allowed. |
| 9 | ROI stats | **PASS / BY-DESIGN** + 1 GATE nit | `headlineStats` ($378M · 91% · 2.5x · 96) render once, in Evidence's footer row — exactly the approved surface (§16 Item 1, ARCH-4, 03 Task 4). 5.2x/$575k absent ✓. **Nit (G1):** FrameworkTimeline's illustrative Retain target also reads "2.5×" with a different meaning ("more revenue from customers you already won") on the same page as the locked "2.5x Average ROI in 12 months" — same numeral, two meanings, one page. |
| 10 | CTA + measurement | **DRIFT → fixed** + 1 GATE | Doors correct: sell-product → Book a Growth Call (`book_call__final_rail`, `book_call__primary_nav`), book-jobs → Revenue Leak Audit, written diagnostic secondary (`audit__*` is the established site family). Fixed: `revenue-leak-audit__signals` / `revenue-leak-audit__final_rail` → snake_case so they match the measured `revenue_leak_audit__*` family (same fix as 36c9899); Evidence's "Book a similar audit" label mis-named the artifact while routing to `/book-growth-call/` — relabeled to the canonical "Book a Growth Call". **GATE (G5):** the final-rail book-jobs card deep-links `/industries/home-services/#audit` for ALL book-jobs buyers. |
| 11 | Claims audit | **2 DRIFT → fixed**, rest traced | Full table below. Fixed: the fact-ledger-banned quote sentence; the two unattested Operator counts. |
| 12 | Voice | **DRIFT → fixed** | Kill-list hits fixed: "ARR" (banned in industrial copy) → "revenue"; "fully utilized" → plain; cold "GEO" → "AI-search" ([FAQ.tsx:70-77](../../../../components/sections/FAQ.tsx)); double em-dash in one HeroProbe paragraph → one. Zero exclamation marks ✓. "Not ten vendors. One system." is the recorded SSOT do-example (the five-vendor rule governs the incumbent-replacement frame, not this phrase) ✓. "Six things owners ask us for" labels the six-row list below it — not a catalog-count claim ✓. Remaining cold jargon in FAQ answers (schema, AIO, PPC, E-E-A-T probe label) → GATE G4 (rewrites need authored copy). |
| 13 | Keyword ownership + routes | **PASS** + 1 GATE | No retired routes (grep-verified: no `/revenue-engine/{home-services,medical,local-retail}/`). All links live: 4 industry pillars, 6 cylinder pages, `/services/`, `/revenue-engine/`, both doors, case study. Canonical URL set. **GATE (G7):** the `<title>` ("Digital Marketing & Sales: SEO Expert Guides and Services") is legacy and off the brand-umbrella target; "Digital Marketing" brushes the kill-listed category framing. Meta description is on-voice and fine. |

## Spirit checks

| Check | Verdict | Read |
|---|---|---|
| 1. Value-based, never commodity | **PASS** | Nothing on the page prices anything or invites comparison. The only ROI proof is the approved aggregate row; no ~10x claims in adjectives anywhere. |
| 2. Burned-buyer safety | **PASS** | System-first hero ("Get found. Win the sale. Keep them coming back."), pains plural per lane (chips, WhoWeServe cards, six Signals), self-diagnosis before any door, honest fit-check in FAQ ("Not every business needs us"). No pain-guess bet. |
| 3. One spine, told the same way | **PASS** | DemandSystem + FrameworkTimeline tell Bring → Convert → Retain (+ Prove); GoalIndex maps goals to cylinders as parts of one machine; the old Foundation/Amplify/Lead frame is gone. No rival offer story. |
| 4. Motion decides the commercial model | **PASS (after fixes)** | Neutral page carries neither numbers nor guarantee; exactly zero commercial blocks; the close splits the two motions cleanly. The one leak was Operator's "Published prices" / "Leave anytime" — fixed to "Published pricing model" / "after the minimum". |
| 5. Proof discipline | **NEEDS CHANGES → fixed** + GATEs | Violations found and handled: reinstated banned quote sentence (fixed), unattested counts (removed), unbadged fabricated client (badged + generic name). Open GATEs: illustrative targets (G1), real-client mockup slides (G2), quote attribution approval (G6). |
| 6. Trust artifacts over hype | **PASS** | CTAs name the thing you keep ("the numbers are yours to keep", "full audit", "15 minutes, no pitch"). No countdowns, no scarcity, no manufactured urgency. |

---

## Claims audit — every number/claim on the page

| Claim (as served) | Where | Trace | Class |
|---|---|---|---|
| $378M · 91% · 2.5x · 96 (labels verbatim) | Evidence stats row | `lib/stats.ts` `headlineStats`; approved for home + `/services/ai-seo/` only (§16 Item 1 / ARCH-4 / 03 Task 4) | **BY-DESIGN** |
| 1,840 → 2,640 qualified leads/mo · +800/mo · +43.5% · Aug 2024–Jan 2025 · monthly path | Evidence headline, display number, chart | fact-ledger §1 (recorded; arithmetic ✅; CRM confirms still ⚠ open) | **PASS** (recorded; open confirms noted) |
| "150+ category pages" · "~8,500 SKUs" · "No new ad spend" | Evidence body + quote attribution | fact-ledger §1 rows (recorded ⚠, pending scope doc / catalog count / ad-account check) | **PASS** (recorded; open confirms) |
| "Qualified leads doubled inside two quarters." | Evidence pull quote | fact-ledger §1: resolved-removed, "Don't reinstate" — it contradicts +43.5% | **DRIFT → FIXED** (sentence deleted) |
| Quote attribution "Operations Director" + text | Evidence pull quote | fact-ledger ⚠ "client approval of attribution+text" | **GATE** (G6, pre-existing ledger TODO) |
| +12% (Bring) · +43% (Convert) · 2.5× (Retain), "Illustrative targets, not past results" | FrameworkTimeline "What good looks like" | `docs/handoff/06/29/services-rework.md` — deliberate 06/29 decision, disclaimer added as the honesty fix | **BY-DESIGN**, with the 2.5× label-collision nit → **GATE G1** |
| "Years operating 14" | Operator panel | approved founder bio, `lib/business.ts:60` ("14 years operating growth…") | **PASS** |
| "Verticals shipped 8" · "Engagements active 6" | Operator panel | UNSOURCED — no claims row, no doc, contradicts the visible 4-lane shape | **DRIFT → FIXED** (removed per ARCH-3 attest-or-remove default; restore path in G3) |
| "north of $50M" in-house threshold · "5–15 hours" · "40-hour week" | FAQ Q2 | operational advice, not proof framing | **PASS** (noted) |
| "first 60 days" · "top 50 commercial queries" · "months 4–6" | FAQ Q3 | operational cadence (sell-product register) | **PASS**; register handled in G4 |
| "15 minutes, no deck" · "3–5 URLs" | FAQ Q5 / FinalCTARail | matches the §5.2 Growth Call door script | **PASS** |
| "About 20 minutes … numbers are yours to keep" | FinalCTARail audit card | matches the recorded ~20-min Revenue Leak Audit definition | **PASS** |
| Mockup slides: real clients (Hose Box, Modern Wood Flooring, Liori Diamonds) shown cited in AI answers; "Real queries · the AI answer, engineered" | AIOverviewMockup | Hosebox pattern founder-blessed via signed IND-2 (keeps AIOverviewMockup); Liori consent (D-C4) scoped to search + content, **no outcome claims**; no doc verifies the depicted citations are real | **GATE** (G2) |
| "Plantation Dental" slide, unbadged | AIOverviewMockup | fabricated stand-in; component's own convention requires the illustrative badge + generic name; no dental client exists in canon | **DRIFT → FIXED** ("Example Dental", `illustrative: true`) |
| Logo strip: Deventor, Modern Wood Flooring, Northern Hydraulics, Hosebox, Longhorn | LogoMarquee | recorded live trust strip (`lib/client-logos.ts`, SSOT Proof Points). NH hazard governs case-study *naming*, not the strip | **PASS** |
| Probe: "~2s" · "Deterministic · No data stored" | HeroProbe | product properties of `/api/probe/` | **PASS** |
| "Two or more usually means … structural" | Signals | recorded SSOT self-diagnosis frame | **PASS** |

---

## What changed (commit `0bb97e4`)

| File | Change | Canon source |
|---|---|---|
| `components/sections/Evidence.tsx` | Deleted "Qualified leads doubled inside two quarters." from the pull quote (+ provenance comment); "Book a similar audit" → "Book a Growth Call" | fact-ledger §1 "Don't reinstate"; canonical door name |
| `components/sections/Operator.tsx` | Removed "Verticals shipped 8" + "Engagements active 6"; kept bio-sourced "14 yrs"; "No lock-in. Leave anytime" → "No annual lock-in. Leave after the minimum"; "Published prices. You see them" → "Published pricing model. You see it" | ARCH-3 attest-or-remove default; signed 3-month minimums; §9 "the exact fee never appears on any page" |
| `components/sections/AIOverviewMockup.tsx` | Dental slide → "Example Dental" / `exampledental.com` / `illustrative: true` | the component's own recorded stand-in convention + no-fabricated-example rule (SSOT) |
| `components/sections/FAQ.tsx` | "ARR" → "revenue"; "enough velocity … fully utilized" → "enough work … busy full-time"; cold "GEO" → "AI-search" | ICP language rules + kill-list |
| `components/sections/Signals.tsx`, `FinalCTARail.tsx` | `revenue-leak-audit__*` → `revenue_leak_audit__*`; stale routing comment corrected | Task 9 measured id family; 36c9899 precedent |
| `components/sections/HeroProbe.tsx` | Second em-dash in the probe intro → period | one-em-dash-per-paragraph voice rule |

Verified: `npx tsc --noEmit` clean (pre-existing `lib/lead-form` excluded) · eslint clean on all changed files · `pnpm test` 8/8.

---

## GATE list — founder sign-off needed (nothing below shipped)

### G1 — FrameworkTimeline illustrative targets (+12% / +43% / 2.5×) [GATE:HUMAN]
The trio is a recorded 06/29 decision with the "Illustrative targets, not past results" disclaimer. Two problems remain: the numbers trace to no claims row, and the Retain target reuses **2.5×** with a different meaning than the locked stat lower on the same page.

- **Option A (recommended) — de-number.** Keep the three stations, replace the big numerals with the outcome in owner words; drop the disclaimer (nothing left to disclaim). Proposed lines:
  - Bring: **"The AI answer starts naming you for what you sell."**
  - Convert: **"Answered calls and chased quotes turn into booked work."**
  - Retain: **"The customers you already won buy again."**
  (Note: this changes the sub-block's visual from numerals to lines — flagged as GATE for exactly that reason.)
- **Option B — attest the targets.** You set the three numbers as founder-attested illustrative targets (one claims-library note covers them), and the Retain value changes to anything that isn't 2.5× so it can't be misread as the locked stat.
- **Option C — keep as-is.** Accept the recorded decision and the same-numeral nit. Cheapest, weakest.

### G2 — Real-client slides in the AI-answer mockup [GATE:HUMAN + verify]
Hose Box, Modern Wood Flooring, and Liori Diamonds are shown as the highlighted citation in recreated AI answers under "Real queries · the AI answer, engineered." The Hosebox pattern is effectively signed (IND-2 keeps this mockup on the industrial pillar). But no doc records that these specific citations are real and checkable, and **Liori's consent (D-C4) is scoped to naming what we run — no outcome claims**; a depicted achieved citation reads as an outcome.

Per slide, pick one:
1. **You confirm the depicted citation is real** (the query, asked today, cites them) → keep as-is; optionally add per-slide microcopy "As generated, [month year]".
2. **It's a composite** → relabel the panel honestly: right-side label **"Real queries · recreated answers"** (left label "What it looks like when we've done the work" already carries the framing), or badge the slide like the illustrative ones.
3. **For Liori specifically**, if the citation can't be verified: swap the slide to the generic pattern until the named case study (attested numbers) exists — the consented named line already lives on the consumer pillar close, and this second surface goes past what was consumed.

### G3 — Operator panel restore path [GATE:HUMAN]
The panel now shows one attested row ("Years operating · 14"). If you want the fuller panel back:
- **B1:** attest the real counts → file claims rows ("Verticals shipped: N — list them"; "Engagements active: N as of [date]"). Note a live engagement count goes stale and stale counts read fake.
- **B2 (no-staleness alternative):** add **"Account managers · 0"** — restates the paragraph's "no account managers" as a panel row, always true, on-brand.

### G4 — FAQ de-jargon + register [GATE:HUMAN]
The FAQ is sell-product/practitioner register on the cross-vertical front door (a known pre-migration finding; the migration table has no homepage-FAQ row, so changing it is your call). Enumerated-cold jargon fixed already (ARR, GEO); the rest needs authored copy. Proposed rewrites, ready to ship on your sign-off:

- **Q2, second paragraph** (currently "…schema engineering, citation tracking, and AIO-aware PPC don't need a 40-hour week from one person — they need 5–15 hours from the right one."):
  > "The fractional model exists because the work doesn't need a 40-hour week from one person. It needs 5–15 hours from the right one: someone who can make your catalog readable to AI and track who the answers actually cite."
- **Q3 bullet list** (currently "AIO citation coverage…", "Schema completeness rate…", "Inbound query mix (informational vs commercial split)"):
  > - "How often the AI answer cites you on the 50 queries that matter to your revenue"
  > - "How much of your catalog AI can actually read"
  > - "Whether the buyers finding you are still researching or ready to buy"
- **Probe row label** "E-E-A-T" → **"Authority"** (the API field is already `authority`; the intro prose already says "authority"). E-E-A-T isn't on the enumerated ban list, so it waits for your call.

### G5 — Final-rail book-jobs routing [decide once]
The "You book jobs & appointments → Revenue Leak Audit" card deep-links `/industries/home-services/#audit`. Every book-jobs buyer — dental, med-spa, retail — lands on the contractor page. **Recommended:** route to `/revenue-engine/` (the funnel home; its job is exactly this fork) and let the pillar route by niche. Counter-argument for keeping it: home-services#audit is one click closer to a real form. Your call; the component comment now documents the open question.

### G6 — Evidence pull-quote approval [pre-existing ledger TODO]
The trimmed quote + "Operations Director" attribution still carry the fact-ledger ⚠ "client approval of attribution+text." Until approved, the quote is the weakest element in the strongest section. Approve it, or the quote comes down in a later pass.

### G7 — Homepage `<title>` [GATE:HUMAN]
Current: "Digital Marketing & Sales: SEO Expert Guides and Services" — legacy, generic, not the brand umbrella, and "Digital Marketing" is the category framing the kill-list avoids. Options:
- **A (recommended):** `Sale Solution — Revenue systems for businesses that sell parts, book jobs, and fill chairs` (the canonical tagline, `lib/business.ts`, verbatim)
- **B:** `Sale Solution — Get found. Win the sale. Keep them coming back.` (the H1 arc)
- **C:** `Sale Solution | AI search & revenue systems for industrial and local-service businesses`

---

## Addendum (2026-07-08, round 1)

### §A — G2 resolved: the citations do not verify (SERP-checked)

Live Google checks via DataForSEO, 2026-07-08, desktop:

| Slide | Query (as depicted) | Location | AI Overview? | Client in results? |
|---|---|---|---|---|
| Hose Box | "best custom hydraulic hose assemblies for high-pressure equipment" | United States | **No AIO triggers at all** | hosebox.com absent from top 10 |
| Modern Wood Flooring | "best wood flooring for brooklyn apartments" | New York | AIO triggers (content loads async, not capturable) | modernwoodflooring.com absent from top 10 + local pack |
| Liori Diamonds | "best lab grown diamond engagement rings in nyc" | New York | AIO triggers (async) | lioridiamonds.com absent from top 10 + local pack |

**Action taken (canon: no fabricated outcome depiction; D-C4 = no outcome claims for Liori):** panel label → **"Real queries · recreated answers"**; annotation → **"← the spot we engineer"**. The slides now read as demonstrations of the service, not records of achieved citations. Both are one-line reverts per slide if a citation later verifies. **To spot-check manually:** google the exact query from the slide's search box (US location, logged-out/incognito) and look for the client's domain in the AI Overview's citation chips. AI Overviews are volatile and location-dependent, so a hit on a variant query wouldn't cover the depicted one.
**Residual founder option:** if Liori shouldn't appear in any outcome-shaped frame until the named case study exists, say so and the slide swaps to the generic pattern (same one-line mechanism as the dental slide).
**Round-2 note (2026-07-09):** the founder attested that a **real dental engagement (practice in Plantation, FL)** and a **real roofing engagement (Miami)** exist (see claims row F-01). So the mockup's dental and roofing slides could one day carry real clients — but only after (a) naming consent is recorded per the client-naming rules and (b) the depicted citation verifies, or the slide stays inside the "recreated answers" frame. Until both, the generic-name + badge state stands.

### §B — Scroll/story audit (founder-requested; screenshots on file)

Method: Playwright scroll-through, desktop 1440×900 (10 stops) + mobile 390×844 (6 stops), first-visit state (consent banner up, chat widget in default behavior).

**The numbers first:** the page is **13,776px on desktop (~15 screens) and 20,368px on mobile (~24 screens)**. The story it scrolls: promise → interactive tool → 2.5-screen funnel lecture (dark) → the wedge ("You've been sold pieces") → industry router → second mechanism section (three jobs) → goal router → industrial proof → operator → self-diagnosis → FAQ → two doors.

**What works:** the hero is genuinely strong (promise + the AI-answer artifact side by side, on the fold); the de-numbered framework reads clean and confident; Operator lands right before the ask; Signals → FAQ → two-door close is the correct ending and the doors are honest. Voice holds the whole way down.

**The five flow findings (all GATE — structural, your call):**

1. **FLOW-1 — the wedge is buried.** "You've been sold pieces. We run the whole flow." is the emotional core for an agency-burned buyer, and it sits at beat 4, *after* a 2.5-screen funnel diagram has already explained the solution. Problem-before-mechanism is the natural arc for this buyer (high market sophistication, per the pillar storyboard).
2. **FLOW-2 — two mechanism sections tell the same thesis.** DemandSystem (funnel stages, TOFU/MOFU/BOFU — marketer grammar) and FrameworkTimeline (three jobs — owner grammar) both argue "one system, every stage." The ICP canon says the buyer is an owner, not a marketer; FrameworkTimeline is the right grammar. DemandSystem is the most practitioner-flavored thing on the page and costs ~2.5 screens.
3. **FLOW-3 — three routing moments.** Hero chips and WhoWeServe route to the same four destinations; GoalIndex routes by goal. Two of the three asks ("which are you?") are redundant with each other.
4. **FLOW-4 — the proof arrives at screen ~11 of 15** and is industrial-only (known state). Readers in the three other lanes have usually forked away before any proof; industrial readers wait 10 screens for it.
5. **FLOW-5 — first-visit chrome eats the mobile fold.** Cookie banner + the chat widget's auto-opened "Got any questions?" popup together cover ~45% of the first mobile screen, and the popup overlaps the consent UI. Recommend: no auto-open on mobile (or auto-open only after consent interaction / N seconds of scroll).

**Proposed arc (pick or edit — nothing moves without your sign-off):**

> Hero (+probe) → **ProblemShift** (wedge, moved up) → **WhoWeServe** (one router, right after the wedge) → **FrameworkTimeline** (the one mechanism) → **GoalIndex** (goal-level router, now the "so which part do you need?" beat) → **Evidence** (proof three screens earlier) → Operator → Signals → FAQ → FinalCTARail.
> DemandSystem: demote to `/services/` or `/revenue-engine/` as the practitioner-depth section (or compress to one screen). Net effect: wedge at beat 2, proof ~3 screens earlier, one "which are you?" instead of two, ~2–3 screens shorter.

**Cross-page findings recorded here because the homepage visitor hits them (fixes belong to a layout/footer pass, not this page):**
- The shared **footer still carries the industrial-only positioning** — "AI search engineered for industrial e-commerce. Hydraulics, MRO, technical distribution." — plus the headline "Engineered to be cited." The page tells a four-vertical story for 15 screens and the footer takes three of the verticals back. The canonical tagline (now the homepage title) is the obvious replacement.
- Footer nav says **"Book a strategy call"** — non-canonical door name (canon: Book a Growth Call).
- Signals → FAQ are both `surface`-tone sections, so the rail stacks two full paddings with no rule between them — a dead ~1-screen gap right before the FAQ.

### §C — G3: RESOLVED (founder answers 2026-07-09) + one open pick

Founder: count everything mentioned on the website; itemized list given. **Filed as claims row F-01** (`docs/strategy/sales/_claims-library.md`): **Verticals shipped = 7** — industrial distribution/wholesale · fitting-kits manufacturing & distribution · lab-grown jewelry (online + NYC) · motorsports chassis (Longhorn) · wood flooring · dental (Plantation, FL) · roofing (Miami). Deventor unclassified, folded into the industrial family, not counted. Panel restored: "Years operating · 14" + "Verticals shipped · 7".

**Live engagement count: declined** (staleness), and "Account managers · 0" rejected — founder wants a different angle for the third row. Options on the table (GATE:HUMAN, pick one or none):
- **"Case studies · 5"** — a credential, auditable at `/case-studies/` (the fact ledger documents exactly five), only ever under-counts as more ship. Recommended.
- **"Markup on your ads · $0"** — a number that never stales; duplicates the "How we work" bullet on the same screen, which is the argument against it.
- **"Monthly report · 2 lines"** — names the Prove artifact (what ad spend brought in / what the system brought back); most differentiated, least self-explanatory.

### §D — Flow rework: handed off

The flow findings (§B) were greenlit by the founder 2026-07-09, to be executed in a fresh session. **Full self-contained handoff: `docs/handoff/2026-07/09/homepage-flow-rework.md`** — target arc, the three build-time GATE decisions (DemandSystem disposition, probe placement, Signals→FAQ gap), the do-not-regress commit list, canon constraints, footer + chat-widget ride-alongs, and the verification protocol.

### §E — Flow rework: EXECUTED 2026-07-09

Founder GATE answers: **D-A** move DemandSystem to `/services/` · **D-B** probe stays in the fold (no HeroProbe split) · **D-C** flip Signals `surface → paper` (FAQ tone is hardcoded and shared with `/services/`, so flipping FAQ would create a new collision there — flipped Signals instead).

**What moved (order + disposition only, no copy rewrites):**
- Homepage `app/(site)/page.tsx`: **DemandSystem removed.** New order = the target arc verbatim: HeroProbe → ProblemShift → WhoWeServe → FrameworkTimeline → GoalIndex → Evidence → Operator → Signals → FAQ → FinalCTARail. Wedge now at beat 2; Evidence ~3 screens earlier; one industry-router moment after the wedge.
- Services `app/(site)/services/page.tsx`: **DemandSystem mounted** between HowServicesCombine (paper) and PickAService (surface) — its `dark` tone gives a clean paper→dark→surface rhythm.
- `DemandSystem.tsx`: `data-cta-location` retagged `home-demand-system → services-demand-system` for GA4 accuracy. **Visible copy/href untouched** — its one CTA still reads "See how the engine works → `/revenue-engine/`" (a cross-motion link now living on the sell-product hub; flagged for a founder call, not changed here).
- `Signals.tsx`: `tone` surface → paper (D-C dead-zone fix).

**Ride-alongs (§5 of the handoff):**
- Footer positioning line (`components/layout/Footer.tsx`): industrial-only "AI search engineered for industrial e-commerce. Hydraulics, MRO, technical distribution." → the canonical tagline, now wired to `business.tagline` (SSOT). Footer headline "Engineered to be cited." left as-is (brand line; founder call).
- Footer nav label (`lib/navigation.ts`): "Book a strategy call" → "Book a Growth Call" (href already correct).
- Chat auto-open: **no code change available.** The chat is HubSpot's hosted widget (`components/integrations/HubSpotTracking.tsx` injects `js.hs-scripts.com`); auto-open + mobile behavior are portal settings, not in the repo. **Founder action:** disable/delay auto-open in HubSpot → Conversations → Chatflows (targeting/display rules) so it stops covering the cookie banner on the mobile fold.

**Verification (definition of done):** `tsc --noEmit` clean, eslint clean on changed files, `pnpm test` 8/8. Visual loop (webpack dev, desktop 1440×900 + mobile 390×844, scroll-through): homepage desktop **11,558px** (was 13,776 — **2,218px / ~2.5 screens shorter**), mobile **17,625px** (was 20,368); order confirmed against the arc; Signals(paper)→FAQ(surface) boundary now reads; services DemandSystem dark band renders with no tone collision; no page-level horizontal overflow (only intentional clipped elements — logo marquee, the "spot we engineer" badge, the HowServicesCombine `min-w` table in its own scroll wrapper). No canon regressions: no numbers/floors/guarantee introduced, `data-cta` id families intact. **Reorder shipped 2026-07-09** (flow-rework session; see `git log` for the commit) — the date GA4 before/after comparisons anchor to (03 Task 9.2).

## Known BY-DESIGN, checked and left alone
Homepage proof bars carry the four `lib/stats.ts` headline stats (the approved surface) · the only quantified proof on the front door is industrial (recorded pre-migration state; the migration table's homepage row covers proof bars only) · the hero has no default CTA until a lane is picked (recorded design) · `audit__*` is the established id family for the written-diagnostic door · "Not ten vendors. One system." is the SSOT voice example.

### §F — Hero probe verification: WORKING (2026-07-09)

Part A of `prompts/tools/hero-probe-verify-and-ai-upgrade.md` executed against production.

**API matrix (prod):** valid URL → 200 with four scores in 0.2–0.5s · repeat call byte-identical (deterministic claim holds) · salesolution.net canary = **79** (schema 100 / readable 88 / authority 50) · bad URL / private IP / localhost / empty → 400 with correct messages · PDF + 5-hop redirect → 502 · http→https redirect chain → 200, same scores as apex.

**UI (Playwright, prod, 1440×900 + 390×844):** idle skeleton, loading, result (bars + tier pill + `audit__hero_probe_result` CTA → `/unlock-growth-audit/`), and error states all render; form recovers after error; schemeless input auto-prefixes https; no horizontal overflow either viewport.

**Findings (not regressions, but known limits):**
1. **Bot-walled sites fail generically.** Fastenal, Zoro, Motion, Aspen Dental, a big roofing corp → 502 "Could not analyze that URL." (their WAFs 403 the probe's honest UA). Small SMB sites — the actual ICP — score fine (roofsimple.com 83, abchomeandcommercial.com 73). Improvement idea: detect upstream 403/challenge and say "your site's bot protection blocked us — the same wall AI crawlers hit," turning the dead end into the pitch.
2. **Challenge pages can score as the site.** mscdirect.com returns 200 with a bot-challenge page → probe reports 0/0/0 as if it were MSC's real score; grainger.com similarly scores 17. Misleading to an owner who knows their site has schema. Same fix as #1: detect challenge-page signatures before scoring.
3. **Prod runs 6 commits behind local main** — deployed band still shows "E-E-A-T" label + old sentence; HEAD (17139fe) already de-jargoned it to "Authority". Resolves at next push/deploy; not a probe defect.
4. Worst-case latency: multi-hop redirect chains ~5s vs the "about two seconds" claim. Typical case is 0.2–0.5s; acceptable.

**Verdict: WORKING.** Part C (AI v2: Claude read + per-IP rate limit + email gate after first run) not built — waits on the Part B founder gate. Cost basis for that gate: Haiku 4.5 at $1/$5 per MTok → ~8k in / ~500 out ≈ **$0.01 per AI run**; at proposed caps (3/hr, 10/day per IP) even 100 AI runs/day ≈ $1/day.

### §G — Probe scoring engine v1.1: expanded + page-type aware (2026-07-09)

Follow-up to §F. The founder flagged the scoring as too thin and page-type-blind (a homepage was
penalized for missing `article:author`). Rebuilt:

- **Scoring extracted to `lib/probe/score.mjs`** (pure, JSDoc-typed, 11 unit tests in
  `score.test.mjs`; `pnpm test` now 19/19). Route (`app/api/probe/route.ts`) keeps fetch + SSRF
  guards and imports the engine.
- **~3× more signals per category, normalized to the points that APPLY to the page:**
  Schema 10 signals (adds BreadcrumbList, Organization identity, sameAs, Open Graph, canonical,
  expanded type set incl. LocalBusiness/BlogPosting/Service). AI-readable 13 (adds robots.txt
  AI-crawler check — GPTBot/ClaudeBot/PerplexityBot etc., fetched in parallel with the page —
  title-tag band, subheading count, lists/tables, text-to-markup ratio that catches JS shells,
  viewport). Authority 10–11 (adds contact info, legal links, social profiles, freshness).
- **Page-type aware:** detects article / product / home / generic from JSON-LD + URL path.
  Author + dates signals apply ONLY to article pages; homepages/product pages are judged on
  org-trust instead (Person markup, reviews/AggregateRating, freshness).
- **API shape unchanged** (`{schema, readable, authority, overall}`) so `HeroProbe.tsx` is
  untouched; `pageType` + per-signal `details` ride along for a future breakdown UI / AI v2.
- **New baselines** (deterministic, will shift vs §F's): salesolution.net 88 (was 79),
  northernhydraulics.net 75 (was 72, authority 47→54 from the byline fix).
- Verified: tsc clean, eslint clean, node --test 19/19, live dev-server curls on both canaries.
  NOT deployed — ships with the next push. Term capture skipped: `glossary-queue.json` is dirty
  from another session (AGENTS.md never-edit list).

### §H — Probe report flow: personalized link + warm audit handoff (2026-07-09)

Follow-up to §G. Founder flagged two flow problems: the result panel dumped people onto a cold,
generic /unlock-growth-audit/, and results vanished on refresh. Built:

- **/ai-readiness/[token]/ — the full report page** (`app/(site)/ai-readiness/[token]/page.tsx`).
  The token IS the report: base64url of the scored URL (`lib/probe/token.ts`), nothing stored —
  the page re-runs the deterministic scan on every open, so a shared link never expires (beats
  the 24h ask) and the band's "No data stored" claim stays true. noindex,nofollow; never in
  sitemap/nav. Renders: host + "Scored as: {page type}" chip, overall + tier + mini bars,
  **"Fix these first"** (top 5 missed signals by lost points), full per-signal breakdown for all
  three categories, dark CTA rail → audit. Error states: broken token, unreachable site, and a
  dedicated **bot-wall page** ("your site turned our scanner away — AI crawlers hit the same
  wall") that converts the §F dead-end into the pitch, with its own audit door.
- **Band CTA rewired** (`HeroProbe.tsx`): primary "See the full report →" →
  `/ai-readiness/<token>/` (new id `probe_report__hero_probe_result`); the audit door stays as a
  secondary text link keeping `audit__hero_probe_result` for GA4 continuity.
- **Warm audit arrival**: report's audit door carries `?site=<host>&probe=<score>`. `LeadForm`
  reads them client-side after mount (page stays static): prefills the website field
  (verified on step 2) and shows a "From your report — your page scored N/100" note above step 1.
  Applies to both LeadForm mounts on the audit page.
- **Refactor**: fetch + SSRF layer extracted to `lib/probe/fetch.ts`, shared by the API route and
  the report page; route is now a thin wrapper. Two signal labels de-jargoned ("chrome",
  "entity").
- **Verified**: tsc clean, eslint clean on changed files (LeadForm line-90 `Date.now` purity
  errors are pre-existing), tests 19/19, full Playwright click-through on dev (band → report →
  audit prefill) desktop 1440×900 + mobile 390×844, no overflow; bot-wall + broken-token states
  exercised. NOT deployed. GATE:HUMAN for founder: new copy lines (report page + form note +
  "Or skip ahead" link) shipped per in-chat direction; flag if any wording should change.

### §I — Probe scoring v1.2: citation-grade bar (2026-07-09)

Founder call: the test should grade harder so prospects see room to improve. Done three ways, all
defensible (the bar moved to citation-grade standards; nothing is arbitrarily deflated):

1. **Stricter + new signals:** existence checks devalued (JSON-LD present 10→5pts); NEW
   recommended-props signal (brand/sku/aggregateRating, address/contactPoint/sameAs,
   WebSite SearchAction — 15pts); NEW **llms.txt check** (8pts, fetched in parallel, SPA
   soft-404-guarded) and **question-form headings** (8pts, answer-engine formatting); citations
   need 5 outbound domains (was 3); contact needs phone AND email/address; sameAs needs 3;
   Person markup needs a role for full credit; word floor 300; title 15–60; meta description
   sweet spot 70–160; text-ratio bar 0.10→0.15.
2. **Weakest-gate overall:** `0.6·mean + 0.4·min` — an answer engine trips on the worst layer,
   not the average.
3. **Tier thresholds raised** (band + report): On track ≥85 (was 70), Gaps ≥55 (was 40).

**New canary baselines:** northernhydraulics.net 75→**65 (Gaps)** · roofsimple.com 83→**59** ·
abchomeandcommercial.com 73→**59** · salesolution.net 88→**84 — now shows "Gaps" on our own
site**, mainly llms.txt (we don't publish one), title length, text ratio. FOUNDER FLAG: adding
llms.txt to salesolution.net is cheap, on-brand, and would push us back over 85 — recommended
follow-up, not done in this pass.

Verified: tsc clean, eslint clean, 22/22 tests (14 probe), live canary curls. NOT deployed.

### §J — Probe v1.3: Domain strength (DataForSEO off-page category) (2026-07-09)

Founder call after §I: on-page scores flatter weak domains (salesolution.net at 84 was
"laughable"). Added the fourth scored category, pulled automatically — no manual DA field:

- **`lib/probe/domain.ts`**: DataForSEO `backlinks/summary/live` per apex domain (env
  `DATAFORSEO_USERNAME/PASSWORD`, already in `.env.local`; falls back to `DFS_LOGIN/PASSWORD`).
  Cached 24h per domain via `unstable_cache` (~$0.02–0.03 per FRESH domain, cache-free repeats).
  Fails soft: no creds / timeout / API error → category simply absent, probe scores on-page only.
- **`scoreDomain()` in score.mjs**: rank/500 (40pts) + log-scaled referring domains (35) +
  log-scaled backlinks (25). Weakest-gate overall now spans all four categories.
- **UI**: band shows a 4th "Domain" bar when present; report page gets a "Domain strength"
  category card ("Perfect markup on a weak domain still loses the citation") + mini bar.
- **New baselines:** salesolution.net 84 → **69** (domain 56 = the weakest gate — our DR-10
  reality, honest now) · northernhydraulics.net 65 (their domain is 70 — stronger link profile
  than ours, which the report now shows).
- Latency: 0.83s fresh (parallel with page fetch), 0.15s cached — "about two seconds" holds.
- **FOUNDER FLAG:** the probe now spends ~2–3¢ per fresh domain. A scripted abuser could burn
  DataForSEO credits; the per-IP rate limiting planned in
  `prompts/tools/hero-probe-verify-and-ai-upgrade.md` Part C is worth pulling forward even
  before the AI layer.
- Verified: tsc clean, eslint clean, 23/23 tests, live canaries with real DFS data. NOT deployed.

### §K — Part C shipped: AI read + gate + rate limits + methodology page (2026-07-09)

Founder confirmed Part A and greenlit Part C, asking first how to make the tool link-worthy.

**Link-worthiness (workflow: 4 lenses × ~30 ideas → judged synthesis):** strategy = build the
indexable anchors linkers cite; count noindex-report virality as distribution, not links.
Build-now set: (1) **methodology page — BUILT** (below); (2) indexable `/ai-readiness/` tool
landing page for "AI readiness checker / GEO checker" queries + roundup outreach; (3)
threshold-gated embeddable badge, dofollow → methodology, live re-verified, self-revoking;
(4) render the AI read as a shareable "how an AI describes you" card. Roadmap: per-vertical
benchmark study once scan volume exists (needs anonymized aggregate logging), per-signal
explainers feeding /glossary, curated compare pages, forwardable fix-bundle, re-scan alerts,
agency co-brand param. Skips incl. public "roast" challenges (wrong for burned-buyer ICP).
Full result: session task w2puz05bf.

**Shipped this pass (all local):**
- **AI read** (`lib/probe/ai.ts`, `/api/probe/ai/`): Claude (default claude-haiku-4-5, ~1¢)
  reads the fetched page → verdict / engine summary / closest-winnable query / top-3 fixes,
  schema-constrained JSON, URL+page treated as untrusted (prompt-injection hardened).
  `PROBE_AI_MOCK=1` dev mode (active in `.env.local` — REMOVE when key added).
- **Gate** (`lib/probe/gate.mjs` signed cookie): 1 free anonymous run → email unlocks 6 total →
  audit door. Unlock (`/api/probe/unlock/`) lands in HubSpot + Resend (marked UNVERIFIED).
- **Rate limits** (`lib/probe/limits.mjs` + Upstash-or-memory store): per-IP ai 6/h 10/d,
  probe 30/h 100/d (band + report page), og 20/h, unlock 5/h; GLOBAL daily ledgers: ai 200,
  unlock 100, **dfs 500 (one DataForSEO ledger consumed on every cache-missing lookup from any
  surface — closes the domain-enumeration spend hole)**. Memory fallback logs a prod warning
  that global caps are per-instance until Upstash is configured.
- **Report page additions:** AI read panel (aria-live, retry states), ShareRow (copy link +
  LinkedIn), OG unfurl card (score card, per-IP capped, signal count computed from the catalog).
- **`/ai-readiness/methodology/` — INDEXABLE** (in sitemap, canonical): all 42 signals +
  weights + formula generated from `signalCatalog()` in score.mjs, changelog, cite-this block.
- **Adversarial review** (24 agents): 3 high findings fixed (unmetered DataForSEO surfaces →
  dfs ledger + probe caps; per-instance global cap → prod warning + Upstash guidance; unlock
  spam → global cap + unverified marking) plus: hourly AI cap 3→6 (was stranding unlocked runs),
  error-mapping regex widened, transient DataForSEO failures no longer cached 24h, trailing-dot
  cache-key bypass closed, prompt metadata moved into untrusted scope, dead-end panel states got
  retry, a11y (aria-live/invalid), signal-count drift fixed (42, computed not hardcoded).
  Accepted residuals: cookie replay (per-IP caps backstop), DNS-rebinding TOCTOU in fetchHtml
  (Vercel egress has no meaningful internal network), unverified-email lead injection (marked).
- Verified: tsc/eslint clean, 26 probe tests + 8 tool tests green, full UI click-through
  (free run → email wall → unlock → 4 runs left) both viewports, canaries re-checked (69/200 OK).

**DEPLOY CHECKLIST (founder):** add to Vercel env: `ANTHROPIC_API_KEY`, `PROBE_GATE_SECRET`
(any long random string), ideally `UPSTASH_REDIS_REST_URL/TOKEN` (free tier — makes the spend
kill-switches fleet-wide). Remove `PROBE_AI_MOCK=1` from any prod env. Read the new copy
(report page, AI panel, methodology). Publish llms.txt + shorten homepage title so our own
score clears 85.
