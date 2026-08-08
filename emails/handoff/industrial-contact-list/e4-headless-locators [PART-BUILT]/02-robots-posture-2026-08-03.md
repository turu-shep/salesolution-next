# E4 — per-locator robots posture, measured 2026-08-03

> **This file is the Step 0 evidence and the gate itself.** It exists because
> `01-prompt.md` requires a **per-site** robots decision, signed by Artur,
> before any locator in this tier is built. The pack conventions define a
> GATE:HUMAN as *a written question with a stated default*, not a silent pause —
> so the questions are in §6 below, each with its default.
>
> **Nothing in this tier was harvested.** Zero dealer records were requested from
> any E4 target. What was fetched: `robots.txt`, the locator page itself, one
> terms page where the locator linked one, and the locator's own JavaScript
> bundle — all public subresources of a page we were already allowed to load.
> Paced ≥3s per host, every response cached, honest desktop UA never rotated.

## 1. The counter-argument, stated first — as `01-prompt.md` requires

Before anyone signs anything: **we hold 13,719 ranked-out companies we have not
worked**, and §5l of the build plan says the cut line is the weakest claim in
the entire build — ≈6,513 of those unenriched companies would clear the cut
score if simply fetched. Buying 2,500–3,500 more companies before working the
ones in hand repeats the mistake §5f named: enriching everything when we were
long, not short.

E4's stated justification is also dead twice over. It was funded for cross-brand
line-card depth; §5a measured that depth at **0.3%** and showed more sources
cannot rescue it. It was then defended on volume; §5f delivered 25,332 companies
against a need of ~3,000.

**The one surviving argument** is narrow and worth stating exactly: every
locator-sourced record carries **the brand that listed it, at 100% coverage by
construction**. That stamp writes the email — *"You're an authorized Enerpac
distributor and you don't come up for Enerpac repair in Houston"* — and 11,024
of our 13,719 ranked-out rows are DataForSEO listings, which can never carry it.
So the case for E4 is **authorization-stamped breadth in thin segments**, not
depth and not volume. Segment A (fluid power) is the thin one; Festo and Bosch
Rexroth sit there.

## 2. Method — and the finding that reframes the whole tier

Three rules, applied to every target:

1. **robots.txt is per-origin (RFC 9309).** The rules that govern a request are
   the rules published by *the host being requested*.
2. **Longest match wins (RFC 9309 §2.2.2).** A bare `Disallow: /` next to an
   `Allow: /northamerica/s` does **not** disallow `/northamerica/s/…`.
3. **Find the data path statically, before rendering anything.** Reading the
   locator's own bundle costs one GET and pre-empts the exact hazard §7.1
   flagged: a render whose page is permitted while its XHR hits a disallowed
   path. Rendering first would have committed the request the gate exists to
   decide.

> ⚠ **Rule 2 caught a false alarm in my own first pass.** The initial check
> flagged Lincoln Electric as `Disallow: /` and would have killed it. Applying
> longest match correctly, Lincoln's locator path is **allowed**. Fixed in
> `_e4_evidence.py`; recorded here because §5l's standing check cuts both ways —
> a suspiciously *alarming* number deserves the same verification as a
> suspiciously clean one.

**The finding that reframes the tier: for three of eight targets, the dealer
data does not come from the host you are looking at.** Banner serves it from
`api2d.bannerengineering.com`, Festo from `api.festo.com`, Bosch Rexroth from an
Azure container app. Rule 1 means those hosts' robots files govern — and they
disagree sharply with the www hosts'. Anyone who read only `www.*/robots.txt`
would get **Banner exactly backwards**.

Second-order consequence, and it is the useful one: **Banner is not a headless
target at all.** Its data path is `GET …/dist?…&return=json` — one request, no
browser. The same shape holds for Festo and Walter. The premise that E4 costs a
Playwright build was, for at least three of eight targets, wrong. **The cost of
this tier was never the browser. It is the robots posture, and that varies per
site far more than `research/01` implied.**

## 3. Per-locator evidence

Every row: page status measured today (Step 1 re-validation), the data path
taken from the site's own JavaScript, the host that serves it, and that host's
verbatim robots verdict under longest match.

