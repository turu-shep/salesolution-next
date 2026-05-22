# Page Template Patterns for Next.js

Distilled from the live site's recurring layouts. Each section below maps a real WordPress template to the React component tree to build in Next.js. Naming uses App Router conventions.

## 1. Global shell

```
app/
  layout.tsx                ← root layout: <Header/>, <Footer/>, consent banner, analytics scripts
  loading.tsx
  not-found.tsx
  error.tsx
  components/
    Header.tsx              ← logo, primary nav, Resources dropdown, "Get Free Growth Audit" CTA
    Footer.tsx              ← 4 columns: Learning / Cooperation / Connect / Legal
    ConsentBanner.tsx       ← Google Consent Mode v2 gate
    ThirdPartyScripts.tsx   ← gtag, Meta Pixel, HubSpot (consent-gated)
```

### `Header.tsx`
- Logo (left)
- Primary nav (desktop) + hamburger (mobile)
- Resources dropdown: AI Search Readiness Checklist · Guides · Learning Hub
- Sticky on scroll
- Primary CTA button → `/unlock-growth-audit`

### `Footer.tsx`
- Column 1 — Learning: Insights, Career Paths, Guides
- Column 2 — Cooperation: Services, Contact me
- Column 3 — Connect: Facebook, X, LinkedIn
- Column 4 — Legal: Privacy Policy, Terms of Service, Disclaimer, Opt-out Preferences
- NAP block (name, address, phone) — driven from `lib/business.ts`
- Copyright

## 2. Reusable section components

These are the building blocks every marketing page is assembled from:

| Component | Used on | Notes |
|-----------|---------|-------|
| `<Hero>` | All marketing pages | Variants: `image-right`, `centered`, `with-form` |
| `<ClientLogoStrip>` | Home, services, lead-gen | 5 logos, monochrome/color toggle |
| `<StatRow>` | Home, services, lead-gen | 4–6 stat cells; data via props from single source |
| `<ProblemCards>` | Home, lead-gen | 3-card grid for pain points |
| `<PhaseFramework>` | Home, services | 3- or 4-phase visual with checkpoints |
| `<ServiceCategoryGrid>` | Home, services hub | 4-up service tiles |
| `<ComparisonTable>` | Services | 3-column us-vs-them |
| `<PricingTable>` | Content packages | 5 tiers + custom column |
| `<TestimonialCarousel>` | Home, services, lead-gen | 4 testimonials with 5-star UI |
| `<FAQ>` | Services, lead-gen | Accordion; emits `FAQPage` JSON-LD via `<JsonLd>` |
| `<CTASection>` | All marketing pages | Heading + sub + button |
| `<AuthorBio>` | Blog posts, guides | Artur Shepel block |
| `<RelatedContent>` | Blog posts, guides | 3 cards |
| `<TableOfContents>` | Blog posts, guides | Anchor list from headings |
| `<SeriesNavigation>` | Guides (multi-part series) | Linked numbered list |
| `<Breadcrumbs>` | Posts, guides, deep pages | Emits `BreadcrumbList` JSON-LD |
| `<LeadForm>` | Contact, lead-gen, sprint | Multi-step; server action; submits to HubSpot/Resend/email |
| `<ContactJourney>` | Contact, lead-gen | "Your Journey With Us" timeline |
| `<AddressBlock>` | Contact, footer | Single source: `lib/business.ts` |

## 3. Page templates

### 3.1 Home template

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <>
      <Hero variant="image-right" headline={...} cta={...} />
      <ClientLogoStrip />
      <ProblemCards items={problemCards} />
      <PhaseFramework phases={aiAdaptationPhases} />   {/* 3 phases */}
      <CTASection text="..." href="/book-growth-call/" />
      <ServiceCategoryGrid services={comprehensiveServices} />
      <AuthorityGEOSection />
      <PPCSection />
      <CTASection text="..." href="/book-growth-call/" />
      <WhoWeServe subsections={2} />
      <PainPointsList items={5} />
      <TestimonialCarousel testimonials={4} />
      <CTASection text="Get Your Free Growth Audit" href="/unlock-growth-audit" />
    </>
  )
}
```

### 3.2 Service hub template (`/services/`)

```tsx
<Hero variant="with-stats" />
<StatRow stats={['$378M', '91%', '2.5x', '96 NPS', '5.2x', '$575k']} />
<MarketChallenges />
<GEOSolutionPillars />
<PhaseFramework phases={fourPhases} />
<ComparisonTable />
<PricingNote />
<StrategyProcess />
<FAQ items={servicesFAQ} />        {/* 11 Q&A */}
<PPCSection />
<CTASection />
```

### 3.3 Service child template (`/services/[slug]/`)

```tsx
<Hero />
<ServiceSpecificValue />
<FeatureGrid />
<ProcessSteps />
<CaseStudy />                       {/* optional */}
<PricingOrPackages />               {/* if applicable */}
<FAQ items={serviceFAQ} />
<CTASection />
```

### 3.4 Lead-gen / landing-page template

Used by `/unlock-growth-audit/`, `/future-proof-your-seo/`, `/book-growth-call/`, `/constraint-sprint/`:

```tsx
<Hero variant="problem-focused" />
<StatRow />
<ValuePillars items={3} />
<SocialProof />                     {/* logos, Clutch rating, testimonials */}
<LeadForm
  fields={leadFormFields}
  onSubmit={server action → HubSpot}
  thankYouRedirect="/<funnel>/thank-you/"
