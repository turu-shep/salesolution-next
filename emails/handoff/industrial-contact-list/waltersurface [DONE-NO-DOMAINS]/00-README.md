# waltersurface — source handoff

> **STATUS (2026-08-03):** DONE-NO-DOMAINS. **The largest single locator pull in
> the program after Timken and DataForSEO — 12,364 US rows, 4,991 companies,
> from one HTTP request — and it publishes a website on exactly zero of them.**
> The pipeline is domain-keyed, so almost none of this is seatable as it stands.
> It is a ~2,500-company addition to the **no-domain backlog**, not to the
> sendable list. Do not let the row count set your expectations.
> **No gates.** robots.txt is `Allow: /`; no override, no credential, no bypass.

Prompts in this folder: `01-prompt.md` — the domain-resolution decision, not a
re-pull. The pull is complete.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` (why this one
needed no gate) ·
[`01-build-plan.md` §5i (the vertical-code rule — Walter is the counter-example), §5f (the pipeline is domain-keyed and long, not short), §5l (why a name join is not a substitute for a domain)](../../strategy/01-build-plan.md) ·
`../no-domain-backlog [*]/00-README.md` — **this source's real destination** ·
[`00-sourcing-strategy.md` §7.2 (dealer emails — 69.7% fill here)](../../strategy/00-sourcing-strategy.md)

## 1. What it is

Walter Surface Technologies (cutting tools and abrasives) runs
`https://www.walter.com/us/where-to-buy` on **Salesforce Experience Cloud LWR**.
`research/01` filed it as `hard JS` — a JS widget needing a browser.

**It needs no browser.** A plain HTTP POST reaches the page's own Apex
controller:

```
POST https://www.walter.com/us/webruntime/api/apex/execute
Content-Type: application/json

{"namespace":"","classname":"@udd/01pRP000001G9jV",
 "method":"getAllDistributorMarkers","isContinuation":false,
 "params":{"webStoreId":"0ZERP0000005qVp4AI"},"cacheable":false}
```

`classname` is the UDD alias of `WalterENWhereToBuyController`. The `webStoreId`
is inlined in the anonymous page itself
(`LWR.define('@salesforce/webstore/Id', [], function(){ return "0ZERP0000005qVp4AI" })`),
as is `@app/apexApiBasePath = "/us/webruntime/api"`.

**`getAllDistributorMarkers` takes no geography. One request returns the entire
national set** — 3.83 MB, 12,368 records. No radius loop, no metro grid, no
pagination.

Three wire variants were measured and rejected, and they are recorded in the raw
file so nobody re-derives them: the luvio internal route
`/us/webruntime/api/lwr/apex/v67.0/<class>/<method>` returns the SPA shell (404);
`?_body=` as a GET returns `400 JSONObject["classname"] not found`; omitting
`isContinuation` returns `400 JSONObject["isContinuation"] not found`.

**Access posture.** `www.walter.com/robots.txt` is the stock Salesforce file:
`User-agent: *` / `Allow: /`, with a single `Disallow: */secur/forgotpassword.jsp?*`.
**The API path is explicitly allowed.** Cloudflare fronts the site and never
challenged: **zero 401, zero 403, zero challenges across 17 origin requests.** No
cookie, no bearer token, no session harvested. Nothing to sign.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **12,368** (4 non-US: Raptor Supplies UK/SG/NL/AU) |
| US records | **12,364** |
| Unique domains | **0** |
| Distinct companies | **4,991** (`norm_company`) |
| Seated (`seated-v5`) | 0 |
| Routed to pools | none yet — destination is the no-domain backlog |
| Last pull | 2026-08-03 |
| Extractor | `emails/scripts/sources/waltersurface.py` |
| Raw artifacts | `emails/data/raw/waltersurface-2026-08-03.json` (11.9 MB) |

Fill on US records — **and the first row is the whole story**:

| Field | Fill |
|---|---|
| **website / domain** | **0.0%** |
| phone | 87.9% (`phone_10` parses 87.6%) |
| email | 69.7% |
| city / state / zip / lat-lng | 100% |
| address_1 | 99.97% |

Independently re-counted against the raw payload: 12,368 records, 12,364 US,
**0 with a website, 0 with a domain**, 10,863 phone, 8,617 email, 4,991 distinct
normalized companies. The zero is real, not a parse failure — `website` is absent
from the key union of `getAllDistributorMarkers`, `getStoreLocationData` **and**
`getStoreLocationsByCoordinates`.

Provenance 100% filled: `source`, `source_url`, `captured` on every record.

## 3. How deep we went

One request covers the entire published national set, so there is no unswept
geography. What the depth work established instead:

**§5i result — this locator publishes no vertical code, and that is itself the
finding.** `getAllDistributorMarkers` returns exactly four keys (`title`,
`value`, `description`, `location`). No distributor type, no tier, no category,
no service flag, no product line. Codes captured verbatim:

```
sf_key_prefix_raw   a3t on all 12,364      — one custom object, no sub-typing
country_raw         US 12,359 · PR 5
state_country_raw   54 distinct — TX 1294 · CA 946 · OH 534 · FL 523 · PA 497 · GA 448 …
cust_num_raw        null on all records    (see below)
fax_raw             null on all records
```

