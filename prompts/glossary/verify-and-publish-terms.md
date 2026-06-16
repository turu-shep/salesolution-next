# Prompt: Verify + publish glossary term drafts

**Read `prompts/_CONTEXT.md` first.**

## Goal
Adversarially fact-check the glossary term **drafts**, fix what's wrong, ensure each has a real
(or honestly-illustrative) usage example, then **publish** them.

## Do this
1. **List the drafts.** Node script with `next-sanity` `createClient` (`perspective:'raw'`):
   `*[_type=="glossaryTerm" && _id in path("drafts.**")]{ _id, term, "slug": slug.current,
   shortDefinition, body }`. These are the candidates.
2. **Verify each, adversarially.** For every draft, check the definition and any embedded stat
   against current sources (WebSearch). Watch specifically for: contested/overlapping terms
   (GEO/AEO/LLM SEO/AI search optimization — make ours accurate, not "the" canonical), coined or
   collision-prone terms (disambiguate, e.g. citation engineering ≠ local citation building),
   and time-sensitive claims (llms.txt status, AI-Overview behavior, any "% of citations" stat).
   Confirm every "real" usage example actually exists with a working source; if it doesn't,
   rewrite it as a clearly-illustrative scenario. **Never publish a fabricated real example.**
   For scale, you may fan out one verifier per term in parallel (read-only); keep edits serial.
3. **Apply fixes** to the drafts (corrected `shortDefinition` / body / example).
4. **Publish.** For each draft, write the published doc (`_id` without the `drafts.` prefix,
   `status:'published'`, set `publishedAt`), then delete the draft — one atomic transaction.
   Pattern: `scripts/publish-glossary.mjs`. Keep `relatedTerms`; strong refs are fine now.
5. **Verify live.** Confirm `0` drafts / expected published count via a `perspective:'raw'` query;
   `curl` a couple of `/glossary/<slug>/` pages for HTTP 200 + a known phrase + `DefinedTerm` in
   the HTML.
6. **Sitemap + hub index:** the hub (`/glossary/`) auto-indexes once ≥15 terms are published and is
   already in `app/sitemap.ts`. No action unless the count is still under 15 (then it stays noindex
   by design — fine).
7. **Update docs:** bump the counts/status in `docs/strategy/career-path/00-overview.md` and
   `07-research-backlog.md`.

## Rules
- Operator voice preserved; definitions stay neutral and ≤60 words.
- Don't re-run any seed script (it would clobber edits).
- Report a short per-term table: term · verdict (sound/fixed) · example type (real+source / illustrative) · published?
