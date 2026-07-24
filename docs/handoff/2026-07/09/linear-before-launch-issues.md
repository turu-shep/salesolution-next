# Linear issues for "Before launch - handle" (probe v2 pre-deploy)

Drafted 2026-07-09. Two issues, ready to paste — or give the session a
`LINEAR_API_KEY` (or connect the Linear MCP) and it creates them via API.

---

## Issue 1

**Title:** Probe v2 deploy config — env keys, mock flag, kill switches

**Description:**

The AI-Readiness Probe v2 (AI read + email gate + rate limits + report/methodology pages) is built and verified locally. It must NOT deploy until this config is in place.

- [ ] Add `ANTHROPIC_API_KEY` to Vercel env (production + preview). Without it the AI read panel shows "offline"; deterministic scores still work.
- [ ] Add `PROBE_GATE_SECRET` to Vercel env — any long random string (signs the free-run/unlock cookie). `openssl rand -base64 32` works.
- [ ] Recommended: create a free-tier Upstash Redis and add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to Vercel env. Without it, the daily spend kill switches (Claude 200/day, unlock 100/day, DataForSEO 500/day) count per serverless instance instead of fleet-wide — the code logs a warning in Vercel logs when running degraded.
- [ ] Confirm `DATAFORSEO_USERNAME` / `DATAFORSEO_PASSWORD` are in Vercel env (Domain-strength category needs them; fails soft to 3 categories without).
- [ ] Make sure `PROBE_AI_MOCK` is NOT set in any Vercel env (it's dev-only in `.env.local`; remove it there too once the Anthropic key is added, or the local AI read stays canned).
- [ ] Read the new customer-facing copy before it goes live: report page (`/ai-readiness/<token>/`), AI read panel states (free run / email wall / exhausted), methodology page, the band's "See the full report" CTA. All new lines are flagged in `docs/strategy/offer-research/alignment/home.md` §H–§K.

Spend expectations once live: AI read ≈ 1¢/run (Haiku), DataForSEO ≈ 2–3¢ per fresh domain (24h cache per domain). Worst-case day at the global caps ≈ $2 Claude + $15 DataForSEO.

**Labels/notes:** blocks deploy of the probe branch. Everything else (code, tests, review) is done.

---

## Issue 2

**Title:** salesolution.net scores "Gaps" on its own probe — llms.txt + title fix

**Description:**

Our homepage scores 69 on our own (deliberately harsh) rubric, and the band shows the amber "Gaps" pill on us. Two cheap fixes move us:

- [ ] Publish `/llms.txt` (llmstxt.org format) — we're an AI-search firm without one; it's also a scored signal (8 pts, AI-readable).
- [ ] Shorten the homepage `<title>` to ≤60 characters (currently over — loses title-tag points).
- [ ] Optional: re-check the text-to-markup ratio signal after the next content pass.

Domain strength (56) is the real ceiling — that's the long game the learning hub + link-worthiness roadmap addresses, not a quick fix. Target: clear 85 on on-page categories so the weakest gate is honestly the domain.

---

**Project:** Before launch - handle · **Team:** SAL
