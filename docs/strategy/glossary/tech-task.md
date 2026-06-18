# Glossary — engineering tech task (path to the vision)

**Companion to:** [glossary.md](glossary.md) (strategy). This is the build plan to get the
glossary from today's state (§3 of the strategy) to the vision (§5–6).
**Last updated:** 2026-06-17.

> Conventions: content lands as **drafts** for operator review (the
> agent-drafts → operator-reviews → publish workflow); scripts are `node scripts/<name>.mjs`
> with env from `.env.local`; new Sanity doc/field/block types must be registered in
> [sanity/schemas/index.ts](../../../sanity/schemas/index.ts) and (for doc types) surfaced in
> [sanity/structure.ts](../../../sanity/structure.ts). Hard gotchas live in
> [prompts/_CONTEXT.md](../../../prompts/_CONTEXT.md).

## Milestones (sequenced; each shippable on its own)

| # | Milestone | Depends on | Effort |
|---|---|---|---|
| M0 | Publish the 30 drafts + humanizer pass on the 20 | — | S |
| M1 | Hovercard / side-panel for `glossaryRef` | M0 | M |
| M2 | Resolve `shortDefinition` on `glossaryRef` in GROQ | — | S |
| M3 | Inline termLinks everywhere (auto-linker) | M1, M2 | M |
| M4 | Bidirectional funnels (glossary → career paths / services) | M0 | S–M |
| M5 | Cluster hubs | M0 | M |
| M6 | Interactive-aids framework + first tools | M0 | L |

M2 is a prerequisite for M1's payload but is tiny; do them together.

---

## M0 — Publish the 30 + humanize the 20  ✅ Publish-30 done 2026-06-18

**Status:** the batch-2 30 are published (50 live terms) via
[publish-glossary-batch2.mjs](../../../scripts/publish-glossary-batch2.mjs) (promotes drafts →
published; idempotent). The auto-linker (M3) was re-run afterward to light up the new terms.
Still pending: applying the original-20 humanizer drafts (separate workstream).

**Goal:** the hub holds 50 live terms, all humanized.

- Operator reviews/voices the 30 drafts in `/studio` → Glossary, then publishes
  (per [prompts/glossary/verify-and-publish-terms.md](../../../prompts/glossary/verify-and-publish-terms.md)).
- Apply the pending humanizer drafts to the original 20 (tooling:
  `scripts/_humanize-{slots,prep,apply}.mjs`, `--write` to commit).
- On publish, weak refs (`_ref: glossary-<slug>`, `_weak:true`) resolve automatically;
  terms enter [app/sitemap.ts](../../../app/sitemap.ts).

**Acceptance:** `/glossary/` lists 50; each term page returns 200 with its `shortDefinition`
visible; `definedTermSchema` present in page source; no draft left unreviewed.

---

## M1 + M2 — Hovercard for inline term references  ✅ Shipped 2026-06-17

**Status:** done and visually QA'd on `ai-share-of-voice` (the test term, now carrying two
inline termLinks → `ai-visibility`, `llm-citation`). Files: GROQ in
[sanity/lib/queries.ts](../../../sanity/lib/queries.ts) (`BODY_WITH_LINKS` now resolves
`term` + `shortDefinition`); component
[components/portable-text/GlossaryHovercard.tsx](../../../components/portable-text/GlossaryHovercard.tsx);
wired in [PortableTextRenderer.tsx](../../../components/portable-text/PortableTextRenderer.tsx);
affordance + `fade-in` in [app/globals.css](../../../app/globals.css) (`.gloss-term`). SSR
emits real `<a href>`; desktop hovercard flips above near the bottom; mobile bottom sheet
(brand-tint idiom, full-width action, top-right ✕, safe-area). Verified: SSR anchors present
with JS off; tsc clean. Run `npx next build` separately (not while `next dev` holds `.next`).

**Goal:** an inline term shows its definition in a hovercard/side-panel without the reader
leaving the page, while staying a real crawlable link.

**M2 (GROQ):** extend the `glossaryRef` resolution in
[sanity/lib/queries.ts](../../../sanity/lib/queries.ts) to carry the target's term + short
definition:

```groq
_type == "glossaryRef" => {
  "slug": @->slug.current,
  "term": @->term,
  "shortDefinition": @->shortDefinition
}
```

