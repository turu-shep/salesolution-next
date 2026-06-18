# Prompt: Add a NEW interactive tool (end to end)

**Read `prompts/_CONTEXT.md` and `prompts/tools/README.md` first.** Then skim
`docs/strategy/glossary/glossary.md` §6 (the interactive-aid gate) and look at the two existing
tools as the pattern: `components/tools/AiVisibilityCalculator.tsx` +
`lib/tools/ai-visibility.ts`, and `components/tools/CatalogReadinessScorecard.tsx` +
`lib/tools/catalog-readiness.mjs`.

## Goal
Build one new code-defined tool — a calculator, scorecard, converter, or interactive lookup —
wire it into the shared registry, and (recommended) give it a standalone `/tools/<slug>/` page.

## Decide first
- **What it does, in one line**, and whether it earns its place (the interactive-aid check): does a
  reader otherwise reach for a calculator / chart / lookup / checklist to act on this concept?
- **`toolKey`** (kebab, e.g. `thread-size-converter`), **page slug**, display **name**.
- **Inputs → outputs** (calculators/scorecards) OR the **dataset** (converters/lookups).
  **If it needs a dataset, the data must be real and sourced — never fabricate classes, specs, or
  interchange. If you can't source it, stop and report; don't ship a fake lookup.**

## Do this

1. **Pure logic** → `lib/tools/<name>.mjs` (JSDoc-typed; no React/DOM). Put the calc/scoring +
   item data here, with edge-case guards (divide-by-zero, clamping, garbage input → safe defaults).
   Mirror `lib/tools/catalog-readiness.mjs`. (A `.ts` file is fine too — but `.mjs` is unit-testable
   with `node --test`, which `.ts` isn't here.)
2. **Unit tests** → `lib/tools/<name>.test.mjs` (`node:test` + `node:assert/strict`). Cover the
   edges (empty, max, out-of-range, the band/threshold boundaries). Run `npm test` — it must pass.
3. **Component** → `components/tools/<Name>.tsx` (`'use client'`), importing the logic. **If the
   logic is `.mjs`, import it with the explicit extension** (`@/lib/tools/<name>.mjs`) or TS won't
   resolve it. Match the existing tools' idiom: a self-contained card, mono uppercase micro-labels,
   `tabular-nums`, brand-600 accents, `not-prose` wrapper, and a closing **"illustrative — from your
   inputs"** disclaimer. Every output derives from user input; nothing is saved.
4. **Register** → add the `toolKey → component` entry to `toolRegistry` in
   `components/tools/registry.ts`, AND the matching `{ title, value }` to `TOOL_KEY_OPTIONS` in
   `sanity/schemas/objects/enrichments.ts` (keep the "in sync" comment honest).
5. **Standalone page (recommended — link magnet)** → add an entry to `TOOL_PAGES` in
   `lib/tools/pages.ts` (`slug, toolKey, name, intro, metaTitle ≤60, metaDescription 140–160,
   related[]` → glossary slugs). The `/tools/` index, the `/tools/[tool]/` route (with
   `softwareToolSchema` `WebApplication` JSON-LD + breadcrumbs), the sitemap, and the nav entry all
   pick it up automatically. Keep `lib/tools/pages.ts` dependency-free (the sitemap imports it).

## Verify (definition of done)
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- `npm test` passes (your new logic tests included).
- `/tools/<slug>/` returns 200, the tool renders, and `WebApplication` JSON-LD is in the page source.
- **Visual loop** (if it has UI): one dev server + one browser, screenshot the tool, critique, fix,
  re-screenshot — see the visual-loop protocol in `prompts/_CONTEXT.md` / prior runs.
- No fabricated data anywhere. Disclaimer present.
- **Do NOT run `npx next build` while `next dev` is running** — it clobbers `.next`.

## Then
Place it on the terms/paths that warrant it with **`embed-tool-in-content.md`**, and set their
`interactiveAidStatus`.
