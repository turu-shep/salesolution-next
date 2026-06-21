# /sales — build & cockpit design

*Design spec. Created 2026-06-19. Status: approved, pre-implementation.*

This is the technical design for the private `/sales` area and the cold-call **cockpit** that lives under it. The strategy content it renders is in the sibling docs (`01`–`08`); this doc covers the app: routing, the password gate, the data model, the cockpit UX, the logger, and the build order.

> **Next 16 caution (from `AGENTS.md`):** this repo runs a heavily-modified Next 16.2.6 where routing, `cookies()`, `headers()`, and layout APIs may differ from training data. The implementation plan must verify each API against `node_modules/next/dist/docs/` before coding. Treat the API specifics below as intent, not final signatures.

---

## 1. Purpose & scope

A private, password-gated internal area at `salesolution.net/sales/`. It is **not** customer-facing. Its first tool is the cold-call **cockpit** at `/sales/playbook` — the screen Artur works while dialing.

In scope for v1:
- The `/sales` area shell + the access gate.
- The cockpit: branching call flow, objection quick-search, vertical toggle, per-call logger.
- Both motions (Revenue Engine — roofing + dental sub-scripts; Industrial), driven from typed data.

Out of scope for v1 (designed so they slot in later): a live Apollo-fed call list inside the app, a `/sales/metrics` dashboard, multi-user auth. Apollo list-building and CRM updates stay a **prep step** run via the Apollo MCP between call blocks, not wired into the running app.

---

## 2. Access & privacy model (the gate)

**Selected behavior:** the gate works everywhere; **open on localhost, password-required in production**, and production only serves the area when an env flag is on.

**Env vars** (added to `.env.local.example`, all server-only — no `NEXT_PUBLIC_`):
- `SALES_ENABLED` — `"true"` to serve `/sales` in production. Anything else → the area 404s in prod (invisible).
- `SALES_PASSWORD` — the shared password.
- `SALES_SESSION_SECRET` — random ≥32 chars, used to sign the auth cookie.

**Gate logic** lives in the `app/sales/layout.tsx` server component (no middleware — this matches the existing env-gated route-handler pattern in `app/api/cron/revalidate-sitemap/route.ts` and avoids introducing Next 16 middleware):

1. Read the request host via `headers()`. If host is `localhost` / `127.0.0.1` → render children (open, no password). *(Dev convenience; localhost is never the public host.)*
2. Else (production host):
   - If `SALES_ENABLED !== "true"` → `notFound()` (the whole area returns 404).
   - Else read the signed cookie `sales_auth`. If valid → render children. If missing/invalid → render the **in-place login form** (NOT a redirect to a separate route — this avoids a layout-wraps-login redirect loop).
3. The login form POSTs to `app/api/sales/login/route.ts`, which timing-safe-compares `SALES_PASSWORD`, and on success sets `sales_auth` (httpOnly, `secure`, `sameSite=strict`, signed with `SALES_SESSION_SECRET`, ~30-day expiry) then redirects back to the requested path.

**Crawler/leak hardening (defense in depth):**
- `app/sales/layout.tsx` exports `metadata` with `robots: { index: false, follow: false }`.
- Add `Disallow: /sales` to robots.txt.
- Exclude `/sales/*` from the sitemap generator.
- Because `app/sales/` sits **outside** the `(site)` route group, it inherits only the root `app/layout.tsx` — so it gets a clean shell with no site header/footer/mega-nav by default.
- Customer tracking (GA + Meta pixel + the GA event dispatchers), the chat widget, and the cookie-consent banner are route-gated **out** of `/sales` via `components/integrations/PublicOnly.tsx` (a `usePathname` guard in the root layout). The internal workspace runs clean — no pixels, no banner — which is the tracking route-gating `07-compliance.md` calls for.

> The localhost-open branch is a deliberate convenience for desk dialing. If we later want a password even on localhost, it's a one-line change in the gate.

---

## 3. Routing & file layout

