# /prompts/glossary — operator playbooks for the glossary

Reusable, self-contained task prompts for growing and maintaining the AI-search **glossary**
(`/glossary/`) on salesolution.net. Each file is a brief you hand to an AI coding agent running
**inside this repo**. They assume no memory of how the system was built and point the agent at the
context it needs.

**Read `prompts/_CONTEXT.md` first, every run** (the shared backbone: company, voice, Sanity
workflow, gotchas). The full strategy + the M0–M6 build plan live in
[`docs/strategy/glossary/`](../../docs/strategy/glossary/) (`glossary.md` = strategy/vision,
`tech-task.md` = the engineering plan). This README adds the glossary-specific model on top.

## Local-only — never web-served
Like the rest of `/prompts`, this folder lives at the repo root and is in `.vercelignore`, so
Next.js never routes it and it never ships to the web. It IS committed to git. Use it locally.

---

## What a glossary term is here (the model the schema encodes)

One **concept per document, one URL per concept** (`sanity/schemas/glossary-term.ts`). What makes
one good is baked into the fields so it isn't left to memory:

- **`shortDefinition` is load-bearing.** One neutral, promo-free sentence answering "What is X?",
  ≤ 60 words. It renders first, feeds the `DefinedTerm` JSON-LD, and is the passage an AI engine
  lifts verbatim. If the term collides with another meaning, disambiguate in the first sentence.
- **`body`** leads "Why it matters" with an **industrial e-commerce example** (vertical
  saturation — pull from `docs/strategy/career-path/04-niches.md`), then an optional "X vs Y" /
  "How to measure it" fan-out subhead, then "In practice."
- **`cluster`** (ai-search-core | measurement | technical | industrial-ecommerce | roles) drives
  the hub grouping + the `/glossary/cluster/<slug>/` pages.
- **`opportunity`** (own | contest | reference-only) is editorial prioritization, not rendered.
- **`relatedTerms`** (→ other terms) and **`relatedResources`** (→ career paths / service pages,
  the outbound funnel) are the cross-link mesh.
- **`enrichments[]` + `interactiveAidStatus`** — the optional interactive aids (calculators,
  scorecards) and the auditable "has this term been assessed for one?" gate. See
  [`prompts/tools/`](../tools/).

The honest thesis (don't lose it): the glossary is measured on **referring domains + AI citations**,
not leads. It's a citation/authority play on winnable low-KD concept terms + the industrial
intersection terms nobody else owns.

---

## The prompts (the term-authoring lifecycle)

| Prompt | What it does |
|---|---|
| `research-next-terms.md` | Pick the next terms from the 65-term plan, re-check demand (Ahrefs), prioritize, and **emit a filled authoring prompt per term**. The generator. |
| `author-term.TEMPLATE.md` | Template: author ONE `glossaryTerm` draft (humanized, industrial example, fan-out subhead). |
| `verify-and-publish-terms.md` | Adversarially fact-check the drafts, humanize the prose, then publish into Sanity. |
| `_generated/` | The ready-to-run authoring prompts emitted by `research-next-terms.md` (one per term). |

### The generator pattern
`research-next-terms.md` researches what to write next, then **emits ready-to-run authoring
prompts** into `_generated/` by filling `author-term.TEMPLATE.md`. Run ONE research prompt, get
back N concrete authoring prompts, run those, then verify-and-publish.

### Suggested order
1. `research-next-terms.md` → pick the next batch, get filled prompts in `_generated/`.
2. Run each `_generated/author-<slug>.md` → drafts land in Sanity for review.
3. Operator reviews/voices in `/studio` → Glossary.
4. `verify-and-publish-terms.md` → fact-check + humanize + publish.
5. **Re-run the auto-linker** after publishing (`node scripts/glossary-autolink.mjs --write`) so
   the new terms get inline links to/from the rest of the hub.

---

## Beyond authoring — the built features and their tooling

The glossary is more than term pages. These shipped via scripts (no prompt file needed); re-run
them as content grows:

| Capability | Tooling | Notes |
|---|---|---|
| Seed term drafts | `scripts/seed-glossary.mjs` (batch 1), `scripts/seed-glossary-batch2.mjs` (+30, prose in `scripts/_batch2-prose.json`) | `createOrReplace` — **don't re-run after Studio edits**. |
| Publish drafts → live | `scripts/publish-glossary.mjs`, `scripts/publish-glossary-batch2.mjs` | Promotes drafts; idempotent. |
| Inline term hovercards | `components/portable-text/GlossaryHovercard.tsx` (M1/M2) | Real `<a>` + in-page preview. |
| Auto-link terms inline | `scripts/glossary-autolink.mjs` (M3) | Dry-run default; `--write` to commit. Re-run after each publish. Manual one-off: `scripts/glossary-add-inline-links.mjs`. |
| Outbound funnels | `scripts/glossary-related-resources.mjs` (M4) | Sets `relatedResources` (→ paths/services). |
| Cluster hubs | `app/(site)/glossary/cluster/[cluster]/page.tsx` (M5); cluster meta in `lib/glossary-config.ts` | Per-cluster `DefinedTermSet` pages. |
| Interactive aids | `scripts/glossary-enrichments.mjs` (M6) + `prompts/tools/` | Attaches calculators/scorecards. |
| Inspect drafts/counts | `scripts/verify-glossary.mjs` | Uses `perspective: 'raw'`. |

---

## How to use a prompt
1. Work **inside this repo** (the agent needs filesystem + `.env.local`).
2. Open the prompt, copy its contents, hand it to the agent. Start the run with: **"Read
   `prompts/_CONTEXT.md` first."**
3. For `author-term.TEMPLATE.md`: replace every `{{PLACEHOLDER}}`, or let `research-next-terms.md`
   fill it for you into `_generated/`.

## Gotchas specific to the glossary (the rest are in `_CONTEXT.md`)
- **Sanity's default query perspective is `published` — it HIDES drafts.** Use
  `perspective: 'raw'` in a script to see draft counts (this is why a count can look like 0).
- **Interlinked drafts need WEAK references** (`_weak: true`) if the targets aren't published yet,
  or the write fails referential integrity. The auto-linker links only to PUBLISHED terms so its
  refs always resolve.
- **A new doc type is invisible in Studio until added to `sanity/structure.ts`** (glossaryTerm is
  already there).
- **`@sanity/client` is not a top-level dep** — import `createClient` from `next-sanity` in scripts.
- **Re-run the auto-linker after any publish** (including when the operator publishes the original-20
  humanizer drafts) — newly published terms only become link targets once live.
- **Verify facts before publishing.** Definitions + stats checked against current sources; never
  publish a fabricated real-world example — use a clearly-illustrative scenario instead.
- **`next build` clobbers a running `next dev` `.next`** — don't run a build while the dev server is
  up (recover with `pkill -f "next dev"; rm -rf .next; npm run dev`).
