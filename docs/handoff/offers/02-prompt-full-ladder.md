# Prompt — Offer Mirror, Full Ladder (v1 → v2, one session)

Founder: open a **fresh session** at the repo root and paste everything below the rule, whole. This run has **one human gate in the middle** (you grade my claims in chat, ~30 min) — stay reachable. Do not discuss offer specifics in the session before pasting. Expect a long run.
Executing agent: this file is self-contained. Do **not** open anything else in `docs/handoff/offers/` (or any `docs/` path) until Phase E says you may.

---

## Mission

One session, one human gate, five stages:

1. **Blind:** read every public surface of this site cold and build the **Offer Mirror** — a classified inventory of all customer-facing copy, what you (from copy alone) understand this business sells per vertical as gradeable claims, and where the copy contradicts itself — shipped as a gated page at `/strategy/offers`.
2. **GATE:** the founder grades your claims in chat.
3. **Sighted:** open the internal canon and produce the drift analysis (copy vs docs vs grades), a CTA-door audit, and a voice pass.
4. **Regenerable:** extract the scan into a re-runnable collector script with snapshot diffs.
5. **Outside-in:** query AI engines for what they say this company does; render the three-way alignment (copy says / canon says / world hears) and file the fix list.

An answer key exists in this repo. The exercise is worthless if you read it early. Until Phase E, your only evidence is what a prospect — or an answer engine — can see.

## Rules of the game

1. **Blind read.** During Phases A–D you may read ONLY the corpus defined in Phase A. Forbidden until Phase E: `docs/`, `prompts/`, `.agents/`, `brand/`, `seo-project/`, `analysis/`, `.engine/`, `.claude/` (including worktrees and memory files), `app/strategy/`, `app/sales/`, `app/studio/`, `components/strategy/`, `components/sales/`, `lib/strategy/`, `lib/sales/`, and the root `README`/`AGENTS.md`/`CLAUDE.md` (already ambient — do not re-open). Exception in Phase C, structure only: the five strategy-plumbing files it names.
2. **Ambient knowledge is briefing, not evidence.** Your context contains AGENTS.md and a memory index describing this business. Every published claim must cite corpus evidence (route + file + quote). What you believe but cannot evidence goes in a dedicated **"Briefed, but the site never says it"** list — a deliverable, not a failure.
3. **Derive, don't assume.** No importing the vertical taxonomy, offer names, pricing, or funnel model from ambient knowledge. Inconsistent naming in the copy is a finding, not something to smooth over.
4. **The freeze is absolute.** Once Phase B serializes `mirror.generated.ts`, that file is read-only for the rest of the session — even after canon or grades reveal the mirror misread something. Misreads become drift rows classified `mirror-misread`; they are never patched into the mirror. The mirror's honesty is the product.
5. **Additive stages.** Mirror, drift, and perception live in separate generated files; the page renders whatever exists. If the session ends early, everything shipped so far still works.
6. **One human gate.** End your turn after the Phase D report and wait for grades. Do not proceed on assumptions. If the founder replies "skip grading," record all claims as ungraded and continue.
7. **Diagnose, don't fix.** No edits to public copy, no Sanity writes, no commits. Findings get one-line directions; fix candidates get filed, not executed.
8. **Evidence discipline.** Quotes verbatim, ≤25 words, with source file path. Every claim and finding carries at least one.

## Phase A — Blind scan

**Corpus (the only readable surfaces in A–D):**

