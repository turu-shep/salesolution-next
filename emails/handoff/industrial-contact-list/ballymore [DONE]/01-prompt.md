# ballymore — reopen check

Your mission: refresh if asked, decode the two category tag ids if Ballymore has published a legend, and keep every email from this source inside its own cohort.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. Storemapper JSONP, one request, and 99.7% email fill.
3. `../../strategy/00-sourcing-strategy.md` §3a E1 and **§7.2 (GATE-L6, manufacturer-published emails)**.
4. `../../strategy/01-build-plan.md` §7 risk-1.
5. `../../../research/05-widget-sweep.md`.

## The check

Reopen for one of two reasons:

**(a) A refresh.** One request: `GET https://www.storemapper.co/api/users/28644-.../stores.js?callback=...` — Storemapper JSONP, unauthenticated, whole network in one call.

**(b) Ballymore publishes the category legend.** The **category tag ids (22459 / 22458) are undecoded** — no label exists on the page or in the payload, so they are captured verbatim and left unmapped per §3. If a legend appears, **decode it before re-seating**: the standing rule from Timken and Yaskawa is that an unread source-native code is where wrong-vertical records hide.

**If neither applies: report that, and STOP.** Nothing is left to fetch. Like Lovejoy, the raw count flatters it — 1,183 US records to 117 companies, which E1 called in advance.

## The rule that outlives the refresh

**Keep the Cohort-E isolation on any record whose email came from here.** Email fill is 99.7% — the highest anywhere in the inventory — and that is exactly why it matters: this is a GATE-L6 cohort source, and **those addresses ship in their own micro-campaign cohort, never blended into the main list** (§7.2, non-negotiable on deliverability grounds — their bounce and complaint rates are unmeasured against a 2% kill line).

One parsing note for any re-run: **the address is one combined string.** `address_1`/`city`/`state`/`zip_raw` are a best-effort split and `address_raw` is authoritative.

Pacing: one public endpoint, one origin request. `emails/scripts/sources/ballymore.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `ballymore [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
