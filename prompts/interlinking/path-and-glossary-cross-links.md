# Prompt: Cross-link career paths ↔ services and ↔ glossary

**Read `prompts/_CONTEXT.md` first.**

## Why
The career paths and the services they map to currently don't reference each other, and the
paths↔glossary links should be rich in both directions. Cross-linking turns the hub into a system.

## Do this
1. **Inventory.** List published paths (`*[_type=="careerPath"]{title,"slug":slug.current}`) and
   the service pages (`app/(site)/services/*`). Map each path to its closest service:
   - GEO Specialist ↔ `services/ai-seo`
   - Citation Engineer ↔ `services/ai-seo` (and `services/editorial-authority` / `catalog-ai` if relevant)
   - (future paths → their nearest service)
2. **Service → path:** on each relevant service page, add a tasteful contextual link to the
   matching path (e.g. on the AI-SEO page, a line like "What this role looks like in-house:
   [GEO Specialist](/career-paths/geo-specialist/)"). Subtle, single, on-brand — not a banner.
   Note: the path **buyer sections** intentionally point buyers toward *hire-vs-agency* thinking,
   which complements the service page — keep that framing consistent.
3. **Path → glossary:** confirm each path's `relatedTerms` covers the terms it actually uses; add
   any missing references in Sanity (`relatedTerms` on the published `careerPath` doc; strong refs
   are fine — targets are published). Optionally, if the `termLink` annotation has shipped (see
   `interlinking/glossary-into-content.md`), link key terms inline in the path `body` too.
4. **Glossary → path:** for role-type glossary terms (e.g. `geo-specialist`, `citation-engineer`),
   make sure their `relatedTerms`/related rails point to the corresponding full path page.
5. **Hub cross-promo (light):** consider a single line on the `/career-paths/` hub or `/glossary/`
   hub pointing to the other ("New here? Start with the [glossary](/glossary/)."). One link, no clutter.

## Definition of done
- `tsc` clean (ignore `lib/lead-form/*`), changed files lint, `next build` compiles.
- Service↔path and path↔glossary links verified (`curl` the service + path pages for the hrefs).
- Sanity `relatedTerms` updates confirmed via a `perspective:'raw'` query.
- Report the link map you created. No content invented; honor "we don't hire" framing.
