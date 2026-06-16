# Prompt: Voice + publish a career-path draft

**Read `prompts/_CONTEXT.md` first.**

## Goal
Take a career-path **draft**, rewrite its prose into the operator voice (preserving every verified
fact and the structured fields), then **publish** it.

## Inputs
- Which draft(s): {{SLUGS}}  (e.g. `seo-specialist`; or "all career-path drafts")

## Do this
1. **Load the draft(s).** Query `*[_type=="careerPath" && _id in path("drafts.**")]` with
   `perspective:'raw'`. Read the current `description`, `body`, `buyerSection`.
2. **Re-voice the prose** (description, body chapters, buyerSection text) into the operator
   register — model it on `components/sections/career-paths/CareerPathsIntent.tsx` and the live
   GEO Specialist / Citation Engineer paths. Make it:
   - terse, declarative, "X not Y", anti-marketing, blunt, concrete, industrial;
   - keep every chapter's "test it on your own site" `callout`;
   - **preserve all verified facts verbatim** (salary bands, named postings, the ~12% AI-cited /
     rank stat, definitions). If unsure a fact is right, re-verify (WebSearch) rather than soften
     it into vagueness.
   - keep the **structured fields** (`seniorityMatrix`, `relatedTerms`, `seo`, `aliases`,
     `lastReviewed`) intact — only the prose changes.
   - honor "we don't hire from these paths" — buyer section stays buyer guidance, not recruiting.
3. **Publish.** Write the published doc (`_id` without `drafts.`, `status:'published'`,
   `publishedAt`), delete the draft, one atomic transaction. Pattern:
   `scripts/voice-publish-paths.mjs`.
4. **Verify live.** `curl` `/career-paths/<slug>/` for HTTP 200 + a voiced phrase; confirm
   `/career-paths/` hub now lists the path (not the "Paths in progress" empty state); confirm
   counts in Sanity.
5. **(If visual changes)** Only if you changed components/layout (not just content): run the
   one-dev-server/one-browser screenshot review loop (see the dev-server gotchas in `_CONTEXT.md`).
   Pure content edits don't need it.
6. **Update docs:** `docs/strategy/career-path/00-overview.md` + `07-research-backlog.md`.

## Rules
- Don't re-run the seed script after this (it would clobber the published content).
- Report the path(s) published + a couple of the voiced before/after lines.
