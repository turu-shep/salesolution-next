/**
 * JSON-LD schema builders for salesolution.net.
 *
 * Mirrors the Rank Math @graph we observed on the live site, with these
 * fixes (see docs/strategy/10-risks-and-open-questions.md):
 *   - Drop the Cloudways staging URL from `sameAs` (host leak).
 *   - Use the locked canonical address (D5).
 *   - Drop spurious `Article` schema from the homepage.
 *   - Per-page builders add what's relevant (Article on posts, FAQPage on
 *     pages with FAQs, BreadcrumbList on nested routes, Service + Product
 *     on the service / pricing pages).
 */
import { business } from './business'

const SITE = business.url

const orgId = `${SITE}/#organization`
const websiteId = `${SITE}/#website`
// Stable @id for the founder's Person entity. Defined once here; referenced by
// Organization.founder, every Article author, and the /about ProfilePage so the
// whole site resolves to one author entity (E-E-A-T + AI-citation trust).
export const personId = `${SITE}/#person`

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': orgId,
    name: business.name,
    alternateName: ['Sales Solution', 'Sales Solutions'],
    url: business.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE}/#logo`,
      url: `${SITE}/logo.png`,
      contentUrl: `${SITE}/logo.png`,
      caption: business.name,
      inLanguage: 'en-US',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    telephone: business.phone,
    email: business.emails.leads,
    founder: { '@id': personId },
    sameAs: [
      business.social.facebook,
      business.social.twitter,
      business.social.linkedin,
    ],
  } as const
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: business.url,
    name: business.name,
    alternateName: ['Sales Solution', 'Sales Solutions'],
    publisher: { '@id': orgId },
    inLanguage: 'en-US',
  } as const
}

/**
 * The founder as a first-class Person entity. Fully described here (and emitted
 * sitewide via globalGraph) so Organization.founder, Article authors, and the
 * /about ProfilePage can all reference it by @id — one author entity for crawlers
 * and AI answer engines to attribute and trust. `sameAs` ties it to the founder's
 * real profiles for entity disambiguation.
 */
export function personSchema() {
  const f = business.founder
  return {
    '@type': 'Person',
    '@id': personId,
    name: f.name,
    url: f.url,
    image: `${SITE}${f.image}`,
    jobTitle: f.role,
    description: f.bio,
    worksFor: { '@id': orgId },
    knowsAbout: [...f.knowsAbout],
    sameAs: [
      f.profiles.linkedin,
      f.profiles.youtube,
      f.profiles.instagram,
      f.profiles.twitter,
    ],
  } as const
}

/** Global graph rendered once in the site layout — every page inherits it. */
export function globalGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema(), personSchema()],
  }
}

export type Breadcrumb = { name: string; url: string }

