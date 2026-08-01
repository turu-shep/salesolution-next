# Handoff — Offer Mirror (site-wide copy scan → classification → comprehension test → `/strategy/offers`)

**Date:** 2026-07-24 · **From:** planning session with the founder (Fable) · **Status:** founder chose the single-session path — **execute `02-prompt-full-ladder.md`** (v1 → v2 in one run, one in-chat grading gate). `01-prompt-v1-offer-mirror.md` remains the staged fallback (v1 only).
**Mission:** a fresh agent reads every public surface of salesolution.net cold, writes down what it believes we sell — per vertical, with quoted evidence — and ships it as a gated internal page at `/strategy/offers`. The page is the instrument. It measures two things at once: how consistent the copy and the offer actually are across ~60 public routes, and how well an AI understands the business from the copy alone.

> ⚠️ **If you are the agent about to execute v1: stop reading this file.** Open `01-prompt-v1-offer-mirror.md` and nothing else in this directory. This README names answer-key content that would contaminate the blind read.

---

## 0. Why (founder's ask + the sharper frame)

Founder's ask, near-verbatim: scan our copy on the website, classify it by type and industry, summarise what you understood about what we do and what's our offer for each industry, and create a local page under `/strategy/offers` — "so I understand how consistent is the copy and offer, and how good you actually understand what we do, sell and offer."

The sharper frame: **this is a first-party answer-engine simulation.** When a buyer asks ChatGPT "what does Sale Solution do?", the model runs exactly this exercise — reads the public surfaces, synthesizes an offer, answers with whatever the copy supports. We sell that discipline to clients (GEO / AI-search-readiness); this points the same test at our own site. If the mirror comes back wrong or mushy, that is not an agent failure — it is the copy's answer-engine score. That also makes it repeatable: re-run the mirror after each copy wave and the grade trend becomes a clarity metric no rank tracker provides.

Two outputs, deliberately separable:

- **Consistency** — contradictions, stale positioning, terminology wobble, coverage holes. Findings with IDs, severity, and quoted evidence.
- **Comprehension** — the agent's own per-vertical account of buyer / pain / offer / promise / proof / price posture / conversion door, written as gradeable claims (U-xx) with confidence levels and evidence refs.

## 1. The design (read before running or editing the prompt)

1. **Blind read.** Phases A–B may read only the public-surface corpus: `(site)`/`(campaign)` pages, section components, nav/NAP, JSON-LD builders, `public/llms.txt`, prospect-facing API strings, published-Sanity inventory. Everything in `docs/`, `prompts/`, `.agents/`, `brand/`, plus `lib/strategy/`, `lib/sales/`, `app/strategy/`, `app/sales/` is the **answer key** — off-limits until the mirror data is serialized. `docs/strategy/offer-research/` is literally the canonical offer; reading it first turns the exam into transcription.
2. **Ambient contamination is handled, not denied.** AGENTS.md and the memory index auto-load into every session and summarize the business. Mitigation: every claim on the page must carry page-level evidence (route + quote). Anything the agent "knows" but cannot evidence from the corpus goes into a dedicated **"Briefed, but the site never says it"** section — itself a finding surface (offer facts that live only in internal docs).
3. **Verticals are derived, not given.** The prompt hands the agent no vertical list. Whether the copy communicates the vertical set clearly is part of what's being tested — internal docs themselves disagree on the count, so let the copy speak.
4. **Phase-locked.** A (scan) → B (synthesize + serialize data) → C (build the page; only now may it open `app/strategy/` plumbing for the render pattern) → D (verify + report). Mirror content is frozen before any answer-key-adjacent file opens.
5. **No fixes in v1.** Findings route into the offer-consolidation build plan (`docs/strategy/offer-research/03-migration-build-plan.md`), which is gated on the founder signing `04-signoff-sheet.md`. The mirror diagnoses; it does not edit public copy.
6. **IDs follow house convention.** U-xx for gradeable understanding claims, F-xx for findings — the same ledger habit as the Opus-5 audit program.

## 2. What already exists (the map — v1 must NOT read these; v1.1+ does)

