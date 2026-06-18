# Prompt: Research the next glossary terms (and emit authoring prompts)

**Read `prompts/_CONTEXT.md` first.** Then `docs/strategy/career-path/05-glossary.md` (the full
65-term plan with clusters + ownership calls) and `04-niches.md` (industrial examples).

## Goal
Decide which glossary terms to add next, in priority order, then **generate a ready-to-run
authoring prompt for each chosen term** by filling the template at
`prompts/glossary/author-term.TEMPLATE.md`.

## Do this
1. **Inventory what's already published.** List current glossary terms:
   ```
   node -e "/* or write a tiny script */"
   ```
   Use a Node script with `next-sanity` `createClient` (`perspective:'raw'` to also see drafts),
   query `*[_type=="glossaryTerm"]{term, "slug": slug.current, cluster, opportunity}`. Do not
   re-add anything that already exists.
2. **Pull the candidate pool** from two places: `05-glossary.md` (the 65-term plan) AND the live
   **capture queue** — run `node scripts/glossary-queue.mjs list` (or read
   `docs/strategy/glossary-queue.json`). The queue holds terms that real published content already
   uses and needs defined, so prioritize those: defining them lets us cross-link existing pages.
3. **Re-check demand + difficulty** for the top candidates with Ahrefs MCP if available
   (`keywords-explorer-overview`, country `us`, select `keyword,volume,difficulty,global_volume`).
   Be sparing with Ahrefs units (a batched call of ~20 keywords is fine). If Ahrefs is
   unavailable, rank on the editorial opportunity from `05-glossary.md` + live SERP checks.
4. **Prioritize.** Favor, in order: (a) `own` terms with real/low-KD demand and the
   industrial-intersection terms (part-number SEO, cross-reference content, spec-sheet content,
   normalized attributes, distributor content parity, AI-ready catalog) — these are citation plays
   nobody else owns; (b) low-KD concept/measurement terms; (c) `reference-only` infrastructure
   terms only as far as they're needed as internal-link targets for the above. Skip vanity terms.
5. **Pick a batch** (default 8–12 unless told otherwise). Note which existing terms each new one
   should cross-link to (`relatedTerms`).
6. **Emit authoring prompts.** For EACH chosen term, output a complete, copy-pasteable prompt by
   filling every `{{PLACEHOLDER}}` in `prompts/glossary/author-term.TEMPLATE.md` with that term's
   specifics (term, slug, cluster, opportunity, aliases, the angle, who currently owns the
   definition, the industrial example to use, related terms). Write them to
   `prompts/glossary/_generated/author-<slug>.md` (create the folder) AND print them in your reply.

## Output
- A short ranked table: term · cluster · opportunity · US vol/KD (or "n/a") · why now.
- The generated per-term authoring prompts (files + inline).
- A one-line note on anything you intentionally skipped and why.

## Rules
- Don't fabricate Ahrefs numbers; mark unknowns "n/a".
- Respect the locked decisions in `_CONTEXT.md` (citation engineering framing, etc.).
- This prompt only researches + generates. It does NOT create Sanity content (the generated
  authoring prompts do that).
