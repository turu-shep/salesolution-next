# Prompt: Update career-path relations (the role-map edges)

**Read `prompts/_CONTEXT.md` and `prompts/career-paths/map/README.md` first.** Spec:
`docs/strategy/career-path/11-enriched-paths-tech-task.md` §T2.

## Goal

Set or refresh the `prerequisites` and `leadsTo` references on the career paths so the role map
(stages + the per-path "Before this / Where this leads" rails) is correct — most often after adding
or reworking a path.

- **`prerequisites`** = the paths a reader should know *first* (e.g. SEO Specialist before GEO
  Specialist). Drives the "Before this path" line **and** which stage the path lands in (no
  prerequisites → "Start here").
- **`leadsTo`** = the natural *next* paths. Drives the "Where this leads" rail.

## Context: the current DAG

Foundations → roles → specializations (keep it acyclic and on-discipline):

```
seo-specialist            → technical-seo-specialist, geo-specialist
technical-seo-specialist  → geo-specialist
ai-visibility-analyst     → geo-specialist, ai-search-specialist
geo-specialist            → aeo-specialist, citation-engineer, ai-search-specialist
aeo-specialist            → ai-search-specialist
citation-engineer         → (terminal)
ai-search-specialist      → (terminal)
```

Entry on-ramps (no prerequisites): `seo-specialist`, `ai-visibility-analyst`.

## Do this

1. **Read the current state.** Query published paths with their edges + kind (`perspective: 'raw'`):
   ```
   *[_type=="careerPath" && !(_id in path("drafts.**"))]{
     _id, "slug": slug.current, kind,
     "prerequisites": prerequisites[]->slug.current,
     "leadsTo": leadsTo[]->slug.current
   }
   ```
2. **Place the new/changed path.** Decide its `prerequisites` (what to learn first) and `leadsTo`
   (where it goes next), staying inside the existing path set. Keep the graph **acyclic** (if A
   leads to B, B must not lead back to A) and prefer linking to the *nearest* prerequisite, not every
   transitive one. Confirm the resulting stage is what you intend (no prereqs = Start here; +prereqs
   + role = Core roles; +prereqs + specialization = Specialize).
3. **Update the back-links.** Relations are directional but should read consistently: if you add
   `X.leadsTo = [Y]`, add `Y.prerequisites = [..., X]` where it makes sense (the map draws stages
   from prerequisites; the rails use both). Keep them coherent.
4. **Patch in Sanity** with a Node script (pattern: a `client.patch(id).set({ prerequisites:
   [...refs], leadsTo: [...refs] }).commit()`; refs are `{_type:'reference', _key, _ref:'career-<slug>'}`;
   `createClient` from `next-sanity`, `perspective:'raw'`, token from `.env.local`). Targets are
   published, so strong refs are fine.
5. **Verify** (see definition of done).

## Output

- The edge changes you made (per slug), and the resulting stage placement of any new/changed path.

## Definition of done

- `node` script ran clean; a `perspective:'raw'` query shows the new edges.
- No cycles; no path links off-discipline; entry on-ramps still have empty `prerequisites`.
- Live check: the hub `/career-paths/` `#map` and the affected path's `#map` return 200 and show the
  path in the right stage; `/career-paths/roles-map/` is valid JSON reflecting the new edges.
- Then run `prompts/career-paths/map/review-role-map.md` for a full QA pass.
