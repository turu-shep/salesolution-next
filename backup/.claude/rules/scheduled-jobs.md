---
globs: **/*
---

# Scheduled Jobs

This project supports scheduled execution of certain commands via cron, CI, or the Claude Code `schedule` skill. The goal is to keep the workflow honest without requiring humans to remember to run maintenance commands.

## Commands that benefit from scheduling

| Command | Recommended cadence | Why |
|---------|-------------------|-----|
| `/sync` | daily | Surface stale Linear state and new comments |
| `/health` | after every merge to main + weekly | Fast enough to run often; catches drift early |
| `/retro` | every 2-4 weeks | Too expensive to run daily; needs enough data to find patterns |
| `/watch-pr --once` | every 10-30 minutes while PRs are open | Closes the review loop without waiting for human sessions |

Commands that should NEVER be scheduled:
- `/implement`, `/pair`, `/batch` — code changes require human-in-the-loop
- `/ship` — PR creation requires explicit intent
- `/undo` — destructive
- `/postmortem` — event-driven, not time-driven
- `/spec`, `/plan` — require human judgment

## How to schedule

**Option A: Claude Code schedule skill**
If the project has access to the `schedule` skill, use it:
```
/schedule add /health after-merge
/schedule add /retro weekly
/schedule add /watch-pr --once every 15m while-open-prs-exist
```

**Option B: CI-driven**
Add a workflow that invokes Claude Code with a specific prompt on a schedule. Example GitHub Actions cron (document but don't auto-create):
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9am UTC
  workflow_dispatch:
```
The workflow runs `/health` or `/retro` and posts the result to a designated location.

**Option C: Local cron / launchd**
For a single developer running this locally, a simple cron entry that posts to a Slack webhook or opens a GitHub issue with the report.

## Posting the output

Scheduled commands produce reports. Those reports need a destination — they're useless in stdout nobody reads.

Configure ONE of these in your CLAUDE.md:
- **Slack channel**: webhook URL stored as a GitHub Actions secret, posted via `curl`
- **Linear document**: create/update a document via Linear MCP
- **GitHub issue**: open an issue with the report (useful for `/health` regressions)
- **Repo file**: commit the report to `.claude/health/<date>.md` (simplest, always works)

The template's default is the repo file approach. Override in your project's CLAUDE.md if you want Slack/Linear delivery.

## Interrupting a loop

For commands like `/watch-pr` that poll continuously:
- The loop should check for a stop signal on each iteration (file `.claude/watch-pr/stop` exists)
- `touch .claude/watch-pr/stop` is the universal kill switch
- The loop should also exit cleanly on SIGINT / user interrupt

## When a scheduled command finds a problem

Scheduled commands don't wake the user up. They deposit findings for the next session:
- `/health` → writes to `.claude/health/<date>.md`; `auto-context` rule surfaces it next session if red
- `/retro` → writes to `.claude/retros/<date>.md`; next session sees proposed changes in the summary
- `/watch-pr` → appends to `.claude/watch-pr/<pr>.json` cursor; next session sees pending blockers

This means: the scheduled jobs are low-urgency by design. For urgent alerts, the user still needs real monitoring (Sentry, PagerDuty, etc.) — this system is NOT a replacement for production alerting.
