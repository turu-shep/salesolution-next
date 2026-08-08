# continental — one open axis, then close it

Your mission: Continental failed the volume leg at a projected 82 net-new against
a 150 bar. **Do not run a national sweep on that number.** One axis was left
genuinely untested and it is the only thing that could move the verdict. Test it
or close the source.

## Read first, in order

1. `../00-README.md` — the pack index and the company/person/sendable
   distinction.
2. `./00-README.md` — the dossier. §4's projection arithmetic and its stated
   assumptions are the decision; argue with them rather than inheriting them.
3. `../../strategy/01-build-plan.md` §5l (a name join is not a domain), §5h (a
   wave needs a signal we lack), §5i (the vertical-code rule).
4. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` — why no gate
   applies here.

## Why it failed, so you do not re-derive it

```
13 net-new domains ÷ 0.1585 (measured baseline share inside the 3 probe circles) = 82
```

**82 < 150. Volume leg fails.** The code leg passes on `ihoseStarDist`, but the
rule is AND, not OR.

**And 82 is optimistic.** Four of the 13 observed net-new domains should not
count: `applied.com` and `bdi-usa.com` are national chains that read as "new"
only because `deduped-v7` already excluded them by domain, and `summitracing.com`
and `kauffmantire.com` are the wrong vertical. Strip them and the projection
drops toward **55–60**.

The one thing this source has that Walter and SKF do not: **website fill of
70.4%**, the best in the E4 tier. Its records can actually enter a domain-keyed
pipeline. That is why it is worth one more question rather than an immediate
retirement.

## The open axis — `aftermarket`, tested on one metro only

The probe ran `locatorType=gad` on three metros plus **one** `aftermarket` probe
on Houston. `gad_only` and `gad_plus_aftermarket` came back identical — 152
records, 84 companies, 28 domains — so on that evidence `aftermarket` adds
nothing.

**One metro is not enough to settle it.** Run `aftermarket` on Chicago and
Cleveland — **2 requests** — and measure whether it contributes any net-new
domains the `gad` axis missed.

Be clear-eyed about what a positive result would mean. The `aftermarket` filter
keys are `atvbelts`, `gardenhose`, `lawnmoverbelts`, `snowmobilebelts`,
`hdairsprings`, `installer`, `partsstore` — **that is consumer, powersports and
automotive, not industrial MRO.** If it does add volume, most of that volume is
off-ICP and should route to `emails/data/side-pools/` with a `disposition`, not
to the seated list. A bigger number here is not automatically a better one.

**Budget: 2 origin requests.** If `aftermarket` adds nothing in-ICP, mark the
source `RETIRED` and stop.

## If someone still wants the tier labels

`ihoseStarDist` (Industrial Hose – STAR Distributor) is a **real** tier code, but
it is queryable as a **filter only** — it does not appear on the returned record.
Labelling costs **one extra query per tier per metro**, and the label lives in the
query rather than the row. `…&ihoseStarDist=true` on Houston returns 3 records.

That is worth doing only if the STAR tier is specifically wanted as a
qualification signal. It is not worth doing to inflate a count.

## Do not re-litigate

- **It is not a headless target.** `research/01` filed it `hard JS`. The block
  builds a same-origin URL and a plain GET returns JSON. No browser.
- **robots.** `User-agent: *` / `Allow: /` verbatim, plus a `Linguee`-only
  `Disallow: /`. Nothing disallows `/apis/`. **Nothing to sign.**
- **Credentials.** Bare `fetch(u)` — no headers, no key, no `credentials`
  option. The only `apiKey` is a Google Maps browser key read from the page's own
  DOM. Not a boundary. **Never record its value.**
- **The codes are not on the record.** Six `gad` filter keys are declared; none
  is projected into the response. The Salesforce custom fields
  (`Locator_Hydraulics__c`, `Certifications__c`, `Services__c`, the `Hours_*__c`
  set) exist on the object and are not returned. Do not go looking again.
- **Radius caps at 100 mi** in the UI. Values above that were not tested and
  should not be assumed.

## Reopen condition

Reopen only if **`aftermarket` adds ≥100 in-ICP net-new domains** across the two
untested metros — which would put the combined projection back near the bar. Any
smaller result closes the source.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `continental [NEW-STATUS]` —
   that is how the founder reads readiness from the directory listing. `RETIRED`
   is the expected outcome.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
