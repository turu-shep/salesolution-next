# Northern Hydraulics — Article Page Redesign

**Date:** 2026-05-26
**Scope:** Visual redesign of single blog/article pages on northernhydraulics.net
**Delivery:** Single drop-in CSS file pasted into WordPress Customizer → Additional CSS (or Elementor Site Custom CSS). Zero theme-file edits, zero plugin changes, zero markup changes required (component classes are opt-in).
**Surface affected:** `body.single-post article.post` only. Header, nav, footer, product pages, archives, category pages, and homepage are explicitly out of scope.

---

## 1. Problem statement

The current article template (WordPress theme `northernhydraulics`, Elementor present) has reading-impeding defects:

| Defect | Current | Impact |
|---|---|---|
| H1 line-height < font-size | `52px / 41.6px` | Title lines overlap when wrapping (visible bug on `/hydraulic-cylinder-force-calculator`) |
| Inverted heading hierarchy | H2 `24px / 700`, H3 `28px / 600` | H3 looks more important than H2 — readers can't navigate structure |
| No measure constraint | Article body runs full 1250px | ~140 char lines, well past the 60–80 char comfort zone |
| Pure black on white | `#000` on `#FFF` | Harsh contrast, no neutral scale for hierarchy |
| Paragraph margins doubled | `margin: 32px 0` top & bottom | Excessive spacing breaks reading rhythm |
| Inverted emphasis | `<strong>` is 14px gray in Indivisible font | Bold text is *less* prominent than surrounding body |
| Floating sidebar overlap | `.cta-block-sidebar` floats right at top | Crowds the H1 area, breaks article-column grid |
| Legacy inline styles | Some `/catalog/*.html` posts have `<p style="font-size:12px">` | Body text shrinks to 12px on older content |
| No rhythm-breaking elements | 97 paragraphs + 23 H3s in 16K chars (calculator post) | Dense text wall — no callouts, no quotes, no visual accents |

All three sampled posts (`hydraulic-cylinder-force-calculator`, `o-ring-face-seal-orfs-guide`, `hydraulic-cylinder-mounting-styles`, plus legacy `catalog/cylinders-faq.html`) share the same `<article class="post-XXXXX post">` template, so a single scoped stylesheet fixes all of them.

## 2. Design direction

A hybrid of three references:

- **Foundation — Stripe-docs clarity:** confident neutral typography, generous measure, restored hierarchy, warm off-white surface.
- **Display accent — Editorial magazine:** one serif (Newsreader) for the H1 only, plus auto-generated small-caps eyebrow labels above each H2 (`§ 02 · CALCULATION`).
- **Technical accent — Field manual:** JetBrains Mono for units, formulas, model numbers, and tabular figures.

Two new web fonts loaded; existing Inter retained for body, UI, and most headings.

## 3. Tokens (CSS custom properties)

All design decisions exposed as `:root` variables so palette/scale tweaks are one-line edits.

### Fonts
```
--font-display:  "Newsreader", Georgia, serif       /* H1 only */
--font-body:     "Inter", system-ui, sans-serif     /* everything else */
--font-mono:     "JetBrains Mono", ui-monospace, monospace
```

### Type scale (base 18px)
```
--type-h1:        clamp(36px, 5vw, 60px)   line-height 1.05  weight 600
--type-eyebrow:   12px / 1            weight 700  uppercase  letter-spacing 0.12em
--type-h2:        34px / 1.20         weight 700  letter-spacing -0.015em
--type-h3:        24px / 1.30         weight 600
--type-h4:        18px / 1.40         weight 700  uppercase  letter-spacing 0.04em
--type-lead:      22px / 1.50         weight 400  color ink-muted
--type-body:      18px / 1.65         weight 400
--type-small:     15px / 1.55         weight 400  (captions, metadata)
--type-mono:      0.94em              weight 500  JetBrains Mono
```

### Palette
```
--color-surface:       #FAFAF7   warm off-white (article background)
--color-ink:           #171717   primary text
--color-ink-muted:     #5A5A5A   metadata, captions, lead paragraph
--color-hairline:      #E5E3DD   table/section dividers
--color-soft:          #F3F1EA   callout/formula backgrounds, zebra
--color-brand:         #E76F1A   from existing orange CTA — eyebrow labels, link underline, key-takeaway accent
--color-brand-hover:   #C25510
--color-steel:         #14495A   numbered-step numerals, note callouts
--color-warn:          #B45309   warning callouts
```

