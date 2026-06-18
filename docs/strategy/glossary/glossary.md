# Glossary — strategy & vision

**Owner:** a.shepel@salesolution.net · **Last updated:** 2026-06-17
**Engineering plan:** [tech-task.md](tech-task.md) (how we get from today's state to the vision)
**Research origin:** the 65-term plan still lives in
[../career-path/05-glossary.md](../career-path/05-glossary.md); the backlog +
service keywords in [../career-path/07-research-backlog.md](../career-path/07-research-backlog.md).
This folder is now the canonical home for glossary strategy going forward.

---

## 1. What the glossary is, and what it's measured on

The glossary (`/glossary/`) is a wiki-like reference hub: one self-contained URL per
AI-search concept, written to be the passage an AI answer engine lifts verbatim and
cites. It is the **traffic + citation engine** of the learning hub — confirmed by the
June-2026 demand reframe, which found the winnable, real-volume terms are the
concept/measurement entries, several at very low KD.

It is **not measured on leads or revenue.** The KPIs are:

- **Referring domains** (Ahrefs).
- **AI citations / AI share of voice** (Brand Radar) for our terms.
- **Third-party reuse** of the terms we coin or define well.

Career/glossary traffic converting poorly is expected, not failure. Money is downstream,
in the service pages the glossary feeds.

## 2. Where it sits — the hub model

```
        career paths  ──┐  (near-zero volume; entity/citation plays)
                        ├──►  GLOSSARY  ──►  service pages / book-a-call
   blog / guides  ──────┘   (the citation engine)      (where money is)
```

- **Career paths borrow authority; the glossary accrues it.** Career paths are
  near-zero-volume entity plays. Their main SEO job is to funnel link equity and topical
  context **into** the glossary (today via the "Key terms in this path" rail —
  [PathTerms.tsx](../../../components/sections/career-path-detail/PathTerms.tsx)).
  So "improve the glossary" *is* "make the career-path strategy pay off."
- **The glossary should funnel back out** to career paths and service pages — especially
  from the role and measurement clusters. Today this is mostly one-way (career → glossary).
  Making it bidirectional is part of the vision (§5).
- **Vertical saturation lives in the examples.** Every entry leads with an industrial
  e-commerce example (hydraulics cross-refs, MRO part numbers, PIM data, distributor
  catalogs — see [../career-path/04-niches.md](../career-path/04-niches.md)) so the hub
  reinforces the *vertical*, not just the discipline.

## 3. Current state (2026-06-17)

- **50 published terms** (batch-2 30 published 2026-06-18 via
  [publish-glossary-batch2.mjs](../../../scripts/publish-glossary-batch2.mjs)). Seed scripts:
  [seed-glossary.mjs](../../../scripts/seed-glossary.mjs) (batch 1) and
  [seed-glossary-batch2.mjs](../../../scripts/seed-glossary-batch2.mjs) (the 30, with humanized
  prose in [_batch2-prose.json](../../../scripts/_batch2-prose.json)). (The original 20 also
  have a pending humanizer-draft pass — a separate workstream.)
- **Clusters:** `ai-search-core`, `measurement`, `technical`, `industrial-ecommerce`,
  `roles` (schema: [glossary-term.ts](../../../sanity/schemas/glossary-term.ts)).
- **Voice:** operator register, **humanized** (the 30 were written with the humanizer
  rules applied; the original 20 have a humanizer draft pass pending — see
  `~/.claude/skills/humanizer/SKILL.md`).
- **Linking today:** inline term references (`glossaryRef`) render as **real crawlable
  links with an in-page hovercard preview** (M1 shipped 2026-06-17 —
  [GlossaryHovercard.tsx](../../../components/portable-text/GlossaryHovercard.tsx), wired in
  [PortableTextRenderer.tsx](../../../components/portable-text/PortableTextRenderer.tsx));
  `ai-share-of-voice` is the live example (inline links → `ai-visibility`, `llm-citation`).
  Bottom-rail cross-linking also exists (`PathTerms`,
  [GlossaryRelated.tsx](../../../components/sections/glossary/GlossaryRelated.tsx)).
- **Known gaps:** ~~(a) the 30 drafts aren't published~~ **done** (50 live);
  ~~(b) inline termLinks missing~~ **done** (auto-linker re-run post-publish — ~67 links across
  glossary terms + career paths + posts); ~~(c) no hovercard~~ **done**;
  ~~(d) no funnels glossary → career paths/services~~ **done** (M4 — `relatedResources` rail on
  9 role/measurement/catalog terms); (e) no interactive aids on any term; (f) the hub is flat.

## 4. Locked decisions (do not relitigate without the owner)

- **Citation/authority play, not volume SEO.** Low-DR site; we win definitional AI
  citations where nobody big competes.
- **"Citation engineering" is not ours to coin** — frame as "a citation-focused slice of
  GEO/AEO," always disambiguated from local-SEO "citation building."
- **Role terms carry no recruiting framing** — pure authority/citation. Title variants
  (AI SEO specialist, AEO specialist, AI visibility analyst) consolidate onto one canonical
  page (`ai-search-specialist`), not thin per-title pages.
- **Glossary lives at top-level `/glossary/`** (terms serve the whole site).
- **Entry template** (see [glossary-term.ts](../../../sanity/schemas/glossary-term.ts) +
  the author template [prompts/glossary/author-term.TEMPLATE.md](../../../prompts/glossary/author-term.TEMPLATE.md)):
  `shortDefinition` (the load-bearing ≤60-word quotable answer; renders first, feeds
  DefinedTerm JSON-LD) → body: **"Why it matters"** (lead with the industrial example) →
  optional **"X vs Y" / "How to measure it"** fan-out subhead → **"In practice."**
- **Verify before publishing.** Definitions and stats checked against current sources;
  never publish a fabricated real-world example — use a clearly-illustrative scenario.
- **Linking = real link + hovercard (new, §5.1).** The crawlable `<a>` is the SEO asset;
  the hovercard is a retention layer on top of it, never a replacement.
- **Interactive aids assessed per term (new, §6).** Every term is evaluated for whether a
  calculator/converter/lookup/scorecard/formula would make it more useful and more citable;
  if so, we build it. Build time is **not** a constraint here (owner's call).

## 5. The vision — the upgraded glossary

### 5.1 Linking pattern: real link + hovercard (the SEO reasoning)

**Decision: keep every inline term as a real crawlable link, and add a hovercard /
side-panel that shows the `shortDefinition` inline without navigating away.**

Why, precisely — because it's easy to get backwards:

1. **SEO/citation value comes from the real `<a href>`, not the panel.** Internal links
   pass equity, drive crawl discovery, and build the entity relationships that make a
   low-DR term page citable. A JS-only onClick popover with no anchor throws that away.
2. **The panel adds no *direct* ranking value** — only engagement (less pogo-sticking,
   longer dwell, reading flow kept intact). Soft signals at best.
3. **But it has large *indirect* value:** the only reason to ration inline links is fear
   of sending readers away. The hovercard removes that fear, so we link **far more
   aggressively inline** — and more inline links with good anchor text *is* the real
   SEO/citation lever. The panel's job is to make heavy inline linking painless.
4. **It protects against duplicate content.** Never statically render a term's full
   definition into every host page (40 copies of the same paragraph dilutes the canonical
   term page). The hovercard shows only the one-sentence `shortDefinition`; the canonical
   entry + `DefinedTerm` schema stays on the term page.
5. **AI crawlers mostly don't run JS.** They see the static `<a>` + anchor text, not the
   panel. So the link is what gets followed and cited; the panel is a human-UX bonus.

Behaviour: desktop hover / mobile tap → panel with `shortDefinition` + "Open term page →"
(new tab, so the reader keeps their place). SSR renders a normal link for no-JS/crawlers.

### 5.2 Inline termLinks everywhere

Every time a glossary term (or alias) appears in a glossary body, a career path, a guide,
or a service page, its first occurrence should be an inline `glossaryRef`. This is the
compounding asset for low-DR term pages. Paired with the hovercard, it costs the reader
nothing. (Automate via an auto-linker pass — see tech task M3.)

### 5.3 Bidirectional funnels

Role and measurement terms link **out** to the career paths and the relevant service pages
(e.g. `geo-specialist`/`ai-search-specialist`/`citation-engineer` → the career paths +
Catalog AI / GEO service pages), so authority circulates instead of pooling.

### 5.4 Cluster hubs

Group the flat hub by cluster, with short cluster intros (own crawlable hub surfaces that
consolidate a cluster and can themselves be cited). Optional per-cluster landing pages
with `DefinedTermSet` schema.

### 5.5 Fan-out subheads on every entry

Backfill the "X vs Y" / "How to measure it" comparison subhead on the original 20 (the new
30 mostly have them) — the pattern reported ~161% more likely to be cited.

### 5.6 Interactive aids where a term warrants one

See §6. This is the biggest new capability: turn definitional pages into tools where the
concept is computational, standards-based, or self-assessable.

## 6. Interactive aids — part of the term lifecycle

**Rule: assessing whether a term needs an interactive aid is a required step when creating
OR updating any term.** Build time is not a blocker. Calculators, converters, lookups, and
scorecards are durable link magnets and native AI-answer fodder ("calculate X", "convert
X", "X equivalent of Y" are prompts engines answer from tools), they deepen dwell time, and
they reinforce the industrial vertical — and they double as pre-sold demos of the service.

### 6.1 The assessment gate

For each term, ask: **would a reader otherwise reach for a calculator, a conversion chart,
a lookup, or a checklist to act on this concept?** Build an aid if **any** trigger holds:

- **Computation** a buyer would do by hand → **calculator** (share-of-voice %, citation
  rate, impression share, ROI, sizing).
- **Input→output via a standard/lookup** → **converter / interactive cross-reference**
  (thread types NPT/JIC/ORFS, ETIM/UNSPSC class lookup, grade/interchange equivalence,
  refrigerant retrofit).
- **Self-assessment / readiness** concept → **scorecard / weighted checklist** (AI-ready
  catalog, crawlability for AI bots).
- **A formula is core to understanding it** → **formula card** (the formula + an editable
  worked example).

**Don't force one.** Purely definitional/conceptual or reference-only head terms
(`answer-engine`, `generative-engine`, `grounding`, `ai-mode`) get no tool. A bad tool is
worse than none.

Record the outcome on the term so the gate is auditable (schema field
`interactiveAidStatus`: `not-assessed | none-needed | planned | built`, plus `toolKey` —
tech task M6).

### 6.2 Tool archetypes

1. **Calculator** — numeric inputs → metric out.
2. **Converter / unit reference** — value in one standard → equivalents.
3. **Interactive lookup / cross-reference** — filter/search a dataset (the citable
   interchange data from [../career-path/04-niches.md](../career-path/04-niches.md)).
4. **Scorecard / readiness checklist** — weighted yes/no → score + recommendations.
5. **Decision tree / selector**.
6. **Formula card** — formula + worked example, optionally editable.

Reuse the existing calculator pattern:
[FunnelCalculator.tsx](../../../components/sections/revenue-engine/FunnelCalculator.tsx),
[HomeV2Calculator.tsx](../../../components/sections/v2-1/HomeV2Calculator.tsx).

### 6.3 Starter candidate map (strong tool fits among the 50)

| Term(s) | Aid | Type |
|---|---|---|
| ai-share-of-voice, ai-impression-share, mention-rate-vs-citation-rate, ai-citation-tracking | One **AI visibility calculator** (mentions/citations/total prompts → SoV %, citation rate, mention rate, impression share) | Calculator |
| ai-ready-product-catalog, crawlability-for-ai-bots | **"Is your catalog AI-ready?" scorecard** (weighted checklist → score + fixes) | Scorecard |
| benchmark-prompts | **Prompt-set builder** (assemble + export a category prompt list) | Selector |
| normalized-attributes, spec-sheet-content | **Attribute/units normalizer demo** (messy inputs → normalized) | Formula/converter |
| part-number-cross-reference, content-chunking-for-retrieval | **Interactive cross-reference / chunk preview** | Lookup |
| etim-classification | **ETIM/UNSPSC class lookup** | Lookup |
| zero-click-search | **Zero-click impact estimate** (impressions × zero-click rate) | Calculator |

(Industrial converters — thread/pressure/flow, insert-grade equivalence — are strong
standalone link magnets too; spec as `/tools/<key>` pages that also embed in the term.)

## 7. Term lifecycle (create / update)

1. **Research + prioritize** ([prompts/glossary/research-next-terms.md](../../../prompts/glossary/research-next-terms.md)).
2. **Author as draft** ([author-term.TEMPLATE.md](../../../prompts/glossary/author-term.TEMPLATE.md)),
   humanized, with the industrial example and fan-out subhead.
3. **Assess interactive aid (§6)** — decide none-needed / planned / built; set the status field.
4. **Wire inline termLinks** to sibling terms (auto-linker, M3).
5. **Verify facts**, then **operator review/voice** in `/studio`.
6. **Publish**, confirm live (HTTP 200 + known phrase), confirm counts, update
   [../career-path/07-research-backlog.md](../career-path/07-research-backlog.md) and this doc's §3.

## 8. Success signals

- Referring domains to `/glossary/*` trending up.
- Our terms appearing as cited sources in Brand Radar / AI answers for the category.
- Third parties reusing our coined/defined terms.
- (Secondary) dwell time + glossary→service click-through once funnels (§5.3) ship.
