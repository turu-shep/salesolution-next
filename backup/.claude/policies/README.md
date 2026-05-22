# Policies

This directory holds project-specific hard rules enforced by Claude Code commands. See `.claude/rules/policies.md` for the full system documentation.

Each `.md` file in this directory (except this README) is a policy. Policies are consulted by `/plan`, `/implement`, `/ship`, `/batch`, and `/undo` before risky actions.

## Example policies included

The template ships with a few illustrative examples. **Review them, adjust them to match your project, or delete the ones that don't apply.** They're examples, not mandates.

- `example-auth-pairing.md` — Auth-related changes require `/pair` mode
- `example-migrations-rollback.md` — Database migrations must include rollback SQL
- `example-secrets-check.md` — No hardcoded secrets in committed files

## Creating a new policy

1. Copy an example as a starting point
2. Edit the frontmatter (`files`, `enforcement`, `triggers`, `requires`)
3. Rewrite the body for your policy
4. Commit — it's live on the next command run

## When to write a policy vs. a learning

- **Learning** (`.claude/learnings/*.md`) — advisory: "heads up, this bit us once"
- **Policy** (`.claude/policies/*.md`) — enforced: "the command will stop if this isn't satisfied"

Promote a learning to a policy when the same issue recurs 2+ times despite the learning being present. `/retro` will flag candidates.
