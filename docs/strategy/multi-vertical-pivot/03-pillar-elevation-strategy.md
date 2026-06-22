# Revenue Engine pillar — copy + visual elevation strategy

**Status:** proposed (2026-06-21). Output of a 16-agent strategy workflow (ground -> 4 senior directions -> 4-lens judge panel -> synthesis -> adversarial stress-test for hype / claims-compliance / buildability -> finalize). Awaiting Artur's calls on the 5 open questions at the end. Frame: Bring -> Convert -> Retain (+ Prove). Feeds RE-INJECT Phase B; complements `01-pillar-storyboard.md`.


## Thesis

The current page argues in the right order and stays mostly claims-clean, but it persuades a burned, problem-aware owner by *telling* — and it tells him least convincingly exactly where he's most skeptical. Three real gaps:

1. **The hero hides its best trust asset.** A real founder photo sits unused in the repo (`public/artur-shepel.jpg`) while the page leads with words. A named face plus named terms (90-day setup on me, 3-month minimum, no lock-in) is the calm-operator proof the rest of the page keeps trying to assert in prose.
2. **The "Proof" section has no numbers.** `TwoRevenueLines` renders two labeled rows and the words "your figures" twice. No figure exists yet (no first-cohort data). Calling an empty template "Proof" is the exact agency move this buyer has scars from.
3. **The page leaks the jargon it elsewhere bans** — "after the click," "system-attributed" defined two sections late, "review-driven organic," HIPAA in a headline, "map pack," and an industrial footer ("Engineered to be cited.") that doesn't belong on a roofer's page.

**The lever:** swap asserted trust for shown trust. A named operator and named terms above the fold. A leak the owner can reason about. A method he can audit. A guarantee stated in his own words. We do *not* mortgage the page to an interactive calculator — that device is gated behind a claims fix and ships in a later increment, not at launch. The first increment is copy, the founder spec-card, the de-jargon pass, the honest relabel of "Proof," and the footer. That alone beats today's page, with zero new claims, zero fragile state, and zero motion.

## New spine + visual line

> You don't have a lead problem. You have a leak in the seams between the call, the quote, and the follow-up. Here's where the money goes. Here's the one operator who runs the whole flow as one system, so it stops. Here's exactly how I'll report what the system brought back, on its own line, against my fee. Here's the guarantee, in plain words. Here's how the price gets to you: published model, in writing, the day of the audit. Book the audit.

This keeps the current sequencing discipline and the calm owner-to-operator voice. It drops the "make him prove his own leak with a calculator" framing as the *launch* spine — that depended on an unbuilt, currently non-compliant device. The calculator returns in Increment 3 as an upgrade to the leak section, not the thing the page rests on.

**Visual line.** Light = the facts (diagnosis). Dark = the belief (conviction). Glow intensity, not new chrome, separates adjacent dark bands. No new tokens, fonts, colors, or button styles.

`paper` hero → `surface` Leak → **`dark` glow=strong** Flow → `surface` Plan → **`dark` glow=strong** Method (report) → **`dark` glow=none, abutted** Guarantee → `surface` FAQ → **`dark` size=lg** Audit.

Rationing rules:
- **Blue (`brand-600/300`) gets three jobs only:** the one CTA, the single "Booked"/won marker, the system-driven line on the report.
- **Orange (`accent-500`) owns wayfinding on dark:** step numbers, connectors, the loop arc, checklist dots.
- **One motion, optional.** If we animate anything, it's the existing leak-bar fill, once, on scroll. Default is no motion. `tabular-nums` on every figure. One exclamation budgeted for the whole page; we spend zero.

## Section-by-section: copy + visual (hero → close)

