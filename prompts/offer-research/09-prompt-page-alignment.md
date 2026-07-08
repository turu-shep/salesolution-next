# Prompt 8 — Page alignment audit (run once per page)

Aligns any single page of salesolution.net with the **signed offer architecture** — the
spirit (value-based, system-first, burned-buyer-safe) and the structure (one spine, motion
rules, canonical copy blocks, claims discipline). Written 2026-07-08, after the migration
shipped; most money pages are already aligned — this prompt is for **everything else**
(homepage, landing pages, doors, about, tools, hubs) and for re-checking money pages after
future edits.

**How to use:** paste everything below the line into a fresh Claude Code session, replacing
`{PAGE}` with the URL or route (e.g. `https://salesolution.net/` or `/unlock-growth-audit/`).
Prefix with `ultracode` for depth. One page per run — the report accumulates per page.

**Suggested queue (never migrated, most-drifted first):** `/` (homepage — known: all proof
is industrial, no default hero CTA, FAQ still AI-search-era) · `/unlock-growth-audit/` ·
`/book-growth-call/` · `/future-proof-your-seo/` · `/catalog-snapshot/` · `/about/` ·
`/case-studies/` · `/tools/` + tool pages · `/services/full-growth-ownership/` (deep pass —
SLA tiering still open) · `/services/` hub (deep pass).

---

You are auditing ONE page of salesolution.net against the signed offer architecture, then
fixing what canon already decides and proposing (never shipping) what needs founder wording.
I'm the founder. Page under audit: **{PAGE}**

## Read first — canon, in precedence order (higher wins on conflict)

1. `docs/strategy/offer-research/00-offer-architecture.md` — SIGNED spec of record. §9.1 is
   the **page-type number matrix** (decides which numbers/blocks THIS page may carry);
   §16's corrections WIN over the doc body.
2. `docs/strategy/offer-research/03-migration-build-plan.md` — Task 2 holds the **canonical
   copy blocks** (floor line, credit sentence, terms line, staged billing, setup-ban, hero
   spec-card slots, 48h-SOW line); Task 1 the payback component spec; Task 4 the ROI-stat map.
3. `docs/strategy/offer-research/04-signoff-sheet.md` — what is SIGNED vs OPEN. The header
   block records the signed riders (MED-hero D+F, dental option skin, FGO-24h, D-C4 Liori
   scope). **§C claims rows that are not signed may NOT appear on any page.**
4. The vertical spec matching the page's audience — `industrial-offer-spec.md` /
   `home-services-offer-spec.md` / `medical-dental-offer-spec.md` /
   `consumer-jewelry-offer-spec.md` — its wording kit is the copy source for that vertical.
   (Cross-vertical pages: read none in full; pull per-motion patterns from Task 2 instead.)
5. `.agents/product-marketing-context.md` — voice, kill-list, motion rules, the locked
   canonical stats and their **sell-product-only** restriction, keyword-ownership map.
6. `prompts/offer-research/01-offer-audit-2026-07-05.md` — pre-migration ground truth
   (context for why things are the way they are; not current state).

## The spirit checks — what "aligned" means beyond mechanics

1. **Value-based, never commodity (Weiss).** The fee anchors to the improved condition;
   nothing on the page presents the install or FGO as a comparable line item. The ~10x is
   COMPUTED in the buyer's own units (calculator, N-payback, fill-in-the-blank math) —
   never claimed in adjectives. Anchors are the buyer's own money already leaving, not
   our effort.
2. **Burned-buyer safety (founder canon, 2026-07-07).** No pain-guess heroes on
   multi-audience pages: don't bet the opening on ONE assumed problem — the buyer may not
   have it, and if they already paid an agency to fix it, restating it reads as the same
   failed pitch. Lead with the working system / mechanism; name pains as plural examples;
   let the audit/diagnostic decide ("I don't guess which is yours — the audit counts it").
   A single-niche page may lead a VOC-verbatim pain only if it's near-universal for that
   niche (the dentists and roofing patterns).
3. **One spine, told the same way.** Door → install (from $30K, scaled to the value at
   stake) → retainer (operator access + a compounding system, never a monthly task menu) →
   FGO. Per-service offers read as entry doors whose fee credits toward the install. If
   the page tells a different offer story, that's drift.
4. **Motion decides the commercial model — the single collision to lint for.**
   book-jobs = verbatim guarantee, "I" voice, Revenue Leak Audit CTA, number-in-the-audit,
   accent-orange. sell-product = NO guarantee language anywhere, "we" voice, Book a Growth
   Call + 48h written SOW, published floors/bands, brand-blue. Exactly ONE commercial block
   per page. Mixed/neutral pages (homepage, /revenue-engine/ product page) carry NEITHER
   exact numbers NOR a guarantee — they route to the motions.
5. **Proof discipline.** Every number on the page must trace to: a SIGNED claims row, the
   signed architecture prices, or the locked `lib/stats.ts` six (which are
   **sell-product/industrial surfaces ONLY** — never on Revenue Engine or local-service
   pages). No fabricated counts, testimonials, review scores, or client tallies —
   the site had these once; they were removed by signed decision and must not creep back.
   PROOF-SLOTs stay empty until real data. Named clients only with recorded consent
   (currently: Liori Diamonds, scoped to search + content, no outcome claims).
6. **Trust artifacts over hype.** The CTA names the thing the visitor keeps (written
   diagnostic, leak report, SOW with dates). No manufactured urgency, countdowns, or
   scarcity; calendar/seasonal urgency only when sourced; capacity counts only if
   founder-set and true. "Published model, no games" is the register everywhere.

## The mechanical rubric — check each, cite the source rule

