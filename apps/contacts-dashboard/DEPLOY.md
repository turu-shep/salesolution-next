# Deploying ss-locations

This app deploys as the Vercel project **ss-locations** (Root Directory
`apps/contacts-dashboard`, team `salesolution`) via the GitHub integration on
pushes to `main`.

**The trap (hit 2026-08-10):** Vercel's unaffected-project skip looks at the
push's HEAD commit. If the last commit of a push doesn't touch
`apps/contacts-dashboard/`, the build is SKIPPED even when an earlier commit in
the same push changed this app. Symptom: the main site deploys, ss-locations
silently stays on the old build.

Do one of:
- order pushes so the dashboard-touching commit is last, or
- push the dashboard change on its own, or
- redeploy from the Vercel UI (project ss-locations → latest commit).

`vercel deploy --prod` from the CLI does NOT work from the repo root (upload
exceeds the 10 MB body limit) and cannot run from this directory (the CLI would
then look for `apps/contacts-dashboard` inside it — Root Directory is a
project setting, not a path hint).