| # | Section | Recommended copy | Visual treatment |
|---|---|---|---|
| **1. Hero** (`RevenueHero`) | Eyebrow `FOR ROOFERS, DENTISTS & LOCAL SHOPS`. **H1:** "Get found. Win the sale. Keep them coming back." (keep the live verb — see hero pick). Lede: "The phone rings while you're on a roof or with a patient, and it goes to voicemail. You pay for leads nobody calls back. You send the quote and never hear back. At month's end you can't say what your marketing actually did." CTA: "Book a Revenue Leak Audit" → `#audit`. Chips: "No contract to start · Keep your ads guy · Your numbers stay yours." Router (demoted links, not buttons): "I run a clinic · I'm a contractor · I run a shop or brand." | **MODIFY.** Add the founder spec-card. Cheaper variant preferred: keep the single column, drop a bordered aside below the CTA row — `public/artur-shepel.jpg` in a `rounded-[4px]` `rule-strong` frame, top edge capped with the existing 6px `brand-600` rule, caption "Artur Shepel. I run every account myself," then a 3-row mono spec: `Setup — 90 days, on me · Minimum — 3 months · Lock-in — none`. Wire the already-built `videoUrl` slot as a "Watch the 90-second version" affordance over the portrait (no autoplay, no fake play button if no video — fall back to the still). Avoids the 7/5 grid mobile-reflow cost; the face + spec is the value, the grid is a nicety. |
| **2. The Leak** (`TheLeak`, as-is) | Eyebrow `THE LEAK`. **H2:** "It isn't your ad budget. It's everything after the phone rings." Intro: "Most owners I talk to think they need more leads. They almost never do. The calls that ring out, the quotes nobody chased — that's usually a bigger hole than the ad budget." | **KEEP** `TheLeak` with its existing library-clean stat row (C-01, C-05, C-06) and its "Proportions illustrative" label. **Do not** swap in `Concept3Calculator` at launch — it's gated (see build plan). The honest illustrative bar is safer than a calculator footnoted with unsourced HBR stats. **Transition:** "That's the arithmetic. Here's the system that closes the gap. ↓" |
| **3. The Flow** (`FlowBlock`) | Eyebrow `THE FLOW`. **H2:** "You've been sold pieces. I run the whole flow." Intro: "A website, an ad, a CRM, each sold by someone who never saw the other two. Customers fall into the gaps between them. I run all three as one flow, so they don't." Pillars (one-liners live ONLY here): Bring "Get found when they're looking" › Convert "Answer fast, win the sale" › Retain "Bring them back." Loop callout: "Retain feeds Bring. A repeat customer or a referral costs almost nothing to win. A one-off campaign can't do that." Trust line: "No markup on your ad spend. I don't resell your leads. No lock-in." Additive: "Your ads guy stays. Your front desk stays. They just stop losing the ones you already paid for." | **MODIFY (light).** First dark band, `glow="strong"`. Add three static `accent-500` line-icons (magnet / phone-check / return-arrow), reused in §4. Replace the inline loop glyph with one static curved return-arc SVG from Retain back to Bring. **Keep FlowBlock a server component — no scroll-triggered path-draw, no IntersectionObserver, no client island.** The icons carry wayfinding; the animation buys little for a restraint-valuing buyer and costs the most. **Transition:** "That's the flow. Here's how I run each part. ↓" |
| **4. The Plan** (`PlanByPillar`) | Eyebrow `THE PLAN`. **H2:** "The whole machine, one part at a time." Intro, objection-killer promoted: "Three jobs, five moving parts. I install and run all of it — the 90-day setup is on me — alongside the site and tools you already have." **Capture** "Show up when someone nearby searches your trade." → "More of the right searches turn into calls." **Respond** "Every call answered, 24/7. A caller can always reach a human." → "No job lost to a missed call or a slow reply." **Book** "The reply books the slot on your calendar." → "More of the leads you have turn into booked work." **Recover** "Cold quotes chased, past customers brought back, reviews asked for." → "Revenue won back from work you already earned." Capstone: "And then — Prove. One dashboard, your own numbers." | **MODIFY.** Number the five step cards **1–5** with a flat counter across the pillar groups (Capture=1 … Prove=5) so the "five moving parts" claim is drawn. Head each pillar group with its §3 icon so the 3→5 nesting reads. Drop the duplicated pillar outcome strings (they live in §3). The Respond card carries the answer to the AI-fear inline. **Cut "and in the AI answers people read now" from the Capture line** — undefined GEO jargon to a roofer; keep it for the services-book buyer, not here. **Transition:** "How do you know it was me and not luck? ↓" |
| **5. How I report it** (`TwoRevenueLines`) — **renamed from "Proof"** | Eyebrow `HOW I REPORT IT`. **H2:** "Two lines on every report. The second one has to clear my fee." Intro: "Each month I split what your ads produced from what the system brought back. The honest test: the recovered line alone should cover what you pay me." **Plain-words definition, MOVED here from the Guarantee:** "The system line is calls won back, quotes chased, customers brought back, and people who found you from new reviews. Counted in your own dashboard, not estimated on my spreadsheet." Closer: "If that line doesn't clear the fee, the next section is for you." | **KEEP** `TwoRevenueLines` structurally (labeled report, fee divider, real `[PROOF-SLOT]` at line 85). Second dark band, `glow="strong"`. **Rename the eyebrow off "Proof."** A section called Proof with zero numbers is the page's biggest tell to a "sold promises dressed as proof" buyer. "How I report it" is a method claim an operator can make honestly today; "Proof" waits for the real dashboard image in the PROOF-SLOT. Move the term definition into this copy. **Transition:** continuous dark into the Guarantee, no light gap. |
| **6. Guarantee** (`Guarantee`) | Eyebrow `THE GUARANTEE`. **Quote (de-jargoned, no "system-attributed"):** "If the revenue the system brings back doesn't beat my fee by day 90, I work free until it does." Undergird (cut "review-driven organic"): "You saw how that line is counted — in your dashboard, not my spreadsheet. That's what makes it safe to promise." | **MODIFY.** Cut "system-attributed" from the headline promise entirely (the counting method already lives in §5). A reader who jumps here via anchor nav must not hit an undefined compound noun in the most important sentence. `glow="none"`, abutted to §5 with a `pt-0` / small negative-margin pull so the two dark bands read as one field. Don't chase a pixel-seamless rail refactor — the density-then-silence effect comes from content (dense ledger → one centered line), not from eliminating the seam. **Transition:** "Here's what it costs. ↓" |
| **7. Pricing** (`RevenuePricing`) | Eyebrow `PRICING`. **H2:** "Published model. No games on a call." Intro: "You see exactly how this is priced before we ever talk. The number depends on your trade, your area, and your scope. You get it in the audit, in writing, the same day." Model: "System only" / "+ I run your ads too (optional, your account, at cost, no markup)." Terms verbatim. Cancel truth verbatim. CTA: "Get your exact rate in the audit →." | **MODIFY (light).** Light `surface`. **Cut the "less than the leak you just measured" anchor line.** It compares a number the owner guessed against a price he can't see — unfalsifiable, and it's the exact "we invented a scary number to justify the fee" move this buyer is scarred by. Pure transparency reads more honest than a bridge claim: show the leak in §2, publish the model here, let him do the subtraction. Fill the empty price column with the terms and the audit promise, not a comparison. **No live calculator value injected.** **Transition:** "Three questions I still get. ↓" |
| **8. Slim FAQ** (`FAQ`) | Eyebrow `A FEW LAST QUESTIONS`. **H2:** "The rest I answered in the story above." (Cut the redundant kicker.) Q1 "Do you guarantee a number of leads?" → "No. I guarantee revenue the system can prove against my fee, not lead counts." Q2 "Are these the same leads three other contractors got?" → "No shared pool. Every call is recorded and logged to you." Q3 "Is my patient data safe to run through this?" → "Yes. Every tool that touches patient records is under a signed compliance agreement. Full detail on the dental page." | **MODIFY.** Keep the `<details>` accordion, `+`→`×` toggle in `accent-500`. **Cut "(a BAA)" from this public answer** — it trades HIPAA for a more obscure acronym to a problem-aware buyer. Let "BAA" live on the dental page where that buyer expects it. With 3 items, narrow the left slab / widen the accordion so it doesn't read underweight. **Transition:** "One step left. ↓" |
| **9. Audit close** (`AuditCTA`) | Eyebrow `THE AUDIT`. **H2:** "Book a free Revenue Leak Audit." Body: "In about 20 minutes I'll show you your own numbers — how many calls you're missing, your real response time, where you rank when someone nearby searches your trade, and the follow-up gap on your quotes. Yours to keep whether we work together or not. No pitch, no obligation." Chips: "No contract to start · Keep your ads guy · Your numbers stay yours." Phone fallback. | **KEEP** structure (dark `size="lg"`, 6/6 split, `RevenueLeakAuditForm` right, `accent-500` checklist left). Same CTA label as the hero closes the loop. **FOOTER FIX (architecture, scoped M not S):** the industrial "Engineered to be cited." footer is hard-wired into `app/(site)/layout.tsx` and can't be hidden by a prop. Make the footer route-aware (or move `/revenue-engine` into its own route group) and render a slim NAP + single-CTA footer. The `(campaign)` group already has exactly this footer — copy that template. |

