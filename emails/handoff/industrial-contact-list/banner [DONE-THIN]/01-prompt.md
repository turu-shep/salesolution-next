# banner — reopen check, not a rebuild

Your mission: decide whether anything about Banner Engineering has changed
enough to justify touching a host that publishes `Disallow: /`. Almost certainly
it has not. Read the dossier, test the two named reopen conditions, report, and
**STOP if neither holds**.

This source was built to exhaustion on 2026-08-04 under **gate R-1**, the only
robots override Artur has signed. It is closed. This prompt exists so the next
session does not re-litigate that from scratch — and so nobody re-runs a sweep
against a `Disallow` host out of momentum.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. §3 is the one that matters: it
   records what the override actually bought, which is not what it was signed
   for.
3. `../../strategy/00-sourcing-strategy.md` **§9, the R-1 row** — the signature
   itself, its stated scope (robots.txt on `api2d.bannerengineering.com` only),
   and the counter-argument Artur was shown before signing. **The scope is the
   binding part.** It does not extend to any other host, to any credential
   boundary, or to a 403.
4. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` **§6 R-1** —
   the evidence the gate was decided on.
5. `../../strategy/01-build-plan.md` **§5i** — capture every source-native code
   verbatim, then TEST whether it sorts before claiming it as a signal. Banner
   is now the second full worked example of that rule biting (SKF was the
   first), and the dossier's §3 is the write-up.

## The reopen conditions

Two, and only two. Both are cheap to test and neither involves the API.

1. **Banner starts publishing a distributor grade.** The payload today carries
   an *exclusion* axis (`CATEGORY_CODE` ∈ DISTRIBUTOR / REPRESENTATIVE /
   BANNER, plus `TERR_GROUP` ∈ DIST / REP / ASM_SITES) and no grade: every
   dealer row is the single value `DISTRIBUTOR`. The bundle's vocabulary also
   names `JOINT VENTURE` and `SUBTYPE=DIGITAL`, and the national sweep never
   observed either. If Banner ever ships a tier — "Certified", "Premier",
   "Solutions Partner" — the qualification signal R-1 was signed for would
   finally exist.

   **How to test it without a request:** re-read the cached bundle at
   `data/raw/_cache/e4bundle-banner/bundle-0.js` against a fresh copy of
   `/etc.clientlibs/designs/banner/clientlibs/wheretobuy.min.js`. That file is
   on `www.bannerengineering.com`, whose robots.txt **allows** it (`Allow:
   /etc/*.js`; nothing in the `*` block matches the clientlibs path). One GET,
   no override involved. If the switch statement still reads
   `BANNER / DISTRIBUTOR / REPRESENTATIVE / JOINT VENTURE`, nothing has changed
   and you are done.

2. **The ICP extends to automation integrators.** 100% of the network is
   `CATEGORY_CODE=DISTRIBUTOR` and a large share are control-panel builders and
   automation integrators rather than MRO distributors — see the dossier's
   vertical-contamination measurement. If Sale Solution ever sells to
   integrators, this list becomes interesting on its own terms and the raw file
   is already on disk. **No new requests are needed to act on this** — re-read
   `data/raw/banner-2026-08-04.json`.

## What is NOT a reopen condition

- **More volume.** The sweep is exhaustive; the saturation curve is in the raw
  file. There is no second axis, no pagination, no unswept division. Re-running
  the grid buys nothing and spends requests against a `Disallow` host.
- **A hunch that the tier code might sort somewhere.** It was measured
  nationally. The distribution is in `stats.code_sorts_dealers_only`.
- **Wanting the Canadian or Mexican network.** `sitename=ca/en` and `mx/es`
  exist, and they are **out of scope**: the ICP is US, and R-1 was signed on a
  US build. Extending the sweep to another locale is a new decision, not this
  one — and it would be a fresh set of requests against the same `Disallow`
  host, so it needs its own written sign-off.

## If a reopen condition holds

`emails/scripts/sources/banner.py` is complete and idempotent. Everything is
cached, so a re-run costs **zero origin requests** unless the grid changes.

```
python3 emails/scripts/sources/banner.py                 # probe, 0 requests (cached)
python3 emails/scripts/sources/banner.py --sweep --i-have-read-the-probe
```

The second form refuses to start until you pass the acknowledgement flag,
because the probe's own decision function scores the gate as failed and the
guard exists so a sweep is a decision rather than a default. Read the probe
output first — that is what the flag asserts.

Everything that still binds regardless of R-1, and none of it is negotiable:
one worker · ≥3s per host · every response cached · the honest desktop UA, never
rotated · **a 403 or 401 stops the source dead** (the sweep loop breaks on it —
no retry, no UA change, no second host) · provenance on every record.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `banner [NEW-STATUS]` —
   that is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
