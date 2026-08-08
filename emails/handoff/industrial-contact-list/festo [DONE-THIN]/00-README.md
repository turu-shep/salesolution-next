# festo — source handoff

> **STATUS (2026-08-03):** DONE-THIN. Built out of E4 as an un-gated target and
> swept to exhaustion in **6 origin requests** — the cheapest source in the
> program. It returns **51 US companies / 47 domains / 24 net-new**, of which at
> least 12 should be struck before seating. Segment A gains roughly a dozen
> authorization-stamped companies. That is the whole prize.
> **No robots gate** — neither host publishes a robots.txt. **One open judgement
> call** on the API's static `Authorization` value; see §1.

Prompts in this folder: `01-prompt.md` — a reopen check plus the pre-seating
strike list. Not a build; the build is done.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` (why this one
needed no gate) ·
[`01-build-plan.md` §5i (the vertical-code rule — `didactic` sorts 17.6% of this source out of ICP), §5a (the surviving authorization-stamp mechanism)](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §7.1 (obstacle ladder), §7.2 (dealer emails — 47% fill here)](../../strategy/00-sourcing-strategy.md)

## 1. What it is

Festo (fluid power / pneumatics) publishes its distributor network through
`https://distributorlocator.festo.com/?locale=us-en`, a React SPA whose HTML
shell is 1.6 KB. `research/01` filed it as `hard JS` — needs a browser.

**It does not need a browser.** The SPA is an **OData client over Azure AI
Search**, and the API takes a country filter directly:

```
GET https://api.festo.com/it/apps/locators/v1/locations
    ?$filter=address/country eq 'us'&$top=1000&$count=true
```

Routes: `locations`, `locations/{id}`, `sastoken`, `geocode`. System params
`$filter / $orderby / $top / $skip / $count / $select`. The UI itself can only
emit three filter clauses — a services predicate, a `geo.distance(...)` radius,
and `automation eq true | didactic eq true`.

Worth correcting for the next reader: **`salespartner` is not an API value.** It
is the i18n label ("Sales Partner") over the Automation/Didactic toggle. Anyone
grepping the bundle for it will chase a UI string.

**Robots posture — no gate, because there is nothing to override.**
`api.festo.com/robots.txt` is **HTTP 404**. `distributorlocator.festo.com/robots.txt`
returns a body **byte-identical to the locator page shell** — the SPA serves its
index for every unknown path, so that host publishes no robots file either.
Neither host states a preference in either direction. Pacing was applied anyway:
single worker, ≥3s per host, every response cached.

### ⚠ The one judgement call, recorded rather than buried

The bundle ships a **static `Authorization` header value to every anonymous
visitor** — no login, no session, no per-user issuance. It was treated as a
public widget identifier and used.

**Why that is the Banjo shape and not the Enerpac shape**, since the precedents
pull opposite ways and this deserved more than a shrug:

- **Enerpac (excluded):** a **basic-auth service account** for Oracle
  Integration Cloud, leaked into page source. A backend ops credential for a
  *second* system the storefront's public data path does not even use. Presence
  in page source does not make that API public.
- **Banjo / Banner (used):** a public widget or site identifier the front end
  presents on every anonymous page load to read the same public data the page
  displays.

Festo's is the second shape: 32 characters, no scheme prefix, base64-ish — the
signature of an **Azure AI Search read-only query key**, which is designed to be
embedded in client-side apps. No call returned 401 or 403. Using it grants no
privilege an ordinary visitor lacks.

