# boschrexroth — source handoff

> **STATUS (2026-08-04):** BLOCKED-UPSTREAM. **UNRESOLVED, not failed.** Zero
> records. The endpoint is pinned out of the vendor's own JS, robots is resolved
> on the origin that actually serves the data, the credential posture is clean —
> and **every data call answers HTTP 500.** Nothing about this source has been
> measured, including whether it is worth measuring.
> **No gates.** The governing origin publishes no robots.txt (HTTP 404). The
> credential is a subscription key inlined in the anonymous page's public JS.
> Nothing to sign, nothing overridden.

Prompts in this folder: `01-prompt.md` — a bounded retry, ≤3 requests, with one
specific correction to try first. Not a build.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §7.1 (obstacle ladder — a 500 is in none of its rows, which is why this stays open); §8 (Segment A is the thinnest segment in the program)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (a published decode table is not a code — this source publishes the best decode table in the tier and zero rows to test it on)](../../strategy/01-build-plan.md) ·
`../e4-headless-locators [*]/00-README.md` and `02-robots-posture-2026-08-03.md` (the tier, and the per-origin robots working) ·
`../skf [*]/00-README.md` §3 · `../banner [*]/00-README.md` §3 · `../lincolnelectric [*]/00-README.md` §3 — the three sources that published rich codes and filled none of them

## 1. What it is

Bosch Rexroth (hydraulics, drives and controls — **Segment A, fluid power**)
publishes a contact locator at
`https://www.boschrexroth.com/en/us/contact/contact-locator/`. That page is a
shell; the locator is a micro-frontend hosted on a third party and the data
comes from a fourth host.

**This source stays alive for one reason: Segment A is the thinnest segment in
the program.** Parker is Akamai-gated, Enerpac was a single payload already
spent, Adaptall caps at 15 rows per query and was retired to lookups, Festo
returned ~12 usable net-new. A fluid-power locator with a working data path is
worth a second attempt in a way a sixth bearings locator would not be.

### The endpoint, read out of the vendor's JS rather than guessed

The page mounts:

```html
<div dxf:micro-frontend id="contact-locator-app"
  public-host="https://contact-locator-nextapp-dev.bluebeach-…azurecontainerapps.io"
  context-path="/locator" include-access-token="false" …>
```

That app's `index.js` (501 KB, cached, read from disk) declares exactly one API
client — base `https://apim-dcslx.azure-api.net/contact-locator`, one header,
`Ocp-Apim-Subscription-Key` — and three routes, verbatim:

```
/api/v1/contacts/by-geocoordinates?latitude=&longitude=&<filters>&limit=&radius=&offset=0
/api/v1/contacts/by-country?<filters>&limit=&country=&offset=0
/api/v1/filter/${category}?country=${country}
```

`offset` is the source's own paging handle and the app hardcodes it to `"0"`.
The radius control is `<input type="range" min={10} max={1e3} step="5">`; the
US config sets `initialDistance: 1000` and `initialCountry: "United States"`,
the distance label is km, and the app's own page cap is 100 (`en-us` sets no
`limit`, so the app fallback applies).

### Robots — no gate, and the reason is which origin serves the payload

RFC 9309 is per-origin. Three hosts are in play and **only one serves dealer
data**.

| Host | Serves | robots.txt | Verdict |
|---|---|---|---|
| **`apim-dcslx.azure-api.net`** | **the payload — this is the governing origin** | **HTTP 404**, body `{"statusCode":404,"message":"Resource not found"}` | **publishes no robots file; states no preference; disallows nothing** |
| `contact-locator-nextapp-…azurecontainerapps.io` | the app bundle + config YAML | HTTP 200 with the SPA's index HTML | not a robots file — the container serves its shell for every unknown path. **Festo's shape.** |
| `www.boschrexroth.com` | the page shell only | `Allow: /` + `Disallow: /api/` | **would have DISALLOWED the path — and this source made ZERO requests to it.** |

⚠ **Record that third row properly. It is explicitly NOT the Pepperl+Fuchs
situation.** There, a `Disallow: /api/` on the serving host produced gate R-2 and
a signature. Here the rule belongs to a host this source never asks for anything:
the locator HTML was captured earlier by the evidence pass and is read from disk.
A reader who checks the brand's robots.txt instead of the payload's origin gets
this backwards in both directions — it would have gated a clean source, and on a
different site it would have cleared a dirty one.