### Layout
```
--measure-prose:    720px
--measure-wide:     880px   (breakout width for figures/tables/callouts)
--gutter:           24px
--rail:             320px   (right-rail CTA sidebar on desktop)
```

## 4. Component patterns

### 4.1 Lead paragraph
Two paths:
- **Automatic:** First `<p>` immediately after the H1 gets `--type-lead` via `h1 + p`. Works when the article opens with prose (calculator post, mounting-styles post).
- **Opt-in:** `<p class="lead">` for posts that have a date stamp or image between H1 and lead (ORFS post pattern). The `.lead` class wins regardless of position.

Both selectors apply the same styles.

### 4.2 Eyebrow label (automatic via CSS counter)
H2s in the article body are auto-numbered. CSS counter increments per H2, rendered in `::before` as `§ 02 · ` in `--type-eyebrow` brand color. No editor effort required.

### 4.3 Callouts (opt-in HTML)
```html
<aside class="callout callout--key">…</aside>
<aside class="callout callout--note">…</aside>
<aside class="callout callout--warn">…</aside>
```
4px left rule in modifier color, label above content in `--type-eyebrow`, soft background, 24px padding, breaks out to `--measure-wide`.

### 4.4 Formula block (opt-in HTML)
```html
<figure class="formula">
  <div class="formula__expr">F = P × A</div>
  <figcaption>Force equals pressure times area.</figcaption>
</figure>
```
Centered, mixed-font (variables Newsreader italic, operators JetBrains Mono), soft background card, caption below in `--type-small`.

### 4.5 Definition list (automatic via `<dl>`)
`<dt>` semibold 18px, `<dd>` indented with subtle left border. Editor can use this for terminology sections (mounting styles, fitting types).

### 4.6 Comparison table (automatic)
- Header row: Inter 700, brand-orange `border-bottom 2px`, no other borders
- All `<td>`: `font-variant-numeric: tabular-nums` so numbers align even when in body font
- Numeric-column cells should be `<td class="num">` (right-aligned, JetBrains Mono) — opt-in per cell to avoid mis-aligning text columns. Editor instruction included in delivery README.
- Zebra: `tr:nth-child(even) { background: --color-soft }`
- Hairline row separators (`--color-hairline`)
- Breakout to `--measure-wide` on desktop
- Mobile: horizontal scroll with fade-edge hint

### 4.7 Numbered steps (opt-in HTML)
```html
<ol class="steps">
  <li>…</li>
</ol>
```
Each `<li>` hanging numeral 40px Newsreader in `--color-steel`, sitting in the left margin.

### 4.8 Inline tech values (automatic via `<code>`)
`<code>` renders in `--font-mono`, `--color-soft` background, 2px padding, no extra markup.

### 4.9 Image figures (automatic via `<figure>`)
Existing WP figure markup gets:
- 8px rounded corners
- Caption in `--type-small`, `--color-ink-muted`, 12px below image
- Optional `.figure--breakout` extends to `--measure-wide`

## 5. Bugs explicitly fixed

| Bug | Fix |
|---|---|
| H1 line-height < font-size | `line-height: 1.05` on H1 |
| H3 visually larger than H2 | New scale: H2 34px, H3 24px |
| `<strong>` = 14px gray Indivisible | `font-family: inherit; font-size: inherit; font-weight: 700; color: var(--color-ink)` |
| Doubled paragraph spacing | `margin-block: 0 0 1em`; first-of-type gets `margin-top: 0` |
| Full-width article | `.entry-content` grid with named columns; prose `max-width: 720px` centered |
| Legacy `<p style="font-size:12px">` | `p[style*="font-size"] { font-size: var(--type-body) !important }` — scoped to article only |
| Sidebar overlapping H1 | Sidebar lifted out of float, placed in third grid column on ≥1100px; stacks under lead `<p>` below 1100px |
| Pure `#000` text | `color: var(--color-ink)` = `#171717` |

## 6. Layout grid

Article body uses CSS Grid with named columns:

```
≥1100px:
  [gutter] [prose 720px] [gutter] [rail 320px] [gutter]

768px – 1099px:
  [gutter] [prose 720px] [gutter]
  (sidebar moves to flow position under lead paragraph)

<768px:
  [20px gutter] [prose 100%] [20px gutter]
  H1 clamps to clamp(36px, 7vw, 52px)
  Lead drops to 19px
  Tables get horizontal scroll
```

