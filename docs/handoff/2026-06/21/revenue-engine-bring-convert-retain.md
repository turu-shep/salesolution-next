# Handoff — Revenue Engine rework + Bring → Convert → Retain frame

**Date:** 2026-06-21 · **Branch:** `main` (work is committed) · **Status:** core rework landed; a handful of deliberate follow-ups open (see §7).

---

## 1. TL;DR

We reframed the agency's whole story from "what happens after the call" (conversion-only) to the full lifecycle **Bring → Convert → Retain** (with **Prove** as the measurement layer), and rebuilt the Revenue Engine pages around it. The concept is now the canonical source of truth, the five Revenue Engine pages are migrated to the new frame, and the old "engine vs fuel" components are retired. A few content swaps and doc-alignments remain.

**Read first:** `docs/strategy/operating-concept-bring-convert-retain.md` (the canonical concept) and memory `operating-concept-bring-convert-retain`.

---

## 2. The operating concept (source of truth)

`docs/strategy/operating-concept-bring-convert-retain.md` — thesis, the three pillars + Prove (levers, owned metric, per-vertical), the service map, the boundary list, the risks. One line: **one operator runs the whole flow; the leak is in the seams between point-vendors; ads are one input into Bring at cost; same spine, two doors** (services book = industrial; Revenue Engine = local-service).

Pillar ↔ Revenue Engine step map: **Bring**=Capture · **Convert**=Respond+Book · **Retain**=Recover · **Prove**=Prove.

---

## 3. What landed (committed on `main`)

Commit range roughly `2547d27` → `10382f0`:

- **All 5 Revenue Engine pages migrated to the new frame** — pillar (`/revenue-engine/`), home-services, dentists, medical, local-retail. Each now composes: `RevenueHero` → `TheLeak` → `FlowBlock` → `PlanByPillar` → `TwoRevenueLines` → vertical reassurance → `RevenuePricing`/`RevenueRateCard` → `Guarantee` → `FAQ` → `AuditCTA`.
- **`FlowBlock`** (the reframed mechanism beat) — "You've been sold pieces. I run the whole flow." Bring/Convert/Retain pipeline + the trust line. Replaced `EngineVsFuel`.
- **`PlanByPillar`** — the 5 steps grouped under the 3 pillars (Bring=Capture, Convert=Respond+Book, Retain=Recover), Prove as the capstone. Flat 1–5 numbering, pillar icons (`pillar-icons.tsx`). Replaced `HowItWorks` + `FiveSteps`.
- **`TwoRevenueLines` fake chart killed** — was hard-coded "illustrative" bars; now an honest report (Media-driven / System-driven / fee as rows), no invented magnitudes. **This fix is live.**
- **Founder credibility in the hero** — `RevenueHero` gained a `founder` prop (name, photo `/artur-shepel.jpg`, caption, specs like "Setup: 90 days, on me / Minimum: 3 months / Lock-in: none").
- **"Convert" standardized** — middle pillar is "Convert" everywhere (was "Sell"), incl. `flow-concepts/data.ts` and `PlanByPillar`.
- **Dead components removed** — `EngineVsFuel`, `HowItWorks`, `FiveSteps`, `GetFound` no longer imported by any page (commit "remove dead frame components").
- **`RevenueRateCard`** — full FL+CA rate card for vertical pages (figures per spec §1.5); pillar uses the lighter `RevenuePricing`.
- **Concept doc + memory** — `operating-concept-bring-convert-retain.md` + memory entry, so the frame persists.

---

## 4. Front-door / homepage work (earlier in the same effort)

- **Hero (`HeroProbe`)** — headline "Get found. Win the sale. Keep them coming back."; a **compact 4-chip lane selector** (Industrial / Medical / Home & local / Retail) that filters the `AIOverviewMockup` and reveals a contextual CTA.
- **`AIOverviewMockup`** — slides tagged by `lane`; added a home-services (roofing) slide. ⚠️ uses a **placeholder client "Cedar & Co Roofing"** — swap for a real client or soften the hero's "Real client" label before publishing.
- **`WhoWeServe`** — four cards: Industrial · **Medical & aesthetics** · Home & local services · **Retail & consumer brands** (added medical + retail; dropped "Showrooms & local brands" naming).
- **New verticals wired** — `/revenue-engine/medical/` and `/revenue-engine/local-retail/` pages; nav (`lib/navigation.ts`) and taxonomy seed (`scripts/seed-industries.mjs`, Medical top-level with Dental as child) updated. ⚠️ **`seed-industries.mjs` not yet run against Sanity** (manual) — governs case-study tagging only.

---

## 5. Canonical Revenue Engine page structure

`Hook → 3-leak villain → (quantify your leak) → mechanism (Flow) → plan (5 steps by pillar) → the difference → who runs it → proof/attribution → offer → guarantee → FAQ → audit.`

The **full intended narrative** (including the calculator-as-quantify, before/after "the difference", and founder beat in sequence) is assembled at **`/revenue-engine/full-preview/`** (home-services data, noindex). The live pages are a leaner version of this — see §7 for what the live pages are still missing vs. the preview.

---

## 6. Component & page map

