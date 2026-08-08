# pepperlfuchs — source handoff

> **STATUS (2026-08-04): DONE-NO-US-DEALERS.** Built under GATE R-2, and the
> gate turned out to guard nothing. **The endpoint 403s anonymously** — an
> authentication boundary, so the API route was abandoned on the first response
> with no bypass. **The same payload was then found inlined in the public,
> robots-allowed page**, so the data was read at zero compliance cost and the
> signed override went unused.
>
> **And the payload carries no US distributors.** 214 records across 185
> countries; the **United States bucket is 5 rows / 2 companies / 1 domain, and
> that domain is `pepperl-fuchs.com` — the manufacturer's own.** Net-new US
> distributor domains: **zero**. This was never a dealer locator. It is a
> subsidiaries-and-worldwide-offices list.
>
> **Cost: 4 origin requests, lifetime. $0 billed.** Nothing to fold in.

Prompts in this folder: none. There is no remaining build. The one live lead is
a **different host** and is written up in §4.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §6 R-2 (the gate) ·
[`00-sourcing-strategy.md` §9 R-2 (the signature and its scope)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (capture codes verbatim, then test whether they sort)](../../strategy/01-build-plan.md)

## 1. What it is

Pepperl+Fuchs (automation / sensors, Segment C) publishes a country-bucketed
list of **subsidiaries and distributors** at
`https://www.pepperl-fuchs.com/en-us/contact-us/view-all-subsidiaries-distributors-gp27595`.
It is a Nuxt page. `research/01` filed it `hard JS`, and the E4 evidence pass
found its data path in the bundle: `GET /api/protected/distributorsData`, header
`locale: en-US`.

Worth correcting for the next reader: the E4 evidence file records the locator as
`…/support/customer-service/where-to-buy-gp62134`. **That is a different page**
— a product where-to-buy funnel — and it does not mount this component. The
`SubsidiariesAndDistributors` component lives on `-gp27595`. Checking the wrong
page for an inlined payload is how this build initially concluded, wrongly, that
the API request was unavoidable.

That path is covered by `Disallow: /api/` on `www.pepperl-fuchs.com` and is
literally namespaced `/api/protected/`. Two negative signals, one gate.

### The gate, and why it decided nothing

**GATE R-2 was SIGNED YES (Artur, 2026-08-04)** — scope: the robots directive
only, this path, this host. The credential carve-out was explicitly retained and
is not his to waive.

**The carve-out fired.** One anonymous, honestly-identified, ≥3s-paced GET with
an un-rotated desktop UA:

```
GET https://www.pepperl-fuchs.com/api/protected/distributorsData   ->  HTTP 403
```

Under pack policy a 401/403 is an authentication boundary. The source stopped
there. **No credential hunting, no token extraction, no session replay, no UA
rotation, no header spoofing, and no retry** — `_polite.py`'s 2026-08-03 fix
raised `Blocked` on the first attempt, so the refusal cost exactly one request.
The verdict is written to `data/raw/_cache/pepperlfuchs/_refused.json` and
`access_check()` short-circuits on that marker, so a re-run cannot re-probe a
path that has already refused us.

**The 403 is consistent with the call site, not a surprise.** The bundle marks
the call `server: true` — Nuxt fetches it during server-side rendering, from
P+F's own Nitro process. An external client was never an intended caller.

### Then the data turned out to be public

`server: true` cuts both ways: it also means the SSR result is serialised into
the page every anonymous visitor receives. **It is.** Not as the Nuxt 3
`__NUXT_DATA__` devalue block a first pass looks for — as
`window.__NUXT__=(function(a,b,c…){…}(…))`, a **904 KB self-executing JS
expression** inside a 1.0 MB public HTML page.

**Anyone checking only for `__NUXT_DATA__` gets a false "not inlined".** This
file's own first pass did exactly that, against the wrong page, and concluded
the API request was unavoidable. It was not.

