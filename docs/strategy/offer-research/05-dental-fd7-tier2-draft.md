# 05 — Dental: the "system, installed" reframe + the taught layer (Tier-2 draft)

**Date:** 2026-07-26 · **Owner:** Artur · **Companion:** `04-signoff-sheet.md` (MED-8.5), `03-migration-build-plan.md` §11.2

> **Status: GATE:HUMAN — nothing here ships or gets promised until Artur signs the rows in §3. Drafted from FD7/FD3 (drift grades, 2026-07-25) within the SIGNED stepped ladder (MED-8.5). §D13 stays PARKED — nothing here unparks it.**

## Provenance

Every decision below traces to a line someone else wrote. Re-read these before editing any block.

| Ref | Source | What it settles |
|---|---|---|
| FD7 | `lib/strategy/offers/drift.generated.ts:25-27` (U-10, G1) | Founder: *"dislikes the angle — '\"you were being sold\" frames them as passive. Show we install the SYSTEM — full, complete, something they don't have — beneficial without insulting them.'"* |
| FD7 cascade | `lib/strategy/offers/drift.generated.ts:308-315` (D-10) | Re-cut to "complete-system gain framing ('the full system you don't have yet')". |
| FD7 build task | `03-migration-build-plan.md:507` | "Wedge reframe (FD7): replace 'You've been sold pieces' family … with complete-system gain framing." |
| FD3 | `lib/strategy/offers/drift.generated.ts:20-22` (U-09, G1) | Founder: *"we can't guarantee because we don't control the whole delivery process … but we give the best system + best tools, make sure they know how to use it, and track how they strive to the KPIs."* |
| FD3 cascade | `lib/strategy/offers/drift.generated.ts:268-275` (D-05) | Enablement posture: best-known system + tools + training + KPI tracking. |
| FD3 dental draft | `03-migration-build-plan.md:502-504` | Skeleton at :502 — *"we run the system; the close is yours; we install, train, and track"*. Dental at :504 — *"Case acceptance still happens chairside — how the plan is presented, how financing is offered. That's yours. We install, train the front desk, and track recall, reopened plans, and booked chairs with you."* |
| DP-1 | `docs/strategy/roofing/revenue-engine-site-injection-spec.md:242` | *"'Revenue Engine' is the working name. … (Note: distinct positioning from Shepel Group's 'Flywheel OS' — keep brands separate.)"* |
| MED-8.5 | `04-signoff-sheet.md:5` | *"MED-8.5 = SIGNED, dental skin adopted — 'The cases you already earned' / 'Earned, plus new patients' / 'The whole practice, run for you' (03 §2.8), proposal-template-only, re-wordable per rate letter."* Row at `:44`. |
| §D13 | `04-signoff-sheet.md:155-165` | PARKED — build nothing from it. |
| Guarantee fence | `04-signoff-sheet.md:12` | The day-90 sentence is untouchable, verbatim only. No row here edits it. |
| Vendor-name fence | `04-signoff-sheet.md:14` | No competitor / platform / vendor names in any customer-facing block. |
| Scope base ("proposal" below) | the live dental deal's install-proposal master, v4 2026-07-07, the only file in `docs/strategy/sales/proposals/` — lines `:6, :10, :28, :35` | The install's contents; the recurring column already names "monthly front-desk-score coaching" and "quarterly re-aim". |
| Cheap-extension basis | `00-offer-architecture.md:169, :172, :123` | The day-45 note "costs nothing extra to produce"; quarterly re-aim is already the month-4+ ritual and already sits inside Option 3. |

**Annotation 2026-07-28.** The guarantee was re-cut by founder decision 2026-07-28: it now settles against everything paid — install and fees — by day 120 from signing (live in `Guarantee.tsx`, the offer sheet, and the outreach manual; the day-90/monthly-fee sentence is retired). The "Guarantee fence" row above quotes `04:12` as it stood on 2026-07-26; the 04 sheet's fence has not yet been updated to the re-cut wording. Unchanged either way: no row in this draft edits the guarantee.

**Brand rule carried through every block (DP-1):** no "OS", no "operating system", no "dimensions", no "right people, right seats", no Flywheel vocabulary. Dentist words only.

**What this draft is not.** It is not new scope, not a new tier, and not a price change. FD3's separate program — whether the day-90 guarantee sentence gets retired site-wide (`03-migration-build-plan.md:502`) — is untouched here. This draft borrows FD3's boundary clause and nothing else.

---