- All page routes under `app/(site)/` and `app/(campaign)/` — pages, layouts, metadata exports. **Exclude** `app/(site)/drafts/` and `app/(site)/dev/styleguide/` (internal utilities).
- Copy-bearing components: `components/sections/**` (all per-page subdirs), `components/layout/**`, `components/forms/**`, `components/seo/**`, `components/probe/**`, `components/tools/**`, `components/services/**`, `components/portable-text/**`, `components/integrations/**`.
- Chrome + identity: `lib/business.ts`, `lib/navigation.ts`.
- **The machine layer — first-class surfaces** (what answer engines read): `lib/schema.ts` (every JSON-LD builder string), `public/llms.txt`, `app/robots.ts`, sitemap handlers (`app/sitemap.xml/route.ts`, `app/sitemaps/[file]/route.ts`, `lib/sitemap/*`) for inclusion/exclusion signals, and every page's `metadata` export.
- Prospect-facing strings in API routes (confirmation emails, thank-you payloads, report copy): `app/api/lead/`, `app/api/full-growth-quote/`, `app/api/revenue-leak-audit/`, `app/api/probe/**`, plus `lib/probe/**` and `lib/lead-form/**` where they hold user-visible text.
- **Published Sanity content, full text:** with env from `.env.local` (`createClient` from `next-sanity`, `perspective: 'published'`), pull the complete published documents the dynamic routes render — glossary terms, career paths, case studies, guides, posts, CMS pages — via a throwaway script in your scratchpad (never in the repo). No drafts. If env is missing, fall back to classifying those routes from templates, mark confidence accordingly, and record the gap in the corpus manifest.

**Method:** fan out parallel readers (Explore/general subagents; a workflow if ultracode is on). Sensible split, ~6 groups: (1) home + chrome + machine layer, (2) `/services/*`, (3) `/revenue-engine/*` + `/industries/*`, (4) conversion pages + tools/probe + campaign LP, (5) learning hub + guides/blog/case-study content + the Sanity pull, (6) legal/misc + `[slug]` catch-all + remaining routes. Readers obey the same forbidden-paths rule and return records; you synthesize centrally.

**One record per route** (plus one for global chrome, one for the machine layer):

```
route            e.g. "/services/catalog-ai"
sources[]        files read for it
pageType         derive the taxonomy; starter set (extend freely): hub | service | product-system |
                 industry | proof | authority-learning | conversion | tool-report | legal-pref |
                 chrome | machine | lab-preview
vertical         as evidenced in the copy; "shared" and "unclear" are valid
offer            what is being sold here, in the copy's own words
promise          the outcome claimed, in the copy's own words
priceSignals     numbers, tiers, anchors, or "silent"
proof            what the page leans on (numbers, case refs, credentials, none)
primaryCta       { label, href }
voiceNotes       one line: register, notable tics
quotes[]         1–3 verbatim quotes (≤25 words) with file paths
flags[]          freeform: "no-cta", "metadata-contradicts-body", "tagline-variant", …
```

## Phase B — Synthesize + freeze

From the records only, in this order:

1. **TL;DR** — "What this company sells, in my words." ≤120 words, plain language.
2. **Vertical briefs** — for each vertical *the copy evidences*: buyer, pain, offer, promise, proof, price posture, primary door, the "us-not-them" contrast if made. Each element = one numbered claim **U-01, U-02, …** (global numbering), one sentence, confidence-tagged — **H** ≥2 independent surfaces agree · **M** single surface · **L** inferred — with evidence refs. These get graded.
3. **Coverage matrix** — verticals × funnel stages (attract / educate / prove / convert), cell = route count; call out empty cells that matter.
4. **Findings F-01, F-02, …** by severity: **P1 Contradiction** (incompatible claims: offer, promise, price, process, identity) · **P2 Stale positioning** (a surface frames audience/offer differently than the site's dominant positioning; shared surfaces — home, nav, footer, metadata, JSON-LD, llms.txt — weigh heaviest) · **P3 Wobble** (same thing named differently across surfaces) · **P4 Gap** (a buyer question the site can't answer; meaningful empty coverage cells). Each: id, severity, kind, surfaces (route + file), quotes, one line why it matters in business terms, one line of direction.
5. **Briefed, but the site never says it** — ambient facts with zero corpus evidence.
6. **Open questions** — what you still can't answer, per vertical and globally.
7. **Self-assessment** — where your understanding is solid, where shaky, and the single copy change that would have helped most.

