# Prompt — Offer Mirror v1

Founder: open a **fresh session** at the repo root and paste everything below the rule, whole.
Executing agent: do **not** open `00-README.md` (or anything else in `docs/`) until Phase C says you may. It names answer-key content.

---

## Mission

Read every public surface of this site cold and build the **Offer Mirror**: a gated internal page at `/strategy/offers` that shows (1) a classified inventory of all customer-facing copy, (2) what you — from the copy alone — understand this business sells, per vertical, as gradeable claims, and (3) where the copy is inconsistent with itself.

This is simultaneously a copy-consistency audit and a test of *your* comprehension. The founder will grade your claims. An answer key exists in this repo; the exercise is worthless if you read it. Your only evidence is what a prospect (or an AI answer engine) can see.

## Rules of the game

1. **Blind read.** During Phases A and B you may read ONLY the corpus defined below. These paths are the answer key and internal strategy — **forbidden until Phase C**: `docs/`, `prompts/`, `.agents/`, `brand/`, `seo-project/`, `analysis/`, `.engine/`, `.claude/` (including worktrees and memory files), `app/strategy/`, `app/sales/`, `app/studio/`, `components/strategy/`, `components/sales/`, `lib/strategy/`, `lib/sales/`, and the root `README`/`AGENTS.md`/`CLAUDE.md` (already ambient — do not re-open).
2. **Ambient knowledge is briefing, not evidence.** Your context already contains AGENTS.md and a memory index that describe this business. Every claim you publish must cite corpus evidence (route + file + quote). Anything you believe but cannot evidence from the corpus goes into a dedicated **"Briefed, but the site never says it"** list — that list is a deliverable, not a failure.
3. **Derive, don't assume.** Do not import the vertical taxonomy, offer names, pricing, or funnel model from ambient knowledge. If the copy names its verticals inconsistently, that inconsistency is a finding — report it, don't smooth it over.
4. **Phase lock.** A (scan) → B (synthesize + serialize the data file) → C (build the page) → D (verify + report). The mirror's content is frozen at the end of B, before you open any `app/strategy/` file for the render pattern.
5. **Diagnose, don't fix.** No edits to public copy, no Sanity writes, no commits. Findings get one-line *directions*, not implementations.
6. **Evidence discipline.** Quotes are verbatim, ≤25 words each, with the source file path. Every U-claim and F-finding carries at least one.

## Phase A — Scan the corpus

**Corpus (the only readable surfaces in A/B):**

- All page routes under `app/(site)/` and `app/(campaign)/` — pages, their layouts, and metadata exports. **Exclude** `app/(site)/drafts/` and `app/(site)/dev/styleguide/` (internal utilities).
- Copy-bearing components: `components/sections/**` (including all per-page subdirs), `components/layout/**`, `components/forms/**`, `components/seo/**`, `components/probe/**`, `components/tools/**`, `components/services/**`, `components/portable-text/**`, `components/integrations/**`.
- The chrome + identity layer: `lib/business.ts`, `lib/navigation.ts`.
- **The machine layer — first-class surfaces, not an afterthought** (this is what answer engines read): `lib/schema.ts` (every JSON-LD builder string), `public/llms.txt`, `app/robots.ts`, the sitemap handlers (`app/sitemap.xml/route.ts`, `app/sitemaps/[file]/route.ts`, `lib/sitemap/*`) for what's included/excluded, and every page's `metadata` export (titles, descriptions, OG).
- Prospect-facing strings inside API routes (confirmation emails, thank-you payloads, report copy): `app/api/lead/`, `app/api/full-growth-quote/`, `app/api/revenue-leak-audit/`, `app/api/probe/**`, plus `lib/probe/**` and `lib/lead-form/**` where they hold user-visible text.
- **Published Sanity content, inventory level:** using env from `.env.local` (`createClient` from `next-sanity`, `perspective: 'published'`), list `_type`, `title`, `slug` for the content types the dynamic routes render (glossary terms, career paths, case studies, guides, posts, CMS pages). Write the fetch as a throwaway script in your scratchpad, not in the repo. If env is missing, proceed without it and record the gap in the corpus manifest. Do not read draft documents. Do not make content-level claims about Portable Text bodies you haven't read — classify those routes from their templates and mark confidence accordingly.

**Method:** fan out parallel readers (Explore/general subagents; a workflow if this session has ultracode on). A sensible split is ~6 groups: (1) home + chrome + machine layer, (2) `/services/*`, (3) `/revenue-engine/*` + `/industries/*`, (4) conversion pages + tools/probe + the campaign LP, (5) learning hub + guides/blog/case-study templates + the Sanity inventory, (6) legal/misc + `[slug]` catch-all + remaining routes. Each reader returns records in the schema below; you synthesize centrally. Readers must obey the same forbidden-paths rule.

**Record one entry per route (plus one for global chrome and one for the machine layer):**

```
route            e.g. "/services/catalog-ai"
sources[]        files read for it
pageType         derive the taxonomy; starter set (extend freely): hub | service | product-system |
                 industry | proof | authority-learning | conversion | tool-report | legal-pref |
                 chrome | machine | lab-preview
vertical         as evidenced in the copy; "shared" and "unclear" are valid values
offer            what is being sold here, in the copy's own words
promise          the outcome claimed, in the copy's own words
priceSignals     any numbers, tiers, anchors, or "silent"
proof            what evidence the page leans on (numbers, case refs, credentials, none)
primaryCta       { label, href } — the door this page pushes
voiceNotes       one line: register, notable tics
quotes[]         1–3 verbatim quotes (≤25 words) with file paths
flags[]          freeform: "no-cta", "metadata-contradicts-body", "tagline-variant", …
```

