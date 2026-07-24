# Prompt — Hero probe: verify it works; if not (or on founder go), build the AI version

Covers the **AI-Readiness Probe** — the "Score a page the way AI reads it" band on the
homepage hero (`components/sections/HeroProbe.tsx`, backed by `app/api/probe/route.ts`).
Written 2026-07-09. Status when written: the prod endpoint answered `POST
https://salesolution.net/api/probe/` in ~0.5s with real scores (salesolution.net itself
scored 79). The tool is deterministic heuristics only — no AI call, no rate limiting, no
signup gate. Part A checks it still works; Part C is the plan for the AI-powered v2
(rate-limited, email-gated after the first run).

**How to use:** paste everything below the line into a fresh Claude Code session inside
this repo. Part A always runs. Part C runs only if Part A finds the tool broken, or if the
founder explicitly asks for the AI upgrade — it is a plan-then-build with GATE:HUMAN stops,
not a silent rebuild.

**Coordination:** the homepage flow rework
(`docs/handoff/2026-07/09/homepage-flow-rework.md`, decision D-B) may extract the probe
band out of `HeroProbe.tsx` or move it down the page. Check `git log` and the current
`HeroProbe.tsx` shape first; if the split already happened, the file map below is stale —
follow the code, keep the `data-cta` ids.

---

You are verifying, and possibly upgrading, the AI-Readiness Probe on salesolution.net's
homepage. I'm the founder. Read `prompts/_CONTEXT.md` and
`.agents/product-marketing-context.md` before changing any copy. Never edit `AGENTS.md`,
`docs/strategy/glossary-queue.json`, or `lib/strategy/niches/briefs.generated.ts`. Stage
only your own files — never `git add -A`.

## The section, as shipped

- **UI:** probe band inside `components/sections/HeroProbe.tsx` (form → `POST /api/probe/`
  → three score bars + overall + tier pill + "Get the full audit →" CTA to
  `/unlock-growth-audit/`). States: idle skeleton / loading / result / error.
- **API:** `app/api/probe/route.ts` — fetches the URL server-side (SSRF-guarded: DNS
  lookup, private-IP block, 3-hop manual redirects, 5s timeout, 2MB cap), parses HTML,
  returns deterministic `{ schema, readable, authority, overall }`.
- **Copy claims on the band (each must stay true):** "In about two seconds" · "No email
  required" · "Deterministic · No data stored" · the "live" badge.
- **Analytics ids to preserve:** `audit__hero_probe_result` (result CTA),
  `data-cta-location="hero"`.

## Part A — Verify (always)

Run against **production first**, then local (`pnpm dev`, webpack-pinned; recover flaky
states with `pkill -f "next dev"; rm -rf .next; pnpm dev`).

**A1. API matrix** (curl, prod). Expected → actual for each:

| Input | Expect |
|---|---|
| `{"url":"https://www.grainger.com"}` (real product site) | 200, four 0–100 integers |
| Same URL twice | identical scores (deterministic claim) |
| `{"url":"https://salesolution.net"}` | 200 (record the score — regression canary) |
| `{"url":"not a url"}` | 400 with `error` string |
| `{"url":"http://192.168.1.1/"}` and `{"url":"http://localhost:3000"}` | 400 (SSRF guard) |
| `{"url":"https://example.com/some.pdf"}` (non-HTML) | 502 |
| A URL behind 2 redirects | 200; 4+ redirects → 502 |
| Response time on a normal page | comfortably under ~5s ("about two seconds" claim) |

**A2. UI, visual loop** (desktop 1440×900 + mobile 390×844; write a sibling of
`scripts/_visual-check.mjs` inside the repo so playwright resolves, delete it after):
idle skeleton renders · submit → loading state → bars animate to result + tier pill +
audit CTA · bad URL → readable error, form recovers · schemeless input (`yourdomain.com`)
gets `https://` prepended · no overflow at 390px.

**A3. Claims lint:** confirm every copy claim in the list above is still literally true of
the behavior you observed. A false claim (e.g. the endpoint now stores data, or takes 10s)
counts as DEGRADED even if the widget "works".

**A4. Verdict — one of:**
- **WORKING** — report the matrix results and stop, unless the founder asked for Part C.
- **DEGRADED** (works but slow / a claim is false / an error state is ugly) — fix the
  deterministic version first; it is the shipped promise. Then stop unless told otherwise.
