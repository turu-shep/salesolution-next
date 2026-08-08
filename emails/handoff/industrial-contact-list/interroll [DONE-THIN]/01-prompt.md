# interroll — reopen check

Your mission: refresh the 13 requests if asked, and watch the array-valued field that a latent bug is armed against.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 14 US partners, two source-native codes, and a measured absence of a vertical code.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 — one of the six easy-tier adjacent-segment brands.
4. `../../strategy/01-build-plan.md` §5i and **§5m — the latent `split()` bug that would have destroyed `solutions_raw`.**
5. `../../../data/raw/_acquisition-log-2026-08-01.md` wave 3, "The other four".

## The check

Reopen only for a **refresh** — 13 requests against `https://www.rollingoninterroll.com/en/global-partner-network/explore/north-am/u-s-a.html`: static Joomla HTML, two index pages plus one detail page per partner, no JS, no anti-bot.

**If no refresh is wanted: report that, and STOP.** Two index pages enumerate the US country page and every partner's detail page was read. There is no hidden facet, no pagination and no radius — the US page is the list.

## If a re-emit runs, watch this

**§5m found a latent `String(v).split('|')` bug armed against exactly `solutions_raw`** — an array-valued field. It would have glued the codes into one unmatchable token **silently**. Check it before trusting any re-emit's output.

Two source-native codes, both captured verbatim and left unmapped:

- `partner_tier_token` — **partner 10 · accelerator 4**, published only as `/images/approved-logos/approved-*.png`.
- `solutions_raw[]` — a per-partner Interroll technology list. It is a **line card, not brands**: it routes to `line_card[]` with `brand_authorized[] = ['Interroll']`, or S3 reads a single-brand partner as a multi-brand distributor.

**Measured absence of a vertical code:** Interroll's locator exposes no market split, so the §5e Timken failure mode cannot occur here. Recorded as measured, not assumed.

## Do not go looking for a bigger pull

**Thin because the source is small.** `research/06` measured 13 US partners; we measured 14 — two independent reads of the same published network, one apart.

The wave's honest note applies here: Interroll, FlexLink and mk together contributed 23 companies for 121 requests, against `research/06`'s "under ten requests for ~50 companies". The estimate was optimistic on both counts.

Pacing: public pages, `_polite.py`, 13 origin requests, zero refusals. `emails/scripts/sources/interroll.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `interroll [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
