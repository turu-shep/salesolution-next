# Career-Path Build Standard — decisions, fixes, and lessons

**The definitive reference for building or reworking any career path.** Captured 2026-06-16/17
while iterating the `technical-seo-specialist` prototype with the owner. Read this before touching
the other 6 paths or authoring a new one, so we don't relearn the same lessons. The reference build
is **`/career-paths/technical-seo-specialist/`** — copy its shape.

---

## 1. Content model — skill modules, NOT essay chapters
The first model (a seniority matrix + 6 essay chapters, each `h2` + one prose paragraph + a "test it"
callout) was **rejected**: no visible progression, and it was opinion-prose, not proficiency
material. The model is now a **numbered progression of skill modules, grouped by seniority level.**

Each **module** (Sanity `careerPath.modules[]`, type `skillModule`) has these labeled parts, in order:
- **`title`** — the skill, as a plain outcome ("Find every page that should rank, and make it reachable").
- **`skill`** — one or two sentences: what you must be able to *do*.
- **`why`** — why it matters (operator voice, short).
- **`scenario`** — "In the field": a concrete, real situation.
- **`edgeCases[]`** — the gotchas (this is the part the essay model was missing — always include it).
- **`proficientWhen`** — a self-check ("You can … and explain the gap"), rendered as a tinted box.

Number them globally (01, 02, …) in level order. Helper: `orderModules()` in
`sanity/lib/career-paths.ts` (Entry→Mid→Senior, preserves authoring order; both the body and TOC use
it so numbering matches).

## 2. Stages must be self-describing
Bare "Entry / Mid / Senior" headings were rejected as undescriptive ("Entry *what*?"). Each stage
divider must say what the stage is:
- **Heading** = `{level} — {label}` (two-tone), e.g. **"Entry — run the checks"**. The descriptor
  lives in `seniorityMatrix[].label`. Never ship a bare level word.
- **Skill range** next to it, e.g. "Skills 01–03".
- **`seniorityMatrix[].focus`** = a concrete **"By the end you can…"** outcome (not a vague blurb).
- The **TOC is grouped** by level (ENTRY / MID / SENIOR sub-labels over the numbered skills) so the
  arc shows in the nav, not just the body. (`PathTOC` `items` carry a `group`.)
- `mustLearn` on the matrix is **legacy** — module paths don't use it.

## 3. Multi-vertical — never industrial-only
Sale Solution serves **three verticals**: industrial / technical-distribution e-commerce,
home-services contractors (roofing-forward), and dental practices (memory `multi-vertical-pivot`).
Teach the **universal role**; make examples **span all three verticals** across the modules, and show
the vertical-specific flavor where a skill genuinely differs (e.g. "junk pages" = faceted nav for
e-comm, doorway city pages for home-services, duplicated service pages for dental). Pull industrial
examples from [04-niches.md](04-niches.md); home-services/dental from `multi-vertical-pivot`.
**A path's `level` field reads "Entry → Senior"** when it spans the arc — not a single level.

## 4. Voice — humanize, keep + explain jargon
- Run the **humanizer** rules on every content task (`~/.claude/skills/humanizer/SKILL.md`): short
  sentences, vary length, plain verbs, kill em-dash overuse and buzzwords, lead with the outcome.
- **Do NOT strip jargon** (we cross-link it to the glossary). Use the term, then **explain it in
  plain words right after**: "faceted navigation (the filters that let buyers narrow by size, brand,
  material)". Aim ~8th-grade reading level for the *explanations*.
- Humanize the voice, never the facts — keep numbers/dates/sources verbatim.

## 5. Term capture — automated, every time
After writing, list the domain terms used and run:
```
node scripts/glossary-queue.mjs add "term one" "term two" … --source career-path:<slug>
```
It checks each against the published glossary (Sanity, incl. aliases/slugs), existing drafts, and the
queue (`docs/strategy/glossary-queue.json`), and enqueues only new ones; it flags ones already
published so you cross-link them. Baked into `prompts/_CONTEXT.md` + the author templates.
(Inline term links inside modules aren't possible yet — module fields are plain text. To enable,
convert them to portable text + use the `glossaryRef` annotation. Path-level links work via the
`relatedTerms` rail.)

## 6. Breadcrumb + metadata
- Breadcrumb last crumb = **the path title** (`PathHero` uses `path.title`), NOT the level. Showing
  the level ("Entry → Senior path") was wrong — it's non-unique across paths and isn't the page's
  identity. (The `BreadcrumbList` JSON-LD already uses the title.)
