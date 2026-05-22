# Design Tokens — salesolution.net (extracted from production)

**Extracted:** 2026-05-16 via headless Chromium computed-style sampling.
**Source:** [docs/strategy/design-tokens.json](design-tokens.json) (full raw output, 77 KB).
**Script:** [scripts/extract-tokens.mjs](scripts/extract-tokens.mjs) — rerun any time.

Sampling covered 8 representative pages at 1440 × 900: home, services hub, `/services/ai-seo/`, content-writing-packages, contact-me, future-proof-your-seo, blog hub, and one long post. Every element with `display !== none` was walked; values are aggregated by frequency and total pixel area.

---

## 1. Colors

### 1.1 Brand & accent

| Hex | Role | Where it's used |
|-----|------|-----------------|
| `#2652ef` | **Primary CTA blue** | "Get Your Free Growth Audit" pill (38 instances, 565k px² total area) — the dominant action color |
| `#4169e1` | Royal-blue link accent | inline link styling in copy |
| `#09bc8a` | **Alt CTA green** | "Book My Strategy Call" (services page) — secondary CTA |
| `#9826ef` | **Alt CTA purple** | "Book My Strategy Call" variant on `/services/website-content-writing-packages/` |
| `#edf1ff` | Carousel-arrow background | circular nav buttons on carousels |

> The site runs **three competing primary-CTA colors** (blue, green, purple) across pages. Lock to ONE primary in the rebuild — recommend `#2652ef` since it's the dominant area-wise.

### 1.2 Surface neutrals

| Hex | Role | Total area |
|-----|------|-----------:|
| `#ffffff` | Page background | 28,775k px² |
| `#050c23` | **Dark band / footer** | 8,594k px² |
| `#f7f7f7` | Framework phase cards | 2,718k px² |
| `#f9f9ff` | Accordion item bg (subtle blue tint) | 1,744k px² |
| `#f3f5ff` | Custom-package callout, pagination | 550k px² |
| `#f8fafc` | "Your Revenue at Risk" result widget | 355k px² |
| `#f9f9f9` | Form input bg, radio cards | 123k px² |
| `#f5f9ff` | Icon block background | 62k px² |

### 1.3 Semantic tints

| Hex | Role |
|-----|------|
| `#fff8f8` | "Challenge" labels (declining traffic etc.) — red-tinted soft |
| `#fef2f2` | Concern icons (pain points) — red-tinted soft |
| `#ff4242@0.02` | "May 2027 Paid Slots" single-block warning |

### 1.4 Text

| Hex | Role | Uses |
|-----|------|-----:|
| `#404040` | **Body text** (default) | 2,313 |
| `#1c1c1c` | H2/H3, links | 605 |
| `#212529` | Some heading variants (Bootstrap default `$dark`) | 314 |
| `#131415` | **H1 specifically** | 146 |
| `#69778b` | Muted body / lede paragraphs | 195 |
| `#737d9d` | Footer copy, less-emphasized info | 96 |
| `#505356`, `#525256` | Metadata (dates, read time) | 34, 30 |
| `#6b7280` | Tailwind-gray-500 paragraph (mixed in from some blocks) | 23 |
| `#374151` | Tailwind-gray-700 list items | 18 |
| `#ffffff` | Text on dark CTAs and footer | 108 |

> The text color set is **inconsistent**. Body is `#404040`, but headings range across `#1c1c1c`/`#131415`/`#212529`. In the rebuild collapse to a 3-step ramp.

---

## 2. Typography

### 2.1 Font families in use

| Family | Role | Total uses | Sizes (px) |
|--------|------|----------:|------------|
| **Circular Std** | Display / headings | 327 | 14, 16, 18, 20, 24, 32, 36, 48 |
| **Circular Std Book** | H1 specifically | 14 | 14, 16, **60** |
| **Inter** | UI / secondary body (loaded from Google Fonts) | 1,130 | 11, 12, 13, 13.5, 14, 15, 16, 18 |
| Syne | Special display moments (some hero variants) | 20 | 40, 56 |
| "Open Sans" | Marginal | 30 | 16 |
| Arial fallback | Marginal | 52 | 16 |
| System sans (`-apple-system, ...`) | Default cascade fallback | 2,663 | 13–36 |

