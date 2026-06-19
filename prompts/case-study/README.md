# /prompts/case-study — operator playbooks for the case-study system

Reusable, self-contained task prompts for writing and publishing case studies on
salesolution.net. Each file is a brief you hand to an AI coding agent running **inside this repo**.
They assume no memory of how the system was built and point the agent at the context it needs.

**Read `prompts/_CONTEXT.md` first, every run** (the shared backbone: company, voice, Sanity
workflow, gotchas). This README adds the case-study-specific model on top of it.

## Local-only — never web-served
Like the rest of `/prompts`, this folder lives at the repo root and is in `.vercelignore`, so
Next.js never routes it and it never ships to the web. It IS committed to git. Use it locally.

---

## What a case study is here (the model the schema encodes)

A case study is **one engagement told from one service angle**. The Sanity schema
(`sanity/schemas/case-study.ts`) bakes in what makes one convincing, so it isn't left to memory:

- **A metric-first headline** with the real numbers, a baseline, and a timeframe
  ("1,840 to 2,640 qualified leads a month"). Business outcomes — leads, revenue, citations —
  never traffic or rankings.
- **A situation → constraint → approach → mechanism → results arc.** The `constraint` (what made
  it hard) and the `mechanism` (why the work moved the number) are what separate a believable
  story from a before/after collage.
- **Honest results.** `resultsNarrative` includes the lag and the dips. A monotonic
  up-and-to-the-right curve reads as fake.
- **A measurement methodology block** — one entry per number on the page (tool, sample, baseline
  window, attribution). This is what makes a metric believable, AI-visibility metrics especially.
- **A required disclosure mode** — `named` / `anonymized` / `composite` — so the disclaimer page's
  "composites are clearly marked" promise holds at render time.

Client identity lives on a separate `caseStudyClient` document. **One client can carry several
case studies**, one per service angle. That is the hub-and-spoke model below.

### The hub-and-spoke model + the credit-split rule (read before writing an engagement)

When you did several disciplines for one client (design, dev, migration, SEO, content, ads,
email), you don't cram it into one page and you don't double-count. You write it as an
**engagement**: one **anchor** plus N **cuts**, set by the `engagementRole` field.

| `engagementRole` | What it is | What number it owns |
|---|---|---|
| `standalone` | a one-off project (the default) | its own single result |
| `anchor` | the full-engagement overview (usually Full Growth Ownership) | the **aggregate business outcome** — leads / revenue — and nothing else |
| `cut` | one discipline of the larger engagement | **only its discipline's metric** (the replatform's SKU count, the AI-search citations, the outbound reply rate) |

