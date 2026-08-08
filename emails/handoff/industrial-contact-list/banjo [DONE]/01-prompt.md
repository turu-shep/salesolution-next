# banjo — reopen check

Your mission: refresh if asked, and read `filters_raw` before anything from this source reaches the seated list.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One cached JSONP call, and an explicit Agricultural-vs-Industrial split.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 1 and §3a E1 — Banjo is one of only two widget hits in 64 brands.
4. `../../strategy/01-build-plan.md` §5i — the vertical-code rule.
5. `../../../research/05-widget-sweep.md`.

## The check

Reopen only for a **refresh** — one request: `GET https://cdn.storelocatorwidgets.com/json/031d52ed...`, storelocatorwidgets JSONP, unauthenticated, whole network in one call. The recorded run made **0 origin requests** because it replayed entirely from cache.

**If no refresh is wanted: report that, and STOP.** Complete in one call, nothing left.

## The standing rule

**Read `filters_raw` before seating anything.** It is an explicit **Agricultural vs Industrial** split — this source's §5e code, an off-ICP vertical the locator publishes about itself. Captured verbatim, never averaged over. Banjo is agricultural-leaning by nature (poly fittings and valves), so the industrial slice is a minority of the network, and the code states that outright rather than leaving us to guess from names.

One finding to carry rather than re-derive: of 64 brands swept in E1, **Banjo and Timken were the only two widget hits — they are one-offs, not a pattern**, and that finding killed the widget-sweep hypothesis. Do not use Banjo as evidence for sweeping more widgets.

Pacing: one public CDN endpoint. `emails/scripts/sources/banjo.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `banjo [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
