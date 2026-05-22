# Screenshot Baseline — salesolution.net

Captured 2026-05-16 against production `https://salesolution.net` using Playwright (headless Chromium 148.0.7778.96).

## Inventory

| Viewport | Spec | PNGs | Size |
|----------|------|-----:|-----:|
| `desktop-1440/` | 1440 × 900, DPR 1, desktop UA | 18 | 32 MB |
| `tablet-768/` | 768 × 1024, DPR 2, desktop UA | 18 | 62 MB |
| `mobile-375/` | 375 × 812, DPR 2, mobile UA (iOS Safari) | 18 | 54 MB |
| **Total** | | **54** | **148 MB** |

Each PNG is a **full-page** screenshot (scrolled to bottom, then rolled back to top before capture).

Capture method: dismisses Complianz cookie banner before snapshot; waits for `domcontentloaded` + 8s networkidle; auto-scrolls to trigger lazy-loaded assets.

## URLs captured (18 priority)

1. `/` — home
2. `/services/` — service hub
3. `/services/ai-seo/`
4. `/services/content-writing-services/`
5. `/services/website-content-writing-packages/`
6. `/services/website-development-design-services/`
7. `/services/outbound-email-marketing-services/`
8. `/contact-me/`
9. `/unlock-growth-audit/`
10. `/future-proof-your-seo/`
11. `/book-growth-call/`
12. `/constraint-sprint/`
13. `/category/blog/`
14. `/generative-engine-optimization-basic-to-advanced/` (representative blog post)
15. `/guides/`
16. `/guide/website-launch-checklist-series-part-1-seo-and-crawling/` (representative guide)
17. `/career-paths/`
18. `/service-areas/`

## Files

- `_capture-report.json` — machine-readable record of every capture (URL, viewport, file path, byte size, any errors)
- `<viewport>/<safe-path>.png` — full-page screenshot

Filename rule: URL with leading/trailing `/` stripped and inner `/` replaced by `--`. Examples:
- `/` → `home.png`
- `/services/ai-seo/` → `services--ai-seo.png`
- `/guide/website-launch-checklist-series-part-1-seo-and-crawling/` → `guide--website-launch-checklist-series-part-1-seo-and-crawling.png`

## How to re-run

```bash
cd docs/strategy/scripts
node capture-screenshots.mjs
```

Outputs to `../screenshots/` and overwrites prior captures. The script lives in `docs/strategy/scripts/capture-screenshots.mjs` and is self-contained (npm package + Playwright installed there, not at project root).

## What to do with these

1. **Extract real design tokens** — done; see [../07-design-and-components.md §1](../07-design-and-components.md)
2. **Visual baseline** — keep a copy of `desktop-1440/` permanently as the "before" reference for the Next.js rebuild
3. **Side-by-side QA during rebuild** — when each Next.js page lands on staging, re-run the script against `staging.salesolution.net` (edit `BASE` in the script) and diff frame-by-frame
4. **Mobile-responsive verification** — `mobile-375/` is the canonical mobile reference; rebuild must match or exceed this layout

## Notes / observations

- `/services/` and `/services/ai-seo/` are visually identical at the byte-size level (`3682 KB` desktop, `5892 KB` tablet, `4489 KB` mobile) — confirming they are content-duplicate pages (flagged in [10-risks-and-open-questions.md](../10-risks-and-open-questions.md))
- The blog post and the guide are 8–9 MB each at tablet/mobile widths — both are very long-form (≥20 min read)
- `/career-paths/` is small (196 KB desktop) — confirms it's a thin hub page
