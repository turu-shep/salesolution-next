# Trusted-Source Allowlist — Sale Solution brand pack

Consumed by the statistical-claim audit + `analyze_article.py`
(`project.yaml -> brand.trusted_sources`).

> Rule: only cite sources listed here. If no allowlisted source supports a
> specific number, soften the claim or cut it. Never fabricate a number, quote,
> or citation.

## Allowlist

Niche: AI search visibility (AEO/GEO), SEO, and B2B / industrial e-commerce growth.

| Source | Domain | Use for |
|--------|--------|---------|
| Google Search Central | developers.google.com | Official ranking, indexing, structured-data, and AI-feature guidance |
| Google (Search/Blog) | blog.google, google.com | AI Overviews, Search announcements, feature rollouts |
| Statista | statista.com | Market size, channel adoption, AI-usage statistics |
| McKinsey | mckinsey.com | B2B buying behavior, AI adoption, productivity research |
| Forrester | forrester.com | B2B buyer research, martech maturity |
| Gartner | gartner.com | B2B buying journeys, martech / search trends |
| Pew Research | pewresearch.org | Consumer/tech/AI-usage statistics |
| Forbes | forbes.com | Business + marketing trend reporting |
| Ahrefs | ahrefs.com | SEO/SERP data studies, AI Overview citation research |
| Semrush | semrush.com | Keyword, traffic, and market studies |
| Backlinko | backlinko.com | Original SEO ranking-factor studies |
| Search Engine Land | searchengineland.com | Industry reporting on search + AI search |
| Search Engine Journal | searchenginejournal.com | Industry reporting on search + AI search |
| Nielsen Norman Group | nngroup.com | UX and reading-behavior research |
| HubSpot | hubspot.com | B2B marketing + lead-gen benchmarks |
| Content Marketing Institute | contentmarketinginstitute.com | B2B content benchmarks |

## Machine-readable domains (mirror `analyze_article.py` AUTHORITATIVE_DOMAINS)

> Caveat: the analyzer's `AUTHORITATIVE_DOMAINS` list is **hardcoded in
> `analyze_article.py` and not configurable** from this file. For Sale Solution's
> niche, only the overlapping entries below (`statista`, `mckinsey`, `bain`,
> `forbes`, `pewresearch`, `gallup`, `trends.google`, `.gov`, `.edu`) earn the
> analyzer's "authoritative citation" points. The SEO-trade and Google-docs
> sources are policy-trusted (they pass the human claim audit) but do NOT score
> in the analyzer. To make the rest count, patch the engine's list upstream.

```yaml
authoritative_domains:
  # --- scored by analyze_article.py today ---
  - .gov
  - .edu
  - statista.com
  - mckinsey.com
  - bain.com
  - forbes.com
  - pewresearch.org
  - gallup.com
  - trends.google.com
  # --- niche-trusted (policy only; NOT scored until the engine list is patched) ---
  - developers.google.com
  - blog.google
  - forrester.com
  - gartner.com
  - ahrefs.com
  - semrush.com
  - backlinko.com
  - searchengineland.com
  - searchenginejournal.com
  - nngroup.com
  - hubspot.com
  - contentmarketinginstitute.com
```

## Expert quotes

1. Real named expert quotes (best) — attributed by name + role.
2. Published industry interviews — quote real people, link the source.
3. Otherwise don't quote.

## Disclaimers (operational transparency, not legal boilerplate)

- AI-search visibility is measured, not promised: we track citations and answer
  presence (Ahrefs Brand Radar) alongside Google Search Console, and report what
  moved. Rankings and AI-answer inclusion depend on the engines and are never guaranteed.
