# The deployed location views — locations and provenance, on two subdomains

> **STATUS (2026-08-07, latest):** **Client-facing again.** AMENDMENT 2 (below)
> reverses AMENDMENT 1's founder-only reversal of the same day. The original
> premise at the top of this file is broadly back in force — two client
> projects, no Vercel-seat assumption, a server-enforced column whitelist —
> with three deliberate differences from it, all recorded in AMENDMENT 2:
> `dfs`-only rows stay, the two deployments collapse into one with an in-app
> project switcher, and the door is per-person logins rather than a shared
> password. Nothing here touches a send path. Nothing here changes the local
> dashboard. Smartlead stays out, as it has through every revision.

---

## AMENDMENT 2 (2026-08-07 — supersedes AMENDMENT 1 of the same date)

The founder reversed the audience back:

> *"we are doing this dashboard for my client, not just me for now on vercel,
> so the info about it being sendable and other staff - let's remove it. They
> just need to have info about location + where did we got and verify this
> info from so we can understand what brands and categories they send"*

AMENDMENT 1 closed all four gates on the sentence *"forget about the client,
this is just for me."* That sentence no longer holds, so those four closures do
not either. **AMENDMENT 1 and the original body below both stay intact and
readable**; where this amendment and AMENDMENT 1 disagree, **this one wins.**

| Gate | AMENDMENT 1 position | Resolution — AMENDMENT 2 |
|---|---|---|
| **C-G1** · data licensing | DISSOLVED — no redistribution occurs in a private internal tool. `dfs`-only rows and Apollo fields both included. | **RE-OPENED, and answered.** A client login is exactly the trigger AMENDMENT 1 named. **`dfs`-only rows STAY — founder decision, 2026-08-07, risk explicitly accepted** (measured: `dfs`-alone is 1,216 of 2,773 seated rows, ~44%; excluding them would roughly halve the client's view). **Apollo and every person-level field are OUT**, which the founder's own "remove the sendable info" instruction requires independently of licensing. The two rules agree, so no tension survives. |
| **C-G2** · per-project slice | Both projects are organizational lenses over the full pool, not security slices. | **UNCHANGED in substance, changed in mechanism.** Field Advisor and Hosebox remain lenses over the same pool. They are now selected by an **in-app project switcher**, not by a per-deployment env pin. |
| **C-G3** · deployments and doors | Two Vercel projects on two env-pinned subdomains; two-wall door — Vercel Authentication ON plus the house password. | **REPLACED. One deployment, one URL, an in-app project switcher, and per-person logins.** Vercel Authentication goes back **OFF**: the original body's reasoning returns verbatim — clients hold no Vercel seat, so an outer wall they cannot pass is not a wall, it is a closed door. The shared house password is replaced by named accounts, which is the only way to revoke one viewer without disturbing the others, or to answer "who exported that." |
| **C-G4** · labels | Named provenance ships; the three location counters ship; **companies / people / sendable counters RETURN**. | **Named provenance and the three location counters — Locations shown · Brands covered · States covered — still ship, unchanged.** The **companies / people / sendable counters are OUT again**, along with the show-all toggle. They were readmitted only because nothing was hidden from a founder-only tool. |

### What that changes, in one paragraph

The 14-column whitelist goes back to being a **security control enforced on the
server**, not a view default, and the **"show all columns" toggle is deleted
rather than hidden** — a toggle that reveals campaign and Apollo fields is a
client data leak one click deep. The row-inclusion predicate stays gone (C-G1
answered in favour of inclusion). The `raw` per-row panel is **removed from the
client surface entirely**: it is the show-all toggle by another name. The two
subdomains become one deployment whose project switcher is a filter, and the
door becomes named accounts.

### What is unchanged, and still wanted

Every sheet feature survives both reversals: **source/brand multi-select, state
filter, derived US/Non-US country filter, core-category range, name search,
per-row source chips, the provenance expander with named provenance, and CSV
export of the filtered view capped at 10,000 rows.** Multi-list membership is
already handled by the domain-level dedupe with pool chips (`00-README.md`
§1.3) — a location found in three source lists shows three chips and counts
once. The export now carries **only whitelist columns**; AMENDMENT 1's "any
visible column, Apollo included" is void.

### Smartlead

**Unchanged, for the third time.** Out of every deployed surface. The exclusion
is key-security, never audience (`01` decision row 4), so no audience reversal
in either direction touches it.

### The guardrail that replaces AMENDMENT 1's internal-only guardrail

> **This tool is now client-facing by intent, and `dfs`-sourced rows reach it
> by an accepted-risk decision rather than by a licensing clearance. If
> DataForSEO's terms are ever enforced against redistribution, the remedy is
> the original C-G1 predicate — exclude `dfs`-only rows — which is a filter,
> not a rebuild. Keep it implementable: never let `source` stop being queryable
> per-token on the server.**

### Consequences for the implementation plan

`docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` was written
against AMENDMENT 1. Most of it survives; these parts do not.

| Plan task | Status under AMENDMENT 2 |
|---|---|
| **1, 2** Supabase schema + sync | **Stands.** The database keeps every column; the client tier never selects the excluded ones. Enforcement belongs on the server, not in the sync. |
| **3, 4** Scaffold + data layer | **Stands.** |
| **5** Auth gate | **RE-PLAN.** Password + HMAC session is replaced by per-person accounts (Supabase is already a dependency after Task 1). Needs invite/provision, revoke, and an export audit trail. `rate-limit.mjs` survives; `verifyPassword` / `signSession` do not. **The largest new build item.** |
| **6** Locations sheet | **AMEND.** Delete the show-all toggle and the `raw` panel. The 14-column whitelist is enforced server-side and is no longer a mere default. Add the project switcher. |
| **7** CSV export | **Stands, narrowed.** Cap 10,000 unchanged; column set bounded by the whitelist. |
| **8** Sources / Pools / Projects tabs | **AMEND.** Pools is founder vocabulary and internal detail — **out of the client surface.** Projects becomes the switcher. Sources stays: it is the provenance story the client is here for. |
| **9** Deployment | **RE-PLAN.** Three Vercel projects → **one**. Two DNS records → **one**. `DASHBOARD_PROJECT` stops being an env pin and becomes UI state. Deployment Protection **OFF**. Three password pairs → one account list. |
| **10** Close the pack | **Stands.** |

**[default] — the internal `ss-contacts` deployment is dropped from scope.**
The founder already has the loopback operator dashboard, and running an
internal all-columns deployment beside a client-facing one on a single codebase
is precisely how a whitelist leak ships. Say so and it comes back, behind its
own login role.

Founder tasks that remain are collected at the bottom of this file under
**"Remaining founder tasks."** AMENDMENT 2 changes them: no second DNS record
and no three password pairs; instead one domain and the initial account list.

---

## AMENDMENT 1 (2026-08-07 — superseded by AMENDMENT 2 above)

The founder reversed the audience:

> *"forget about the client, this is just for me, so we are showing all data
> that is there including apollo."*

All four gates close on that one answer. **The original body below is kept
intact.** Every superseded decision is still readable in place, with an
**AMENDED 2026-08-07** block directly under it. Nothing was silently rewritten.

| Gate | Original position | Resolution — 2026-08-07 |
|---|---|---|
| **C-G1** · data licensing | A client deployment returns only rows carrying a source from the defensible set; `dfs`-only rows excluded; all Apollo/person fields removed on every row. | **DISSOLVED.** No third-party redistribution occurs in a private internal tool, so the licensing question does not arise. **`dfs`-only rows INCLUDED. Apollo-derived fields INCLUDED wherever they exist.** |
| **C-G2** · per-project slice | Two security slices, one per client; neither client can tell the other exists. | **Both projects start as views over the FULL pool.** With licensing dissolved, "defensible set" no longer constrains anything. Field Advisor and Hosebox are **organizational lenses** — their own filters and status overlays, later — **not security slices.** |
| **C-G3** · deployments and doors | Two Vercel projects, password-only door, Deployment Protection explicitly **off** because clients hold no Vercel seat. | **Subdomains on `salesolution.net`:** `fieldadvisor.salesolution.net` + `hosebox.salesolution.net`, two Vercel projects from the same app directory, each env-pinned to open on its project view. **The two-wall door from `01` is RESTORED — Vercel team authentication ON plus the house password gate.** The password-only weakening existed solely because clients could not pass team auth; that rationale is void. |
| **C-G4** · labels | Two wordings to approve. | **APPROVED.** Named provenance (*"Verified from the Enerpac distributor locator, Aug 2026"*) ships as proposed, and the three location counters ship as **Locations shown · Brands covered · States covered**, each labeled with what it counts, with the row-level caveat in the header. The Everything tab's internal counters — **companies / people / sendable — RETURN**, since nothing is hidden anymore. |

### What that changes, in one paragraph

The column whitelist stops being a security control and becomes a **view
default**: the locations sheet still opens on the same 14 location-focused
columns because that is what makes it readable, and a **"show all columns"
toggle** exposes everything else — campaign fields, Apollo fields, and a `raw`
details panel. The row-inclusion predicate goes away entirely. The door gets
its second wall back. The two project views become saved lenses over the same
full pool, pinned per deployment so each subdomain opens where you expect.

### What is unchanged, and still wanted

Every feature in the sheet survives the reversal: source/brand multi-select,
state filter, derived US/Non-US, category filter, name search, per-row source
chips, the provenance expander with named provenance, and CSV export of the
filtered view with the **cap still at 10,000 rows**. The export may now include
any visible column, Apollo fields included.

### The one guardrail that replaces the licensing section

> **This tool is internal. The moment an export or a login is handed to a client
> or any third party, the dissolved C-G1 licensing question un-dissolves — `dfs`
> redistribution and Apollo's no-sharing terms apply to what leaves this tool,
> not just to what it renders. Re-open 02's original C-G1 before sharing
> anything.**

### Smartlead

**Unchanged.** Smartlead stays out of every deployed surface. That exclusion was
never about audience — it is key-security (`01` decision row 4: no Smartlead
code imported into this app, no campaign reachable even in principle), and the
audience reversal does not touch it.

Founder tasks that remain are collected at the bottom of this file under
**"Remaining founder tasks."**

---

*Everything below this line is the original 2026-08-07 spec, kept as written.
Where the amendment overrides it, an **AMENDED 2026-08-07** block sits directly
under the original text.*

---

## The original premise

The deployed dashboard was built for one reader — Artur, looking at his own
asset. It is now going in front of **two clients on two separate projects,
Field Advisor and Hosebox**, and that changes what it is allowed to contain.

A client is not a smaller version of the operator. The operator wants to know
who is sendable; the client wants to know **where a location is, what brands
and categories it sells, and how we know**. Everything that made the internal
view useful — tiers, cohorts, rank scores, dispositions, verification state,
named people — is either commercially private, someone else's data, or a
liability if it leaves the building. It comes out. Not hidden. Not collapsed
behind a toggle. Out, at the query layer, so that no UI change and no crafted
URL can bring it back.

What is left is a good product on its own: a filterable locations sheet with
honest provenance behind every row.

> **AMENDED 2026-08-07 — the premise is reversed.** There is no client. The
> reader is Artur, on his own asset, on two subdomains he owns. Nothing "leaves
> the building," so nothing comes out at the query layer. The filterable
> locations sheet with honest provenance survives as the *product* — it is
> genuinely the better way to read this data — but it is now a **default view
> over the full pool**, not a redacted one.

---

## What changes from `01`, and what does not

| | `01` — internal (`ss-contacts`) | This file — client (`ss-locations-*`) |
|---|---|---|
| Door | Vercel Authentication **+** house password | **House password only.** Clients cannot pass Vercel team auth. |
| Rows | Everything, all 12 files | Only the project's slice, only defensible sources (C-G1) |
| Columns | All ~56 plus the `raw` JSONB | A **whitelist of 14**, enforced server-side |
| Tabs | Everything · Sources · Pools · Projects | **One sheet.** No Sources board, no Pools, no Projects admin. |
| Counters | companies / people / sendable | locations / brands / states (C-G4) |
| Export | **None — deliberately not written** | **CSV of the current filter**, capped and logged |
| Deployments | one | two, one per client project |

> **AMENDED 2026-08-07 — five of those seven rows flip back to `01`.**
>
> | | `01` — internal (`ss-contacts`) | This file — the two location views |
> |---|---|---|
> | Door | Vercel Authentication **+** house password | **Same. Both walls.** (C-G3 restored) |
> | Rows | Everything, all 12 files | **Everything, all 12 files.** `dfs`-only included. (C-G1 dissolved) |
> | Columns | All ~56 plus the `raw` JSONB | **All ~56 plus `raw`**, with 14 shown by default and a show-all toggle |
> | Tabs | Everything · Sources · Pools · Projects | **Same four, plus the locations sheet**, opening on the pinned project view |
> | Counters | companies / people / sendable | **Both** — those three on Everything, locations / brands / states on the location and project views |
> | Export | None — deliberately not written | **CSV of the current filter**, cap 10,000, any visible column |
> | Deployments | one | **three: `ss-contacts` + two subdomains** |

Unchanged and inherited verbatim from `01`: the Supabase schema and migrations,
RLS deny-all with zero policies plus revoked grants, service-role-only access
from the server, no `NEXT_PUBLIC_SUPABASE_*` variable anywhere, the sync
script, full-replace-per-generation with the conservation check, the
paused-project message, and the house password gate's shape (layout gate + login
POST route, not middleware).