export function breadcrumbListSchema(items: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * ItemList for a hub/index page that lists its child entries (guides,
 * career paths, …). Gives crawlers and AI engines an explicit, ordered map
 * of the hub-and-spoke cluster instead of leaving them to infer it from links.
 */
export function itemListSchema({
  name,
  url,
  items,
}: {
  name: string
  url: string
  items: Breadcrumb[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  }
}

/**
 * JSON-LD for a /career-paths/[slug]/ page. Emits an ItemList of the ordered
 * skill modules (so an AI engine sees the progression as a structured, pre-
 * chunked list, name + the one-line skill per step), plus an Occupation node
 * for role-kind paths (a hireable profession) so the page reads as the canonical
 * entity for that role. Pass the already-ordered modules from the page.
 */
export function careerPathSchema({
  title,
  slug,
  description,
  kind = 'role',
  modules,
}: {
  title: string
  slug: string
  description?: string
  kind?: 'role' | 'specialization'
  modules: { n: number; title?: string; skill?: string }[]
}) {
  const pageUrl = `${SITE}/career-paths/${slug}/`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'ItemList',
      '@id': `${pageUrl}#modules`,
      name: `${title} — skills, entry to senior`,
      ...(description ? { description } : {}),
      url: pageUrl,
      numberOfItems: modules.length,
      itemListElement: modules.map((m) => ({
        '@type': 'ListItem',
        position: m.n,
        name: m.title,
        ...(m.skill ? { description: m.skill } : {}),
      })),
    },
  ]
  if (kind === 'role') {
    graph.push({
      '@type': 'Occupation',
      '@id': `${pageUrl}#occupation`,
      name: title,
      ...(description ? { description } : {}),
      occupationalCategory: 'Search marketing / SEO',
      url: pageUrl,
      skills: modules.map((m) => m.title).filter(Boolean),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

const glossaryTermSetId = `${SITE}/glossary/#termset`

/**
 * DefinedTermSet for the /glossary/ hub. One stable node the per-term
 * DefinedTerm entries point back to via `inDefinedTermSet`.
 */
export function definedTermSetSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': glossaryTermSetId,
    name: 'AI-search glossary',
    url: `${SITE}/glossary/`,
    publisher: { '@id': orgId },
    inLanguage: 'en-US',
  }
}

/**
 * DefinedTerm for a single /glossary/[term]/ page. `description` should be the
 * term's short definition — the passage AI engines lift. Anchors the term to
 * the set above so the glossary reads as one coherent entity to crawlers.
 */
export function definedTermSchema({
  term,
  slug,
  definition,
}: {
  term: string
  slug: string
  definition: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${SITE}/glossary/${slug}/#term`,
    name: term,
    description: definition,
    url: `${SITE}/glossary/${slug}/`,
    inDefinedTermSet: { '@id': glossaryTermSetId },
  }
}

/**
 * DefinedTermSet scoped to one glossary cluster (the /glossary/cluster/<slug>/
 * pages). Lists the cluster's terms via `hasDefinedTerm`, reusing each term's
 * canonical `#term` @id so the cluster set reconciles with the per-term nodes
 * instead of duplicating them — a citable, machine-readable map of the cluster.
 */
export function clusterDefinedTermSetSchema({
  label,
  cluster,
  terms,
}: {
  label: string
  cluster: string
  terms: { term: string; slug: string; definition: string }[]
}) {
  const base = `${SITE}/glossary/cluster/${cluster}/`
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${base}#termset`,
    name: `${label} — AI-search glossary`,
    url: base,
    publisher: { '@id': orgId },
    inLanguage: 'en-US',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE}/glossary/${t.slug}/#term`,
      name: t.term,
      description: t.definition,
      url: `${SITE}/glossary/${t.slug}/`,
    })),
  }
}

export function faqPageSchema(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/**
 * Service schema for the /services/ hub and each /services/[slug]/ page.
 * Boosts eligibility for service-result rich snippets.
 */
export function serviceSchema({
  name,
  slug,
  url,
  description,
  category,
  areaServed = 'United States',
}: {
  name: string
  slug?: string
  /** Explicit absolute page URL. Overrides the default `/services/<slug>/`
   *  path for service pages that don't live under `/services/`
   *  (e.g. `/revenue-engine/`). Keep it in sync with the page's canonical. */
  url?: string
  description: string
  category?: string
  areaServed?: string
}) {
  const pageUrl = url ?? (slug ? `${SITE}/services/${slug}/` : `${SITE}/services/`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name,
    description,
    serviceType: category ?? 'Digital Marketing',
    provider: { '@id': orgId },
    areaServed,
    url: pageUrl,
  }
}

export type OfferTier = {
  name: string
  price: string                   // e.g. "$2,400" or "$500"
  cadence?: string                // e.g. "/ month", "per article"
  features?: string[]
}

/**
 * Product + Offer schema for the pricing-tier page. Each tier becomes one
 * Offer; together they're a single Product (the content-writing service)
 * with hasOffers[]. This shape qualifies for Google product result snippets
 * including price + currency badges.
 */
export function productWithOffersSchema({
  productName,
  productDescription,
  url,
  tiers,
}: {
  productName: string
  productDescription: string
  url: string
  tiers: OfferTier[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDescription,
    brand: { '@id': orgId },
    url,
    offers: tiers
      .filter((t) => /\$\d/.test(t.price)) // skip "Custom" / "Variable" tiers
      .map((t) => {
        const numeric = parsePrice(t.price)
        return {
          '@type': 'Offer',
          name: t.name,
          price: numeric.amount,
          priceCurrency: numeric.currency,
          availability: 'https://schema.org/InStock',
          url,
          ...(t.cadence ? { priceSpecification: priceSpec(numeric, t.cadence) } : {}),
        }
      }),
  }
}

function parsePrice(raw: string): { amount: string; currency: string } {
  const match = raw.match(/^\$([\d,]+)/)
  return {
    amount: match ? match[1].replace(/,/g, '') : '0',
    currency: 'USD',
  }
}

function priceSpec(p: { amount: string; currency: string }, cadence: string) {
  const isMonthly = /month/i.test(cadence)
  return {
    '@type': 'UnitPriceSpecification',
    price: p.amount,
    priceCurrency: p.currency,
    ...(isMonthly
      ? {
          billingDuration: 1,
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
        }
      : {}),
  }
}
