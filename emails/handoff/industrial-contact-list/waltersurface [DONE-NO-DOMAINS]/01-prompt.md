# waltersurface — route it to the domain-resolution queue, do not re-pull

Your mission: get Walter's 2,562 domainless independent companies into the
no-domain backlog with their evidence intact, and decide nothing else. **Do not
re-pull the source and do not try to seat these rows as they stand.**

## Read first, in order

1. `../00-README.md` — the pack index, and especially the **company vs. person
   vs. sendable** section. This source is the sharpest illustration of that
   distinction in the whole pack: 12,364 rows, 4,991 companies, **zero
   sendable-as-is**.
2. `./00-README.md` — this source's dossier. §2's fill table is the entire
   decision.
3. `../no-domain-backlog [*]/00-README.md` — **the real destination.** Its
   arithmetic governs, not this folder's.
4. `../../strategy/01-build-plan.md` §5f (the pipeline is domain-keyed and we are
   long, not short), §5l (a name join is not a substitute for a domain).
5. `../../strategy/00-sourcing-strategy.md` §7.2 — 69.7% of rows carry an email
   published by the *manufacturer*, not the dealer. GATE-L6 cohort rules apply.

## The one number that decides everything

**Website fill is 0.0% on all 12,364 US rows.** Not low — zero. Verified against
the raw payload, and `website` is absent from the key union of all three methods
that return locations.

The pipeline is domain-keyed end to end. S2 dedupes on domain; S3's catalog-depth
and e-commerce classification must fetch a site; §5l's ranking scores signals
that only exist once a site has been read. **A row without a domain cannot enter
any of it.** So this source produces backlog input, not list input, and every
number in this folder should be read that way.

## The work

1. **Route, do not seat.** Load `emails/data/raw/waltersurface-2026-08-03.json`
   and route every US record into the no-domain-resolution queue alongside
   Yaskawa's 232 domainless rows and the 8,156 rows `no-domain-backlog` already
   scopes. Keep `source`, `source_url`, `captured` on every row — provenance is
   100% filled today and must stay that way.
2. **Suppress chains before you count anything.** 2,126 chain-family companies
   are **6,743 rows, 54.5% of the source**: Fastenal 3,311 · Airgas 1,400 · MSC
   477 · Motion 267 · White Cap 142 · Vallen 76 · Wesco 67 · Applied 67 · BDI 52
   · DXP 48 · Grainger 26 · Hagemeyer 26. Suppression runs **before** dedupe
   (§5a mechanics). Chains are not deleted — they take a `disposition` and land
   in `emails/data/side-pools/` like everything else.
3. **Never quote the 93.9% net-new figure.** It is an artifact: `deduped-v7`
   already dropped the national chains by domain, so every chain branch reads as
   "new" against a pool that deliberately excluded it. **The usable figure is
   2,562 independent companies (89.4% of 2,865), of which 2,052 are
   single-location.**
4. **Re-derive the yield in the backlog's own terms.** Do not carry this folder's
   rough 100–170 projection forward as if it were measured — it is
   `no-domain-backlog`'s 330–530-from-8,156 rate applied to 2,562 rows, and it
   inherits every assumption in that estimate. Redo it there against that
   workstream's actual recovery rate.
5. **Take the 11 free domains.** `getDistributorCompanyLogo` returned 18 online
   dealers with websites but no addresses; 11 are net-new — fastoolnow,
   acmetools, intlairtool, coxtool, emisupply, fireballtool, fixsupply, maxprod,
   merrimacindustrial, weldfabulous, weldingoutfitter. They are a different
   record shape (website, no address) and are stored beside `records`, not in it.
   They need no domain resolution at all.
6. **Emails are GATE-L6 data.** 8,617 rows carry an address published by Walter,
   not by the dealer. §7.2 requires an isolated micro-campaign cohort with
   separately reported bounce and reply rates, and prefers a role address
   wherever a company has both. They are also the **second-best domain-recovery
   signal in the source** — 1,210 distinct business email hosts, 767 absent from
   `deduped-v7`. Mining the email host is very likely cheaper than an API lookup;
   try it first.

## Do not re-litigate

- **The transport.** `POST /us/webruntime/api/apex/execute` with
  `{"namespace":"","classname":"@udd/01pRP000001G9jV","method":"getAllDistributorMarkers","isContinuation":false,"params":{"webStoreId":"0ZERP0000005qVp4AI"},"cacheable":false}`.
  Three variants were measured and rejected — the luvio route
  `/lwr/apex/v67.0/…` 404s to the SPA shell, `?_body=` as GET gives
  `400 classname not found`, omitting `isContinuation` gives
  `400 isContinuation not found`. All recorded in the raw file.
- **It is not a headless target.** `research/01` filed it `hard JS`. One plain
  POST returns the national set. No browser was used and none is needed.
- **robots.** `Allow: /` with one unrelated `Disallow`. Cloudflare fronts the
  site and never challenged across 17 requests — zero 401, zero 403. Nothing to
  sign, nothing to override.
- **No vertical code exists.** Four keys: `title`, `value`, `description`,
  `location`. Walter is §5i's counter-example — the rule is "assume a code exists
  and test for it," not "a code always exists." Do not go hunting again.
- **`getStoreLocationsByCoordinates` is not worth merging.** It adds `custNum`
  and `faxPhone`, and covering all 12,368 markers costs ≈447 seed calls / ~22
  minutes — a 150× origin-load increase for two columns nothing asks for.
  `--enrich-full` exists if the need ever appears.

## Reopen condition

**Only if Walter starts publishing a website field.** Check the key union of one
`getAllDistributorMarkers` response — one request, and the extractor caches, so
it is free unless the payload changed. Row-count growth is **not** a reopen
condition: more domainless rows make the backlog bigger, not the list.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `waltersurface [NEW-STATUS]`
   — that is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean —
   `waltersurface-2026-08-03.json` is 11.9 MB and belongs in that note.
