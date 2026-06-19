# Prompt TEMPLATE: Author a hub-and-spoke ENGAGEMENT (anchor + cuts)

> Fill every `{{PLACEHOLDER}}` then run. `prompts/case-study/research-next-case-study.md` can fill
> this for you. **Read `prompts/_CONTEXT.md` and `prompts/case-study/README.md` first** — the
> credit-split rule in the README is the whole point of this prompt.
>
> Use this when one client got several disciplines that each produced a result worth its own page
> (e.g. design + replatform + AI search + editorial + outbound). For a single discipline, use
> `author-case-study.TEMPLATE.md`.

## The client
- **Client (internal name):** {{CLIENT_NAME}}
- **Client slug:** {{CLIENT_SLUG}}  (kebab-case)
- **Public name (only if named + consented):** {{PUBLIC_NAME}}  (else blank)
- **Descriptor:** {{DESCRIPTOR}}      **Scale:** {{SCALE}}      **Vertical:** {{VERTICAL}}
- **Disclosure mode:** {{DISCLOSURE}}  (named | anonymized | composite — applies to every study in the engagement)
- **Engagement window (whole relationship):** {{WINDOW}}      **Duration label:** {{DURATION}}

## The anchor (the full-engagement overview)
- **Primary service:** usually `fullgrowth`. **Supporting services:** {{ANCHOR_SUPPORTING}}  (the cuts' disciplines)
- **Aggregate business outcome it owns:** {{ANCHOR_METRIC}}  (the ONE number — leads or revenue — with baseline + window, e.g. "1,840 → 2,640 qualified leads/mo, +43.5%")
- **The story in one line:** {{ANCHOR_ANGLE}}

## The cuts (one per discipline) — fill one row per cut
For each cut: `slug` · `primaryService` · the **single metric it owns** · one-line angle.
```
{{CUT_1}}  e.g. headless-replatform · dev · "8,500 SKUs off Magento 1, INP 600ms+→<200ms" · the rebuild
{{CUT_2}}  e.g. ai-search-citations · search · "AI-Overview citations 4→34 (×8.5)" · become the citable source
{{CUT_3}}  e.g. editorial-authority · editorial · "informational sessions ×2" · out-write the manufacturers
{{CUT_N}}  …
```

## The numbers + their sources (for every study's `internalNotes`)
{{NUMBERS_AND_SOURCES}}

## Task
Create, as Sanity **drafts** (canonical id scheme — README; use the **full** kebab client slug,
never an abbreviation): one `caseStudyClient` (`drafts.caseStudyClient-{{CLIENT_SLUG}}`), one
**anchor** `caseStudy` (`drafts.caseStudy-{{CLIENT_SLUG}}-anchor`, `engagementRole: 'anchor'`), and
one **cut** per discipline (`drafts.caseStudy-{{CLIENT_SLUG}}-<service>`, where `<service>` is the
cut's `primaryService` value — `dev`, `search`, `editorial`, `outbound`, `catalog`;
`engagementRole: 'cut'`). They all share the same `client` ref — that shared ref is what cross-links
them into one engagement at render time. There is no link field between studies; do not invent one.

Build with a Node script copied from **`scripts/seed-northern-hydraulics.mjs`** — reuse its env
reader and `tidy`/`block`/`pt`/`stat`/`phase`/`method`/`quote`/`ref`/`slug` helpers. Mirror
`sanity/schemas/case-study.ts`. Reference the client as `_ref:
'drafts.caseStudyClient-{{CLIENT_SLUG}}'` (or `_weak:true`) while drafts.

**Verify before you write.** Every number traces to a real source in `internalNotes`. No invented
figures or quotes. Unsourced number → leave it out and flag it; the study stays a draft.

**Disclosure** ({{DISCLOSURE}}) applies to every study in the engagement. For `named`, the
`caseStudyClient` needs a `publicName` **and** recorded consent — there's no consent field, so write
the evidence (who approved, date, medium) into `caseStudyClient.internalNotes`.

### THE CREDIT-SPLIT RULE (the reason this prompt exists)
Every number is claimed on **exactly one** study. Hold this line or the engagement reads as inflated:

- **The anchor owns the aggregate outcome and nothing else.** Its `keyMetric` and its `stats` are
  the coordinated result (leads / revenue) plus *engagement-shape* facts (number of disciplines,
  years, team). The anchor's stats must **not** re-print any cut's number (no SKU count, no citation
  count, no reply rate in the anchor's stat strip). Its `resultsNarrative` says each discipline's
  result is written up in its own cut below.
- **Each cut owns only its discipline's metric.** The replatform cut headlines the build (SKUs, INP,
  schema); the AI-search cut headlines citations; the editorial cut headlines sessions; the outbound
  cut headlines reply rate. A cut's `resultsNarrative` explicitly points the aggregate **back to the
  anchor** ("the qualified-lead growth is reported on the anchor study, not here").
- **Run the audit yourself before finishing:** list every headline number and every stat across all
  studies; if any value appears as a headline on two studies, fix it. `verify-and-publish` re-runs
  this audit adversarially.

### Each study still needs the full arc
Every study (anchor and each cut) is a complete case study in its own right: `situation` (with its
own baseline), `constraint`, `approach` (phases), `mechanism`, `resultsNarrative` (honest, with the
lag/dips), `keyMetric`, 2–4 `stats`, optional `chart`/`quote`, and `methodology` (**one entry per
number on that page**). Same field list as `author-case-study.TEMPLATE.md` — see it for detail.

The anchor's `mechanism` should explain **why one team across all disciplines beat coordinating
vendors** (each discipline made the next cheaper) — that's the real argument for a full engagement.

### Voice
Operator register (`_CONTEXT.md`). **Run the humanizer skill on every study's prose.** Humanize the
voice, never the facts. Keep examples in the client's vertical.

## Definition of done
- One client draft + one anchor draft + N cut drafts exist — verify with `perspective:'raw'`.
- **Credit-split audit passes:** no headline number appears on two studies; each cut points its
  aggregate back to the anchor; the anchor re-prints no cut's number. Paste the audit table in your reply.
- Every number has a `methodology` entry and an `internalNotes` source.
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- **Term capture:** `node scripts/glossary-queue.mjs add "…" --source case-study:{{CLIENT_SLUG}}`.
- Do NOT publish. Drafts for operator review, then `verify-and-publish-case-study.md`.
