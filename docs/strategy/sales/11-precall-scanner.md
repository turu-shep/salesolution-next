# Automated pre-call scanner

**What:** a script that finds local-service prospects, scans each for the leaks you open a cold call on, and writes a ready opener into Sanity. The `/sales` cockpit reads the results to fill the pre-call card. Internal sales-ops — not customer-facing.

**Status (2026-06-24):** built, **not yet run live** — pending the DataForSEO + Apollo REST keys (the in-session scan used the MCP tools; the unattended script uses REST). The first live run should confirm the AI-presence endpoint (see *Caveats*).

## The loop

```
seed leads (CSV and/or auto-pulled from the Google Business Profile DB)  →  Sanity (status: queued)
        ↓  daily cron, capped at --limit (default 100)
pick next N queued/errored  →  scan each  →  Sanity (status: scanned, + leaks + opener)
        ↓
cockpit reads scanned docs  ·  or --export to a cards JSON
```

Resumable and dedup'd (the Google CID is the doc id), so a 5,000-name list just drains 100/day until done. Re-running `--scan` retries `error` leads.

## Store

Sanity doc type **`precallLead`** (`sanity/schemas/precall-lead.ts`, registered in `index.ts` + `structure.ts` → visible in `/studio` under "Pre-call leads"). One doc per prospect: identity (name, GBP cid, city, phone, website), scan state (`queued` / `scanned` / `error`), the raw signals (gbp / mapPack / site / ai / owner), and the synthesized **`leaks[]` + `primaryLeak` + `opener`**.

## Keys (`.env.local`)

Reuses the existing Sanity vars (no new Sanity token). New REST secrets:

| Var | For | Required? |
|---|---|---|
| `DFS_LOGIN` / `DFS_PASSWORD` | DataForSEO REST — GBP, map-pack, site speed, AI presence | **Yes** (for `--scan` / `--seed-search`) |
| `APOLLO_API_KEY` | Apollo REST — owner's direct cell + email | Optional (paid-tier feature; scan works without it) |
| `DFS_AI_PATH` | Override the AI-presence endpoint path | Optional |

## Commands

```bash
node scripts/precall-scan.mjs --status                              # counts: queued / scanned / error
node scripts/precall-scan.mjs --seed-search scripts/precall.targets.json   # auto-pull leads by category+city
node scripts/precall-scan.mjs --seed-csv leads.csv --vertical dental       # import a CSV (cols: name,city,phone,website,…)
node scripts/precall-scan.mjs --scan --limit 100                   # ← the daily cron
node scripts/precall-scan.mjs --export --today --out cards.json    # ready-to-call cards (cockpit shape)
```

Add `--dry-run` to a seed to preview without writing. `scripts/precall.targets.json` is the example config (verticals → categories → cities with `lat,lng,radius_km` + optional `filters` / `order_by`).

**Daily cron** (drains 100/day):
```cron
0 7 * * *  cd /path/to/repo && node scripts/precall-scan.mjs --scan --limit 100 >> /tmp/precall.log 2>&1
```

## Leaks it detects → openers

| Leak | Signal | Severity |
|---|---|---|
| `no-website` | GBP has no site URL | high |
| `slow-site` | Lighthouse LCP > 3s or perf < 0.7 | high/med |
| `not-in-map-pack` | not in the top-3 local pack for "[trade] near me" | high |
| `ai-skip` | not named when AI is asked "best [trade] in [city]" | med |
| `few-reviews` | < 20 reviews while a neighbor has > 100 (trusted ratings only) | med |
| `thin-gbp` | ≤ 1 photo on the listing | low |

The sharpest leak (by severity) becomes `primaryLeak`; the opener is built from a per-leak, vertical-aware template in the operator voice. Every opener traces to a stored signal — nothing is invented.

## Cost (full scan, ~100/day)

Per prospect: ~1 GBP + 1 SERP + 1 Lighthouse + 1 AI (DataForSEO) + 1 Apollo enrich → ~5 calls × 100 ≈ **500 API calls/day**. Dial back via the per-vertical `limit` in the targets config, or trim the scan steps in `scanOne()`.

## Caveats

- **GBP rating artifact:** DataForSEO sometimes returns a placeholder `1★ / 1 review`. The scanner flags `gbp.ratingTrusted = false` and **never uses an untrusted rating** in a leak or opener (only no-site, slow-site, map-pack, AI, photo-count, and *trusted* review gaps).
- **AI-presence endpoint:** `DFS_AI_PATH` defaults to `ai_optimization/chat_gpt/llm_responses/live/advanced`. Confirm the exact path against DataForSEO docs on the first live run — it's best-effort and a failure there never blocks the rest of a scan (the lead is still scanned, just without the AI signal).
- **Not telephony:** the sharpest manual leak — calling the line and timing the callback — needs a phone layer (Twilio) and is out of scope here; keep it as the rep's manual step.
