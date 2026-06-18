# 11 — Enriched paths + glossary: engineering spec (tech task)

**Status:** Tech task / implementation spec. Implements the vision in
[10-enriched-paths-vision.md](10-enriched-paths-vision.md).
**Audience:** the engineer/agent building this. Read [10](10-enriched-paths-vision.md) and
[09-career-path-build-standard.md](09-career-path-build-standard.md) first.
**Note on effort:** effort ratings below are *informational*, not a gate. Per the 2026-06-17 owner
decision, build time is not a reason to skip an enrichment the content needs ([10 §0](10-enriched-paths-vision.md)).

---

## 0. Goal

Take the career-path + glossary hub from "numbered prose modules" to "curated, machine-extractable,
optionally-enriched reference," by:

1. Shipping the **foundational steals** (weight tags, prerequisites/leadsTo, JSON-LD, inline glossary
   links, an open data artifact) across all paths.
2. Building a **reusable enrichment mechanism** so any term/page/path can carry an *optional*
   calculator, formula, diagram, dataset, or role map — within the guardrails ([10 §4](10-enriched-paths-vision.md)).
3. Wiring an **enrichment-evaluation step** into the content create/update process.

Architecture constraints carry over from `_CONTEXT.md` and [09](09-career-path-build-standard.md):
Next 16 SSG (`generateStaticParams`, `revalidate=3600`), Sanity content, **no accounts/login/server
state**, multi-vertical, citation-not-leads.

---

## 1. Workstreams

### Phase 1 — Foundational (apply to every path; do as part of the cascade)

