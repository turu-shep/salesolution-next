# Prompt: Extend llms.txt + audit AI-crawler access (dogfooding)

**Read `prompts/_CONTEXT.md` first.**

## Why
The glossary and the GEO Specialist path both tell distributors to (a) publish an `llms.txt` and
(b) make sure AI crawlers can actually reach their pages. We should do exactly what we sell —
it's cheap, on-brand, and a credibility signal. Be honest in copy: `llms.txt` adoption by major
engines is unconfirmed (Google declined it), so treat it as low-cost hygiene, not a ranking lever.

## Part A — llms.txt
1. A file already exists at **`public/llms.txt`** — read it first. Don't duplicate; extend/refresh.
2. Make it a clean Markdown index of the site's most important, citable pages: the service pages,
   the `/glossary/` hub + key term URLs, the `/career-paths/` hub + published paths, the framework
   page, top guides. Pull the live glossary/path slugs from Sanity (or from the sitemap) so the
   list is accurate and current. Group with short, plain descriptions.
3. Keep it in `public/` (this file SHOULD be web-served at `/llms.txt` — unlike `/prompts/`).

## Part B — AI-crawler access audit
1. Read `app/robots.ts` (and any middleware / headers config). Confirm the major AI crawlers are
   **not** blocked for the pages we want cited: GPTBot, OAI-SearchBot, ChatGPT-User (OpenAI),
   ClaudeBot, Claude-SearchBot (Anthropic), PerplexityBot, Perplexity-User, Google-Extended.
   Distinguish retrieval bots (fetch to ground live answers — must be allowed) from training bots
   (allow per the owner's preference; default allow for visibility).
2. Note any CDN/WAF-level blocking the codebase can't see (e.g. Cloudflare bot management) as a
   **manual check for the owner** — flag it, don't guess.
3. If `robots.ts` needs changes to allow retrieval crawlers, make the minimal edit; verify
   `curl http://localhost:3000/robots.txt` reflects it.

## Definition of done
- `public/llms.txt` updated with accurate current URLs; `curl http://localhost:3000/llms.txt` 200.
- `robots.txt` allows the AI retrieval crawlers for citable pages; report the before/after.
- A short note listing any WAF/CDN checks the owner must do manually.
- `next build` compiles.
