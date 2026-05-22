# Design System & Component Inventory

The current theme is custom — not a known commercial WP theme — so the design language has to be extracted from the live pages. This doc captures what to encode in Tailwind tokens and which reusable components to build.

> **Visual baseline:** 54 full-page screenshots captured 2026-05-16 across 18 URLs × 3 viewports (1440 / 768 / 375). See [screenshots/README.md](screenshots/README.md). The observations below are derived from those captures, not guesses. For exact hex values (CSS color picker), the [11-screenshots-capture-guide.md](11-screenshots-capture-guide.md) §6 has the DevTools method to lock them down before coding.

## 1. Visual signals observed in the captured screenshots

### Overall design language

- **White-dominant marketing** with light off-white section alternates separating major sections
- **Long single-column scrolls** on every page — no fancy parallax or pinned sidebars
- **Heavy use of soft pastel section tints** as visual grouping for multi-phase frameworks: peach, light blue, light pink, sage green (each "phase" / "pillar" gets its own pastel)
- **Cards everywhere**: rounded ~16–20px corners, very soft shadow, white fill on neutral surface
- **Dark CTA bands** punctuate the page rhythm: every 2–3 sections, a near-black or navy band with a single high-contrast button
- **Footer is dark** (navy/near-black), white text, simple 4-column layout
- **Iconography**: filled colored squares/circles with white iconography inside — bright primary colors per icon family (red for negatives/problems, green for positives, blue/purple for process steps)

### Color palette (to verify with DevTools color picker — see §6)

Tentative tokens from visual inspection of the screenshots:

```css
/* Backgrounds */
--color-surface:           #ffffff       /* primary page background */
--color-surface-alt:       ~#f6f7fa      /* section alternate */
--color-surface-tint-peach:    /* phase 1 / framework card tint */
--color-surface-tint-blue:     /* phase 2 / framework card tint */
--color-surface-tint-pink:     /* phase 3 / framework card tint */
--color-surface-tint-sage:     /* phase 4 / framework card tint */
--color-surface-dark:      ~#0f1620      /* dark CTA bands + footer */

/* Text */
--color-text-primary:      ~#0d1117      /* near-black headings & body */
--color-text-muted:        ~#5e6772      /* subdued copy */
--color-text-on-dark:      #ffffff       /* dark sections */

/* Brand & accent */
--color-brand-blue:        /* primary — eyebrow text, key headings */
--color-accent-coral:      /* "problem" highlights, X icons */
--color-accent-green:      /* "solution" / positive indicators */
--color-accent-purple:     /* journey-step / process indicators */

/* Buttons */
--color-button-primary-bg:    ~#0f1620   /* near-black pill */
--color-button-primary-fg:    #ffffff
--color-button-secondary-bg:  transparent
--color-button-secondary-border: currentColor
```

### Typography (inspect via DevTools to lock down)

- **Headings** use a tall display sans — likely a humanist geometric. H1 around 48–56px desktop, 32–36px mobile
- **One- or two-word color accent** in big headlines is the signature treatment (e.g., a verb or noun colored in `accent-coral` while rest of headline is `text-primary`)
- **Body** sits in the 16–18px range with relaxed line-height (~1.55–1.65)
- **Eyebrow labels** above headlines are small, brand-blue, uppercase or sentence case

### Spacing & layout

- Container max-width ~1200px, generous side padding on desktop
- Section vertical pad ~96–112px desktop, ~56–72px mobile
- Card grids: 24–32px gap; 3-up on desktop, 1-up on mobile
- Hero block: ~720px tall on desktop, content-first

### Components inferred (visual)