**Serialize and freeze:** `lib/strategy/offers/types.ts` + `lib/strategy/offers/mirror.generated.ts` (one `MirrorData` object: `generatedAt: "<today>"`, method line, corpus manifest with routes/files/gaps, tldr, verticals + U-claims, inventory, coverage, findings, briefed-not-on-page, open questions, self-assessment) + `lib/strategy/offers/data.ts` accessors. Header comment: `GENERATED by the Offer Mirror full-ladder prompt (docs/handoff/offers/). Frozen at Phase B — never hand-edit; refresh via the collector + a new run.` From here, `mirror.generated.ts` is immutable.

## Phase C — Build `/strategy/offers`

You may now read, **for structure only**: `app/strategy/layout.tsx`, `app/strategy/page.tsx`, `app/strategy/niche/[slug]/page.tsx`, `components/strategy/NicheBrief.tsx`, `lib/strategy/niches/types.ts`. Align `lib/strategy/offers/` with the niches pattern (types → generated data → accessors) and follow the NicheBrief presentation idiom.

- Define the **later-stage types now** in `types.ts` (they need no canon knowledge): `DriftData` (grades, mismatch rows, door audit, voice pass, deploy divergence) and `PerceptionData` (perception records, alignment rows). Create `drift.generated.ts` and `perception.generated.ts` exporting `null` placeholders; `data.ts` exposes `getMirror() / getDrift() / getPerception()`. The page renders Drift and Outside-in sections only when their data exists.
- `app/strategy/offers/page.tsx` renders via `components/strategy/OfferMirror.tsx`. Gate, `force-dynamic`, and noindex are inherited from `app/strategy/layout.tsx`; add nothing to sitemaps.
- Page order: header (title, `generatedAt`, corpus counts, method line, grading instruction: "Grade in chat: `U-xx → G1 right / G2 partial / G3 wrong` + notes") → TL;DR → vertical briefs (U-claims + confidence + evidence) → coverage matrix → findings with quotes → briefed-but-never-said → open questions → self-assessment → [Drift] → [Outside-in]. Wide tables scroll in their own container; group the inventory by route group.
- Add one card on the `/strategy` hub (`app/strategy/page.tsx`).
- Verify now: `npx tsc --noEmit` clean (pre-existing `lib/lead-form/*` Zod errors excepted), `pnpm build` compiles, page renders at `localhost:3000/strategy/offers` (localhost bypasses the gate; set no env). Dev landmine recovery: `pkill -f "next dev"; rm -rf .next; pnpm dev`.

## Phase D — Report + GATE:HUMAN

Report in chat: page path + how to view · corpus stats + gaps · TL;DR verbatim · the full U-claim list with confidence · top 5 findings · the briefed-but-never-said list · **your Phase G external-query plan** (the ~15–25 MCP queries you intend to run, so the founder can trim or veto in the same reply).

Then the ask: **"Grade me: `U-xx → G1/G2/G3` + notes. Reply also adjusts the outside-in query plan if you want."**

**End your turn and wait.** When grades arrive: parse any reasonable format, confirm the count back, store them verbatim (they go into `drift.generated.ts` in Phase E). "Skip grading" → mark all ungraded, continue.

## Phase E — Sighted drift (the answer key opens)

Now read, read-only: `docs/strategy/offer-research/**` (architecture, anchor ladder, visible-value pass, build plan, signoff sheet, the per-vertical specs, `alignment/`), `.agents/product-marketing-context.md`, `docs/strategy/multi-vertical-pivot/00-phase-plan.md`, `docs/strategy/icp/**`, `brand/competitor-policy.yaml`, `lib/strategy/niches/briefs.generated.ts` (its words-to-avoid lists), and this pack's `00-README.md`. The mirror stays frozen.

Produce, into `drift.generated.ts`:

1. **Grades** — the founder's U-xx grades, verbatim, with notes.
2. **Mismatch table** — every material delta between mirror and canon, classified: **copy-stale** (canon moved on, site didn't — includes G3s where your evidence genuinely supports the claim: the copy misleads) · **docs-stale** (site is right, canon lags — G1s that contradict canon are prime candidates) · **true-contradiction** (site disagrees with itself and canon picks a side) · **mirror-misread** (your evidence was thin; the grade proves it). Each row: mirror ref (U-xx/F-xx), canon source (file + section), classification, one-line resolution direction.
3. **Door audit** — every route's `primaryCta` vs the funnel doors canon intends for it; wrong-door and missing-door rows.
4. **Voice pass** — kill-list and words-to-avoid violations per route (counts, worst offenders), banned competitor names check against `competitor-policy.yaml`.
5. **Fix candidates** — ranked by business impact. **Append** them as a dated, clearly-sourced task block (`## Offer Mirror run — <today>`) to `docs/strategy/offer-research/03-migration-build-plan.md`. Append-only; respect that build execution stays gated on the signed `04-signoff-sheet.md`. Still no public-copy edits.

Page's Drift section now renders.

## Phase F — Regenerable collector

- Write `scripts/offer-mirror-scan.mjs`: the **mechanical** half of Phase A — walk the route/source map, extract copy strings + metadata + CTAs, run the published-Sanity pull, and with `--live` fetch `https://salesolution.net` renderings of key pages + `llms.txt` + JSON-LD for divergence checks. Env from `.env.local`. Emits a JSON snapshot to `analysis/offer-mirror/snapshots/<date>.json` and a diff vs the previous snapshot. It does **not** write `lib/strategy/offers/*` — synthesis stays agent work; a refresh = run the collector, then re-run this prompt from Phase B against the new snapshot. Say so in the script header.
- Run it once now: verify its inventory agrees with your hand-built corpus manifest (parity check — investigate any route it finds that you missed), and run `--live`; deploy divergences (repo vs production) become drift rows tagged `deploy-divergence`.

## Phase G — Outside-in (MCP)

Using the DataForSEO MCP tools in this session (load schemas via ToolSearch; if the MCP is not connected, note it, skip gracefully, leave the placeholder): execute the query plan approved at the gate — typically `ai_optimization_llm_response` across major models ("what does Sale Solution do", "who is salesolution.net for", plus category-level buyer questions phrased in the language you found per vertical), `ai_opt_llm_ment_search`/`top_pages` for salesolution.net mentions, the ChatGPT scraper for live answers, and `serp_organic_live_advanced` for brand-query snippets. If an Ahrefs/Brand Radar MCP is connected, add its brand-mention view; otherwise note absent. Stay within the approved call budget.

Into `perception.generated.ts`: one record per query — source/model, query, what it said the company does/serves, errors and omissions vs the mirror and vs canon, quotes. Then the **three-way alignment** per vertical — copy says / canon says / world hears — and for each external misdescription, the likely cause: the specific copy that seeded it (route + quote) or the absence that left a vacuum. Rank an external-impact fix list; append it to the same task block in `03-migration-build-plan.md`.

Page's Outside-in section now renders. The header retitles to **Offer dashboard** once all three data files are live.

## Phase H — Final verify + report

- `npx tsc --noEmit` clean (known `lib/lead-form/*` Zod exceptions aside) · lint clean on changed files · `pnpm build` compiles · page renders all populated sections behind the gate locally.
- `git status` shows ONLY: new `lib/strategy/offers/*`, `components/strategy/OfferMirror.tsx`, `app/strategy/offers/page.tsx`, `scripts/offer-mirror-scan.mjs`, `analysis/offer-mirror/**`; modified `app/strategy/page.tsx` and `docs/strategy/offer-research/03-migration-build-plan.md` (append-only). Nothing else. No commits, no Sanity writes, no new deps (`npm i --no-save playwright` allowed if screenshotting).
- Optional byproduct: queue offer-vocabulary terms found in public copy but missing from the glossary — `node scripts/glossary-queue.mjs add "term" --source page:<slug>`.

**Final report:** a tour of the dashboard · headline numbers (U-claims by grade × confidence; findings by severity; mismatches by classification; external misdescriptions found) · top 5 drift items and top 3 outside-in fixes · pointer to the filed task block · how a future refresh works (collector + re-run from Phase B). Then stop — executing fixes is a separate, founder-gated effort.
