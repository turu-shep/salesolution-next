# Current State Audit — salesolution.net

Snapshot of what powers the live WordPress site as of 2026-05-16. Used to plan the Next.js replacement.

## 1. Platform

| Layer | What's running | Notes |
|-------|----------------|-------|
| CMS | WordPress 6.9.4 | `<meta name="generator" content="WordPress 6.9.4">` |
| Theme | Custom `salesolution` | `/wp-content/themes/salesolution/` |
| Hosting | Cloudways | Revealed via Person schema `sameAs`: `wordpress-1371894-5059308.cloudwaysapps.com` |
| CDN / DNS | Cloudflare | Email obfuscation present (`cdn-cgi/l/email-protection`) |
| Database | MySQL (standard WP) | Not directly observable; assumed |
| PHP version | unknown | Cloudways default; likely 8.1+ |

## 2. Theme assets

Front-end stack loaded by the custom theme:

| Asset | Source | Concern |
|-------|--------|---------|
| `main.css` | theme | Custom; needs visual extraction → Tailwind tokens |
| `bootstrap.min.css` | theme | Bootstrap 4/5 — replace with Tailwind |
| `owl.carousel.min.css` / `.js` | theme | Replace with Embla or Swiper in Next.js |
| `jquery-3.3.1.js` | theme | 7 years old; drop entirely |
| `bootstrap.min.js` | theme | Drop |
| `jquery.min.js?ver=3.7.1` | WP core | Bundled by WP; gone on Next.js |
| `popper.min.js` (jsDelivr CDN) | external | Bootstrap dep; drop |

**Implication:** The theme is a fairly traditional jQuery + Bootstrap build. None of this carries over. The visual system must be re-extracted (see [07-design-and-components.md](07-design-and-components.md)).

## 3. WordPress plugins detected

Inferred from script/CSS paths in homepage HTML (`/wp-content/plugins/<slug>/...`):

| Plugin | Slug | Role | Next.js replacement plan |
|--------|------|------|--------------------------|
| Rank Math SEO Pro | (sitemap, schema markers) | All meta tags, OG, Twitter cards, JSON-LD `@graph`, sitemap index, redirects | Next.js Metadata API + handcrafted JSON-LD components + `app/sitemap.ts` |
| MonsterInsights (Google Analytics Premium) | `google-analytics-premium` | GA4 client-side load + gtag wrapper | Native `<Script>` for GA4 + Google Tag Manager (recommended) |
| PixelYourSite | `pixelyoursite` | Meta Pixel `1246284374271362` + dynamic events (Form, Download, Comment, Scroll, TimeOnPage), Google Ads conversion `AW-17897120027`, server-side API toggle, consent gating | Replace with GTM containers + custom event hooks; or use `@next/third-parties` Meta Pixel helper |
| Complianz GDPR Premium | `complianz-gdpr-premium` | Cookie consent banner + Google Consent Mode v2 + tag gating | Replace with Cookiebot, Klaro, or self-built consent context using Google Consent Mode v2 |
| Link Whisper Premium | `link-whisper-premium` | Auto-internal-linking suggestions while editing | No runtime equivalent needed; bake links manually into MDX or use a build-time linter |
| HubSpot WordPress plugin v11.3.37 | `leadin` (inferred from HubSpot WP plugin) | Embedded analytics + form tracking | HubSpot tracking code via `<Script>` if retained, or drop |
| Rank Math redirects | (Rank Math feature) | Legacy URL redirects | Export and bake into `next.config.js` `redirects()` |

## 4. Third-party scripts loaded on homepage

| Domain | Purpose |
|--------|---------|
| `googletagmanager.com/gtag/js?id=AW-17897120027` | Google Ads conversion tag |
| `cdn.jsdelivr.net/npm/@popperjs/core@2.11.8` | Popper (Bootstrap dropdown positioning) |
| `secure.gravatar.com` | Author avatars (Gravatar) |
| `cloudflare cdn-cgi/l/email-protection` | Email obfuscation |
| Facebook Pixel (loaded by PixelYourSite via `connect.facebook.net`) | Conversion tracking — gated by consent |

## 5. Sitemap inventory (Rank Math sitemap index)

`https://salesolution.net/sitemap_index.xml` references 5 child sitemaps:

