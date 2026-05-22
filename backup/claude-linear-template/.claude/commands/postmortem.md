---
name: postmortem
description: Reconstruct a production incident, identify the change that caused it, capture high-severity learnings and propose policies
---

Run a postmortem on an incident: $ARGUMENTS

Production incidents are the highest-signal learning source any project has. This command reconstructs what happened, identifies the change that caused it, captures the lesson as a high-severity learning, and (if the pattern warrants) proposes a new policy to prevent recurrence.

## Invocation patterns

```
/postmortem                                      # ask for incident details interactively
/postmortem "Checkout broke at 2026-04-10 14:32 UTC — 500s from /api/checkout"
/postmortem sentry:<issue-id>                    # pull details from Sentry MCP if configured
/postmortem pr:<pr-num>                          # reverse-engineer: what did this PR break?
/postmortem commit:<sha>                         # same, starting from a suspect commit
```

## Process

### 1. Gather incident material

**From the user (interactive):**
If $ARGUMENTS doesn't contain enough detail, ask:
- When did the incident start (UTC)?
- When was it noticed?
- What user-visible symptom? (500s, wrong data, slowness, missing feature)
- How was it detected? (user report, alert, monitoring, accident)
- Is it resolved? If yes, how (rollback / hotfix / auto-recovered)?
- Estimated blast radius (users affected, duration)

**From Sentry MCP (if available):**
If `sentry:<issue-id>` was passed, fetch:
- The issue details, stack trace, affected users, first seen
- Related events around the same time
- Breadcrumbs leading up to the error

**From git history:**
- `git log --before="<incident-ts>" --until="<incident-ts>" --format="%h %ci %s %ae"` — commits in the window
- `git log --before="<incident-ts>" --since="1 day before" --oneline` — the deploy window
- Identify merged PRs in that window: `gh pr list --state merged --search "merged:<date-range>"`

**From Linear:**
- Check if any issues match the incident symptom
- Check if any recently closed issues touched the affected area

**From `.claude/decisions.jsonl`:**
- Grep for decisions in the last 2 weeks touching files in the affected area
- Pay special attention to `policy-override` entries — overrides often correlate with incidents

### 2. Identify the suspect change

Using the evidence:
- **Did a recent deploy correlate with the incident start time?** If yes, identify the deployed commits.
- **Of those commits, which touched files in the affected area?** Narrow the suspect list.
- **Run `git blame` on the lines that appear in error stack traces.** The blame should point to the suspect commit.

Present the suspect(s) to the user with the concrete evidence — NOT with fake probabilities:
```
Suspect changes (ordered by strength of evidence):

  1. <sha> — <commit subject> by <author>
     Evidence: touches <file> that appears in the incident stack trace;
               deployed at <ts>, 10 min before the incident started
     Relationship: direct — file in error trace

  2. <sha> — <commit subject> by <author>
     Evidence: touches <adjacent file> that imports the broken module;
               same deploy window
     Relationship: indirect — adjacent module

  3. <sha> — <commit subject> by <author>
     Evidence: unrelated area; included only because it was in the same deploy
     Relationship: coincidental — include for completeness
```

Rank by the strength of *concrete evidence*, not by a made-up probability number. A "probability: HIGH" label without statistics is theater — just describe what you can see (file appears in stack trace, timestamp correlation, etc.) and let the human judge.

Wait for user confirmation or correction before proceeding to the root-cause analysis.

### 3. Trace the failure mechanism
For the confirmed suspect:
- What change did it make?
- What assumption did the change rely on?
- Why did the assumption break in production but not in tests/staging?
- Was there a test that should have caught this but didn't?
- Was there a decision logged at the time the change was made? If so, what alternatives were considered?

This section is the meat of the postmortem — the WHY, not just the WHAT.

### 4. Write the postmortem doc

Save to `docs/postmortems/<YYYY-MM-DD>-<short-name>.md`:

