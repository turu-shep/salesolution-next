# SEO Strategy & Migration Plan

The site's organic traffic is the business. The cutover must be **invisible to Google**: same URLs, same metadata, same schema, same canonical signals — or better.

## 1. Non-negotiables for cutover

1. Every existing URL listed in [02-information-architecture.md](02-information-architecture.md) must either return **200** with equivalent content or **301** to a chosen canonical.
2. Every page must emit a `<title>`, `<meta name="description">`, OG tags, Twitter card, and canonical URL — at parity with what Rank Math emits today.
3. The Rank Math `@graph` schema must be replicated (Organization, Place, WebSite, WebPage, Person, plus per-template additions: Article on posts/guides, FAQPage where FAQs exist, BreadcrumbList on nested pages).
4. `sitemap.xml` + `robots.txt` live at the same paths.
5. All image URLs under `/wp-content/uploads/...` must continue resolving (rewrite or keep the directory served).
6. Page-experience signals (Core Web Vitals) should improve, not regress.

## 2. Robots.txt for Next.js

Replace the WordPress-shaped robots.txt with one tailored to Next.js. Suggested `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*?utm_*',
          '/*?openstat*',
          '/*?fbclid*',
          '/*?gclid*',
          '/account/',       // keep only if these routes exist
          '/cart/',
          '/checkout/',
          '/clients/',
          '/client-portal-login/',
        ],
      },
    ],
    sitemap: 'https://salesolution.net/sitemap.xml',
  }
}
```