| Artifact | Role in this program |
|---|---|
| `docs/strategy/offer-research/00-offer-architecture.md` | The canonical offer. v1.1's answer key. |
| `docs/strategy/offer-research/01-anchor-ladder.md` | Price anchors ($30K / $45K / $200K-class). Grade price-posture claims against it. |
| `docs/strategy/offer-research/{industrial,home-services,medical-dental,consumer-jewelry}-offer-spec.md` | Per-vertical answer keys + wording kits. |
| `docs/strategy/offer-research/03-migration-build-plan.md` + `04-signoff-sheet.md` | Where confirmed drift fixes route. Build is gated on 04 being signed. |
| `docs/strategy/offer-research/alignment/home.md` | Prior art: a *sighted*, homepage-only version of this audit. v1 generalizes it site-wide, blind. |
| `.agents/product-marketing-context.md` | Copy SSOT (voice, kill-list, ICPs). v1.1 drift + voice-pass input. |
| `docs/strategy/multi-vertical-pivot/00-phase-plan.md` | Pivot status; explains *expected* staleness. |
| `lib/strategy/niches/{types,data,briefs.generated}.ts` + `app/strategy/niche/[slug]/page.tsx` + `components/strategy/NicheBrief.tsx` | The build pattern the offers page mirrors (types → generated data → accessor → view component). |
| `app/strategy/layout.tsx` | The gate: `SALES_ENABLED` + signed cookie + localhost bypass, `robots noindex`. Inherited automatically by `app/strategy/offers/`. |
| `prompts/offer-research/01-offer-audit-2026-07-05.md`, `02-prompt-offer-architecture.md` | Prompt precedent from the offer-research wave. |

## 3. Version ladder

**Sequencing (founder-confirmed 2026-07-24, superseding the earlier two-run plan):** the whole ladder runs as ONE session via `02-prompt-full-ladder.md`, made safe by three conditions baked into that prompt: (1) `mirror.generated.ts` is **frozen** at the end of the blind phase and never edited afterward — misreads become drift rows, not mirror patches; (2) grading is an **in-chat GATE:HUMAN pause** mid-session (the run stops after the mirror report and waits for `U-xx → G1/G2/G3`); (3) mirror / drift / perception are **additive files**, so an early stop still leaves a working page. The outside-in stage needs no `.env.local` keys — it uses the DataForSEO MCP tools available in-session (Ahrefs/Brand Radar optional if connected). The per-version scopes below remain the reference for what each stage must deliver; the prompt seeds further down apply only to the staged fallback path (`01`).

### v1 — The mirror (prompt ready: `01-prompt-v1-offer-mirror.md`)

- **Scope:** blind scan of the public corpus (~60 routes + shared sections + chrome + machine layer + published-Sanity inventory) → classified inventory → derived verticals → per-vertical U-claims with confidence → coverage matrix → F-xx findings → "briefed but not on the page" → gated page at `/strategy/offers` + a card on the `/strategy` hub.
- **Hard limits:** no public-copy edits, no Sanity writes, no commits.
- **Exit:** page renders behind the gate locally; founder has a grade-me list in chat.
- **Effort:** one session; Phase A fans out ~6 subagent readers.

### v1.1 — Grade + drift (entry condition: founder grades returned)

- Founder grades every U-xx: **G1 right / G2 partial / G3 wrong** (+ free notes). Grades get stored on the page — the mirror becomes benchmarkable.
- **Answer-key diff:** mirror vs `offer-research/` canon + `product-marketing-context` + phase plan. Classify every mismatch: *copy-stale* / *docs-stale* / *true contradiction* / *mirror-misread*.
- **Door audit:** every route's primary CTA vs the intended funnel doors; wrong-door findings.
- **Voice pass:** kill-list violations per route (counts, worst offenders).
- **Output:** a "Drift" section on the page; fix candidates filed into `03-migration-build-plan.md` (respecting the 04 gate); docs-stale items become SSOT patch suggestions.
- **Effort:** short session + ~30 founder-minutes of grading.

### v1.5 — Full corpus + regenerable

- **Full published-Sanity pull** (GROQ, `published` perspective): glossary terms, career paths, case studies, guides, blog — folded into inventory and findings (does authority content reference the current offer or an older one?).
- **Live-crawl verification** against production: rendered metadata, JSON-LD, llms.txt as served — catches deploy-level divergence from the repo.
- **Regenerable:** extract Phase A into `scripts/offer-mirror-scan.mjs` (or a saved workflow) that re-scans and re-serializes `mirror.generated.ts` with `generatedAt` + a delta-vs-last-run section.
- **Effort:** one session + script hardening. Cadence decision → §6 D-B.

### v2 — Outside-in + standing offer dashboard

