---
name: no-hardcoded-secrets
files: ["**/*"]
enforcement: block
triggers: ["implement", "ship", "batch"]
requires: ["no-hardcoded-secrets"]
---

# Policy: No hardcoded secrets in committed files

## Why this policy exists
A committed secret is a compromised secret — rotation is the only fix, and git history keeps it visible forever. This catches the most common leak patterns at commit time. This repo carries many live keys in `.env.local` (Sanity write token, Anthropic, DataForSEO, Resend, Smartlead, Apollo) — none of them may appear in tracked files.

## What it requires
Before committing, scan the diff for patterns that look like secrets:
- API keys: strings matching common prefixes (`sk_`, `sk-ant-`, `pk_live_`, `AIza`, `ghp_`, `xox[baprs]-`, `AKIA`, `re_`)
- Passwords or tokens in string literals assigned to variables named `password`, `secret`, `token`, `api_key`, `apikey`
- Base64 blobs >100 chars assigned to env-like variable names
- Private keys: `-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----`

## How to satisfy it
- Move secrets to `.env.local` (documented in `.env.local.example`)
- Reference them via `process.env.VAR_NAME`
- If the secret is genuinely meant to be public (e.g. a Sanity project ID, a GA4 measurement ID, a Turnstile site key), confirm with the user and log as an override

## How to verify
Grep the diff for the patterns above. Fail the commit if any match AND the file being changed is not:
- A test file (may contain fake/mock secrets)
- `.env.local.example` or similar documentation file
- A README or docs file showing example usage

## Override
Allowed for genuinely public identifiers (NEXT_PUBLIC_ values, project IDs, publishable keys). Override with `override policy no-hardcoded-secrets` and the decision log entry must note which value and why it's safe to commit.
