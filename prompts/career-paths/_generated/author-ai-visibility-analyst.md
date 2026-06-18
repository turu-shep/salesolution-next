# Prompt: Author ONE career path (draft) — AI Visibility Analyst

> Filled from `prompts/career-paths/author-path.TEMPLATE.md` for the AI Visibility Analyst role.
> **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's substance:
> `docs/strategy/career-path/03-roles.md` (§3.5) and `docs/strategy/career-path/04-niches.md`.
> Everything needed is inlined in the "Source material" section at the bottom — this prompt is
> self-contained and ready-to-run.

## Role to author
- **Title:** AI Visibility Analyst
- **Slug:** `ai-visibility-analyst`  (kebab-case; a same-named glossary term may exist —
  routes differ (`/career-paths/ai-visibility-analyst` vs `/glossary/...`), so that's fine)
- **Role line ("For"):** analysts and SEOs running AI-visibility monitoring — the realistic first job in AI search
- **Level:** Entry  (drives the "Start here" marker — this is the only entry-accessible AI-search role)
- **Aliases (real job titles):** AI Visibility Analyst, AI Search Analyst, GEO Analyst
- **Industrial flavor (what changes inside a distributor):** the prompt panel is built from real
  buyer questions — "best hydraulic hose supplier for ag OEMs," "1756-L61 replacement,"
  "Gates equivalent of Parker 387 hose." Distributors are invisible in these answers today, so
  the monitoring report is the wake-up-call artifact that sells the GEO work, and the analyst's
  job is to catch hallucinated specs (pressure ratings, part numbers, compatibility) before they
  cost a customer.
- **Related glossary terms to link:** `ai-visibility`, `ai-share-of-voice`, `llm-citation`,
  `query-fan-out`, `generative-engine-optimization`

## Task
Create ONE `careerPath` **draft** (`drafts.career-ai-visibility-analyst`) following the established
schema (`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs`. Build portable-text with unique `_key`s. Pull the role's real
substance (responsibilities by seniority, skills/tools, buyer framing, demand evidence) from the
inlined source material below — don't invent it.

### Fields to set
- `title`, `slug`, `role` (the role line above), `level` (`Entry`), `duration` ("Self-paced"),
  `aliases`, `status:'drafting'`, `lastReviewed` (today), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial. Use the Lede
  seed below.
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete
  things. Use the matrix below.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC).
  Open with a 1-paragraph intro. Then 5 chapters covering the real work. **Each chapter ends with a
  `callout` (tone `tip`) "test it on your own site" prompt** — the format signature. Use the
  chapter outline below.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. The only revenue-touching surface. Speak to the distributor deciding whether to
  spend on this; keep the "we don't hire from these paths" stance — buyer guidance, NOT recruiting.
  Use the buyer seeds below.
- **`relatedTerms`** — references to the five term slugs (`{_type:'reference',
  _ref:'glossary-<slug>'}`; targets are published so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt.
Industrial examples throughout (hydraulics cross-refs, MRO part numbers, automation obsolescence,
PIM — `04-niches.md`). Verify any factual claim (demand evidence, tooling prices, stats). This role
is a **function, not a job title** — say so plainly on the page; do not imply standalone postings
exist (none do, verified).

## Definition of done
- Draft `drafts.career-ai-visibility-analyst` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.

---

## Source material for this role (verified — pulled from docs/strategy/career-path/03-roles.md + 04-niches.md)

### Lede seed (operator voice — doubles as a standalone quotable definition)
AI Visibility Analyst is a function, not a title: you run the prompt panel that tells a distributor
what ChatGPT, Perplexity, and Gemini say about its products today — who gets cited, who gets ignored,
and where the answer is flat wrong about a pressure rating or a part number. It is the only
entry-accessible job in AI search, and the report it produces is the wake-up call that sells the
fix.

### Seniority matrix (Entry / Mid / Senior)
Drawn straight from §3.5. Note: §3.5 frames this role as entry-accessible and "likely a duty inside
an analyst role," so the Mid/Senior rungs describe how the *monitoring function* deepens — they are
not separate standalone postings (none exist; verified). Frame Mid/Senior as "what the analyst owns
as the program matures," not as a promotion ladder of named jobs.

**Entry — focus:** Run the monitoring. You maintain the prompt panel and report what the engines say.
- mustLearn:
  - Building and maintaining a prompt panel — a fixed set of real buyer questions, run on a schedule
  - Tracking mentions, citations, and share of voice versus named competitors across ChatGPT / Perplexity / Gemini
  - Spotting hallucinations about products and specs (wrong pressure rating, wrong cross-reference, discontinued part listed as current) and logging them
  - Reading the visibility tools — Profound, Peec, Otterly, Scrunch, Ahrefs Brand Radar — and knowing what each actually measures

**Mid — focus:** Diagnose, not just report. You explain *why* competitors get cited and hand the optimizer a fix list.
- mustLearn:
  - Diagnosing why a competitor gets cited and the distributor doesn't (crawlable HTML vs PDF, entity gaps, corroboration)
  - Turning the monitoring output into a prioritized fix list the GEO/optimizer work can execute
  - Tracking share of voice as a trend, not a snapshot — separating noise from real movement
  - Designing the prompt panel so it covers the query fan-out a buyer actually triggers (cross-reference, sizing, substitution, "best supplier for X")

**Senior — focus:** Own the measurement framework and the accuracy governance.
- mustLearn:
  - Defining the measurement framework — what "AI share of voice" means here and how it's reported to a buyer who's never seen it
  - Governing accuracy of what engines say about safety-critical products (pressure, compatibility, ratings) as an ongoing repair loop, not a one-off audit
  - Connecting the monitoring deliverable to the GEO engagement it justifies, without overclaiming attribution
  - Choosing and integrating the tool stack against budget — the whole program is a $29–499/mo tool plus hours, never a headcount

### Suggested chapter outline (5 H2 chapters — each closes with a "test it on your own site" tip callout)
1. **"What an AI Visibility Analyst actually does (and why it isn't a job title yet)"** — set the
   frame: zero standalone in-house postings (verified), but a funded tool category and the duties
   embedded in GEO/AEO postings (Citizens lists Brandlight). The function exists; the title doesn't.
   *Tip:* search the role title on a job board — note how few standalone listings come back, then
   look inside GEO/AEO postings for the same duties.
2. **"Build the prompt panel"** — the core deliverable. A fixed set of real buyer questions, run on
   a schedule. Industrial questions are question-shaped and part-number-shaped. *Tip:* write 20
   prompts your best customer would actually type — including one cross-reference and one "best
   supplier for ___" — and run them once on three engines.
3. **"Track mentions, citations, and share of voice"** — what to measure and against whom. Mention
   rate vs citation share vs AI share of voice against named competitors; what the tools (Profound,
   Peec, Otterly, Scrunch, Brand Radar) each actually report. *Tip:* pick two named competitors and
   score your citation share against them across your panel — one number, tracked monthly.
4. **"Catch the hallucinations"** — the safety-critical industrial angle. Flag wrong specs, wrong
   crosses, discontinued parts listed as current. In hydraulics/automation a wrong answer costs a
   customer. *Tip:* run your three highest-stakes spec claims (a pressure rating, an interchange, a
   compatibility) through two engines and log every answer that's wrong or misattributed.
5. **"Turn the report into the GEO case"** — the monitoring artifact is the wake-up call that sells
   the fix; diagnose *why* competitors win and hand off a prioritized fix list. *Tip:* take your
   worst result — a prompt where a competitor is cited and you're absent — and write the one-line
   diagnosis of why (PDF vs HTML? entity gap? blocked crawler?).

### Buyer section seeds
- **whatTheyDo (1 sentence):** An AI visibility analyst tells you what ChatGPT, Perplexity, and
  Gemini currently say about your products — who they cite, where you're invisible, and where the
  answer is wrong about a spec — by running a fixed panel of real buyer prompts on a schedule.
- **signsYouNeedOne (3–4 bullets):**
  - You have no idea what AI assistants currently say about your brand or your parts
  - A customer told you an AI tool recommended a competitor — or quoted a wrong spec for your product
  - You're about to pay for GEO/AI-search work and have no baseline to measure it against
  - Your safety-critical data (pressure ratings, compatibility, cross-references) could be
    misstated by an engine and you'd never know
- **inHouseVsAgency (honest call for THIS role):** This is never an in-house hire at distributor
  scale — it's a tool ($29–499/mo) plus a few hours a month. Frame it for buyers as the audit you
  should ask for *before* paying anyone for GEO: it's the cheapest way to find out whether you have
  a problem and to set a baseline. If you already run a GEO engagement, the monitoring lives inside
  it; you don't bolt on a separate analyst. The duties also show up embedded in GEO/AEO roles (the
  Citizens Bank AEO posting names Brandlight as a tool), which is the realistic on-ramp for someone
  trying to enter AI search through this function.
- **costReality (figures from §3.5, sources named):** A monitoring program is a visibility tool plus
  hours, not a salary line: Profound ~$499/mo (described as "popular with Fortune 100"), Peec
  ~€89/mo, Otterly ~$29/mo, plus Scrunch and Ahrefs Brand Radar; Adobe has launched an AEM
  brand-visibility product, and Citizens Bank's AEO Manager posting lists Brandlight as tooling.
  There is no standalone salary band because there are no standalone in-house postings (verified) —
  budget it as tool + hours/month, and treat the report as the lead-in to a GEO engagement, not a
  headcount.

### Industrial angle (concrete niche examples — from 04-niches.md)
- **Hydraulics & pneumatics (densest cross-reference vertical):** panel prompts like "Gates
  equivalent of Parker 387 hose," "seal kit for a Char-Lynn 104 motor," "NPT vs JIC vs ORFS,"
  "best hydraulic hose supplier for ag OEMs." Distributors (Discount Hydraulic Hose, HFI, Tompkins)
  publish interchange charts; the analyst tracks whether the engine cites them or Parker's JS
  crossref tool.
- **Industrial automation (incl. obsolete/legacy — the canonical part-number vertical):** "1756-L61
  replacement," "what replaces the discontinued PowerFlex 4?", "SLC 500 → CompactLogix migration."
  Pure cross-reference queries with zero OEM-published answers outside gated PDFs — prime
  hallucination territory to monitor.
- **MRO (broadline):** procurement staff already prompt LLMs for supplier discovery; panel prompts
  like "food-grade vs H1/H2 lubricants" surface where an independent house appears in answers
  Grainger's product-listing pages never win.
- **Safety-critical accuracy hooks (the hallucination chapter):** wrong pressure ratings, wrong
  ANSI/ISEA cut levels, a discontinued breaker listed as current, an SKF→NTN bearing interchange
  stated backwards. In these verticals a wrong AI answer costs a customer — the analyst's logging
  is the safety net.
- **Cross-cutting demand line (use once):** 51% of B2B buyers now start research in AI chatbots
  (G2 Buyer Behavior Report, Apr 2025) — the demand-side proof that the answers are worth watching.

### Aliases + relatedTerms (final chosen values)
- **aliases:** `["AI Visibility Analyst", "AI Search Analyst", "GEO Analyst"]`
- **relatedTerms (all confirmed in the published whitelist):**
  `["ai-visibility", "ai-share-of-voice", "llm-citation", "query-fan-out", "generative-engine-optimization"]`
  - `ai-visibility` — the umbrella concept this role measures.
  - `ai-share-of-voice` — the headline competitive metric the analyst reports.
  - `llm-citation` — the unit being tracked (who gets named as the source).
  - `query-fan-out` — why a single buyer intent must become many panel prompts.
  - `generative-engine-optimization` — the discipline the monitoring report sells and feeds.

### Verification notes
- **Demand check (Ahrefs, US):** keyword "ai visibility analyst" returns an empty result set in
  Ahrefs Keywords Explorer (US) — no measurable search volume. This is the expected, documented
  outcome for these role-title queries (the strategy measured "geo specialist" at 40 US vol / KD 0):
  career-path pages are near-zero-volume citation/entity plays, not traffic targets. Not a failure.
- **Verified from §3.5 (use faithfully):** zero standalone in-house postings (verified negative —
  it's a strategic open lane, not a gap); funded tool category (Profound ~$499/mo "popular with
  Fortune 100," Peec ~€89/mo, Otterly ~$29/mo, Scrunch, Ahrefs Brand Radar); Adobe AEM
  brand-visibility product launched; Citizens Bank AEO posting lists Brandlight; duties appear
  inside GEO/AEO postings; role is entry-accessible, likely a duty inside an analyst role; buyer
  framing = $29–499/mo tool + hours/month, "the audit you should ask for before paying anyone for
  GEO."
- **Verified from §3.1 (borrowed, with care):** the ~12% / AI-cited-URLs-vs-rankings gap and the
  visibility-tool prices are consistent across §3.1 and §3.5. If the author cites the
  ranking-vs-citation gap, keep the figure as the docs state it (the GEO path uses "about 12%"; the
  Citation Engineer path's §3.4 source cites "~15% of AI Overview citations come from Google
  top-10" — these are different measurements, don't conflate them; prefer not to lean on either
  unless needed, since this role is about monitoring, not the stat itself).
- **Cross-cutting stat (§04-niches §1):** "51% of B2B buyers now start research in AI chatbots
  (G2 Buyer Behavior Report, Apr 2025)" — verified in the niches doc; safe to use once as the
  demand-side line.
- **Flagged / do not assert:** No salary band for this role — there is none (no standalone
  postings); present cost strictly as tool + hours. Do not imply "AI Visibility Analyst" is a
  hireable standalone title — it's a function. Tool prices (~$499/mo, ~€89/mo, ~$29/mo) are
  approximate per the docs ("~"); keep the tilde. Any prompt-panel size (e.g. "20 prompts") is an
  illustrative operator default, not a sourced threshold — present it as a suggestion, not a
  standard. Use the niche examples as illustrative scenarios (stock examples from 04-niches.md), not
  as claims about a specific named client.