> **Status: Phase 1 (T1–T5) shipped (2026-06-17 / -18).** Per-module `weight` tag,
> `prerequisites`/`leadsTo` relations (DAG seeded across all 7), per-path `ItemList`/`Occupation`
> JSON-LD, inline per-module glossary links (auto-populated from terms each module uses), and the open
> role-map artifact (JSON + Markdown, CC BY 4.0, in llms.txt) are all live and verified.
> **T6 (enrichment mechanism) shipped** at careerPath level + the shared tool registry (first tool:
> ai-visibility-calculator, live on the AI Visibility Analyst path). Remaining: T7 role-map diagram,
> T8 salary dataset, plus T6 follow-ons (module-level enrichments, glossaryTerm reuse of the same
> registry, optional standalone /tools/ pages + softwareToolSchema).
>
> **Gotcha (Turbopack):** a route-handler folder with a dot in its name (`map.json/`) placed next to
> the `[slug]` dynamic route **corrupts the sibling route bundle** ("ReferenceError: require is not
> defined", every `[slug]` page 500s; `tsc`/`next build` are clean — dev-only). Fix: dot-free segment
> names. The artifact is served at `/career-paths/roles-map/` (JSON) + `/career-paths/roles-map/md/`
> (Markdown), not `map.json`.

#### T1 — Per-module weight tag  ·  ✅ shipped  ·  effort: low
- **Schema** (`sanity/schemas/career-path.ts`, `skillModule` object): add
  `weight` — `string`, options `['core','alternative','flexible']`, `initialValue: 'core'`,
  description "core = required; alternative = swap-in for a core skill; flexible = learn anytime".
  (Optional `orderStrict: boolean` if we later want to mark strict sequences.)
- **Type** (`sanity/lib/career-paths.ts`, `SkillModule`): add `weight?: 'core' | 'alternative' | 'flexible'`.
- **Query** (`sanity/lib/queries.ts`): `modules` is projected whole today, so `weight` flows
  automatically — verify it arrives.
- **Render** (`components/sections/career-path-detail/PathModules.tsx`): a small mono text badge next
  to the skill number — reuse the existing `font-mono text-[10px] uppercase tracking-[0.18em]` tag
  style. Labels: `core` → no badge (default) or "Core"; `alternative` → "Alternative"; `flexible` →
  "Learn anytime". **No color dependency** (accessibility + restrained type system).
- **Acceptance:** a module set to `alternative`/`flexible` shows the badge; `core` reads clean;
  tsc + lint green; the prototype renders correctly.

#### T2 — `prerequisites` / `leadsTo` path relations  ·  ✅ shipped  ·  effort: medium
> Seeded DAG: seo → {technical-seo, geo}; technical-seo → geo; ai-visibility-analyst → {geo,
> ai-search}; geo → {aeo, citation-engineer, ai-search}; aeo → ai-search; citation-engineer & ai-search
> are terminal (fall back to the sibling rail). Renders via `PathPrereqs` (top) + `PathRelated`
> "Where this leads" rail (bottom).
- **Schema** (`careerPath` document): two self-referential arrays —
  `prerequisites: array of reference -> careerPath`, `leadsTo: array of reference -> careerPath`.
- **Type** (`sanity/lib/career-paths.ts`): add `prerequisites?: CareerPathCard[]` and
  `leadsTo?: CareerPathCard[]` to `CareerPath`.
- **Query** (`careerPathBySlugQuery` → `CAREER_PATH_FIELDS`): dereference both, mirroring the existing
  `relatedTerms[]->` block — project `{_id, title, "slug": slug.current, kind, description}`.
- **Render:** a "Before this path" line atop `PathModules` (from `prerequisites`); a curated
  "Where this leads" rail (from `leadsTo`) that **replaces/augments** the newest-first
  `PathRelated.tsx` when set, falling back to siblings when empty.
- **Data:** seed the real edges — at minimum SEO Specialist → GEO Specialist / AEO Specialist
  (per [03-roles.md §2](03-roles.md)); link specializations to the role they support.
- **Acceptance:** a path with prereqs shows the on-ramp; `leadsTo` drives the bottom rail; no
  reference-integrity errors (targets are published, strong refs fine).

#### T3 — Per-path JSON-LD (`ItemList` + `Occupation`)  ·  ✅ shipped  ·  effort: low
- **Builder** (`lib/schema.ts`): add `careerPathSchema(path)`. Emit an `ItemList` whose
  `itemListElement` maps the ordered modules (`name: title`, `description: skill`, `position: n` via
  `orderModules()`). For `kind === 'role'`, also emit `Occupation` (`name`, `occupationalCategory`,
  `skills` = module titles, `experienceRequirements` from `prerequisites` when present).
- **Render** (`app/(site)/career-paths/[slug]/page.tsx`): add a `<JsonLd data={careerPathSchema(path)} />`
  alongside the existing `breadcrumbListSchema`.
- **Acceptance:** valid against schema.org (spot-check in Rich Results Test); additive only, no UI
  change.

#### T4 — Inline per-module glossary links  ·  ✅ shipped  ·  effort: medium
- **Decision:** do **not** convert module text fields to portable text yet (heavy, off the locked
  plain-text model). Instead add a per-module `relatedTerms: array of reference -> glossaryTerm`.
- **Schema/type/query:** add to `skillModule`; dereference in the modules projection
  (`{_id, term, "slug": slug.current}`).
- **Render** (`PathModules.tsx`): a small "See: <term>" inline link row under the skill, linking
  `/glossary/<slug>/`. This pushes equity into the glossary (the lead asset) without the portable-text
  migration.
- **Acceptance:** module-level term links render and resolve; path-level `relatedTerms` rail still
  works.

#### T5 — Open downloadable data artifact  ·  ✅ shipped  ·  effort: medium
- **What:** one combined "AI-search role map" file built at build time from Sanity module data:
  `/career-paths/ai-search-roles.json` (machine) + a human-readable Markdown mirror. Include per
  path: `slug, title, kind, level, modules[{n, title, skill, weight}], prerequisites[], leadsTo[]`,
  and (when present) salary data from T8.
- **How:** a route handler / build-time generator driven by the same fetchers; no runtime cost.
- **License:** attach an attribution license (recommend **CC BY 4.0**: free to reuse with a link
  back to the source URL) — matches the existing `llms.txt` "citations welcome" line.
- **Wire:** add the artifact URL(s) to [public/llms.txt](../../../public/llms.txt) under the learning
  hub; add to `app/sitemap.ts` if appropriate.
- **Acceptance:** the file builds, validates as JSON, carries the license note, and is linked from
  `llms.txt`.

### Phase 2 — The enrichment mechanism (the reusable engine)

#### T6 — `enrichments[]` schema + renderer (reusing the glossary tool registry)  ·  ✅ shipped (careerPath level)  ·  effort: high
The mechanism that lets any path/module/term carry an *optional* enrichment.

> **Reuse, don't duplicate.** The interactive-tool half of this already has a locked design — the
> glossary **M6 "Interactive-aids framework"** in
> [../glossary/tech-task.md](../glossary/tech-task.md) §M6: a `toolKey` field + an
> `interactiveAidStatus` editorial gate (`not-assessed | none-needed | planned | built`), tools as
> **real, unit-tested React components** in `components/tools/registry.ts` (follow
> [FunnelCalculator.tsx](../../../components/sections/revenue-engine/FunnelCalculator.tsx) /
> [HomeV2Calculator.tsx](../../../components/sections/v2-1/HomeV2Calculator.tsx)), an `interactiveTool`
> portable-text block, optional `/tools/<key>/` pages, and a `softwareToolSchema` helper. **Calculators
> /scorecards/lookups for career paths use that same `toolKey` registry** — there is ONE tool registry
> across the whole hub, no second one.

- **Editorial gate (mirror the glossary):** add `interactiveAidStatus` (`not-assessed | none-needed |
  planned | built`, default `not-assessed`) to `careerPath` (and optionally `skillModule`) so no path
  ships un-assessed — the §3 enrichment check made auditable in Studio, exactly as glossary M6 does it.
- **`enrichments: array` field** on `careerPath` / `skillModule` (and reusable on `glossaryTerm`),
  whose members are the **path-specific** enrichment types the glossary M6 tool framework doesn't
  cover. Each has common fields `{ title, intro (plain-English, citable), source, placement, _key }`:
  - **`interactiveTool`** — `{ toolKey (from `components/tools/registry.ts`), caption }`. Same block
    type as glossary M6; embeds a registered calculator/scorecard. **No CMS-supplied math is ever
    eval'd** — logic lives in the code component.
  - **`formula`** — `{ expression (KaTeX/MathML), plainExplanation, variables[]{symbol,meaning} }`.
    Rendered statically.
  - **`dataTable`** — `{ columns[], rows[][], downloadable (bool), source }`. Server-rendered; when
    `downloadable`, also emitted into the open artifact (T5).
  - **`diagram`** — either an uploaded `image` (asset + required `alt` + caption) for one-offs, OR a
    `toolKey`-style key into a small registry of code-defined, data-driven diagram components
    (flow / matrix / funnel / before-after). Prefer build-time/static SVG.
  - **`roleMap`** — generated, not authored (see T7); a marker telling the page to render the map.
  - **`checklist`** — `{ items[]{text, note} }`, static (no checkbox state).
- **Renderer:** an `EnrichmentRenderer` for the path side that maps `_type` → component and, for
  `interactiveTool`, looks up `components/tools/registry.ts` (the same lookup the glossary
  `PortableTextRenderer` `interactiveTool` case uses). **Static enrichments render server-side;
  interactive ones are `'use client'` islands that compute in the browser and persist nothing.**
- **Placement:** the `placement` hint (`top | after-modules | inline | buyer`) tells the page where to
  slot it. Keep slots explicit and few.
- **Guardrails (enforce in review):** every guardrail in [10 §4](10-enriched-paths-vision.md) — no
  state, static-first, on-discipline, self-contained/extractable, sourced+dated, no course framing,
  stable anchors. The glossary M6 SEO guardrails apply verbatim (definition/body stay server-rendered;
  tools never replace the prose).
- **Acceptance:** a path renders one static enrichment (e.g. a `dataTable`) and one tool
  (`interactiveTool` via the shared registry) with no hydration errors; `interactiveAidStatus` is set;
  tsc + lint + `next build` green; nothing persists to storage; static enrichments work with JS off.

### Phase 2 — First concrete enrichments (prove the mechanism)

#### T7 — Dependency / role-map diagram (static)  ·  effort: medium–high
- **What:** the "graph done right." A build-time **static SVG** map of how the roles and
  specializations connect, generated from the T2 `prerequisites`/`leadsTo` edges — *not* a client
  editor, *not* hand-positioned per node, *not* login-gated. roadmap.sh's structure without its
  renderer/maintenance burden.
- **Where:** a `roleMap` enrichment on a path (showing that path in context) and/or a hub landscape
  view on `/career-paths/`. **Open question O3** — decide placement.
- **How:** a small layout pass (e.g. layered DAG from the edge data) emitting SVG at build time; nodes
  link to each path. Must degrade to the existing prereq/leadsTo text rails if the map can't render.
- **Acceptance:** the map renders statically, reflects the real edges, links correctly, and is legible
  on mobile (or collapses to the text rails).

#### T8 — Salary-ladder dataset (the exemplar dataset enrichment)  ·  effort: medium
- **What:** a `dataTable` enrichment: GEO/AEO (and SEO/Technical-SEO) salary by role × seniority,
  from real sourced numbers ([03-roles.md §2/§4](03-roles.md)). The citable-dataset format the
  strategy wants.
- **Gate:** only ship numbers we can stand behind and maintain on the 6-month review cadence; carry
  the source; include in the open artifact (T5). If data would be guessed/stale → don't ship it.
- **Acceptance:** the table renders on the relevant role pages, every number has a source, and it's
  in the downloadable artifact.

### Ongoing — Process

#### P1 — Wire the enrichment-evaluation step into create/update  ·  effort: low
- Add the **enrichment check** ([10 §3](10-enriched-paths-vision.md)) to the content process:
  `prompts/_CONTEXT.md` (shared step), `prompts/glossary/author-term.TEMPLATE.md`,
  `prompts/career-paths/author-path.TEMPLATE.md`, and the research prompts.
- **Record the decision** per page ("enrichment: none needed" / "enrichment: salary table — see
  T8"), alongside the existing term-capture log, so it isn't re-litigated each review.
- **Acceptance:** every new/updated term/path's notes state an explicit enrichment decision.

---

## 2. Suggested order

1. **T1, T3** — cheapest, ship in the prototype today (weight tag + JSON-LD).
2. **T2** — the on-ramp relations (our biggest gap); seed the SEO→GEO edges.
3. **T4, T5** — inline glossary links + the open artifact.
4. **P1** — bake the enrichment check into the process so the cascade applies it.
5. **T6** — the enrichment mechanism.
6. **T7, T8** — the first real enrichments (role map + salary dataset) to prove T6.

T1–T5 fold into the existing cascade (converting the other 6 paths), so each converted path gets the
foundations for free. T6+ is net-new and can run in parallel with the cascade.

---

## 3. Definition of done

- tsc clean (ignore pre-existing `lib/lead-form/*`), lint clean on changed files, `npx next build`
  compiles.
- No new client state/storage; static enrichments work with JS disabled.
- JSON-LD validates; the data artifact builds and is linked from `llms.txt`.
- [09-career-path-build-standard.md](09-career-path-build-standard.md) updated with the new fields +
  the enrichment step; [00-overview.md](00-overview.md) index updated.
- Each touched path/term records an explicit enrichment decision.
- Verified live (200 + known phrase) and screenshot-reviewed per the visual-loop rule.

---

## 4. Open questions for the owner

- **O1 — Calculator math model.** *Resolved by reuse:* calculators are **code-registered tools** in
  `components/tools/registry.ts` via `toolKey` (the locked glossary M6 design). No CMS-supplied math
  is eval'd. No new decision needed.
- **O2 — Diagram authoring.** Recommend a **hybrid**: code-defined, data-driven components for
  repeatable diagram types; uploaded SVG (with alt) for one-offs. Confirm.
- **O3 — Role-map placement.** Per-path rail, a hub landscape view on `/career-paths/`, or both?
- **O4 — Data-artifact license.** Recommend **CC BY 4.0** (attribution + link back). Confirm.
- **O5 — Salary data sourcing.** Who owns keeping the salary ladder current on the 6-month cadence,
  and which sources are canonical (ZipRecruiter etc. per [03-roles.md](03-roles.md))?
