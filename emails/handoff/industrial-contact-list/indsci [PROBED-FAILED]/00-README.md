# indsci — source handoff (and the PriceSpider/Wayvia platform key)

> **STATUS (2026-08-04):** PROBED-FAILED. **Zero usable net-new ICP companies.**
> 74 records → 23 companies → 5 net-new domains, **all five national chains**.
> The source's own tier code sorts perfectly and sorts the wrong way: the 53 ICP
> rows carry **0% websites**, the 21 chain rows carry 100%.
> **The real deliverable is not this brand — it is the reusable PriceSpider
> request pattern in §1**, which turns any other PriceSpider brand into a
> one-config-lookup test instead of a reverse-engineering job.
> **One gate exists and is deliberately NOT being escalated** — see §4.

Prompts in this folder: `01-prompt.md` — how to test the next PriceSpider brand
in one lookup. Not a re-pull of this one.

Prerequisite reading, in order:
`../e4-headless-locators [PART-BUILT]/02-robots-posture-2026-08-03.md` (the
per-origin robots method) ·
[`01-build-plan.md` §5i (the vertical-code rule — this source both vindicates and inverts it), §5l, §5f](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §7.1 (the obstacle ladder — the 403 question in §4 sits inside it)](../../strategy/00-sourcing-strategy.md) ·
`../linecard-locators [*]/` — where this target was routed from

## 1. The PriceSpider / Wayvia pattern — the reusable part

**Platform note:** PriceSpider has rebranded to **Wayvia** (the widget footer
renders "© Wayvia 2005-2026 … (Formerly PriceSpider)"). Hosts are still
`*.pricespider.com`.

Industrial Scientific mounts its where-to-buy through PriceSpider, a third-party
widget SaaS. `linecard-locators` recorded the data flow as "not statically
derivable" — correct, and **this is the one target in the whole tier that
genuinely needed a render.** Two loads resolved it permanently.

### How a brand page declares itself

Three public meta tags plus one async loader, all in anonymous HTML:

```html
<meta name="ps-key"      content="<clientId>-<defaultConfigId>">
<meta name="ps-country"  content="US">
<meta name="ps-language" content="en">
<script src="//cdn.pricespider.com/1/lib/ps-widget.js" async></script>
```

**`ps-key` is two identifiers joined by a hyphen**, and the loader proves it:
`ps-widget.js` calls `parseInt(meta("ps-key"))`, which stops at the hyphen. The
integer prefix is the **clientId**; the 24-hex suffix is the **default
configId**. Mounts are `<div class="ps-widget">`, and a `ps-config="<configId>"`
attribute on a mount **overrides** the configId for that widget alone.

**IndSci ships two mounts → two configIds → two genuinely different datasets on
one page.** That is not a quirk; it is the mechanism, and §4 shows it is the
whole story here.

### The four-request chain — all anonymous GETs

1. `cdn.pricespider.com/1/<clientId>/config.js` → JSONP; names the library version
2. `cdn.pricespider.com/1/lib/<version>/ps-widget.js` → the real **444 KB** library.
   **This is why the recipe was not statically derivable** — the `lib/ps-widget.js`
   everyone finds first is a 6 KB loader, not the library.
3. `cdn.pricespider.com/1/<clientId>/<configId>/config.js` → **carries the `wtb4.token`**
4. `omni.pricespider.com/?…` → **the data path**

### The data request

JSONP over GET, no POST:

```
https://omni.pricespider.com/?clientId={int}&configId={24hex}&countryCode=US
  &languageCode=en&lat={f}&lon={f}&postalCode={zip}&token={32hex}
  &include=stores,products&key=/{clientId}/{configId}/include/stores%2Cproducts
  &callback=PriceSpider.onload
```

`include=` appears only on user-initiated searches. `key=` is a literal
restatement of the other params — a cache key, not a separate input.

### ⚠ The record schema is COLUMNAR — struct-of-arrays

`stores` is a **list of blocks**, each block one object of parallel arrays; row
*i* is index *i* of every column. Anyone expecting an array of row objects will
mis-parse it silently, which is exactly the §5i failure mode (Yaskawa's
`groupSelect`/`groupList`) that returns plausible-looking wrong data rather than
an error.

26 columns: `address1 address2 city countryCode hours id latitude longitude
misc1 misc2 name phone1 phone2 postalCode sellerId state storeId url urlLabel
distance sellerName sellerLogo stockUpdatable accountSeller configTypes
lastMileDelivery`.

**No email column exists at all** — email is structurally 0%, not unfilled.

### Credential assessment: not a credential

The `token` ships in an anonymous `config.js` on a public CDN — no login, no
session, no cookie, no per-user issuance, and byte-identical across both
configs. That is the Festo/Banjo/Banner public-identifier shape; the Bimba rule
is not triggered. It is read at run time from cache and **written to no file**.
Every created file was leak-tested; one render capture did contain it and **has
been redacted**.

### Two hosts that are not the data path

`locate.pricespider.com/?countryCode=US&postalCode=<zip>` resolves ZIP → lat/lon,
but **you can supply your own centroids and call `omni` directly**, so the
geocoder is avoidable. `wtbevents.pricespider.com` is telemetry;
`embeddedcloud.pricespider.com/seller_md/<sellerId>.png` is seller logos.

### Adding another brand = one row

