# Phase 1 — Audit wave 1: the probe system and the public funnel

**Scope:** the AI-readiness probe (`lib/probe/`, `components/probe/`, `app/api/probe/**`, `app/(site)/ai-readiness/**`) and the public conversion funnel (homepage, service and industry pages, Revenue Engine, the five lead-gen landing pages, all three lead API routes).

Why here first: the probe is uncommitted, it's the newest surface, and it does the three things that go wrong — it fetches user-supplied URLs, it spends money on an AI call, and it gates access with a cookie. Everything else in the repo has been in production longer and under more eyes.

**Find only. Do not fix anything in this phase.** Fixing while auditing is how a session convinces itself a finding was real. Separation is what makes the attribution data worth collecting.

---

## The eight lenses

Each runs as its own agent with its own instructions. One lens, one agent, no overlap in what they're told to look for — a lens that audits everything finds nothing in particular.

| Lens | Looks for |
|---|---|
| **A · Security** | SSRF, authz gaps, missing or evadable rate limits, injection (prompt, GROQ, redirect, header), cookie and token crypto, secret handling, dependency risk |
| **B · Privacy & compliance** | What personal data is captured, where it goes, what the page promises vs what happens, consent and cookie posture, third-party pixels, retention, CAN-SPAM and GDPR posture of outbound-email pages, marketing claims vs `docs/strategy/case-studies/fact-ledger.md` |
| **C · Correctness** | Business logic that computes a wrong answer: the 42-signal scorer, gate arithmetic, rate-limit windows, funnel state machines, error and empty states, race conditions, boundary values |
| **D · Code quality & tests** | Untested risk surface, duplication worth collapsing, dead code, weak types, `any` escapes, error swallowing, missing invariants — and the tests that should exist |
| **E · UX & accessibility** | WCAG 2.2 AA on real markup, keyboard traps, focus order, contrast, touch targets, mobile layout, loading and error and empty states, form validation clarity, copy that confuses at the moment of action |
| **F · Performance** | Core Web Vitals causes, bundle weight, image handling, caching and ISR correctness, redundant work per request — the `/ai-readiness/[token]/` page re-scans on every view and the OG image re-scans on every unfurl, so start there |
| **G · Technical SEO & GEO** | Metadata, canonicals, JSON-LD validity, sitemap registry vs real routes, robots and indexability of funnel pages, `llms.txt` accuracy, internal linking, AI-crawler access |
| **H · Flow & conversion** | Does the funnel hold together: CTA consistency, dead ends, steps that promise one thing and deliver another, friction that isn't buying anything, the probe → unlock → audit path end to end |

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md`, `01-guardrails.md`, `08-known-deliberate.md`, and `baseline/00-summary.md` first. Then read `.agents/product-marketing-context.md` before judging anything customer-facing.
>
> `08-known-deliberate.md` is the list of things that look like defects and are decisions. Reporting one costs a verify cycle and lowers the precision number this program measures. Clear its escape hatch or leave it alone.
>
> Audit wave 1: the AI-readiness probe and the public conversion funnel. Run the eight lenses in `03-phase-1-audit-probe-funnel.md`, one agent per lens, each scoped to that lens only.
>
> **Find only. Change no code.** The only file you write is the ledger.
>
> Every finding needs a concrete failure scenario — specific inputs or state, and the wrong outcome that follows. "This could be improved" is not a finding. "A user who X gets Y instead of Z" is. If you can't write the scenario, drop it.
>
> Append findings to `docs/handoff/opus-5-plan/findings-ledger.md` under **Wave 1**, in the ledger format, status `OPEN`, `Found by: <model> (phase 1, lens <letter>)`. Number continuing from F-006. Set a provisional severity; phase 2 is allowed to overrule it.
>
> Don't re-report F-001 through F-006. If a lens finds something adjacent, cross-reference the existing ID rather than opening a duplicate.
>
> **Guardrails.** No fixes. No copy edits. Don't touch GATE-signed decisions, the case-study fact ledger, generated files, `.engine`, or `seo-project/`. Read the Next 16 docs in `node_modules/next/dist/docs/` before claiming a routing, caching, or metadata bug — training data is wrong about this version and confidently so.
>
> Finish with a summary: findings per lens, severity distribution, the three you'd fix first, and which lens turned up the least so I know where coverage was thin.

---

## Running it as a workflow

Ultracode is a good fit here — eight independent lenses, no shared state. Paste this as the `script`. Note it passes no `model:` or `effort:`, deliberately: the env vars route every agent to Opus 5 at max effort, and hardcoding either would corrupt the attribution.

```js
export const meta = {
  name: 'audit-wave-1-probe-funnel',
  description: 'Eight-lens audit of the probe system and public funnel; findings only, no fixes',
  phases: [{ title: 'Audit', detail: 'one agent per lens' }, { title: 'Synthesize', detail: 'dedupe and rank' }],
}