## Hero: 3 finalists + the pick

1. **"Get found. Win the sale. Keep them coming back."** — already live. Maps 1:1 to Bring → Convert → Retain. "Win the sale" is the most trade-portable verb across roofer, dentist, and shop (it survives the router; "book the job" is contractor-coded).
2. **"You're not short on leads. You're losing the ones you already paid for."** — the contrarian leak thesis up top. Sharpest agitation, but it asserts a claim the reader hasn't measured.
3. **"Every missed call is a booked job you already paid to win."** — single-pain knife-edge, no category name.

**Pick: #1, unchanged.** It already ships, it seeds the spine before the first scroll, and "win the sale" beats "book the job" on trade-portability — the router argument cuts *for* keeping the live verb, not for editing it. There is no meaningful win in a one-verb swap dressed as a recommendation. The elevation against today's hero is the **founder spec-card**, not the headline. Hold #2 as the A/B variant *after* the calculator ships (Increment 3), so the contrarian claim lands as the reader's own conclusion from the calculator one section down, not as our assertion. #2/#3 lean agitation/DR and stay in reserve for the calm-operator buyer.

## Claims / proof map

Every number traces to a row in `_claims-library.md`. No row, no claim.

| Where | Stat / phrasing | Row | Status / action |
|---|---|---|---|
| §2 leak row | "The industry-average reply to a new lead is 47 hours. (LeadSync, 2026)" | **C-01** | VERIFIED. State as industry average, never the prospect's own number. Cite source on first appearance. |
| §2 leak row | "Businesses miss as many as one in three inbound calls." | **C-05** | Keep the "as many as" hedge verbatim — the hedge is the claim. |
| §2 leak row | "A large share of estimates and treatment plans are never followed up." | **C-06** | Qualitative only. No percentage, ever, until a row exists. |
| §5 report | "Media-driven / System-driven" line items | none | Structural, no values rendered. Real values wait for the PROOF-SLOT. |
| §6 guarantee | "beat my fee by day 90" | spec | Verbatim. No "system-attributed." |
| §7 pricing | No dollar figure | constraint | Audit-delivered. Keep "Published model. No games on a call." + the four terms. No leak-vs-price comparison. |

