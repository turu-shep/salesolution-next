# Dentist Partner Brief (`/strategy/offers/dentist/`) Implementation Plan

> **For agentic workers:** Execute task-by-task in order; steps use checkbox (`- [ ]`) syntax for tracking. This plan is executed by a single delegated agent in-session (repo standing rule: Opus executes). Spec: `docs/superpowers/specs/2026-07-25-dentist-partner-brief-design.md`. Facts source: session scratchpad `dentist-offer-facts-pack.md` (path supplied in the task prompt).

**Goal:** One gated internal page at `/strategy/offers/dentist/` giving the marketing partner everything needed to outreach US dental offices with the Revenue Engine offer.

**Architecture:** A markdown const in `lib/strategy/docs/` rendered by the existing `MarkdownDoc` component from a static page under the already-gated `app/strategy/` subtree, plus one card row on the `/strategy` landing. A node:test content-invariant canary guards the brief's binding rules.

**Tech Stack:** Next.js 16.2.6 (App Router, webpack-pinned dev), React 19, Tailwind v4 tokens (light-only), node:test via `pnpm test` (`node --test lib/`), TypeScript 5.

## Global Constraints

- **NO git commits or pushes** — leave all changes in the working tree (user directive; overrides this skill's default commit steps).
- **Frozen, never read-as-dependency/import/modify:** `app/strategy/offers/page.tsx`, `components/strategy/OfferMirror.tsx`, `lib/strategy/offers/**`, `docs/handoff/offers/**`.
- `npx tsc --noEmit` must exit 0 with **zero** diagnostics (baseline is clean; the AGENTS.md "pre-existing lib/lead-form Zod errors" note is stale).
- `pnpm lint` clean on changed files; `pnpm build` compiles; `pnpm test` passes.
- All internal URLs use trailing slashes (`trailingSlash: true`).
- Page must NOT re-declare `robots`, NOT add gate code, NOT add a `dynamic` export — all inherited from `app/strategy/layout.tsx`.
- Light-mode only: no `dark:` Tailwind variants anywhere.
- No new dependencies (`npm i --no-save playwright` for the screenshot step is the only allowed, non-persisted install).
- Brief template-literal content must contain **no backticks and no `${`** sequences.
- Binding content rules (test-enforced): guarantee sentence appears verbatim; "Beautiful Smiles" never appears; "Plantation" never appears; no banned competitor names; `GATE:HUMAN` label present on the drafts section; the live pricing line "Installs start at $30,000" present.
- Voice: operator register throughout; **humanizer skill pass required** on the partner-voiced draft sequences before finalizing.
- Node is 20.16: `.mjs` tests cannot import `.ts` modules — the invariant test reads the `.ts` file **as text**.

---

### Task 1: Content-invariant test (failing first)

**Files:**
- Test: `lib/strategy/docs/dentist-partner-brief.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: a canary test asserting the binding content rules against the raw text of `lib/strategy/docs/dentist-partner-brief.ts` (created in Task 2).

- [ ] **Step 1: Write the failing test**

```js
// lib/strategy/docs/dentist-partner-brief.test.mjs
// Content canaries for the dentist partner brief. The brief is authored prose;
// these assert the binding rules from the 2026-07-25 design spec, reading the
// module as text because node 20 can't import .ts (same idiom as the sitemap
// reconcile test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const briefPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'dentist-partner-brief.ts',
)
const brief = readFileSync(briefPath, 'utf8')

// brand/competitor-policy.yaml is the source of truth for this list.
const BANNED_COMPETITORS = [
  'LSEO', 'Graphite', 'Victorious', 'Animalz', 'SEOProfy',
  'Thrive Internet Marketing', 'Position Digital', 'Digital Elevator',
  'iPullRank', 'Onely', 'Directive Consulting', 'Siege Media', 'MADX Digital',
  'Straight North', 'WebFX', 'Seer Interactive', 'First Page Sage', 'Grizzle',
  'Virayo', 'NP Digital', 'Amsive', 'Single Grain', 'Ignite Visibility',
  'KlientBoost', 'SmartSites', 'Disruptive Advertising', 'Black Propeller',
  'Intero Digital', 'Titan Growth', 'JumpFly',
]