| Target | Locator page (today) | Data path — from the site's own JS | Serving host | Robots verdict on that path | Override needed? |
|---|---|---|---|---|---|
| **Banner** | 200, 563 KB, AEM | `/dist?apikey=…&sitename=us/en&q=…&return=json` | **api2d.bannerengineering.com** | **`Disallow: /`** — whole host, no exceptions | **YES** |
| **Festo** | 200, 1.6 KB shell | base `https://api.festo.com/it/apps/locators/v1` | **api.festo.com** | **No robots.txt** — HTTP 404 | **No** |
| **Lincoln Electric** | 200, 459 KB, SF Aura | under `/northamerica/s/…` | mylincoln.lincolnelectric.com | **`Allow: /northamerica/s`** beats `Disallow: /` | **No** |
| **Bosch Rexroth** | 200, 59 KB | app at `…azurecontainerapps.io/locator/` | **contact-locator-nextapp-**`dev`**.…azurecontainerapps.io** | **No robots.txt** (host returns its app shell) | **No** — but see the caveat |
| **Pepperl+Fuchs** | 200, 883 KB, Nuxt | **`/api/protected/distributorsData`** | www.pepperl-fuchs.com | **`Disallow: /api/`** | **YES** — and see below |
| **Walter Surface** | 200, 166 KB, SF LWR | `/us/webruntime/api/apex/execute` → `WalterENWhereToBuyController.getAllDistributorMarkers` | www.walter.com | **`Allow: /`** (sole Disallow is a password-reset page) | **No** |
| **SKF** | 200, 24 KB, Angular/Akamai | `/address/distributors/location?bounding_box=…&limit=…&countryName=US` | www.skf.com (**same origin**) | **Allowed by absence** — no rule in the `*` block matches | **No** |
| **Continental** | 200, 5.8 KB, AEM Edge | `/apis/v1/distributors?locatorType=…&radius=…&latitude=…&longitude=…` | www.continental-industry.com (**same origin**) | **`Allow: /`** — nothing disallows `/apis/` | **No** |

### How SKF's host was settled, since `research/01` called it obfuscated

`research/01` recorded "endpoint not found in bundle scan; API path obfuscated."
That was **half right, and the half it got wrong is the half that mattered**: the
*path* is in the bundle (`chunk-F5OGGODZ.js` builds
`${solrUrl}location?bounding_box=…`), but `solrUrl` is
`settings.addressServiceConfig.config.url`, which appears as a literal in no
bundle at all — there is no source map, and Angular's `HttpClient` accepts either
an absolute or a same-origin relative URL, so **the config value alone decides
the origin.** No amount of further bundle reading could produce it.

One GET of `https://www.skf.com/v2/assets/config/config.json` — a static app
config published to every anonymous visitor, on a path no robots rule touches,
and not a distributor-data endpoint — returned:

```
addressServiceConfig.config.url = "/address/distributors/"
```

**Relative. Same origin.** So `www.skf.com/robots.txt` governs, and none of its
seventeen `*` Disallow rules matches `/address/distributors/…`. Worth noting
because two of those rules (`/*/authorized-general/`, `/*/certified-rebuilder/`)
*sound* like distributor listings and would trip a careless reader — they do not
match this path.

**SKF's credential posture is positively established, not merely absent.** MSAL's
`protectedResourceMap` enumerates exactly which URLs receive a B2C bearer token:
`search.skf.com/…/croesus/*`, `/feedback-service/*`, `/cad-service/download-cad/*`.
The address service is **not** in that map, and the calls are bare
`httpClient.get(u)` with no headers. The one `apikey` in the chunk is a Google
Maps browser key.

Continental is simpler: bare `fetch(u)` with no init object, no headers, no key,
no `credentials` option. Its only `apiKey` is likewise a Google Maps browser key
read from the page's own DOM. **No credential boundary on either.**

**Terms pages.** Three targets linked one from the locator (Banner,
Pepperl+Fuchs, Sullair); all three were fetched and read. **None carries an
anti-automation, anti-crawling or data-mining prohibition.** Apparent keyword
matches were product taxonomy — Banner's "automated checkout", "assembly &
robotics". This is the same check `kennametal.py` recorded, and it comes back
the same way: on these hosts, robots.txt is the only stated preference there is.

### Detail worth carrying forward

**Banner — the strongest target has the strongest "no".** The dossier called
Banner "the strongest single target on its own merits," and on data quality it
still is: the bundle confirms the tier codes are real and readable —
`CATEGORY_CODE` ∈ {`DISTRIBUTOR`, `BANNER`, `REPRESENTATIVE`…} and `SUBTYPE` ∈
{`DIGITAL`, `NATIONAL`}, with `PARTY_NAME` as the company field. That is the
explicit authorization tier we hold from no other source. And its data host says
`Disallow: /` for everything. **Both facts are true and they point opposite
ways.** That is the decision, undiluted.

