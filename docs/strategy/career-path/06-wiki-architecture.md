# Wiki Architecture — Content Model, URLs, Schema, Interlinking

**Status:** Proposed 2026-06-12 — review before implementing schema changes

The "wiki-like system" = three interlinked document types (career paths, glossary terms,
existing guides) with dense, typed cross-references, one-concept-per-URL, and
definition-first formatting. Built on the existing Sanity + Next.js stack; no new
infrastructure.

---

## 1. URL structure

| Route | Content | Status |
|-------|---------|--------|
| `/career-paths/` | Hub: intent section + paths grid | Built |
| `/career-paths/[slug]/` | One path (e.g. `/career-paths/geo-specialist/`) | Built |
| `/glossary/` | Glossary hub: grouped by cluster, A–Z index | **New** |
| `/glossary/[term]/` | One term per URL (e.g. `/glossary/citation-engineering/`) | **New** |

Decisions baked in:

- **One term per URL**, not a single long glossary page. Each definition needs its own
  citable URL, its own `<title>`/meta, its own JSON-LD. (Single-page glossaries get one
  shot at citation; per-term pages get one per term.)
- Glossary lives at top-level `/glossary/`, not under `/career-paths/` — terms serve the
  whole site (guides and service pages link into them), not just careers.
- Legacy redirects: when the two original paths are republished, point
  `/career-paths/seo-specialist-qualification/` → `/career-paths/seo-specialist/`
  (slug-level), not to the hub — preserves page-level equity if any exists.

## 2. Sanity schema deltas

### 2.1 New document type: `glossaryTerm`

```
term            string   (required) — canonical form, e.g. "Citation engineering"
slug            slug     (required)
shortDefinition text     (required, ≤ 60 words) — THE quotable definition; rendered first
                          on page, used in hub cards, link previews, and JSON-LD
cluster         string   (list: ai-search-core | measurement | technical |
                          industrial-ecommerce | roles)
body            portableText — extended explanation, industrial example, "in practice"
aliases         array<string> — synonyms/abbreviations ("GEO", "generative engine
                          optimization") for search and alias-matching
relatedTerms    array<reference<glossaryTerm>>
relatedPaths    array<reference<careerPath>>
opportunity     string   (list: own | contest | reference-only) — editorial metadata from
                          05-glossary.md, drives prioritization, not rendered
lastReviewed    date     (required) — surfaced on page
publishedAt     datetime
seo             seo      (existing object)
```

### 2.2 Extend `careerPath`

Current schema supports a flat reading-list body only. Add:

```
aliases         array<string>  — real job titles this path maps to (from postings)
status          string         (list: drafting | published | archived)
seniorityMatrix array<object>  — { level: Entry|Mid|Senior, focus: text,
                                   mustLearn: array<string>, canSkip: array<string> }
                                 — the "what to learn at each level" the concept needs
chapters        array<object>  — { title, body: portableText, testPrompt: text }
                                 — replaces single body for structured paths;
                                 keep `body` for backward compat / simple paths
buyerSection    object         — { whatTheyDo: text, signsYouNeedOne: array<string>,
                                   inHouseVsAgency: portableText, costReality: text }
                                 — renders as its own TOC-visible section
relatedTerms    array<reference<glossaryTerm>>
lastReviewed    date
```

### 2.3 Interlinking inside portable text

Add an annotation type `termLink` (reference to `glossaryTerm`) to the shared portable-text
config. Renders as a subtle underlined link with the `shortDefinition` as a hover/tap
tooltip — the wiki feel — and a normal `<a href>` for crawlers. First mention of a term in
any body gets linked; subsequent mentions don't (editorial rule, not enforced).

## 3. Page anatomy

### Glossary term page (`/glossary/[term]/`)

1. Breadcrumb (Home › Glossary › Term)
2. `<h1>` = term (+ aliases inline: "Citation engineering — also: AI citation optimization")
3. **First block = shortDefinition verbatim.** No intro prose above it. This is the
   liftable answer.
4. Extended body with one concrete industrial e-commerce example
5. "Related terms" rail (typed references)
6. "Where this shows up" — auto-list of paths/guides referencing this term (reverse refs)
7. Reviewed date

### Career path page — additions to existing template

- Seniority matrix rendered as a table (Entry / Mid / Senior × focus / must-learn)
- Chapters with per-chapter "test it on your own site" prompt block (already the stated
  format — now modeled, not hand-formatted)
- **Buyer section** ("Hiring this role?") as a TOC-anchored section near the end
- Related glossary terms rail

## 4. JSON-LD

- Glossary term: `DefinedTerm` + `inDefinedTermSet` → a `DefinedTermSet` node for the
  glossary (stable `@id` at `/glossary/#termset`). Keep existing `BreadcrumbList`.
- Career path: keep `BreadcrumbList`; add `FAQPage` ONLY if a path genuinely renders
  Q&A blocks. Do not force `Course` schema — these are explicitly not courses and the
  mismatch invites rich-result penalties.
- Org `@graph`: add `knowsAbout` entries for the P0 terms on the Organization node —
  cheap entity-association signal.

## 5. Technical conventions

