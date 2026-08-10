---
files: ["apps/contacts-dashboard/**"]
type: gotcha
added: 2026-08-10
---

## What happened
A push whose HEAD commit was docs-only (with the dashboard change one commit
below it) deployed the main site but silently skipped the ss-locations Vercel
project — the dashboard stayed on the previous build with no error anywhere.

## Why
Vercel's unaffected-project detection for root-directory projects diffs the
push's head commit, not the whole pushed range. A trailing docs/closeout commit
masks an earlier `apps/contacts-dashboard/` change.

## What to do about it
Make the dashboard-touching commit the LAST commit of the push (or push it
alone). Verify with `gh api "repos/turu-shep/salesolution-next/deployments?environment=Production%20%E2%80%93%20ss-locations&per_page=1"`
that a new deployment exists for the pushed sha. CLI `vercel deploy --prod`
is not a fallback here (10 MB body limit from root; wrong context from the app
dir). Full note: apps/contacts-dashboard/DEPLOY.md.
