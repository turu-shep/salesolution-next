# equipment-dealers — per-OEM robots posture, measured 2026-08-04

> **This file is `01-prompt.md` Step 3, and it is the gate.** ICP-EQ being signed
> does not clear it: an ICP decision is not a robots decision. The question is
> asked **per site**, and only where a site would require overriding a stated
> preference. Where a host publishes no `Disallow` covering the data path, no
> posture *change* is involved and the pack's standing policy already governs it.
>
> **One gate is open: R-EQ-1 (Kubota). Default NO. Recommendation NO.**
> Bobcat and Case IH needed no signature and are built.

## 1. Method — the same three rules E4 used, because they keep paying

1. **robots.txt is per-origin (RFC 9309).** The rules that bind a request are the
   ones published by *the host being requested*. E4 proved on 2026-08-03 that
   dealer data usually comes from a different host than the page — Banner, Festo
   and Bosch Rexroth all did — and that reading only `www.*/robots.txt` gets
   Banner exactly backwards.
2. **Longest match wins (RFC 9309 §2.2.2).** A bare `Disallow: /` sitting under
   an `Allow: /x` does not disallow `/x/…`. This rule saved Lincoln Electric from
   a false kill on 2026-08-03, **and it is what saved Bobcat today.**
3. **Find the data path statically, before rendering anything.** Reading the
   page's own JavaScript costs one GET and pre-empts the hazard §7.1 named: a
   render whose *page* is permitted while its XHR hits a disallowed path.

## 2. The headline

**None of the three targets needed a headless browser.** The 2026-08-03
fingerprint filed all three as "JS shells returning zero names to a fetch," which
was true and irrelevant — the same thing E4 found on six of eight targets. Bobcat
hydrates from a Coveo search index; Case IH calls five plain same-origin JSON
endpoints. Both were reachable with `urllib`.

**What actually decided the tier was robots posture, and it split 2 clear / 1
blocked.**

## 3. Per-target evidence

| Target | Locator page today | Data path — from the site's own code | Host that serves the data | Robots verdict on that path | Override needed? |
|---|---|---|---|---|---|
| **Bobcat** | 200, 942 KB, Nuxt | Coveo `POST /rest/search/v2`, org `bobcatproduction10bzen8ct` | **`bobcatproduction10bzen8ct.org.coveo.com`** | **`Allow: /rest/search` beats `Disallow: /`** | **No** |
| **Case IH** | 200, 164 KB, Sitecore JSS + Akamai | `GET /apirequest/dealer-locator/get-dealer-by-{geo-code,geographic-filter,country,dealer-name,dealer-number}` | www.caseih.com (**same origin**) | **Allowed by absence** — none of its 49 `*` rules matches | **No** |
| **Kubota** | 200, 127 KB, Next.js | — not looked for | www.kubotausa.com | **`Disallow: /` — the whole host** | **YES → GATE R-EQ-1** |
| ~~JLG~~ | **403** | — | — | — | **Out, by decision (2026-08-03)** |

### Bobcat — allowed, and it would have been killed by a careless read

Three origins are involved and each was read before anything was requested.

- `www.bobcat.com` — 15 `*` `Disallow` rules, every one a `…thank-you`
  confirmation page or `/*/*/search`. None matches `/dealer`. **Allowed.**
- `bobcat.api.bobcat.com` — the Coveo token minter. `robots.txt` → **HTTP 404**,
  so the host states no preference. Same posture the pack accepted for
  `api.festo.com` on 2026-08-03, which needed no override.
- `bobcatproduction10bzen8ct.org.coveo.com` — **the host that actually serves the
  dealers.** Its file, verbatim:

  ```
  User-agent: StatusCake/VirusScanner/AVIRUS-01
  Allow: /

  User-agent: *
  Allow: /rest/search
  Allow: /rest/organizations/*/commerce/v2/listing
  Allow: /rest/organizations/*/commerce/v2/search
  Allow: /rest/organizations/*/commerce/v2/querySuggest
  Allow: /rest/organizations/*/commerce/v2/productSuggest
  Allow: /rest/organizations/*/commerce/v2/facet
  Allow: /rest/organizations/*/commerce/v2/recommendations
  Disallow: /
  ```

  `Allow: /rest/search` (12 chars) beats `Disallow: /` (1 char) under longest
  match, so `/rest/search/v2` is **explicitly allowed** — Coveo disallows its
  platform wholesale and then carves out the search endpoint by name. **A reader
  who stopped at `Disallow: /` would have killed the one target that cleared the
  decision rule.** This is the Lincoln Electric shape, second confirmation.

