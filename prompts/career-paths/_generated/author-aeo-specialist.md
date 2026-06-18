# Prompt: Author ONE career path (draft) — AEO Specialist

> Generated, ready-to-run. **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's
> substance: `docs/strategy/career-path/03-roles.md` (section 3.2) + `docs/strategy/career-path/04-niches.md`.
> Everything you need is inlined at the bottom of this file under "Source material for this role" —
> the prompt is self-contained.

## Role to author
- **Title:** AEO Specialist
- **Slug:** `aeo-specialist`  (kebab-case — glossary may have a same-named term;
  routes differ (`/career-paths/aeo-specialist` vs `/glossary/answer-engine-optimization`), so that's fine)
- **Role line ("For"):** SEO/content leads owning answer-share and the accuracy of what AI says about safety-critical products
- **Level:** Mid  (Entry | Mid | Senior — drives the "Start here" marker on Entry)
- **Aliases (real job titles):** ["Answer Engine Optimization Manager","GEO/AEO Manager","AEO Manager","SEO/AEO Specialist"]
- **Industrial flavor (what changes inside a distributor):** Industrial buying is question-shaped ("NPT vs BSPP," "can I substitute brand A's seal kit"). AEO is the discipline of owning the answer — and in safety-critical categories the answer is a liability surface: pressure ratings, chemical compatibility, A2L refrigerant crosses. Distributors with application-engineering desks have a content moat agencies can't fake.
- **Related glossary terms to link:** ["answer-engine-optimization","answer-engine","generative-engine-optimization","ai-visibility","query-fan-out"]

## Task
Create ONE `careerPath` **draft** (`drafts.career-aeo-specialist`) following the established schema
(`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs`. Build portable-text with unique `_key`s. Pull the role's real
substance (responsibilities by seniority, skills/tools, buyer framing, salary evidence) from
`docs/strategy/career-path/03-roles.md` — don't invent it. The verified substance is inlined below.

### Fields to set
- `title`, `slug`, `role` (the role line above), `level` (`Mid`), `duration` ("Self-paced"),
  `aliases`, `status:'drafting'`, `lastReviewed` (today), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial.
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete
  things, drawn from `03-roles.md`. This is the "how the role improves by seniority" core.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC).
  Open with a 1-paragraph intro. Then ~4–6 chapters covering the real work of the role in
  industrial e-commerce. **Each chapter ends with a `callout` (tone `tip`) "test it on your own
  site" prompt** — the format signature.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. This is the only revenue-touching surface (MarketerHire pattern): speak to the
  distributor deciding **hire vs agency vs fractional**, with honest cost reality from
  `03-roles.md` salary evidence. Keep the "we don't hire from these paths" stance — this section
  is buyer guidance, NOT recruiting.
- **`relatedTerms`** — references to the five slugs above (`{_type:'reference',
  _ref:'glossary-<slug>'}`; targets are published so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt.
Industrial examples throughout (hydraulics cross-refs, MRO part numbers, PIM, distributor
catalogs — `04-niches.md`). Verify any factual claim (salary bands, named postings, stats).
Locked decisions stay intact: "we don't hire from these paths"; "citation engineering" is a
citation-focused slice of GEO/AEO, not ours to coin; AEO is a discipline within the AI-search
family, bought as part of an engagement — don't relitigate any of this.

## Definition of done
- Draft `drafts.career-aeo-specialist` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.

---

## Source material for this role (verified — pulled from docs/strategy/career-path/03-roles.md + 04-niches.md)

Everything below is inline so the downstream author agent never has to leave this file. Substance is
faithful to the docs; numbers are quoted exactly. Use it; don't invent around it.

### Lede seed (operator voice — doubles as a standalone, quotable definition)

> Answer engine optimization is owning the answer, not the ranking — making sure that when a buyer
> asks an AI assistant a question, your catalog supplies the response and the response is correct.
> In safety-critical industrial categories the answer is a liability surface, so AEO is half
> answer-share strategy and half accuracy governance over what the machine says about your products.

Keep `description` to one or two sentences of that, tuned industrial. Example tone:
"AEO is making your catalog the answer when buyers ask AI assistants question-shaped queries —
'NPT vs BSPP,' 'can I substitute this seal kit' — and governing that the answer is accurate, which
in pressure ratings and chemical compatibility is a liability, not a vanity metric. For SEO/content
leads moving into answer-share."

### Seniority matrix (Entry / Mid / Senior)

**Entry** — *focus:* Learn the answer surfaces and make pages machine-readable. You are an SEO or
content person adding AEO literacy; note honestly that no entry-level AEO posting exists — every one
wants 3+ yrs prior SEO, so the on-ramp is junior SEO/content + self-taught AI-search literacy.
`mustLearn`:
- How answer engines (ChatGPT, Perplexity, Gemini, Google AI Overviews) pull a single answer from a page rather than ranking a list
- Writing concise, self-contained, extractable answers — Q&A structure an engine can lift whole
- Machine-readability basics: FAQ/Q&A schema, HTML tables over PDFs and JS widgets
- Running prompt audits — what engines currently answer for your category's real buyer questions

**Mid** — *focus:* Own answer-share execution for a brand or client portfolio (this is where the
title actually lives — Stackmatix puts the manager band at $100–174K). `mustLearn`:
- Setting machine-readability standards across the catalog: Q&A structure, concise extractable answers at template scale
- Mapping the real question set buyers ask ("NPT vs JIC vs ORFS," "Grade 8 vs Class 10.9") to the pages that should answer them
- Measurement beyond rankings and clicks — answer-share / mention rate across four or five engines
- First-pass accuracy governance: catching when an engine states your spec, rating, or compatibility wrong

**Senior** — *focus:* Set answer-share strategy and own accuracy/compliance governance — the
Citizens Bank charter was to build an AEO Center of Excellence (7–10+ yrs, $131–171K + bonus).
`mustLearn`:
- Building the AEO measurement framework and reporting it as an owned outcome, not a side metric
- Standing up accuracy/compliance governance for what AI says about safety-critical products — pressure ratings, chemical compatibility — as a documented process
- Deciding where AEO sits against GEO and classic SEO in resourcing (postings hybridize: GEO/AEO, SEO/AEO)
- Educating the org — answer-share is a teaching function, and application engineers are the source

### Suggested chapter outline (4–6 H2 chapters; each closes with a "test it on your own site" tip callout)

1. **AEO is owning the answer, not the ranking** — what AEO is, how it sits inside the GEO/AEO/SEO
   family, why answer-share is a different target than a blue-link ranking. *Tip:* ask one real
   buyer question on two engines — are you the answer, a footnote, or absent?
2. **Industrial buying is question-shaped** — the whole case for AEO at a distributor: buyers ask
   "NPT vs BSPP," "can I substitute brand A's seal kit," "what replaces a discontinued PowerFlex 4."
   These are answer queries, not catalog browses. *Tip:* list the ten questions your application desk
   answers by phone every week — that's your AEO target set.
3. **Make pages answer one question cleanly** — machine-readability standards: Q&A structure, one
   self-contained paragraph that answers the whole question, FAQ schema, HTML tables not PDFs/JS
   widgets. *Tip:* take your best spec page — can one paragraph stand alone as a complete answer to a
   buyer's question? If not, rewrite one until it can.
4. **The application-engineering moat** — the content agencies can't fake: a 30-year application
   engineer's knowledge, published as sizing guides, failure-mode explainers, cross-reference and
   compatibility tables. This is the answer no marketplace owns. *Tip:* pick one question only your SMEs
   can answer well, publish the answer as crawlable HTML, and check in a week whether an engine starts using it.
5. **Govern the answer (safety-critical accuracy)** — the part that's unique to AEO in industrial:
   the answer is a liability surface. Pressure ratings, chemical compatibility, A2L refrigerant crosses.
   Monitor for wrong/misattributed answers and run corrections as a process, not a one-off. *Tip:* run
   your three highest-stakes spec claims through ChatGPT and Perplexity — is each stated correctly,
   wrongly, or credited to a competitor? Log it.
6. **Measure answer-share, not rankings** — you can't use rankings here; build a fixed set of real
   buyer questions, run them on a schedule, and track answer/mention rate and share-of-voice across
   four or five engines against named competitors. *Tip:* build a 20-question set from your application
   desk's real call log; run it monthly; track your answer share against two named competitors.

(Use 5–6 of these; the GEO and Citation Engineer pages run 5 chapters plus intro — match that depth.)

### Buyer section seeds

- **whatTheyDo (1 sentence):** An AEO specialist makes your catalog the answer when buyers ask AI
  assistants question-shaped queries, sets the machine-readability standards that let engines lift
  those answers, and governs that the answer is accurate — which in safety-critical categories is
  compliance work, not a vanity metric.
- **signsYouNeedOne (3–4 bullets):**
  - Buyers ask AI assistants application questions ("can I substitute this seal kit," "NPT vs BSPP") and your catalog isn't the answer
  - Your application-engineering desk answers the same questions by phone all day but none of it is published in a form an engine can read
  - AI assistants state your products' specs, pressure ratings, or compatibility wrong — and you have no process to catch or correct it
  - You measure rankings and clicks but have no read on answer-share — what engines actually say when buyers ask
- **inHouseVsAgency (honest hire-vs-agency-vs-fractional, portable text — 2 short paragraphs):**
  - "Don't hire a dedicated AEO specialist. The postings themselves don't believe in it — they
    hybridize (GEO/AEO, SEO/AEO), and the one true standalone charter on the board (Citizens Bank's
    AEO Manager, building a Center of Excellence) is a bank-scale role. For a distributor, AEO is a
    discipline you buy inside a GEO or AI-search engagement, not a seat you fill."
  - "What you can't outsource is the moat: the application engineer's knowledge and the accuracy
    judgment on safety-critical specs. Keep the SME and the sign-off in-house; buy the structuring,
    monitoring, and answer-share measurement as an outcome. If you only hire one search person, make
    it a hybrid who owns SEO + GEO + AEO together — not an AEO-only specialist."
- **costReality (figures from 03-roles.md, sources named):** Hard salary evidence exists but the
  title rarely stands alone. Citizens Bank's Answer Engine Optimization Manager posting runs
  $131–171K + bonus (7–10+ yrs, charter to build an AEO Center of Excellence). Stackmatix's AEO
  guide bands it lower for most orgs: ~$75–95K specialist, $100–174K manager; ZipRecruiter lists AEO
  contract work at $43–48/hr. For a distributor, that's a reason to buy AEO inside a GEO retainer
  rather than carry a dedicated salary — you're paying for an outcome and the in-house cost is the
  SME time, not a new headcount.

### Industrial angle (concrete niche examples to use — from 04-niches.md)

The through-line: **industrial buying is question-shaped, and the answers live in cross-reference /
interchange / compatibility content distributors already own in PIM/ERP but rarely publish in a
readable form.** Use these concrete examples (don't fabricate beyond them):
- **Hydraulics & pneumatics (P0, densest cross-ref vertical):** "NPT vs JIC vs ORFS," "Gates
  equivalent of Parker 387 hose," "seal kit for a Char-Lynn 104 motor." Small distributors
  (Discount Hydraulic Hose, HFI, Tompkins) already publish interchange charts — exactly what answer
  engines lift. The stock example: a regional Parker distributor whose Parker-to-Gates interchange
  chart becomes the answer Perplexity gives, beating Parker's own JS crossref tool because it's
  crawlable HTML.
- **Industrial automation aftermarket (P0, the part-number vertical):** "1756-L61 replacement,"
  "what replaces the discontinued PowerFlex 4?", "SLC 500 → CompactLogix migration." Pure
  cross-reference questions with zero OEM-published answers outside gated PDFs (Radwell, Galco).
- **MRO broadline (P0):** a "food-grade vs H1/H2 lubricants" decision table is the answer ChatGPT
  gives that Grainger's product-listing pages never win.
- **Safety-critical accuracy examples (the governance chapter):** pressure ratings; chemical
  compatibility; fasteners "Grade 8 vs Class 10.9," "A2 vs A4"; PVF standards "API 600 vs 602,"
  "Class 150 vs 300 at temperature"; PPE "ANSI cut level for sheet metal," "NFPA 70E category for
  480V"; HVAC/R "R-410A → R-454B retrofit," the 2025 A2L transition. These are the queries where a
  wrong AI answer is a liability, which is why governance is the AEO-specific deliverable.
- **The moat line:** distributors with application-engineering desks have a content moat agencies
  can't fake (03-roles.md, 3.2). The 30-year application engineer's knowledge is the only content
  competitors and LLMs can't access (03-roles.md, 4.3).

Optional demand-side proof line (from 04-niches.md, use sparingly): 51% of B2B buyers now start
research in AI chatbots (G2 Buyer Behavior Report, Apr 2025).

### Aliases + relatedTerms (final chosen values)

- **aliases:** `["Answer Engine Optimization Manager","GEO/AEO Manager","AEO Manager","SEO/AEO Specialist"]`
- **relatedTerms (all confirmed on the published whitelist):**
  `["answer-engine-optimization","answer-engine","generative-engine-optimization","ai-visibility","query-fan-out"]`
  - `answer-engine-optimization` — the discipline this page is named for.
  - `answer-engine` — the surface AEO targets; readers need the noun.
  - `generative-engine-optimization` — the sibling discipline; the page must place AEO inside the GEO/AEO family.
  - `ai-visibility` — the measurement frame for answer-share.
  - `query-fan-out` — why one question becomes many sub-queries; central to "question-shaped buying."
  - (Considered and dropped: `llm-citation` — strong, but it belongs more to the Citation Engineer
    page; AEO's emphasis is answer-share + accuracy, so the five above are tighter. Swap it in only if
    you cut one of the above.)

### Verification notes (verified vs flagged)

**Verified against 03-roles.md (3.2) and treated as ground truth — quote exactly:**
- Citizens Bank "Answer Engine Optimization Manager," $131–171K + bonus, 7–10+ yrs, charter to build
  an AEO Center of Excellence.
- Also-named postings: Hawksford (GEO/AEO Manager), Veuno, Curate Partners, IRA Financial;
  ZipRecruiter AEO at $43–48/hr; Stackmatix guide $75–95K specialist, $100–174K manager.
- Core work: answer-share strategy; machine-readability standards (Q&A structure, concise extractable
  answers); measurement beyond rankings/clicks; accuracy/compliance governance of what AI says about
  the brand — emphasized in safety-critical industrial contexts (pressure ratings, chemical compatibility).
- Buyer framing: don't hire dedicated AEO — postings hybridize (GEO/AEO, SEO/AEO); define it as a
  discipline within the AI-search family, bought as part of an engagement.
- "No entry-level GEO/AEO postings — every one requires 3–10 yrs prior SEO" (03-roles.md, key
  finding #4) — used to frame the Entry row honestly.

**Verified against 04-niches.md — used as illustrative stock examples (not customer claims):**
Parker-to-Gates interchange, Char-Lynn 104 seal kit, NPT/JIC/ORFS, 1756-L61 / PowerFlex 4 /
SLC 500→CompactLogix, food-grade vs H1/H2 lubricants, R-410A→R-454B / A2L transition, fastener and
PVF/PPE standards decoding. All are documented niche patterns, not named customers.

**Flagged / handle with care:**
- 51% of B2B buyers start research in AI chatbots — real (G2 Buyer Behavior Report, Apr 2025) but a
  demand-side stat; attribute it if used, don't lean the page on it.
- Stackmatix specialist/manager bands ($75–95K / $100–174K) come from a vendor guide, not a named
  posting — present as "a guide bands it at," not as observed pay. The Citizens figure is the hard
  posting-backed number; anchor on it.
- Do NOT invent a "real-world example" with a named customer. Everything industrial here is an
  illustrative scenario drawn from the niche pool, exactly as the GEO and Citation Engineer pages did.
- Demand check (Ahrefs, US, 2026-06-15): "aeo specialist" = 60 US volume / 150 global, KD too low to
  score; "aeo manager" = 0 US / 10 global; "answer engine optimization manager" returned no row.
  Near-zero, as expected — these are citation/entity plays, not traffic targets (benchmark: "geo
  specialist" 40 US / KD 0). This is fine and on-strategy; do not optimize the page for volume.