**M1 (render):** replace the plain `<Link>` in the `glossaryRef` mark of
[PortableTextRenderer.tsx:59](../../../components/portable-text/PortableTextRenderer.tsx#L59)
with a new client component `components/portable-text/GlossaryHovercard.tsx`:

- Wraps a real `next/link` `<Link href="/glossary/<slug>/">{children}</Link>` (children =
  the anchor text). **This renders server-side**, so crawlers/no-JS see a normal link.
- Desktop: on hover/focus, show a small popover with `shortDefinition` + an
  **"Open term page →"** action (`target="_blank"`). Dotted underline affordance.
- Mobile: tap opens a bottom-sheet with the same content; first tap shows the sheet (does
  not navigate); the "Open term page →" button navigates.
- A11y: `aria-describedby` linking the trigger to the panel; ESC + click-away to close;
  focusable; respects `prefers-reduced-motion`.
- Payload is **`shortDefinition` only** — never the body (duplicate-content guardrail).
- Degrade: if `shortDefinition`/`slug` missing, render the plain link.

**SEO guardrails:**
- The `<a href>` must exist in SSR HTML (don't gate the link behind JS).
- Do not inject the full body anywhere off the term page.
- Keep one canonical anchor style; the panel is decoration.

**Acceptance:** view-source shows `<a href="/glossary/...">term</a>` for every inline ref
(JS off); with JS, hover/tap shows the definition and "Open term page" opens a new tab;
Lighthouse a11y unaffected; `npx tsc --noEmit` clean; `npx next build` compiles.

---

## M3 — Inline termLinks everywhere (auto-linker)  ✅ Shipped 2026-06-17

**Status:** done. [scripts/glossary-autolink.mjs](../../../scripts/glossary-autolink.mjs)
builds a match table from published terms + aliases and links the first occurrence per target
per doc (caps per block/doc; skips headings/code/already-linked spans/self-links; acronyms
match case-sensitively with word boundaries). Applied live: **23 links across 15 docs** (20
published glossary terms + 7 career paths + 1 GEO post; guides needed none). Dry-run by
default; `--write` to commit; `--types=guide,post` to widen. Re-run after publishing the
batch-2 30 to light up their links. (Also fixed the mobile sheet action to left-aligned so it
clears the site chat FAB.)

**Goal:** every glossary/career-path/guide/service body links the first occurrence of each
known term (or alias) to its term page.

- A manual precursor already exists:
  [scripts/glossary-add-inline-links.mjs](../../../scripts/glossary-add-inline-links.mjs)
  (idempotent, dry-run by default, `--write` to commit; splits the matched span in place and
  preserves keys/markDefs). It wired the `ai-share-of-voice` test case. Generalize it into:
- New script `scripts/glossary-autolink.mjs` (mirror the humanizer tooling ethos:
  idempotent, **dry-run by default**, `--write` to commit drafts):
  - Loads all published terms + aliases → a match table.
  - For each target document's portable text, finds the **first** occurrence of a term/alias
    in `normal` blocks (skip headings, code, existing links, and **self-references**), wraps
    it in a `glossaryRef` markDef pointing at the term.
  - Match case-insensitively but preserve original casing; longest-alias-first; one link per
    term per document; cap links/paragraph to avoid over-linking.
  - Writes results as **drafts** for operator review; prints a diff.
- Re-runnable safely (skips already-linked occurrences).

**SEO guardrails:** first-occurrence only; never self-link; descriptive anchor = the term
itself; don't exceed a sane density (reads as spam and dilutes).

**Acceptance:** dry-run report lists proposed links per doc; after `--write`, drafts contain
inline `glossaryRef` marks that render via the M1 hovercard; no document links to itself; no
double-linking.

---

## M4 — Bidirectional funnels  ✅ Shipped 2026-06-18

**Status:** done via a uniform link-object field (services are static pages, not Sanity docs, so
a mixed reference field wasn't possible). `relatedResources` (`{label, href, kind, blurb}`) on
[glossary-term.ts](../../../sanity/schemas/glossary-term.ts); resolved in
[queries.ts](../../../sanity/lib/queries.ts); typed in [glossary.ts](../../../sanity/lib/glossary.ts);
rendered by [GlossaryResources.tsx](../../../components/sections/glossary/GlossaryResources.tsx)
(a rail mirroring GlossaryRelated, with CAREER PATH / SERVICE tags) above FinalCTARail in the
term page. Populated on 9 role/measurement/catalog terms via
[scripts/glossary-related-resources.mjs](../../../scripts/glossary-related-resources.mjs)
(geo-specialist, ai-search-specialist, citation-engineer → career paths + AI SEO / editorial
authority; the AI-visibility measurement cluster → AI SEO + AI visibility analyst;
ai-ready-product-catalog → Catalog AI). Rail hidden when empty. Visual-loop validated.

**Goal:** role/measurement terms send authority out to career paths and service pages.

Two options (do the lighter first):

- **A (content):** add inline links in the relevant term bodies to `/career-paths/<slug>/`
  and the relevant `/services/<slug>/` (via the standard `link` mark). Cheapest; ships with M3.
- **B (structured):** add a `relatedResources` field to
  [glossary-term.ts](../../../sanity/schemas/glossary-term.ts) — `array` of references to
  `careerPath` + `service` — and render a small rail on the term page (new
  `components/sections/glossary/GlossaryResources.tsx`, mirror
  [GlossaryRelated.tsx](../../../components/sections/glossary/GlossaryRelated.tsx)). Resolve in
  [sanity/lib/glossary.ts](../../../sanity/lib/glossary.ts). Place the rail in
  [app/(site)/glossary/[term]/page.tsx](../../../app/(site)/glossary/[term]/page.tsx) above
  `FinalCTARail`.

Priority targets: `geo-specialist`, `ai-search-specialist`, `citation-engineer`,
`ai-share-of-voice`, `ai-citation-tracking`, `ai-ready-product-catalog` → career paths +
Catalog AI / GEO service pages.

**Acceptance:** the role + measurement terms render an outbound rail / inline links to the
relevant career paths and services; refs resolve; rail hidden when empty.

---

## M5 — Cluster hubs

**Goal:** the hub is organized by cluster, with crawlable cluster surfaces.

- Group [GlossaryHub.tsx](../../../components/sections/glossary/GlossaryHub.tsx) by `cluster`
  with short cluster intros (copy per cluster).
- Optional: per-cluster landing pages `/glossary/cluster/<cluster>/` emitting
  `definedTermSetSchema` (helper already in [lib/schema.ts](../../../lib/schema.ts)) scoped to
  that cluster; add to [app/sitemap.ts](../../../app/sitemap.ts).
- Keep the hub `noindex` rule already in place; cluster pages indexable once populated.

**Acceptance:** hub shows five labelled clusters; (if built) cluster pages return 200 with
`DefinedTermSet` JSON-LD listing that cluster's terms; internal links from hub → cluster → term.

---

## M6 — Interactive-aids framework + first tools

**Goal:** turn computational/standards/self-assessment terms into embedded tools, and make
the **assessment** part of the schema so the gate is auditable.

### Schema

- **Editorial gate field** on [glossary-term.ts](../../../sanity/schemas/glossary-term.ts):
  `interactiveAidStatus` (`string`, list: `not-assessed | none-needed | planned | built`,
  default `not-assessed`) + `toolKey` (`string`, from an allowed list). Surfaces the §6 gate
  in Studio so no term ships un-assessed.
- **Body block** on [portable-text.ts](../../../sanity/schemas/objects/portable-text.ts): a new
  array member `interactiveTool` `{ toolKey: string (list), caption?: string }`. Lets a tool
  sit contextually inside the entry.

### Code

- **Component registry** `components/tools/registry.ts` mapping `toolKey` → a React component.
  Tools are **real, tested components** (logic in code, unit-tested), not Sanity-authored —
  follow [FunnelCalculator.tsx](../../../components/sections/revenue-engine/FunnelCalculator.tsx).
- **Renderer:** add an `interactiveTool` case to
  [PortableTextRenderer.tsx](../../../components/portable-text/PortableTextRenderer.tsx) that
  looks up the registry and renders the component (graceful fallback if `toolKey` unknown).
- **Optional standalone pages** `/tools/<key>/` that embed the same component (link-magnet
  surfaces) with `WebApplication`/`HowTo` JSON-LD (add a `softwareToolSchema` helper to
  [lib/schema.ts](../../../lib/schema.ts)); embed the tool in the term and link both ways.

### First tools (from the starter map, strategy §6.3)

1. **AI visibility calculator** — inputs: total prompts, mentions, citations, (optional
   competitor) → outputs SoV %, citation rate, mention rate, impression share. Embed in
   `ai-share-of-voice`, `ai-impression-share`, `mention-rate-vs-citation-rate`,
   `ai-citation-tracking`.
2. **"Is your catalog AI-ready?" scorecard** — weighted checklist → score + prioritized
   fixes. Embed in `ai-ready-product-catalog`, `crawlability-for-ai-bots`. (Pre-sold demo of
   the Catalog AI service — strong glossary→service funnel.)
3. **ETIM/UNSPSC class lookup** — search/browse classes → features. Embed in
   `etim-classification`, `normalized-attributes`.

**SEO guardrails:** tools are client components but the term's definition/body stay
server-rendered (crawlers/AI see the text regardless of the tool); standalone tool pages get
their own canonical + schema; don't let a tool replace the definitional prose.

**Acceptance:** every published term has `interactiveAidStatus` set (no `not-assessed` in
prod); the three tools render inside their terms and (if built) at `/tools/<key>/`; tool logic
has unit tests; `npx tsc --noEmit` clean; `npx next build` compiles.

---

## Cross-cutting definition of done

- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors); changed files
  lint clean; `npx next build` compiles.
- Content changes land as **drafts** unless explicitly publishing; verify with a
  `perspective:'raw'` query.
- Every inline term reference is a real crawlable `<a>` in SSR HTML (the non-negotiable).
- No full definition duplicated off the term page (hovercards/rails use `shortDefinition` only).
- Update [glossary.md](glossary.md) §3 (current state) and
  [../career-path/07-research-backlog.md](../career-path/07-research-backlog.md) as milestones land.