- SSG with `generateStaticParams` for both `[slug]` routes (matches existing pattern),
  1 h revalidate.
- Sitemap: glossary terms priority 0.5, hub 0.6 (matches existing scale).
- Hub pages render grouped-by-cluster with an A–Z strip; no pagination until 100+ terms.
- `llms.txt`: add one, listing the glossary index and P0 term URLs — cheap, on-trend for
  the audience that would check, and we sell exactly this advice.
- AI crawler access: verify robots.ts does not block GPTBot / ClaudeBot / PerplexityBot /
  Google-Extended (the entire point is being crawled and cited).
- Empty-state rule: `/glossary/` does NOT go live (stays out of sitemap + noindexed) until
  ≥ 15 terms are published. We are not repeating the empty-hub mistake.

## 6. Internal linking map

```
Service pages ──(termLink on jargon)──→ Glossary terms
Guides        ──(termLink)───────────→ Glossary terms
Career paths  ←─(relatedPaths)──────── Glossary terms
Career paths  ──(relatedTerms)───────→ Glossary terms
Glossary term ──("where this shows up" reverse refs)──→ paths + guides
Buyer section ──(single CTA)─────────→ /book-growth-call/ (the ONLY funnel link in the hub)
```

The net effect: glossary terms become the connective tissue between buyer-facing pages and
the learning hub, so link equity and topical signals flow both ways without career content
ever interrupting a buyer journey.

## 7. Build order

1. ✅ **Done (2026-06-14)** — `glossaryTerm` schema + term page template + hub
   (noindex until 15 published terms). Files: `sanity/schemas/glossary-term.ts`,
   `sanity/lib/glossary.ts`, `sanity/lib/queries.ts`, `app/(site)/glossary/page.tsx` +
   `[term]/page.tsx`, `components/sections/glossary/*`, `DefinedTerm`/`DefinedTermSet`
   in `lib/schema.ts`, sitemap wired. tsc + lint + `next build` green.
2. ✅ **Done (2026-06-14)** — `termLink` in-body annotation shipped as **`glossaryRef`**: a
   reference annotation on the shared portable-text type (`sanity/schemas/objects/portable-text.ts`),
   resolved in all four body GROQ projections via the `BODY_WITH_LINKS` snippet
   (`sanity/lib/queries.ts`), rendered as an inline `<Link>` to `/glossary/<slug>/` in
   `components/portable-text/PortableTextRenderer.tsx`. Editors can now link terms inline in
   Studio. (`relatedTerms` rails remain for explicit related-reading.) **Follow-up:** retro-link
   the 28 existing posts/guides — editorial pass, not yet done.
3. ✅ **Done (2026-06-14)** — `careerPath` schema extensions (additive): `aliases`, `status`,
   `seniorityMatrix`, `buyerSection`, `relatedTerms` (→ glossaryTerm), `lastReviewed`. Render
   components: `PathSeniority`, `PathBuyer`, `PathTerms`; `PathTOC` extended for the matrix +
   buyer anchors. tsc/lint/`next build` green; rendering verified via temp-publish.
4. 🟡 **In progress** — **GEO Specialist + Citation Engineer drafted** as Sanity drafts
   (`scripts/seed-career-paths.mjs`), grounded in [03-roles.md](03-roles.md) + the 2026-06-14
   verification. Talent stance "we don't hire" honored (no recruiting framing). Still to draft:
   the two originally-promised SEO Specialist + Content Strategy paths.

   **Content-model upgrade (2026-06-16):** the essay-chapter model was rejected — it didn't show
   progression and wasn't real proficiency material. New model: **skill modules** (`modules`
   field on `careerPath`: level, title, skill, why, scenario, edgeCases[], proficientWhen),
   rendered grouped + numbered by seniority (`PathModules`), with the TOC listing the numbered
   skills. **Prototyped on `technical-seo-specialist`** (schema + render + content, verified).
   Old layout (matrix + body chapters) kept as fallback for the other 6 paths. PENDING owner
   approval: roll the model to the other 6 paths + update `prompts/career-paths/author-path.TEMPLATE.md`
   + research/voice prompts to generate modules. See [[career-path-content-model]] (memory).

   **Visual-review pass (2026-06-14):** ran a screenshot + 5-dimension critique loop on the
   path + glossary pages. Fixes applied: path h1 → flagship scale; seniority matrix de-tabled
   (hairline columns, not a boxed table); buyer panel restyled to the glossary-definition idiom
   (brand-blue `border-l-2` + tint, constrained to reading measure) — both "emphasis panels" now
   share one language; glossary definition type bumped (`text-xl`, `border-l-2`); **added a
   collapsible mobile TOC** (`PathTOC mobile`) since the desktop rail is `hidden md:block`;
   fixed phantom `text-ink-600`→`ink-500`. All verified via re-screenshot.
5. 🟡 **In progress** — Glossary batch 1 seeded as **10 Sanity drafts** via
   `scripts/seed-glossary.mjs` (review + voice + publish in Studio). 5 more terms clear the
   15-term hub-index threshold; individual term pages are indexable as soon as published.
6. `llms.txt` + `knowsAbout` + robots verification