## 1. The "system, installed" reframe (FD7)

Both variants say the same thing: the practice is buying one complete system it does not have today, installed once, in its name. Not a list of marketing services. Neither block frames the buyer as having been duped — the gain is in what arrives, not in what they got wrong.

The taught-layer lines inside these blocks are live only if ROW-1 and ROW-2 sign with ROW-3. If ROW-3 signs alone, cut those two lines and the blocks still stand.

### Variant A — proposal block (lead section of the dental proposal template)

> **What gets installed**
>
> Most of this doesn't exist in your practice yet. What does is spread across four or five vendors, none accountable for the number at month end. One system, installed once, in your name.
>
> **What it does every day.** Answers every call, chair time and after hours. Books into your real schedule, writing back to Dentrix, Open Dental, or Eaglesoft. Works every presented plan until it books or you hear a no, monthly payment on the table. Pulls overdue recall and dormant patients off your own list. Every call recorded, and two lines on your report: what the ads drove, what the system drove.
>
> **What it stands on.** A new site with the compliance build, service pages that quote a monthly number, thirty articles, and a Google Ads account in your name at cost. Searches turn into booked consults. The profile and the pages stay yours.
>
> **What I teach you.** Your front desk gets a monthly score, and I train them to it. Twenty minutes a month, I walk you through your own two lines until you read them without me. The owner's manual is yours: every sequence, script, setting.
>
> I install it, train your front desk, and track recall, reopened plans, and booked chairs with you. Case acceptance stays yours: how the plan gets presented, how financing gets offered.

*Sourced to `proposal:6, :24, :28`; `medical-dental-offer-spec.md:126`; live dental page (`dentists/page.tsx:75-120, :135-137`); FD3 dental draft (`03:504`).*

### Variant B — page block for `/revenue-engine/dentists/` (place only after ROW-3 signs)

> ## The whole system, installed
>
> Answering, booking, follow-up, and the numbers that prove it. In your name, on the software you already run.
>
> - **The phones.** Every call answered, chair time and after hours. Missed calls get a text back in seconds.
> - **The schedule.** Booked into your real calendar, writing back to Dentrix, Open Dental, or Eaglesoft.
> - **The follow-up.** Presented plans worked until they book, financing on the table. Overdue recall and dormant patients, off your list.
> - **The numbers.** Every call recorded and classified. A front-desk score, and two revenue lines: what the ads drove, what the system drove.
> - **What feeds it.** Site, pages, articles, and an ads account in your name. Searches become booked consults.
> - **What I teach you.** Twenty minutes a month on your own numbers, and the desk trained to the score.
>
> I install it, train your front desk, and track the numbers with you. Case acceptance stays yours.

*Labels are deliberately plain nouns, not stage names — CAPTURE / RESPOND / BOOK / RECOVER / PROVE stay canonical, unrenamed and unmerged (`roofing spec:30-35`), and this block sits alongside them, not on top of them.*

---

## 2. The taught layer, defined

Three components. All three run on data the install already produces, which is why this is an extension and not a scope increase.

### 2.1 The monthly read-your-numbers call

**What it is.** About twenty minutes, once a month, walking the owner through their own dashboard: the two revenue lines (what the ads drove, what the system drove) and the front-desk score. The goal is that by month three they read it without me on the call.

**Cadence.** Monthly, from month 1.

**Delivery cost, honestly.** The report already exists — the two-line dashboard and the score are install deliverables (`proposal:6`; live PROVE stage). The new work is the twenty minutes plus about ten minutes of prep. At single-digit client counts that is under an hour a month per practice, which fits solo capacity. It does not fit at thirty practices; the ceiling is real and it is headcount, so name it before it is sold at volume.

### 2.2 Front-desk coaching against the score

**What it is.** A monthly working session with the front desk on what the score says: where calls died, which follow-ups never went out, which week slipped. Training the desk to the number they are already being measured on.

**Cadence.** Monthly.

**Delivery cost, honestly.** Already named as recurring work in the v4 proposal's Day-91 column — "monthly front-desk-score coaching" (`proposal:10`, `:35`). Making it explicit inside the option costs a scheduled session, not a new build.

### 2.3 The quarterly re-aim note

**What it is.** One paragraph, four times a year: what the report says is weakest, and what I'd re-aim next. It extends the day-45 note cadence past the install rather than inventing a new artifact.

**Cadence.** Quarterly, starting the quarter after install.

