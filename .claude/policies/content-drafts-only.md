---
name: content-drafts-only
files: ["scripts/**", "sanity/**"]
enforcement: warn
triggers: ["plan", "implement", "ship", "batch"]
requires: []
---

# Policy: Sanity content is seeded as drafts — publishing is manual

## Why this policy exists
The AGENTS.md definition of done says content is "seeded as **drafts** unless told to publish", and publishing is a founder review step in `/studio`. A script that publishes directly skips the human quality gate — wrong facts, un-humanized copy, or the Northern Hydraulics naming hazard could go live unreviewed.

## What it requires
Any script or code path that writes documents to Sanity must create them as drafts (`drafts.`-prefixed document IDs, or the client's draft-creation path). Nothing in an automated flow may publish, and nothing may `createOrReplace` a published (non-draft) document ID with new content, unless the user explicitly said "publish".

## How to satisfy it
- Seeding scripts create `_id: "drafts.<id>"` documents
- Edits to existing published docs go through a draft copy for Studio review
- If the task explicitly says to publish, note that instruction in the decision log and proceed

## How commands verify it
Inspect the diff for Sanity write calls:
```
grep -nE "\.(publish|createOrReplace|createIfNotExists)\(" <changed scripts/lib files>
```
- `.publish(` in an automated path → warn (this is the violation)
- `createOrReplace`/`createIfNotExists` with an `_id` that is NOT `drafts.`-prefixed → warn
- Draft-prefixed writes → pass

## Override
The user, by explicitly saying "publish" for the specific content, or `override policy content-drafts-only`. Log the override with which documents were published and on whose instruction.