**Credential: an Azure APIM subscription key inlined in the anonymous page's
public JS.** The Banjo / Banner / Festo shape — no login, no session, no
per-user issuance — not the Bimba shape that permanently excludes a source. The
value is read out of the cached bundle at run time on purpose so it never lands
in this repo, and it was **additionally redacted from
`emails/data/raw/e4-bundles2-2026-08-03.json`**, where an earlier bundle sniff
had captured it verbatim. That file now carries
`<REDACTED-PUBLIC-SUBSCRIPTION-KEY-SEE-BUNDLE-CACHE>`.

**`/api/dxf/token` is NOT involved.** The shell declares `customTokenPath:
"/api/dxf/token"` for a *different* micro-frontend (the DXF download service on
`dxf-services.bosch.com`). The contact-locator mount carries
`include-access-token="false"` and its fetch helper sets one header and no
`credentials` option. That is also why the `/api/` rule above is never crossed.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **0** |
| US records / companies / domains | — |
| Seated | 0 |
| Last pull | 2026-08-04 (no data returned) |
| Extractor | `emails/scripts/sources/boschrexroth.py` — probe only; `MAX_ORIGIN_REQUESTS = 0` after the budget was spent |
| Raw artifacts | `emails/data/raw/boschrexroth-2026-08-04.json` — 0 records, the verbatim robots verdicts, the request ladder, the failure body and the six unverified items |

**Origin requests: 10 of 10 budgeted. All spent, none netted out.**

| # | Request | Result |
|---|---|---|
| 1 | app `index.js` | 200 — the endpoint, the header name, the three routes |
| 2 | `apim-dcslx.azure-api.net/robots.txt` | **404** — the governing origin's verdict |
| 3 | `/locator/config/en-us.yml` | 200 — the US config, the radius default, the `contactType` decode |
| 4 | `by-geocoordinates` | ⚠ **HTTP 200 with a zero-byte body** |
| 5–9 | `by-geocoordinates` ×5 | **HTTP 500** |
| 10 | `by-country`, full filter id space, `limit=1000` | **HTTP 500** |

**Report the five-500 ladder as spent, not as a lesson netted out.** 5xx is
legitimately retryable — an origin asking for time — but five identical 500s is
not a timing signal. `RETRY_5XX_ONCE` now caps the ladder at one retry, and the
budget binds **every** attempt rather than only the successful ones. That is the
5xx half of a fix this pack had already made for 4xx on 2026-08-03.

⚠ **Request 4 is worth its own line.** Before the `Origin` header was corrected,
the same route answered **HTTP 200 with a zero-byte body** — Azure API
Management terminating a request whose `Origin` it did not recognise. The
locator is embedded in `www.boschrexroth.com`, so a real anonymous visitor's
browser sends that page as the Origin; the first call sent the app host instead.
**A silent empty 200 is indistinguishable from "no dealers here"** — the same
failure family as Bobcat's `totalCount: 0`. Correcting it is what turned an
unreadable empty body into a legible 500.

## 3. How deep we went

Ten requests deep and zero rows deep. **Everything below the transport is
unmeasured.**

### The failure, and what it is not

Body, verbatim: **`Error fetching contacts: Request failed with status code
500`.** That is an **axios** error string — so a layer that was itself calling
something else got a 500 and wrapped it. The gateway routed the request; the tier
behind it failed.

Ruled out **by evidence**, not by assumption:

| Hypothesis | Why it is out |
|---|---|
| wrong route | unknown routes on this APIM answer **404** with a JSON body — which is exactly what `/robots.txt` returned |
| credential wall | 401/403 never appeared once; a bad APIM subscription key answers **401**, not 500 |
| robots | the governing origin publishes no robots file |
| missing filter params | the final call carried the source's **complete** authored filter id space — `productGroups` 1–32, `contactCategories` 1–5 — and still 500'd |
| wrong country spelling | a bad filter value yields an empty list; APIM validates params to **400** |

**Most likely reading, stated as a reading and not a fact:** the app host is
labelled `-dev`, and a dev-labelled deployment's data tier being down is the
simplest explanation that fits a wrapped upstream 500.

**Persistence: six attempts across two runs and ~230 seconds of backoff, the same
500 every time. Not transient over minutes — which is not the same as
permanent**, and this probe does not resolve the difference.

### ⚠ The landmine, confirmed and worse than expected

`research/01` recorded that Bosch seats itself in its own partner list. The
mechanism is now confirmed twice over, and the second half is the part that
bites.