**One app directory serves all three deployments.** `apps/contacts-dashboard/`
is built once and pinned by environment. Forking the app per client would give
us three codebases and a coin flip about which one has the whitelist in it.

> **AMENDED 2026-08-07 — still one app directory,** for the same reason minus
> the whitelist: three codebases would be three answers to "which one is
> current." The inherited-from-`01` list above is unchanged in full.

---

## Decisions — locked 2026-08-07, do not reopen

| Question | Answer |
|---|---|
| One app or three | **One.** `apps/contacts-dashboard/`, env-pinned per deployment. |
| Client door | **Password only.** Vercel Deployment Protection is **off** on the two client projects — a client has no Vercel team seat and cannot get past it. |
| What replaces the second wall | **Nothing at the door.** The slice predicate and the column whitelist are the security controls instead, and they run server-side on every query. |
| Data copies | **None.** All three deployments read the same Supabase tables. No per-client database, no per-client export dropped in a folder. |
| Export | **Exists in client mode**, capped at 10,000 rows, server-generated, whitelist-only, logged. Still does not exist in internal mode. |

If a task below appears to need one of these reversed, the task is wrong.

> **AMENDED 2026-08-07 — three of these five are reversed by the founder, not by
> a task.** Row by row:
>
> - *One app or three* — **stands.** One app directory, env-pinned per
>   deployment.
> - *Client door* — **REVERSED.** Both walls on all three deployments: Vercel
>   Authentication **ON** plus the house password gate. There is no client.
> - *What replaces the second wall* — **VOID.** The second wall is back, so
>   nothing has to replace it. The slice predicate is gone; the column list is a
>   view default.
> - *Data copies* — **stands, and matters more.** Three deployments, one set of
>   Supabase tables, no copies.
> - *Export* — **amended.** Export exists on all three deployments, capped at
>   10,000 rows, server-generated, logged, and may carry **any visible column**
>   including Apollo fields.
>
> "If a task appears to need one of these reversed, the task is wrong" still
> holds — for the amended set above, not the original one.

---

## Prerequisite reading, in order

1. **`01-vercel-transfer.md` in full.** This file is an amendment, not a
   replacement. The Supabase schema (T1.2), the sync (T2), the app scaffold
   (T3.1–T3.2) and the gate shape (T4.1–T4.3) are all still the build.
2. `dashboard/00-README.md` Phase 2.1 — the **sole-source count** logic. C-G1's
   measurable consequence is that computation, run per project slice.
3. `dashboard/00-README.md` Phase 3.4 — the per-company drill-down. The client
   provenance expander is that drill-down with everything internal removed.
4. `emails/handoff/industrial-contact-list/00-README.md` §"Source registry" —
   the 31 source rows. C-G1's allowlist is a subset of that table, and the
   brand display names come from it.
5. `emails/handoff/industrial-contact-list/00-README.md` §"Company vs. person
   vs. sendable" — read it for the discipline, not the numbers. Every counter
   in this build says what it counts, for the same reason.
6. **The real CSV header**, before writing the whitelist:
   `head -1 emails/lists/seated-v9.csv`. Four of the column names in the
   founder's brief do not exist under those names; the corrections are in the
   KEEP table below and they are load-bearing.
7. The house password gate, all four files (listed in `01` §Prerequisite
   reading item 6). In client mode it is the **only** wall, so read it as a
   security control rather than a convenience.

> **AMENDED 2026-08-07.** Items 1, 3, 5 and 6 stand exactly as written — the
> column-name corrections in item 6 are the most load-bearing thing in this
> file and survive the reversal untouched, because they are facts about the
> data, not about the audience. Item 2 (sole-source count) is no longer
> required as a licensing consequence, but keep reading it: the per-slice
> sole-source number is still the most interesting thing the sync prints.
> Item 4 stands for the **brand display names**; there is no allowlist subset
> any more. Item 7: the password gate is the **second** wall, not the only one,
> so read it as `01` does.

---

## The audience shift

### KEEP — the client-visible column whitelist

