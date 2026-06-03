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

/** Global graph rendered once in the site layout — every page inherits it. */
export function globalGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema()],
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
  description,
  category,
  areaServed = 'United States',
}: {
  name: string
  slug?: string
  description: string
  category?: string
  areaServed?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': slug ? `${SITE}/services/${slug}/#service` : `${SITE}/services/#service`,
    name,
    description,
    serviceType: category ?? 'Digital Marketing',
    provider: { '@id': orgId },
    areaServed,
    url: slug ? `${SITE}/services/${slug}/` : `${SITE}/services/`,
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
