# Prompt: Review / QA the career-path role map

**Read `prompts/_CONTEXT.md` and `prompts/career-paths/map/README.md` first.**

## Goal

Confirm the role map is correct and renders well, across all three surfaces (hub stages, per-path
"Where this sits", downloadable artifact). Run this after any change to a path's `kind`,
`prerequisites`, or `leadsTo`.

## Do this

1. **Pull the data** (`perspective: 'raw'`):
   ```
   *[_type=="careerPath" && !(_id in path("drafts.**"))]{
     "slug": slug.current, kind,
     "prerequisites": prerequisites[]->slug.current,
     "leadsTo": leadsTo[]->slug.current
   }
   ```
2. **Check the stage assignment** (`lib/career-path-stages.ts` rule): every published path falls into
   exactly one of — Start here (no prerequisites), Core roles (prerequisites + `kind=role`),
   Specialize (prerequisites + `kind=specialization`). Flag any path with a missing/empty `kind`, or
   one that lands in a stage that reads wrong (e.g. a senior role with no prerequisites stuck in
   "Start here" — give it a prerequisite).
3. **Check the graph integrity:**
   - **No cycles** (follow `leadsTo`; it must terminate).
   - **No orphans** — every non-foundation path has at least one `prerequisites` entry, and every
     path is reachable (appears as some path's `leadsTo` or is a foundation).
   - **Edges resolve** — no `prerequisites`/`leadsTo` ref points at a missing/unpublished path.
   - **On-discipline** — no edge points outside the path set.
4. **Render checks** (dev or prod):
   - `curl -s http://localhost:3000/career-paths/` → 200; shows `Start here`, `Core roles`,
     `Specialize`, and the progression line.
   - A path page, e.g. `/career-paths/geo-specialist/` → 200; its `#map` shows the path with the
     "You're here" highlight in the right stage.
   - `/career-paths/roles-map/` → valid JSON (paths, modules, prerequisites, leadsTo, license);
     `/career-paths/roles-map/md/` → readable Markdown. Both match the live data.
5. **Sanity-vs-render** — the stages/cards on the page match the raw data (no stale render; the dev
   read client is fresh, prod is ~1h ISR).

## Output

- A short report: stage placement per path, any integrity issues found (cycles, orphans, dangling
  refs, miskinded paths, off-discipline edges), and whether all three surfaces render correctly.
- If issues need data changes, point to `prompts/career-paths/map/update-path-relations.md` (don't
  fix code — the map is data-driven).

## Rules

- Read-only review by default — propose data fixes, don't silently re-architect the graph.
- Don't reclassify a path's `kind` to move it between stages without owner sign-off (`_CONTEXT.md`).
