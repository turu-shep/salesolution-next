# Prompt TEMPLATE: Author ONE standalone case study (draft)

> Fill every `{{PLACEHOLDER}}` then run. `prompts/case-study/research-next-case-study.md` can fill
> this for you. **Read `prompts/_CONTEXT.md` and `prompts/case-study/README.md` first.**
>
> Use this for a **standalone** study — one client, one discipline, one headline number. For a
> multi-discipline engagement (anchor + cuts), use `author-engagement.TEMPLATE.md` instead.

## The engagement to write up
- **Client (internal name):** {{CLIENT_NAME}}
- **Client slug:** {{CLIENT_SLUG}}  (kebab-case, e.g. `hosebox`)
- **Public name (only if named + consented):** {{PUBLIC_NAME}}  (else leave blank)
- **Descriptor:** {{DESCRIPTOR}}  (e.g. "Industrial hydraulics distributor")
- **Scale:** {{SCALE}}  (e.g. "~8,500 SKUs", "12-location HVAC contractor")
- **Industry / vertical:** {{VERTICAL}}  (industrial e-commerce | home services | dental — see `_CONTEXT.md`)
- **Disclosure mode:** {{DISCLOSURE}}  (named | anonymized | composite — `named` needs publicName + written consent)
- **Primary service:** {{PRIMARY_SERVICE}}  (search | catalog | editorial | dev | outbound | fullgrowth)
- **Supporting services:** {{SUPPORTING_SERVICES}}  (same value set; [] if none)
- **Engagement window:** {{WINDOW}}  (e.g. "Aug 2024 – Jan 2025" — a missing timeframe is the #1 fake tell)
- **Duration label:** {{DURATION}}  (e.g. "6 months")
- **Headline metric:** {{HEADLINE_METRIC}}  (prefix / value / unit / label — a business outcome, with baseline + window)
- **The story in one line:** {{ANGLE}}
- **The numbers + their sources (for `internalNotes`):** {{NUMBERS_AND_SOURCES}}

## Task
Create ONE `caseStudy` **draft** in Sanity. Use the canonical id scheme (README): a multi-study
client → `drafts.caseStudy-{{CLIENT_SLUG}}-{{PRIMARY_SERVICE}}` (suffix is the `primaryService`
value); a single-study client → `drafts.caseStudy-{{CLIENT_SLUG}}`. Use the **full** kebab client
slug, never an abbreviation. Plus its `caseStudyClient` doc if it doesn't exist yet
(`drafts.caseStudyClient-{{CLIENT_SLUG}}`). Set `engagementRole: 'standalone'`.

Mirror the field shapes in `sanity/schemas/case-study.ts` and `sanity/schemas/case-study-client.ts`.
Build it with a Node script copied from **`scripts/seed-northern-hydraulics.mjs`** — reuse its env
reader and its `tidy` / `block` / `pt` / `stat` / `phase` / `method` / `quote` / `ref` / `slug`
helpers (they give every block a unique `_key` and convert straight `'` to curly `’` to match the
site). Reference the client with `_ref: 'drafts.caseStudyClient-{{CLIENT_SLUG}}'` while both are
drafts (or add `_weak: true`).

**Verify before you write.** Every number must trace to a real source you record in
`internalNotes`. Do not invent figures, quotes, or "real" outcomes. If a number can't be sourced,
write the study with the numbers you *can* stand behind and flag the gap in `internalNotes` — the
study stays a draft until it's resolved.

### Fields to set (full arc — see the schema for exact shapes)
- **Identity:** `title` (metric-first headline, business outcome with the real numbers),
  `titleMuted` (optional muted second clause), `slug`, `client` (ref), `primaryService`,
  `supportingServices`, `engagementRole: 'standalone'`, `summary` (2–3 sentences a buyer could
  paste into Slack: who, what changed, over what window), `engagementWindow`, `durationLabel`.
- **Narrative arc (portable text / arrays):**
  1. `situation` — where they started, **with the baseline numbers**, and why-now.
  2. `constraint` — what made it hard (budget, platform, season, politics). Conflict is what makes
     it believable. Strongly recommended even though it's optional.
  3. `approach` — the work phase by phase (`approachPhase`: title / detail / optional timeframe).
     Specific deliverables, not service-brochure language.
  4. `mechanism` — the causal link from the work to the number. This is the load-bearing section.
  5. `resultsNarrative` — what happened, **honestly**: include the lag and the dips. Monotonic
     up-and-to-the-right reads as fabricated.
- **Results & proof:**
  - `keyMetric` — the one number the page is built on: `prefix` (accent orange: +, −, ×), `value`
    (exact beats round — "43.5" not "40"), `unit`, `label`, `sourceLine`.
  - `stats` — 2–4 scannable items for the strip under the hero. **For a standalone study these are
    its own supporting numbers.**
  - `chart` (optional) — monthly trajectory of the headline metric with intervention `annotations`
    on the months something shipped. Raw counts from a named source beat percentage deltas.
  - `quote` (optional) — one quote, attributed at least by `role`. Must not contradict the page's
    numbers. `name` only when named + approved.
  - `methodology` — **one `methodologyItem` per number on the page** (metric + how it was measured:
    tool, sample, baseline window, attribution). This is non-negotiable.
- **Disclosure:** `disclosure` ({{DISCLOSURE}}); `disclosureNote` only to override the default
  sentence. For `named`, the `caseStudyClient` needs a `publicName` **and** recorded consent —
  there's no consent field, so write the evidence (who approved, date, medium) into
  `caseStudyClient.internalNotes`; that's where the verify pass audits it.
- **Meta:** `featured: false` (the operator promotes), `publishedAt` (today, ISO), `seo`
  (`{_type:'seo', metaTitle, metaDescription}`), `internalNotes` (**every number's source**, open
  questions, consent status).

### Voice
Operator register (`_CONTEXT.md`): terse, declarative, concrete, trade-off-aware, no hype.
First-person plural where natural. **Run the humanizer skill on all prose** before finalizing
(kill em-dash overuse, "not just X but Y", rule-of-three padding, hedging, buzzwords; lead with the
outcome; vary sentence length). Humanize the voice, never the facts — numbers, dates, and sources
stay verbatim. Examples stay in the client's real vertical.

## Definition of done
- Drafts `drafts.caseStudy-{{CLIENT_SLUG}}…` (and the client doc) exist in Sanity — verify with a
  `perspective:'raw'` query (`*[_type=="caseStudy" && _id in path("drafts.**")]`).
- Every number on the page has a matching `methodology` entry and a source in `internalNotes`.
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors); changed files lint clean.
- Report: the headline metric, the disclosure mode, and a one-line source for each number.
- **Term capture:** queue any new domain terms — `node scripts/glossary-queue.mjs add "…" --source case-study:{{CLIENT_SLUG}}` (see `_CONTEXT.md`).
- Do NOT publish. Leave it a draft for operator review, then `verify-and-publish-case-study.md`.