- **BROKEN** (endpoint down, UI dead) — diagnose (Vercel logs, recent commits touching
  `app/api/probe/` or `HeroProbe.tsx`), fix if the cause is a regression. If the
  deterministic design itself is the dead end, proceed to Part C.

Append findings to `docs/strategy/offer-research/alignment/home.md` either way.

## Part B — Decision gate (GATE:HUMAN)

Before any Part C work, present the founder: the Part A verdict, the v2 shape below, the
estimated per-run and monthly cost at expected volume, and the copy changes v2 forces.
Wait for a go.

## Part C — AI-Probe v2 (build only on founder go)

### C1. Product shape — two layers, never a dead widget

1. **Layer 1 (free, unlimited, instant):** the existing deterministic scores. Untouched.
   This keeps the hero demo alive for every visitor and gives the AI layer a fallback.
2. **Layer 2 (AI read, gated):** after the scores render, a second panel — "How an AI
   engine would actually read this page": a short model-written summary of what the page
   is about as an answer engine would extract it, plus the top 3 concrete fixes ranked by
   citation impact. This is the part worth gating, because it costs money per run and is
   the thing a competitor's free widget can't fake.

### C2. Containment — the non-negotiables

- **First run free, anonymous.** No email, no friction — the hero demo must stay a
  10-second win.
- **Second run onward requires signup.** Lightweight email capture, not accounts: an
  inline email field unlocks N more runs (suggest N=5). Reuse the existing lead pipeline —
  inspect `app/api/lead/route.ts` and `lib/lead-form/` and land the lead where current
  forms land; tag the source (`probe_v2`). Track run count in a signed HTTP-only cookie.
  The cookie is the UX nudge, not the security boundary — incognito evades it, which is
  fine because:
- **Per-IP rate limit is the real backstop.** Serverless has no shared memory, so the
  counter needs a durable store: `@upstash/ratelimit` + Upstash Redis (Vercel marketplace,
  free tier covers this) is the default; Vercel KV is the alternative. Suggested caps:
  AI layer 3/hour and 10/day per IP; deterministic layer something generous like 30/day.
  429 responses render as friendly copy, not a dead form.
- **Global daily spend cap (kill switch).** A daily counter in the same store; past the
  cap the AI layer degrades to "high demand — deterministic scores only today" and the
  widget keeps working on Layer 1. Cap value is GATE:HUMAN.
- **Model + token budget:** read the `claude-api` skill before writing the call. Default
  to the cheapest current fast tier (Haiku-class); strip the fetched HTML to text and cap
  input around 8k tokens; small `max_tokens`; structured JSON output. Compute the real
  per-run cost from current pricing and put it in the Part B gate. `ANTHROPIC_API_KEY`
  goes in `.env.local` + Vercel env — document in `.env.local.example`, never commit.
- **Prompt injection:** the fetched page is untrusted input. It goes in as data with a
  hardened system prompt, output is schema-validated, and nothing from the page is ever
  treated as an instruction. Reuse the route's existing SSRF guards for the fetch.

### C3. Implementation sketch

- Extend `app/api/probe/route.ts` or add `app/api/probe/ai/route.ts` (separate route keeps
  Layer 1's latency and cacheability clean — preferred). Gate + rate-limit checks live
  server-side in the route, never in the client.
- UI: result panel grows an AI section with its own states (locked → email form →
  loading → AI read → rate-limited). New `data-cta` ids in the existing family, e.g.
  `probe_ai_unlock__hero`; keep `audit__hero_probe_result` untouched.
- Tests: pure gating/limit logic split into `lib/tools/` style modules where practical,
  `node --test` per the tools README. `npx tsc --noEmit` clean (ignore pre-existing
  `lib/lead-form/*` Zod errors), lint clean, `pnpm build` compiles.

### C4. Copy that MUST change with v2 (humanizer + GATE:HUMAN on every line)

- "No email required" → true only for the first run; reword ("First run free — no email").
- "Deterministic · No data stored" → Layer 2 is neither; the badge splits or goes.
- Homepage number rules still bind: no unattested numbers, no guarantee language
  (`docs/strategy/offer-research/00-offer-architecture.md` §9.1).

### C5. Definition of done

Part A matrix green on the deployed v2 · first anonymous run works with zero friction ·
second run blocks until email, email unlocks · per-IP 429 and global-cap fallback both
verified by hand · lead arrives in the pipeline with the right tag · visual loop on both
viewports · costs logged in the report · outcome appended to
`docs/strategy/offer-research/alignment/home.md` with commit hashes.