**The credit-split rule: every number is claimed on exactly one study.** The anchor headlines the
aggregate (e.g. +43.5% qualified leads) and must **not** re-print any cut's number in its stats.
Each cut headlines its own discipline metric and points the aggregate *back to the anchor* ("the
qualified-lead growth is reported on the anchor study"). No metric appears as a headline twice.
This is editorial, not enforced by schema — the author and verify prompts hold the line.

The anchor and its cuts **share one `client`** and cross-link automatically: the detail page groups
same-client studies into one engagement (anchor-first), and the hub card shows a **Full engagement**
badge on the anchor. You don't wire links by hand; you set `engagementRole` and the shared client
ref, and `components/sections/case-studies/CaseStudyRelated.tsx` does the rest.

**Standalone vs engagement — the decision:** one discipline, one number → `standalone`. Several
disciplines that each produced a result worth its own page → an engagement (anchor + cuts). One
client, several disconnected projects over time with no shared headline → separate `standalone`
studies that still share the client doc. The research prompt walks this decision.

---

## The prompts

| Prompt | What it does |
|---|---|
| `research-next-case-study.md` | Pick the next client/engagement to write up from real work history; decide standalone vs engagement; emit filled authoring prompt(s). The generator. |
| `author-case-study.TEMPLATE.md` | Template: author ONE `standalone` case study draft. |
| `author-engagement.TEMPLATE.md` | Template: author a hub-and-spoke engagement — one anchor + N cuts — with the credit split baked in. |
| `verify-and-publish-case-study.md` | Adversarially fact-check + credit-split-audit the drafts, humanize the prose, then publish into Sanity. |

### The generator pattern
`research-next-case-study.md` researches what to write next, then **emits ready-to-run authoring
prompts** by filling `author-case-study.TEMPLATE.md` or `author-engagement.TEMPLATE.md`. Run ONE
research prompt, get back the concrete authoring prompt(s), run those, then verify-and-publish.

### Suggested order
1. `research-next-case-study.md` → decide the next client + standalone-vs-engagement, get filled prompts.
2. Run the emitted `author-*` prompt(s) → drafts land in Sanity for review.
3. Operator reviews the numbers and disclosure in `/studio`.
4. `verify-and-publish-case-study.md` → credit-split audit + fact-check + humanize + publish.

---

## How to use a prompt
1. Work **inside this repo** (the agent needs filesystem + `.env.local`).
2. Open the prompt, copy its contents, hand it to the agent. Start the run with: **"Read
   `prompts/_CONTEXT.md` first."**
3. For `*.TEMPLATE.md`: replace every `{{PLACEHOLDER}}` before running, or let
   `research-next-case-study.md` fill them for you.

## Gotchas specific to case studies (the rest are in `_CONTEXT.md`)

- **Publishing into Sanity is manual and there is no HTML → Portable Text converter.** Drafts are
  built by a **Node seed script** that reads `.env.local`, assembles the document objects by hand,
  and POSTs a `createOrReplace` mutation by raw `fetch` to the Sanity mutate endpoint
  (`https://<projectId>.api.sanity.io/v<ver>/data/mutate/<dataset>`) with the write token as a
  `Bearer` header — **no Sanity client**. Copy the pattern from `scripts/seed-northern-hydraulics.mjs`
  (env reader; `tidy` curly-apostrophe helper; `block`/`pt`/`stat`/`phase`/`method`/`quote`/`ref`/`slug`
  builders). `scripts/seed-case-studies.mjs` exports its `{ clients, studies }` for reuse. For
  **prose-only** humanizer edits, copy `scripts/patch-case-study-prose.mjs` — a non-destructive `set`
  on the prose fields only (`summary`, `situation`, `constraint`, `mechanism`, `resultsNarrative`),
  so numbers, stats, methodology, and disclosure stay untouched. Never re-run a full seed after
  Studio edits — `createOrReplace` clobbers them.
- **Draft-first, with one canonical id scheme.** Author into drafts, not straight to published;
  `verify-and-publish-case-study.md` promotes them. Use the **full kebab client slug**
  (`northern-hydraulics`, not `nh`):
  - client doc → `drafts.caseStudyClient-<client-slug>`
  - a multi-study client → `drafts.caseStudy-<client-slug>-<service-or-anchor>` — the suffix is the
    study's `primaryService` value (`dev`, `search`, `editorial`, `outbound`, `catalog`) or `anchor`
    (e.g. `drafts.caseStudy-northern-hydraulics-anchor`, `drafts.caseStudy-northern-hydraulics-dev`)
  - a single-study client → `drafts.caseStudy-<client-slug>`
  - **Gotcha:** the NH sample script uses an abbreviated id (`caseStudy-nh-anchor`) and **no
    `drafts.` prefix** because it was a structural test published directly. Copy its helpers and
    mutate pattern, never its id scheme or its direct-publish — real client numbers go in as drafts.
- **`stats` allows 2–4 items** (schema validation `min(2).max(4)`). The schema's text description
  says "3–4", but the validation wins — 2 is allowed. There's one `methodology` entry per number,
  so keep the stat strip tight.
- **The revalidate webhook does not include case studies yet.** The tag is `caseStudy`
  (`sanity/lib/case-studies.ts`), but the Sanity webhook GROQ filter in the dashboard
  (`app/api/revalidate/route.ts` documents it) is `_type in ["post","guide","careerPath",…]` with
  **no `caseStudy`**. Add `"caseStudy"` and `"industry"` to that filter before relying on
  publish-time revalidation, or live pages go stale until the hourly `revalidate`. Note
  `caseStudyClient` is **not** a cache tag — case-study pages resolve client data inline (tagged
  `caseStudy`), so after a client-only edit, re-touch each affected `caseStudy` to refresh it.
- **Disclosure is load-bearing.** `named` requires the `caseStudyClient` to have a `publicName`
  **and** written client consent. `composite` must be honestly flagged. Don't upgrade a study to
  `named` without confirming consent. Consent isn't a schema field — record the evidence (who
  approved, date, medium) in `caseStudyClient.internalNotes`; that's the only place the verify pass
  can audit it.
- **The Northern Hydraulics naming hazard.** NH already has anonymized "Industrial hydraulics
  distributor" studies that are likely the same client as the named NH sample. Before publishing
  anything NH, read `docs/strategy/case-studies/fact-ledger.md` and decide whether to consolidate.
- **Never fabricate.** Every number traces to a real source recorded in `internalNotes`. If a
  figure can't be verified, the study stays a draft. No invented quotes, no invented metrics.
- **Term capture is still required** (see `_CONTEXT.md`): after writing the prose, queue any new
  domain terms with `node scripts/glossary-queue.mjs add …`.