```
app/
  sales/
    layout.tsx              # the gate + clean internal shell + noindex metadata
    page.tsx                # /sales — internal hub (lists tools; playbook now)
    playbook/
      page.tsx              # /sales/playbook — the cockpit (mounts the client app)
  api/
    sales/
      login/route.ts        # POST: verify SALES_PASSWORD, set signed cookie

components/sales/           # cockpit client components (flow, objection search, logger, toggle, login form)

lib/sales/
  playbook/
    types.ts                # the content schema (Track, Stage, Segment, Line, Objection, ...)
    metrics.ts              # funnel + outcome enums + CallLog (logger contract)
    objections.ts           # shared objection library (39 cards)
    index.ts                # registry the cockpit reads (TRACKS, getTrack, searchObjections)
    tracks/
      revenue-engine-roofing.ts   # RE — roofing/home-services script
      revenue-engine-dental.ts     # RE — dental script
      industrial.ts                # Industrial script
```

The route group note: `(internal)`-style parens were considered and rejected — a real `sales/` segment is required to put `/sales` in the URL, and it already gives the clean shell for free.

---

## 4. Content data model

The playbook is **content-as-typed-data** (rejected alternatives: MDX — a branching call flow is a graph that MDX fights; markdown-compiled-to-data — a parser is overkill for v1). One renderer walks the data; adding a vertical = adding a data file; objection search and a printable export fall out for free. The prose source of truth is the `01`–`08` docs; the data modules encode them for the app.

Schema (intent — finalize in `types.ts`):

```ts
type Motion = 'revenue-engine' | 'industrial'
type SubScript = 'roofing' | 'dental' | null   // RE splits; industrial is null

interface Track {
  id: Motion
  subScript: SubScript
  label: string
  goal: string                 // the one next-step this call books
  cta: { label: string; href: string }   // Revenue Leak Audit | Book a Growth Call
  personaNote: string          // who's on the line, in one line
  precall: PrecallItem[]        // the leak-proof / research checklist
  stages: Stage[]
}

interface Stage {
  id: 'open' | 'hook' | 'discovery' | 'pitch' | 'close' | 'voicemail'
  title: string
  lines: Line[]                 // word-for-word talk track
  branches?: Branch[]           // "if gatekeeper", "if 'who is this?'", "if 'just email me'"
}

interface Branch { trigger: string; lines: Line[]; goto?: Stage['id'] }
type Line = { say: string } | { note: string }   // say = spoken; note = stage direction

interface Objection {
  id: string
  label: string
  triggers: string[]            // what they actually say (feeds search)
  category: 'gatekeeper' | 'brush-off' | 'price' | 'trust' | 'timing' | 'competitor' | 'fit'
  motions: Motion[]
  response: Line[]              // the spoken comeback
  reframe?: string              // proof/angle (the prospect's own situation, never a fake stat)
  sendAfter?: { label: string; href: string }   // asset/next-step if it persists
  why?: string                  // one line on why it works
}
```

---

## 5. The cockpit UX (`/sales/playbook`)

A single-screen client app. Layout intent:

- **Top bar:** motion toggle — Revenue Engine (Roofing | Dental) / Industrial. Switching swaps the active `Track`. Persists last choice in localStorage.
- **Pre-call card:** the leak-proof / research checklist for the chosen track, with quick checkboxes — the ritual before each dial.
- **Flow pane (center):** the current `Stage` rendered as speakable lines; stage directions (`note`) visually de-emphasized. Branch buttons ("Gatekeeper", "Who is this?", "Just email me") jump to the matching `Branch`/`Stage`. Prev/next to walk Open → Hook → Discovery → Pitch → Close.
- **Objection search (always reachable, hotkey `/`):** type what the prospect said; fuzzy-matches `Objection.triggers`/`label`; shows the battle-card (response + reframe + send-after) without leaving the call flow.
- **Logger panel (right/bottom):** one click to record the call outcome (§6), captured against the active track. Collapsible so it's out of the way mid-sentence.