/>
<EligibilityCriteria />             {/* "best fit" / "not a fit" */}
<Deliverables />
<MultiStepProcess />                {/* 4 steps */}
<FAQ items={landingFAQ} />
<Guarantee />
<CTASection />
```

### 3.5 Blog post template (`/<slug>/`)

```tsx
<article>
  <Breadcrumbs items={['Home', post.title]} />
  <PostHero
    title={post.title}
    publishedAt={post.publishedAt}
    readTime={post.readTime}
    coverImage={post.coverImage}
  />
  <TableOfContents headings={post.headings} />
  <ProseContent>{post.body /* MDX */}</ProseContent>
  <FAQ items={post.faq} />              {/* optional, only if frontmatter has faq */}
  <ShareButtons />                       {/* LinkedIn, X */}
  <AuthorBio />
  <RelatedContent posts={relatedPosts} />
  <CTASection />
</article>
```

JSON-LD blocks: `Article`, `Person` (author), `WebPage`, `BreadcrumbList`, optional `FAQPage`.

### 3.6 Guide template (`/guides/[slug]/`)

Same as blog post but with:
- `<SeriesNavigation>` if `frontmatter.series` exists
- Different `<Breadcrumbs>` (Home > Guides > Series > Part X)
- `Article` schema with `articleSection: "Guide"` or custom `learningResource` schema
- Heavier on code blocks → ensure syntax highlighter (Shiki at build time, no runtime cost)

### 3.7 Hub / archive templates

- **Blog hub (`/category/blog/`)** — card grid + tag filter + pagination
- **Guide hub (`/guides/`)** — card grid + tag filter + sort + series spotlight
- **Career-paths hub (`/career-paths/`)** — featured entry + grid
- **Service-areas hub (`/service-areas/`)** — region selector + state grid

All hubs: build statically; tag filtering can be client-side for ≤100 items, server-rendered with search params for larger collections.

### 3.8 Legal page template

```tsx
<article className="prose">
  <h1>{title}</h1>
  <p className="text-sm text-muted">Last updated: {updatedAt}</p>
  {/* MDX content */}
</article>
```

### 3.9 Thank-you template (noindex)

```tsx
// metadata exports robots: { index: false, follow: false }
<ThankYouHero message={...} />
<NextStepsCards />
<RelatedResources />
```

## 4. Content frontmatter conventions

For MDX-driven content. Keep keys minimal so authoring stays fast.

### Posts (`content/posts/<slug>.mdx`)

```yaml
---
title: "..."
slug: "..."
description: "..."          # meta description, also used for OG
publishedAt: 2026-05-16
updatedAt: 2026-05-16
author: artur-shepel
readTime: 21                # minutes
coverImage: "/images/posts/<slug>.png"
ogImage: "/images/og/<slug>.png"   # optional override
category: "GEO"             # one of the 9 blog tags
tags: ["GEO", "AI Search"]
faq:                        # optional, drives <FAQ> + JSON-LD
  - q: "..."
    a: "..."
related: ["slug-1", "slug-2", "slug-3"]
---
```

### Guides (`content/guides/<slug>.mdx`)

```yaml
---
title: "..."
slug: "..."
description: "..."
publishedAt: 2023-12-06
updatedAt: 2026-05-16
category: "seo-guides"      # matches category hub slug
series:                     # optional
  name: "Website Launch Checklist"
  part: 1
  totalParts: 8
readTime: 22
coverImage: "/images/guides/<slug>.png"
---
```

### Career paths (`content/career-paths/<slug>.mdx`)

```yaml
---
title: "..."
slug: "..."
role: "SEO Specialist"
level: "Entry"
duration: "..."
---
```
