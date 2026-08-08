---
name: push-task
description: Create a new Linear issue from Claude Code
---

Create a new Linear issue: $ARGUMENTS

Linear context: team **SAL**, project **"SS SEO"** (ask if a different project fits better).

Process:
1. Parse the task description from the arguments
2. Search the codebase to understand scope and affected areas:
   - Identify affected `app/` routes, `components/`, `lib/` modules, `sanity/` schemas, `scripts/`
   - Note which surface it touches: services book (`/services/*`), Revenue Engine (`/revenue-engine/*`), learning hub (`/glossary`, `/career-paths`), gated internal (`/sales`, `/strategy`), or the `emails/` outbound workspace
   - Note Sanity implications (new doc types need registration in `schemas/index.ts` + `structure.ts`; publishing is manual)
   - Note copy implications (customer-facing copy needs the humanizer pass + ICP language rules)
3. Create the issue in Linear with:
   - Title: concise summary
   - Description: detailed description including affected files/areas, which funnel/surface is impacted, and any GATE:HUMAN sign-offs required before shipping
   - Labels: infer from context (bug, feature, improvement, tech-debt, content)
   - Priority: infer from context or ask me
   - Project: "SS SEO" unless clearly something else (ask if unclear)
4. Report back the issue ID and link
5. Add the issue to ROADMAP.md under Up Next (skip silently if ROADMAP.md doesn't exist yet — `/sync` creates it)

If the arguments describe multiple tasks, create separate issues for each and note dependencies.