Keyboard-first: this is used live, one-handed, while talking. No modal that blocks the script.

---

## 6. The per-call logger

A lightweight client store — **no backend in v1**.

- **Persistence:** `localStorage` (per browser/device). Survives reloads. Export to CSV and JSON for handoff into Apollo.
- **Fields per call:** the full record is specified in [08-metrics.md](./08-metrics.md) §2 — `contact`/`business_name`, `motion`, `track_detail`, `outcome`, `furthest_stage` (derived from `outcome`, not hand-editable), `do_not_call` (flag), `objection_hit` (closed list), `leak_observed`/`gap_observed`, `next_step` + `next_step_due`, `notes`, timestamps (set client-side at log time). One behavior the cockpit must enforce: **a `revenue-engine` row won't save without `leak_observed`** — the pre-dial leak gate (08 §5).
- **Outcome enum** — the contract lives in [08-metrics.md](./08-metrics.md) §2 (source of truth); the logger implements it exactly: `no-answer`, `voicemail-left`, `wrong-number`, `gatekeeper-wall`, `bad-fit-on-call`, `not-interested`, `interested-no-commit`, `callback-scheduled`, `disqualified`, `booked-audit`, `drove-to-self-audit`, `booked-growth-call`, `booked-diagnostic`. Exactly one per call, motion-locked for the booking values. `do_not_call` is a **separate boolean flag**, not an outcome, so a DNC request never erases the stage the call actually reached.
- **Export → Apollo:** between call blocks, the CSV/JSON is the input to an Apollo MCP sync (create/update contacts, log tasks, advance sequence). The app does not call Apollo at runtime in v1.

---

## 7. Apollo workflow (prep step, MCP-driven)

List-building and CRM stay outside the running app:
- **Before a block:** build the call list with the Apollo MCP (people/company search filtered to the motion's ICP — see each track's pre-call section), enrich, and export the day's list.
- **After a block:** push the logger export back into Apollo (outcomes, next-steps, DNC flags) and advance the multitouch sequence (`06-cadence-and-multitouch.md`).

Wiring an Apollo API key into the Next app for a live `/sales/lists` view is a v2 option, deliberately deferred.

---

## 8. Build order (phased)

1. **Gate + shell** — `app/sales/{layout,page}.tsx`, `app/api/sales/login/route.ts`, env vars, robots.txt disallow, sitemap exclusion. Verify it 404s in prod without `SALES_ENABLED`, opens on localhost, gates on the live host.
2. **Schema + registry** — `lib/sales/playbook/types.ts` + `index.ts` + empty track stubs.
3. **Content → data** — encode the finalized `01`–`08` prose into the track/objection/metrics modules.
4. **Cockpit renderer** — motion toggle, pre-call card, flow pane with branches.
5. **Objection search** — fuzzy index over the objection library + battle-card panel + `/` hotkey.
6. **Logger** — store, outcome capture, CSV/JSON export.
7. **Hub page** — `/sales` index listing the tool(s).
8. **QA** (definition of done below).

---

## 9. Definition of done / QA

- **Humanizer pass** on every spoken line before it ships — these are customer-facing speech (global instruction + brand voice rules).
- **Adversarial verify** on the compliance doc (the law) and on any number/claim used anywhere — no fabricated proof, no client names in scripts.
- `npx tsc --noEmit` clean (ignore the pre-existing `lib/lead-form/*` Zod errors per `AGENTS.md`).
- `pnpm lint` clean on changed files; `pnpm build` compiles.
- **Privacy check:** confirm `/sales` is `noindex`, robots-disallowed, absent from the sitemap, and 404s in prod when `SALES_ENABLED` is unset.

---

## 10. Future (slots already designed for)

- `/sales/lists` — live Apollo-fed call list (needs an Apollo API key in the app).
- `/sales/metrics` — a dashboard over the logged outcomes.
- Per-user auth if more than Artur ever dials.