| Sitemap | Entries | Latest lastmod |
|---------|--------:|----------------|
| `post-sitemap.xml` | 19 | 2025-10-23 |
| `page-sitemap.xml` | 36 | 2026-03-18 |
| `guide-sitemap.xml` | 9 | 2023-12-06 |
| `careers-sitemap.xml` | 1 | 2023-08-30 |
| `local-sitemap.xml` | 1 (locations.kml) | 2025-10-19 |

Total indexable URLs ≈ **66**. Full inventory: [02-information-architecture.md](02-information-architecture.md) and [03-content-inventory.md](03-content-inventory.md).

## 6. Custom post types observed

Inferred from URL slugs in sitemaps:

| CPT | Slug pattern | Count | Notes |
|-----|--------------|------:|-------|
| `page` | `/<slug>/` | 36 | Standard WP pages |
| `post` | `/<slug>/` (no `/blog/` prefix) | 19 | Posts live at root — unusual but kept |
| `guide` | `/guide/<slug>/` OR `/guides/<slug>/` | 9 | **Inconsistent permalink** — some use `/guide/` (singular) some `/guides/` (plural) |
| `career_path` | `/career-paths/<slug>/` | 2 | Two examples: `seo-specialist-qualification`, `content-strategy-specialist-qualifications` |
| (taxonomy) `category` | `/category/blog/` | 1 archive | Blog hub lives at category archive, not at `/blog/` |
| (taxonomy) `service` hub | `/services/` + `/services/<slug>/` | 1 hub + 5 children | Mixed — `/services/` is a real page, children are full landing pages |

## 7. JSON-LD schema currently emitted (homepage)

Single `<script type="application/ld+json" class="rank-math-schema-pro">` block emits an `@graph` with:

1. **Place** — physical location (uses old address; see risks)
2. **Organization** — `name`, `url`, `address`, `logo`
3. **WebSite** — with `SearchAction` potential action (search URL: `?s={search_term_string}`)
4. **WebPage** — name, datePublished, dateModified, about → Organization
5. **Person** — Artur Shepel with image (Gravatar) and `sameAs` (Cloudways staging URL — should not be public)
6. **Article** — homepage treated as an Article (odd; normally for posts only)

**Migration note:** Replicate the @graph in Next.js, but:
- Remove the Cloudways `sameAs` URL (it leaks the host)
- Use the **canonical** business address (decide which is correct — see risks)
- Don't emit `Article` schema on the homepage; emit `WebPage` only
- Add `BreadcrumbList` on inner pages (Rank Math is missing this on some pages)
- Add `FAQPage` schema where pages have FAQs (services pages already have them in copy)

## 8. Robots.txt rules

```
User-agent: *
Allow:    /*.js  /*.css  /*.jpg  /*.gif  /*.png
Disallow: /cgi-bin  /wp-admin/  /?  /?*  *?s=  *&s=  /search
          /author/  */embed$  */xmlrpc.php  *utm*=  *openstat=
          /account  /cart  /checkout  /clients  /client-portal-login
Sitemap:  https://salesolution.net/sitemap_index.xml
```

**For Next.js migration:** Most of these are WordPress-specific (no `/wp-admin/`, no `?s=` search, no `/xmlrpc.php`, no `/author/`). Trim the inherited rules — only keep:
- Disallow utm/openstat tracking-param URLs (still relevant)
- Disallow `/account`, `/cart`, `/checkout`, `/clients` if those flows are retained
- New sitemap URL: `https://salesolution.net/sitemap.xml` (Next.js convention, no index needed for <50k URLs)

## 9. Comments system

Blog post `/generative-engine-optimization-basic-to-advanced/` and guide samples expose a WordPress comment form (name + email). Volume unknown but likely low. **Recommendation:** drop the comment system on launch (zero-maintenance), or replace with Giscus / utterances if engagement turns out to matter.

## 10. Image asset hosting

All images served from `https://salesolution.net/wp-content/uploads/YYYY/MM/...`. Migration options:
- Re-upload to Next.js `public/` (simple, immutable URLs but ships with app)
- Push to S3/R2/Cloudinary and serve via `next/image` loader (better)
- Keep WP uploads URL alive as a passthrough rewrite (minimal risk for image SEO since URLs stay stable)

Recommendation: **keep `/wp-content/uploads/*` URLs intact** by either (a) rewriting them to a static bucket, or (b) leaving the WP uploads directory mounted from the old host during transition. Renaming image URLs en masse loses image-search rankings.
