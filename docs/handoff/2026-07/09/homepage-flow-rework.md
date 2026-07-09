# Handoff — Homepage flow rework (scroll story + structure)

**Date:** 2026-07-09 · **From:** homepage alignment session (prompt 09) · **Founder:** greenlit the work 2026-07-09, chose to run it in a fresh chat.
**Mission:** restructure the homepage scroll story per the approved direction below. Copy stays canon; this is an ORDER + disposition rework, not a rewrite.

---

## 0. Why (the audit that led here)

A per-page offer-alignment audit ran 2026-07-08 against the signed offer architecture. Claims/canon drift is **already fixed** — do not re-audit. The founder then asked for the perception pass: "how the customer will perceive and scroll the page, the story we are telling." That scroll audit (Playwright, desktop 1440×900 + mobile 390×844, first-visit state) found the structure fights the story. Full findings: `docs/strategy/offer-research/alignment/home.md` §B (addendum). Screenshots were session-local; re-capture fresh (see §7).

**The five findings, condensed:**
1. **The wedge is buried.** "You've been sold pieces. We run the whole flow." (ProblemShift) is the emotional core for this agency-burned buyer, and it sits at beat 4, after a 2.5-screen funnel lecture already explained the solution.
2. **Two mechanism sections argue the same thesis.** DemandSystem (funnel stages, TOFU/MOFU/BOFU — marketer grammar) vs FrameworkTimeline (three jobs — owner grammar). The ICP is an owner, not a marketer; FrameworkTimeline is the right grammar.
3. **Three routing moments.** Hero chips and WhoWeServe route to the same four industry pages; GoalIndex routes by goal. Two "which are you?" asks are redundant.
4. **Proof arrives at screen ~11 of 15** (Evidence, industrial case study).
5. **First-visit chrome eats the mobile fold:** cookie banner + auto-opening chat popup cover ~45% of the first mobile screen, popup overlapping the consent UI.
Page length today: **13,776px desktop (~15 screens), 20,368px mobile (~24 screens).**

## 1. The target arc (founder-approved direction)

> **Hero (+probe/marquee) → ProblemShift (wedge) → WhoWeServe (router) → FrameworkTimeline (the one mechanism) → GoalIndex (goal router) → Evidence (proof) → Operator → Signals → FAQ → FinalCTARail**

Versus today: ProblemShift moves up one slot (above WhoWeServe it already precedes — the real change is **DemandSystem leaves the flow**), Evidence moves ~3 screens earlier by inheriting DemandSystem's slot budget. Net: wedge at beat 2, one mechanism section, proof sooner, ~2–3 screens shorter.