```markdown
# Postmortem: <short name>

**Date:** <incident date, UTC>
**Duration:** <start → end>
**Author:** <user>
**Severity:** S1 / S2 / S3 / S4
**Status:** resolved | mitigating | investigating

## Summary
1-3 sentences: what broke, who was affected, how it was resolved.

## Timeline (UTC)
- HH:MM — <event>
- HH:MM — <event>
- HH:MM — incident detected
- HH:MM — <mitigation>
- HH:MM — resolved

## Root cause
The actual mechanism, not the trigger. The trigger is "commit X was deployed". The root cause is "commit X assumed Y, but production environment has Z".

## Suspect change
- Commit: <sha>
- PR: <url>
- Author: <user>
- Files: <list>
- Decision log entry: <ts> (if any)

## What we tried and didn't work
If the debugging path included dead ends, record them. Someone else will face similar symptoms later.

## Resolution
How it was fixed.

## Blast radius
- Users affected: N
- Duration: <minutes>
- Data integrity impact: <none / recoverable / lost>
- Financial impact: <if known>

## Why this wasn't caught earlier
- Was there a test? Why didn't it catch this?
- Was there a module doc describing the invariant that was broken? Why wasn't it updated?
- Was there a policy? Why wasn't it triggered?
- Was there a learning? Why wasn't it heeded?

This section drives the action items.

## Action items
| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | <specific action> | @user | P0/P1/P2 |

## Learnings
Link to new learning files captured from this postmortem (see step 5).

## Policies
Link to new or updated policies (see step 6).
```

### 5. Capture a high-severity learning

Create a file in `.claude/learnings/` with `severity: high`:

```markdown
---
files: ["<files-from-the-suspect-commit>"]
type: gotcha
severity: high
added: <today>
incident: <postmortem-file-path>
---

## What happened
<The actual failure — concrete>

## Why
<The assumption that broke>

## What to do about it
<The specific rule to apply next time editing these files>
```

The `incident:` frontmatter field ties the learning back to the postmortem doc — future `/retro` runs will surface these as high-value learnings.

### 6. Propose a policy (if warranted)

Not every incident deserves a policy — only ones where the same class of failure could recur. Consider proposing a policy if:
- The root cause was preventable by a mechanical check (missing rollback SQL, missing test, missing type check)
- The same class of incident has happened before (grep `docs/postmortems/` for similar root causes)
- The change bypassed an existing safety mechanism (e.g., overrode a policy, skipped pair mode, no spec)

Draft a policy file in `.claude/policies/proposed-<short-name>.md` (marked "proposed" so it's not enforced until the human promotes it by renaming). Show the draft to the user and wait for approval.

### 7. Update the Linear issue (or create one)
- If the incident has a Linear issue, add the postmortem link to it
- Otherwise create a new issue titled "Postmortem: <short-name>" with the action items as a checklist
- Set priority to P0 or P1 based on severity

### 8. Log the postmortem
Append to `.claude/decisions.jsonl`:
```json
{"ts":"...","type":"postmortem","incident":"<short-name>","severity":"S2","suspect_commit":"<sha>","learnings_created":N,"policy_proposed":true,"postmortem_file":"docs/postmortems/..."}
```

### 9. Notify stakeholders
If the project's CLAUDE.md specifies a notification channel (Slack, Linear doc, email), post a summary there. Otherwise print the summary for the user to share manually.

## Important

- **Blameless.** Postmortems focus on systems, not individuals. Never frame the root cause as "@user wrote bad code". Frame it as "the review process didn't catch X" or "the test coverage missed Y".
- **Don't guess at root causes.** If the evidence is inconclusive, say so. "Suspect: commit X" is better than "root cause: commit X" when you're not sure.
- **Act on the findings.** A postmortem without action items is just storytelling. Every postmortem should produce at least one: a learning, a policy, a test, or a process change.
- **Review old postmortems when /retro runs.** If the same class of incident recurs, the action items weren't enough.

## Batch mode

Not applicable — incidents are individual events. If there were multiple simultaneous incidents, write one postmortem per root cause.
