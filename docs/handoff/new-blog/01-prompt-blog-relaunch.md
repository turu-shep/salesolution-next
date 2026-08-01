# Prompt — Blog Relaunch: triage the legacy library, build the educate lane

Founder: open a **fresh session** at the repo root and paste everything below the rule, whole. One human gate in the middle (you sign the keep/kill ledger, ~15 min). Expect a long run.
Executing agent: this file is self-contained. The Offer Mirror run (2026-07-25) is the factual baseline; do not re-derive it.

---

## Why this exists (read first)

The blind Offer Mirror scan found the content library is the most pre-pivot surface on the site:

- **18 of 20 posts** are 2023–24 generic SEO/content-marketing pieces in an old agency voice ("If you're feeling overwhelmed… our team is here to help"), with year-stamped titles ("…2023"), null authors, and one live **demo post** (`how-ai-search-picks-sources`) linking `example.com` and a glossary slug that doesn't exist.
- **All 9 guides** are an Aug-2023 "website launch checklist" series that never mentions AI search, the Revenue Engine, or any current offer. The guides hub promises "standalone deep-dives on schema, AIO, and paid-search" that don't exist.
- Posts render at **root-level URLs** (`/[slug]`) with breadcrumbs claiming `Home / Blog /`, plus a `/category/blog/` index whose "pillars" match zero actual categories.
- The outside-in pass (19 engine queries, 2026-07-25) found the firm **absent from every category buyer question** across four verticals, while engines cite competitor-authored content for the exact pitches this site sells. The educate lane is the citation inventory we don't have.

Mission: **triage the legacy library, then relaunch the blog as the educate lane for the current business** — four verticals, two motions, current voice — without diluting the industrial authority moat.

## Canon you must load before writing anything

1. `.agents/product-marketing-context.md` — positioning SSOT, kill-list, words-to-use/avoid, client-naming rules.
2. `docs/strategy/operating-concept-bring-convert-retain.md` — the canonical frame (Bring → Convert → Retain; Prove is the measurement layer under all three, **not** a fourth stage; the word is **Convert**, never "Sell").
3. `docs/strategy/icp/industrial-distribution.md` — ICP language rules (never cold: schema, GEO, CTR, ERP/PIM, faceted navigation).
4. `lib/strategy/niches/briefs.generated.ts` — per-vertical `wordsToAvoid` lists (roofing, hvac, plumbing, electrical, dental, med-spa, plastic-surgery, local-retail). Read-only; never hand-edit.
5. `brand/competitor-policy.yaml` — banned competitor names (verifier fails any article containing one). Permitted villains: Amazon + "manufacturers going direct" (industrial only). Semrush/Ahrefs may be cited as tools.
6. `.engine/README.md` + `.engine/principles.md` + `project.yaml` — the content pipeline contract (targets: 2000 words, FK grade 8, verifier pass, analyzer ≥80).
7. `lib/strategy/offers/mirror.generated.ts` + `drift.generated.ts` — the Offer Mirror evidence base (read-only).

## Founder decisions in force (2026-07-25) — these override older docs

New copy must comply; legacy copy that violates them gets rewritten or killed:

1. **No "published pricing" claim anywhere.** The only public pricing that survives is Catalog AI per-SKU. No other dollar figures in blog content, period.
2. **Sprints and pilot-style entry engagements are retired.** Install-first. Never mention Constraint Sprint, pilots, or fee-credit mechanics in new or rewritten content.
3. **No outcome guarantees.** The stance: we don't control client-side delivery (how they answer, quote, present, close), so we don't guarantee outcomes — we install the best-known system and tools, train the team, and track the KPIs with them. Never reference the old day-90 sentence.
4. Industrial floor: **$2M/yr revenue** (striving toward $200k+/mo e-com). Not $5M, not $200k/mo as a gate.
5. Industrial promise: **an installed, future-proof system for e-commerce and business sales in the AI era** — citations are the mechanism, not the headline promise.
6. The service catalog is **12 cylinders**; never say "six services."
7. **Never frame the buyer as duped or passive** ("you've been sold pieces" is banned). Sell the complete installed system they don't yet have — gain-framed.
8. No "nothing saved / no email required"-type absolute privacy claims around content upgrades. Honest-but-light capture copy only.