**Blocking violations in `components/sections/revenue-engine/leak-concepts/data.ts` — all four families, must clear before the calculator/before-after ship (Increment 3):**

| Lines | Caption | Action |
|---|---|---|
| 102, 160, 177 | "42 hours / 23% / HBR, 2011" | No HBR row. Replace with C-01 wording or strip. |
| 118, 289, 305, 359 | "42% of local clicks… (Backlinko)" | No Backlinko row. File sourced row (`GATE:HUMAN`) or strip. |
| 146, 327, 328, 342 | "5% lift… 25–95% (Bain / HBR)" | No Bain/HBR row. File or strip. |
| 285 | "the map pack" (retail timeline) | De-jargon to "the map of local results at the top." |

These are equal-severity. The §5 promise "every number traces to a row" is currently **false for the retail variant** until all four clear. None of these touch the launch increment, which uses `TheLeak`'s already-clean row.

**[PROOF-SLOT] inventory (reserve, never fabricate):**
- §5 `TwoRevenueLines` — real attribution-dashboard image once first-cohort data exists. Until then the structural report + the "How I report it" label stand.
- §1 hero `videoUrl` — the "90-second version" poster. Until it exists, the portrait fills the slot. No play button leading nowhere.
- **No review/rating schema** anywhere until real reviews exist. Confirm no `Review`/`AggregateRating` JSON-LD lands in `lib/schema.ts` for this route. Qualitative review *copy* ("people who found you from new reviews") is fine.

## Build plan (S / M / L) + recommended first increment

