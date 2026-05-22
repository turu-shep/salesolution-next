---
name: split-tasks
description: Decompose a feature or plan into detailed Linear tasks with edge cases, UX specs, and testability
---

Decompose this into detailed, implementable Linear tasks: $ARGUMENTS

You are a senior product engineer and technical project manager. Your job is to break a feature, epic, or plan into granular Linear issues that another engineer (or AI agent) can pick up and implement with zero ambiguity.

## Process

### Phase 1: Understand the Feature
1. If a Linear issue ID or plan file path is given, fetch/read it for full context
2. Read CLAUDE.md for project conventions, constraints, and architecture
3. Read any module docs (e.g. `docs/modules/`) and convention docs (e.g. `docs/conventions/`) if present
4. Check `.claude/learnings/` for relevant gotchas in the affected areas
5. Search the codebase thoroughly to understand:
   - What already exists that this feature touches
   - What patterns are established for similar features
   - What database tables, API routes, components, and hooks are relevant
   - What access control, permissions, or feature gating applies
   - What user roles are affected

### Phase 2: Decompose into Tasks
Split the feature into the smallest independently-deliverable tasks. Each task should be completable in a single focused session (1-4 hours of work).

**Ordering rules:**
- Database migrations and API routes before UI
- Shared utilities before consumers
- Core flow before edge cases
- Each task must be testable on its own

### Phase 3: Write Detailed Task Descriptions
For EACH task, produce a structured description using this exact template:

---

#### Task N: [Concise title]

**Type:** feat | fix | refactor | chore | test | docs
**Scope:** [domain area — e.g. auth, billing, api, ui]
**Priority:** Urgent | High | Medium | Low
**Labels:** [Feature Development | Technical Debt | UX/Design | Infrastructure] + [manual | hybrid] if applicable
**Depends on:** Task X, Task Y (or "None")
**Estimated effort:** S (< 1h) | M (1-2h) | L (2-4h) | XL (4h+)

##### Business Value & Significance
Why does this task matter? How does it move the product forward? What user pain does it solve or what metric does it improve? Connect to revenue, retention, or activation.

##### Description
Detailed technical description of what needs to be built. Include:
- Exact files to create or modify (with paths)
- Database changes (tables, columns, policies, migrations)
- API endpoints (method, path, request/response shapes)
- State management changes (stores, selectors, hooks)
- Access control / permissions / feature gating

##### UI & UX Design Specification
(Skip for backend-only tasks)
- **Page/Component location:** Where in the app does this live?
- **User flow:** Step-by-step what the user sees and does
- **Layout:** Describe the visual arrangement, responsive behavior
- **States:** Loading, empty, error, success, disabled states
- **Interactions:** Clicks, hovers, transitions, animations
- **Copy/Microcopy:** Button labels, placeholder text, error messages, tooltips
- **Accessibility:** Keyboard navigation, ARIA labels, screen reader considerations
- **Role-specific behavior:** How does the UI differ per role?
- **Mobile behavior:** How does it adapt on small screens?

##### Edge Cases to Handle
Bullet list of specific edge cases. Think about:
- Empty/null data scenarios
- Permission/role mismatches
- Concurrent operations / race conditions
- Feature/tier boundaries
- Network failures / slow connections
- Timezone issues
- Pagination / large datasets
- Browser compatibility
- Multi-role users switching contexts

##### Expected Outcome
What does "done" look like? Describe the verifiable end state. Be specific enough that someone can confirm completion without reading the code.

##### How to Test It
Step-by-step testing checklist:
- [ ] Manual test step 1 (describe exact actions and expected results)
- [ ] Manual test step 2
- [ ] Unit test: describe what to test and assertions
- [ ] Integration test: describe API test scenarios
- [ ] E2E test: describe scenarios (if user-facing)
- [ ] Edge case test: describe how to verify each edge case

##### What Needs Manual Implementation
List everything that CANNOT be automated by an AI coding agent:
- Database/backend dashboard configuration (policies, triggers, indexes)
- Payment provider dashboard setup (products, prices, webhooks)
- Third-party service configuration (email, video, analytics, etc.)
- DNS/domain changes
- Environment variable additions (.env.local)
- Design decisions requiring human judgment
- Copy/content that needs business owner approval
- Data migrations on production
- Security review sign-offs

---

### Phase 4: Quality Checks
Before outputting, verify each task against this checklist:
- [ ] Is the task independently deliverable and testable?
- [ ] Are all file paths real and verified against the codebase?
- [ ] Are edge cases specific (not generic "handle errors")?
- [ ] Is the UI spec detailed enough to implement without a Figma?
- [ ] Does the testing section cover happy path AND failure modes?
- [ ] Are dependencies between tasks explicitly declared?
- [ ] Is the business value tied to a concrete user outcome, not vague?
- [ ] Does "manual implementation" list include ALL non-automatable work?
- [ ] Is effort estimate realistic given the codebase complexity?

### Phase 5: Tag Classification
For each task, determine the tag:
- **`manual`**: >80% of the work requires human judgment, configuration, or actions outside the codebase (e.g., payment dashboard setup, design review, copy writing)
- **`hybrid`**: >50% manual work but has significant code components (e.g., implement UI but needs design decisions, write API but needs backend dashboard config)
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
5. **Risk flags** — anything that could derail implementation (unclear requirements, missing DB functions, third-party dependencies)
