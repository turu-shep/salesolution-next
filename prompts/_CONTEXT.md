# Shared context — read this first

> Every prompt in `/prompts/` says "read `_CONTEXT.md` first." This is that file.
> It exists so each prompt works even when you (and the agent) have zero memory of how
> the AI-search wiki was built. Hand this + the specific prompt to an AI coding agent
> running inside this repo.

## The company
**Sale Solution** (salesolution.net). Positioning: **"AI search engineered for industrial
e-commerce"** — SEO / GEO (generative engine optimization) / AI-search-readiness services for
B2B industrial distributors (hydraulics, MRO, technical distribution). Tiny, operator-led.
Site is low-authority (DR ~10) — so the strategy is **citation/authority/AI-answer plays, not
volume SEO.**

## The asset these prompts maintain
A wiki-like **learning hub**: a **glossary** of AI-search terms (`/glossary/`) and **career
paths** for AI-search roles (`/career-paths/`). Full strategy + research lives in
**`docs/strategy/career-path/`** (read `00-overview.md` first; then `02-scope-and-positioning.md`,
`03-roles.md`, `04-niches.md`, `05-glossary.md`, `06-wiki-architecture.md`, `07-research-backlog.md`).

**What's live (as of 2026-06-14):** 20 glossary terms published; 2 career paths published
(GEO Specialist, Citation Engineer). The glossary hub is `noindex` until ≥15 terms are
published (it cleared that). Individual term/path pages are indexable on publish.

## Why the hub exists (don't lose this)
- It is **not** measured on leads or revenue. Measure it on **referring domains + AI citations**
  (Ahrefs Brand Radar) + third-party use of our terms. Career/glossary traffic doesn't convert
  — that's expected, not failure.
- The **glossary is the lead asset** (winnable low-KD concept terms + LLM-citable reference
  format). **Career paths are citation/entity plays** (near-zero search volume) — keep them cheap.
- Everything is **saturated with industrial e-commerce examples** (hydraulics cross-refs, MRO
  part numbers, PIM data, distributor catalogs) so the hub reinforces the *vertical*, not just
  the discipline. Niches to draw from: `docs/strategy/career-path/04-niches.md`.

## Locked decisions (do not relitigate without the owner)
- **Talent stance: "we don't hire from these paths."** Paths are pure authority/citation — NO
  recruiting framing, NO freelancer-curriculum reframe, NO rates page.
- **"Citation engineering" is NOT ours to coin.** It's in active public use ("AI citation
  engineering"). Frame it as "a citation-focused slice of GEO/AEO," and always disambiguate from
  local-SEO "citation building" (NAP directory listings).
- Glossary lives at top-level `/glossary/` (terms serve the whole site, not just careers).

## The voice (match it exactly)
Operator register, taken from the live site copy (`components/sections/career-paths/CareerPathsIntent.tsx`,
the services pages, the homepage):
- Terse, declarative. "X, not Y." constructions ("Reading lists, not courses.").
- Anti-marketing, no fluff, no hype. Concrete over abstract. Trade-off-aware.
- First-person plural where natural ("we"), blunt and confident ("You are probably not Caterpillar.").
- "The point is the work, not the certificate." Every path chapter ends with a
  "test it on your own site" prompt (a `callout` block, tone `tip`).

## Architecture / where things live
- **Sanity schemas:** `sanity/schemas/glossary-term.ts`, `sanity/schemas/career-path.ts`
  (registered in `sanity/schemas/index.ts`; surfaced in Studio via `sanity/structure.ts` — a
  **custom desk structure that lists doc types explicitly; a new doc type is invisible in Studio
  until added there**).
- **GROQ + fetchers:** `sanity/lib/queries.ts`, `sanity/lib/glossary.ts`, `sanity/lib/career-paths.ts`.
- **Routes:** `app/(site)/glossary/page.tsx` + `[term]/page.tsx`; `app/(site)/career-paths/page.tsx`
  + `[slug]/page.tsx`.