**Removed** (no longer applicable): `/cgi-bin`, `/wp-admin/`, `/?*`, `*?s=`, `*&s=`, `/search`, `/author/`, `*/embed$`, `*/xmlrpc.php`, `/*.js`, `/*.css`, `/*.jpg`, `/*.gif`, `/*.png` (Allow rules for asset extensions — irrelevant on Next.js as they aren't disallowed in the first place).

## 3. Sitemap

Replace the Rank Math sitemap_index with a single Next.js sitemap (≤50k URLs, no need to split). `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getAllPosts, getAllGuides, getAllPages, getAllCareerPaths } from '@/lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://salesolution.net'
  const pages = await getAllPages()
  const posts = await getAllPosts()
  const guides = await getAllGuides()
  const careerPaths = await getAllCareerPaths()

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...pages.map(p => ({ url: `${base}${p.path}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...posts.map(p => ({ url: `${base}/${p.slug}/`, lastModified: p.updatedAt, priority: 0.7 })),
    ...guides.map(g => ({ url: `${base}/guides/${g.slug}/`, lastModified: g.updatedAt, priority: 0.6 })),
    ...careerPaths.map(c => ({ url: `${base}/career-paths/${c.slug}/`, lastModified: c.updatedAt, priority: 0.5 })),
  ]
}
```

Also bake the **trailing-slash convention** of the current site into Next.js (`trailingSlash: true` in `next.config.js`) so URLs don't change shape during migration.

## 4. Metadata API parity

For each route, export `metadata` (or `generateMetadata`) matching what Rank Math emits today. Template:

```ts
export const metadata: Metadata = {
  title: '...',
  description: '...',
  alternates: { canonical: 'https://salesolution.net/<path>/' },
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://salesolution.net/<path>/',
    siteName: 'Sale Solution',
    locale: 'en_US',
    type: 'website',  // or 'article' on posts/guides
    images: [{ url: '/images/og/<slug>.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '...',
    description: '...',
  },
}
```

Per-template additions:

| Template | Extra fields |
|----------|--------------|
| Blog post | `openGraph.type='article'`, `openGraph.publishedTime`, `openGraph.modifiedTime`, `openGraph.authors` |
| Guide | Same as post |
| Thank-you / lead-gen confirmation | `robots: { index: false, follow: false }` |
| Funnel landing pages | `robots: { index: true, follow: true }` (currently indexed; check Search Console first) |

## 5. JSON-LD strategy

Build a reusable `<JsonLd>` component:

```tsx
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

Then ship per-page schema. **Global** schema goes in `app/layout.tsx` (Organization, WebSite). **Per-page** schema goes in each `page.tsx`.

### Global @graph (in root layout)

```ts
const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://salesolution.net/#organization',
      name: 'Sale Solution',
      url: 'https://salesolution.net',
      logo: { '@type': 'ImageObject', url: '...' },
      address: { /* ONE canonical address — see risks doc */ },
      sameAs: [
        'https://facebook.com/salesolution.10x',
        'https://x.com/ArturShepel',
        'https://linkedin.com/company/sale-solution',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://salesolution.net/#website',
      url: 'https://salesolution.net',
      name: 'Sale Solution',
      publisher: { '@id': 'https://salesolution.net/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://salesolution.net/?s={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}
```

**Changes from current**:
- Drop the `sameAs` to `wordpress-1371894-5059308.cloudwaysapps.com` — that's a host leak, not a real public profile.
- Use the **single chosen office address** (see [10-risks-and-open-questions.md](10-risks-and-open-questions.md#address-inconsistency)).
- Don't emit `Article` schema on the homepage (Rank Math currently does — that's a bug).

### Per-page schema additions

| Page template | Add |
|---------------|-----|
| Blog post / Guide | `Article` (headline, image, datePublished, dateModified, author, publisher), `BreadcrumbList` |
| Service pages | `Service` (provider → Organization, areaServed, hasOfferCatalog with packages), `FAQPage` if FAQs |
| Contact | `ContactPage`, `LocalBusiness` |
| Service-area hub | `LocalBusiness` per location once those pages exist |
| Pricing pages (`/services/website-content-writing-packages/`, `/constraint-sprint/`) | `Product` + `Offer` for each tier — currently missing, low-hanging rich-result win |
| FAQ-heavy lead-gen pages | `FAQPage` |

## 6. Redirect map (consolidated)

To live in `next.config.js`:

```js
async redirects() {
  return [
    { source: '/contact/', destination: '/contact-me/', permanent: true },
    { source: '/strategy-session/', destination: '/book-growth-call/', permanent: true },
    { source: '/guide/website-launch-checklist-series-part-1-seo-and-crawling/',
      destination: '/guides/website-launch-checklist-series-part-1-seo-and-crawling/', permanent: true },
    { source: '/guide/website-performance-optimization-guide/',
      destination: '/guides/website-performance-optimization-guide/', permanent: true },
    { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/post-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/page-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/guide-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/careers-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/local-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    // WP cruft → 410-like behavior (use a route that returns 410)
    { source: '/wp-login.php', destination: '/', permanent: true },
    { source: '/wp-admin/:path*', destination: '/', permanent: true },
    { source: '/xmlrpc.php', destination: '/', permanent: true },
    // Plus: every redirect currently in Rank Math's Redirection module — export first
  ]
}
```

**Action item before launch:** export the Rank Math Redirections list (WP admin → Rank Math → Redirections → Export) and bake every active redirect into `next.config.js`. Test each one with `curl -I` against the staging build.

## 7. Trailing slash & canonical

Current site uses **trailing slashes** on every URL (`/services/`, `/contact-me/`, `/guides/`, etc.). Set:

```js
// next.config.js
module.exports = {
  trailingSlash: true,
}
```

Do not change this — flipping the trailing-slash convention forces a redirect on every URL and is a needless SEO event.

## 8. Image SEO

- Keep `/wp-content/uploads/YYYY/MM/...` URLs alive by either:
  - **Option A (recommended):** rsync the entire `wp-content/uploads/` tree to an S3/R2 bucket and proxy `/wp-content/uploads/*` from the Next.js host (rewrite rule or Vercel `rewrites`). Zero URL change.
  - **Option B:** migrate to new paths and add 301s for every image URL — risky for image-search rankings.
- Use `next/image` for new content with `loader: 'custom'` pointing at your CDN.
- Generate OG images at build time per post (`@vercel/og` or Satori). The current site uses uploaded OG images.

## 9. Internal linking

The current site uses Link Whisper Premium to auto-suggest internal links during authoring. In Next.js:

- No runtime equivalent needed
- At build time, add a lint step that warns when a post references a known concept without linking to its canonical page (custom remark plugin)
- Maintain a `lib/internal-links.ts` map of `keyword → canonicalURL` and a `remark` plugin that flags missing links in CI

## 10. Verification checklist (run before DNS swap)

- [ ] `curl -I https://staging.salesolution.net/<each-URL>` returns 200 or 301 to a 200, for **every** URL in the inventory
- [ ] `https://staging.salesolution.net/sitemap.xml` validates and contains all URLs
- [ ] `https://staging.salesolution.net/robots.txt` matches new spec
- [ ] Google Rich Results Test passes on:
  - Homepage (Organization, WebSite)
  - One service page (Service, FAQPage)
  - One blog post (Article, BreadcrumbList)
  - One pricing page (Product, Offer)
- [ ] `<title>` and meta description match current site within 5 characters (use a diff script across all URLs)
- [ ] Canonical URLs use `https://salesolution.net/` (production domain), not staging
- [ ] OG image renders correctly in LinkedIn Post Inspector and Twitter Card Validator
- [ ] Mobile Lighthouse ≥ 90 on home + one of each template
- [ ] Search Console: switch property to "Domain" if not already; add the new sitemap URL immediately after DNS swap

## 11. Post-cutover monitoring (first 30 days)

- Search Console: watch for 4xx/5xx spikes and "Crawled — currently not indexed" trends
- Compare daily impressions/clicks against the 30-day pre-launch baseline
- GA4: confirm session count and conversion event volume holds
- If any URL drops out of the index, re-request indexing manually and check redirects
- Keep the WordPress origin warm (read-only) for 30 days as fallback
