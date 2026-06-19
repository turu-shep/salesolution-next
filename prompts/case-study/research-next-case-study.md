# Prompt: Research the next case study + emit authoring prompts

**Read `prompts/_CONTEXT.md` and `prompts/case-study/README.md` first.**

## Goal
Decide **which client to write up next** and **whether it's a standalone study or a hub-and-spoke
engagement**, sketch the metrics and disclosure, then **emit filled, ready-to-run authoring
prompt(s)** by completing `author-case-study.TEMPLATE.md` or `author-engagement.TEMPLATE.md`.

This is the generator: you run this once and get back concrete authoring prompts to run next.

## Inputs to gather first
1. **What's already published.** List existing studies + clients so you don't duplicate or
   double-tell a client. `perspective:'raw'` query:
   `*[_type=="caseStudy"]{ _id, title, "slug": slug.current, engagementRole, primaryService,
   disclosure, "client": client->{ _id, name, publicName } } | order(client->name)`.
   Also note which clients already have an anchor.
2. **The candidate work.** The operator's real engagements — the source of truth is the operator,
   not the repo. Ask for (or work from a provided list of) clients, the disciplines run for each,
   the headline numbers, and consent status. The known naming hazard: **Northern Hydraulics** (read
   `docs/strategy/case-studies/fact-ledger.md` — likely overlaps the anonymized "Industrial
   hydraulics distributor" studies; decide consolidation before writing).
3. **Vertical balance.** Per `_CONTEXT.md`, the proof set should span the three verticals
   (industrial e-commerce, home services, dental), not be industrial-only. Prefer a client that
   fills a gap in the current set.

## Decide: standalone vs engagement
- **One discipline → one number → `standalone`.** Use `author-case-study.TEMPLATE.md`.
- **Several disciplines, each with a result worth its own page → engagement** (anchor + cuts). Use
  `author-engagement.TEMPLATE.md`. The anchor owns the aggregate outcome; each cut owns one
  discipline's metric (the credit-split rule, README).
- **One client, several disconnected projects, no shared headline →** separate `standalone` studies
  that share the client doc. No anchor.

## Pick the headline metric(s)
- A **business outcome** with a baseline and a window: leads, revenue, citations. Never traffic or
  rankings as the headline. Exact figures beat round ones.
- For an engagement, define the **aggregate** the anchor owns, then the **single** metric each cut
  owns, and check up front that none collide. If two disciplines both want to claim the lead growth,
  the lead growth is the anchor's — the disciplines own their own intermediate metrics.
- Flag the disclosure mode: `named` only with a public name **and** written consent; otherwise
  `anonymized`; `composite` only if genuinely aggregated, and it must be marked.

## Verify the numbers exist
You are not inventing a case study — you're structuring a real one. Every number must be one the
operator can source (CRM, GA4/GSC, citation tracker, sending platform). If the operator can't source
a figure, leave it out of the plan and note the gap. Do not propose fabricated metrics.

## Output: emit the authoring prompt(s)
For the chosen client, **write a filled copy** of the right template with every `{{PLACEHOLDER}}`
replaced — ready to hand straight to an authoring agent. For an engagement, fill the anchor block
**and** one cut row per discipline, with the owned metric spelled out for each so the credit split
is unambiguous. Save the filled prompt(s) under `prompts/case-study/_generated/` (create the folder
if it doesn't exist; mirrors `prompts/glossary/_generated/`), and list them in your reply.

## Definition of done
- A short recommendation: which client, standalone-vs-engagement (with the reason), the headline
  metric(s), the disclosure mode, and the vertical it fills.
- The credit-split sketch for an engagement: anchor's aggregate + each cut's owned metric, with a
  one-line check that none collide.
- The filled authoring prompt(s) written to `prompts/case-study/_generated/` and named in the reply.
- No Sanity writes here — this prompt only plans and emits. The `author-*` prompts do the writing.