> **AMENDED 2026-08-07 — DEMOTED from security control to view default.**
> This table is no longer a whitelist. It is the **default column set of the
> locations sheet**: the 14 location-focused columns the sheet opens on, chosen
> for readability, with a **"show all columns" toggle** next to them that
> exposes everything else — campaign fields, Apollo/person fields, and a `raw`
> details panel per row. Nothing is withheld; the default is just the view that
> answers "where is this location and how do we know."
> **Everything below this block stays correct and stays required** — the four
> corrected column names, the nullable `domain`, the derived country, and the
> `location_count` caveat are facts about the data, not audience policy.

Confirmed against `emails/lists/seated-v9.csv` and the current pools
(`pool-non-us-v9`, `pool-chains-v11`, `pool-small-shops-v9`,
`pool-identity-backlog-v1`). **Four names in the brief do not exist in the
data** and are corrected here. Use these exact names.

| Client column | Real column | Notes |
|---|---|---|
| Company | `company_display`, fallback `company` | Both exist. `company_display` is the human form; `company` is the normalized key. Render display, keep `company` for sort stability. |
| Address | `address_1` | Single line. There is no `address_2`. |
| City | `city` | |
| State | `state` | Also the state filter and the "states covered" counter. |
| ZIP | **`zip5`** | ⚠ **not `zip`.** No column named `zip` exists anywhere. |
| Country | **derived — no column exists** | ⚠ See the note below. This is the one place the brief outruns the data. |
| Phone | **`phone_e164`** | ⚠ **not `phone`.** E.164 format; render it formatted, store it as-is. |
| Website | **`domain`** | ⚠ **not `website`.** Apex, lowercased, no `www.`. **Nullable** — 9,006 rows carry no domain and must render as blank, not as a broken link. |
| Category | `category_core` | ⚠ **`category_display` does not exist.** Build a token → label map in C1 (same pattern as the brand map) rather than inventing a column. |
| Brands authorized | `brand_authorized` | Part of the "what brands they sell" payload. |
| Line card | `line_card` | The other half of it. Sparse — many sources publish no line card at all. |
| Sources | `source` | The pipe chain. **Never rendered raw.** Split on `\|`, filter to the C-G1 allowlist, render display names. |
| Source URL | `source_url` | The recorded page. Rendered as a link in the provenance expander. |
| Captured | `captured` | ISO date. "Verified from X, Aug 2026" reads off this. |
| Locations | `location_count` | ⚠ This is the company's **own claim** about how many locations it has. It is not a count of rows we hold. Label it as the company's figure; do not add it up into a total. |

> **AMENDED 2026-08-07 — two rows in that table read differently now.**
> *Sources:* still split on `\|` and still rendered as display names rather than
> raw tokens — that is legibility, not leak prevention — but the filter to the
> allowlist is gone. Every token renders, `dfs` included; a token with no
> display name falls back to the raw token instead of being dropped.
> *Country:* unchanged, still derived — see the note immediately below, which
> is a data fact and survives in full.

**Country, honestly.** There is no `country` column in the seated list or in
any pool, including `pool-non-us`. The only country signal we hold is **pool
membership**: rows in the non-us pool are not in the United States, everything
else is. So the country filter ships as **two values — "United States" and
"Non-US"** — derived server-side from the pool, and `pool` itself is never
selected, never returned, and never rendered. Do not fabricate a country from
`state` or from the address; a non-US row's `state` holds a province or region
code with no country attached. If a client needs real country values, that is a
data task in the pipeline, not a display task here — say so rather than
guessing.

> **AMENDED 2026-08-07.** The derivation stands and the filter stands — it is in
> the "unchanged, still wanted" list. `pool` is no longer suppressed: it is a
> real column, it shows under the show-all toggle, and it is useful. The
> "do not fabricate a country" rule is unchanged and permanent.

Two more columns exist and are **not** whitelisted, on purpose: `lat` and
`lng`. They are clean and would make a map, but a map is not in this build, and
the whitelist is an allowlist. If a map gets scoped later, they get added to
the constant explicitly, with sign-off.

`tier_raw` and `distributor_type` are a judgment call worth surfacing: unlike
`tier`, they are **published by the manufacturer's locator** (authorization
tier, dealer type) rather than scored by us, so they arguably belong in the
brands payload. They ship **hidden** under the default-hidden guardrail. Raise
them under C-G4 if the client asks what "authorized" means.

> **AMENDED 2026-08-07.** `lat` / `lng` and `tier_raw` / `distributor_type` are
> all reachable under the show-all toggle. They are simply **not in the default
> 14** — a display choice with no sign-off attached. A map remains out of scope
> for this build; that is a scope decision, not a data one.

### REMOVE — from every client surface, including exports and API responses

> **AMENDED 2026-08-07 — this entire section is VOID as a removal rule.**
> Nothing is removed. Every column below is present in the data, reachable
> under the show-all toggle, and exportable. The table survives as a useful
> **inventory of what is off the default view** — it is the most complete list
> of the non-location columns anyone has written down — and as the definition
> of what "show all columns" reveals. Read it that way.

Enforced by a **server-side column whitelist**, not by UI hiding. A column that
is absent from the whitelist constant is absent from the `select`, so it is
absent from the page, absent from the export, absent from the JSON, and absent
from view-source.

| Class | Columns |
|---|---|
| Email + verification | `email`, `email_source`, and the entire `verify_results` table — never joined in client mode. `01`'s `contacts.email_state` and `has_person` columns are removed from the client select too. |
| Person data (Apollo / Adaptall derived) | `contact_first_name`, `contact_last_name`, `contact_title`, `contact_email`, `contact_email_status`, `contact_linkedin`, `contact_source` |
| Our scoring | `tier`, `tier_raw`, `segment`, `segment_scores`, `cohort`, `icp_class`, `icp_uncertain`, `rank_score`, `rank_components`, `shortlist` |
| Size proxies | `size_band`, `size_score`, `sku_estimate`, `brand_count`, `review_count` |
| Routing / campaign internals | `disposition`, `pool`, `list_generation`, `dup_of`, `ecommerce_class`, `vertical_axis`, `category_contam`, `distributor_type`, `evidence_depth` |
| Self-declaration internals | `self_declaration`, `self_declaration_verbatim`, `self_declaration_url` |
| Identity resolution | `needs_identity_resolution`, `identity_status`, `identity_found` |
| Geo (unscoped) | `lat`, `lng` |

**Three traps, in order of how easy they are to walk into:**

1. **`contacts.raw` is the whole row.** `01`'s T1.2 stores every CSV column as
   JSONB precisely so schema drift lands somewhere. A client query that selects
   `raw` — or a drill-down that renders `raw` because the internal one did —
   re-exposes **every column in the REMOVE table at once**, including the
   person data. `raw` is never in a client select. Not "filtered after
   fetching." Not selected. Put it first in the acceptance test.
2. **The row `id` leaks.** `01`'s primary key is
   `'<list_generation>:<pool>:<row_index>'`, so a single row id tells a client
   the generation name and the pool a company was routed to —
   `seated-v9:non-us:412`. In client mode the API returns an **opaque row key**
   (a stable hash of the id, or a dedicated public id column), never the
   composite. React keys, URLs and the export all use the opaque one.
3. **Unmapped source tokens.** Chips render display names. A token with no
   display name has nothing to render, and both available fallbacks are wrong:
   dropping it silently makes "found in N lists" a lie, and printing the raw
   token leaks internal vocabulary. The fix is structural — see C1.1, where the
   allowlist and the display map are the same constant.

> **AMENDED 2026-08-07 — all three traps are NO LONGER REQUIRED for security.**
> There is no third party to leak to.
>
> 1. **`raw`** is not an anti-leak problem; it is a **feature**. It ships as the
>    per-row details panel under the show-all toggle — the fastest way to see a
>    column the schema drifted into before anyone has mapped it.
> 2. **Composite row ids** are fine as-is. `seated-v9:non-us:412` tells the
>    reader the generation and the pool, and the reader is the person who named
>    them. No opaque key, no hash.
> 3. **Unmapped source tokens** stop being a leak and become a display gap. The
>    fallback is now the obvious one: render the raw token. The display map is
>    still worth having for the named-provenance line (C-G4), but a missing
>    entry degrades to a token instead of forcing a choice between lying and
>    leaking.
>
> The **constants remain useful** — not as enforcement, but as the definition of
> the default view. Keep `CLIENT_COLUMNS` (renamed to something honest, e.g.
> `LOCATION_COLUMNS`) as the 14 the sheet opens on, and keep the source display
> map as the provenance name source.

### ADD

**Per-row sources display.** A chip per allowed source token, showing the brand
or locator display name, plus a count: *"found in 3 of the lists we show you."*
The qualifier is not padding. N counts **allowed** tokens only, and a row can
carry tokens the client never sees (a `dfs` co-sighting on a row that also has
`timken`). "Found in 3 lists" would be false; the qualified phrasing is true.