**Handling:** `festo.py` reads the value out of the cached bundle at run time.
It is **not** written into the script, the raw JSON, or this file — verified by
grep against both outputs. If Artur reads this differently, the remedy is to
delete `emails/data/raw/festo-2026-08-03.json` and the source closes; nothing
downstream depends on it yet.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **119 US locations** (`@odata.count` = 119, single page — not truncation) |
| Unique domains | **47** (one row's "website" is a `facebook.com` page → 46 real) |
| Distinct companies | **51** |
| Seated (`seated-v5`) | 0 — not yet folded in |
| Routed to pools | none yet |
| Last pull | 2026-08-03 |
| Extractor | `emails/scripts/sources/festo.py` |
| Raw artifacts | `emails/data/raw/festo-2026-08-03.json` |

Fill on US records: **website 99.2% · phone 99.2% · email 47.1% · ZIP 100% ·
lat/lng 100%.** Emails are mixed role and named-person (`info`, `leads`,
`insidesales`, and personal first-name addresses) — §7.2 cohort rules apply.

**`state` is 0/119.** `address.stateProvince` exists on the entity and is null on
every single row. The extractor emits `state: null` rather than reverse-deriving
it from the ZIP; S2 owns that derivation, and guessing here would launder an
inference into a source field.

Provenance 100% filled: `source`, `source_url`, `captured` on every record.

**Cost: 6 origin requests, lifetime.** Four probe (shape, plus Houston / Chicago
/ Cleveland at 320 km — the UI's own 200-mile maximum), one US sweep, one
territory count. The three-metro probe returned 10 / 11 / 26; the probe also
found `address.country`, so the US came in a single call and no geographic grid
was ever needed. A re-run costs zero.

## 3. How deep we went

Exhaustively, and cheaply. Festo's worldwide collection is 1,924 locations; the
US slice is 119 and the server's own `@odata.count` confirms it. **The US network
is genuinely small — this is not a truncated pull.**

### The vertical code sorts hard — fifth confirmation of §5i

Codes captured verbatim and uninterpreted:

```
type_raw         Official Partner 119          — single-valued, zero signal
structure_raw    (null) 119                    — single-valued, zero signal
country_raw      us 119
main_office_raw  False 109 · True 10
automation_raw   True 110 · False 9
didactic_raw     False 109 · True 10
group_raw        52 distinct — AWC 30 · Eastern Industrial Automation 9 ·
                 Allied Automation 5 · EandM Automation 5 · Power/mation 5 ·
                 Clayton Controls 4 · Bertelkamp 4 · Shaltz 3 · Sunsource 3
services_raw     3 distinct values across 119 rows
```

**`didactic` isolates 9 companies (17.6%) that are education and
training-equipment resellers, not industrial MRO** — Advanced Educational
Technologies, Bluegrass Educational Technologies, Carolina Training Associates,
Educational Solutions Enterprises, Industrial Training Solutions, Southern
Educational Consulting & Training, Tech-Ed Systems, Advanced Technologies
Consultants, Reletech. **All nine sit in the net-new set.** Same failure mode as
Yaskawa's `groupList`, caught before seating rather than after. Captured
verbatim; not acted on.

`services_raw` is the mirror image — three values across 119 rows, no
discriminating power in the US at all. Consistent with the bundle, which hides
the services filter entirely for the `us`/`ca`/`mx` locales. **A code field
existing does not make it useful; test that it sorts.**

**Concentration matters here.** `group_raw` shows **AWC, Inc. (`awc-inc.com`) at
30 of 119 locations** — one banner is a quarter of the entire pull. Branch
collapse is doing most of the work between 119 rows and 51 companies.

## 4. What's left on the table

**Nothing to fetch.** One filter returns the complete US set and the server
confirms the count.

Net-new against `deduped-v7.csv` (16,719 rows, all domain-keyed):

| Measure | Net-new | Of |
|---|---|---|
| **by `domain`** | **24** | 47 |
| by `norm_company` name | 32 | 50 |

Use the domain figure. The name join overstates — `ifp motion solutions inc
south` reads as new while `ifpusa.com` is already in the pool.

**Strike these before seating, and the real number is roughly 12:** the 9
`didactic` education resellers, plus `digikey.com` and `us.rs-online.com`
(catalog giants, not distributors — and both above the $75M ceiling), plus
`mw3ds.com` (3D printing) and the `facebook.com` row.

**Against the E4 decision rule — ≥150 net-new plus a tier code or per-record
line card — Festo fails the volume leg by more than 10×.** It clears the code
leg easily. Record the measurement and close it.

**Why it was still worth the six requests.** Segment A (fluid power) is the
thinnest segment in the program — Parker is Akamai-gated, Enerpac is one payload
already spent, Adaptall is capped at 15 records per query. Roughly a dozen
net-new companies, each carrying **"authorized Festo distributor" at 100%
coverage by construction**, with a website on 99.2% and an email on 47.1%, is
better per-company economics than anything sitting in the ranked-out backlog.
Twelve companies is not a wave. It is a clean dozen in the segment that needs
them most, bought for nothing.

**Could not verify, stated as such:**
- **Puerto Rico.** Inseco Incorporated (San Juan PR 00922) is coded
  `country: "us"`. The territory guard returns 0, so PR sits inside the `us`
  bucket — one observed row, not proof the bucket is complete for territories.
- **Freshness.** No `lastModified` on the entity; the payload gives no
  indication of when Festo last refreshed it.
- **`structure_raw`** is null on all 119 rows, so what it would ever hold is
  unknown.

## 5. Registry row

| festo | DONE-THIN | 119 | 0 | 2026-08-03 | nothing — 51 companies is the whole US network; 24 net-new, ~12 after strikes | festo/ |