| # | Element | Rule |
|---|---|---|
| 1 | Motion + page type | Type the page (hub / pillar / vertical / cylinder / product / door / neutral) and find its §9.1 matrix row. Pages not in the matrix inherit the nearest analog — say which. |
| 2 | Numbers on page | Exactly what the matrix row allows: floors/bands where permitted, full math only on Catalog AI, NOTHING exact anywhere (exact fees live only in the same-day rate letter / 48h SOW). |
| 3 | Floor line | Where present, verbatim canon: book-jobs "Installs start at $30,000. The exact number comes from the audit — in writing, same day." / sell-product "From $30,000, one-time. Scaled to the value at stake…" Never "scaled to what the audit finds." |
| 4 | Credit sentence | Split two-sentence form, scoped to the five priced sell-product cylinders only; on book-jobs it lives in the rate letter, never on-page. |
| 5 | Terms line | book-jobs "Installed by day 60, proving by day 90 · one-time install fee · 3-month minimum, month-to-month after"; sell-product "~90 days, work shown week 4 · leave on 90 days' notice." FGO exception: its own quote turnaround is 24h (founder-confirmed) — do NOT "harmonize" it. |
| 6 | "Setup" ban | The word never appears in an install-fee context (labels, spec cards, terms). Non-fee uses ("compliance setup") are fine. |
| 7 | Payback math | If the page carries leak math it uses `WholeFlowLeak` (correct motion variant) or the industrial static block. D12/R8: NO bare monthly figure ("$2,500/mo") anywhere; payback = N in the buyer's unit vs the install floor. |
| 8 | Guarantee | book-jobs pages: the verbatim `<Guarantee>` component ("…beat my **monthly** fee by day 90…") — never paraphrased, never quoted in fragments. All other pages: zero guarantee language (a link to it is fine on book-jobs cylinders). |
| 9 | ROI stats | $378M / 91% / 2.5x / 96 render on the homepage + /services/ai-seo/ proof bars only; 5.2x + $575k deliberately unused. None of the six on any Revenue Engine or local-service surface. |
| 10 | CTA + measurement | Motion-correct door; artifact named in microcopy; `data-cta` id present and motion-appropriate (`revenue_leak_audit__*` vs `book_call__*`). |
| 11 | Claims audit | List EVERY stat/count/claim on the page with its trace (signed row id / architecture price / lib/stats / UNSOURCED). Unsourced → kill or de-number; do not invent replacements. |
| 12 | Voice | Kill-list clean; I/we per motion; count-free catalog language ("the cylinders," never "six/twelve cylinders" as a count claim); one em-dash max per paragraph; numbers before adjectives; five-vendor incumbent frame (not six); no exclamation marks. |
| 13 | Keyword ownership + routes | The page targets its locked query only (homepage = brand umbrella; /revenue-engine/ = product; pillars = industry; niches = "Revenue Engine for {niche}"; cylinder head terms = /services/*). No links to retired routes (/revenue-engine/{home-services,medical,local-retail}/). |

## Known BY-DESIGN exceptions — do not "fix" these

FGO's 24-hour written-quote promise (premium tier, faster paper) · the hub's per-cylinder
bands + $30K floor (entry doors / honesty artifacts) · Catalog AI's full per-SKU math (the
one fully-public price surface) · book-jobs cylinder pages carry NO prices · industrial has
NO calculator (signed IND-3 — the three-line block is the design) · the medical calculator's
volume presets are GATE:HUMAN illustrative (mirrors dentists) · `/revenue-engine/` product
page has neither price nor guarantee (router by design) · previews under /revenue-engine/
are noindex scratch · 5.2x/$575k staying unused is intentional.

## Process

1. Map {PAGE} to its route file under `app/` and list every section component it mounts;
   read them all. If a dev server is up, also curl the live route to confirm what serves —
   otherwise audit source only and say so.
2. Fill the rubric + the six spirit checks. Classify every finding:
   **PASS** · **DRIFT** (violates signed canon and canon supplies the exact fix) ·
   **GATE** (needs founder wording or an unsigned claims row) ·
   **BY-DESIGN** (cite where it's recorded).
3. Verdict: **ALIGNED** / **ALIGNED WITH NITS** / **NEEDS CHANGES**, with the one-paragraph
   read a founder can act on.
4. **Implement DRIFT items now** (canon-supplied wording only): edit, then verify —
   `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`), eslint on changed
   files, `pnpm test`. Stage ONLY your own files explicitly (never `git add -A` — other
   sessions may have work in flight), commit with the house format. Do not restructure the
   page's section order or IA — if the structure itself misfits the matrix, flag it as
   GATE with a proposed arc instead.
5. **For GATE items, propose — never ship:** exact copy, 2–3 options where taste matters
   (heroes especially: system-first per spirit-check 2), humanizer-passed, each marked
   GATE:HUMAN.
6. Write the report to `docs/strategy/offer-research/alignment/{route-slug}.md`
   (e.g. `home.md`, `unlock-growth-audit.md`): verdict → findings table (element, class,
   evidence file:line, fix/proposal) → what you changed (with commit hash) → the GATE list
   for founder sign-off.

## Hard fences

The guarantee sentence is untouchable. D13 (anchor ladder) is parked — build nothing from
it. R1–R9: bought-alone ledgers, EV multiples, and the value stack NEVER migrate to a page
(proposal artifacts only). Unsigned claims never ship — pages stay qualitative rather than
gaining invented numbers. Competitor/platform/vendor names never in copy. No new prices —
the architecture wins. Run the humanizer pass on every copy block you propose. Never edit
`AGENTS.md`, `docs/strategy/glossary-queue.json`, or `lib/strategy/niches/briefs.generated.ts`
(regenerated, not hand-edited).
