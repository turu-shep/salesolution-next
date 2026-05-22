---
name: no-hardcoded-secrets
files: ["**/*"]
enforcement: block
triggers: ["implement", "ship", "batch"]
requires: ["no-hardcoded-secrets"]
---

# Policy: No hardcoded secrets in committed files

## Why this policy exists
A committed secret is a compromised secret — rotation is the only fix, and git history keeps it visible forever. This catches the most common leak patterns at commit time.

## What it requires
Before committing, scan the diff for patterns that look like secrets:
- API keys: strings matching common prefixes (`sk_`, `pk_`, `AIza`, `ghp_`, `xox[baprs]-`, `AKIA`)
- Passwords or tokens in string literals assigned to variables named `password`, `secret`, `token`, `api_key`, `apikey`
- Base64 blobs >100 chars assigned to env-like variable names
- Private keys: `-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----`

## How to satisfy it
- Move secrets to `.env.local` (or the project's env file)
- Reference them via `process.env.VAR_NAME` / `os.environ['VAR_NAME']` / equivalent
- If the secret is genuinely meant to be public (e.g. a Stripe publishable key), confirm with the user and log as an override

## How to verify
Grep the diff for the patterns above. Fail the commit if any match AND the file being changed is not:
- A test file (may contain fake/mock secrets)
- A `.env.example` or similar documentation file
- A README or docs file showing example usage

## Override
Allowed for genuinely public keys (publishable keys, OAuth client IDs). Override with `override policy no-hardcoded-secrets` and the decision log entry must note which secret and why it's safe to commit.
