---
files: ["agent prompts using isolation: \"worktree\"", "parallel batches > 2 agents"]
type: gotcha
added: 2026-05-06
---

## What happened

A 6-agent parallel batch (FA-411, FA-412, FA-413, FA-414, FA-417, FA-428) all spawned with `isolation: "worktree"` and `run_in_background: true`. **5 of 6 workers reported the main repo's working tree being checked-out / branch-switched / overwritten by sibling agents during their work.** The agents detected mid-task branch flips between `fa-411`, `fa-413`, `fa-414`, `fa-417`, `staging`, etc., and had to recover.

Each affected worker independently invented the same workaround: manually create a fresh `git worktree` at `D:/Projects/fa-XXX-worktree/` (with a `node_modules` directory junction back to the main checkout for `node_modules` reuse) and do their work + commit + push from there.

One worker (FA-414) escalated further — wrote all their edits as a single Node patch script driven by a JSON data file so the batch landed atomically rather than being stomped between individual `Edit` tool calls.

## Why

The `isolation: "worktree"` parameter on the Agent tool is supposed to create a temporary, isolated git worktree per agent so they can't interfere with each other's working trees. In practice, on this Windows + multi-agent setup, **siblings appear to share or churn the main checkout's branch state**. The exact failure mode wasn't fully diagnosed (could be: harness bug, working-directory inheritance, OS-level path collision, multiple agents trying to checkout the same branch simultaneously).

The pattern is consistent — every parallel batch with 3+ agents has shown this. 1-2 agent batches don't trigger it. Earlier batches in this same project (FA-406/407/409 — 3 agents; FA-443/445 — 2 agents; FA-444/446 — 2 agents) had less severe symptoms; the 6-agent batch was the most affected.

## What to do about it

### When prompting batch agents

1. **Tell them upfront that the main repo working tree may be racing.** Add to the prompt: "If you detect mid-task branch flips or stale file content in `D:/Projects/field-advisor-front`, fall back to creating an isolated worktree at `D:/Projects/<ticket>-worktree/` from `origin/staging` and do all work + commits + push from there. This is a known issue with parallel `isolation: \"worktree\"` agents on this setup."

2. **Encourage atomic edits.** When edits span 5+ files, suggest the agent batch them into a single tool call sequence or a Node patch script (per FA-414's workaround) so partial states aren't visible to sibling agents.

3. **Cap parallelism at 3-4 agents per batch.** Above that, the race intensifies. If you have 6+ tickets, run two batches of 3 sequentially rather than one batch of 6 in parallel. Total wall-clock time is similar; recovery time per agent drops dramatically.

### When coordinating

4. **Don't rely on the main checkout's branch state during a batch.** If you need to inspect code while agents are running, do it via `git show origin/<branch>:<file>` or read from a separate clean worktree — not from `D:/Projects/field-advisor-front` directly.

5. **Trust the worker's manual worktree.** When an agent reports "I created `D:/Projects/<ticket>-worktree/` because of branch churn", that's a successful adaptation, not a problem. Their PR is correct; the main checkout being in a weird state during the batch is expected.

### Long-term

6. **File a bug / question to the harness owner** if this persists. The expectation of `isolation: "worktree"` is that workers can't interfere with each other; the observed behavior contradicts that. May be Windows-specific, may be a known issue with the SDK, may be configuration drift in this project. Worth a `claude-code-guide` agent query to see if there's documented behavior for this.

## Related

- 6-agent batch on 2026-05-06: 5/6 reported the issue, all recovered with manual worktrees
- Earlier 4-agent batch (Phase 2 — FA-448/449/450/451): less severe, partially manifested in FA-450's "harness instability" comment
- Earlier 2-agent batches (Phase 1): minimal/no impact
- The simplify-stop pattern (`.claude/learnings/agent-stops-at-simplify.md`) is unrelated but compounds the recovery cost — a worker that hits both has to debug branch state AND remember to run the full post-impl checklist.
