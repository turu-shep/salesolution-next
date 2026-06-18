# Prompt: Embed an EXISTING tool in glossary terms / career paths

**Read `prompts/_CONTEXT.md` and `prompts/tools/README.md` first.** This places an already-built
tool (one already in `components/tools/registry.ts`) onto the content that warrants it, via the
shared `enrichments[]` framework. To build a new tool first, use `add-interactive-tool.md`.

## Goal
Attach a tool to the right `glossaryTerm` and/or `careerPath` documents as an `enrichmentTool`, and
record the assessment on each.

## Decide first
- **Which `toolKey`** you're placing (must already be registered + in the enrichments
  `TOOL_KEY_OPTIONS`).
- **Which terms/paths warrant it** — the interactive-aid check, not "everywhere." A measurement
  tool belongs on the measurement terms; a catalog tool on the catalog/crawlability terms. Be
  specific and few.

## Do this

1. For each target doc, add an item to `enrichments[]`:
   ```
   {
     _type: 'enrichmentTool',
     _key: '<unique>',
     toolKey: '<the tool key>',
     title: '<short action title, e.g. "Calculate your AI share of voice">',
     intro: '<plain-English framing that explains the calc IN WORDS, so the concept is citable
              even without the widget>',
     placement: 'after-modules',   // the glossary term page + career path render this slot
   }
   ```
   Also set `interactiveAidStatus: 'built'` on the doc. (For terms you assess and decide need no
   tool, set `'none-needed'` so the gate is fully audited — `'not-assessed'` is the default.)
2. **Use a patch script**, not a full re-seed. Copy the pattern from
   `scripts/glossary-enrichments.mjs`: a `next-sanity` `createClient` (write token from
   `.env.local`), `perspective: 'published'`, patch each `glossary-<slug>` (or `careerPath` id),
   **idempotent and non-clobbering** — skip any doc that already has `enrichments` so operator edits
   in Studio survive. Dry-run by default; `--write` to commit.
3. Rendering is already wired — no component work needed:
   - Glossary term page renders `<PathEnrichments enrichments={doc.enrichments} placement="after-modules" />`
     after the body (`app/(site)/glossary/[term]/page.tsx`).
   - Career path pages render enrichments by placement (`top` / `after-modules` / `buyer`).
   The GROQ projections already resolve `enrichments[]` for both types.

## Verify (definition of done)
- `node scripts/<your-script>.mjs` dry-run shows the intended docs; `--write` commits.
- Each target page renders the tool after its body (curl for a tool marker, or screenshot).
- `interactiveAidStatus` is set on every touched doc.
- Non-clobbering confirmed (a doc with existing enrichments was skipped).
- Nothing fabricated; the `intro` explains the concept in words (so it's citable without JS).