test('exports a non-empty brief with an H1', () => {
  assert.match(brief, /export const DENTIST_PARTNER_BRIEF_MD/)
  assert.match(brief, /^# /m)
})

test('guarantee is quoted verbatim, never paraphrased away', () => {
  assert.ok(
    brief.includes(
      "If the revenue the system brings back doesn't beat my monthly fee by day 90, I work free until it does.",
    ),
  )
})

test('current pricing regime is stated', () => {
  assert.ok(brief.includes('Installs start at $30,000'))
})

test('never names the active deal or the unnamed practice', () => {
  assert.ok(!brief.includes('Beautiful Smiles'))
  assert.ok(!brief.includes('Plantation'))
})

test('no banned competitor names', () => {
  for (const name of BANNED_COMPETITORS) {
    assert.ok(!brief.includes(name), `banned competitor present: ${name}`)
  }
})

test('partner-voiced drafts are gated on Artur', () => {
  assert.ok(brief.includes('GATE:HUMAN'))
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/strategy/docs/`
Expected: FAIL — `ENOENT ... dentist-partner-brief.ts` (module doesn't exist yet).

---

### Task 2: Author the brief content module

**Files:**
- Create: `lib/strategy/docs/dentist-partner-brief.ts`

**Interfaces:**
- Consumes: the facts pack (scratchpad `dentist-offer-facts-pack.md`) + spec section list; idiom reference: any existing `lib/strategy/docs/*.ts` module (e.g. the CEO-speech ones) for the export shape.
- Produces: `export const DENTIST_PARTNER_BRIEF_MD: string` (markdown, GFM tables allowed pending the Task 4 render check).

- [ ] **Step 1: Read the idiom** — open one existing `lib/strategy/docs/*.ts` module and match its export style (template literal; use `String.raw` only if the existing modules do).

- [ ] **Step 2: Author the brief.** H1: `# Dentist offer — partner brief`, then a one-line dateline (`Updated 2026-07-25 · Everything here traces to the strategy docs. The NEVER list is binding.`). Then exactly the 12 sections from the spec, in order, with this content contract (facts-pack section in parens; re-verify every verbatim quote you embed against the cited repo file before finalizing):

  1. **How to use this / role split** — partner starts conversations + books the 20-min Revenue Leak Audit; Artur runs it, prices same-day in writing, closes, installs. "Booking, not closing." (F)
  2. **The offer** — promise lines; five-stage dental table (stage → what gets installed → outcome, from A's install map); day-60/day-90; terms (3-mo minimum, month-to-month, client-owned ad accounts, zero markup, exit keeps accounts/data/profile); the guarantee quoted verbatim ONCE with the never-paraphrase + settles-against-monthly-fee rules. (A, B, C)
  3. **Pricing — public vs internal** — public/citable: the live floor line. Internal (never in outreach): max($30K, ~10% modeled 12-mo recovery), never discount to fit, retainer $4–8K/mo from month 4 (Tier B $3–4K), three signed option names, payment terms. Rule: price talk beyond the published line is Artur's. Note the June scripts' "no setup cost, flat monthly" lines are superseded — do not use (describe, don't quote the dead line). (B, J1)
  4. **Targeting** — Tier A/B/C table (collections, case mix, modeled recovery, action); decision-maker (owner decides, office manager steers phones + the authority-check question); screening questions; buy triggers; disqualifiers. (D)
  5. **Language** — six verbatim pain lines; say/never-say ("new patients"/"calls" not "leads"; "patients" not "consumers"; the dental kill-list words); no unexplained acronyms; no competitor names (point to brand/competitor-policy.yaml — do NOT list the names in the brief). (E)
  6. **Assets & claims** — URL table: `/revenue-engine/dentists/#audit` (THE conversion point — inline form, no standalone audit page or calendar), `/revenue-engine/`, `/industries/medical-aesthetics/`, post-submit `/revenue-engine/audit-booked/`; warning that `/book-growth-call/` + `/unlock-growth-audit/` are the industrial funnel — never use for dentists; what the WholeFlowLeak calculator shows. Approved claims C-01/C-04/C-05 with exact hedges + "dental is a shipped vertical" (no location, no name). **NEVER list** (binding): no dental case study/testimonial exists — never imply one; no lib/stats.ts numbers; no lead-count/ranking promises; treatment-plan-acceptance stat not cleared for outreach even though it's on the live page; never name the active deal or the practice; never say "you can't get sued"; no fake deadlines. (G, J2)
  7. **Motion & cadence** — 7-stage funnel; 8 touches / ~15 working days (3 calls+VM, 4 emails, 1 LinkedIn); observed-leak honesty rule; the audit-pitch close verbatim; what a booked audit is (20 min, their numbers, no patient data). (F, I)
  8. **Copy bank (approved, Artur's first person)** — opener, owner-direct leak line, hook, close, voicemail RE-VM1, email #1, breakup email — verbatim with the "adapt attribution" label. (I)
  9. **Partner-voiced sequences — DRAFTS, GATE:HUMAN** — banner first: "Drafts. Not approved for sending until Artur signs off." Then: 4 emails + 1 LinkedIn DM + a call-opener adaptation, partner speaking as himself, naming Artur as the operator who runs the audit. Every prospect-specific fact is a `[SLOT: what to observe]`. No link in email 1; audit link in email 2 or 3. Obey honesty rule + kill-list. Humanizer pass required (Task 4). (I + spec §9)
  10. **Compliance rails (non-negotiable)** — hand-dial only; no AI-voice/prerecorded outbound; no ringless VM; 9am–7pm prospect-local; real caller ID, never spoof; DNC scrub for personal cells + internal DNC forever; never record cold calls (FL all-party); SMS only off written form consent + A2P 10DLC; admit it's a sales call if asked; $500–$1,500 per-violation exposure. BAA wording gate + the documented fallback line. (F, H2, J4)
  11. **Objection quick sheet** — the nine dental pairs, faithful but tight. (H)
  12. **Status & open items** — zero dental proof yet (first cohort candidate in pipeline, unnamed); BAA list unconfirmed; acceptance-stat claims-library row pending; pre-call scanner awaiting keys; GHL not wired (leads land in HubSpot + Resend email); June scripts superseded on pricing; compliance ownership for a partner motion not yet re-scoped — flag before the partner dials at volume. (J)

  Constraints while authoring: no backticks or `${` in the content; keep tables narrow (≤4 columns); operator register; internal doc so acronyms like PMS/BAA may appear WITH first-use expansion.

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test lib/strategy/docs/`
Expected: PASS (6/6).

---

### Task 3: Page + landing card

**Files:**
- Create: `app/strategy/offers/dentist/page.tsx`
- Modify: `app/strategy/page.tsx` (append ONE row to the `docs[]` array — file is git-modified by another workstream: append-only, no reordering/reformatting)

**Interfaces:**
- Consumes: `DENTIST_PARTNER_BRIEF_MD` from Task 2; `MarkdownDoc` from `components/sales/MarkdownDoc.tsx`.
- Produces: route `/strategy/offers/dentist/`; a landing card linking to it.

- [ ] **Step 1: Create the page** — copy the exact pattern of `app/strategy/ceo/speach/blocks/page.tsx` (breadcrumb hrefs, class names, metadata shape). Target shape:

```tsx
// app/strategy/offers/dentist/page.tsx
import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { DENTIST_PARTNER_BRIEF_MD } from '@/lib/strategy/docs/dentist-partner-brief'

export const metadata = { title: 'Dentist partner brief' }

export default function DentistPartnerBriefPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Dentist partner brief</span>
      </div>
      <MarkdownDoc markdown={DENTIST_PARTNER_BRIEF_MD} />
    </div>
  )
}
```

If the precedent page differs (import order, breadcrumb classes, trailing-slash hrefs, typed `Metadata`), **the precedent wins** — mirror it exactly.

- [ ] **Step 2: Append the landing card** — in `app/strategy/page.tsx`, append to `docs[]` (match the array's existing object shape exactly):

```
href: '/strategy/offers/dentist/'
name: 'Dentist partner brief'
desc: 'The dentist offer for outreach: role split, pricing rails, targeting, claims, cadence, compliance.'
```

- [ ] **Step 3: Route smoke check**

```bash
pkill -f "next dev" || true; rm -rf .next; pnpm dev &   # webpack-pinned
# poll until stable:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/strategy/offers/dentist/
```

Expected: `200` (repeat until stable; localhost bypasses the gate). Then `curl -s http://localhost:3000/strategy/offers/dentist/ | grep -c "partner brief"` — expected ≥ 1.

---

### Task 4: Verification + polish

**Files:**
- No new files. Screenshot lands in the session scratchpad.

**Interfaces:**
- Consumes: everything above.
- Produces: green verification suite + a screenshot + humanized drafts + glossary-queue result.

- [ ] **Step 1: Humanizer pass** — invoke the `humanizer` skill; apply its kill-list + rewrite moves to section 9 (partner-voiced drafts) and re-check section 8 adaptation labels. Facts, numbers, URLs stay verbatim. Re-run `node --test lib/strategy/docs/` after edits.
- [ ] **Step 2: Tables render check** — with the dev server up, view `/strategy/offers/dentist/`: confirm GFM tables render as `<table>` (not raw pipes) and are readable inside `.article-body`; sticky TOC lists the 12 `##` sections. If tables render raw, restructure those sections to bold-label lists.
- [ ] **Step 3: Screenshot** — `npm i --no-save playwright` then `node scripts/_visual-check.mjs` (read its usage first) against `http://localhost:3000/strategy/offers/dentist/`; save PNG(s) to the scratchpad. If playwright install fails, skip with a note — the curl checks stand.
- [ ] **Step 4: Full suite**

```bash
npx tsc --noEmit        # expected: exit 0, zero output
pnpm lint               # expected: clean (at minimum: no errors in changed files)
pnpm build              # expected: compiles; /strategy/offers/dentist listed in output
pnpm test               # expected: all pass incl. the new canary + sitemap reconcile
```

- [ ] **Step 5: Term capture** — read the rule in `prompts/_CONTEXT.md`; queue genuinely new domain terms from the brief via `node scripts/glossary-queue.mjs add "<term>" … --source <type>:<slug>` (dedupe against the existing queue/glossary; likely few or none — if none qualify or the script rejects the source type, skip and say so).
- [ ] **Step 6: Kill the dev server** (`pkill -f "next dev"`). Report: files changed, suite results, screenshot path, term-capture outcome, any deviations.

---

## Self-Review (done at planning time)

1. **Spec coverage:** access model → inherited (Task 3 adds no gate code — constraint); 3 files → Tasks 2–3; 12 sections → Task 2 contract; adjudications → §3/§6/§12 contract lines + test canaries; voice/humanizer → Task 4.1; DoD → Tasks 1, 3.3, 4; term capture → 4.5; risks (concurrent M file → append-only; quote drift → re-verify rule in Task 2.2; tables → 4.2). No gaps.
2. **Placeholder scan:** none — every step has code, exact commands, or a complete content contract bound to the facts pack.
3. **Type consistency:** `DENTIST_PARTNER_BRIEF_MD` named identically in Tasks 1, 2, 3.
