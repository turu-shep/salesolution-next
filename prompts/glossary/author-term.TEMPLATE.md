# Prompt TEMPLATE: Author ONE glossary term (draft)

> Fill every `{{PLACEHOLDER}}` then run. `prompts/glossary/research-next-terms.md` can fill this
> for you. **Read `prompts/_CONTEXT.md` first.**

## Term to author
- **Term:** {{TERM}}  (e.g. "Answer engine optimization (AEO)")
- **Slug:** {{SLUG}}  (kebab-case, e.g. `answer-engine-optimization`)
- **Cluster:** {{CLUSTER}}  (one of: ai-search-core | measurement | technical | industrial-ecommerce | roles)
- **Opportunity (editorial, not rendered):** {{OPPORTUNITY}}  (own | contest | reference-only)
- **Aliases:** {{ALIASES}}  (comma-separated; [] if none)
- **Angle (our take in one line):** {{ANGLE}}
- **Who owns the definition today:** {{WHO_OWNS_IT}}  (informs how hard we push / disambiguate)
- **Example to use:** {{EXAMPLE}}  (a concrete scenario from one of our verticals — industrial
  e-commerce, home services, or dental — or a real verifiable public example. Vary the vertical
  across terms; don't make every entry industrial. Industrial niches: `04-niches.md`;
  home-services/dental: memory `multi-vertical-pivot`)
- **Related terms to link:** {{RELATED_SLUGS}}  (slugs of existing/sibling glossary terms)

## Task
Create ONE `glossaryTerm` **draft** in Sanity (`drafts.glossary-{{SLUG}}`) following the established
structure and the operator voice. Mirror the field shapes in existing terms and the schema
`sanity/schemas/glossary-term.ts`. Use a Node script with `next-sanity` `createClient` + the write
token (pattern: `scripts/seed-glossary.mjs`). Build portable-text blocks with unique `_key`s.

**Before writing, verify the facts** for this term against current sources (WebSearch). Definitions
and any stat must be accurate and neutral. If you assert a real-world example, it must be real and
sourced; otherwise write a clearly-illustrative scenario.

### Fields to set
- `term`, `slug` (`{{SLUG}}`), `cluster` (`{{CLUSTER}}`), `opportunity` (`{{OPPORTUNITY}}`),
  `aliases`, `lastReviewed` (today, YYYY-MM-DD), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- **`shortDefinition`** — THE load-bearing field. One neutral, promo-free sentence answering
  "What is {{TERM}}?", ≤ 60 words, quotable verbatim into an AI answer. This renders first and
  feeds the DefinedTerm JSON-LD. If the term collides with another meaning, disambiguate in the
  first sentence (e.g. "…not local-SEO citation building").
- **`body`** (portable text), in this order:
  1. `h2` "Why it matters" + 1 short paragraph **leading with the industrial example**
     ({{INDUSTRIAL_EXAMPLE}}).
  2. Optional `h3` "X vs Y" or "How to measure it" sub-section if it's a fan-out magnet (these get
     cited more). Keep tight.
  3. An **"In practice"** `h3` + one concrete usage example. If real, end with a source line
     (a portable-text `link` mark to the URL). If not verifiable, frame it as an illustrative
     scenario — never fabricate a real claim.
- **`relatedTerms`** — references to `{{RELATED_SLUGS}}` (`{_type:'reference', _ref:'glossary-<slug>'}`;
  add `_weak:true` if a target isn't published yet).

### Voice
Operator register (see `_CONTEXT.md`): terse, declarative, "X not Y", anti-marketing, concrete.
No hype, no "in today's fast-paced world." Use examples from our verticals (industrial
e-commerce / home services / dental), not generic SaaS ones; vary which vertical across entries.

## Definition of done
- Draft `drafts.glossary-{{SLUG}}` exists in Sanity (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` errors); changed files lint clean.
- Report the shortDefinition and the example (with its source/illustrative tag) in your reply.
- **Term capture:** list any *other* domain terms used in the body and run
  `node scripts/glossary-queue.mjs add "…" --source glossary:{{SLUG}}` (see `_CONTEXT.md`).
- **Enrichment check (optional):** run the enrichment check (`_CONTEXT.md` → "Enrichment check";
  full rule in `docs/strategy/career-path/10-enriched-paths-vision.md` §3). Does this concept have a
  formula, a number worth computing, a dataset, or a relationship worth diagramming? If yes and it's
  citable + architecture-safe, propose the enrichment (don't skip on cost). State the decision in
  your reply — "enrichment: none needed" is a valid, common answer.
- Do NOT publish — leave it as a draft for operator review (publish via
  `prompts/glossary/verify-and-publish-terms.md`).
