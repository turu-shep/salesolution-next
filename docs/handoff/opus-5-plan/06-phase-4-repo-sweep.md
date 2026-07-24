# Phase 4 — Repo sweep (wave 2)

Everything wave 1 didn't cover. Run after wave 1's fixes have merged, so the sweep audits current code rather than code that's already been replaced.

**Scope:** the gated internal tooling (`/sales`, `/strategy`, and their libs), the content surfaces (glossary, career paths, case studies, guides, tools), the Sanity layer (schemas, queries, fetchers, webhook and preview routes), `scripts/`, config and platform files, and the shared component library.

Same eight lenses as phase 1. Same rule: **find only, no fixes.** Findings land as `OPEN` under **Wave 2** and go through phase 2 verification before anything gets touched.

---

## What's different about this surface

**The gated tooling is internal, which changes severity, not scope.** `/sales` and `/strategy` hold client proposals and pricing. A leak there is a business problem even though no public user can reach it. But a UX nit in an internal cockpit Artur uses daily is worth less than the same nit on a landing page — weight findings by who is actually harmed, not by which lens found them.

**The content surfaces are measured on referring domains and AI citations, not leads.** `/glossary/` and `/career-paths/` traffic doesn't convert, and that's expected. Do not report "this page has no CTA" or "this doesn't drive conversions" as findings there. It's the strategy working. Structured data, crawlability, citation-friendliness, and internal linking are the right lenses for those pages.

**Scripts are operator tools, not production code.** They run locally with real write tokens. Judge them on whether they can destroy data — an unguarded write against the wrong dataset, a missing dry-run, a destructive default — not on style.

**The Sanity layer has known gotchas** and they are not findings: the default query perspective hides drafts, interlinked drafts need weak refs, new doc types need registering in both `sanity/schemas/index.ts` and `sanity/structure.ts`, and `createClient` comes from `next-sanity`. See `prompts/_CONTEXT.md`. Report violations of these rules; don't report the rules.

---

## Prompt

> Read `docs/handoff/opus-5-plan/00-README.md`, `01-guardrails.md`, `08-known-deliberate.md`, and `prompts/_CONTEXT.md` first. Also read the "What's different about this surface" section of `06-phase-4-repo-sweep.md` — it changes how you weight findings on these paths.
>
> Audit wave 2: everything outside the probe and the public funnel. Gated tooling (`/sales`, `/strategy`), content surfaces (glossary, career paths, case studies, guides, tools), the Sanity layer including the webhook and preview routes, `scripts/`, config and platform files, shared components.
>
> Run the same eight lenses as phase 1 (A security, B privacy and compliance, C correctness, D quality and tests, E UX and accessibility, F performance, G technical SEO and GEO, H flow), one agent per lens.
>
> **Find only. Change no code.** Every finding needs a concrete failure scenario. Append to `findings-ledger.md` under **Wave 2**, status `OPEN`, `Found by: <model> (phase 4, lens <letter>)`, numbering continuing from the last ID.
>
> Skip anything already in the ledger. Wave 1 fixes have merged — audit what's on `main` now, not what the wave 1 findings described.
>
> **Weighting rules.** Internal-tool findings are severity-weighted by real harm, not by lens. Do not report missing CTAs or weak conversion on `/glossary/` or `/career-paths/` — those are authority assets measured on referring domains and AI citations, and that is deliberate. Judge `scripts/` on data-destruction risk, not style. The Sanity gotchas in `prompts/_CONTEXT.md` are house rules: report violations, not the rules.
>
> **Two specific things to check**, since they're already suspected:
> - `lib/sitemap/registry.ts` registers `/guides/seo-guides/` and siblings as static hubs, but they resolve through the Sanity-fed category branch in `app/(site)/guides/[slug]/page.tsx`. Determine whether the sitemap can advertise a URL that 404s.
> - There is no `/ai-readiness/` index route — only `[token]` and `methodology`. Decide whether that's a gap in the probe brand or a deliberate omission.
>
> **Also audit the docs that instruct agents.** `AGENTS.md` still says to ignore pre-existing `lib/lead-form/*` Zod errors; `npx tsc --noEmit` is now clean, so that line grants a blanket excuse for errors that no longer exist. Check `AGENTS.md`, `prompts/_CONTEXT.md`, and `.env.local.example` against current reality. `.env.local.example` is missing at least `ANTHROPIC_AUTH_TOKEN`, `PROBE_AI_MODEL`, `PROBE_AI_MOCK`, `DATAFORSEO_USERNAME`, `DATAFORSEO_PASSWORD`, `HUBSPOT_AUDIT_FORM_ID`, and `HUBSPOT_FGO_FORM_ID`. Stale instructions to agents cause bugs the same way stale code does.
>
> Finish with the same summary shape as phase 1: findings per lens, severity distribution, top three, thinnest coverage.

---

## Then

Wave 2 goes back through [phase 2](04-phase-2-verify-and-triage.md) and [phase 3](05-phase-3-fix-waves.md). Precision numbers are tracked per wave — whether the model got sharper or noisier on a surface it hadn't seen yet is one of the more interesting things this program can measure.
