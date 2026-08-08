---
globs: **/*
---

# Batch Mode — Natural Language Detection

The user prefers to run multiple Linear issues at once via parallel isolated worktrees rather than cherry-picking commands per issue. Recognize batch intent from natural language and route to `.claude/commands/batch.md`.

## When to route to batch mode

Trigger batch mode when the user's message contains:

- **Multiple issue IDs** in a single request (two or more `[A-Z]+-\d+` tokens), AND
- **Any action verb** suggesting execution: "implement", "ship", "deliver", "do", "run", "tackle", "knock out", "finish"

Examples that SHOULD route to batch mode:
- "Implement SAL-473, SAL-471, and SAL-474 in parallel worktrees. Create branches, implement, commit, push, and open PRs."
- "Let's knock out SAL-419, SAL-475, and SAL-477"
- "Ship SAL-473 SAL-471 SAL-474"
- "Do all the In Progress issues assigned to me"
- "Run SAL-473 and SAL-474 in pair mode"

Examples that should NOT route to batch mode:
- "Look at SAL-473 and SAL-474" (exploration, not execution)
- "Compare SAL-473 and SAL-474" (analysis)
- "What's the status of SAL-473 and SAL-474?" (query — use `/sync`)
- "Implement SAL-473" (single issue — use `/pull-task` + `/implement`)

## How to route

When you detect batch intent:

1. Acknowledge briefly: "Batch mode — N issues detected."
2. Invoke `.claude/commands/batch.md` with the parsed arguments (pass the natural language through — the batch command's own parser handles it).
3. Do NOT ask the user to rewrite their message as a slash command. The point of this rule is that the user shouldn't have to learn a specific syntax.

## Flag inference from natural language

Map phrases to batch flags automatically:

| Phrase | Flag |
|--------|------|
| "in pair mode", "with pair review", "pair them" | `--pair` |
| "show me plans first", "review plans", "let me see the plans" | `--review-plans` |
| "don't open PRs", "don't ship", "just commit" | `--no-ship` |
| "don't push", "local only" | `--no-push` |
| "one at a time", "sequentially", "not in parallel" | `--sequential` |
| "up to N", "max N parallel" | `--max-parallel N` |
| "target <branch>", "base <branch>", "against <branch>" | `--base <branch>` |

If the user says "in parallel worktrees" explicitly, that's just an affirmation of default behavior — no flag needed.

## Confirmation before launch

Even in batch mode, ALWAYS confirm the parsed issue list before spawning sub-agents. The batch command itself enforces this, but this rule is a reminder: natural-language parsing is lossy, and the user should verify the interpretation before multiple worktrees get created.

Exception: if the user explicitly says "no confirmation" / "go" / "just do it", proceed without the confirmation step.

## Related commands that should support batch

The following commands have a "Batch mode" section at the bottom of their spec — they accept multiple issue IDs too, but operate sequentially (they don't spawn worktrees; they just iterate):
- `/undo` — revert the last step for multiple issues
- `/handoff` — write continuity docs for multiple in-progress issues
- `/ship` — ship multiple branches at once (requires each to be on its own branch already)
- `/spec` — write specs for multiple issues
- `/health` — include multiple issue areas in the health report

For anything requiring *parallel worktree isolation*, use `/batch`. For sequential multi-issue operations, use the command's own batch mode.
