# Prompt: Set up AI-visibility / Brand Radar tracking (Linear SAL-406)

**Read `prompts/_CONTEXT.md` first.** Measurement task, separate from the hub. Linear "SS SEO" **SAL-406**.

## Why
The hub is measured on **AI citations + referring domains**, not leads. To track AI visibility we
need a recurring prompt panel run against the engines and reported over time. This was deferred at
build time to conserve Ahrefs units — it's a measurement-config task, not a data pull.

Context that justifies it: citation no longer requires ranking (only ~12% of AI-cited URLs rank
Google top-10), and AI Overviews fire on nearly all our target terms — so AI-answer presence is
the real KPI.

## Do this
Mostly Ahrefs Brand Radar (or equivalent: Profound, Otterly) account configuration — flag what
needs the owner's account. The agent can draft the prompt panel and a tracking/reporting plan.

1. **Define the prompt panel** — the fixed set of buyer questions to track monthly. Cover:
   - **Commercial / revenue:** "best GEO agency", "GEO agency for industrial e-commerce",
     "AI search agency for distributors", "who optimizes product catalogs for AI search".
   - **Brand:** "Sale Solution" mentions across ChatGPT / Perplexity / Google AI Overviews / Gemini.
   - **Concept / authority (the hub):** "what is citation engineering", "what is generative engine
     optimization", "how do industrial distributors show up in AI search", plus a few glossary-term
     definitional prompts.
   - **Industrial buyer prompts** (from `docs/strategy/career-path/04-niches.md`): cross-reference /
     interchange / spec questions a distributor's buyers would ask.
2. **Set up tracking** in Brand Radar (or note the exact steps for the owner if account access is
   needed): add the prompts/competitors, set the cadence, capture a baseline.
3. **Define the report:** mention rate, citation share, AI share of voice vs named competitors,
   tracked monthly. Note where the baseline lands.

## Definition of done
- A written prompt panel (the four buckets above) ready to paste into Brand Radar.
- The tracking setup done, or a precise owner checklist if it needs account access.
- A baseline snapshot if obtainable.
- Update Linear SAL-406. Reference: `docs/strategy/career-path/07-research-backlog.md` §1.