- Hero metadata strip: For / Level / Duration. "For" = the audience (cross-vertical, e.g. "Technical
  SEOs on large or multi-location sites"), not "distributor catalogs."

## 6a. Role vs specialization — the `kind` field (2026-06-17)
Not every path is a profession. Some are **roles** (a constant, full-time-hireable job with a career
ladder: SEO Specialist, GEO Specialist); others are **specializations** (a skill or competency,
usually bought as a project or held inside a role, not a standing headcount: Technical SEO, Citation
Engineering, AI Visibility). The owner asked us to differentiate the two. One field drives it:
- **`careerPath.kind`** = `'role' | 'specialization'` (default `'role'`). Set on every path.
- **Classification (locked):** roles = `geo-specialist, seo-specialist, aeo-specialist,
  ai-search-specialist`; specializations = `technical-seo-specialist, citation-engineer,
  ai-visibility-analyst`.
- **What `kind` changes (all automatic from the field):**
  - **Hero eyebrow** — "Role" or "Specialization" above the H1 (`PathHero`).
  - **Metadata label** — the middle cell reads "Level" for a role, "Proficiency" for a specialization.
  - **Buyer section framing** (`PathBuyer`, also the TOC anchor + page heading):
    role → **"Hiring this role?"** (in-house vs agency vs fractional);
    specialization → **"Need this done?"** — lean toward **buy it as a project/retainer**, and point
    at Sale Solution's offer (a link to `/services/ai-seo/`). Specializations are the one place the
    hub may nudge toward the service, because you rarely hire them full-time.
  - **Hub grouping** (`CareerPathsGrid`) — two labelled shelves, **Roles** and **Specializations**;
    the first Role card stays featured ("Read first").
- The **module template is identical** underneath — same skill-module model for both kinds. `kind`
  only changes framing/vocabulary, never the content structure.
- This does **not** loosen the talent stance: roles still give hire-vs-agency guidance (we don't
  recruit); only specializations point toward "buy it as a project," which is consistent with the
  buyer section being the single revenue-touching surface.

## 7. Locked decisions (do not relitigate)
- **Talent stance: "we don't hire from these paths."** The buyer section is hire-vs-agency guidance,
  never recruiting.
- Career paths are **citation/entity plays** (near-zero search traffic) — measure on
  citations/refdomains, never leads. (**Cost note, 2026-06-17:** "keep them cheap" no longer blocks
  *enrichments* — calculators, formulas, diagrams, datasets, even a static role map are allowed when a
  page genuinely needs them. The gate is need + citability + architecture-safe, not effort. See §12 +
  [10-enriched-paths-vision.md](10-enriched-paths-vision.md).)
- "Citation engineering" is **in active public use** — not ours to coin; frame as a slice of GEO/AEO,
  disambiguate from local-SEO "citation building".
- **`kind` (role vs specialization)** is set per §6a. Roles weigh hire-vs-agency; specializations lean
  "buy it as a project/retainer" and may link the service. Don't reclassify without owner sign-off.

## 8. Schema reference (`sanity/schemas/career-path.ts`)
`title, slug, **kind** ('role' | 'specialization', see §6a), role` (the "For" audience), `level`
(string; "Entry → Senior" for arc paths), `duration`, `description` (lede), `aliases`, `status`,
`seniorityMatrix[]` ({level, **label**, focus, ~~mustLearn~~}), `modules[]` (skillModule: level,
title, skill, why, scenario, edgeCases[], proficientWhen), `body` (optional short intro only; legacy
paths put chapters here), `buyerSection` ({whatTheyDo, signsYouNeedOne[], inHouseVsAgency,
costReality}), `relatedTerms[]` (→ glossaryTerm), `lastReviewed`, `seo`. Rendering: `PathHero`,
`PathModules`, `PathBuyer`, `PathTerms`, `PathTOC` (all module paths inherit structure changes
automatically; `kind` flows from `PathHero`/`PathBuyer`/the page + `CareerPathsGrid`).

## 9. Workflow + tooling
1. **Seed as drafts** (`drafts.career-<slug>`) — agent drafts, operator reviews/voices in `/studio`.
2. **Voice + publish** (the published doc replaces the draft, delete the draft). Pattern script:
   `scripts/voice-publish-paths.mjs`.
3. **Don't re-run a seed script after editing in Studio** — `createOrReplace` clobbers edits.
4. To inspect drafts in a script, the read client must use `perspective: 'raw'` (the default
   `published` perspective HIDES drafts — a 0-count can be a false negative).
5. Interlinked drafts need **weak references** (`_weak: true`) until targets are published.
6. `@sanity/client` isn't top-level — import `createClient` from `next-sanity` in scripts.
7. Clean up stale `drafts.career-*` shadow-docs (they show as "unpublished changes" in Studio).

## 10. Dev / infra gotchas (cost us the most time)
- **Sanity read client now `useCdn: production-only`** (`sanity/lib/client.ts`). It was `true`
  everywhere, so dev reads lagged the CDN by ~a minute and content edits didn't show — the cause of
  the endless "clear .next and wait" loop. Fixed; dev now reads fresh.
- **Next 16 / Turbopack dev cache is flaky**: after clearing `.next` it sometimes 500s every route
  with a `SyntaxError … after JSON` or a missing `routes-manifest.json`. Recovery:
  `pkill -f "next dev"; rm -rf .next; npm run dev`, then poll for stable 200s before screenshotting.
  (Also see memory `turbopack-factory-error-orphaned-sw`.) Not a code bug — production `next build`
  passes.
- **React Compiler lint**: no variable reassignment inside `.map()` during render (use index
  comparison, not a running `let`). It errors lint even though `next build` passes.
- **Studio custom desk structure** (`sanity/structure.ts`) lists doc types explicitly — a new type
  is invisible in Studio until added there.
- **Visual loop** (owner's hard rule): one dev server, one browser, serial screenshots; ≤5 read-only
  critic agents per round; fix serially; n+1 confirm.
- The untracked `lib/lead-form/*` Zod `tsc` error is another workstream's — ignore it in typechecks.

## 11. Status of the 7 existing paths (2026-06-17)
- ✅ **ALL 7 paths now on the module model + multi-vertical + kind framing.** technical-seo-specialist
  was the reference build; the other 6 (geo, seo, aeo, ai-search, citation-engineer, ai-visibility)
  were converted 2026-06-17 (essay→modules + industrial→cross-vertical) and published live. Each: 8–9
  skill modules across Entry→Mid→Senior, descriptive stage labels, "Entry → Senior" level, grouped
  TOC, cross-vertical examples (industrial e-comm / home-services / dental), humanized + fact-checked
  against [03-roles.md](03-roles.md), 6 related glossary terms. Roles use "Hiring this role?";
  specializations (technical-seo, citation-engineer, ai-visibility) use "Need this done?" with the
  project/retainer lean + `/services/ai-seo/` link. New domain terms captured to the glossary queue.
- **How it was done:** a 2-stage workflow (author → humanize/verify) returning structured content,
  persisted via a one-off conversion script (plain text → portable text, related-term refs, the
  specialization CTA link), preserving each doc's title/seo/publishedAt. Verified live (all 200, fresh)
  + screenshot-reviewed.
- ⏳ Remaining: the 20 published **glossary terms'** examples are industrial-leaning — generalize them
  too. And the §12 enrichment foundations (weight tags, prerequisites/leadsTo, JSON-LD, open artifact)
  are not yet built — fold them in next.

## 12. Enrichment (post-2026-06-17) — see docs 10 + 11
The owner lifted the cost cap on page enrichments. Career paths and glossary terms may now carry
**optional** calculators, formulas, diagrams, datasets, or a static role/dependency map — *when the
content genuinely needs it.* Effort is no longer a reason to skip; the gate is **need + citability +
architecture-safe** (no login/state, on-discipline, never a course feature). Still hard-refused
regardless of cost: accounts, progress tracking/%, gamification, AI chat, community/UGC, teams,
portfolio submission.
- **Vision + the steal/avoid from roadmap.sh:** [10-enriched-paths-vision.md](10-enriched-paths-vision.md).
- **Engineering spec (schema fields, enrichment mechanism, phases):** [11-enriched-paths-tech-task.md](11-enriched-paths-tech-task.md).
- **Process:** run the **enrichment check** ([10 §3](10-enriched-paths-vision.md)) on every
  create/update and **record the decision** (even "none needed"), like term capture. Baked into
  `prompts/_CONTEXT.md` + the author templates.
- **Foundational steals to fold into the cascade** (cheap, do broadly): per-module `weight`
  (core/alternative/flexible), `prerequisites`/`leadsTo` path relations, per-path `ItemList`/
  `Occupation` JSON-LD, inline per-module glossary links, and an open downloadable role-map artifact.