- **Pill-shaped buttons** with dark fill, ~12px vertical pad
- **Outlined "secondary" buttons** with thin border
- **3-up problem cards** with large colored icons at top
- **4-phase framework**: each phase as its own pastel-tinted card with checkpoint icons inside
- **Stat strip**: 3–6 cells horizontal, massive number (~48–56px), small label below
- **Comparison table**: 3 columns, alternating row tints
- **Pricing tier cards** (on `/services/website-content-writing-packages/`): 5 cards in a row at desktop, stacked at mobile, with a "most popular" emphasized card
- **Testimonial carousel** with 5-star UI, customer photo, role/company line
- **FAQ accordion**: stacked rows with thin separator lines, plus icon on right that rotates
- **Multi-step lead form**: 2 steps with a progress indicator, dropdowns and text inputs, single primary action button
- **Cookie banner**: Complianz default look — bottom-anchored bar with Accept / Reject options
- **Calculator widget** (on `/future-proof-your-seo/`): inline form with sliders/dropdowns that compute a personalized risk number
- **Series navigation** (on `/guide/...`): linked numbered list at bottom of guide articles
- **Tag filters** on the blog and guides hubs: pill-style toggles above the card grid

### Section archetypes recurring across pages

1. **Hero band** (light): big headline + 1–2 sentence sub + CTA + supporting visual right
2. **Logo strip**: 5 client logos in grayscale
3. **Stat strip** (light, often on a tinted background)
4. **Problem cards** (light, 3-up)
5. **Framework cards** (multi-color pastel tints, 3–4 up)
6. **Service category grid** (light, 4-up)
7. **CTA band** (dark, full-width)
8. **Comparison table** (light, sometimes with a colored "winner" column)
9. **FAQ** (light)
10. **Final CTA band** (dark, ends every page)
11. **Footer** (dark, 4-column)

## ~~2. Tailwind token mapping~~ → §2 below

### Typography

- Body: appears to be a humanist sans (likely a Google Font — Inter, Manrope, or similar). Capture from `main.css`.
- Headings: paired weight progression (likely 700 on H1–H2, 600 on H3)
- Long-form content: large H1 (40–56px desktop), generous line-height (1.5–1.6)

### Spacing

- Hero pads top/bottom ~96–128px desktop, ~64px mobile
- Section gutters ~96px between major sections
- Card grids use 24–32px gaps

### Components present in current visual language

- Pill-style primary CTA buttons (rounded-full)
- Outlined secondary buttons
- Soft-shadow cards with rounded corners (16–20px radius)
- Check/X icon lists for "what we do / don't do" sections
- Carousel for testimonials (Owl Carousel currently)
- Stat counters (4–6 cells horizontal)
- Comparison table (3 columns, sticky first column on mobile)
- Accordion FAQ
- 3-phase / 4-phase framework visualization
- Newsletter inline form
- Multi-step form (contact, lead-gen) with field-conditional UI
- Cookie consent modal (Complianz default style)

## 2. Tailwind token mapping

Encode the visual system as CSS variables exposed through Tailwind v4's `@theme`:

```css
/* styles/globals.css */
@theme {
  --color-brand-50:  /* lightest tint */;
  --color-brand-500: /* primary CTA */;
  --color-brand-700: /* hover */;
  --color-brand-900: /* dark hero bg */;

  --color-ink-900: #0d1117;
  --color-ink-700: #2c3640;
  --color-ink-500: #5e6772;
  --color-ink-300: #b4bcc4;
  --color-ink-100: #f0f2f5;

  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-display: 'Manrope Variable', var(--font-sans);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  --shadow-card: 0 1px 2px rgba(13,17,23,0.04), 0 4px 12px rgba(13,17,23,0.06);
  --shadow-card-hover: 0 4px 8px rgba(13,17,23,0.06), 0 12px 32px rgba(13,17,23,0.10);
}
```

Storybook (optional) makes these visible to designers without spinning up a page.

## 3. Component inventory (priority order)

### Tier 1 — required for any page

| Component | Notes |
|-----------|-------|
| `Container` | Max-width wrapper (~1200–1280px) with responsive padding |
| `Section` | Vertical-rhythm wrapper (small/medium/large pad variants) |
| `Heading` | H1/H2/H3/H4 with consistent type ramp |
| `Button` | Variants: primary, secondary, ghost; sizes: sm/md/lg |
| `Link` | Wraps `next/link` + adds external-icon for off-site links |
| `Image` | Wraps `next/image` with sensible defaults |
| `JsonLd` | Renders schema in a `<script type="application/ld+json">` |
| `Header` | Site header — see [04-page-templates.md](04-page-templates.md) |
| `Footer` | Site footer |
| `Breadcrumbs` | + JSON-LD emission |

