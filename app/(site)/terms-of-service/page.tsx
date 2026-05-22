import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'
import type { LegalTOCItem } from '@/components/sections/legal/LegalTOC'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms under which Sale Solution provides services.',
  alternates: { canonical: 'https://salesolution.net/terms-of-service/' },
}

const LAST_UPDATED = 'May 20, 2026'

const TOC: LegalTOCItem[] = [
  { id: 'placeholder', label: 'Status of this page' },
  { id: 'use-of-the-site', label: 'Use of the site' },
  { id: 'engagements', label: 'Engagements' },
  { id: 'intellectual-property', label: 'Intellectual property' },
  { id: 'liability', label: 'Liability' },
  { id: 'contact', label: 'Contact' },
]

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      summary="The shorthand version of how we work together. Full engagement letters supersede these for any signed contract."
      tocItems={TOC}
    >
      <h2 id="placeholder">Status of this page</h2>
      <p>
        This is a placeholder during the website rebuild. The full Terms of
        Service currently published at the legacy site applies in full until
        this page is replaced with the migrated text.
      </p>

      <h2 id="use-of-the-site">Use of the site</h2>
      <p>
        By using salesolution.net you agree to these terms. The site is offered
        as-is; we may update content and services without notice.
      </p>

      <h2 id="engagements">Engagements</h2>
      <p>
        Specific projects, retainers, and sprints are governed by a separate
        engagement letter signed by both parties. Where any conflict arises
        between these site terms and a signed engagement letter, the
        engagement letter governs.
      </p>

      <h2 id="intellectual-property">Intellectual property</h2>
      <p>
        Content published on this site is owned by Sale Solution or its
        contributors. You may quote short excerpts for non-commercial purposes
        with attribution; bulk reproduction requires permission.
      </p>

      <h2 id="liability">Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect
        or consequential damages arising from use of the site or its content.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions? <a href="/contact-me/">Get in touch</a>.
      </p>
    </LegalPageLayout>
  )
}