- **Components:** `components/sections/glossary/*`, `components/sections/career-path-detail/*`,
  `components/portable-text/PortableTextRenderer.tsx`.
- **JSON-LD:** `lib/schema.ts` (`definedTermSchema`, `definedTermSetSchema`, `breadcrumbListSchema`, …).
- **Sitemap:** `app/sitemap.ts` (glossary terms + career paths auto-included when published).
- **Nav:** `lib/navigation.ts` (Resources submenu + footer "Learning" column).
- **Glossary entry template / fields:** see `glossary-term.ts` — `term`, `slug`, `shortDefinition`
  (the liftable ≤60-word definition; renders first; feeds DefinedTerm JSON-LD), `cluster`
  (ai-search-core | measurement | technical | industrial-ecommerce | roles), `aliases`, `body`
  (portable text), `relatedTerms`, `opportunity`, `lastReviewed`, `seo`.
- **Career-path fields:** see `career-path.ts` — adds `aliases`, `status`, `seniorityMatrix`
  (Entry/Mid/Senior × focus + mustLearn), `body` (chapter walk, one H2 per chapter), `buyerSection`
  ("Hiring this role?" — whatTheyDo / signsYouNeedOne / inHouseVsAgency / costReality), `relatedTerms`
  (→ glossaryTerm), `lastReviewed`.

## How content gets created (the workflow)
1. **Agent drafts** content into Sanity as **drafts** (`drafts.<type>-<slug>`), via a Node script
   using the write client.
2. **Operator reviews/voices** in Studio (`/studio` → Glossary or Career paths).
3. **Publish** (drafts → published). Pattern scripts that already exist (read them as references —
   some are one-offs, the *pattern* matters more than rerunning them):
   `scripts/seed-glossary.mjs`, `scripts/publish-glossary.mjs`, `scripts/verify-glossary.mjs`,
   `scripts/seed-career-paths.mjs`, `scripts/voice-publish-paths.mjs`.

## Hard gotchas (these will bite you)
- **Sanity's default query perspective is `published`** — it HIDES drafts. To inspect drafts in a
  script, set `perspective: 'raw'` on the client. (This is why a draft count can look like 0.)
- **Interlinked drafts need WEAK references** (`_weak: true`) if the targets aren't published yet,
  or the write fails referential integrity. Strong refs are fine once targets are published.
- **Don't re-run a seed script after editing that content in Studio** — `createOrReplace` clobbers
  the edits.
- **New Sanity doc types must be added to `sanity/structure.ts`** or they won't show in Studio.
- **`@sanity/client` is not a top-level dep** — import `createClient` from `next-sanity` in scripts.
- **Run scripts with:** `node scripts/<name>.mjs` (env auto-loaded from `.env.local`, which holds
  `SANITY_API_WRITE_TOKEN`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`).
- **Next 16 / Turbopack dev is flaky under load** (recurring `jsx-runtime "module factory"` SSR
  errors; missing `routes-manifest.json` after a mid-run `.next` clear). Recover with:
  `pkill -f "next dev"; rm -rf .next; npm run dev` then poll for stable 200s before screenshotting.
- **Use exactly one dev server and one browser** for any visual work; screenshots serial.
- **Verify facts before publishing.** Definitions and stats must be checked against current
  sources (the original build ran an adversarial verify pass and it caught real errors —
  e.g. llms.txt is Markdown introduced 2024, Google declined it; the "~12% of AI-cited URLs rank
  top-10" stat is from Ahrefs). Never publish a fabricated "real-world example" — if you can't
  verify a real one, write a clearly-illustrative scenario instead.

## Standard definition-of-done for any content change
- tsc clean (`npx tsc --noEmit` — ignore pre-existing `lib/lead-form/*` Zod errors, not ours),
  lint clean on changed files, `npx next build` compiles.
- Content seeded as **drafts** unless the prompt says publish.
- If you published: verify live (`curl` the page for HTTP 200 + a known phrase), confirm counts in
  Sanity, and update `docs/strategy/career-path/00-overview.md` + `07-research-backlog.md`.