On the credential question: Banner's `apikey` value is published in the page's
own `window.bnrApiConfig` and reused in anonymous `<img src>` URLs served to
every visitor. That is a **public site identifier** — the Banjo widget-uid shape
we already accepted — **not** a credential like Bimba's absent Bullseye key or
Enerpac's leaked Oracle service account. The credential rule does not block
Banner. Only robots does.

**Pepperl+Fuchs — two independent signals, both negative.** The path is
`Disallow`ed *and* namespaced `/api/protected/`. Even under a robots override I
would not build this one without first establishing whether it 401s anonymously,
because a 401 makes it a credential boundary — permanently excluded, and **not
within Artur's override to grant**.

> **RESOLVED 2026-08-04, and all three predictions held.** The endpoint returned
> **403** to an anonymous, paced, un-rotated request → auth boundary → stopped on
> the first response, no bypass attempted. The robots override was signed and
> **never needed**: the identical payload is inlined in the public
> `…/contact-us/view-all-subsidiaries-distributors-gp27595` page as
> `window.__NUXT__=(function(…){…}(…))`, and no rule in this host's robots file
> matches a `/en-us/contact-us/` path.
>
> **The lesson is not about robots.** The payload contains **no US distributors
> at all** — 5 US rows, 4 of them Pepperl+Fuchs's own offices, 1 a P+F group
> subsidiary with no website. Two days of gate work went into an endpoint that
> was never going to yield a single seatable company. `type_raw` sorts cleanly
> *globally* (`Distributor` 106 · `Sales Office` 41 · `Reseller` 2) and there is
> **not one `Distributor` row in the United States**. §5i's rule needs a
> companion: **confirm the payload contains the segment you are buying before
> you spend a gate on it** — one page fetch, which is cheaper than the gate.
>
> The real US where-to-buy route is on a different host, `quotepf.com`, whose
> robots.txt disallows only `/META-INF/` and `/WEB-INF/`. Unprobed by design.
> Details: `../pepperlfuchs [DONE-NO-US-DEALERS]/00-README.md` §4.

**Bosch Rexroth — allowed, with a caveat that is not about robots.** The
production page embeds an app whose hostname contains `-dev`. Pulling a
production dealer list out of something a vendor labelled a dev deployment is a
stability risk, not a compliance one, and it may vanish without notice. Also
carried forward from `research/01`: Bosch mixes its own offices into the partner
list, so a type filter is mandatory or the extractor seats the manufacturer.

## 4. Step 1 re-validation — what changed since 2026-08-01

`research/01`'s table is two days old and §5i's lesson is that a source
fingerprint has a shelf life (Matthews went 200 → 403 inside one day). One
honest GET each:

- **All eight E4 locator pages still return 200.** No target has gated since
  2026-08-01. No 403 anywhere in the tier.
- **The "429 trio" classification is falsified for at least two of three.**
  §7.1 files ARO, Miller and Ingersoll Rand as *pace* signals — "slowing down IS
  the fix." Measured today at ≤1 request per 3s with 15/30/60/120/120s
  exponential backoff:
  - **ARO — 429 on `robots.txt` itself**, and again on the locator page, through
    five attempts each. A host that will not serve its own robots file to a
    paced, honestly-identified client is not throttling us by rate.
  - **Miller — 429 on `robots.txt`**, same shape.
  - Ingersoll Rand — measurement still running; result lands in `00-README.md`.

  **This is a correction to §7.1, and it is the useful kind.** A 429 that
  survives exponential backoff is a wall wearing a throttle's status code. The
  remedy §7.1 prescribes (slow down, run overnight) does not apply, and the
  remedies that *would* apply — rotating UA, changing egress IP, stealth
  headless — are exactly what §7.1 forbids. **These belong with the Cloudflare
  eight, not on the "cheap win" list where this handoff currently puts them.**
  No escalation was attempted.
- **Sullair's CSV path is RESOLVED** — the open item `research/01` has carried
  since 2026-08-01. The page's inline script sets
  `public_path = "/sites/default/files/"`, so the files are
  `…/sites/default/files/data/stationary_distributor_list.csv` and
  `portable_distributor_list.csv`, plus per-region `*Map.csv`. `robots.txt`
  disallows only `/search/` and `/index.php/search/` — **the data path is not
  disallowed.** No override involved.

## 5. What this costs, honestly

