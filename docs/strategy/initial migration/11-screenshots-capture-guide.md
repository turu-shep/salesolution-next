# Screenshot Capture Playbook

> **Status:** Initial baseline captured 2026-05-16. 54 PNGs (18 URLs × 3 viewports) under [screenshots/](screenshots/). The Playwright script is at [scripts/capture-screenshots.mjs](scripts/capture-screenshots.mjs).
>
> This doc is kept as the playbook for re-runs (e.g., capturing the Next.js staging build for side-by-side diffing) and for capturing the secondary URLs not in the initial priority list.

The strategy research used `WebFetch`, which extracts structured text from HTML. It does **not** capture pixel screenshots. To finalize the design system and visual parity work, full-page screenshots must be captured locally — this playbook tells you exactly how.

## 1. Why this matters

The Tailwind tokens (colors, type, radius, shadows) and the comparison "before/after" diffs during the rebuild all depend on having canonical visual baselines. Without them:

- The design system is guesswork
- Visual regression testing has nothing to compare against
- The "is this faithful to the current site?" question has no objective answer

## 2. What to capture

For each URL listed in the table below, capture **four screenshots**:

| Viewport | Width × Height (initial) | Use case |
|----------|--------------------------|----------|
| Desktop wide | 1440 × 900 | Standard laptop |
| Desktop narrow | 1024 × 768 | Small laptop / large tablet |
| Tablet | 768 × 1024 | iPad portrait |
| Mobile | 375 × 812 | iPhone width |

For each viewport, capture **full-page** (scroll the entire page, not just the viewport).

Save as: `screenshots/<viewport>/<safe-path>.png`

E.g. `screenshots/desktop-1440/services--ai-seo.png`

## 3. URLs to capture (priority order)

Top priority — the visual system is set here:

1. `/`
2. `/services/`
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
16. `/guides/website-launch-checklist-series-part-1-seo-and-crawling/` (representative guide)
17. `/career-paths/`
18. `/service-areas/`

Secondary — capture if time permits:

- All remaining blog posts (18)
- All remaining guides (8)
- Legal pages (5)
- Thank-you pages (2)

## 4. Recommended tools

### Option A — Playwright script (recommended for completeness)

Best for repeatable, scriptable capture across all URLs and viewports in one run.

Create `scripts/capture-screenshots.mjs`:

```js
import { chromium, devices } from 'playwright'
import fs from 'node:fs/promises'

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'tablet-768',   width: 768,  height: 1024 },
  { name: 'mobile-375',   width: 375,  height: 812, isMobile: true },
]

const URLS = [
  '/', '/services/', '/services/ai-seo/',
  '/services/content-writing-services/',
  '/services/website-content-writing-packages/',
  '/services/website-development-design-services/',
  '/services/outbound-email-marketing-services/',
  '/contact-me/', '/unlock-growth-audit/', '/future-proof-your-seo/',
  '/book-growth-call/', '/constraint-sprint/',
  '/category/blog/',
  '/generative-engine-optimization-basic-to-advanced/',
  '/guides/',
  '/guide/website-launch-checklist-series-part-1-seo-and-crawling/',
  '/career-paths/', '/service-areas/',
]

const BASE = 'https://salesolution.net'

const browser = await chromium.launch()
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile ?? false,
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  for (const url of URLS) {
    const safe = url.replace(/^\//, '').replace(/\//g, '--').replace(/-+$/, '') || 'home'
    const out = `screenshots/${vp.name}/${safe}.png`
    await fs.mkdir(`screenshots/${vp.name}`, { recursive: true })
    await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 60000 })
    // Dismiss cookie banner if present
    await page.locator('button:has-text("Accept"), button:has-text("Agree")').first().click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(1000)
    await page.screenshot({ path: out, fullPage: true })
    console.log('✓', out)
  }
  await ctx.close()
}
await browser.close()
```

Run:

```bash
pnpm dlx playwright install chromium
node scripts/capture-screenshots.mjs
```

### Option B — Browser DevTools (manual, slow)

In Chrome: DevTools → toggle device toolbar → set width → Cmd+Shift+P → "Capture full size screenshot."

### Option C — `shot-scraper` (good middle ground)

```bash
pipx install shot-scraper
shot-scraper install
shot-scraper https://salesolution.net/ --width 1440 -o home-desktop.png
```

Loops over URLs cleanly with YAML config.

## 5. Asset capture (separate from screenshots)

These are source assets, not visual references:

- [ ] **Logo SVG** — view-source on homepage `<header>`, save the inline SVG or the `<img src>` target
- [ ] **All client logo SVGs/PNGs** — request originals from clients if rasters look bad on Retina
- [ ] **Hero illustrations / patterns** — download from `/wp-content/uploads/...`
- [ ] **Phase-framework illustration** — likely a single SVG or PNG
- [ ] **Author photo (Artur)** — replace Gravatar with a self-hosted version
- [ ] **Favicon set** — already exists; pull from `/wp-content/uploads/.../cropped-android-chrome-512x512-2-270x270.png` and re-derive a clean set with [realfavicongenerator.net](https://realfavicongenerator.net)

## 6. Extract design tokens

With screenshots in hand, capture exact values:

| Token | How to capture |
|-------|----------------|
| Brand primary color | Use ColorSync / digital color meter on a primary button |
| Brand accent color | Same, on an accent element |
| Heading font family | DevTools → Computed → `font-family` on the H1 |
| Body font family | DevTools → Computed on a `<p>` |
| Heading sizes | DevTools → Computed → `font-size` per heading level |
| Border-radius | DevTools → Computed on a card or button |
| Shadow values | DevTools → Computed `box-shadow` on cards |
| Section padding | DevTools → measure space between sections |

Fill these into `tailwind.config.ts` and `styles/globals.css` `@theme` block (see [07-design-and-components.md](07-design-and-components.md#2-tailwind-token-mapping)).

## 7. Storage and review

- Commit screenshots to a separate Git LFS-tracked folder or store in cloud (S3, Drive) — full-page PNGs can be large
- Generate a markdown gallery (one image per URL × viewport in a grid) for stakeholder review
- After the rebuild, re-run the same capture script against `staging.salesolution.net` and produce a side-by-side comparison sheet

## 8. Use during rebuild

For each page rebuilt in Phase 2 of the migration plan:

1. Open the captured screenshot
2. Build the Next.js page
3. Compare side-by-side at the same viewport
4. Iterate until visual parity is acceptable (not pixel-perfect — the new design system may improve things, but no major surprises)
5. Sign off with Artur per template type

This is the only way to ensure the rebuild faithfully replaces the current visual experience without my having had eyes on the actual pixels.