## Phase B — Synthesize

Produce, in this order, from the records only:

1. **TL;DR** — "What this company sells, in my words." ≤120 words, plain language, no internal jargon.
2. **Vertical briefs** — for each vertical *the copy evidences*: buyer, pain, offer, promise, proof, price posture, primary door, and the "why us / us-not-them" contrast if the copy makes one. Write each element as a numbered claim **U-01, U-02, …** (globally numbered), one sentence each, tagged with confidence — **H** = ≥2 independent surfaces agree · **M** = single surface · **L** = inferred — plus evidence refs. These are what the founder grades.
3. **Coverage matrix** — verticals × funnel stages (attract / educate / prove / convert), cell = route count. Call out empty cells that matter.
4. **Findings F-01, F-02, …** ranked by severity:
   - **P1 Contradiction** — surfaces make incompatible claims (offer, promise, price, process, identity).
   - **P2 Stale positioning** — a surface frames the audience or offer more narrowly (or differently) than the site's dominant positioning; shared surfaces (home, nav, footer, metadata, JSON-LD, llms.txt) weigh heaviest.
   - **P3 Wobble** — the same thing named differently across surfaces (offers, audits, frameworks, taglines, CTAs).
   - **P4 Gap** — a question a serious buyer can't answer from the site, or a coverage hole from the matrix.
   Each finding: id, severity, kind, surfaces (route + file), quotes, one line on *why it matters* in business terms, one line of *direction* (no implementation).
5. **Briefed, but the site never says it** — ambient facts about the business with zero corpus evidence.
6. **Open questions** — what you still can't answer about this business after reading everything, per vertical and globally.
7. **Self-assessment** — one short paragraph: where your understanding is solid, where it's shaky, and what single copy change would have helped you most.

**Serialize** all of it now (this freezes the mirror): create `lib/strategy/offers/types.ts` (typed like the house style you'll confirm in Phase C — write it plainly for now), `lib/strategy/offers/mirror.generated.ts` holding one `MirrorData` object — `generatedAt: "2026-07-24"` (today's date), method line, corpus manifest (routes scanned, files read, gaps), tldr, verticals with U-claims, inventory records, coverage, findings, briefed-not-on-page, open questions, self-assessment — and `lib/strategy/offers/data.ts` with accessors. Header comment on the generated file: `GENERATED by the Offer Mirror v1 prompt (docs/handoff/offers/). Do not hand-edit — re-run the prompt to refresh.`

## Phase C — Build `/strategy/offers`

Phase B data is now frozen — do not revise claims or findings from here on. You may now read, **for structure only**: `app/strategy/layout.tsx`, `app/strategy/page.tsx`, `app/strategy/niche/[slug]/page.tsx`, `components/strategy/NicheBrief.tsx`, `lib/strategy/niches/types.ts`. Align your `lib/strategy/offers/` files with the niches pattern (types → generated data → accessors) and follow the NicheBrief presentation idiom.

Build:

- `app/strategy/offers/page.tsx` — server component rendering the mirror via `components/strategy/OfferMirror.tsx`. The gate, `force-dynamic`, and noindex are inherited from `app/strategy/layout.tsx` — add nothing to sitemaps.
- Page structure: header (title, `generatedAt`, corpus counts, one-line method, and the grading instruction: "Grade in chat: `U-xx → G1 right / G2 partial / G3 wrong` + notes") → TL;DR → vertical briefs with U-claims + confidence + evidence → coverage matrix → findings by severity with quotes → briefed-but-never-said → open questions → self-assessment. Long tables must stay scannable — group the inventory by route group, wide tables scroll in their own container.
- Add one card for it on the `/strategy` hub (`app/strategy/page.tsx`) — the only edit to an existing file in this entire task.

## Phase D — Verify + report

Definition of done, all verified before you claim it:

- `npx tsc --noEmit` clean (pre-existing `lib/lead-form/*` Zod errors excepted) · lint clean on changed files · `pnpm build` compiles.
- Page renders at `localhost:3000/strategy/offers` (localhost bypasses the gate — set no env). Dev-server landmine recovery if needed: `pkill -f "next dev"; rm -rf .next; pnpm dev`.
- `git status` shows ONLY: new `lib/strategy/offers/*`, new `components/strategy/OfferMirror.tsx`, new `app/strategy/offers/page.tsx`, modified `app/strategy/page.tsx`. Nothing else touched. No commits.
- Optional byproduct (cheap, allowed): queue offer-vocabulary terms found in public copy but missing from the glossary via `node scripts/glossary-queue.mjs add "term" --source page:<slug>`.

**Report back in chat:** the page path and how to view it · corpus stats + any gaps (e.g. Sanity env absent) · the TL;DR verbatim · the full U-claim list with confidence levels · top 5 findings with severity · the briefed-but-never-said list · then the explicit ask: **"Grade me: `U-xx → G1/G2/G3` + notes. Grades unlock v1.1."**

Then stop. v1.1 (answer-key diff, door audit, voice pass) is a separate, gated run — do not start it, and do not read `docs/` now that you're curious.