**First: the app pulls every contact type from the API and filters
`ContactType` client-side.** So a direct API call gets Bosch's own locations
mixed in **by construction** — not as a data-quality accident but as the
designed behaviour of the endpoint.

**Second: the US config decodes the field in Bosch's own words, then hides the
control.** From `/locator/config/en-us.yml`, published to every anonymous
visitor:

```yaml
- category: contactType
  hideFilter: true
  items:
    - {label: "Bosch Rexroth locations", value: "DC"}
    - {label: "Certified Partners",      value: "CE"}
    - {label: "Non-certified Partners",  value: "DW"}
```

`DC` is the manufacturer's own network, stated by the manufacturer, on a filter
a US visitor cannot see. Same failure family as Sullair's `id_no 000000_*` (its
own parent company) and SKF's `offices=true`.

`manufacturer_own_record` is therefore a **union of three independent tests** —
`ContactType == "DC"`, a Bosch-family apex domain, and a company name matching
`bosch|rexroth` — each also reported separately, plus a `ContactType` × flag
crosstab, so a disagreement between the source's own label and the record's
identity is visible rather than smoothed over. Over-flagging costs a few rows;
under-flagging seats the manufacturer. **Flagged, never deleted.**

### The decision rule: one leg unresolvable, one leg promising and unproven

**Leg 1 — ≥150 projected net-new: UNRESOLVED.** No rows, no arithmetic, and a
projection would be near 1:1 anyway. For scale: **the three 1,000 km circles the
US config's own default radius produces cover 10,225 of `deduped-v7`'s 14,284
geocoded rows — 71.6%** (measured during this handoff). Compare the 100-mile
circles every other probe in this tier used, at 15.85%. A three-metro probe at
this radius is close to a national pull.

**Leg 2 — PROMISING BUT UNPROVEN.** This source publishes **both** a tier code
(`ContactType`, decoded by Bosch itself) **and** a per-record line card
(`ProductGroups[]` with `ProductGroupId` / `ProductGroupLevel1` /
`ProductGroupLevel2`) — **more than any other source in this tier.**

⚠ **And that is exactly the shape that has been wrong four times running.** SKF
published `DC001`–`DC028` over a field that was constant on every US row.
Banner's `CATEGORY_CODE` was constant. Industrial Scientific's `countryCode` was
constant. Lincoln Electric SELECTs a five-column brand line card and every column
is `false` on all 271 rows. **A published decode table is not a code.** Neither
Bosch field has been seen on a single real row, so leg 2 is a hypothesis with
good documentation behind it — nothing more.

## 4. What's left on the table

**Everything, and none of it is sized. `—` is the honest cell.**

The whole source is unmeasured: record shape, fill rates, how many rows are
Bosch's own, net-new, and whether the codes sort. What is *not* unknown is the
route, the credential posture, the robots verdict and the filter id space — a
next session starts at request 1 of a live probe, not at reconnaissance.

### Could not verify, stated as such

1. **The record shape** beyond the field names the UI destructures.
2. **Whether city / state / postal code / country ride on the payload — and
   therefore whether `is_us` is derivable without inference.** This one decides
   whether the source is usable at all; every other source in this program keys
   US-ness off a published country field.
3. **Website, phone and email fill rates.** Unknown. Segment A's other locators
   ranged from Festo's usable fill to Walter Surface's zero.
4. **How many rows are Bosch's own locations.** The flag exists; nothing has been
   flagged.
5. **Net-new against `deduped-v7`, on either axis.**
6. **Whether `ContactType` and `ProductGroups` actually sort on real rows.**

### Housekeeping, recorded rather than tidied away

- A mis-dated, empty `boschrexroth-2026-08-03.json` was written and then
  **removed**. Cause: `_polite.CAPTURED` was being clobbered — importing
  `_e4_bundles2` sets it to `2026-08-03` at that module's own level, so setting
  ours before the import was silently overwritten and every output file carried
  yesterday's date. **Fixed by import ordering**, which is documented in the
  extractor as not cosmetic. Only `boschrexroth-2026-08-04.json` remains.
- The two observed 500s were written to `_refused.json` via `_remember` rather
  than re-asking the origin, alongside the robots 404. **Nothing in this file is
  fabricated; both 500s were observed live.**

## 5. Registry row

| boschrexroth | BLOCKED-UPSTREAM | 0 | 0 | 2026-08-04 | unresolved — endpoint pinned and un-gated, but the `-dev` data tier returns HTTP 500; best code schema in the tier, entirely unproven | boschrexroth/ |
