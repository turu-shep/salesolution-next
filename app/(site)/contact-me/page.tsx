import type { Metadata } from 'next'

import { ContactDirectory } from '@/components/sections/contact/ContactDirectory'
import { ContactFormSection } from '@/components/sections/contact/ContactFormSection'
import { ContactHero } from '@/components/sections/contact/ContactHero'
import { ContactPaths } from '@/components/sections/contact/ContactPaths'
import { JsonLd } from '@/components/seo/JsonLd'
import { contactPageSchema, localBusinessSchema } from '@/lib/business-schema'

export const metadata: Metadata = {
  title: 'Contact me — Direct access to Artur Shepel',
  description:
    'Talk to a senior AI-growth and personal-brand strategist. 24-hour reply guarantee. Phone, email, or form — your pick.',
  alternates: { canonical: 'https://salesolution.net/contact-me/' },
  openGraph: {
    type: 'website',
    url: 'https://salesolution.net/contact-me/',
    siteName: 'Sale Solution',
  },
}

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageSchema()} />
      <JsonLd data={localBusinessSchema()} />

      <ContactHero />
      <ContactDirectory />
      <ContactPaths />
      <ContactFormSection />
    </>
  )
}