**Imports observed (homepage):**
- `https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap`
- Circular Std is self-hosted (no Google Fonts URL) — must be brought over to Next.js with the original font files

**Decision needed:** Circular Std is **commercial** (Lineto). Confirm the existing license covers self-hosting. If not, the rebuild needs either (a) the license renewed for the Next.js host, or (b) a free alternative such as **Manrope**, **Switzer**, or **Public Sans Bold** which are visually adjacent.

### 2.2 Heading scale (observed)

| Element | Size / line-height | Weight | Font | Frequency |
|---------|-------------------|--------|------|----------:|
| H1 (most pages) | **60px / 68px** | 500 | Circular Std Book | 4 |
| H1 alt | 56px / 61.6px | 700 | Circular Std | 2 |
| H1 alt | 48px / 57.6px | 500 | Circular Std | 1 |
| H1 alt | 40px / 48px | 600 | Circular Std | 1 |
| H2 standard | **36px / 46.8px** | 500 | Circular Std | 37 |
| H2 hero variant | 60px / 68px | 500 | Circular Std | 11 |
| H2 alt | 40px / 48px | 600 | Circular Std | 10 |
| H2 alt | 56px / 62px | 500 | Circular Std | 1 |
| H3 emphasis | 30px / 39px | 600 | Circular Std | 28 |
| H3 standard | 24px / 31.2px | 500 | Circular Std | 26 |
| H3 large | 36px / 46.8px | 500 | Circular Std | 12 |
| H3 mid | 20px / 30px | 500 | Circular Std | 52 |
| H4 standard | **18px / 23.4px** | 500 | Circular Std | 66 |
| H4 alt | 20px / 26px | 500 | Circular Std | 6 |
| Body | 16px / 24px | 400 | system sans / Inter | (default) |

> Multiple H1/H2 sizes coexist — typical WP-page drift. Collapse to a single ramp in the rebuild.

### 2.3 Proposed clean type ramp for Next.js

| Token | Desktop | Mobile | Weight | Use |
|-------|--------:|-------:|------:|-----|
| `--text-display` | 60 / 68 | 40 / 48 | 500 | Hero H1 |
| `--text-h1` | 48 / 56 | 32 / 40 | 600 | Page H1 |
| `--text-h2` | 36 / 46 | 28 / 36 | 600 | Major section heading |
| `--text-h3` | 24 / 32 | 22 / 30 | 600 | Sub-section heading |
| `--text-h4` | 18 / 26 | 18 / 26 | 600 | Card titles, FAQ questions |
| `--text-body` | 16 / 26 | 16 / 26 | 400 | Default body |
| `--text-lede` | 18 / 28 | 17 / 26 | 400 | Hero sub, intro paragraphs |
| `--text-small` | 14 / 20 | 14 / 20 | 400 | Metadata, footer |
| `--text-xs` | 12 / 18 | 12 / 18 | 500 | Eyebrow, badge |

---

## 3. Border radii

| Value | Uses | Where |
|-------|-----:|-------|
| **8px** | 83 | Primary buttons (canonical) |
| 16px | 60 | Feature cards |
| 50% | 45 | Circular check icons, carousel arrows |
| 12px | 43 | Service icon containers |
| 6px | 30 | Subtitle/badge pills, "challenge" labels |
| 24px | 18 | Framework phase cards |
| 33px | 13 | Tag-cloud chips |
| 50px | 6 | Newsletter pill input/button |
| 4px / 3px | 4 / 3 | Form inputs |

**Proposed clean radius scale:**

