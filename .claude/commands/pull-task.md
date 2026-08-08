---
name: pull-task
description: Pull the next prioritized task from Linear and set up for implementation
---

Pull and prepare the next task from Linear: $ARGUMENTS

Linear context: team **SAL**, project **"SS SEO"** (unless the issue says otherwise).

Process:
1. If no specific issue ID given, search Linear for issues assigned to me with status "Todo" or "Backlog", sorted by priority
2. Show the top 3 issues with: title, priority, labels, description preview
3. After I pick one (or if a specific issue ID was given):
   a. Read the full issue details from Linear (description, comments, linked issues, labels)
   b. Update the issue status in Linear to "In Progress"
   c. Add a comment on the issue: "Starting implementation in Claude Code"
   d. Update ROADMAP.md — move this task to In Progress with the Linear issue ID (create ROADMAP.md via `/sync` if it doesn't exist yet)
   e. Search the codebase for related files based on the issue description:
      - Check `app/` for related routes/pages and `app/api/` for endpoints
      - Check `components/` for related UI
      - Check `lib/` for related business logic (`business.ts`, `schema.ts`, `navigation.ts`, `lead-form/`, `probe/`)
      - Check `sanity/` for related schemas, GROQ queries, fetchers
      - Check `scripts/` / `emails/scripts/` for related ops scripts
      - For content tasks: check `prompts/_CONTEXT.md` and the matching `docs/strategy/` docs FIRST
   f. Create an implementation plan in docs/plans/[issue-id].md

The plan file must include:
- Linear issue ID and link at the top
- Which existing patterns/components to reuse (check `components/` and `lib/`)
- Files to create or modify
- Sanity changes needed (schema additions must be registered in `sanity/schemas/index.ts` AND `sanity/structure.ts`; content is seeded as drafts; publishing is manual in `/studio`)
- Voice/copy requirements if any page copy changes (humanizer pass, kill-list, ICP language rules)
- SEO/JSON-LD considerations (`lib/schema.ts`) for new or changed public pages
- Step-by-step implementation order with dependencies
- Test strategy (`node --test` for lib logic; `pnpm build` as the compile gate)

DO NOT write any code yet. Only produce the plan.

After creating the plan:
1. Create a feature branch using the Linear issue ID:
   `git checkout -b [issue-id-lowercase]-[short-description]`
   Example: `git checkout -b sal-123-glossary-hovercards`
   This auto-links the branch to the Linear issue and triggers "In Progress" status.
2. Make an initial empty commit to establish the branch:
   `git commit --allow-empty -m "chore: start work on [SAL-123] [description]"`
3. Push the branch: `git push -u origin [branch-name]`
