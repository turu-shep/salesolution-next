import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'
import type { LegalTOCItem } from '@/components/sections/legal/LegalTOC'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Sale Solution collects, uses, and protects personal information. CCPA + GDPR-aligned.',
  alternates: { canonical: 'https://salesolution.net/privacy-policy/' },
}

const LAST_UPDATED = 'May 20, 2026'

const TOC: LegalTOCItem[] = [
  { id: 'placeholder', label: 'Status of this page' },
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'how-we-use-it', label: 'How we use it' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'contact', label: 'Contact' },
]

/**
 * ⚠ Placeholder structural shell. The legally binding text lives on the
 * current WordPress site at /privacy-policy/. Two options before launch:
 *   a) Paste the existing text into the JSX below (one-off)
 *   b) Add a `legalPage` schema to Sanity and have legal own the copy
 *
 * Until then this page reads as "we're between providers" rather than
 * shipping incomplete privacy claims.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      summary="We collect the minimum we need to do good work for you, and we tell you what we do with it."
      tocItems={TOC}
    >
      <h2 id="placeholder">Status of this page</h2>
      <p>
        This is a placeholder during the website rebuild. The full Privacy
        Policy currently published at the legacy site applies in full until
        this page is replaced with the migrated text.
      </p>

      <h2 id="what-we-collect">What we collect</h2>
      <p>
        Contact details you submit via our forms (name, email, phone, website
        URL, revenue range, platform, and the marketing frustration you
        selected). Standard server logs (IP, user agent, referrer). Analytics
        events as gated by your cookie preferences.
      </p>

      <h2 id="how-we-use-it">How we use it</h2>
      <p>
        To respond to your inquiry, to send the resource you requested, and to
        improve our services. We don&rsquo;t sell personal data. We don&rsquo;t
        run brokered re-targeting campaigns on your contact list.
      </p>

      <h2 id="your-rights">Your rights</h2>
      <p>
        You can request access, correction, or deletion of your data at any
        time. Email{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>.
        EU/UK residents under GDPR/UK-GDPR have the standard data-subject
        rights. California residents under CCPA can request a do-not-sell
        record.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions? <a href="/contact-me/">Reach out</a>. We respond within 24
        hours on business days.
      </p>
    </LegalPageLayout>
  )
}
