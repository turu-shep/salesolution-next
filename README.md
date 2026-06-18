# Sale Solution

The website and content system for [Sale Solution](https://salesolution.net), a small operator-led firm doing SEO, GEO (generative engine optimization), and AI-search-readiness for B2B clients. Built on Next.js (App Router) + Sanity (Portable Text).

The site sells two things across three verticals:

- **Services** for industrial / technical-distribution e-commerce (six services at `/services/*`), sold to owners of $5M–$75M distributors and manufacturers.
- **The Revenue Engine** — a productized monthly system for local-service businesses (home-services contractors and dental practices) that captures leads, books jobs, and proves the revenue.

The business is mid-pivot from industrial-only to this multi-vertical shape, so expect some pages and copy to still read industrial-only.

## Working in this repo (humans and AI agents)

Read **[AGENTS.md](AGENTS.md)** first. It's the context map: what the business is, the three ICPs, the content engine at `.engine`, the prompt library, where search/analytics data lives, and the landmines to avoid before you ship. The deeper strategy lives in `docs/strategy/`, and the brand voice + positioning source of truth is `.agents/product-marketing-context.md`.

This is a non-standard Next.js version — read the relevant guide in `node_modules/next/dist/docs/` before writing app code.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Content scripts run with `node scripts/<name>.mjs` (env auto-loads from `.env.local`). See `prompts/_CONTEXT.md` for the Sanity authoring and publishing workflow.
