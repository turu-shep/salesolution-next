# Baseline — test coverage map + runner decision

**Measured:** 2026-07-24 at commit `dd66f3c` · Runner: `pnpm test` → `node --test lib/` (bare `node:test`, no TS loader) · Node v20.16.0 · **Mapped by:** opus-5 (phase 0 agent); decision section by fable-5

**Result: 4 test files · 34 cases · 34 pass / 0 fail · 107ms.** All 34 cases exercise **4 of 72 source files under `lib/`** (5.6%), and every tested file is `.mjs`.

## 1. What `node --test lib/` covers today

| Test file | Module under test | Cases | Covered | Gaps |
|---|---|---|---|---|
| `lib/probe/score.test.mjs` | `lib/probe/score.mjs` (731 lines) | 15 | Real depth: determinism, page-type routing (schema > path > home), noindex zeroing, JS-shell detection, `blockedAiBots` robots parsing (groups/wildcards/Allow), llms.txt credit, `mean*0.6+min*0.4` weakest-gate formula incl. 4-category domain variant, band boundaries, clamps, rich-vs-empty ≥40pt separation | `signalCatalog()` never asserted directly; `REQUIRED_PROPS`/`RECOMMENDED_PROPS` not pinned per-key |
| `lib/probe/gate-limits.test.mjs` | `lib/probe/gate.mjs` + `lib/probe/limits.mjs` | 11 | Gate HMAC roundtrip + tamper → fresh state; 1-free/6-unlocked at every boundary; hour-before-day cap ordering, per-IP isolation, bucket reset semantics, global kill switch, `MemoryCounter` TTL, invariant `CAPS.ai.hour >= UNLOCKED_RUNS` | Absolute `CAPS` values not pinned; no test that the real Upstash path behaves like `MemoryCounter` (that bridge lives in untested `gate-server.ts`) |
| `lib/sitemap/registry.reconcile.test.mjs` | `lib/sitemap/registry.ts` — **by regex over source text, not import** | 2 | Route-membership drift guard: every non-dynamic, indexable `app/(site)` route must appear as a `u('…')` literal | **The module is never executed.** `toUrlsetXml`/`toIndexXml`, `TOOL_URLS`, priorities untested — green even if the file doesn't compile (see F-013) |
| `lib/tools/catalog-readiness.test.mjs` | `lib/tools/catalog-readiness.mjs` | 6 | Bands at both edges, weighted math pinned exactly, unknown ids, data-integrity sweep | Nothing material |

## 2. Inventory

76 tracked files under `lib/`: 68 `.ts`, 4 `.mjs` source, 4 `.test.mjs`. **Tested: 4** (all `.mjs`) · **Partially: 1** (`registry.ts`, by text regex) · **Untested: 67** (every other `.ts`; ~40 are pure content/data constants, low risk — a data regression is visibly wrong copy).

## 3. Untested business logic ranked by risk (blast radius × silence)