- **Three-way alignment:** what the copy says (mirror) vs what canon says (answer key) vs **what machines say back** — AI-engine descriptions of Sale Solution via DataForSEO LLM-mentions / ChatGPT scraper + Brand Radar (SAL-406), plus brand-SERP snippets. Map every external misdescription to the copy that likely caused it.
- **Competitor framing scan** per vertical: how rivals describe the same promise; where our contrast claims collide with theirs.
- **Objection coverage:** the objection library vs what the copy actually pre-empts, per vertical.
- The page evolves into the standing **Offer dashboard** (mirror + drift + outside-in + grade trend), optionally on a scheduled re-run.
- **Deps:** DataForSEO keys in `.env.local` (still pending from the pre-call-scanner setup), Brand Radar access, founder OK on external-query spend (§6 D-C).
- **Effort:** 1–2 sessions.

### Prompt seeds for later versions (expand after v1 grading)

- **v1.1:** "Load the v1 mirror data and the founder's U-xx grades. Now read the answer key: `docs/strategy/offer-research/*`, `.agents/product-marketing-context.md`, `docs/strategy/multi-vertical-pivot/00-phase-plan.md`. Produce the mismatch table (copy-stale / docs-stale / contradiction / mirror-misread), the CTA-door audit, and the kill-list pass. Extend `lib/strategy/offers` types with grades + drift; add the Drift section to the page; file fix candidates into `03-migration-build-plan.md` as a new task block. Do not edit public copy."
- **v1.5:** "Make the mirror regenerable: extract Phase A into `scripts/offer-mirror-scan.mjs` (env from `.env.local`, `published` perspective for Sanity, optional `--live` crawl of salesolution.net), emitting `mirror.generated.ts` + a delta vs the previous run. Run it once and ship the refreshed page."
- **v2:** "Add outside-in: query LLM-mentions + the ChatGPT scraper + Brand Radar for how AI engines describe salesolution.net per vertical; store as `PerceptionRecord[]`; render three-way alignment + a misdescription→causing-copy map; propose a fix list ranked by external impact."

## 4. Adjacent ideas (unscheduled, parked here so they aren't lost)

- **Comprehension benchmark:** re-run the blind mirror after each major copy wave; the U-grade trend is the copy-clarity KPI. Nearly free once v1.5 lands.
- **SSOT patch-backs:** where the copy is right and the docs are stale, patch the docs — keeps the answer key honest.
- **Onboarding artifact:** the *graded* mirror ("what we sell, verified, in plain words") becomes the intro doc for future agents and contractors.
- **Glossary byproduct:** offer-vocabulary terms found in public copy but missing from the glossary get queued during the scan (already optional in the v1 prompt).
- **Client productization:** if the instrument proves useful on our own site, the same scan on a client's domain is a sellable diagnostic. Park until ours is graded.

## 5. Execution notes

- **Fresh session, repo root, paste `01` whole.** Model per house default (Opus everywhere, max effort). Ultracode optional — fan-out helps Phase A but isn't required.
- **The gate is free:** `app/strategy/offers/` inherits the layout gate automatically; localhost bypasses it, so local verification needs no env setup. Never add the page to sitemaps; noindex comes from the layout.
- **Landmines:** Next 16 dev flakiness — recover with `pkill -f "next dev"; rm -rf .next; pnpm dev`; one dev server + one browser if screenshotting (`scripts/_visual-check.mjs` pattern, `npm i --no-save playwright`).
- **DoD (v1):** `npx tsc --noEmit` clean (pre-existing `lib/lead-form/*` Zod errors excepted) · lint clean on changed files · `pnpm build` compiles · page renders behind the gate · `git status` shows only new files + the one hub-card edit · zero Sanity writes · no commits unless the founder asks.
- **Files land at:** `lib/strategy/offers/{types.ts, mirror.generated.ts, data.ts}` · `components/strategy/OfferMirror.tsx` · `app/strategy/offers/page.tsx` · one card added to `app/strategy/page.tsx`.

## 6. Decision queue (GATE:HUMAN)

- **D-A.** Grade the mirror **mid-run**: the full-ladder session pauses after its Phase D report; reply in chat with `U-xx → G1/G2/G3` + notes. ~30 minutes. This is the only blocking gate.
- **D-B.** Refresh cadence (per copy wave vs monthly), and whether the collector's delta posts anywhere (Linear SAL?) or stays on the page. Decide after seeing the first dashboard.
- **D-C.** External-query spend: pre-approved at a modest budget (~15–25 MCP calls) per the founder's 2026-07-24 single-session instruction; the agent previews its exact query list at the D-A gate so it can be trimmed or vetoed in the same reply. Competitor framing scans stay out of scope until asked.
