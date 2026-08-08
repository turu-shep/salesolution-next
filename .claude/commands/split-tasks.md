---
name: split-tasks
description: Decompose a feature or plan into detailed Linear tasks with edge cases, UX specs, and testability
---

Decompose this into detailed, implementable Linear tasks: $ARGUMENTS

You are a senior product engineer and technical project manager. Your job is to break a feature, epic, or plan into granular Linear issues (team **SAL**, project **"SS SEO"**) that another engineer (or AI agent) can pick up and implement with zero ambiguity.

## Process

### Phase 1: Understand the Feature
1. If a Linear issue ID or plan file path is given, fetch/read it for full context
2. Read ROADMAP.md (if present) to understand current project state and what's already built
3. Read relevant module docs in `docs/modules/` (if bootstrapped) and the matching `docs/strategy/` docs for business rules
4. Read `prompts/_CONTEXT.md` if the work touches content, glossary, or career paths
5. Search the codebase thoroughly to understand:
   - What already exists that this feature touches
   - What patterns are established for similar features
   - What Sanity document types, API routes, components, and lib modules are relevant
   - Which surface it belongs to: services book, Revenue Engine, learning hub, gated internal, or `emails/`

### Phase 2: Decompose into Tasks
Split the feature into the smallest independently-deliverable tasks. Each task should be completable in a single focused session (1-4 hours of work).

**Ordering rules:**
- Sanity schema + API routes before UI
- Shared utilities before consumers
- Core flow before edge cases
- Each task must be testable on its own

### Phase 3: Write Detailed Task Descriptions
For EACH task, produce a structured description using this exact template:

---

#### Task N: [Concise title]

**Type:** feat | fix | refactor | chore | test | docs | content
**Scope:** site | services | revenue-engine | glossary | career-paths | case-studies | sales | strategy | sanity | lead-form | probe | emails | seo | infra
**Priority:** Urgent | High | Medium | Low
**Labels:** [Feature Development | Technical Debt | UX/Design | Infrastructure | Content] + [manual | hybrid] if applicable
**Depends on:** Task X, Task Y (or "None")
**Estimated effort:** S (< 1h) | M (1-2h) | L (2-4h) | XL (4h+)

##### Business Value & Significance
Why does this task matter? How does it move the business forward? Connect to leads, authority (referring domains / AI citations), or client delivery — and name the funnel it serves. Remember: the learning hub is measured on citations, NOT leads.

##### Description
Detailed technical description of what needs to be built. Include:
- Exact files to create or modify (with paths)
- Sanity changes (doc types, fields, registration in `schemas/index.ts` + `structure.ts`, draft vs publish)
- API endpoints (method, path, request/response shapes, Zod validation)
- SEO surface (metadata, JSON-LD via `lib/schema.ts`, sitemap impact)
- Copy requirements (voice rules, humanizer pass, ICP language)

##### UI & UX Design Specification
(Skip for backend-only tasks)
- **Page/Component location:** Where in the app does this live?
- **User flow:** Step-by-step what the user sees and does
- **Layout:** Describe the visual arrangement, responsive behavior
- **States:** Loading, empty, error, success, disabled states
- **Interactions:** Clicks, hovers, transitions, animations
- **Copy/Microcopy:** Button labels, placeholder text, error messages, tooltips
- **Accessibility:** Keyboard navigation, ARIA labels, screen reader considerations
- **Brand:** design tokens + `brand/design/palette.yaml`; full-contrast headlines (no muted two-tone heroes)
- **Mobile behavior:** How does it adapt on small screens?

##### Edge Cases to Handle
Bullet list of specific edge cases. Think about:
- Empty/null data scenarios (missing Sanity fields, unpublished drafts)
- Draft vs published perspective (default query perspective hides drafts)
- Network failures / slow connections
- Pagination / large datasets
- Gated-area behavior when env vars are unset (fail closed in prod, open on localhost)
- Browser compatibility / no-JS fallbacks for SEO-critical content

##### Expected Outcome
What does "done" look like? Describe the verifiable end state. Be specific enough that someone can confirm completion without reading the code.

##### How to Test It
Step-by-step testing checklist:
- [ ] Manual test step 1 (describe exact actions and expected results)
- [ ] Manual test step 2
- [ ] Unit test: describe what to test and assertions (`node --test`, co-located in `lib/`)
- [ ] Build gate: `pnpm build` compiles; `npx tsc --noEmit` clean (ignoring the pre-existing `lib/lead-form/*` Zod baseline)
- [ ] Edge case test: describe how to verify each edge case

##### What Needs Manual Implementation
List everything that CANNOT be automated by an AI coding agent:
- Sanity Studio actions (publishing drafts, dataset config)
- Third-party dashboards (HubSpot forms, Resend domains, Calendly, GHL, Smartlead, Turnstile)
- DNS/domain changes, Vercel env vars (+ `.env.local` additions)
- GATE:HUMAN sign-offs (pricing, offers, case-study facts, publishing)
- Copy/content that needs founder approval
- Design decisions requiring human judgment

---

### Phase 4: Quality Checks
Before outputting, verify each task against this checklist:
- [ ] Is the task independently deliverable and testable?
- [ ] Are all file paths real and verified against the codebase?
- [ ] Are edge cases specific (not generic "handle errors")?
- [ ] Is the UI spec detailed enough to implement without a Figma?
- [ ] Does the testing section cover happy path AND failure modes?
- [ ] Are dependencies between tasks explicitly declared?
- [ ] Is the business value tied to a concrete outcome (leads, citations, client delivery), not vague?
- [ ] Does "manual implementation" list include ALL non-automatable work (incl. GATE:HUMAN items)?
- [ ] Is effort estimate realistic given the codebase complexity?

### Phase 5: Tag Classification
For each task, determine the tag:
- **`manual`**: >80% of the work requires human judgment, configuration, or actions outside the codebase (e.g., HubSpot/GHL setup, founder sign-off, copy approval)
- **`hybrid`**: >50% manual work but has significant code components (e.g., implement UI but needs design decisions, write the script but needs API keys)
- No tag: Fully or mostly automatable by a coding agent

### Phase 6: Create in Linear
1. Create all tasks as Linear issues in the correct project
2. Set priorities, labels (including manual/hybrid), and dependencies
3. Add parent issue linking if this is decomposing an existing epic
4. Order them in the correct implementation sequence
5. Report back the full list with issue IDs and links

### Phase 7: Summary Output
After creating all tasks, output:
1. **Task map** — numbered list with Linear IDs, titles, tags, and dependency arrows
2. **Critical path** — which tasks block others, what's the longest chain
3. **Manual work summary** — aggregate of all manual/hybrid items for the human to handle
4. **Estimated total effort** — sum of all task estimates
5. **Risk flags** — anything that could derail implementation (unclear requirements, missing env keys, third-party dependencies, unsigned gates)

Update ROADMAP.md with the new tasks under "Up Next" if they don't have a parent issue already tracked.