| Thing | Path | Note |
|---|---|---|
| Concept SSOT | `docs/strategy/operating-concept-bring-convert-retain.md` | canonical |
| Mechanism beat | `components/sections/revenue-engine/flow-concepts/FlowBlock.tsx` | live on all 5 |
| Plan | `components/sections/revenue-engine/PlanByPillar.tsx` | live; data per vertical |
| Pillar icons | `components/sections/revenue-engine/pillar-icons.tsx` | used by PlanByPillar |
| Attribution (fixed) | `components/sections/revenue-engine/TwoRevenueLines.tsx` | honest report, live |
| Hero (+founder) | `components/sections/revenue-engine/RevenueHero.tsx` | `founder` prop |
| Saved leak concepts | `components/sections/revenue-engine/leak-concepts/` | Evidence(2)/Calculator(3)/BeforeAfter(4) kept; Timeline(1) dropped |
| Flow concepts (drafts) | `components/sections/revenue-engine/flow-concepts/Concept1-4` | superseded by FlowBlock |
| Full-page preview | `app/(site)/revenue-engine/full-preview/` | noindex, disposable |
| Concept review pages | `/revenue-engine/leak-concepts/`, `/revenue-engine/flow-concepts/` | noindex, disposable |

---

## 7. Open items / next up (prioritized)

1. ~~Swap the fake-bar villain~~ — **DONE (2026-06-21).** The 4 vertical pages now use the 3-leak Evidence villain (`Concept2Evidence`, one card per Bring/Convert/Retain). The pillar keeps `TheLeak` but the **fake bar was removed** (honest 3-leak cards; cross-vertical, so no vertical-specific receipts). Villain data in `leak-concepts/data.ts` cleaned so every vertical's three cards map cleanly to the pillars. Dentists reuses the (specialty-neutral) `medical` villain/calc/before-after data.
2. ~~Add the two missing beats~~ — **DONE (2026-06-21).** The 4 vertical pages now have the calculator ("Put a number on it") right after the villain and the before/after ("Same lead/patient/shopper. Two endings.") after the plan. Verified live on home-services.
3. **Source the unsourced stats** before publish — the leak stats (`As many as 1 in 3` / C-05 hedged, the retail figures), and confirm the `47 hours / LeadSync 2026` citation. No fabricated numbers ship.
4. **Swap the `AIOverviewMockup` roofing placeholder** ("Cedar & Co Roofing") for a real client, or soften the hero's "Real client" label.
5. **Align the remaining brand doc** — `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md` screen 3 still describes "engine vs fuel"; bring it in line with the operating-concept doc (02-revenue-engine-inject.md was already reconciled).
6. **Delete the disposable REVIEW pages** (decisions now locked): the route pages `full-preview/`, `leak-concepts/`, `flow-concepts/` (noindex), the two `*Showcase.tsx`, the unused `leak-concepts/Concept1Timeline`, and `flow-concepts/Concept1-4` + `FlowConceptsShowcase`. ⚠️ **Do NOT delete the leak-concepts COMPONENTS now in production** — `Concept2Evidence`, `Concept3Calculator`, `Concept4BeforeAfter`, `LeakShell`, and `data.ts` are imported by all 4 live vertical pages. (Worth renaming them out of the "concept"/"leak-concepts" naming into proper production names — e.g. `EvidenceVillain`, `LeakCalculator`, `SameLeadTwoEndings` — as a follow-up.)
7. **Run `scripts/seed-industries.mjs`** against Sanity when ready (Medical + Local-Retail industries; Dental → child of Medical).

---

## 8. Decisions log (the "why", so nobody re-litigates)

- **Four front-door verticals**, not two doors: Industrial / Medical & aesthetics / Home & local services / Retail & consumer brands. There's no clean 2-door label that covers medical+home+retail without mush.
- **Bring → Convert → Retain** is the spine; **ads are one input into Bring**, never the headline (corrected after the engine block over-centered ads).
- **5 steps kept**, not retired — they're the operational detail nested under the 3 pillars (the "wider process"); Prove migrates to the report beat.
- The **3 leak concepts each fit different info** (not one winner): Evidence=villain, Calculator=quantify/proof, Before/After=the difference.
- **No fabricated proof** — honest report over fake bars; no review schema until real reviews; no revenue guarantee on the industrial side (Revenue Engine's day-90 guarantee kept separate).
- **Operator wedge** is what keeps "whole flow" from reading as a generic full-service agency — see the boundary list in the concept doc.

---

## 9. Gotchas

- **Never run `pnpm build` while a `next dev` server is using the same `.next`** — they fight over that folder and the dev server dies (it happened this session). Recover: `pkill -f "next dev"; rm -rf .next; pnpm dev`, then poll for 200s.
- **Visual loop discipline:** one dev server, one browser, screenshots serial; parallel agents are read-only (no browser). (Memory: `visual-loop-tooling`.)
- **Artur's headline preference:** full-contrast, not muted ink-500 two-tone. (Memory: `hero-full-contrast-headline`.)
- Background processes (dev servers) don't survive between turns here — they get reaped (exit 143).

---

## 10. Pointers

- Concept SSOT: `docs/strategy/operating-concept-bring-convert-retain.md`
- Revenue Engine spec: `docs/strategy/roofing/revenue-engine-site-injection-spec.md`; inject plan: `docs/strategy/multi-vertical-pivot/02-revenue-engine-inject.md`; storyboard (needs align): `01-pillar-storyboard.md`
- Memory: `operating-concept-bring-convert-retain`, `multi-vertical-pivot`, `copy-voice-and-humanizer`, `hero-full-contrast-headline`, `visual-loop-tooling`
- Verify before publish: `npx tsc --noEmit` clean, lint clean on changed files, `pnpm build` compiles (not against a running dev server).
