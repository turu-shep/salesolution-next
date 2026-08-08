# indsci / PriceSpider — test the next brand in one lookup

Your mission: **do not re-pull Industrial Scientific.** It returned zero usable
net-new ICP companies and that is settled. Use the pinned PriceSpider pattern to
test whether a *different* brand's account feed carries websites — which is the
one thing that would make this platform worth anything.

## Read first, in order

1. `../00-README.md` — the pack index, and especially **company vs. person vs.
   sendable**.
2. `./00-README.md` — **§1 is the platform key and §3 is why this brand failed.**
   Read both before touching anything.
3. `../../strategy/01-build-plan.md` §5i (a field existing is not a code — test
   whether it sorts), §5f (we are long on rows and short on qualification).
4. `../../strategy/00-sourcing-strategy.md` §7.1 — the obstacle ladder. The omni
   403 in `./00-README.md` §4 sits inside it and is **not** yours to decide.

## Why IndSci failed, so you do not re-derive it

`accountSeller` splits the feed cleanly and inverted:

| slice | rows | websites |
|---|---|---|
| `accountSeller=1` — the brand's own managed dealers (**our ICP**) | 53 | **0** |
| `accountSeller=0` — PriceSpider-network sellers (chains, e-tailers) | 21 | **21** |

Every row with a website is a national chain. Every ICP row has none, and the
`url` column is **empty rather than sparse** — structural. So sweeping harder
raises the row count and not the usable count. Net-new by domain was 5, all five
chains. **Usable net-new: zero.**

## The job — one brand, one lookup, then stop

`indsci.py` already carries a `BRANDS` map. Adding a brand is one row.

1. **Find a candidate.** Any manufacturer whose where-to-buy page contains
   `<div class="ps-widget">` and a `<meta name="ps-key">`. Grep the brands
   already assessed in `../../../research/` before going looking — the widget
   signature sweep in strategy §3a (E1) covered 64 brands and its method
   generalizes.
2. **Read the brand's where-to-buy HTML** and copy its `ps-key` (the integer
   before the hyphen is `clientId`, the 24-hex after it is the default
   `configId`) plus any `ps-config` attributes on individual mounts. **A page
   with two mounts has two datasets** — IndSci's account feed and network feed
   were completely different, and that difference was the whole finding.
3. **Answer one question before anything else: does the account feed carry
   `url`?** That is the entire test. If it is empty, the brand is worthless to us
   for the same structural reason IndSci was, and you stop there.
4. **Then, and only then**, measure net-new by domain against
   `emails/lists/deduped-v7.csv` (16,719 rows, all domain-keyed).

**Budget: ≤10 origin requests. Report and stop.** Do not run a ZIP grid.

## Binding constraints

- **The omni 403 gate is unsigned and stays that way unless a brand clears step
  3.** `omni.pricespider.com/robots.txt` returns 403. RFC 9309 §2.3.1.3 reads
  that as unrestricted; `_polite.py`'s house rule reads a 403 as a hard stop.
  Both readings are recorded in `./00-README.md` §4 with the counter-argument.
  **`GATE_SIGNED = False` in `indsci.py`, and you do not flip it.** If a brand
  clears step 3, put the question to Artur *then* — with a real number attached.
  Asking him to adjudicate a compliance question worth zero companies wastes the
  one thing he cannot make more of.
- **Never record the `token` value.** It is read from cache at run time and
  written to no file. One render capture leaked it on 2026-08-04 and was
  redacted; do not repeat that.
- Use `emails/scripts/sources/_polite.py`. ≥3s/host, single worker, disk cache,
  honest desktop UA never rotated. **A 403 or 401 stops the source** — no retry,
  no UA rotation, no host switching, no stealth.
- **`_polite.py` was fixed 2026-08-03:** any 4xx except 408/429 raises `Blocked`
  on the first attempt rather than retrying a deterministic refusal.

## Do not re-litigate

- **The pattern.** It is fully pinned in `./00-README.md` §1 — the four-request
  chain, the JSONP data URL with every parameter, the columnar schema, the
  credential assessment. **Do not re-derive it with another render.**
- **The columnar schema.** `stores` is a list of blocks of parallel arrays, not
  an array of row objects. Row *i* is index *i* of every column. Mis-parsing this
  returns plausible-looking wrong data rather than an error — the Yaskawa
  `groupList` failure mode.
- **The 6 KB `lib/ps-widget.js` is a loader, not the library.** The real 444 KB
  library lives at `cdn.pricespider.com/1/lib/<version>/ps-widget.js`. That is
  why `linecard-locators` correctly called the recipe "not statically derivable."
- **There is no email field.** 0% email is structural, not sparse.
- **The geocoder is avoidable.** Supply your own ZIP centroids and call `omni`
  directly rather than routing through `locate.pricespider.com`.
- **PriceSpider is now Wayvia.** Same hosts. Do not chase the rebrand.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `indsci [NEW-STATUS]`. If a
   different brand becomes the reason this platform is worth keeping, give that
   brand **its own folder** and leave this one as the platform reference.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
