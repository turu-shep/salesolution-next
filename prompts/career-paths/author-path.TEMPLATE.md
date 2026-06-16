# Prompt TEMPLATE: Author ONE career path (draft)

> Fill every `{{PLACEHOLDER}}` then run. `prompts/career-paths/research-next-path.md` can fill this
> for you. **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's substance:
> `docs/strategy/career-path/03-roles.md`.

## Role to author
- **Title:** {{TITLE}}  (e.g. "SEO Specialist")
- **Slug:** {{SLUG}}  (kebab-case, e.g. `seo-specialist` — note glossary may have a same-named term;
  routes differ (`/career-paths/<slug>` vs `/glossary/<slug>`), so that's fine)
- **Role line ("For"):** {{ROLE_FOR}}  (who it's for, e.g. "SEOs at industrial distributors")
- **Level:** {{LEVEL}}  (Entry | Mid | Senior — drives the "Start here" marker on Entry)
- **Aliases (real job titles):** {{ALIASES}}
- **Industrial flavor (what changes inside a distributor):** {{INDUSTRIAL_FLAVOR}}
- **Related glossary terms to link:** {{RELATED_TERM_SLUGS}}

## Task
Create ONE `careerPath` **draft** (`drafts.career-{{SLUG}}`) following the established schema
(`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs`. Build portable-text with unique `_key`s. Pull the role's real
substance (responsibilities by seniority, skills/tools, buyer framing, salary evidence) from
`docs/strategy/career-path/03-roles.md` — don't invent it.

### Fields to set
- `title`, `slug`, `role` (`{{ROLE_FOR}}`), `level` (`{{LEVEL}}`), `duration` ("Self-paced"),
  `aliases`, `status:'drafting'`, `lastReviewed` (today), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial.
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete
  things, drawn from `03-roles.md`. This is the "how the role improves by seniority" core.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC).
  Open with a 1-paragraph intro. Then ~4–6 chapters covering the real work of the role in
  industrial e-commerce. **Each chapter ends with a `callout` (tone `tip`) "test it on your own
  site" prompt** — the format signature.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. This is the only revenue-touching surface (MarketerHire pattern): speak to the
  distributor deciding **hire vs agency vs fractional**, with honest cost reality from
  `03-roles.md` salary evidence. Keep the "we don't hire from these paths" stance — this section
  is buyer guidance, NOT recruiting.
- **`relatedTerms`** — references to `{{RELATED_TERM_SLUGS}}` (`{_type:'reference',
  _ref:'glossary-<slug>'}`; targets are published so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt.
Industrial examples throughout (hydraulics cross-refs, MRO part numbers, PIM, distributor
catalogs — `04-niches.md`). Verify any factual claim (salary bands, named postings, stats).

## Definition of done
- Draft `drafts.career-{{SLUG}}` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.