Hard blocks that survive everything: **Northern Hydraulics** is never named in content until the fact-ledger resolution ships (`docs/strategy/case-studies/fact-ledger.md`); no unattested performance stats (the ARCH-3 default is *removed, none attested*); any borrowed stat carries its source inline (the "1 in 3 calls" class of line is banned without a named source).

## Phase A — Inventory + triage ledger

Pull all published posts + guides (Sanity, `perspective: 'published'`, via a scratchpad script — never write to the repo or Sanity). Join with GSC reality: export or read `seo-project/data/Queries.csv` + `Pages.csv` if fresh (<30 days), else request an export at the gate. For each of the 29 documents build one ledger row:

```
slug · type · published date · vertical fit (industrial / trades / dental / consumer / none) ·
clicks + impressions (90d) · referring domains (if known) · verdict · one-line reason
```

**Verdicts:** `KEEP` (current + performing) · `REWRITE` (topic right, execution pre-pivot) · `MERGE` (fold into a stronger piece; note target) · `KILL+301` (off-positioning or zero-value; redirect target) · `KILL+410` (demo/junk). Default bias: the 2023 SEO-101 set is `MERGE` or `KILL+301` into pillar rewrites — do not keep twenty thin generic posts out of loss aversion. The demo post is `KILL+410` on sight. Guides: judge the series as ONE asset — likely verdict is one consolidated evergreen "launch a technical site" guide plus redirects, freeing the guides hub for what its hero already promises.

Also decide and record (as recommendations, not edits): whether posts stay at root `/[slug]` or move under a prefix (weigh: existing indexation + DR-10 fragility vs information architecture; recommend, founder decides), and the real category taxonomy (three pillars max, matching `BlogPillars` copy or replacing it).

## Phase B — The educate map (what the relaunched blog is FOR)

Design ~24 pieces (a quarter's pipeline), allocated deliberately:

- **Industrial (keep the moat, ~40%):** buyer-question pieces in ICP language (RFQs, quotes, counter sales, line cards, "the AI answer"), cross-reference/spec-content patterns, catalog-integrity topics. These defend the only vertical with authority.
- **Trades + dental (the empty educate cells, ~40%):** the questions their buyers actually ask before buying a system — missed-call math, quote follow-up cadence, recall recovery, front-desk load — written in the vertical's own words per `briefs.generated.ts`. These are the citation inventory for the categories where engines currently name only competitors.
- **Consumer/DTC (~10%)** — showrooming economics; only if a real client (Liori-scoped: search+content, no outcome claims) can ground examples.
- **Umbrella (~10%):** Bring/Convert/Retain explainers that own the operating concept in public (the frame exists today only as labels).

Each piece gets: working title · target query/question · vertical · funnel stage (educate) · internal link plan (which cylinder page + which glossary terms) · proof posture (sourced-stat / client-grounded / none). Term capture rule applies to every piece: queue new domain terms via `node scripts/glossary-queue.mjs add "term" --source post:<slug>`.

## GATE:HUMAN — the ledger

Present: the 29-row triage ledger · the URL/taxonomy recommendation · the 24-piece educate map. **Stop and wait.** The founder signs or amends; kills and redirects execute only after signature.

## Phase C — Execute

1. **Rewrites/new pieces** run through the engine pipeline (`engine-init` check, research → draft → humanize → verify → analyze; humanizer pass is mandatory, kill-list + per-vertical words-to-avoid enforced, competitor names verified absent). Voice: operator register; "we" on sell-product topics, "I" on book-jobs topics.
2. **Publishing is manual in `/studio`** (no HTML→Portable Text converter exists): stage everything as Sanity **drafts**, deliver a publish checklist (author set — no more null authors; category set; metaTitle/metaDescription; internal links live; source citations present).
3. Kills/redirects: file the exact redirect map as a task block appended to `docs/strategy/offer-research/03-migration-build-plan.md` (append-only) — implementation of redirects is site code, not this session's edit.
4. DoD per piece: verifier pass · analyzer ≥80 · FK ~8 · zero kill-list hits · zero banned names · glossary terms queued · draft staged.

## Phase D — Report

Ledger outcomes (kept/rewritten/merged/killed) · drafts staged with links · redirect map filed · educate-map coverage per vertical · what remains for next quarter. No commits, no Sanity publishes, no public-copy edits outside the staged drafts.