const SHARED = `
Repo: Salesolution (Next.js 16 App Router + Sanity). Read docs/handoff/opus-5-plan/00-README.md,
01-guardrails.md, and 08-known-deliberate.md before anything else. The known-deliberate list is
things that look like defects and are decisions — clear the escape hatch or skip them. Scope for this wave: the AI-readiness probe
(lib/probe/, components/probe/, app/api/probe/**, app/(site)/ai-readiness/**) and the public
conversion funnel (homepage, services, industries, revenue-engine, the five lead-gen landing
pages, and app/api/lead|revenue-leak-audit|full-growth-quote).

FIND ONLY. Change no files. Every finding needs a concrete failure scenario: specific inputs or
state, and the wrong outcome that follows. No scenario, no finding. Skip findings already in the
ledger as F-001..F-006. Read node_modules/next/dist/docs/ before claiming a routing, caching,
or metadata bug — this Next version differs from training data.
`

const LENSES = [
  { key: 'A-security', prompt: 'SSRF, authz gaps, missing or evadable rate limits, injection (prompt, GROQ, redirect, header), cookie and token crypto, secret handling, dependency risk. lib/probe/fetch.ts and the gate are the hot spots.' },
  { key: 'B-privacy', prompt: 'Personal data captured, where it flows, and whether the page promise matches reality. Consent and cookie posture, third-party pixels, retention. CAN-SPAM and GDPR posture of the outbound-email service pages. Marketing claims checked against docs/strategy/case-studies/fact-ledger.md.' },
  { key: 'C-correctness', prompt: 'Business logic that returns a wrong answer. The 42-signal scorer in lib/probe/score.mjs, gate arithmetic in lib/probe/gate.mjs, rate-limit windows, funnel state machines, error and empty states, races, boundary values.' },
  { key: 'D-quality', prompt: 'Untested risk surface, duplication worth collapsing, dead code, weak types and any escapes, swallowed errors, missing invariants. Name the specific tests that should exist and what each would catch.' },
  { key: 'E-ux-a11y', prompt: 'WCAG 2.2 AA against real markup, keyboard traps, focus order, contrast, touch targets, mobile layout, loading and error and empty states, form validation clarity, copy that confuses at the moment of action. Read components, do not guess from names.' },
  { key: 'F-perf', prompt: 'Core Web Vitals causes, bundle weight, image handling, caching and ISR correctness, redundant per-request work. app/(site)/ai-readiness/[token]/ re-scans on every view and its opengraph-image re-scans on every unfurl — start there. Use baseline/bundle.md and baseline/vitals.md.' },
  { key: 'G-seo-geo', prompt: 'Metadata, canonicals, JSON-LD validity, lib/sitemap/registry.ts versus real routes, robots and indexability of funnel pages, public/llms.txt accuracy, internal linking, AI-crawler access. This company sells search — hold it to its own standard.' },
  { key: 'H-flow', prompt: 'Funnel integrity end to end. CTA consistency, dead ends, steps promising one thing and delivering another, friction buying nothing, the probe to unlock to audit path. Compare against baseline/funnels.md.' },
]

const FINDINGS = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'dimension', 'where', 'claim', 'failureScenario'],
        properties: {
          severity: { type: 'string', enum: ['S1', 'S2', 'S3', 'S4'] },
          dimension: { type: 'string' },
          where: { type: 'string', description: 'file:line' },
          claim: { type: 'string' },
          failureScenario: { type: 'string' },
          suggestedFix: { type: 'string' },
          touchesCopy: { type: 'boolean', description: 'true if the fix would edit customer-facing copy' },
        },
      },
    },
  },
}

phase('Audit')
const results = await parallel(
  LENSES.map((l) => () =>
    agent(`${SHARED}\n\nYour lens is ${l.key}. ${l.prompt}\n\nReport only findings inside your lens.`, {
      label: `lens:${l.key}`,
      phase: 'Audit',
      schema: FINDINGS,
    })),
)

const all = results.filter(Boolean).flatMap((r, i) =>
  r.findings.map((f) => ({ ...f, lens: LENSES[i].key })))

phase('Synthesize')
const written = await agent(
  `Here are ${all.length} raw findings from eight audit lenses:\n\n${JSON.stringify(all, null, 2)}\n\n` +
  `Merge duplicates across lenses (keep the sharpest failure scenario, list every lens that found it), ` +
  `drop anything without a concrete failure scenario, drop anything already covered by F-001..F-006 ` +
  `(cross-reference instead), then append the survivors to docs/handoff/opus-5-plan/findings-ledger.md ` +
  `under "## Wave 1" in the exact ledger format, status OPEN, numbering from F-007. Mark rows with ` +
  `touchesCopy as dimension-appropriate and note in Notes that the fix needs sign-off. ` +
  `Update the count table. Return a summary: findings per lens, severity distribution, top three to fix first, ` +
  `and which lens produced the least so I know where coverage was thin.`,
  { label: 'synthesize', phase: 'Synthesize' },
)

return written
```

The barrier before synthesis is deliberate: deduping across lenses needs every lens's output at once, which is the one case where waiting beats pipelining.

---

## Done when

Wave 1 findings are in the ledger with failure scenarios and provisional severities, the count table is updated, and the summary names where coverage was thin. No source file has changed — `git status` should show only the ledger.