Nothing was billed. The tier's cost profile changed shape: **three of eight
targets need no browser at all**, and two of the three "cheap adjacent wins"
turn out to be walls. What remains is judgement, which is what §6 asks for.

## 6. GATE:HUMAN — the per-locator questions, each with its default

**The gate is asked per site, and only where a site would require overriding a
stated preference.** Where a host publishes no `Disallow` covering the data
path, no robots-posture *change* is involved and the pack's standing policy
already governs it (public pages · no login/CAPTCHA/403 bypass · paced · cached
· provenance on every record). Those are marked "no gate" below.

**Default if nobody answers: NO.** An unsigned gate is a no, not a maybe.

| # | Question | Default | Recommendation |
|---|---|---|---|
| **R-1** | **Banner Engineering** — its data host `api2d.bannerengineering.com` publishes `User-agent: * / Disallow: /`. Build against it anyway? | **NO** | **NO.** This is the clearest stated preference in the set — a whole-host disallow, nothing to misread. Banner's tier codes are genuinely the best qualification signal found anywhere, and the answer is still no: §7.1's standing counter-argument is that a firm selling AI-search-readiness and SEO carries asymmetric reputational risk from being seen to ignore a `Disallow`, and this is the most legible possible instance of one. If any single override is worth signing it is this one — the prize is real — but sign it knowingly, not as a formality. |
| ~~**R-2**~~ | ~~**Pepperl+Fuchs** — data path `/api/protected/distributorsData`, covered by `Disallow: /api/`. Build?~~ | ~~**NO**~~ | **SIGNED YES (Artur, 2026-08-04) — BUILT AND CLOSED THE SAME DAY, AND THE SIGNATURE WAS NEVER USED.** The recommendation above predicted the auth wall and was right: one anonymous, paced, honestly-identified GET returned **HTTP 403**. The source stopped on that response — no bypass, no retry, no UA rotation. **Then the same payload was found inlined in the public, robots-allowed page** (`window.__NUXT__`, 904 KB, on `…-gp27595`), so the data was read with no override in play. **And it holds zero US distributors:** 214 global records, 5 US rows, 2 companies, 1 domain — `pepperl-fuchs.com`, the manufacturer's own. Full write-up: `../pepperlfuchs [DONE-NO-US-DEALERS]/00-README.md`. |
| **R-3** | **The 429 wall (ARO, Miller, Ingersoll Rand)** — §7.1 classifies these as pace signals. Measurement falsifies that for at least two. Reclassify as access controls and stop working them? | **YES, reclassify** | **Reclassify.** Leaving them on the "cheaper win first" list sets a trap for the next session, which will burn a day rediscovering this and may be tempted to escalate. Their dealers are recoverable through `serp/`, exactly as the Cloudflare eight were. |
| ~~**R-4**~~ | ~~**SKF, Continental** — verdicts pending.~~ | — | **RESOLVED, no gate needed.** Both serve from their own origin and neither robots file disallows the path — SKF by absence, Continental by an explicit `Allow: /`. Neither requires a credential. Built and measured; results in `00-README.md`. |

**No gate required — six of eight:** Festo (no robots.txt on either host),
Walter Surface (`Allow: /`), Lincoln Electric (`Allow: /northamerica/s` beats
`Disallow: /`), SKF (allowed by absence), Continental (`Allow: /`), and Sullair
among the adjacents. Bosch Rexroth is un-gated on robots grounds but held on the
`-dev` host stability question. Build results in `00-README.md` §2 and §5.

**The headline for whoever signs this: the tier is 6 clear, 2 blocked — not the
across-the-board compliance minefield the dossier assumed.** Two locators need a
signature. Six never did, and four of those are already built or cleared. That
is a much smaller decision than the one this gate was set up to ask.

## 7. Artifacts

| Path | What |
|---|---|
| `emails/scripts/sources/_e4_evidence.py` | robots + terms + fingerprint sweep, 12 targets |
| `emails/scripts/sources/_e4_bundles.py` | static bundle sniff — names the data path without rendering |
| `emails/scripts/sources/_e4_apihosts.py` | robots verdict on the host that actually serves the data |
| `emails/scripts/sources/_e4_observe.mjs` | single observation render; **written but deliberately never run against a target whose data path is disallowed** |
| `emails/data/raw/e4-evidence-2026-08-03.json` | per-target robots rules, stack markers, terms clauses |
| `emails/data/raw/e4-bundles-2026-08-03.json` | endpoint strings and code-field names found in bundles |
| `emails/data/raw/e4-apihosts-2026-08-03.json` | per-data-path robots verdicts |