| # | File | Why it fails silently |
|---|---|---|
| 1 | `lib/probe/fetch.ts` — the SSRF boundary; 4 internet-facing entry points | If the per-hop re-validation inside the redirect loop (line ~113) is hoisted or the `::ffff:` IPv4-mapped branch breaks, a public host 302ing to `http://169.254.169.254/` gets fetched and scored — normal-looking output, no error, no log |
| 2 | `lib/sales/auth.ts` — sole gate on `/sales` AND `/strategy` (via re-export) + 4 API routes | `verifySession` has three independent bail-outs (length check, `timingSafeEqual`, `Number.isFinite`, age); lose any one and forged/expired cookies pass invisibly |
| 3 | `lib/probe/gate-server.ts` — every probe rate-limit decision + gate cookie mint/read + client IP | `clientIp` takes first XFF hop unvalidated; `incrCounter` swallows Upstash errors into per-instance memory behind a one-shot warn. Regression → everyone 429s or nobody is limited; the tested `limits.mjs` invariants stay green either way |
| 4 | `lib/rate-limit.ts` — only spam brake on all three lead routes | `upstashInitTried` latch pins the process to memory forever after one failed init; memory window resets per serverless instance. Bots burning HubSpot/Resend quota produce 200s |
| 5 | `lib/probe/token.ts` — every shareable report URL; hand-rolled base64url, encoder+decoder are separate implementations | Break 3-byte-tail handling and a subset of URLs (long/non-ASCII) decode to a different URL or null — shared links 404 or score the wrong site |
| 6 | `lib/probe/ai.ts` — the paid Claude call + prompt-injection boundary | `mockEnabled()` regression = canned verdicts to real prospects; `<page>`-tag containment weakening = scanned site steers the model; both validate fine against `READ_SCHEMA` |
| 7 | `lib/lead-form/submit.ts` (+`submit-audit.ts`, `full-growth-quote-submit.ts`) — every lead | Returns `ok: true` when NO delivery channel is configured; env-name drift in production = thank-you page shown, lead dropped, `console.log` only. No queue, no retry (see F-014) |
| 8 | `lib/schema.ts` — 14 JSON-LD builders, 34 importing pages | Broken `@id` graph ships silently; loss appears as vanished rich results weeks later |
| 9 | `lib/lead-form/*schema.ts` — zod contracts shared client/server | Loosening admits junk to HubSpot; tightening rejects real leads with unactionable errors; no monitor either way |
| 10 | `lib/sitemap/registry.ts` serializers + `lib/sitemap/data.ts` | XML escaping/lastmod regression → Google rejects the document while the regex test stays green; `data.ts` fails soft so a query regression silently drops a whole content type from the index |
| 11 | `lib/probe/domain.ts` — DataForSEO billing path behind 24h cache | Cache-key regression re-bills per probe; only symptom is the invoice |
| 12 | `lib/analytics-server.ts` / `analytics.ts` / `consent.ts` | `transaction_id` drift double-counts conversions; consent regression fires pixels pre-consent (compliance); both silent |
| 13 | `lib/lead-form/full-growth-quote-value.ts` | Client and server compute lead value independently; band-key drift corrupts GA4 conversion values with no failure |
| 14 | `lib/redirects.ts`, `lib/slug.ts`, `lib/strategy/auth.ts` | Build-time redirect loops land on backlinks nobody watches; anchor-slug divergence breaks TOC scrolls; strategy re-export shares one credential across both private areas |

Ranked low deliberately (untested but loud): `navigation.ts`, `business.ts`, `career-path-map.ts`, `cn.ts`, etc.

## 4. Runner-compatibility gaps

1. **`.ts` is structurally undiscoverable** — Node 20's `--test` glob matches only `*.test.(c|m)js` patterns; a `fetch.test.ts` would be neither matched nor loadable.
2. **Node 20.16 predates native type stripping** (landed 22.6 experimental, default 23.6+).
3. **Scope pinned to `lib/`** — a valid test in `app/`, `scripts/`, `sanity/` would be silently ignored. None exist today, but the trap is live.
4. **One existing test works around the limit and the workaround is load-bearing** — `registry.reconcile.test.mjs` regexes source text; green over an unexecuted module.
5. **No test framework config anywhere**; `playwright` in devDeps with zero specs — no E2E coverage exists.

## 5. The runner decision (blocks wave 3 — Artur's call, ledger F-009)

Wave 3 cannot write the tests that matter (`fetch.ts`, `auth.ts`, `gate-server.ts`, `rate-limit.ts`, `token.ts`) until `.ts` is loadable. Options:

| Option | Change | Pros | Cons |
|---|---|---|---|
| **A. `tsx` loader (recommended)** | Add `tsx` devDep; test script → `node --import tsx --test lib/` | Smallest diff; works on today's Node; existing `.mjs` tests unaffected; `.ts` tests immediately writable; type *checking* stays tsc's job | One new devDep (~30MB); esbuild-transform semantics (no typechecking at runtime — acceptable, tsc is clean) |
| B. Upgrade Node to 24 LTS | Platform change (local + Vercel runtime) | Native `.ts` in `node --test`, zero new deps; also fixes the npm-11-on-EOL-Node mismatch — this upgrade is worth doing on its own EOL merits | Biggest blast radius; touches deploy runtime; not a test-runner-sized decision |
| C. Extract pure logic to `.mjs` | Continue the existing pattern (`score.mjs`, `gate.mjs`, `limits.mjs` all did exactly this) | No deps, no platform change; proven in-repo | Splits typed code; `fetch.ts`/`auth.ts` entangle `next/server` imports and don't extract cleanly; churn in the exact files an audit wants stable |
| D. Adopt vitest | New runner + config | TS native, rich mocking, watch mode | Heaviest change; replaces a working setup; overkill for the current test volume |

**Recommendation: A now, B soon.** `tsx` unblocks wave 3 with a one-line script change and no source churn; schedule the Node 24 upgrade separately (EOL runtime is its own ledger row territory, noted in `deps.md`). Option C remains the fallback for pure pieces (e.g. `token.ts` codec) if A is declined. **Not implemented — decision needed before wave 3.**
