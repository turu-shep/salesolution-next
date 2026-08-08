/**
 * Per-page JSON-LD builders specific to the contact page.
 * Lives alongside lib/schema.ts (which holds the global Organization +
 * WebSite graph). Keeping these here so the contact route is the only
 * one importing them.
 */
import { business } from './business'

const SITE = business.url

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE}/contact-me/#webpage`,
    url: `${SITE}/contact-me/`,
    name: 'Contact — Sale Solution',
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE}/#localbusiness`,
    name: business.name,
    url: business.url,
    image: `${SITE}/logo.png`,
    telephone: business.phone,
    email: business.emails.general,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    priceRange: '$$$',
    areaServed: 'US',
  }
}
