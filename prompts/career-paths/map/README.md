# Career-path role map — prompts

Prompts for maintaining the **AI-search role map** — the "how the paths connect" visual and its
underlying data. **Read `prompts/_CONTEXT.md` first** (shared context, gotchas, voice). Canonical
spec: `docs/strategy/career-path/11-enriched-paths-tech-task.md` (§T2 relations, §T7 the map),
with `09-career-path-build-standard.md` for the path model.

## What the role map is (and where it shows)

The role map presents the career paths as three labelled stages — **Start here → Core roles →
Specialize** — as columns of cards. It renders in three places, all from the **same data**:

- **Hub** `/career-paths/` → the "How the paths connect." section (`#map`).
- **Each path** `/career-paths/<slug>/` → the "Where this sits" section (`#map`), with the current
  path highlighted ("You're here").
- **Downloadable artifact** `/career-paths/roles-map/` (JSON) + `/career-paths/roles-map/md/`
  (Markdown), CC BY 4.0 — linked under the hub map and in `public/llms.txt`.

## The one thing to understand: it's DATA-DRIVEN

There is **no hand-drawn layout**. The map is computed from two fields on each `careerPath`:

- **`kind`** — `role` | `specialization`.
- **`prerequisites` / `leadsTo`** — references to other career paths (the dependency edges).

The three stages are derived (`lib/career-path-stages.ts`):

| Stage | Rule |
|-------|------|
| **Start here** | no `prerequisites` (the entry on-ramps) — any kind |
| **Core roles** | has `prerequisites` **and** `kind = role` |
| **Specialize** | has `prerequisites` **and** `kind = specialization` |

So to change the map you change the **data** (a path's `kind` and its `prerequisites`/`leadsTo`),
not the component. The per-path "Before this path" / "Where this leads" rails read the same edges.
The downloadable artifact + the `ItemList`/`Occupation` JSON-LD regenerate automatically — no prompt
needed for those.

**Code touchpoints** (you rarely need to touch these — change data, not code):
`components/sections/career-paths/RoleMap.tsx`, `lib/career-path-stages.ts`,
`sanity/lib/queries.ts` (`careerPathsMapQuery`, the `prerequisites`/`leadsTo` projections),
`app/(site)/career-paths/roles-map/route.ts` (+ `/md`).

## The prompts here

| Prompt | Use it when |
|--------|-------------|
| [update-path-relations.md](update-path-relations.md) | You added or reworked a path and need to set/refresh its `prerequisites` + `leadsTo` so it lands in the right stage and the rails are correct. |
| [review-role-map.md](review-role-map.md) | QA: confirm every path slots into a stage, the edges form a clean DAG (no cycles/orphans), and the map + artifact render. Run after any relations change. |

## How to use

1. Open `prompts/_CONTEXT.md`, then this README, then the specific prompt.
2. Hand the prompt to an AI coding agent running **inside this repo** (it has the Sanity write token
   in `.env.local`; run scripts with `node scripts/<name>.mjs`).
3. Relations live in **Sanity**, not git — changes take effect on the next ISR revalidate (the dev
   read client is fresh; prod is ~1h). Verify live per the prompt's definition of done.

## Locked decisions (don't relitigate — see `_CONTEXT.md` + doc 09 §7)

- The map is a **citation/authority** surface, not lead-gen; keep it honest and on-discipline.
- `kind` classification is owner-signed-off; don't reclassify a path to move it between stages
  without sign-off.
- Edges stay **within the 7 (or more) paths** — no off-discipline links.