`indsci.py` is already structured with a `BRANDS` map. Read the next brand's
where-to-buy HTML, copy its `ps-key` and any `ps-config` attributes, done. Token
discovery, request shape and columnar decoding are all brand-independent.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **74** |
| US records | 74 (100%) |
| Distinct companies | **23** |
| Unique domains | **21** |
| Seated (`seated-v5`) | 0 |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/indsci.py` |
| Raw artifacts | `emails/data/raw/indsci-2026-08-04.json` · renders in `e4-observe-indsci-*.json` |

Fill: **website/domain 28.4% overall · phone 97.3% · email 0.0%** (no field exists).

**Cost: 3 scripted origin requests** — the three `robots.txt` fetches, against a
15 budget. **Zero to the data path.** Plus two browser page loads: one load-only
via `_e4_observe.mjs`, and one load plus **a single typed ZIP (77002)**, which is
what the brief authorized and no more.

## 3. How deep we went — and the finding that kills it

**`accountSeller` sorts perfectly, and it sorts the wrong way.** Independently
re-counted against the raw payload:

| slice | rows | with website |
|---|---|---|
| `accountSeller=1` — IndSci's own managed dealer (**the ICP**) | **53** | **0** (0.0%) |
| `accountSeller=0` — PriceSpider-network seller | 21 | **21** (100.0%) |

**100% of rows carrying a website are national chains; 100% of ICP rows carry
none.** And the account feed's `url` column is *empty*, not sparse — structural,
so **a wider sweep raises the row count without raising usable domain
coverage.** Walter (12,364 rows / 0% websites) and SKF's main feed, a third time.

**Codes that sort:** `config_id_raw` (2), `account_seller_raw` (2),
`seller_name_raw` (19), `seller_logo_raw` (2), `stock_updatable_raw` (2),
`hours_raw` (5 values, present on 15/74).

**Codes that do not:** `configTypes`, `lastMileDelivery`, `misc1`, `misc2`,
`urlLabel`, `phone2` — null on 100% of rows, schema only. And `countryCode`,
**constant on every row — the SKF `DC001` trap exactly.** §5i's rule holds: a
field existing is not a code, and only measurement separates the two.

**E-tailer / chain share: 27 of 74 = 36.5%** (Grainger, Airgas, Fastenal, Motion
Industries, MI Conveyance). Flagged via `x_national_chain_or_etailer` — the `x_`
prefix marks it as **our** classification rather than the source's — and **not
suppressed**; every row is in the raw file.

## 4. What's left on the table — and why the gate is NOT being escalated

**Nothing usable.**

Net-new against `deduped-v7.csv` (16,719 rows, all domain-keyed):

| axis | net-new | note |
|---|---|---|
| **by `domain`** | **5** | `airgas.com`, `fastenal.com`, `grainger.com`, `motion.com`, `motionindustries.com` — **all five are national chains** |
| by `norm_company` | 22 of 23 | inflated as predicted; "Vallen" reads new while `vallen.com` is already in the baseline under a different company string |

**Usable net-new ICP domains: zero.** None of 11 probed chain domains appears
anywhere in `deduped-v7`, consistent with deliberate big-box exclusion upstream.

**Decision rule: FAIL.** Leg 2 passes — `accountSeller` is a real authorization
tier that discriminates cleanly. Leg 1 fails at 5 net-new domains (all chains)
against ≥150. AND → fail. **Do not build the sweep.**

### The open gate, and the reason it stays closed

`omni.pricespider.com/robots.txt` returns **HTTP 403**, and two standing rules
point in opposite directions:

- **RFC 9309 §2.3.1.3** places 403 in the "Unavailable" band, meaning
  *unrestricted* — nothing is Disallowed, so longest-match on `/` is vacuously
  allowed.
- **`_polite.py`'s house rule** — "a hard 403 stops the source, never bypassed" —
  already fired: the robots fetch itself raised `Blocked`, the same status that
  retired Matthews.

The agent did not resolve that unilaterally. `GATE_SIGNED = False`, and **zero
scripted requests were made to `omni.pricespider.com`.** The honest
counter-argument is on the record in `indsci.py`: the 403 is on `/robots.txt`, a
path a query-only API plainly does not route, and the same origin returned **200
four times** to the observation render.

**That gate is not being put to Artur, and the reason matters: the source already
failed on yield.** Asking him to adjudicate a compliance question worth **zero
usable companies** would spend his attention on nothing. The question becomes
live only if another PriceSpider brand's account feed carries websites — and
because §1 is pinned, testing that costs one config lookup, not a build.

**Could not verify, stated as such:**
1. **Whether omni's 403 is crawler policy or an unrouted path.** Testing a bare
   `omni.pricespider.com/` would itself be a scripted request to the gated host.
   Left unmeasured on purpose.
2. **Chicago and Cleveland were never run.** The three-metro probe needs scripted
   omni calls. Coverage is Orlando FL (the datacenter-IP default, uncontrolled)
   plus Houston 77002, the one typed ZIP.
3. **National network size is unknown.** Every response capped at 20 store rows
   and **no paging parameter appears anywhere in the request.** Only a ZIP grid
   would measure it — not authorized, not run.
4. Whether the ~50% `url` fill on the `ps-key` config holds nationally; measured
   on 40 rows.
5. Whether `deduped-v7`'s chain absence is a deliberate exclusion rule. Inferred
   from 11 of 11 chains being absent; the exclusion code was not located.
6. **Whether other PriceSpider brands carry URLs on their account feed.** The
   *pattern* generalizes cleanly; whether the account feed is *useful* is
   per-brand. IndSci's is not.

## 5. Registry row

| indsci | PROBED-FAILED | 74 | 0 | 2026-08-04 | zero usable net-new (5 net-new domains, all chains); ICP feed is 0% websites — but the PriceSpider pattern in §1 is reusable across brands | indsci/ |
