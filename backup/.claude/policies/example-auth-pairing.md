---
name: auth-pairing
files: ["**/auth/**", "**/middleware.ts", "**/middleware/**"]
enforcement: block
triggers: ["implement", "batch", "ship"]
requires: ["pair-mode", "spec-exists"]
---

# Policy: Auth changes require pair mode and a spec

## Why this policy exists
Auth bugs have disproportionate blast radius — a broken session check or an incorrect permission grant can expose every user's data at once. Pair mode catches these before commit with a second independent review, and specs force the scope to be pinned down before code is written.

## What it requires
Any change touching files matching `files:` above must:
1. Be implemented via `/pair`, not `/implement` (so a reviewer subagent sees every chunk)
2. Have an existing spec at `docs/specs/<issue-id>.md` with a non-empty "failure modes" section

## How to satisfy it
- Run `/spec <issue>` first if no spec exists
- Use `/pair <issue>` instead of `/implement <issue>`
- If batching: pass `--pair` to `/batch` for any batch containing auth issues

## How to verify
- Check that the current command is `/pair` (or that the batch has the `--pair` flag)
- Check that `docs/specs/<issue-id>.md` exists and has a non-empty "Failure modes" section

## Override
Only the human user, by typing `override policy auth-pairing` with a reason. Override is logged to `.claude/decisions.jsonl` with `type: policy-override`. `/retro` will surface all auth-pairing overrides — they should be rare.