### Tier 2 — marketing sections

| Component | Notes |
|-----------|-------|
| `Hero` | Variants: `image-right`, `centered`, `with-form`, `problem-focused` |
| `StatRow` | Reads from `lib/stats.ts` |
| `ClientLogoStrip` | Carousel optional |
| `ProblemCards` | 3-up grid |
| `PhaseFramework` | 3- or 4-phase columns with checkpoints |
| `ServiceCategoryGrid` | 4-up tiles |
| `ComparisonTable` | 3-col, sticky first column on mobile |
| `PricingTable` | 4–6 tiers with feature lists |
| `TestimonialCarousel` | Embla; 1-up on mobile, 2-up tablet, 3-up desktop |
| `FAQ` | Accordion + `FAQPage` JSON-LD |
| `CTASection` | Headline + sub + button |
| `AuthorBio` | Artur Shepel block reused everywhere |
| `RelatedContent` | 3 cards |
| `ContactJourney` | Timeline-style component |

### Tier 3 — form & funnel

| Component | Notes |
|-----------|-------|
| `LeadForm` | Multi-step, react-hook-form + zod, server action |
| `FormField` | Wraps input + label + error |
| `FormStepper` | Visual step indicator |
| `RevenueRangeSelect` | Dropdown reused across all funnels (8 ranges) |
| `PlatformSelect` | WooCommerce / Shopify / Other |
| `FrustrationSelect` | 10-option dropdown |
| `ConsentBanner` | Cookiebot or self-built |
| `ThankYouHero` | Used on every `/thank-you/` page |

### Tier 4 — content templates

| Component | Notes |
|-----------|-------|
| `ProseContent` | MDX renderer with `@tailwindcss/typography` |
| `TableOfContents` | Auto-built from headings |
| `SeriesNavigation` | For guide series (8-part checklist etc.) |
| `ShareButtons` | LinkedIn + X |
| `CodeBlock` | Shiki-rendered, copy-to-clipboard |
| `Callout` | Info / warning / tip variants for use inside MDX |

## 4. Responsive breakpoints

Match current behavior; standard Tailwind defaults work:

```js
sm: 640px   // small phones-up
md: 768px   // tablet
lg: 1024px  // laptop
xl: 1280px  // desktop
2xl: 1536px // wide
```

Mobile-first; site has clear mobile hamburger menu.

## 5. Accessibility baseline

- All interactive components use Radix primitives (via shadcn/ui) — focus management, keyboard nav included
- Color contrast: WCAG AA on all body text (verify once palette is locked)
- Form fields: every input has a `<label>`, errors associated via `aria-describedby`
- Carousels: pause-on-hover + visible controls
- Skip-to-content link in header
- Reduced-motion respect on Framer Motion animations

## 6. Performance budgets per template

| Template | JS (gz) | CSS (gz) | LCP target (mobile, throttled) |
|----------|--------:|---------:|--------------------------------|
| Home | ≤ 110 KB | ≤ 20 KB | ≤ 2.0s |
| Service page | ≤ 90 KB | ≤ 20 KB | ≤ 1.8s |
| Lead-gen landing | ≤ 100 KB | ≤ 20 KB | ≤ 1.8s |
| Blog post | ≤ 70 KB | ≤ 18 KB | ≤ 1.6s |
| Guide | ≤ 80 KB | ≤ 18 KB | ≤ 1.8s |

Lighthouse CI in PRs enforces the budget; regressions block merges.

## 7. What to recapture from the current site

To finalize the design system, capture from production:

1. Exact hex values for primary / secondary / accent
2. Exact font families and weights (look in DevTools → Network → Fonts)
3. Border-radius values used by cards and buttons
4. Shadow elevations
5. Logo SVGs (header + footer variants if different)
6. All client logo SVGs (Deventor, MWF, NH, Hosebox, Longhorn) — request originals if pixelated PNGs
7. Hero illustration / pattern assets
8. The "phase framework" custom illustration

This list goes into [11-screenshots-capture-guide.md](11-screenshots-capture-guide.md).