**Per-row provenance expander.** Click a row, get one block per allowed source
token:

```
Enerpac distributor locator        enerpac.com/…/dealer-locator    captured 2026-08-01
Timken authorized distributors     timken.com/…/distributor-search  captured 2026-08-01
```

Each line: display name · the recorded `source_url` as a link · the `captured`
date. Provenance is 100% filled on every current file, so a blank cell here is
a bug and renders as one — an explicit "provenance missing" marker, never an
empty row that reads as "no source."

**Stretch, optional, explicitly not in v1:** assemble per-token evidence URLs
from `emails/data/raw/` where recoverable. That directory holds 104 flat
artifacts named `{token}-{date}.{csv|json}` — `enerpac-2026-08-01.json`,
`timken-2026-08-01.csv` — so a token+date pair can often be traced to the exact
payload a row came from. It is a genuinely better provenance story and it is
also a file-system read path in a client-facing app, which is a new attack
surface for a nice-to-have. **v1 ships with the stored `source` / `source_url` /
`captured` columns only.** If this is picked up later it goes through the FS
containment rule in `00-README.md` guardrail 6, which currently says *never*
`emails/data/raw/`.

> **AMENDED 2026-08-07 — both ADDs ship, and both get simpler.**
> Chips render **every** token, `dfs` included, so the count is honest without
> the qualifier: *"found in 3 lists"* is now true and *"3 of the lists we show
> you"* is the wording to drop. The provenance expander is unchanged, including
> the explicit missing-provenance marker.
> The `emails/data/raw/` stretch is **still out of v1**, but the reason has
> narrowed: it is no longer a client-facing attack surface, it is just an
> unbuilt FS read path that `00-README.md` guardrail 6 still forbids. Same
> answer, smaller argument.

---

## Gates — all four are GATE:HUMAN

> **AMENDED 2026-08-07 — all four gates are RESOLVED.** C-G1 is dissolved;
> C-G2, C-G3 and C-G4 are answered. Nothing in this build is gated on a founder
> decision any more; what remains is founder *work*, collected at the bottom of
> this file. The original gate text is kept below so the reasoning stays
> readable.

### C-G1 · DATA-LICENSING GATE — which rows a client may see at all

> **AMENDED 2026-08-07 — DISSOLVED.**
> **Reason:** the audience is Artur alone. **No third-party redistribution
> occurs in a private internal tool**, so the licensing question this gate
> exists to answer does not arise. There is no inclusion rule, no allowlist, no
> exclusion count, and no defensible-set predicate to write.
> **Consequences:** `dfs`-only rows are **INCLUDED**. Apollo-derived fields are
> **INCLUDED** wherever they exist. `usaspending`, `adaptall`, `bobcat`,
> `caseih` and `kubota` rows are all in, because the question they were parked
> on no longer exists.
> **The single line that replaces this whole section:**
>
> > **This tool is internal. The moment an export or a login is handed to a
> > client or any third party, the dissolved C-G1 licensing question
> > un-dissolves — `dfs` redistribution and Apollo's no-sharing terms apply to
> > what leaves this tool, not just to what it renders. Re-open 02's original
> > C-G1 before sharing anything.**
>
> The original gate text follows, unedited. It is the argument to re-read on
> the day someone asks for a login.

**This is the one that matters. It blocks all of C1.**

Not every row in this asset is ours to show a third party. The list was
assembled from sources with different terms, and putting a row on a client's
screen is redistribution, not internal use.

**Recommendation: a client deployment returns only rows carrying at least one
source in the defensible set.**

