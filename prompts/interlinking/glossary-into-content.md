# Prompt: Interlink glossary terms into the site's content

**Read `prompts/_CONTEXT.md` first.**

## Why
The glossary only pulls weight for the domain if the rest of the site links into it (distributes
link equity + topical signals, and teaches engines these terms are central to our expertise).
Right now the glossary is mostly self-contained.

## Two surfaces, two mechanisms
The site mixes **hardcoded TSX pages** and **Sanity portable-text content** — handle both:

1. **Hardcoded pages** (service pages `app/(site)/services/*`, the framework/landing pages, the
   homepage): add contextual `<Link href="/glossary/<term>/">` on the first natural mention of a
   glossary term (GEO, AEO, answer engine, AI visibility, AI share of voice, llms.txt, citation
   engineering, part-number SEO, etc.). Subtle inline links, not a banner. First mention only.
2. **Sanity content** (blog posts, guides — body is portable text): there is currently **no in-body
   term-link annotation** (it was deferred; we shipped `relatedTerms` rails instead). Choose one:
   - **(Recommended) Implement the deferred `termLink` annotation:** add a `glossaryRef` annotation
     (reference to `glossaryTerm`) to `sanity/schemas/objects/portable-text.ts` `marks.annotations`;
     resolve it in the body GROQ (`...markDefs[]{..., _type=="glossaryRef" => {"slug": @->slug.current}}`);
     render it in `components/portable-text/PortableTextRenderer.tsx` as a `<Link>` (subtle
     underline; optionally the term's `shortDefinition` as a title tooltip). Then editors can link
     terms inline in Studio. Verify with `tsc` + `next build`.
   - **(Lighter) Skip the annotation** and rely on per-post `relatedTerms`/related-reading rails
     instead. Lower value; note the tradeoff if you choose this.

## Do this
1. Build the live glossary slug list (query `*[_type=="glossaryTerm"]{term,"slug":slug.current,aliases}`).
2. Decide + (recommended) implement the `termLink` annotation; verify it compiles.
3. Sweep the hardcoded buyer/marketing pages and add first-mention contextual links to the most
   relevant glossary terms. Prioritize the **AI-SEO service page** (`app/(site)/services/ai-seo/`)
   and the framework page — they discuss exactly these terms.
4. Keep links tasteful and on-brand (no link spam; one link per term per page).

## Definition of done
- `tsc` clean (ignore `lib/lead-form/*`), changed files lint, `next build` compiles.
- A short report: which pages got which links; whether the `termLink` annotation shipped.
- Spot-check 2 pages via `curl` for the new `/glossary/` hrefs.
- No content invented; links only where the term is genuinely mentioned.