**Increment 1 — RECOMMENDED FIRST SHIP (real, safe, beats today's page; no new claims, no motion, no fragile state):**

| Task | Size | Notes |
|---|---|---|
| De-jargon + copy pass across all 9 sections | S×n | Strings only: cut "after the click," "review-driven organic," "system-attributed," "(a BAA)," "AI answers" in the Plan line; promote "90-day setup on me"; relabel §5 eyebrow to "How I report it"; move the report definition into §5; trim the guarantee. Humanizer pass before commit. |
| Hero founder spec-card | **M** | `public/artur-shepel.jpg` (confirmed present) as a bordered aside below the CTA, 6px brand rule cap, 3-row mono spec, video affordance (slot already built — pass the prop). Cheaper aside variant, not the 7/5 grid. |
| Footer route-awareness | **M** | Not S. Footer is wired into `app/(site)/layout.tsx`. Clone the `(campaign)` slim NAP+CTA footer; make it render on `/revenue-engine`. |
| Cut pricing anchor line | S | Remove "less than the leak you just measured." |

This increment alone is a clean win: a named face, named terms, an honest method label instead of an empty "Proof," and a jargon-clean page that ends jargon-clean.

**Increment 2 — visual rhythm (component work, no claims):**

| Task | Size | Notes |
|---|---|---|
| FlowBlock static icons + return-arc | **M** | Three static `accent-500` line-icons + one static curved-arrow SVG. Server component, no scroll animation. |
| PlanByPillar flat 1–5 numbering + reuse §3 icons | **S–M** | Groups already numbered 1–3; add a flat step counter + a `StepCard` prop. |
| Proof→Guarantee dark abut | **M** | `glow="none"` + `pt-0`/negative-margin pull. No rail refactor. |

**Increment 3 — the calculator (GATED, schedule last):**

| Task | Size | Notes |
|---|---|---|
| Claims scrub in `data.ts` | S | **Blocker.** All four stat families + "map pack," across all three verticals. `GATE:HUMAN` sign-off. |
| Wire `Concept3Calculator` into §2, demote the bar | **M** | Net-new to the live page (state, mobile, result panel, `tabular-nums`). Clamp `annual`/`monthly` to 0 on `NaN` so an empty input never renders "$NaN." |
| Wire `Concept4BeforeAfter` into §3 | S | Keep "Illustrative sequence." Do not pipe the calc figure in. |
| Hero A/B variant #2 | S | Only after the calculator backs the contrarian claim. |

## What we are NOT doing — and why

- **No public price, no tiers theater, no leak-vs-price anchor.** Pricing is audit-delivered (hard constraint). The anchor comparison is unfalsifiable when the price is hidden and the leak is self-typed — it reads as the agency move. Pure transparency instead.
- **No calculator at launch.** It's net-new production work on a device no visitor has seen, and its source captions currently cite four stat families with no claims-library row. It ships in Increment 3, after the scrub and human sign-off — not as the launch spine.
- **No renaming the empty report "Proof."** Until a real dashboard image exists, it's "How I report it" — a method claim, not a proof claim.
- **No scroll-triggered flow animation.** Static icons + a static arc. Restraint is the premium for this buyer; an animated "system" diagram reads as theater, not evidence. The one allowed motion, if any, is the existing leak-bar fill.
- **No piping the calculator figure into the report or pricing** (loss-vs-recovery conflation; fragile cross-section state).
- **No fabricated dashboard, testimonials, client names, results, or review schema.** PROOF-SLOTs reserve the space.
- **No second CTA or second fork.** One CTA, repeated. The router is demoted links.
- **No countdowns, urgency, false scarcity; zero exclamations.**
- **No promoting C-06 to a percentage or stripping C-05's hedge.** Qualitative and hedged stay verbatim until a sourced row exists with human sign-off.
- **No industrial stats** ($378M, 91% retention, ROI multiples, NPS, ARR) blended into this page.

## Open questions for Artur

1. **Hero verb — leave it or A/B now?** I'm keeping "Win the sale" live and holding the contrarian "You're losing the ones you already paid for" as a variant for *after* the calculator ships. If you want the contrarian hook live sooner, we can A/B it in Increment 1 — but it asserts a leak the reader can't yet measure on-page. Your call on patience vs. punch.

2. **"How I report it" vs. "Proof" — comfortable losing the word?** I'm renaming the numberless report section off "Proof" until a real dashboard exists, because an empty "Proof" section is the page's biggest credibility tell. If you'd rather keep the word, we need at least one real figure or a redacted real dashboard image in the PROOF-SLOT first. Do you have first-cohort data we could redact and ship?

3. **Founder photo + the "I run every account myself" claim.** The spec-card leads with your face and the line "I run every account myself." Is that literally true as you scale, or should it read "I run every account" / "you work with me, not a junior"? The exact wording is a promise the page makes — I want yours, not mine.

4. **Footer scope.** Suppressing the industrial footer on `/revenue-engine` is an architecture change (route-aware footer or a new route group), not a flag. Fine to spend an M on it in Increment 1, or defer to Increment 2 and ship the copy/spec-card first? It's the one item where "jargon-clean page, jargon-stained footer" is the visible cost of deferring.

5. **Calculator appetite.** Increment 3 is real engineering plus a claims scrub across three verticals and a `GATE:HUMAN` sign-off. Do you want to commit to it now (so I sequence the data scrub early), or ship Increments 1–2 and decide on the calculator once the simpler page is live and measured?