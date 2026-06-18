# Glossary capture — how it works

When we write **any** content for this project (article, page copy, career path, glossary term,
guide, service page), we use the real terms, explain each in plain words right after it, and
**capture the terms** so the glossary can define and cross-link them later.

This is now automated. Do not maintain a list by hand.

## The mechanism
- **Canonical queue:** `docs/strategy/glossary-queue.json` (machine-managed — don't hand-edit).
- **Tool:** `scripts/glossary-queue.mjs`. It checks each term against the published glossary in
  Sanity (terms + aliases + slugs), existing Sanity drafts, and the queue, then enqueues only the
  genuinely new ones.

```
# after writing content, list the terms you used and:
node scripts/glossary-queue.mjs add "faceted navigation" "crawl budget" --source career-path:technical-seo-specialist
node scripts/glossary-queue.mjs check "PIM" "schema"   # dry-run, no writes
node scripts/glossary-queue.mjs list                   # print the queue
```

It reports each term as one of:
- **published** → cross-link to `/glossary/<slug>/` in your content now.
- **draft** → already being authored in Sanity; nothing to do.
- **queued** → already captured; nothing to do.
- **added** → new; written to the queue for a future glossary pass.

## Where it plugs in
- Required step in every content prompt — see `prompts/_CONTEXT.md` ("Term capture").
- `prompts/glossary/research-next-terms.md` folds the queue into its candidate pool, so queued
  terms get authored and then cross-linked.

(Seeded 2026-06-16 from `/career-paths/technical-seo-specialist/`: 19 new terms queued; PIM, GEO,
and AI crawler were already published; normalized attributes, category page architecture, and
spec-sheet content were already in drafts.)
