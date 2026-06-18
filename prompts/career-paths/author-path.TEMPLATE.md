# Prompt TEMPLATE: Author ONE career path (draft)

> Fill every `{{PLACEHOLDER}}` then run. `prompts/career-paths/research-next-path.md` can fill this
> for you. **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's substance:
> `docs/strategy/career-path/03-roles.md`.

## Role to author
- **Title:** {{TITLE}}  (e.g. "SEO Specialist")
- **Slug:** {{SLUG}}  (kebab-case, e.g. `seo-specialist` — note glossary may have a same-named term;
  routes differ (`/career-paths/<slug>` vs `/glossary/<slug>`), so that's fine)
- **Kind:** {{KIND}}  (`role` = a hireable profession with a career ladder, e.g. SEO/GEO Specialist;
  `specialization` = a skill usually bought as a project or held inside a role, e.g. Technical SEO,
  Citation Engineering, AI Visibility. Drives the hero eyebrow, the metadata label
  (Level vs Proficiency), the buyer-section framing, and hub grouping. See doc 09 §6a.)
- **Role line ("For"):** {{ROLE_FOR}}  (who it's for, e.g. "SEOs at industrial distributors")
- **Level:** {{LEVEL}}  (Entry | Mid | Senior — or "Entry → Senior" for a full-arc path. Drives the
  "Start here" marker on Entry)
- **Aliases (real job titles):** {{ALIASES}}
- **Cross-vertical flavor (how the role differs by business):** {{VERTICAL_FLAVOR}} — cover industrial
  e-commerce, home services, and dental; note where a skill genuinely changes by vertical
- **Related glossary terms to link:** {{RELATED_TERM_SLUGS}}

## Task
Create ONE `careerPath` **draft** (`drafts.career-{{SLUG}}`) following the established schema
(`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs`. Build portable-text with unique `_key`s. Pull the role's real
substance (responsibilities by seniority, skills/tools, buyer framing, salary evidence) from
`docs/strategy/career-path/03-roles.md` — don't invent it.

### Fields to set
- `title`, `slug`, `kind` (`{{KIND}}`), `role` (`{{ROLE_FOR}}`), `level` (`{{LEVEL}}`),
  `duration` ("Self-paced"), `aliases`, `status:'drafting'`, `lastReviewed` (today),
  `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial.
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, label, focus}`. **`label`** = a short, descriptive stage name so the heading reads
  "Entry — run the checks", never bare "Entry" (be descriptive; it helps SEO/AI, doesn't hurt).
  **`focus`** = the concrete "By the end you can…" outcome for that stage. (`mustLearn` is legacy;
  module paths don't use it.) This drives the stage dividers + the grouped TOC.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC).
  Open with a 1-paragraph intro. Then ~4–6 chapters covering the real work of the role in
  industrial e-commerce. **Each chapter ends with a `callout` (tone `tip`) "test it on your own
  site" prompt** — the format signature.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. The only revenue-touching surface. **Framing depends on `kind`:**
  - **role** → "Hiring this role?" (MarketerHire pattern): speak to the buyer deciding **hire vs
    agency vs fractional**, with honest cost reality from `03-roles.md` salary evidence. Keep the
    "we don't hire from these paths" stance — buyer guidance, NOT recruiting.
  - **specialization** → "Need this done?": since you rarely hire it full-time, lean toward **buying
    it as a fixed-scope project or a light retainer**, and add a closing portable-text sentence that
    points at Sale Solution's offer with a `link` markDef to `/services/ai-seo/`. (The component sets
    the heading/labels from `kind`; you write the copy with the lean.)
- **`relatedTerms`** — references to `{{RELATED_TERM_SLUGS}}` (`{_type:'reference',
  _ref:'glossary-<slug>'}`; targets are published so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt.
Examples must **span the three verticals** (industrial e-commerce, home services, dental), not just
industrial — rotate them across modules and show the vertical-specific flavor where a skill differs.
Industrial reference: `04-niches.md`; home-services/dental: memory `multi-vertical-pivot`. Verify any
factual claim (salary bands, named postings, stats).

## Definition of done
- Draft `drafts.career-{{SLUG}}` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- **Use jargon + explain it in plain words right after** (it cross-links to the glossary). Keep
  the humanizer for sentence-level readability; don't strip the terms.
- **Term capture:** list every domain term used and run
  `node scripts/glossary-queue.mjs add "…" --source career-path:{{SLUG}}` (see `_CONTEXT.md`).
  Cross-link any it reports as already published.
- **Enrichment check (optional):** run the enrichment check (`_CONTEXT.md` → "Enrichment check";
  full rule + the foundational steals in `docs/strategy/career-path/10-enriched-paths-vision.md` and
  the build spec in `11-enriched-paths-tech-task.md`). For a path, also set `weight` per module and
  any `prerequisites`/`leadsTo` edges. Consider whether the role warrants a salary table, a
  calculator, or a role-map diagram — build it if it helps + is citable + architecture-safe (cost is
  not a reason to skip), else state "enrichment: none needed."
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.
