# caseih — do not sweep; test one reopen condition or close it

Your mission: Case IH failed the volume leg on a measured probe and failed the
size test harder. **Do not run a national sweep.** There is one condition that
could change the verdict and it is cheap to test. Test it or close the source.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. **§3's widening pass and §4's
   projection table are the whole decision.** Read them before you touch the
   data.
3. `../../strategy/00-sourcing-strategy.md` **§9, gate ICP-EQ** — the binding
   condition this source vindicated: the size-band filter is designed *before*
   the sweep. It is the reason the flattering number was caught rather than
   shipped.
4. `../../strategy/01-build-plan.md` **§5i** (a published field is not a code
   until it sorts) and **§5l** (a name join is not a domain).
5. `../bobcat [*]/00-README.md` — the same workstream's other OEM. It cleared
   volume and failed on vertical. Reading both is how you understand why ICP-EQ
   has produced no usable industrial source.

## Why it failed, so you do not re-derive it

| Leg | Measured | Verdict |
|---|---|---|
| ≥150 projected in-band net-new | **25–57** (4 or 9 observed ÷ the 0.1585 scaler) | **FAIL**, by 3–6× |
| tier code or per-record line card | `classCode` sorts (`D`/`O`/`S`); `contractDetails` gives 28 combinations | **PASS**, twice |
| the $75M ceiling | **61–74% above it** once the clustering footprint widens past the probe circles | **disqualifying on its own** |

Two legs pass and the source still loses, which is the point: **a rich signal on
a population you cannot sell to is not an asset.**

## The one reopen condition

**Reopen only if the ICP ceiling moves above $75M**, or if someone finds a query
mode on this host that returns more than 100 rows.

Nothing else changes the arithmetic. Better clustering makes it worse, not
better — every widening pass so far has moved rows *up* past the ceiling. More
metros multiply a per-circle count that is already 3–6× short.

### Test it, in this order, and stop at the first no

1. **Has the ceiling moved?** Read `../../strategy/00-sourcing-strategy.md`
   §8.1a. If the soft ceiling is still $75M, **report and STOP.** Do not fetch.
2. **Is there an uncapped mode?** Re-read the cached bundle
   (`/dist/caseih/static/js/259.*.chunk.js`, already on disk) for an `offset`,
   `page`, `skip` or cursor parameter. **This is a disk read, not a request.**
   If none exists, **report and STOP** — the three known modes cap at 10, 100 and
   100, and the `state=` parameter is a sort seed rather than a filter.

**Budget if you get past both: 3 origin requests.** One per candidate paging
parameter, against the state mode, checking whether row 101 exists. If it does
not, the source is closed permanently and should be marked `RETIRED`.

Even a working pager does not reopen this. It would raise the raw count and
**lower** the in-band share at the same time, because the groups this source
publishes are large. A bigger denominator on a 74%-over-ceiling population is not
a bigger list.

## Do not re-litigate

- **`dealerWebsite` is the OEM's landing page. `dealershipAttributes.website` is
  the dealer's.** Reading the wrong one gives 88.9% fill with **one** distinct
  domain, and — because clustering is domain-first — collapses every dealer in
  the pull into a single fake above-ceiling mega-group. `_eq_sizeband.OEM_DOMAINS`
  now blocks OEM apexes from both the `domain` field and the join key.
  **Any future OEM extractor checks for this pattern first.**
- **`cnhPrimarySAPNumber` is not a group key.** 31 distinct values across 31
  stores. `cnhOwnershipGroupSAPNumber` (15 across 31) is the real one. Clustering
  on the wrong one produces 31 single-store companies and a 100% in-band verdict
  that is entirely an artifact.
- **`S` is Parts & Service; `O` is Specialty.** From the payload's own
  `classDescription`. One record of 31 carries `S`.
- **`brand` is constant** (`Case IH` on every row) and sorts nothing.
- **robots.** 49 `*` rules on `www.caseih.com`, none matches `/apirequest/`.
  `Disallow: /Search/` and `Disallow: /dealer-landing-page` are lookalikes and do
  not match. **No override, nothing to sign.** `/legal-notice` was read: no
  anti-automation clause.
- **Credentials.** Bare `fetch(url, {signal})`. No headers, no key. Zero 401,
  zero 403. If one ever appears, that is a boundary and a full stop.
- **The caps.** 10 rows on the geo mode, 100 on the state mode, 100 on the
  country mode — measured, three times each. A round number that repeats is a
  cap, and the country mode returning exactly 100 rows across eight states is the
  proof.
- **One of the nine "net-new domains" is the literal string `https`.** A parse
  artifact in the shipped measure file. Real net-new in the circles is 8.
- **The widening pass.** 14 in-band and 5 unknown records flipped straight to
  above-ceiling when the footprint grew from three circles to three states.
  Nothing about the dealers changed; the probe's view did. Re-running the
  circle-only clustering to get a friendlier number is the exact failure ICP-EQ's
  pre-designed filter exists to prevent.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `caseih [NEW-STATUS]` — that
   is how the founder reads readiness from the directory listing. `RETIRED` is
   the expected outcome; use `IN-PROGRESS` if you stopped before the plan
   completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second). The `equipment-dealers [*]/` row also quotes this source's numbers;
   correct both or they drift.
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean. H10
   already covers `_cache/caseih/`.
