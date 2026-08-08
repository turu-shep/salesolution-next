# atlascopco — reopen check

Your mission: confirm that this static page is finished and that the real reopen lives in the E4 headless tier — then stop, unless E4 has been funded and cleared.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One static page, 10 companies, and the honest admission that we stopped early.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 1 — listed as "static HTML incl. website".
4. `../../strategy/01-build-plan.md` §5i and §5u (D1 — Atlas Copco inboxes voided).
5. `../../../research/01-dealer-locator-sources.md`.

## The check

**This page is done.** `GET https://www.atlascopco.com/en-us/compressors/contact-number/authorized-partners` is one static, server-rendered page, and one request is the whole of it. Another GET against the same URL is not the follow-up.

The genuine reopen condition is **E4**: if the headless tier is ever funded and built, Atlas Copco is a named candidate, and **this static page becomes the baseline to measure it against — 10 companies, so any lift is unambiguous.**

**If E4 has not been built: report that, and STOP.** The work belongs in `e4-headless-locators/`, where Atlas Copco needs **its own robots-posture GATE:HUMAN** like every other locator there.

## What the thinness actually means

**Thin because we stopped early — not because Atlas Copco's network is 10 companies.** The correction is recorded in the payload itself: `research/01`'s "static state-by-state (~hundreds)" **overstates this page**, which renders *a partial set of state headings* and a few dozen partner blocks, several of them Caribbean and LatAm rather than US. A compressor manufacturer of this size does not have ten US authorized partners. The real network is behind Atlas Copco's interactive locator, which is a rendered app.

No type, tier or vertical facet exists on this page — a measured absence.

## One defect to re-apply on any future pull

**Atlas Copco corporate inboxes reached seated rows** and were voided in §5u's D1 sweep, including via `atlascopcousa.com` — which the brand rule caught rather than the domain list. Any new pull re-applies it: an email whose domain is a known manufacturer domain and does not match the company's own domain is invalid.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `atlascopco [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
