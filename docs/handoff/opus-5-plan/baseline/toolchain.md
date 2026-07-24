# Baseline — toolchain state

**Measured:** 2026-07-24 · **Commit:** `dd66f3cddff01190364b09940ffde6485d31f999` (local `main`, 8 commits ahead of `origin/main` — the probe v2 + homepage work is committed locally but **not deployed**) · **Measured by:** fable-5 (phase 0)

| Tool | Version |
|---|---|
| node | v20.16.0 (**past EOL** — Node 20 maintenance ended 2026-04-30; npm 11.5.2 warns it doesn't support this Node) |
| pnpm | 9.15.9 |
| macOS | 26.6 (darwin) |

## Commands

| Command | Exit | Wall clock | Result |
|---|---|---|---|
| `npx tsc --noEmit` | 0 | 2.6s | **Clean.** Zero errors. The `AGENTS.md` line about pre-existing `lib/lead-form/*` Zod errors is stale — nothing to ignore anymore. |
| `pnpm lint` (= bare `eslint`, no path args) | — (killed) | **>300s, no output** | **Never completed.** `eslint.config.mjs` only ignores `.next/`, `out/`, `build/`, `next-env.d.ts`, so bare `eslint` lints the entire repo: `.engine/` submodule, `seo-project/` legacy tree, `docs/`, `analysis/`. Effectively unusable as a check. Ledger F-007. |
| `npx eslint app components lib sanity scripts` (scoped) | 1 | 10.7s | **53 problems: 44 errors, 9 warnings.** Breakdown: 25× `@next/next/no-html-link-for-pages` (mostly legal pages: privacy, terms, disclaimer, opt-out, communication-preferences), 6× `react-hooks/set-state-in-effect`, 5× `no-unused-vars`, 4× `react-hooks/purity`, 4× `react-hooks/immutability`, 2× `react/use`, 2× `react/no-unescaped-entities`, 2× `react-hooks/refs`, 1× `react-hooks/static-components`. Error files include `components/forms/LeadForm.tsx`, `components/forms/FullGrowthQuoteForm.tsx`, `app/(site)/tools/[tool]/page.tsx`, `app/(site)/guides/[slug]/page.tsx`. Ledger F-008. |
| `pnpm test` (= `node --test lib/`) | 0 | 0.36s (112ms test time) | **34/34 pass**, 0 fail. But only 4 of 72 `lib/` source files are exercised — see `tests.md`. |
| `pnpm build` (= `next build`, webpack) | 0 | **25.2s** | Compiles clean. 202 static pages generated (11 workers, 2.2s generation). |

## Notes

- Build output format: Next 16.2.6 prints route type + Revalidate/Expire columns but **no per-route size / first-load JS table**. Bundle weight measured independently in `bundle.md`.
- Nothing was fixed during measurement, per phase 0 rules.