**Credential posture — assessed, not a boundary.** `orgId`, `tokenUri`,
`fieldsToInclude`, a Google Maps browser key and a `coveoApiKey` are all printed
in the anonymous locator page's own inline payload. The token endpoint was called
anonymously — no login, no cookie, no prior session — and returned a JWT whose
claims are `searchHub: DL_NA_Search`, `organization: <orgId>`,
`roles: ["queryExecutor"]`: an anonymous, read-only, query-only search token
minted for every visitor. **Not login-derived, so not the Bimba/Enerpac
permanently-excluded shape.** It is one step beyond the static
Banjo/Banner/Festo published-key shape — the site mints a short-lived bearer
rather than publishing a literal — and that distinction is flagged here rather
than quietly decided. **No token value is recorded in any record, raw file or
report.**

**One 403, recorded rather than hidden.** `dxp-static.bobcat.com` — Bobcat's
static-asset CDN — answered **403 on its own `robots.txt`** and 200 on every JS
asset. The first evidence run then fetched ten bundles from it anyway, because
its skip logic keyed on *parsed rules being present* and a blocked robots fetch
leaves that key unset. **That is a real ordering flaw and ten requests reached a
host after it had 403'd.** It changed nothing: the bundles held nothing about
dealers (the Coveo library loads from Coveo's own CDN at runtime), and every
value the extractor needs came from `www.bobcat.com`'s allowed HTML. The host is
**dropped from the plan** and `bobcat.py` never touches it.

### Case IH — allowed by absence, with two lookalike rules that would trip a careless reader

`www.caseih.com/robots.txt` carries 49 `*` rules. **None matches
`/apirequest/dealer-locator/…`.** Two of them look like they might and do not:

- `Disallow: /Search/` — a SharePoint search collection, not a prefix of our path.
- `Disallow: /dealer-landing-page` — and this one matters for a *different*
  reason. It covers the per-dealer microsite that the payload's `dealerWebsite`
  field points at. See §5: that field is a trap on its own merits.

The path came out of `/dist/caseih/static/js/259.0fdf6065.chunk.js`, which builds
five endpoints with a bare `fetch(url, {signal})` — no headers, no key, no
`Authorization`, no `credentials` option. **No credential boundary.** The terms
page (`/en-us/unitedstates/legal-notice`) was fetched and read: **no
anti-automation, anti-crawling or data-mining clause.** Apparent keyword matches
were product taxonomy ("harvest").

### Kubota — the whole host is disallowed. STOP.

`https://www.kubotausa.com/robots.txt` is **27 bytes**, in full:

```
User-Agent: *
Disallow: /
```

No `Allow` anywhere. No named-agent group. Nothing to arbitrate under longest
match. This is the **Banner shape** — a whole-host disallow, the most legible
possible statement of preference — and it covers the locator page,
`/find-a-dealer`, and every `/_next/static/chunks/*` bundle. **There is no
compliant way even to READ the bundle, let alone call the data path.**

**Target stopped. Zero dealer records requested.**

Two things recorded because hiding them would be worse:

1. **Two requests were spent on the host before its robots file had been read.**
   The Step-2 fingerprint sweep fetched `robots.txt` and the locator page in the
   same pass, so the page fetch went out against a path we learned a moment later
   was disallowed. Both are cached at `data/raw/_cache/e4evidence-kubota/`.
   Nothing has been requested from the host since. **The ordering is the bug**:
   robots must be read and *acted on* before the page, not alongside it.
2. **`kubotausa.wpenginepowered.com` exists and is not a loophole.** It is the WP
   Engine backing origin for the same site. Reaching data through it that `www`
   disallows would be host switching, which the posture forbids outright and
   which no signature covers. It is named here so the next session does not
   "discover" it and think it found something.

An offline read of the already-cached locator HTML (zero new requests) found no
third-party data host: `/regional-dealers` is a Next.js marketing page that links
to `/find-a-dealer` on the same disallowed origin.

## 4. GATE:HUMAN — the question, with its default

**Default if nobody answers: NO.** An unsigned gate is a no, not a maybe.

| # | Question | Default | Recommendation |
|---|---|---|---|
| **R-EQ-1** | **Kubota** — `www.kubotausa.com/robots.txt` publishes `User-Agent: * / Disallow: /` for the whole host. Build against it anyway? | **NO** | **NO.** Weaker case than R-1 Banner, which you did sign. Banner bought a **qualification signal available from no other source** — explicit authorization tiers. Kubota buys **volume in a cohort we have not proven yet**: 1,100+ dealers, no published tier code (unverifiable without touching the host), and the two OEMs we could measure came back 372 and 57 projected in-band net-new. The standing counter-argument from §7.1 applies with full force — a firm selling AI-search-readiness and SEO carries asymmetric reputational risk from being seen to ignore a `Disallow`, and a bare whole-host `Disallow: /` is the most legible instance of one there is. **Revisit only if Bobcat's national sweep converts and the constraint becomes dealer supply rather than reply rate.** |

## 5. Two payload traps this session found — carry them forward

Neither is a robots question; both would have corrupted the measurement, so they
belong beside it.

**Case IH publishes TWO website fields and picking the wrong one costs the whole
source.** `dealership.dealerWebsite` is an OEM-hosted landing page —
`caseih.com/…/dealer-landing-page.aspx?idDealer=…` — so it is `caseih.com` on
every row. `dealership.dealershipAttributes.website` is the dealer's *own* site
(`ascoeq.com`, `hlavinka.com`, `stollerih.com`). The first read of this source
took `dealerWebsite`, reported **88.9% website fill with exactly ONE distinct
domain**, and then the domain-first clustering merged 24 unrelated dealers into a
single fake `above-ceiling` mega-group. Real fill on the correct field is
**90.3%**. `_eq_sizeband.dealer_domain()` now strips OEM-owned domains before
clustering, which is the general fix: **a locator's "website" field is not
automatically the dealer's website.**

**Bobcat's declared facets are mostly empty, and the real line card is a field
the page never mentions.** The locator page prints three facet field names with
their default values right there in the anonymous HTML —
`bobc_accountbusinessactivity_dict` (Rentals / Parts / Services),
`bobc_accountindustry_dict` (five industries), `bobc_accountproduct_dict` (29
products). **Two of the three are null on every record in the payload.** The
per-record line card that actually exists is `account_contract_code_names`,
populated 100%, which the page does not mention at all. Reading the page's facet
list would have produced a confident, wrong claim about the best qualification
signal — the same mistake SKF's decoding table nearly caused on 2026-08-03. §5i's
rule is *capture the code verbatim and test whether it sorts before seating*, and
this is the fourth consecutive confirmation that the test is not optional.

## 6. Artifacts

| Path | What |
|---|---|
| `emails/scripts/sources/_eq_evidence.py` | per-host robots + bundle sniff for the equipment targets |
| `emails/scripts/sources/_eq_sizeband.py` | **the size-band filter, written before any record landed** |
| `emails/scripts/sources/bobcat.py` | three-metro probe (bounded in code) |
| `emails/scripts/sources/bobcat_national.py` | the earned national sweep, in its own file so the probe cannot silently become one |
| `emails/scripts/sources/caseih.py` | three-metro probe + per-state pull |
| `emails/data/raw/eq-evidence-2026-08-04.json` | robots rules, stack markers, bundle strings |
| `emails/data/raw/eq-apihosts-2026-08-04.json` | per-data-path robots verdicts |
| `emails/data/raw/bobcat-2026-08-04.json` · `bobcat-measure-*.json` | probe payload + measurement |
| `emails/data/raw/bobcat-national-2026-08-04.json` · `.csv` | national sweep |
| `emails/data/raw/caseih-2026-08-04.json` · `caseih-measure-*.json` | probe payload + measurement |
