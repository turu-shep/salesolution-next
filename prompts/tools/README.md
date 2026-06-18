# /prompts/tools — operator playbooks for interactive tools (enrichments)

Reusable, self-contained task prompts for building and placing the learning hub's **interactive
tools** — calculators, scorecards, converters, lookups. Each file is a brief you hand to an AI
coding agent running **inside this repo**.

**Read `prompts/_CONTEXT.md` first, every run.** The tools are part of the glossary + career-path
hubs; strategy context is in [`docs/strategy/glossary/`](../../docs/strategy/glossary/)
(`glossary.md` §6 is the interactive-aid gate; `tech-task.md` M6 is the build record).

## Local-only — never web-served
Like the rest of `/prompts`, this folder lives at the repo root and is in `.vercelignore`. It IS
committed to git. Use it locally.

---

## What the tools system is here (the framework these prompts drive)

Interactive tools are **optional enrichments — built only when a term or path needs one** (the
interactive-aid check). One shared framework serves the whole hub:

- **A tool = a stable `toolKey` → a real, code-defined React component** in
  `components/tools/registry.ts` (`toolRegistry`, `getTool`). No CMS-authored math, nothing
  `eval`'d. The pure logic is split out of the component into `lib/tools/<name>.mjs` (JSDoc-typed,
  unit-tested with `node --test`) so it's reusable and testable.
- **Two surfaces for one component:**
  1. **Embedded** in a `glossaryTerm` or `careerPath` via the `enrichments[]` array
     (`enrichmentTool` with a `toolKey`), rendered by
     `components/sections/career-path-detail/PathEnrichments.tsx`. Other enrichment types
     (formula, table, checklist, diagram) share the array — see
     `sanity/schemas/objects/enrichments.ts`.
  2. **Standalone** at `/tools/<slug>/` — a free, shareable **link-magnet** page with
     `WebApplication` JSON-LD. The page catalog is `lib/tools/pages.ts`; routes are
     `app/(site)/tools/`.

**Guardrails (non-negotiable):** static-first / SSR (the tool's initial markup renders server-side
so crawlers see it); no login, no persistence, no accounts; every output derived from the user's
own inputs and **labelled illustrative — a tool, not a claim**; never ship fabricated data (a
lookup needs a real, sourced dataset or it doesn't ship). Tools render **outside** `.article-body`,
so they can use normal `<p>`/`<button>` without the article CSS restyling them.

Live tools today: `ai-visibility-calculator`, `catalog-readiness-scorecard`.

---

## The prompts

| Prompt | What it does |
|---|---|
| `add-interactive-tool.md` | Build a NEW tool end-to-end: pure tested logic → component → register → enrichment `toolKey` option → standalone `/tools/<slug>/` page → sitemap + nav. |
| `embed-tool-in-content.md` | Attach an EXISTING tool to glossary terms and/or career paths via the `enrichments[]` framework (the lighter task). |

### Suggested order
1. `add-interactive-tool.md` — build the tool once (code + standalone page).
2. `embed-tool-in-content.md` — place it on the terms/paths that warrant it, and set
   `interactiveAidStatus`.

---

## How to use a prompt
1. Work **inside this repo** (the agent needs filesystem + `.env.local`).
2. Open the prompt, copy its contents, hand it to the agent. Start with: **"Read
   `prompts/_CONTEXT.md` first."**

## Gotchas specific to tools (the rest are in `_CONTEXT.md`)
- **Logic lives in `lib/tools/`, not the component.** Import it into the `.tsx` AND unit-test it.
  `.mjs` + JSDoc works (tsconfig `allowJs` + `moduleResolution: bundler`) — but import it with the
  **explicit `.mjs` extension** (`@/lib/tools/foo.mjs`), or TS won't resolve it. Tests run via
  `node --test lib/` (`npm test`). (Vitest can't currently install — npm 11.5 / node 20.16 mismatch.)
- **Keep three lists in sync** when adding a tool: `toolRegistry` (`components/tools/registry.ts`),
  the `TOOL_KEY_OPTIONS` in `sanity/schemas/objects/enrichments.ts`, and — if it gets a standalone
  page — `TOOL_PAGES` in `lib/tools/pages.ts`.
- **`lib/tools/pages.ts` must stay dependency-free** (no React/Sanity imports) — `app/sitemap.ts`
  imports it, and the sitemap must fail soft.
- **Embeds are non-clobbering.** The populate scripts skip a doc that already has `enrichments`, so
  operator edits in Studio survive. Patch published docs; re-running is safe.
- **`next build` clobbers a running `next dev` `.next`** — don't build while the dev server is up.
