# Phase 0 — Baseline

**Run once, before any audit.** Everything later compares against these numbers. Skip this and the program has opinions instead of results.

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md` and `01-guardrails.md` first.
>
> You are establishing the measurement baseline for an audit-and-harden program. **Measure only — change nothing.** If you find a bug, write it to the ledger and keep measuring. The one exception is `docs/` output written by this phase.
>
> **Precondition.** `git status` must be clean. If it isn't, stop and tell me — the working tree has in-flight probe and homepage work that has to be committed or branched before a baseline means anything.
>
> Write everything to `docs/handoff/opus-5-plan/baseline/`.
>
> **1 — Toolchain state** → `baseline/toolchain.md`
> Record the exact command, exit code, and a summary of output for: `npx tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build`. Record wall-clock time for the build. Capture the current commit SHA and `node -v` / `pnpm -v`. Note anything that fails, and don't fix it.
>
> **2 — Bundle and route weight** → `baseline/bundle.md`
> From the `pnpm build` output, capture the route table: every route with its size and first-load JS. Call out the ten heaviest routes and any route over 200 kB first-load. Note which routes are static, ISR, or dynamic, since that shapes the performance findings later.
>
> **3 — Test coverage map** → `baseline/tests.md`
> List what `node --test lib/` actually covers today. Then list the business logic under `lib/` with no tests, ranked by risk — blast radius if it breaks, times how hard it is to notice.
>
> Then settle one thing, because the whole program trips over it otherwise: the runner is bare `node --test` with no TypeScript loader, so **only `.mjs` files are testable today** — while the highest-risk untested files are all `.ts` (`probe/fetch.ts`, `probe/token.ts`, `sales/auth.ts`, `rate-limit.ts`). Wave 3 cannot write the tests that matter until this is resolved. Lay out the options with their trade-offs — a `--import tsx` loader, Node's native type stripping on this Node version, extracting pure logic to `.mjs`, or a real test runner — and recommend one. Don't implement it. It's a decision for Artur, and it belongs in the ledger as a quality row that blocks wave 3.
>
> **4 — Live page vitals** → `baseline/vitals.md`
> Run Lighthouse against production `https://salesolution.net` for these pages: `/`, `/services/`, `/revenue-engine/`, `/case-studies/`, `/glossary/`, `/book-growth-call/`, `/unlock-growth-audit/`, `/future-proof-your-seo/`. Record performance, accessibility, best-practices, and SEO scores plus LCP, CLS, TBT. The DataForSEO MCP has `on_page_lighthouse`; use it. If it's unavailable, say so and fall back to local `pnpm build && pnpm start` with a local Lighthouse run, and label the numbers as local so they're never compared against production ones.
>
> **5 — Accessibility baseline** → `baseline/a11y.md`
> Run axe-core against the same page list on a local production build. There's no Playwright MCP; use `npm i --no-save playwright @axe-core/playwright` and drive it from a script in the scratchpad. Record violation counts by impact (critical / serious / moderate / minor) per page, with the top offenders named. Follow the dev-server hygiene rules in the guardrails: one server, one browser, poll for stable 200s before measuring.
>
> **6 — Funnel inventory** → `baseline/funnels.md`
> Map the conversion paths end to end, entry to conversion, as they exist in code: the industrial funnel (home → services or industries → `/book-growth-call/`), the Revenue Engine funnel (home → `/revenue-engine/` or `/dentists/` → leak audit), and the probe funnel (hero scan → `/ai-readiness/[token]/` → AI read → email unlock → audit door). For each step record the URL, the CTA text, the target, and whether the page is indexable. Flag dead ends, steps whose CTA disagrees with the page it lands on, and any funnel that terminates without a next action. Don't fix them. This is the map the flow and UX lenses audit against.
>
> **7 — Dependency and supply-chain state** → `baseline/deps.md`
> Run `pnpm audit` and record it verbatim, severity by severity. Then look past the advisory feed, which only knows about disclosed CVEs: flag any dependency that is a major version behind, unmaintained, or pulled in for something trivial enough to inline. Pay attention to what runs on the server and touches untrusted input — `node-html-parser` and `marked` both parse fetched content in the probe path, which makes them a different risk class from a build-time dev dependency. Record the pinned versions of `next`, `react`, `@anthropic-ai/sdk`, and `sanity` so upgrade drift is measurable later. Don't upgrade anything.
>
> **8 — Summary** → `baseline/00-summary.md`
> One page. Green, yellow, red per area, with the numbers that justify each call, and the five things you'd look at first if you were the one auditing. Append any findings you tripped over to the ledger as OPEN rows with `Found by: <model> (phase 0)`.
>
> **Guardrails.** No fixes, no refactors, no copy edits, no dependency installs outside the scratchpad. Never read or echo values from `ss local env` — env var names only. If a measurement won't run, record why in the file where it would have gone. A missing number is fine; a fabricated one poisons every comparison after it.

---

## Done when

`baseline/` holds all eight files, every number is either measured or explicitly marked unavailable with a reason, the test-runner decision is written up with a recommendation, and the ledger count table matches the rows in it.
