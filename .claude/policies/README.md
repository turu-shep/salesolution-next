# Policies

This directory holds project-specific hard rules enforced by Claude Code commands. See `.claude/rules/policies.md` for the full system documentation.

Each `.md` file in this directory (except this README) is a policy. Policies are consulted by `/plan`, `/implement`, `/ship`, `/batch`, and `/undo` before risky actions.

## Active policies

- `example-secrets-check.md` — No hardcoded secrets in committed files (block)
- `content-drafts-only.md` — Sanity content is seeded as drafts; publishing is manual in /studio (warn)

Files prefixed `proposed-` are drafts from `/postmortem` — not enforced until a human promotes them by renaming.

## Creating a new policy

1. Copy an existing policy as a starting point
2. Edit the frontmatter (`files`, `enforcement`, `triggers`, `requires`)
3. Rewrite the body for your policy
4. Commit — it's live on the next command run

## When to write a policy vs. a learning

- **Learning** (`.claude/learnings/*.md`) — advisory: "heads up, this bit us once"
- **Policy** (`.claude/policies/*.md`) — enforced: "the command will stop if this isn't satisfied"

Promote a learning to a policy when the same issue recurs 2+ times despite the learning being present. `/retro` will flag candidates.