**Build-time decisions (GATE:HUMAN — ask the founder in-chat before executing each):**
- **D-A. DemandSystem disposition.** Options: (a) move the section to `/services/` (practitioner-depth home on the sell-product hub — recommended default), (b) move to `/revenue-engine/`, (c) compress to a one-screen version kept on home. It is a self-contained section (`components/sections/DemandSystem.tsx` + `lib/demand-system.ts`) — relocation is a mount move, not a rebuild. If it moves, nothing replaces it on home; FrameworkTimeline carries the thesis.
- **D-B. Probe placement.** The AI-Readiness probe ("Score a page the way AI reads it") is industrial/product-flavored (asks for a product/category URL) and sits at screen 2 of a four-vertical page. Options: (a) leave as-is (it's interactive proof and demos well), (b) move the probe band below WhoWeServe or near Evidence (industrial-proof zone). **Implementation note:** `HeroProbe.tsx` renders THREE bands in one component — hero, probe band, `LogoMarquee`. Moving the probe means extracting the probe band into its own component first (mechanical split; keep `data-cta` ids intact).
- **D-C. Signals → FAQ dead zone.** Both are `tone="surface"` SectionRail sections, so two full paddings stack with no rule — a ~1-screen dead gap. Fix by alternating tone on one of them or adding a divider; pick whichever the design system already supports.

## 2. What is already done — do NOT regress

Commits (all on `main`): `0bb97e4` (drift fixes: fact-ledger-banned quote sentence removed from Evidence; unattested Operator counts removed; terms/CTA/kill-list fixes; `revenue_leak_audit__*` id normalization) · `17139fe` (founder sign-offs: FrameworkTimeline **de-numbered** — no percentages in "What good looks like", that's signed, don't reintroduce; FAQ de-jargoned; final rail book-jobs door → `/revenue-engine/`; homepage title = canonical tagline, brand suffix comes from the layout template; hero mockup relabeled "Real queries · recreated answers" + "← the spot we engineer" after live SERP checks showed **no client citation verifies** — do not restore "engineered by us" framing) · `012671a` + follow-ups (report + F-01 claims row, Operator panel = Years 14 / Verticals 7).

## 3. Canon constraints that bind this work (read before editing)

Read in this order if unfamiliar: `docs/strategy/offer-research/00-offer-architecture.md` (§9.1 + §16), `03-migration-build-plan.md` (Task 2 copy blocks, Task 4 stat map), `04-signoff-sheet.md`, `.agents/product-marketing-context.md`. The homepage-specific rules:

- The homepage is a **neutral/mixed surface**: NO exact numbers, NO floor lines, NO bands, NO guarantee language. It routes to the two motions (sell-product → Book a Growth Call; book-jobs → Revenue Leak Audit).
- The four proof-bar stats ($378M/91%/2.5x/96, `lib/stats.ts` labels verbatim) render in Evidence's footer row — approved surface, keep exactly there.
- The guarantee sentence is untouchable and does not appear on this page at all.
- No unattested numbers anywhere; Operator panel rows require claims-library rows (`docs/strategy/sales/_claims-library.md` F-01 pattern).
- Voice: kill-list in `.agents/product-marketing-context.md`; one em-dash per paragraph; no exclamation marks; "we" voice (Operator section's "I" is the exception); jargon demoted or cut. **Run the humanizer skill on any copy line you write or change.**
- Never edit: `AGENTS.md`, `docs/strategy/glossary-queue.json`, `lib/strategy/niches/briefs.generated.ts`.
- `data-cta` ids: keep existing ids on moved sections (`book_call__*`, `revenue_leak_audit__*`, `audit__*` families). Reordering changes each CTA's scroll position — note the reorder date in the report for GA4 before/after comparisons (03 Task 9.2).

## 4. Current file map (as of this handoff)

| Order | Section | File |
|---|---|---|
| 1 | HeroProbe (hero + probe band + LogoMarquee, one component) | `components/sections/HeroProbe.tsx` (+ `AIOverviewMockup.tsx`, `LogoMarquee.tsx`) |
| 2 | DemandSystem | `components/sections/DemandSystem.tsx` + `lib/demand-system.ts` |
| 3 | ProblemShift (the wedge) | `components/sections/ProblemShift.tsx` |
| 4 | WhoWeServe (industry router) | `components/sections/WhoWeServe.tsx` |
| 5 | FrameworkTimeline (three jobs + Prove) | `components/sections/FrameworkTimeline.tsx` |
| 6 | GoalIndex (goal → cylinder router) | `components/sections/GoalIndex.tsx` |
| 7 | Evidence (case study + stats row) | `components/sections/Evidence.tsx` |
| 8 | Operator | `components/sections/Operator.tsx` |
| 9 | Signals (self-diagnosis + two door CTAs) | `components/sections/Signals.tsx` |
| 10 | FAQ | `components/sections/FAQ.tsx` |
| 11 | FinalCTARail (two doors) | `components/sections/FinalCTARail.tsx` |

Mount order lives in `app/(site)/page.tsx` — the reorder is an import/JSX order change there plus the D-A/D-B moves.

## 5. Cross-page ride-alongs (small, high-impact — do these too)

1. **Footer positioning line** (site-wide layout component; find via grep "Hydraulics, MRO"): currently "AI search engineered for industrial e-commerce. Hydraulics, MRO, technical distribution." — pre-pivot copy contradicting the four-vertical story. Replace with the canonical tagline: **"Revenue systems for businesses that sell parts, book jobs, and fill chairs."** (`lib/business.ts` `tagline`). The footer headline "Engineered to be cited." may stay (brand line) — founder call if changing.
2. **Footer nav "Book a strategy call"** → **"Book a Growth Call"** (canonical door name; the href already points at `/book-growth-call/`, only the label is off — verify).
3. **Chat widget auto-open on mobile:** the "Got any questions? I'm happy to help." popup auto-opens over the cookie banner on first visit (~45% of the mobile fold covered together). Find the embed (grep for the widget script in `app/layout.tsx` / `components/integrations/`), and disable auto-open on mobile or delay it until after consent interaction. If it's a GHL-hosted setting rather than code, document that and tell the founder where to flip it.

## 6. GATE:HUMAN checkpoints in the new chat

D-A, D-B, D-C above · any copy line you author (humanizer first, then founder) · the footer headline if touched · anything that would add a number.

## 7. Verification protocol (definition of done)

- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`), eslint clean on changed files, `pnpm test` green.
- **Visual loop:** dev server is pinned to webpack (`pnpm dev`); recover from flaky states with `pkill -f "next dev"; rm -rf .next; pnpm dev`. Screenshot desktop 1440×900 + mobile 390×844, before AND after (scroll-through, ~8–10 stops; `scripts/_visual-check.mjs` is the overflow-checker pattern — write a sibling temp script inside the repo so playwright resolves, delete it after). Confirm: new order, no overflow culprits, section-tone rhythm sane, page shorter than the 13,776px baseline.
- Re-lint the moved sections against the homepage rules in §3 (no numbers/guarantee crept in, ids intact).
- Append the outcome (what moved, commit hashes, new page height) to `docs/strategy/offer-research/alignment/home.md`.
- Git: stage ONLY your own files (other sessions may have work in flight — `AGENTS.md` and `docs/strategy/glossary-queue.json` are currently dirty from another session; never `git add -A`). House commit style, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 8. Success criteria

Wedge at beat 2 · exactly one mechanism section on home (DemandSystem relocated per D-A) · proof ≥3 screens earlier · one industry-router moment after the wedge (hero chips stay; they're the fold's personalization, not a section) · desktop length ≤ ~12 screens · zero canon regressions · footer no longer industrial-only · mobile first screen not majority-covered by chrome.
