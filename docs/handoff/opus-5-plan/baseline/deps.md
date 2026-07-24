# Baseline — dependency and supply-chain state

**Measured:** 2026-07-24 · `pnpm audit` at commit `dd66f3c` · **Measured by:** fable-5 (phase 0)

## Advisory totals

**67 vulnerabilities: 1 critical · 26 high · 29 moderate · 11 low.**

Distinct packages with advisories (deduped; severity = worst advisory for that package):

| Severity | Package | Advisory (short) | Risk class |
|---|---|---|---|
| **critical** | tar | Decompression/parse DoS via unlimited input | Build/CLI-time (Sanity CLI / sharp install chains) — not in request path |
| high | **next** | **Middleware/proxy bypass in App Router using Turbopack** — the production build here IS Turbopack (`next build` output confirms; only dev is pinned to webpack). Repo has no `middleware.ts` (auth gates live in layouts/routes), which may neutralize it — **lens A must verify affected versions vs 16.2.6 and whether no-middleware means no exposure.** | Runtime |
| high | next | Cache confusion of response bodies for requests with bodies (moderate) | Runtime |
| high | undici | TLS certificate validation bypass via dropped requestTls; + header injection (mod), response-queue poisoning (low) | Runtime (fetch stack) |
| high | sharp | Inherited libvips CVEs (CVE-2026-33327/8/…) | Runtime (OG images) |
| high | form-data | CRLF injection via unescaped multipart field names | Runtime-adjacent |
| high | ws | Memory-exhaustion DoS from tiny fragments | Dev/tooling (playwright/sanity chains) |
| high | linkify-it, markdown-it | Quadratic complexity DoS | Studio/editor chain |
| high | js-yaml | YAML merge-key quadratic CPU (+ prototype pollution, mod) | Tooling |
| high | vite, esbuild | fs.deny bypass (Windows), dev-server file read | Dev-only (Sanity toolchain) |
| high | adm-zip | 4GB allocation from crafted ZIP | Tooling |
| high | brace-expansion, fast-uri, postcss | DoS / host confusion / arbitrary file read | Build-time |
| moderate | dompurify (3.4.5) | IN_PLACE + cross-realm sanitization bypasses | Studio chain (isomorphic-dompurify via sanity) |
| moderate | uuid, json-2-csv, valibot, @opentelemetry/core, launch-editor | assorted | Mixed, mostly tooling |
| low | @babel/core, esbuild, undici, dompurify | assorted | Tooling |

Full verbatim output: `pnpm audit` (session scratchpad `audit.json`). No advisory currently patched-upstream is being blocked by a pin we control — most paths run through `sanity@5.26.0` / `next@16.2.6` majors.

## Pinned versions (drift reference)

| Package | package.json | Installed |
|---|---|---|
| next | 16.2.6 (exact) | 16.2.6 |
| react / react-dom | 19.2.4 (exact) | 19.2.4 |
| @anthropic-ai/sdk | ^0.110.0 | (workspace) |
| sanity | ^5.26.0 | 5.26.0 |
| next-sanity | ^12.4.5 | 12.4.5 |
| node-html-parser | ^7.1.0 | 7.1.0 |
| marked | ^18.0.5 | 18.0.5 |
| zod | ^4.4.3 | — |
| sharp | ^0.35.2 | — |
| playwright | ^1.60.0 (devDep) | — |

## Past the advisory feed

- **Server-side parsers of untrusted input:** `node-html-parser@7.1.0` and `marked@18.0.5` both parse **fetched third-party page content** in the probe path (`lib/probe/*`). Neither carries a current advisory, but they are a different risk class from build-time deps — a parser DoS = probe outage + serverless bill. Lens A/C should look at input-size discipline around them (the fetch layer's 2MB cap is the main guard).
- **Runtime past EOL:** local Node v20.16.0 — Node 20 maintenance ended 2026-04-30; npm 11.5.2 explicitly warns it doesn't support this Node. Vercel's runtime setting needs checking separately (dashboard, not repo).
- **Unused heavyweight devDep:** `playwright@^1.60.0` sits in devDependencies with **zero** spec files or config in the repo (tests map confirms no E2E anywhere). Either wire it up (wave 3 wants browser tests anyway) or drop it.
- **Two consent-management stacks** load on `/book-growth-call/` (ketch + Optanon, per Lighthouse entity detection) — third-party, via the Calendly/HubSpot chain, not package.json. Lens B question.
- Nothing was upgraded, per phase 0 rules.