**Delivery cost, honestly.** The day-45 note is already documented as costing "nothing extra to produce" (`00-offer-architecture.md:169`), and quarterly re-aim is already the month-4+ ritual (`:172`) and already itemized inside Option 3 (`:123`, `proposal:90`). This component is a naming change more than a new deliverable.

### 2.4 The boundary (FD3) — non-negotiable in all copy

Install, train, track. Never chairside.

The system reopens quiet treatment plans and catches the calls the desk can't take. Case acceptance still happens in the operatory: how the plan is presented, how financing is offered, how the work gets done. That belongs to the practice, and no block, page, or proposal line may blur it. In dentist words, the sentence that closes every version: *"I install it, train your front desk, and track recall, reopened plans, and booked chairs with you. Case acceptance stays yours."*

This is the reason the taught layer exists. We don't control the half of the outcome that happens in the chair, so we hand over the system, the training, and the numbers, and we sit on those numbers with the owner every month.

### 2.5 Why it belongs mid-ladder

The three options already step by condition, not by deliverable count. The taught layer is what the word "run" means at the top of the ladder: the owner gets access to the operator, monthly, against their own numbers. Priced by access, not by line items. That is why the numbers call attaches at Option 2 and the whole layer lands at Option 3, and why it needs no price move to be worth the step.

---

## 3. Proposed sign-off rows — GATE:HUMAN, all unsigned

Formatted to match `04-signoff-sheet.md`. Write **SIGNED**, **REJECTED**, or **DEFER** in front of the row id. A signed row clears the GATE:HUMAN on the blocks it governs; nothing here is built before that.

| Row | Content | What signing changes | Status |
|---|---|---|---|
| **ROW-1** | Option 2, **"Earned, plus new patients"**, gains the monthly read-your-numbers call as named content: about twenty minutes a month walking the owner through the two revenue lines and the front-desk score. | Amends MED-8.5 **content only**. The three signed option names do not change; the rider at `04:5` already allows re-wording per rate letter, so this needs no new naming decision. Dental proposal template gains one line in the Option 2 block. No page change. No price change. | GATE:HUMAN — unsigned |
| **ROW-2** | Option 3, **"The whole practice, run for you"**, explicitly itemizes the full taught and operated layer: the monthly numbers call, monthly front-desk coaching against the score, the quarterly re-aim note, and operation staying with the operator rather than a handoff. | Amends MED-8.5 content only. Makes visible what `00-offer-architecture.md:123` and `proposal:90` already carry (quarterly re-aim, priority access) and what `proposal:10` already lists as recurring. Dental proposal template gains the itemized Option 3 block. No price change. | GATE:HUMAN — unsigned |
| **ROW-3** | Reframe blocks **A** and **B** (§1) approved: A for the dental proposal template lead section, B for `/revenue-engine/dentists/`. | Clears the copy blocks for build. A ships in the template; B ships on the dental page. Until this signs, neither block is quoted to a buyer or rendered on any surface. | GATE:HUMAN — unsigned |

**If §D13 ever unparks:** the full taught layer becomes the Tier-2 "the foundation, run" differentiator, and these three rows re-map onto it without rewording — same content, different rung. Until then the signed stepped ladder stands and §D13 stays parked (`04:155-165`). Nothing above depends on that happening.

**Scope fences on all three rows.** The guarantee sentence is untouched (`04:12`). The published $30,000 floor and the three option prices are unchanged. No vendor, platform, or competitor name enters any block (`04:14`). No case-acceptance percentage appears in any of this copy. The live dental deal is referred to only as "the live dental deal" — never named, here or anywhere downstream.

---

## 4. Ripple list — what moves the day these sign

1. **Dental proposal template** gains Variant A as its lead section, plus the Option 2 line (ROW-1) and the itemized Option 3 block (ROW-2).
2. **`/revenue-engine/dentists/`** gains Variant B. **No page ships before ROW-3 is signed.**
3. **`lib/strategy/dentist-offer/data.ts`** ("Proposed additions" block) and **`lib/strategy/docs/dentist-outreach-manual.ts`** (drafts section) — both flip the taught-layer material from "proposed" to "signed", and the partner may then answer questions about it. (Paths updated 2026-07-28; the original `dentist-partner-brief.ts` was split into these two modules.)
4. **Published prices are unchanged.** The $30,000 floor line, the three option prices, the payment terms, and the retainer bands all stay exactly as signed.
5. **Nothing else moves.** No new claim rows, no calculator change, no timeline change, no guarantee change.
