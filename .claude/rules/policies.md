---
globs: **/*
---

# Policy Engine

This project uses `.claude/policies/*.md` to encode hard rules that must be checked before risky actions. Policies are the project's institutional memory about "things we learned the hard way not to do" — the next level up from learnings.

## Difference between learnings, module docs, and policies

| Type | Role | Example |
|------|------|---------|
| **Learning** | "Here's a gotcha to be aware of" | "Default Sanity query perspective hides drafts — use `perspective: 'raw'`" |
| **Module doc** | "Here's how this feature works" | `docs/modules/lead-funnel.md` describes the lead capture flow |
| **Policy** | "Here's a rule that MUST be followed, enforced by commands" | "Content-seeding scripts must create drafts, never publish" |

Policies have teeth. Learnings are advisory; policies block.

## When a policy triggers

Before executing any risky action, commands consult `.claude/policies/*.md`:
- `/plan` surfaces applicable policies to the user
- `/implement` blocks (or warns) when a policy's `files:` pattern matches the step's files
- `/ship` blocks when a policy's requirements aren't met
- `/batch` surfaces policies for the entire batch BEFORE launching sub-agents
- `/undo` checks whether the target commits crossed a policy boundary

## Policy file format

Save to `.claude/policies/<short-name>.md`:

```markdown
---
name: <short-name>
files: ["<glob1>", "<glob2>"]
enforcement: block | warn
triggers: ["plan", "implement", "ship", "batch"]
requires: ["<requirement1>", "<requirement2>"]
---

# Policy: <short-name>

## Why this policy exists
<1-2 sentences: the incident or principle that led to this rule being codified>

## What it requires
<Specific, verifiable requirements>

## How to satisfy it
<Step-by-step instructions for the developer (human or AI) to comply>

## How commands verify it
<What a command running this policy check should actually verify — concretely>

## Override
<Who can override this policy, and how. Usually: "the human user, by explicitly saying 'override policy <name>' — the override is logged as a decision in .claude/decisions.jsonl">
```

## Enforceable `requires:` vocabulary

These are the requirements that commands can actually verify. If you want a policy to enforce something outside this list, you'll need to either (a) add a one-off check inline in the policy body for Claude to run, or (b) extend the vocabulary by defining a new requirement and writing the verification logic.

**Verified by direct file/command inspection (reliable):**

| Requirement | What the command checks |
|-------------|------------------------|
| `pair-mode` | The active command must be `/pair` (or `/batch --pair` for batched work). Verified by checking the command that invoked the policy check. |
| `spec-exists` | `docs/specs/<issue-id>.md` must exist and not have `Status: draft`. Verified by file read. |
| `no-hardcoded-secrets` | Grep the diff for common secret prefixes (`sk_`, `sk-ant-`, `pk_live_`, `ghp_`, `xox[baprs]-`, `AKIA`, `AIza`, `re_`, `-----BEGIN ... PRIVATE KEY-----`) and for string literals assigned to variables named `password`/`secret`/`token`/`api_key`. Skip test files and `.env.local.example`. |
| `rollback-sql-present` | For files matching a SQL-migration glob, check for a rollback indicator. (Dormant in this repo — no SQL migrations; kept for template compatibility.) |
| `human-approval` | The command must pause and prompt the user for an explicit yes before proceeding. Cannot be satisfied in `/batch` sub-agent mode — policies with this requirement halt the batch for that issue. |
| `linked-decision` | An entry in `.claude/decisions.jsonl` for the current issue, written during this session, must exist before the command proceeds. |

**That's the whole list.** Earlier drafts included `test-coverage-min-N`, `changelog-entry`, and several others. Those are aspirational — commands don't have reliable ways to verify them without project-specific tooling. If you want test coverage enforcement, use CI; don't put it in a policy file.

## Inline checks (for anything outside the vocabulary)

If you need a policy that enforces something not in the vocabulary, put the check in the policy's "How commands verify it" section as a concrete shell command or file inspection. Commands running the policy check will execute whatever's there:

```markdown
## How commands verify it
Run: `grep -rn "\.publish()" scripts/ | grep -v test`
Fail if any hit is in the diff. (Seeding scripts create drafts; publishing is manual in /studio.)
```

This is less reliable than the built-in vocabulary — Claude has to interpret and run the check — but it lets you encode project-specific rules without extending the template itself.

## How commands consult policies

1. Glob `.claude/policies/*.md`
2. For each policy, check if its `files:` patterns match the files about to be touched
3. For each match, check if the command is in the policy's `triggers:` list
4. If yes:
   - For each item in `requires:`, run the verification (either from the built-in vocabulary or from the inline "How commands verify it" section)
   - On failure:
     - `enforcement: block` → STOP, surface the policy, require explicit override
     - `enforcement: warn` → show the warning, continue

## Override protocol

When a user overrides a policy:

1. The override MUST be explicit. Require the user to type the policy name: `override policy content-drafts-only` plus a reason.
2. Log a `type: policy-override` entry to `.claude/decisions.jsonl` with the policy name, the reason, and the command that triggered it.
3. `/retro` surfaces all overrides. A policy that's overridden often is either wrong or needs refinement.

## What to put in a policy

**Good policies (enforceable with the built-in vocabulary or a concrete inline check):**
- No hardcoded secrets → `requires: ["no-hardcoded-secrets"]`
- Content seeded as drafts, never published by scripts → inline check
- Case-study fact changes require the fact-ledger consulted + human approval → `requires: ["human-approval"]`
- Certain files require a decision log entry for each change → `requires: ["linked-decision"]`

**Bad policies:**
- "Use 2-space indentation" → belongs in the formatter config
- "Don't use `any` in TypeScript" → belongs in ESLint config
- Anything the compiler, linter, or type-checker already enforces
- Anything requiring a project-specific tool that Claude can't run reliably

Policies are for things normal tooling can't catch but that matter enough to fail loudly.

## Creating policies

Policies should usually be added in response to an incident — something broke, the team decided "never again", and the policy encodes that decision. `/postmortem` can propose new policies when it traces a failure to a missing safeguard. `/retro` can surface recurring incidents as policy candidates.

To create a policy manually: create the file, write the frontmatter, write the body, commit. The policy is live on the next command run.
