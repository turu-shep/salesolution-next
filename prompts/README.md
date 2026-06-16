# /prompts — local operator playbooks for the AI-search wiki

Reusable, self-contained task prompts for extending the glossary + career-path hub on
salesolution.net. Each file is a brief you hand to an AI coding agent running inside this repo.
They assume **no memory** of how the hub was built — they point the agent at the context it needs.

## Local-only — never web-served
This folder lives at the repo root (outside `public/` and `app/`), so Next.js never routes it,
**and** it's listed in `.vercelignore`, so it's excluded from the Vercel deployment entirely.
It IS committed to git (so it persists), but it never ships to the web. Use it locally only.

## How to use a prompt
1. Make sure the dev/work is happening **inside this repo** (the agent needs filesystem access).
2. Open the prompt file, copy its contents, and give it to the agent (e.g. Claude Code).
   Start every run by also telling the agent: **"Read `prompts/_CONTEXT.md` first."**
3. For `*.TEMPLATE.md` files: replace the `{{PLACEHOLDERS}}` before running, OR let a
   research/generator prompt fill them for you (see below).

## The generator pattern (prompts that write prompts)
Some prompts **research what to build, then emit ready-to-run prompts** by filling a template:
- `glossary/research-next-terms.md` → picks the next terms, then for each one emits a filled copy
  of `glossary/author-term.TEMPLATE.md`.
- `career-paths/research-next-path.md` → picks the next role, then emits a filled copy of
  `career-paths/author-path.TEMPLATE.md`.
So you run ONE research prompt, get back N concrete authoring prompts, and run those.

## Index
| Prompt | What it does |
|---|---|
| `_CONTEXT.md` | Shared backbone — read first, every time. |
| **glossary/** | |
| `glossary/research-next-terms.md` | Research + prioritize the next glossary terms; emit authoring prompts. |
| `glossary/author-term.TEMPLATE.md` | Template: author ONE glossary term draft. |
| `glossary/verify-and-publish-terms.md` | Adversarially fact-check term drafts, then publish. |
| **career-paths/** | |
| `career-paths/research-next-path.md` | Research which role/path to add next; emit an authoring prompt. |
| `career-paths/author-path.TEMPLATE.md` | Template: author ONE career-path draft. |
| `career-paths/voice-and-publish-path.md` | Revoice a path draft to operator register, then publish. |
| **interlinking/** | |
| `interlinking/glossary-into-content.md` | Link glossary terms from service/guide/blog pages. |
| `interlinking/path-and-glossary-cross-links.md` | Link paths ↔ services and paths ↔ glossary. |
| **foundations/** | |
| `foundations/llms-txt-and-ai-crawler-audit.md` | Extend `public/llms.txt` + audit AI-crawler access (dogfooding). |
| **revenue-seo/** (separate from the hub — money pages; tracked in Linear project "SS SEO") | |
| `revenue-seo/geo-agency-service-page.md` | Target "geo agency" on the AI-SEO service page (SAL-404). |
| `revenue-seo/connect-gsc-and-analytics.md` | Connect GSC + web analytics so the site is measurable (SAL-405). |
| `revenue-seo/ai-visibility-brand-radar.md` | Set up AI-visibility / Brand Radar tracking (SAL-406). |

## Suggested order
1. `foundations/llms-txt-and-ai-crawler-audit.md` + `interlinking/*` — activates what's already live.
2. `revenue-seo/connect-gsc-and-analytics.md` — so anything is measurable.
3. `revenue-seo/geo-agency-service-page.md` — highest revenue relevance.
4. `glossary/research-next-terms.md` → author → `verify-and-publish-terms.md` — grow the glossary.
5. `career-paths/research-next-path.md` → author → `voice-and-publish-path.md` — grow the paths.
