---
globs: **/*
---

# Scheduled Jobs

This project supports scheduled execution of certain commands via the Claude Code `schedule` skill, `/loop`, cron, or CI. The goal is to keep the workflow honest without requiring humans to remember to run maintenance commands.

## Commands that benefit from scheduling

| Command | Recommended cadence | Why |
|---------|-------------------|-----|
| `/sync` | daily | Surface stale Linear state and new comments |
| `/health` | after every merge to main + weekly | Fast enough to run often; catches drift early |
| `/retro` | every 2-4 weeks | Too expensive to run daily; needs enough data to find patterns |
| `/watch-pr --once` | every 15-30 minutes while PRs are open | Closes the review loop without waiting for human sessions |

Commands that should NEVER be scheduled:
- `/implement`, `/pair`, `/batch` — code changes require human-in-the-loop
- `/ship` — PR creation requires explicit intent
- `/undo` — destructive
- `/postmortem` — event-driven, not time-driven
- `/spec`, `/plan` — require human judgment
- Anything that sends outbound email — sends are always explicitly human-triggered

## How to schedule

**Option A: Claude Code schedule skill / /loop**
Use the installed `schedule` skill for recurring cloud agents, or `/loop` for in-session polling (e.g. `/loop 15m /watch-pr --once`).

**Option B: CI-driven**
Add a workflow that invokes Claude Code with a specific prompt on a schedule. Example GitHub Actions cron (document but don't auto-create):
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9am UTC
  workflow_dispatch:
```

**Option C: Local cron / launchd**
For a single operator running locally, a cron entry that runs the command headless and leaves the report file for the next session.

## Posting the output

Scheduled commands produce reports. Those reports need a destination — they're useless in stdout nobody reads.

The default here is the **repo file** approach:
- `/health` → `.claude/health/<date>.md`
- `/retro` → `.claude/retros/<date>.md`
- `/watch-pr` → cursor in `.claude/watch-pr/`, findings surfaced next session

Override (Slack webhook, Linear document) only if configured explicitly.

## Interrupting a loop

For commands like `/watch-pr` that poll continuously:
- The loop should check for a stop signal on each iteration (file `.claude/watch-pr/stop` exists)
- `touch .claude/watch-pr/stop` is the universal kill switch
- The loop should also exit cleanly on SIGINT / user interrupt

## When a scheduled command finds a problem

Scheduled commands don't wake the user up. They deposit findings for the next session:
- `/health` → writes to `.claude/health/<date>.md`; the `auto-context` rule surfaces it next session if something is flagged
- `/retro` → writes to `.claude/retros/<date>.md`; next session sees proposed changes in the summary
- `/watch-pr` → appends to `.claude/watch-pr/<pr>.json` cursor; next session sees pending blockers

This means: the scheduled jobs are low-urgency by design. For urgent alerts (site down, form failures), the user still needs real monitoring (Sentry, uptime checks) — this system is NOT a replacement for production alerting.