```
--radius-sm:    6px   (badges, chips)
--radius-md:    8px   (buttons, inputs)
--radius-lg:    16px  (cards)
--radius-xl:    24px  (large framework cards)
--radius-pill:  9999px (newsletter / category pills)
--radius-full:  50%   (circular icons, avatars)
```

---

## 4. Shadows

| Recipe | Uses | Use case |
|--------|-----:|----------|
| `0 10px 40px rgba(0,0,0,0.08)` | 8 | **Default card shadow** |
| `0 15px 50px rgba(0,0,0,0.12)` | 3 | Elevated card / hover state |
| `0 8px 24px rgba(0,0,0,0.05)` | 3 | Soft card |
| `0 4px 20px rgba(0,0,0,0.08)` | 3 | Flat card |
| `0 20px 50px rgba(0,0,0,0.08)` | 1 | Hero card / modal |
| `0 10px 30px rgba(0,0,0,0.08)` | 1 | Mid card |
| `0 4px 12px rgba(0,0,0,0.08)` | 1 | Tight elevation |
| `0 8px 24px rgba(0,0,0,0.12)` | 1 | Pricing-tier feature |
| `0 4px 12px rgba(38,82,239,0.25)` | 1 | **Blue-tinted CTA glow** (matches `#2652ef`) |
| `0 4px 12px rgba(38,82,239,0.1)` | 1 | Lighter blue-tinted CTA hover |
| `0 2px 4px rgba(16,185,129,0.2)` | 1 | Green-tinted CTA glow (Tailwind emerald-500) |

**Proposed clean shadow scale:**

```
--shadow-sm:    0 4px 12px rgba(0,0,0,0.06)
--shadow-md:    0 10px 40px rgba(0,0,0,0.08)
--shadow-lg:    0 15px 50px rgba(0,0,0,0.12)
--shadow-cta:   0 4px 12px rgba(38,82,239,0.25)  /* color-coupled to primary */
```

---

## 5. Buttons (canonical specs from CTAs found)

| Variant | bg | text | radius | padding | observed example |
|---------|----|------|--------|---------|------------------|
| **Primary (canonical)** | `#2652ef` | `#ffffff` | `8px` | `12px 24px` | "Get Your Free Growth Audit" |
| Primary (lg) | `#2652ef` | `#ffffff` | `8px` | `16px 24px` | "Get your free AI-Readiness Assessment" |
| Primary (sm) | `#2652ef` | `#ffffff` | `8px` | `8px 16px` | "See our Content Packages" |
| Primary (form) | `#2652ef` | `#ffffff` | `8px` | `14px 24px` | "Continue" |
| Alt green | `#09bc8a` | `#ffffff` | `8px` | `16px 24px` | "Book My Strategy Call" |
| Alt purple | `#9826ef` | `#ffffff` | `6px` | `16px 24px` | "Book My Strategy Call" |
| Pill (newsletter) | `#2652ef` | `#ffffff` | `50px` | `12px 28px` | "Send me the checklist + weekly updates" |
| Circular icon | `#edf1ff` | `#404040` | `50%` | `0` | carousel arrows |

> Standardize on **Primary blue `#2652ef` at radius 8** for the rebuild. The green/purple alt CTAs are inconsistent across pages and don't reinforce the brand.

---

## 6. Form inputs

| Property | Value |
|----------|-------|
| Background | `#ffffff` or `#f9f9f9` (radio cards) |
| Border radius | `3px` / `4px` / `8px` (inconsistent) |
| Text color | `#111827` (Tailwind gray-900) or `#666666` |
| Placeholder | `#92979b` |

**Recommendation:** unify input radius to `8px`, border `1px solid #92979b`, focus ring `0 0 0 3px rgba(38,82,239,0.2)`.

---

## 7. Proposed Tailwind v4 `@theme` block

Drop into `styles/globals.css` once the Next.js project starts:

```css
@theme {
  /* ─── Color: brand ─── */
  --color-brand-50:   #f0f4ff;
  --color-brand-100:  #f3f5ff;     /* observed: custom-package callout */
  --color-brand-200:  #edf1ff;     /* observed: circular nav arrows */
  --color-brand-300:  #c8d2ff;
  --color-brand-500:  #4169e1;     /* observed: link accent */
  --color-brand-600:  #2652ef;     /* observed: PRIMARY CTA */
  --color-brand-700:  #1e3fcc;
  --color-brand-900:  #050c23;     /* observed: footer + dark CTA */

  /* ─── Color: semantic ─── */
  --color-success:    #09bc8a;     /* observed: alt green CTA */
  --color-danger-50:  #fef2f2;     /* observed: concern icons */
  --color-danger-100: #fff8f8;     /* observed: challenge labels */
  --color-danger-600: #ff4242;
  --color-warning-50: #fff8e8;

  /* ─── Color: surface ─── */
  --color-surface:           #ffffff;
  --color-surface-alt:       #f7f7f7;
  --color-surface-tint-blue: #f9f9ff;
  --color-surface-tint-cool: #f5f9ff;
  --color-surface-tint-warm: #fff8f8;
  --color-surface-dark:      #050c23;

  /* ─── Color: text ─── */
  --color-text-900: #131415;       /* observed: H1 */
  --color-text-800: #1c1c1c;       /* observed: H2/H3, primary links */
  --color-text-700: #404040;       /* observed: body */
  --color-text-500: #69778b;       /* observed: muted body */
  --color-text-400: #737d9d;       /* observed: footer copy */
  --color-text-300: #92979b;       /* observed: input placeholder */
  --color-text-inverse: #ffffff;

  /* ─── Typography ─── */
  --font-display: "Circular Std", "Manrope", system-ui, sans-serif;
  --font-sans:    "Inter", system-ui, sans-serif;

  /* ─── Radii ─── */
  --radius-sm:    6px;
  --radius-md:    8px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-pill:  9999px;

  /* ─── Shadows ─── */
  --shadow-sm:    0 4px 12px rgba(0,0,0,0.06);
  --shadow-md:    0 10px 40px rgba(0,0,0,0.08);
  --shadow-lg:    0 15px 50px rgba(0,0,0,0.12);
  --shadow-cta:   0 4px 12px rgba(38,82,239,0.25);
}
```

---

## 8. What to flag for cleanup (not blockers, just visible drift)

1. **Three competing primary CTAs** — blue `#2652ef`, green `#09bc8a`, purple `#9826ef`. Pick one.
2. **H1 size + weight varies** across 4 combinations (60/500, 56/700, 48/500, 40/600). Pick one canonical H1.
3. **H2 size varies** across 6 combinations from 24px to 60px. Pick a 2-step scale (regular vs. hero).
4. **Border radius is all over the map** — 3, 4, 6, 8, 12, 16, 24, 33, 50, 60px. Collapse to 5 tokens.
5. **Body text shades** — `#404040`, `#69778b`, `#505356`, `#525256`, `#737d9d` all appear in similar contexts. Pick 2 (primary + muted).
6. **Bootstrap `#212529` leak** — some blocks still use Bootstrap's default `$dark`. Cleaner sweep in the rebuild.
7. **System-sans fallback used 2,663 times** — most elements have no explicit font, falling back to OS default. Setting `body { font-family: var(--font-sans) }` once fixes this everywhere.
8. **Tailwind grays `#6b7280`, `#374151` leak in** — some blocks were authored with Tailwind utility classes, the rest with custom CSS. Unifies in the rebuild.
9. **Three font families loaded** — Circular Std, Inter, Syne. Confirm Syne is needed; if not, drop it to save a font request.
10. **Circular Std license** — must verify the existing self-host license covers the Next.js host. If not: switch to **Manrope** (free, visually adjacent geometric humanist sans) and rerun the visual comparison.