Breakout elements (`.callout`, `.formula`, `.figure--breakout`, large `<table>`) span the prose column plus 80px on each side via grid `column: full`.

## 7. CSS architecture

Single file, ~6–8KB minified. Structure:

```
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap');

:root { /* all tokens from §3 */ }

/* Scoping wrapper — every rule lives inside this */
body.single-post article.post { … }

/* Sections */
/* 1. Foundation: layout grid, background, base typography */
/* 2. Headings: h1 (with display font), h2 (with counter eyebrow), h3, h4 */
/* 3. Inline: p, a, strong, em, code, mark */
/* 4. Lists: ul, ol, dl, .steps */
/* 5. Tables */
/* 6. Figures + images */
/* 7. Components: .callout(+variants), .formula */
/* 8. Sidebar reposition (.cta-block-sidebar) */
/* 9. Responsive: @media (max-width: 1099px), (max-width: 767px), (max-width: 479px) */
/* 10. Legacy overrides: inline-style defeats */
```

## 8. Specificity strategy

- Base scoping selector: `body.single-post article.post` (specificity 0,0,2,1) beats theme's typical `.entry-content` (0,0,1,0) and `.post .entry-content` (0,0,2,0).
- Component classes (`.callout`, `.formula`) inherit scoped context — no extra specificity needed.
- `!important` used in exactly one place: the inline-style legacy `<p style="font-size:12px">` override. Documented inline as the only exception.

## 9. Browser support

Chrome/Edge ≥104, Safari ≥15, Firefox ≥104. CSS Grid named columns, `clamp()`, custom properties, and `:has()` (for sidebar-presence detection) all supported. No fallbacks needed for the target audience.

## 10. Out of scope (explicit)

- Header, nav, search bar
- Breadcrumb component (kept as-is)
- Footer
- Product pages (`single-product`), archives, categories, homepage
- The right-rail CTA card *contents* — only its grid position changes
- JavaScript (no TOC generation, no smooth scroll, no anchor copy buttons)
- New imagery, icon set, or illustration work
- Editor / Gutenberg block templates (callouts/formulas are raw HTML the editor pastes in)
- Site Kit / WooCommerce / popup / search-plugin CSS

## 11. Acceptance criteria

The redesign is complete when, on `/hydraulic-cylinder-force-calculator`:

1. H1 wraps without overlapping lines
2. H2 is visually larger and heavier than H3
3. Body prose column measures 60–75 chars per line at desktop
4. `<strong>` is bolder and same color as body
5. Right-rail CTA does not visually collide with the H1
6. Comparison table has zebra striping and right-aligned mono numerals
7. At least one callout pattern (`.callout--key`) renders correctly when added to the post body
8. Page loads on mobile (375px) without horizontal scroll
9. Legacy `/catalog/cylinders-faq.html` has 18px paragraph text (not 12px)
10. No regression on product pages, homepage, or category archives (verified by spot-check)

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Theme update overwrites Customizer CSS | Customizer CSS is database-stored, not theme-file — survives theme updates. Documented in delivery notes. |
| Plugin CSS loaded after Customizer raises specificity | Each rule uses the `body.single-post article.post` scope, which beats single-class plugin rules. Spot-check after deploy. |
| Google Fonts adds render-blocking request | `display=swap` set; FOIT avoided. Two font families ~50KB total over wire. |
| Inline-style override via `!important` cascade | Scoped to article only; one selector; documented exception. |
| Editor doesn't add `.callout` wrappers | Component patterns are opt-in. Foundation (typography, palette, measure) works on raw HTML alone. |
| Sidebar grid breaks on posts without sidebar | `:has(.cta-block-sidebar)` selector adapts grid; posts without sidebar use 2-col layout. |

## 13. Delivery artifacts

1. **Single CSS file** — `northern-hydraulics-article.css`, ~6–8KB minified
2. **Installation instructions** — one-page README explaining: paste into Customizer; how to add a callout in the editor; how to add a formula; how to invoke breakout figure
3. **Test URLs** — list of pages to spot-check after install (the four sampled URLs + 2-3 product/category URLs to confirm no leakage)
