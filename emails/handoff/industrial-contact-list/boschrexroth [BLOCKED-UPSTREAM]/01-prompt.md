# boschrexroth — three requests to find out whether the tier is back

Your mission: retry the pinned endpoint with **one specific correction**, decide
in **≤3 origin requests** whether the data tier is alive, and stop. If it still
500s, report and leave the source where it is. If it answers, you have the first
rows anyone in this program has seen from Segment A's best-documented locator —
and a landmine to defuse before a single row is seated.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. **§1's robots table, §3's failure
   table and §3's landmine are all load-bearing.** Read them before you write
   anything.
3. `../../strategy/01-build-plan.md` **§5i** — capture source-native codes
   verbatim, then **test whether they sort**. This source publishes the best
   decode table in the tier and has never been seen to fill it.
4. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` — the per-origin
   robots working for the whole tier.
5. `../skf [*]/00-README.md` §3 — the sharpest instance of a rich decode table
   over a constant field. Read it as the null hypothesis for §5i here.

## Why this is still open

Segment A — fluid power — is the thinnest segment in the program. Parker is
Akamai-gated. Enerpac was one payload, already spent. Adaptall caps at 15 rows a
query and was retired to lookups. Festo returned about 12 usable net-new. **A
working fluid-power locator is worth three requests in a way a sixth bearings
locator would not be.** That is the entire reason this is `BLOCKED-UPSTREAM`
rather than `RETIRED`.

## The work

**Budget, stated before the first request: 3 origin requests, hard-stopped in
code.** `MAX_ORIGIN_REQUESTS` is currently `0`; raise it to `3` and no further.
`RETRY_5XX_ONCE` stays on — five identical 500s already established that the
ladder buys nothing here. ≥3s pacing, one worker, honest UA never rotated, every
response cached.

1. **Send a correct `Origin` header: `https://www.boschrexroth.com`.** This is
   the one substantive thing the last run got wrong and it is the reason to try
   again at all. The locator is a micro-frontend embedded in that page, so a real
   anonymous visitor's browser sends it. The previous run sent the app host, and
   **that request came back HTTP 200 with a zero-byte body** — APIM terminating a
   request whose Origin it did not recognise. Correcting it is what turned the
   silent empty body into a legible 500; it has never been tried *together* with
   a request the tier could answer.
2. **Call `by-geocoordinates` first**, one metro, with the full authored filter
   id space (`productGroups` 1–32, `contactCategories` 1–5) so the filter stays a
   no-op superset rather than a narrowing, and `radius=1000` — the US config's own
   default, and the maximum the app's slider offers any visitor.
3. **Stop after ≤3 attempts if it still 500s.** Report the status, the verbatim
   body, and whether the `Origin` correction changed anything. **Do not** ladder,
   do not rotate a UA, do not switch hosts, do not try the app host again. Leave
   the status `BLOCKED-UPSTREAM` and say when it was last checked.
4. **If it answers — before you count anything — filter `ContactType == "DC"`.**
   Those are Bosch Rexroth's own locations. The app pulls every contact type and
   filters client-side, so a direct API call gets them **by construction**, and
   the US page **hides** the control that would let a visitor see the split
   (`hideFilter: true`). Flag with the three-way union already specified —
   `ContactType == "DC"`, a Bosch-family apex domain, a name matching
   `bosch|rexroth` — report each test separately plus the `ContactType` × flag
   crosstab, and **never delete a row.** Seating the manufacturer into its own
   dealer list is the failure Sullair's `id_no 000000_*` and SKF's `offices=true`
   both nearly produced.
5. **Then test the codes. Do not assume them.** `ContactType` and
   `ProductGroups[]` (`ProductGroupId` / `Level1` / `Level2`) are the richest
   published schema in this tier — a tier code **and** a per-record line card,
   which is more than any other source here offers. **They are also completely
   unproven.** Report each field's measured distribution and say plainly: absent,
   constant, or sorts. **SKF published `DC001`–`DC028` over a field that was a
   constant on all 82 US rows. Banner's `CATEGORY_CODE` was constant. Industrial
   Scientific's `countryCode` was constant. Lincoln Electric's five-column brand
   line card is `false` on all 271 rows. A published decode table is not a code**
   — four times in one tier.
