# Prompt: Verify + publish case study drafts

**Read `prompts/_CONTEXT.md` and `prompts/case-study/README.md` first.**

## Goal
Adversarially check the case study **drafts** — facts, the credit split, disclosure, and the
"fake case study" tells — fix what's wrong, humanize the prose, then **publish** them.

## Do this

1. **List the drafts.** Node script, `next-sanity` `createClient` with `perspective:'raw'`:
   `*[_type=="caseStudy" && _id in path("drafts.**")]{ _id, title, "slug": slug.current,
   engagementRole, primaryService, disclosure, keyMetric, stats, "client": client->{_id, name,
   publicName}, situation, constraint, approach, mechanism, resultsNarrative, methodology,
   quote, internalNotes }`. Also pull any draft `caseStudyClient`. These are the candidates.

2. **Credit-split audit (engagements).** For all studies sharing a client, list every headline
   number (`keyMetric`) and every `stats` value. **No number may headline two studies.** Confirm:
   the anchor owns the aggregate (leads/revenue) and re-prints **no** cut's number in its stats;
   each cut owns exactly one discipline metric and its `resultsNarrative` points the aggregate back
   to the anchor. Fix any leak. (This is the failure mode the system exists to prevent — the
   original NH draft leaked cut numbers into the anchor's stats and had to be corrected.)

3. **Fact-check, adversarially.** For every study, check each number against the source recorded in
   `internalNotes`, and confirm a matching `methodology` entry exists for it (tool, sample, baseline
   window, attribution). For AI-visibility metrics (AI-Overview citations, GEO share), the
   methodology is what makes them believable — scrutinize those hardest. **Never publish a fabricated
   number, quote, or "real" outcome.** If a figure can't be sourced, strip it or hold the study as a
   draft. For scale, you may fan out one verifier per study in parallel (read-only); keep edits serial.

4. **The fake-case-study tells — reject any draft that trips these:**
   - **No timeframe** (`engagementWindow` / metric `sourceLine` missing) — the #1 tell.
   - **Monotonic up-and-to-the-right** results with no lag or dip in `resultsNarrative`.
   - **No methodology** for a headline number, or round numbers where exact ones should exist.
   - **A quote that contradicts the page's numbers**, or a `name` set on a non-`named` study.

5. **Disclosure integrity.** `named` requires the `caseStudyClient` to have a `publicName` **and**
   confirmed written consent (check `internalNotes`); don't upgrade to `named` without it. `composite`
   must read as clearly aggregated. For Northern Hydraulics, resolve the naming overlap with the
   existing anonymized studies first (`docs/strategy/case-studies/fact-ledger.md`).

6. **Humanize the prose.** Run the **humanizer skill** over `summary` / `situation` / `constraint` /
   `mechanism` / `resultsNarrative` (and each `approach` phase's `detail`): kill em-dash overuse,
   "not just X but Y", rule-of-three padding, hedging, buzzwords; lead with the outcome; vary
   sentence length. Preserve every number, date, and source verbatim. Push the edits with a
   **non-destructive `set`** on the prose fields only — copy `scripts/patch-case-study-prose.mjs`
   (its `FIELDS` = `summary`, `situation`, `constraint`, `mechanism`, `resultsNarrative` is the
   safe-to-touch set; `approach` is an array, so patch its `detail` text separately). Never re-run a
   full authoring seed — `createOrReplace` would clobber Studio edits.

7. **Publish.** For each draft, write the published doc (`_id` without the `drafts.` prefix), set
   `publishedAt` (and `updatedAt`), then delete the draft — one atomic mutate transaction. Publish
   the `caseStudyClient` doc too. The study→client ref becomes a strong ref once both are published.
   Copy the mutate pattern from `scripts/seed-northern-hydraulics.mjs` (build a `mutations` array,
   POST to the Sanity mutate endpoint). Don't re-run an authoring seed afterward — `createOrReplace`
   would clobber any Studio edits.

8. **Make sure publish actually revalidates.** The cache tag is `caseStudy`
   (`sanity/lib/case-studies.ts`), but the Sanity webhook GROQ filter in the project dashboard
   does **not include case studies yet** (`app/api/revalidate/route.ts` documents the current
   filter). Add `"caseStudy"` and `"industry"` to that webhook's GROQ filter, or live pages stay
   stale until the hourly `revalidate`. (`caseStudyClient` is **not** a cache tag — case-study pages
   resolve client data inline and are tagged `caseStudy`, so a client-only edit busts nothing; after
   editing a client doc, re-touch each affected `caseStudy` or wait for the hourly revalidate.) Note
   this in your reply if you can't edit the dashboard.

9. **Verify live.** Confirm `0` matching drafts / expected published count via `perspective:'raw'`.
   `curl` each `/case-studies/<slug>/` for HTTP 200 + a known phrase + the `Article` JSON-LD in the
   HTML. For an engagement, load the anchor and confirm the related section reads "Every piece,
   written up on its own." and lists the cuts; load a cut and confirm "The rest of the … engagement."

10. **Update docs.** Record what published (client, studies, disclosure, the credit-split table) in
    the case-studies strategy notes (`docs/strategy/case-studies/`), and clear any resolved item in
    `fact-ledger.md`.

11. **Term capture (required).** Editing case-study prose is a content task, so queue any new domain
    terms the studies use (AI-Overview citations, JIC/NPT, deliverability, faceted navigation, …):
    `node scripts/glossary-queue.mjs add "term one" "term two" … --source case-study:<slug>` — it's
    idempotent and only queues genuinely new terms (see `_CONTEXT.md`).

## Rules
- Operator voice preserved; facts and sources verbatim.
- Drafts only get promoted once their numbers are sourced and the credit-split audit passes.
- Report a per-study table: study · headline number (and which study owns it) · verdict
  (sound / fixed) · disclosure · methodology complete? · published?