The page path is `/en-us/contact-us/…`, which **no rule in
`www.pepperl-fuchs.com/robots.txt` matches** — the Disallow list is `/api/`,
four query-string patterns, `/cgi-bin/` and `/russia/`. So the records in this
source were read with **no override in play at all**, and the signed R-2 gate
went unused. Verbatim robots, re-fetched on the day of the pull, is stored in
the raw payload under `robots_verbatim`.

The IIFE is evaluated in a sandboxed Node `vm` (empty prototype-less context, no
`require`, no `process`, 30s cap) — the same evaluation a visiting browser
performs on a page we were served.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **214** worldwide (185 country nodes, 169 with rows) |
| **US rows** | **5** |
| **US distinct companies** | **2** |
| **US distinct domains** | **1** — `pepperl-fuchs.com` |
| **Net-new US domains vs `deduped-v7`** | **0** (see below) |
| Seated | 0 — and nothing here is seatable |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/pepperlfuchs.py` |
| Raw artifacts | `emails/data/raw/pepperlfuchs-2026-08-04.json` + `.csv` |

**US fill: website 80% · phone 100% · email 100%.** Those percentages are real
and completely worthless — they describe five rows, four of which are
Pepperl+Fuchs.

**The five US rows, verbatim:**

| Company | `type_raw` | City | Domain | Email |
|---|---|---|---|---|
| Pepperl+Fuchs Inc. | `null` | Twinsburg OH 44087 | pepperl-fuchs.com | sales@us.pepperl-fuchs.com |
| Pepperl+Fuchs Inc. | `null` | Katy TX 77494 | pepperl-fuchs.com | sales@us.pepperl-fuchs.com |
| Pepperl+Fuchs Inc. | `null` | Roseville MN 55113 | pepperl-fuchs.com | sales@us.pepperl-fuchs.com |
| Pepperl+Fuchs, Inc. | `Sales Office` | Troy MI 48083 | pepperl-fuchs.com | sales@us.pepperl-fuchs.com |
| VMT Vision Systems Inc. | `null` | Hoover AL 35244 | **none** | us.sales@vmt-systems.com |

Four are the manufacturer's own offices. The fifth, VMT Vision Systems, is a
Pepperl+Fuchs group company and publishes no website. **The one "net-new" US
domain is `pepperl-fuchs.com` itself** — which is the exact failure the E4
dossier predicted for Bosch Rexroth: *"the manufacturer mixes its own offices
into the partner list, so a type filter is mandatory or the extractor seats the
manufacturer."* Here there is nothing left after the filter.

**Provenance 100% filled** on all 214 records: `source`, `source_url`,
`captured`.

**Cost: 4 origin requests, lifetime.** `robots.txt` (200), the access check
(403), the public page (200), and one `robots.txt` on the follow-up host in §4
(200). Physical count, not netted down. A re-run costs zero — everything is
cached and the refused path is short-circuited.

## 3. How deep we went

To exhaustion, in one page fetch. The component ships all 185 countries at once
and filters client-side, so there is no paging, no metro grid, no sweep, and no
second request that could return anything different.

### The code sorts globally and is useless here — §5i, both halves

Captured verbatim and uninterpreted, then tested. **Across all 214 records:**

```
type_raw   Distributor 106 · (null) 63 · Sales Office 41 · Reseller 2 ·
           Headquarter 1 · Distributor Mobile Computing + Communications 1