Five sources now confirm §5i's rule; **Walter is the counter-example that keeps
it honest.** Kennametal encodes `industries[]`, Yaskawa `groupList`, Sullair
`product_line`, Festo `didactic`. Walter encodes nothing. The rule is "assume a
code exists and test it," not "a code always exists."

**The sibling method does carry an account number, and it was deliberately not
merged.** `getStoreLocationsByCoordinates` adds `custNum` (100% fill on an
8-seed, 263-id probe) and `faxPhone` (36.9%). Verbatim, undecoded samples:
`200709-1648`, `200085-02`, `224500-243`, `A35006-07`, `DR1801-03`. Covering all
12,368 markers through that ~55-mile radius method takes **≈447 seed calls, about
22 minutes — a 150× origin-load increase for two columns the record shape does
not ask for**, and it would defeat the point of a single-call source. The probe
is kept beside `records` rather than merged, so the record set stays uniform.
`--enrich-full` is implemented and cached if anyone ever wants it.

**Chains are counted, not suppressed** (per §5a mechanics, suppression happens
before dedupe, downstream of here). **2,126 chain-family companies = 6,743 rows =
54.5% of all US rows.** Fastenal 3,311 · Airgas 1,400 · MSC 477 · Motion 267 ·
White Cap 142 · Vallen 76 · Wesco 67 · Applied 67 · BDI 52 · DXP 48 · Grainger 26
· Hagemeyer 26. **More than half this source is national chains we cannot sell
to.**

## 4. What's left on the table

**Nothing to fetch.** One call is the whole source.

**Net-new cannot be measured on domain, because there are no domains.** That is
not a caveat, it is the headline. Against `deduped-v7.csv` (16,719 rows, all
domain-keyed):

| Measure | Result | Trust |
|---|---|---|
| by `domain` | **not computable** | — |
| by `norm_company`, all companies | 4,686 of 4,991 (93.9%) | **overstated** |
| by `norm_company`, excluding chain families | **2,562 of 2,865 (89.4%)** | the usable figure |
| distinct business email hosts absent from v7 | 767 of 1,210 (6,118 rows behind them) | a proxy, not a domain |

**Why 93.9% overstates.** `deduped-v7` has already excluded the national chains
by domain — `grainger.com`, `motion.com`, `applied.com`, `fastenal.com`,
`mscdirect.com`, `dxpe.com`, `kaman.com` and `airgas.com` all return zero rows —
so every chain branch reads as "net-new" against a pool that deliberately dropped
them. Use **2,562 independent companies**, of which 2,052 are single-location.

### Against the E4 decision rule: passes the volume leg 17×, fails the code leg

The rule is **≥150 net-new AND (a tier code OR a per-record line card)**. Walter
clears the first by a factor of seventeen and **fails the second outright** — it
publishes no code of any kind. Under a strict reading it does not earn a sweep.

**The strict reading also does not matter here, and it is worth saying why**: the
full national sweep was **one request** and it is already done. The rule exists
to stop a session burning hours of paced requests on a source that will not pay.
It cannot be applied retroactively to a source that cost one call.

**What genuinely limits this source is the missing domain, not the missing
code.** The pipeline is domain-keyed end to end: S2 dedupes on domain, S3's
catalog-depth and e-commerce classification need a domain to fetch, and §5l's
ranking scores on signals that only exist once a site has been read. 2,562
companies with a name, a full address, a phone (87.9%) and an email (69.7%) but
**no website** cannot enter any of it.

**So the honest disposition is: this is a no-domain-backlog input, not a list
input.** It belongs with Yaskawa's 232 domainless rows and the 8,156 rows
`no-domain-backlog` already scopes — and it grows that workstream by roughly a
third. At that backlog's own estimate (~$100 of API spend recovering 330–530
seatable companies from 8,156), Walter's 2,562 independents project to **very
roughly 100–170 additional seatable companies after domain resolution.** That
projection inherits every assumption in the backlog's own arithmetic and should
be re-derived there, not trusted from here.

**One genuinely free win, separate from the above:** `getDistributorCompanyLogo`
returns **18 online dealers with websites** (no address), of which **11 domains
are net-new**: fastoolnow, acmetools, intlairtool, coxtool, emisupply,
fireballtool, fixsupply, maxprod, merrimacindustrial, weldfabulous,
weldingoutfitter. Captured separately from `records`, since a website with no
address is a different shape from a location record.

**Could not verify, stated as such:**
1. **Whether 12,368 is the complete set.** No pagination token, no limit param,
   and 12,368 is not a round cap — but there is no server-side count confirming
   it, unlike Festo's `@odata.count`.
2. **The ~55-mile radius is inferred, not documented.** Max observed `distance`
   was 59 mi on one Houston probe (322 hits). The 447-seed cover estimate could
   under-cover if the radius varies with density.
3. **`custNum` is not decoded.** `200709-1648` / `A35006-07` / `DR1801-03` looks
   like account+branch, but the prefix was not confirmed to mean "parent
   account" and the field was not split.
4. **`getBannerDetails` was not probed for a website field.** Website is absent
   from the other three methods; that one was not checked.
5. The 4 foreign rows are the only non-US **by the country line**; no independent
   check confirmed that no US-labelled row is actually foreign.

## 5. Registry row

| waltersurface | DONE-NO-DOMAINS | 12,368 | 0 | 2026-08-03 | nothing to fetch; 2,562 independents carry NO domain → no-domain-backlog input, ~100–170 seatable after resolution | waltersurface/ |