6. **Answer the `is_us` question early.** Whether city / state / postal code /
   country ride on the payload decides whether this source is usable at all. If
   US-ness has to be inferred from a lat/lng, say so before reporting any count.

**GATE:HUMAN — none, and check that this is still true.** The governing origin
`apim-dcslx.azure-api.net` publishes no robots.txt (HTTP 404), and the
credential is a subscription key inlined in the anonymous page's public JS.
**Re-read that robots.txt as request 0 of your budget if any run goes live** —
a host that starts publishing one changes the answer, and the pack's rule is that
the verdict is re-executed rather than restated from a document.

## Do not re-litigate

- **Which origin governs.** `apim-dcslx.azure-api.net` serves the payload, so
  under RFC 9309 its robots file is the one that counts, and it returns **404** —
  no preference stated, nothing disallowed.
- **`www.boschrexroth.com`'s `Disallow: /api/`.** It **would** have disallowed
  this path and it does not govern, because **this source makes zero requests to
  that host** — the locator HTML is read from
  `_cache/e4evidence-boschrexroth/locator.html`. **This is explicitly NOT the
  Pepperl+Fuchs situation**, where the rule sat on the host that actually served
  the data and produced gate R-2. Do not open a gate for a rule on a host you are
  not calling. (Note the asymmetry: you are about to send that host as an
  `Origin` **header**, which is a value in a request to a different origin, not a
  request to it.)
- **The app host's robots.txt.** HTTP 200 with the SPA's index HTML — the
  container serves its shell for every unknown path, so the host publishes no
  robots file. Festo's shape.
- **The credential.** An Azure APIM subscription key inlined in the anonymous
  page's public JS — the Banjo / Banner / Festo shape, not the Bimba shape. Read
  it out of the cached bundle at run time. **It must not land in this repo**; it
  was already redacted once from `data/raw/e4-bundles2-2026-08-03.json`. **If the
  origin ever answers 401 or 403, that is a credential boundary — stop.**
- **`/api/dxf/token` is not involved.** Different micro-frontend (the DXF
  download service). The contact-locator mount carries
  `include-access-token="false"` and its fetch helper sets one header.
- **The endpoint and its parameters.** Base
  `https://apim-dcslx.azure-api.net/contact-locator`; routes
  `/api/v1/contacts/by-geocoordinates`, `/api/v1/contacts/by-country`,
  `/api/v1/filter/${category}`. `offset` is the paging handle and the app
  hardcodes it to `0`. Radius `min=10 max=1000 step=5`, unit km, US default 1000.
  App page cap 100. All of it is read from the vendor's own JS and config; none
  of it needs rediscovering.
- **What the 500 is not.** Not a wrong route (unknown routes answer 404 with a
  JSON body). Not a credential wall (401/403 never appeared). Not robots. Not
  missing filters (the final call carried the complete authored id space). Not a
  country spelling (APIM validates to 400). The body is an **axios** string, so a
  layer that was itself calling something else got a 500.
- **The five-500 ladder is spent, not netted out.** Six attempts over ~230s
  returned the same 500. `RETRY_5XX_ONCE` caps the ladder now, and the budget
  binds every attempt rather than only successful ones.
- **"Not transient over minutes" is not "permanent."** That is the whole reason
  this prompt exists.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner — including the date it was last retried, even if nothing
   changed.
2. **RENAME THIS FOLDER** to match the new status — `boschrexroth [NEW-STATUS]`
   — that is how the founder reads readiness from the directory listing.
   `BLOCKED-UPSTREAM` stands if it still 500s; `PROBED-FAILED` or `DONE-*` if it
   answers and you measured it; `IN-PROGRESS` if you stopped mid-plan.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second). The `e4-headless-locators [*]/` row lists this source as
   cleared-but-unbuilt; correct it too.
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
