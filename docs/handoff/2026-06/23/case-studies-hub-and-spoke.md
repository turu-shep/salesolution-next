# Handoff — Case studies: hub-and-spoke engagement model + operator prompts

**Date:** 2026-06-23
**Owner:** Artur
**Status:** Shipped to `main` and pushed. One follow-up decision blocks "done" (NH sample numbers — see Open items #1).

---

## TL;DR

Built a Sanity-backed case-study system that lets **one client carry several case studies that split
credit instead of double-counting**, plus a folder of operator playbooks for writing and publishing
them. Northern Hydraulics (NH) is seeded as the worked example: one anchor + four discipline cuts.

Two commits, both on `origin/main`:
- `c263de1` — Add hub-and-spoke engagement model to case studies + Northern Hydraulics sample
- `61eb871` — Add case-study operator playbooks under prompts/

Verified: `npx tsc --noEmit` clean (0 errors), anchor + cut pages render correctly, the prompts were
adversarially reviewed against the codebase (6 agents) and all findings fixed. No secrets committed.

---

## The model (read this first)

A case study is **one engagement told from one service angle**. A new field on the schema,
`engagementRole`, sets how a study sits inside a multi-service relationship:

| `engagementRole` | What it is | Number it owns |
|---|---|---|
| `standalone` | a one-off project (default) | its own single result |
| `anchor` | the full-engagement overview (usually Full Growth Ownership) | the **aggregate** business outcome — leads/revenue — and nothing else |
| `cut` | one discipline of the larger engagement | **only** its discipline's metric |

**The credit-split rule — every number is headlined on exactly one study.** The anchor owns the
aggregate (e.g. +43.5% leads) and must not re-print a cut's number in its stats. Each cut owns its
own discipline metric and points the aggregate *back to the anchor*. This is editorial, not enforced
by schema — the author/verify prompts hold the line.

Cross-linking is automatic: the anchor and its cuts **share one `client` ref** (there is no link
field between studies). The detail page groups same-client studies into one engagement (anchor-first),
the hub card shows a **Full engagement** badge on anchors, and `CaseStudyRelated` adapts its copy by
role ("Every piece, written up on its own." on the anchor; "The rest of the … engagement." on a cut).

---

## What shipped

### Code / data model (commit `c263de1`)
- `sanity/schemas/case-study.ts` — added the `engagementRole` field (standalone/anchor/cut, default standalone).
- `sanity/lib/case-studies.ts` — `CaseStudyEngagementRole` type + `engagementRole` on `CaseStudyCard`.
  (The matching GROQ projection in `sanity/lib/queries.ts` was already committed in an earlier change.)
- `components/sections/case-studies/CaseStudyCard.tsx` — "Full engagement" badge on anchor cards.
- `components/sections/case-studies/CaseStudyRelated.tsx` — engagement-aware ordering + role-based copy.
- `app/(site)/case-studies/[slug]/page.tsx` — passes `currentRole` + `clientLabel` to the related section.
- `scripts/seed-northern-hydraulics.mjs` — the NH sample seed (see below).

### Operator prompts (commit `61eb871`) — `prompts/case-study/`
Local-only briefs (in `.vercelignore`, never web-served). Mirrors the glossary/career-path folders.
- `README.md` — the model, the credit-split rule, the prompt index, and the case-study gotchas.
- `research-next-case-study.md` — generator: pick the next client, decide standalone vs engagement, emit filled authoring prompts.
- `author-case-study.TEMPLATE.md` — author one standalone study.
- `author-engagement.TEMPLATE.md` — author an anchor + N cuts with the credit split baked in.
- `verify-and-publish-case-study.md` — credit-split audit + fact-check + humanize, then publish.
- `_generated/` — where the generator drops filled prompts.

The top-level `prompts/README.md` index already lists the `case-study/` group (committed separately).

---

## The Northern Hydraulics sample

One named client (`caseStudyClient-northern-hydraulics`) + five studies. Each headlines a different
number, so credit never double-counts:

| Study (`_id`) | slug | Role | Owns |
|---|---|---|---|
| `caseStudy-nh-anchor` | `northern-hydraulics-full-engagement` | anchor | **+43.5%** qualified leads (1,840→2,640/mo) |
| `caseStudy-nh-dev` | `northern-hydraulics-headless-replatform` | cut | **8,500** SKUs off Magento 1, INP 600ms+→<200ms |
| `caseStudy-nh-search` | `northern-hydraulics-ai-search-citations` | cut | **×8.5** AI-Overview citations (4→34) |
| `caseStudy-nh-editorial` | `northern-hydraulics-editorial-authority` | cut | **×2** informational sessions |
| `caseStudy-nh-outbound` | `northern-hydraulics-outbound-email` | cut | **12%** cold-outbound reply rate |

Live (dev): `http://localhost:3000/case-studies/northern-hydraulics-full-engagement/` (anchor) → scroll
to "Every piece, written up on its own." for the four cuts. Each cut shows "The rest of the Northern
Hydraulics engagement."

> ⚠️ **The numbers are placeholders.** Every study's `internalNotes` flags it as SAMPLE/TEST. The seed
> uses `createOrReplace` on non-draft `_ids` with `disclosure: 'named'`, so these are **published, named
> docs sitting in the production Sanity dataset** — not drafts. See Open items #1 before this is exposed.

---

## Open items / next steps (priority order)

1. **Decide what to do with the NH sample (blocks "done").** It is live-named with placeholder numbers.
   Either: (a) replace with NH's real figures and confirm written naming consent, or (b) flip the studies
   to `disclosure: 'anonymized'` / unpublish them until real data exists. Don't leave fabricated numbers
   under a real client name on a public page. (The site may not have revalidated yet — see #3 — but a
   build or the hourly revalidate will surface them.)
2. **Resolve the NH naming hazard.** NH likely overlaps the existing anonymized "Industrial hydraulics
   distributor" studies. Read `docs/strategy/case-studies/fact-ledger.md` and decide whether to
   consolidate before publishing anything NH. (Flagged in the client doc's `internalNotes` too.)
3. **Add case studies to the revalidate webhook.** The cache tag is `caseStudy`
   (`sanity/lib/case-studies.ts`), but the Sanity webhook GROQ filter in the dashboard
   (`app/api/revalidate/route.ts` documents it) does **not** include it. Add `"caseStudy"` and
   `"industry"` to that filter, or publishes won't revalidate live pages until the hourly window.
   (`caseStudyClient` is not its own tag — client-only edits won't bust the page cache; re-touch the
   study or wait for the hourly revalidate.)
4. **Write the next real case study** using the new prompts: `research-next-case-study.md` →
   the emitted `author-*` prompt → review in `/studio` → `verify-and-publish-case-study.md`. The
   operator mentioned a deep history with several clients (NH, Hosebox, others) spanning design, dev,
   migration, ads, SEO, content, email — good candidates for engagements.

---

## How to operate it

- **Authoring:** copy the seed pattern from `scripts/seed-northern-hydraulics.mjs` — it reads
  `.env.local`, assembles docs by hand, and POSTs a `createOrReplace` mutation by raw `fetch` to the
  Sanity mutate endpoint with the write token as a Bearer header (no Sanity client). Helpers:
  `tidy`/`block`/`pt`/`stat`/`phase`/`method`/`quote`/`ref`/`slug` (unique `_key`s, straight→curly `’`).
- **Draft-first for real clients** (the NH sample published directly because it was a structural test):
  author into `drafts.caseStudy-<client-slug>-<service-or-anchor>`, review in `/studio`, then promote.
  Use the **full** kebab client slug — NH's abbreviated `nh` id is the test artifact, don't copy it.
- **Prose-only edits:** `scripts/patch-case-study-prose.mjs` does a non-destructive `set` on the prose
  fields only (`summary`, `situation`, `constraint`, `mechanism`, `resultsNarrative`). Never re-run a
  full seed after Studio edits — `createOrReplace` clobbers them.
- **Consent for named studies** lives only in `caseStudyClient.internalNotes` (no schema field).
- **`stats`** validation is `min(2).max(4)` (the schema description says "3–4" — validation wins).

---

## Verification done this session
- `npx tsc --noEmit` — 0 errors (pre-existing `lib/lead-form/*` Zod errors are not ours).
- Anchor + cut pages render; the engagement cross-linking and credit split confirmed visually.
- Prompts adversarially reviewed against the codebase (per-file fact-check + folder completeness critic).
  Fixed: undefined `{{SERVICE}}` placeholder, a wrong `createClient` seed claim, the `caseStudyClient`
  non-tag claim, an unreferenced prose-patch helper, draft-id consistency, plus minor voice/completeness.
- Commits scoped to exact paths; `.env.local` / `ss local env` confirmed gitignored and never staged.

---

## Out of scope (untouched — not part of this work)
The working tree has other uncommitted, unrelated workstreams I deliberately did not touch: Revenue
Engine + campaign pages (`app/(campaign)/`, `revenue-engine/audit-booked|local-retail|medical/`, the
audit form + API + schema), industry-hub tweaks (`industries/industrial-distribution/page.tsx`,
`seed-industries.mjs`), landing-page docs, `lib/analytics.ts`, a few section components, and
`public/artur-shepel.jpg`. Those are separate in-flight work, still local.