```

**That is a real, discriminating code** — better than SKF's constant, better
than Walter's absent one. P+F genuinely separates distributors from its own
sales offices.

**And in the US bucket it collapses to `null` ×4 + `Sales Office` ×1.** There
are 106 `Distributor` rows in this payload and **not one of them is in the
United States.** The code works; there is simply nothing for it to sort here.

This is §5i's rule running in the useful direction. Reading the global
distribution and stopping there would have produced a confident claim that P+F
publishes a rich distributor taxonomy we could qualify on. It does — for
Germany, Indonesia and 167 other buckets. **Report measured value
distributions, scoped to the segment you will actually send to.**

Other codes, all measured, none useful: `contact_types_raw` is `FA|GENERAL|PA`
on 100% of US rows; `country_raw` is single-valued by construction;
`record_shape` splits 4 `addresses` / 1 `responsibleCompanies`.

### Two shapes, and why `is_us` ignores the bucket

The payload nests rows two ways: `countries[].addresses[]` (a location with
`company[0]` attached) and `countries[].responsibleCompanies[]` (a company with
`address[0]` attached, listed under the country it **covers**). The Twinsburg OH
headquarters is listed under **Anguilla** because it covers Anguilla. `is_us` is
therefore taken from each row's own address country and never from the bucket —
otherwise the HQ would have been filed as Anguillan and the US count would read
4.

### What the global rows are, since 81 of them are net-new

82 distinct domains worldwide, 81 net-new against `deduped-v7`. **They are not a
prize.** They are German, Indonesian, Turkmen and similar national distributors
— `vmt-gmbh.com`, `aditana.co.id`, `yashyl-dunya.tm`, `seli.de`, `deha.de`. The
program is US-scoped. Recorded so nobody re-derives the number and mistakes it
for yield.

`state` and `zipCode` are **null on 100% of rows.** The city string carries them
inline (`"Katy TX 77494"`). Emitted as null rather than parsed out — that is an
inference, and S2 owns it. Moot at five rows.

## 4. What's left on the table

**Nothing, on this source.** One page returns the complete global list and there
is no US dealer content in it at any depth.

**Against the E4 decision rule — ≥150 net-new plus a tier code or per-record
line card — this fails the volume leg at 0 and is the sixth measured E4 source
to fail.** It is also the cheapest failure in the tier: four requests.

### The real US where-to-buy tool is somewhere else — and it is un-gated

The where-to-buy page cached on 2026-08-03 points US visitors at a different
host entirely:

```
https://www.quotepf.com/wheretobuy
```

**One `robots.txt` fetch, recorded verbatim (2026-08-04):**

```
User-Agent: *
Disallow: /META-INF/
Disallow: /WEB-INF/
```

**`/wheretobuy` is allowed.** Nothing else was fetched from that host — no page,
no data, no bundle read. It is a lead, not a probe.

**The uncomfortable finding worth carrying forward:** two days of gate work went
into an endpoint that carries zero US distributors, while the actual US
where-to-buy route sits on a host whose robots file permits it. The E4 method
says *find the data path, then check the host's robots*. It does not yet say
**confirm the payload contains the segment you are buying before spending a
gate on it** — and that check costs one page fetch. See §2 of the E4 folder.

**Whoever picks up `quotepf.com` must run the full method from the top** — read
its bundle, find the serving host, re-fetch *that* host's robots, check
anonymous access — and should size it against the tier's measured record (every
built E4 source under 150 net-new), not against the original +2,500–3,500
estimate. On P+F's US network specifically, temper it further: this is a
sensor/automation brand whose US distribution overlaps heavily with the
Banner/Festo networks already measured at 51 and 24 net-new.

**Could not verify, stated as such:**
- **Why the endpoint 403s.** WAF rule or a Nitro auth check — indistinguishable
  without exactly the probing the policy forbids. Not attempted. The policy
  outcome is identical either way: stop.
- **Payload freshness.** No timestamp anywhere in the payload.
- **Whether `quotepf.com/wheretobuy` lists independent distributors at all.**
  Unfetched by design.

## 5. Registry row

| pepperlfuchs | DONE-NO-US-DEALERS | 214 | 0 | 2026-08-04 | nothing on this source — 0 US distributors, the only US domain is the manufacturer's; live lead is `quotepf.com/wheretobuy` (robots-allowed, unprobed) | `pepperlfuchs [DONE-NO-US-DEALERS]/` |