| Kind | Tokens |
|---|---|
| Manufacturer dealer/distributor locators | `enerpac` `timken` `nord` `ntn` `spxflow` `yaskawa` `dorner` `lovejoy` `ballymore` `quincy` `kennametal` `banjo` `gast` `atlascopco` `interroll` `flexlink` `mknorthamerica` |
| E4 + later locator builds | `waltersurface` `sullair` `festo` `continental` `skf` `pepperlfuchs` `indsci` `banner` `lincolnelectric` `boschrexroth` `cmco` `samsonrope` `ocenco` |
| Self-identification + trade bodies | `serp` (a company's own public site) · `ad` · `ptda` |

All of it is public business information harvested from public pages, with a
recorded `source_url` and `captured` date for every row. That provenance is
what makes it defensible — we can show, per row, where it came from.

**EXCLUDE:**

- **`dfs`-only rows.** DataForSEO business listings are Google Business Profile
  data. Redistribution to third parties is restricted, and putting it inside a
  product a client logs into is exactly the "productizing" line our own
  compliance rules draw. A row whose **only** source token is `dfs` does not
  appear in a client deployment. A row that carries `timken|dfs` **does**
  appear — it qualifies on `timken`, and `dfs` is neither rendered nor counted.
- **All Apollo-derived fields and all person data, on every row, regardless of
  source.** Apollo's terms bar sharing extracts with third parties. This is
  already handled by the column whitelist; it is restated here because it is a
  licensing rule, not a privacy preference, and someone will eventually ask to
  "just add the contact name."

**The allowlist is closed.** A token not named above is excluded, including
tokens that arrive later. Two that are deliberately left out and worth a
decision rather than a default:

- `usaspending` — US federal spending records, public domain, arguably the most
  redistributable data in the pack. Currently 0 seated. Out unless Artur says
  otherwise.
- `adaptall` — `RETIRED-TO-LOOKUPS`; the dossier records that the bulk route
  was declined **on identity exposure**. Out, and it should stay out.
- `bobcat` / `caseih` / `kubota` — genuine manufacturer dealer locators, so
  they pass the licensing test, but they are 75–100% ag/turf and were seated as
  an isolated cohort under ICP-EQ-2. Whether a client sees them is a **product**
  question, so it belongs to C-G2, not here.

**The measurable consequence, which the sync must print.** The `dfs`-only rule
removes rows, and nobody should discover how many when a client asks why the
sheet looks thin. `dfs` is the largest single token in the asset (74,578 raw /
2,437 seated), so the loss will not be small.

Per project slice, the sync computes and prints:

```
field-advisor   slice 12,410   dfs-only excluded 4,882 (28.2%)   shown 12,410
hosebox         slice  6,203   dfs-only excluded 2,109 (25.4%)   shown  6,203
```

This is the **sole-source computation already specified** in `00-README.md`
Phase 2.1 ("unique domains contributed, and how many of those it contributed
alone") and carried into `01` T3.4. Reuse it, scoped to the project's slice
instead of the whole asset. Do not write a second one.

**Artur signs the inclusion rule per project. Default if unanswered: the
defensible set above, `dfs`-only excluded, for both projects.**

> **AMENDED 2026-08-07.** Nothing is excluded, so there is no exclusion count to
> print. The sole-source computation from `00-README.md` Phase 2.1 still runs
> where it always ran — on the Sources tab, over the whole asset — and is worth
> having per project view later as an *interest* number, not a compliance one.

### C-G2 · Per-project slice — Field Advisor and Hosebox are separate

> **AMENDED 2026-08-07 — ANSWERED: both projects start as views over the FULL
> pool.** With licensing dissolved, "defensible set" no longer constrains
> anything, so there is nothing left for a slice predicate to enforce.
> Field Advisor and Hosebox are **organizational lenses** — each gets its own
> filters and status overlays when there is a reason for them — **not security
> slices.** The `projects` table row shape from `01` T1.5 still ships, and the
> validation rules below still matter, but the failure they guard against
> downgrades: a filter that quietly does nothing now shows the wrong default
> view, not one client another client's data. The four questions at the end of
> this section move to the founder-tasks list as an **optional, later** item.

Two projects, two slices, two passwords, two URLs. Neither client should be
able to tell the other exists.

The `projects` table from `01` T1.5 gets **one row each**, using the same
`criteria` shape — `base`, `filters[]`, `columns[]`, `counts`, optional `note`.
Do not redesign it, and inherit its validation rules unchanged: an unknown
`field` skips the filter and warns; an unknown `op` renders the whole project
**misconfigured** and matches nothing. In internal mode a filter that quietly
does nothing ships a campaign to 12,000 companies it never meant to touch. In
client mode it shows one client another client's slice, which is worse.

**Placeholder until Artur defines them:** both projects = the full C-G1
defensible set, no additional filters. Ship the row shape, not a guess at the
business logic.

```jsonc
// projects.criteria — 'field-advisor'
{
  "name": "Field Advisor",
  "description": "<what this client is buying the list for>",
  "base": "everything",
  "filters": [],              // ← C-G2: Artur's answer goes here
  "columns": "CLIENT_COLUMNS", // the shared constant, never a hand-written list
  "counts": "locations",
  "note": null
}
```

> **AMENDED 2026-08-07 — the shipped shape.** `base` is the full pool,
> `filters` is empty and stays empty until there is a reason, and `columns`
> points at the default-view constant rather than a whitelist:
>
> ```jsonc
> // projects.criteria — 'field-advisor'
> {
>   "name": "Field Advisor",
>   "description": "<what this view is for>",
>   "base": "everything",          // the FULL pool — no licensing predicate
>   "filters": [],                 // optional, later: a Field Advisor lens
>   "columns": "LOCATION_COLUMNS", // the DEFAULT view, not a whitelist
>   "counts": "locations",
>   "note": null
> }
> ```
>
> `hosebox` is the same row with its own name. Both are honest as shipped —
> the empty `filters` array is the current answer, not a placeholder for a
> missing one.

**Ask him, and record the answers as filter rows:**

1. Does **Hosebox** get a segment slice — the fluid-power / hose ecosystem
   (`category_core`, `segment`, or a named token set)? Which?
2. Does **Field Advisor** get a different one, and on what field?
3. Do the equipment-dealer tokens (`bobcat`, `kubota`, `caseih`) belong in
   either slice? They are ag/turf, not industrial MRO.
4. May the two slices **overlap**, or must a location appear in at most one?
   Overlap is fine technically and is the default; it is a commercial question.

`columns[]` stays pointed at the shared constant in v1. Per-project columns are
a supported future move — the whitelist becomes *constant ∩ project columns* —
but the intersection direction only ever narrows. A project can never add a
column back.

> **AMENDED 2026-08-07.** Questions 1–3 become the optional "define per-project
> filter presets" task at the bottom — worth doing when the two views need to
> differ, not before. Question 4 is **moot**: overlap is fine and expected;
> there is no commercial reason left to forbid it. The
> intersection-only-narrows rule on `columns[]` is **dropped** — with the
> show-all toggle, any view can reach any column, so a project preset is a
> starting view, not a ceiling.

### C-G3 · Deployments and doors

> **AMENDED 2026-08-07 — ANSWERED: subdomains on `salesolution.net`, both walls
> on all three.** `fieldadvisor.salesolution.net` and
> `hosebox.salesolution.net`, two Vercel projects built from the same app
> directory, each env-pinned to open on its project view. **The two-wall door
> from `01` is RESTORED: Vercel team authentication ON plus the house password
> gate**, on every deployment. The password-only weakening existed solely
> because a client could not pass team auth; with no client, that rationale is
> void.
>
> **The amended topology:**
>
> | Env var | `ss-contacts` | Field Advisor | Hosebox |
> |---|---|---|---|
> | Domain | existing Vercel URL | `fieldadvisor.salesolution.net` | `hosebox.salesolution.net` |
> | `DASHBOARD_MODE` | `internal` | `internal` | `internal` |
> | `DASHBOARD_PROJECT` | *(unset)* | `field-advisor` | `hosebox` |
> | `DASHBOARD_PASSWORD` | existing `CONTACTS_DASHBOARD_PASSWORD` | its own | its own, different |
> | `DASHBOARD_SESSION_SECRET` | existing | its own | its own |
> | Vercel project | `ss-contacts` | `ss-locations-fieldadvisor` | `ss-locations-hosebox` |
> | Root Directory | `apps/contacts-dashboard` | same | same |
> | Deployment Protection | **Vercel Authentication ON** | **Vercel Authentication ON** | **Vercel Authentication ON** |
>
> `DASHBOARD_MODE=client` no longer exists as a restricted surface — all three
> run the internal one. Keep the variable set to `internal` explicitly on all
> three rather than deleting it: an unset mode that defaults to "show
> everything" is the kind of implicit that bites later. `DASHBOARD_PROJECT`
> survives as **default-view routing** — it decides which view the deployment
> opens on, nothing more, and it is still read from `process.env` at module
> scope and never from a request.

**Topology.** One app directory, three deployments, pinned by environment:

| Env var | Internal | Field Advisor | Hosebox |
|---|---|---|---|
| `DASHBOARD_MODE` | `internal` | `client` | `client` |
| `DASHBOARD_PROJECT` | *(unset)* | `field-advisor` | `hosebox` |
| `DASHBOARD_PASSWORD` | existing `CONTACTS_DASHBOARD_PASSWORD` | its own | its own, different |
| `DASHBOARD_SESSION_SECRET` | existing | its own | its own |
| Vercel project | `ss-contacts` | `ss-locations-fieldadvisor` | `ss-locations-hosebox` |
| Root Directory | `apps/contacts-dashboard` | same | same |
| Deployment Protection | **Vercel Authentication ON** | **OFF / none** | **OFF / none** |

Both new projects import the **same repo** with the **same Root Directory**.
Nothing is forked.

**The door changes, and here is why.** `01` T4 puts Vercel Authentication in
front of everything: an unauthenticated request never reaches our code. That
wall is team-membership-based. **A client cannot pass it** — they have no
Vercel seat, and giving them one would give them the team. So the two client
projects run **the house password gate only**, and Deployment Protection must
be explicitly set to off/none on both. Leaving it on does not make the client
deployment safer; it makes it unreachable.

**State the trade honestly, because it is real:** the client deployments have
one wall where the internal one has two. That is precisely why the column
whitelist and the slice predicate are **security controls, not cosmetics**. If
a client password leaks, the blast radius is that client's slice of a locations
sheet with public-source provenance — not the asset, not the emails, not the
people, not the other client.

> **AMENDED 2026-08-07 — the trade is off the table.** Both walls, everywhere.
> The whitelist and the slice predicate do not have to carry the security load,
> because the door does. Which is the right way round.

**The query layer is what actually contains it.** Mode and project are read
from the server environment on every request and are **never** taken from a
query string, a header, a cookie, or a request body. A client deployment is
physically unable to query outside its slice or its column whitelist regardless
of any UI state or URL manipulation, because the predicate and the column list
are assembled server-side from `process.env` before the request's own
parameters are looked at.

The internal deployment — `ss-contacts`, both walls, all four tabs, all
columns, no export — is untouched and stays available.

**Artur creates both Vercel projects and picks both passwords.** Three
different values now: `SALES_PASSWORD`, the internal contacts password, and one
per client. Rotating a client's access must never touch the other two.

> **AMENDED 2026-08-07.** Env-only mode and project reading **stands** — it is
> good hygiene and costs nothing, even though it is no longer containing
> anything. `ss-contacts` stays available and **gains the export** it was
> denied. Three distinct passwords are still the rule, for rotation, not for
> isolation.

### C-G4 · Client-facing labels

> **AMENDED 2026-08-07 — APPROVED, both.** Named provenance ships exactly as
> proposed below, for every token including the ones that were previously
> excluded. The three counters ship as **Locations shown · Brands covered ·
> States covered** on the location and project views, each labeled with what it
> counts, and the row-level caveat goes in the header (the counter keeps the
> name *Locations shown*, with the caveat — not renamed to *Records shown*).
> **The Everything tab's internal counters — companies / people / sendable —
> RETURN**, unchanged from `01`, because nothing is hidden any more. Both sets
> coexist: three counters where you are reading locations, three where you are
> reading the asset.

Two things to approve, both short, both in front of a paying client.

**1 — How we describe provenance.** Proposed:

> Verified from the Enerpac distributor locator, Aug 2026

Pattern: *Verified from the {brand} {locator kind}, {Mon YYYY}*, reading the
display name off the brand map and the month off `captured`. For the
non-locator tokens:

| Token | Proposed wording |
|---|---|
| `serp` | Verified from the company's own website, Aug 2026 |
| `ptda` | Verified from the PTDA member directory, Aug 2026 |
| `ad` | Verified from the AD member directory, Aug 2026 |

"Verified" is a strong word and it should be. It means: we recorded the page,
the date, and the link, and the link is in the row. Ship it only if it is true
for every token in the map.

**2 — The three counters that replace companies / people / sendable.**
Proposed, and each one says what it counts:

| Counter | Counts |
|---|---|
| **Locations shown** | rows in the current filter |
| **Brands covered** | distinct allowed source tokens in the current filter |
| **States covered** | distinct non-empty `state` values in the current filter |

One caveat to settle rather than paper over: a row is **one address record**,
and rows were deduped by domain, so "locations shown" is the number of records
we hold — not necessarily the number of physical branches. The `location_count`
column is the company's own claim and is a different number. Either label the
counter **"Records shown"**, or keep "Locations shown" with the row-level
caveat in the header. Artur picks. Whichever he picks, it says what it counts —
the same rule that produced three counters instead of one hero number
internally applies here for the same reason.

> **AMENDED 2026-08-07.** Artur picked: **"Locations shown" with the row-level
> caveat in the header.** *Brands covered* now counts **distinct source
> tokens** in the current filter — drop "allowed," there is no allowlist. And
> the counters no longer *replace* companies / people / sendable; they sit
> alongside them, on a different view.

---

## Phase C1 — the query layer

Blocked on C-G1 and C-G2. Everything else in this build is downstream of
getting this right, and it is the phase where a mistake is invisible.

> **AMENDED 2026-08-07 — C1 is unblocked and lighter.** Both gates are
> resolved, so nothing blocks it. It loses **the slice-pinning-as-security work
> and the whitelist-enforcement work**; project pinning stays as **default-view
> routing**. Task by task:
>
> | Task | Status |
> |---|---|
> | **C1.1** constants module | **KEEP**, demoted. `CLIENT_COLUMNS` → `LOCATION_COLUMNS`, the 14 the sheet opens on. The source map stays as the provenance display map. It is no longer simultaneously an allowlist, so the "membership IS the allowlist" comment comes out. `CATEGORY_LABELS` stays — `category_display` still does not exist. |
> | **C1.2** mode + project pinning | **KEEP as routing.** `DASHBOARD_PROJECT` decides the opening view. Still env-only, still module scope. The hard-startup-failure rule is no longer a security requirement; keep it anyway — a deployment pinned to a project that does not exist should say so, not open somewhere random. |
> | **C1.3** C-G1 inclusion predicate | **DROP.** No allowlist, no `source_tokens && $1` filter. Project `filters` (currently empty) are the only `where` beyond the user's own. |
> | **C1.4** one query builder | **KEEP**, for the plain reason: one builder means the export and the page cannot disagree. The 400-on-unknown-column response becomes a **schema guard** (that column does not exist), not a whitelist rejection. Any real column may be requested. |
> | **C1.5** opaque row keys | **DROP.** Composite ids are fine; the reader named the generations and the pools. |
> | **C1.6** country derivation | **KEEP unchanged.** The derived US/Non-US filter is in the wanted set, and `pool` is now selectable too. |
> | **C1.7** no verify join in client mode | **DROP.** `verify_results` and `project_status` are read normally. Nothing is withheld. |
> | **NEW — show-all toggle** | The sheet opens on `LOCATION_COLUMNS` and a toggle switches to the full column set, with a per-row `raw` details panel. Client-side view state over a server response that already carries the data, or a second query — implementer's call; there is no security boundary between the two states. |

**C1.1 — One constant module, one source of truth.**
`apps/contacts-dashboard/lib/client-view.ts`. Everything the client can see is
declared here and nowhere else.

```ts
// The 14 client-visible columns. Nothing else is ever selected in client mode.
export const CLIENT_COLUMNS = [
  'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
  'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
  'source', 'source_url', 'captured', 'location_count',
] as const

// Membership IS the C-G1 allowlist. The value IS the client-facing name.
// A token absent from this map is neither shown nor counted, and cannot
// qualify a row for inclusion. One table, so the two can never drift.
export const CLIENT_SOURCES: Record<string, { display: string; kind: string }> = {
  enerpac: { display: 'Enerpac', kind: 'distributor locator' },
  timken:  { display: 'Timken',  kind: 'authorized distributor list' },
  // … the full C-G1 set
  // dfs is ABSENT. That absence is the licensing rule.
}
```

Making the allowlist and the display map the same object is the fix for trap 3
above. There is no state where a token is allowed but unnamed, so the "found in
N lists" count and the chips are computed from the same set and cannot
disagree.

Add `CATEGORY_LABELS: Record<string, string>` in the same module — the
client-facing labels over `category_core`, standing in for the
`category_display` column that does not exist.

> **AMENDED 2026-08-07 — same module, different job.** The 14 columns are the
> **default view**, not a ceiling; the source map is the **display map** for
> chips and the named-provenance line, and it carries every token including
> `dfs`. A token missing from the map renders as its raw token.

**C1.2 — Mode and project pinning.**
`apps/contacts-dashboard/lib/mode.ts` reads `DASHBOARD_MODE` and
`DASHBOARD_PROJECT` from `process.env` **once, at module scope**, and exports
them. `DASHBOARD_MODE=client` with no `DASHBOARD_PROJECT` is a **hard startup
failure**, not a fallback to "show everything" — a misconfigured env var must
never open the sheet. Nothing in the request may influence either value.

**C1.3 — The C-G1 inclusion rule as a SQL predicate.** Not a post-fetch filter.
`source_tokens` is already a `text[]` with a GIN index (`01` T1.2), so it is an
overlap test:

```sql
where source_tokens && $1::text[]      -- $1 = the C-G1 allowlist
```

A row qualifies on **any** allowed token. `dfs`-only rows carry no allowed
token and never enter the result set. Combine with the project's `criteria`
filters using `and`.

**C1.4 — One query builder, used by both the page and the export.** The page
queries and the export endpoint call the **same** function, which assembles the
`select` list from `CLIENT_COLUMNS` and the `where` from C1.3 plus the project
criteria. Two code paths is how the export ends up with a column the page does
not show. If a request names a column outside the whitelist, **reject with 400
and log it** — do not silently drop it. A request for a removed column is
either a bug or someone probing, and both deserve a line in the log.

**C1.5 — Opaque row keys.** Client responses carry a hashed or dedicated public
id, never `'<generation>:<pool>:<index>'` (trap 2).

**C1.6 — Country derivation.** Computed server-side from pool membership into a
two-value field. `pool` is used in the `where`, never in the `select`.

**C1.7 — No verify join, no projects join, in client mode.** `verify_results`
and `project_status` are not read. Guard it in the data layer, not by the
callers remembering.

### Acceptance

- [ ] `grep -n "raw" apps/contacts-dashboard/lib/client-view.ts` and the client
      query builder confirm `contacts.raw` is never selected in client mode.
- [ ] Every client `select` list is generated from `CLIENT_COLUMNS`; grep finds
      no hand-written column list in any client code path.
- [ ] With `DASHBOARD_MODE=client` and `DASHBOARD_PROJECT` unset, the app fails
      to start with a named error.
- [ ] A query with a `dfs`-only row's domain returns zero rows in client mode
      and one row in internal mode.
- [ ] The dfs-only exclusion count prints per project and is non-zero.

> **AMENDED 2026-08-07 — C1 acceptance.**
>
> - [ ] The sheet opens on the 14 `LOCATION_COLUMNS`; the show-all toggle
>       reveals the full column set and the per-row `raw` panel.
> - [ ] Page and export go through the same builder — grep finds no
>       hand-written `select('…')` in either path.
> - [ ] A deployment pinned to a `DASHBOARD_PROJECT` that has no `projects` row
>       fails to start with a named error.
> - [ ] A `dfs`-only row's domain returns **one row**, on every deployment.
> - [ ] A request for a column that does not exist returns 400; a request for
>       any real column succeeds.

---

## Phase C2 — the sheet

Blocked on C-G4 for its labels. One page. No tab bar.

> **AMENDED 2026-08-07 — unblocked, and the tab bar comes back.** C-G4 is
> approved, so the labels are settled. The deployments carry the full four-tab
> internal surface from `01` **plus** this locations sheet, opening on the
> pinned project view. **C2.1–C2.5 are unchanged and still wanted** —
> source/brand multi-select, state, derived US/Non-US, category, name search,
> chips, provenance expander, CSV export of the filtered view at the 10,000-row
> cap. **C2.6 is dropped:** there is no internal surface to 404, because the
> internal surface is the point.

**C2.1 — The locations sheet.** Sortable columns, server-side pagination
through the existing `paginate` cap of 500 rows per page. Filtering is
server-side against the predicate from C1; the browser never receives an
unfiltered set. All strings render through React's default escaping; no
`dangerouslySetInnerHTML` anywhere.

**C2.2 — Filters.**

| Filter | Field | Shape |
|---|---|---|
| Source / brand | `source_tokens` | multi-select, display names, allowed tokens only |
| State | `state` | multi-select |
| Country | derived (C1.6) | United States / Non-US |
| Category | `category_core` | multi-select, labels from `CATEGORY_LABELS` |
| Name search | `company_display`, `domain` | text |

Nothing else. No tier, no size, no verification, no disposition, no pool. Those
controls are not disabled — they are not rendered, because there is no query
behind them.

> **AMENDED 2026-08-07.** The five filters ship exactly as specified — they are
> the right five for a locations view. "Allowed tokens only" becomes **all
> tokens**. "Nothing else" is now a **scope** statement, not a prohibition: tier
> / size / verification / disposition / pool filters are simply not in this
> build, and adding one later is a feature request, not a policy reversal.
> Server-side filtering and the no-`dangerouslySetInnerHTML` rule (rail 7 from
> the design spec) stand unchanged.

**C2.3 — The three counters** from C-G4, above the sheet, always visible,
recomputing on every filter change, each labeled with what it counts.

**C2.4 — Source chips + provenance expander.** Chips per allowed token with the
qualified count. The expander renders one line per token: display name ·
`source_url` as a link (`rel="noopener noreferrer"`) · `captured` date. A row
with no provenance renders an explicit missing-provenance marker.

**C2.5 — Download.** A button that exports **the current filter**, not the
current page and not the whole slice.

- Server-generated CSV through the C1.4 builder. The client sends filter
  parameters, never a column list and never rows.
- **Visible columns only** — the whitelist intersected with what the sheet is
  showing. Never wider than `CLIENT_COLUMNS`.
- **Cap 10,000 rows.** Beyond it, refuse with a plain message: *"That's more
  than 10,000 locations. Narrow the filter and try again."* Not a truncated
  file — a truncated CSV looks complete and is the kind of quiet wrongness this
  workspace keeps paying for.
- **Log every export**, one line: project, filter, row count, timestamp.
- Filename carries the project and date: `field-advisor-locations-2026-08-07.csv`.

> **AMENDED 2026-08-07 — export.** **Visible columns**, still: what the sheet is
> showing, which with the toggle on means everything — campaign fields and
> Apollo fields included. It is no longer bounded by `LOCATION_COLUMNS`. The
> **10,000-row cap stays**, and so does the refuse-never-truncate rule; that was
> always about not shipping a file that lies about being complete. The log line
> stays as operational record-keeping. Filename convention unchanged.

**C2.6 — No internal surface in client mode.** No Sources ops board, no Pools
tab, no Projects admin, no NEW badges, no mismatch chips, no registry
statuses, no sync controls. Route-level, not link-level: those routes return
404 when `DASHBOARD_MODE=client`, so knowing the URL gets a client nothing.

> **AMENDED 2026-08-07 — C2.6 is DROPPED in full.** Sources, Pools, Projects,
> NEW badges, mismatch chips, registry statuses and sync controls are all
> present on all three deployments. No route 404s by mode.

### Acceptance

- [ ] Every filter narrows the sheet **and** the three counters together.
- [ ] Provenance chips show display names only; `grep` the rendered HTML for
      `dfs` and for any raw token — nothing.
- [ ] Expander links open the recorded `source_url`.
- [ ] Export byte-for-byte matches the on-screen filter's rows and columns.
- [ ] Export of a >10,000-row filter refuses with the message; no file
      downloads.
- [ ] Export writes its log line.
- [ ] `grep -rn "dangerouslySetInnerHTML" apps/contacts-dashboard/` prints
      nothing.

> **AMENDED 2026-08-07 — C2 acceptance.** Rows 1 and 3–7 stand as written, with
> "the three counters" reading as the location counters on this view. **Row 2 is
> replaced:** provenance chips render a display name where the map has one and
> the raw token where it does not — `dfs` appears, and that is correct.

---

## Phase C3 — the two deployments

Blocked on C-G3. Artur creates the projects and picks the passwords; the
session wires the env and verifies.

> **AMENDED 2026-08-07 — C3 is now: two Vercel projects + two DNS records on
> `salesolution.net` + Deployment Protection ON + a password env per
> deployment.**
>
> - **C3.1 — `ss-locations-fieldadvisor`.** Same repo, Root Directory
>   `apps/contacts-dashboard`, framework preset Next.js. Env (Production +
>   Preview): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
>   `DASHBOARD_MODE=internal`, `DASHBOARD_PROJECT=field-advisor`,
>   `DASHBOARD_PASSWORD`, `DASHBOARD_SESSION_SECRET`. **Nothing prefixed
>   `NEXT_PUBLIC_`** — unchanged and non-negotiable.
> - **C3.2 — `ss-locations-hosebox`.** Identical, with
>   `DASHBOARD_PROJECT=hosebox` and its own password and secret.
> - **C3.3 — DNS.** Add `fieldadvisor.salesolution.net` to the first project and
>   `hosebox.salesolution.net` to the second, then create the two records the
>   Vercel domain screen asks for at the `salesolution.net` registrar. Wait for
>   both to show **Valid Configuration** with a live certificate before
>   testing; a subdomain that resolves before its cert lands will look broken
>   and is not.
> - **C3.4 — Deployment Protection ON, both.** Settings → Deployment Protection
>   → **Vercel Authentication**, all deployments including Preview. This is the
>   reversal of the original C3.3 below. Verify from incognito that a **Vercel
>   login** is what loads first, and the house password form only after it.
> - **C3.5 — `ss-contacts` unchanged**, plus `DASHBOARD_MODE=internal` set
>   explicitly. Deploy it and confirm all four tabs still work.
> - **C3.6 — Three distinct passwords**, unchanged from the original C3.5:
>   different from each other, from `CONTACTS_DASHBOARD_PASSWORD`, and from
>   `SALES_PASSWORD`.

**C3.1 — `ss-locations-fieldadvisor`.** Import the same repo, Root Directory
`apps/contacts-dashboard`, framework preset Next.js. Env (Production +
Preview): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_MODE=client`,
`DASHBOARD_PROJECT=field-advisor`, `DASHBOARD_PASSWORD`,
`DASHBOARD_SESSION_SECRET`. **Nothing prefixed `NEXT_PUBLIC_`.**

**C3.2 — `ss-locations-hosebox`.** Identical, with
`DASHBOARD_PROJECT=hosebox` and its own password and secret.

**C3.3 — Deployment Protection OFF on both.** Settings → Deployment Protection
→ none, for all deployments including Preview. Verify from incognito that the
**password form** is what loads, not a Vercel login.

**C3.4 — The internal project is untouched.** `ss-contacts` keeps Vercel
Authentication ON and gains `DASHBOARD_MODE=internal`. Deploy it too and
confirm all four tabs and all columns still work — the mode switch is a new
branch through shared code and the internal path is the one nobody will be
watching.

**C3.5 — Both client passwords are distinct** from each other, from
`CONTACTS_DASHBOARD_PASSWORD`, and from `SALES_PASSWORD`.

---

## Phase C4 — acceptance, on the deployed URLs

Run the whole list **against each client deployment separately**, then the
internal one. Record the output.

> **AMENDED 2026-08-07 — the C4 list that actually runs.** Per subdomain
> (`fieldadvisor.salesolution.net`, then `hosebox.salesolution.net`), then
> `ss-contacts`:
>
> - [ ] **Both walls verified.** From incognito: the Vercel login loads first;
>       past it, the house password form; wrong password ×N is rate-limited with
>       a `Retry-After`; the correct password sets an httpOnly + secure cookie
>       and opens the app. A logged-out browser gets nothing at either wall.
> - [ ] **The project view opens pinned correctly.** `fieldadvisor` lands on the
>       Field Advisor view, `hosebox` on Hosebox, with no click.
> - [ ] **The show-all toggle works.** Default 14 columns; toggle on reveals the
>       full set including the Apollo/person fields; a row's `raw` panel opens.
> - [ ] **Export matches the filter.** Set a filter, export, open the CSV: same
>       rows, same columns as the sheet is showing. Over 10,000 rows it refuses
>       with the message and downloads nothing.
> - [ ] **Smartlead absent.** No Smartlead import, no campaign surface, no
>       Smartlead route anywhere in the deployed app.
> - [ ] Counters read as C-G4 approved and each is labeled with what it counts —
>       the three location counters on the location and project views, companies
>       / people / sendable on Everything.
> - [ ] The two subdomains carry **different passwords**, and rotating one does
>       not touch the other or `ss-contacts`.
> - [ ] The local dashboard runs untouched: `pnpm emails:dashboard`, five tabs,
>       both grep guards silent, `node --test emails/scripts/lib/` green.
> - [ ] The anon-key test from `01` still returns nothing on every table.
>
> Everything below this block was written for a client audience — the
> cross-project probes, the removed-column probes, the internal-vocabulary
> sweep, the 404 checks. **None of it runs.** It is kept as the record of what
> would have to be re-verified if a login is ever handed to a third party.

**Per client deployment:**

- [ ] **The password wall loads from incognito.** Not a Vercel login. Wrong
      password ×N is rate-limited with a `Retry-After`. Correct password sets an
      httpOnly + secure cookie and opens the sheet.
- [ ] **Only its slice is returned.** Two direct API calls, both must fail
      server-side, both with no data in the response:
      - a request naming the **other project** (query string, header, body —
        try all three);
      - a request naming a **removed column** (`email`, `tier`, `raw`,
        `contact_email`) — expect 400, expect a log line.
- [ ] **The export matches the on-screen filter** and contains **no removed
      column**. Open the CSV, read the header row, compare it against
      `CLIENT_COLUMNS`. It must be a subset — never a superset, never a
      surprise.
- [ ] **`dfs`-only exclusion verified by count.** Run the count query with and
      without the allowlist predicate; the difference equals the number the sync
      printed for this project.
- [ ] **No internal tab is reachable.** Hit the Sources, Pools and Projects
      routes directly by URL: 404, not a redirect and not an empty page.
- [ ] **Provenance links open the recorded `source_url`.** Spot-check one row
      per source kind — locator, `serp`, `ptda`/`ad`.
- [ ] **No internal vocabulary in the payload.** View source and the network
      tab: no `tier`, no `cohort`, no `disposition`, no `rank_score`, no
      `email`, no `contact_*`, no `raw`, no pool name, no generation name.
- [ ] Counters read as C-G4 approved, and each is labeled with what it counts.

**Cross-deployment:**

- [ ] Field Advisor's password does **not** open Hosebox, and vice versa.
- [ ] With a valid Field Advisor session cookie, a request to the Hosebox
      deployment is refused.

**Internal, unchanged:**

- [ ] `ss-contacts` still shows **both walls**, all four tabs, all columns, and
      still has **no export endpoint**.
- [ ] The local dashboard runs untouched: `pnpm emails:dashboard`, five tabs,
      both grep guards silent, `node --test emails/scripts/lib/` green.
- [ ] The anon-key test from `01` still returns nothing on every table.

---

## Guardrails

Non-negotiable. If a task appears to need one relaxed, the task is wrong.

> **AMENDED 2026-08-07 — which of these ten survive.**
>
> - **1, 2, 3** (one whitelist constant · new columns default to hidden ·
>   `raw` never selected) — **demoted to view defaults.** One constant still
>   defines the opening columns, a new column still lands in `raw` and is not in
>   the default view until someone adds it, and `raw` is now a **shown** panel.
>   None of it is a security control.
> - **4** (mode and project from the server environment only) — **stands**, as
>   deployment hygiene rather than containment.
> - **5** (export capped and logged) — **stands.** 10,000 rows, refuse over the
>   cap, never truncate, one log line per export.
> - **6** (RLS deny-all + service-role-only, no `NEXT_PUBLIC_SUPABASE_*`) —
>   **stands, unchanged, non-negotiable.**
> - **7** (client mode never renders internal status) — **DROPPED.** Internal
>   status is the point.
> - **8** (all deployments read the same tables) — **stands.** One asset, no
>   copies, nothing that can go stale and disagree.
> - **9** (PII never enters git) — **stands, unchanged, non-negotiable.** The
>   audience reversal changes what the app renders, not what the repo holds.
> - **10** (do not rename the `dashboard/` folder) — **stands.**
> - **NEW, replacing the licensing guardrail:** *This tool is internal. The
>   moment an export or a login is handed to a client or any third party, the
>   dissolved C-G1 licensing question un-dissolves — `dfs` redistribution and
>   Apollo's no-sharing terms apply to what leaves this tool, not just to what
>   it renders. Re-open 02's original C-G1 before sharing anything.*
> - **Smartlead, unchanged:** it stays out of the deployed app. That was
>   key-security from `01`, never an audience call, and the reversal does not
>   touch it.

1. **The column whitelist lives in ONE constant.** `CLIENT_COLUMNS` in
   `lib/client-view.ts`, imported by the page queries and the export endpoint.
   No second list, no inline `select('…')` in a client code path, no
   "temporarily" adding a column to debug something.
2. **Any new column defaults to hidden.** The whitelist is an allowlist. A
   column arriving in generation N+1 lands in `raw` and is invisible until
   someone adds it to the constant on purpose. This is the inverse of the
   internal app's schema tolerance, and deliberately so.
3. **`contacts.raw` is never selected in client mode.** It is the whole row. One
   `select` of it undoes the entire whitelist.
4. **Mode and project come from the server environment only.** Never from a
   query string, header, cookie, or body. `DASHBOARD_MODE=client` without
   `DASHBOARD_PROJECT` is a startup failure, not a default.
5. **Export is capped and logged.** 10,000 rows, one log line per export —
   project, filter, row count, timestamp. Over the cap refuses; it never
   truncates.
6. **RLS deny-all + service-role-only, unchanged from `01`.** No anon policies,
   no `NEXT_PUBLIC_SUPABASE_*` variable, the browser never talks to Supabase.
   The extra deployments change none of this.
7. **Client mode never renders internal status.** No tiers, no cohorts, no
   dispositions, no verification verdicts, no rank scores, no registry board,
   no NEW badges, no sync state. Enforced at the route, not by hiding a link.
8. **The two client slices read the same tables.** No per-client database, no
   per-client CSV dropped somewhere, no copy that can go stale and disagree
   with the internal view. One asset, three predicates.
9. **PII never enters git**, unchanged from `01` guardrail 1. Migrations are
   committed; data never is.
10. **Do NOT rename the `dashboard/` folder.** The Sources tab parses
    `^(.+) \[([A-Z-]+)\]$` over this pack's directories; renaming this folder
    to carry a status would register a phantom source token named `dashboard`
    with zero rows, forever. Same reason as `01` guardrail 5. Keep it boring.

---

## Done looks like

> **AMENDED 2026-08-07 — the amended done list.** Everything below that turns on
> the client premise is void; this is what closes the build now.
>
> - [ ] `fieldadvisor.salesolution.net` and `hosebox.salesolution.net` live from
>       the same repo and Root Directory, **both walls up**, separate passwords
> - [ ] Each subdomain opens on its pinned project view; both views read the
>       **full pool**, with empty `filters` recorded honestly in `projects`
> - [ ] The locations sheet live with source/brand, state, country, category and
>       name filters, all server-side
> - [ ] The 14-column default plus a working **show all columns** toggle, Apollo
>       fields and the per-row `raw` panel included
> - [ ] Source chips + provenance expander live, named provenance shipped per
>       C-G4, links opening the recorded `source_url`, missing provenance
>       rendering as a marked defect
> - [ ] CSV download live: current filter, visible columns, capped at 10,000,
>       logged
> - [ ] The three location counters live on the location and project views;
>       companies / people / sendable back on Everything; each labeled with what
>       it counts
> - [ ] Smartlead absent from all three deployments
> - [ ] `ss-contacts` still up with both walls and all four tabs
> - [ ] A `## Deployed` note in `dashboard/00-README.md` listing all three URLs,
>       which project each opens on, and who holds which password

- [ ] C-G1 signed per project; the inclusion rule is a SQL predicate, and the
      sync prints the dfs-only exclusion count for each slice
- [ ] C-G2 signed; `projects` carries a `field-advisor` row and a `hosebox` row
      with real `criteria`, or the recorded placeholder plus the four unanswered
      questions written into the ledger
- [ ] `lib/client-view.ts` holds **one** `CLIENT_COLUMNS` constant and **one**
      `CLIENT_SOURCES` map that is simultaneously the allowlist and the display
      names; grep finds no other column list in a client path
- [ ] `contacts.raw` proven absent from every client select
- [ ] The locations sheet live with source/brand, state, country, category and
      name filters, all server-side
- [ ] Source chips + provenance expander live, links opening the recorded
      `source_url`, missing provenance rendering as a marked defect
- [ ] CSV download live: current filter, whitelist columns, capped at 10,000,
      logged
- [ ] `ss-locations-fieldadvisor` and `ss-locations-hosebox` deployed from the
      same repo and Root Directory, Deployment Protection **off**, password gate
      up, separate passwords
- [ ] Cross-project API probe **fails server-side**, output recorded
- [ ] Removed-column API probe **fails with 400**, output recorded
- [ ] No internal route reachable in client mode — 404s recorded
- [ ] C-G4 wording approved and shipped; three counters live, each labeled with
      what it counts
- [ ] `ss-contacts` still has both walls, four tabs, all columns and no export
- [ ] A `## Deployed` note in `dashboard/00-README.md` listing all three URLs,
      which mode each runs, and who holds which password

---

## Remaining founder tasks (2026-08-07)

The four gates are answered, so nothing here is a decision. These are the
things only Artur can do, and they replace the old gate list.

1. **Supabase project + keys** — `T-G1` from `01-vercel-transfer.md`,
   unchanged. Still the first blocker; no code runs without it.
2. **Create the two Vercel projects and the two DNS records** —
   `ss-locations-fieldadvisor` → `fieldadvisor.salesolution.net`,
   `ss-locations-hosebox` → `hosebox.salesolution.net`, both importing the same
   repo with Root Directory `apps/contacts-dashboard`, both with Deployment
   Protection set to **Vercel Authentication**.
3. **Set the two password env values** — `DASHBOARD_PASSWORD` and
   `DASHBOARD_SESSION_SECRET` per deployment, distinct from each other, from
   `CONTACTS_DASHBOARD_PASSWORD`, and from `SALES_PASSWORD`.
4. **Optional, later — define per-project filter presets** for Field Advisor vs
   Hosebox. Both views ship over the full pool with empty `filters`; a preset is
   worth writing when the two views need to differ, not before. The old C-G2
   questions (a fluid-power lens for Hosebox, a different field for Field
   Advisor, whether the ag/turf tokens belong in either) are the starting
   material.
