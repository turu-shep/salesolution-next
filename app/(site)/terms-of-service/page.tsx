import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'
import type { LegalTOCItem } from '@/components/sections/legal/LegalTOC'
import { business } from '@/lib/business'

// Entity, address, and inbound email all come from lib/business.ts (the NAP
// SSOT) so a legal page can never drift from the registered identity.
const CONTACT_EMAIL = business.emails.general

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing your use of salesolution.net. Paid engagements are governed separately by a signed engagement letter.',
  alternates: { canonical: 'https://salesolution.net/terms-of-service/' },
}

const LAST_UPDATED = 'July 27, 2026'

const TOC: LegalTOCItem[] = [
  { id: 'acceptance', label: '1. Acceptance of terms' },
  { id: 'eligibility', label: '2. Eligibility' },
  { id: 'permitted-use', label: '3. Permitted use' },
  { id: 'prohibited-use', label: '4. Prohibited use' },
  { id: 'intellectual-property', label: '5. Intellectual property' },
  { id: 'engagement-work', label: '6. Engagement work governed separately' },
  { id: 'forms-and-lead-capture', label: '7. Forms and lead capture' },
  { id: 'third-party-tools', label: '8. Third-party tools and links' },
  { id: 'modifications', label: '9. Modifications' },
  { id: 'termination', label: '10. Termination' },
  { id: 'disclaimer-of-warranties', label: '11. Disclaimer of warranties' },
  { id: 'limitation-of-liability', label: '12. Limitation of liability' },
  { id: 'indemnification', label: '13. Indemnification' },
  { id: 'governing-law', label: '14. Governing law' },
  { id: 'dispute-resolution', label: '15. Dispute resolution' },
  { id: 'electronic-communications', label: '16. Electronic communications' },
  { id: 'california-residents', label: '17. California residents' },
  { id: 'severability', label: '18. Severability' },
  { id: 'entire-agreement', label: '19. Entire agreement' },
  { id: 'no-waiver', label: '20. No waiver' },
  { id: 'assignment', label: '21. Assignment' },
  { id: 'notices', label: '22. Notices' },
  { id: 'contact', label: '23. Contact' },
]

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      summary="These terms govern your use of salesolution.net. Paid work — audits, installs, retainers, consulting, content production — is governed by a separate engagement letter signed by both parties."
      tocItems={TOC}
    >
      <p>
        These Terms of Service (the &ldquo;<strong>Terms</strong>&rdquo;) form a
        binding agreement between you (&ldquo;<strong>you</strong>&rdquo; or
        &ldquo;<strong>your</strong>&rdquo;) and{' '}
        <strong>{business.legalName}</strong>, a Florida limited liability
        company, doing business as <strong>{business.dba}</strong>{' '}
        (&ldquo;<strong>Sale Solution</strong>,&rdquo; &ldquo;
        <strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or
        &ldquo;<strong>our</strong>&rdquo;), regarding your access to and use of
        the website located at{' '}
        <a href="https://salesolution.net/">https://salesolution.net</a> and any
        subdomains, pages, or features offered through it (collectively, the
        &ldquo;<strong>Site</strong>&rdquo;). Please read these Terms carefully.
        They include disclaimers of warranty, limitations of liability, a class
        action waiver, a jury trial waiver, and a binding arbitration agreement
        that affect your legal rights.
      </p>

      <h2 id="acceptance">1. Acceptance of terms</h2>
      <p>
        By accessing, browsing, or otherwise using the Site, you{' '}
        <strong>agree</strong> to be bound by these Terms, our{' '}
        <a href="/privacy-policy/">Privacy Policy</a>, and our{' '}
        <a href="/disclaimer/">Disclaimer</a>, each incorporated by reference.
        If you do not agree to any part of these Terms, you must{' '}
        <strong>not</strong> use the Site.
      </p>
      <p>
        If you use the Site on behalf of an organization, you represent and
        warrant that you have the authority to bind that organization to these
        Terms, and &ldquo;you&rdquo; refers to both you and that organization.
      </p>

      <h2 id="eligibility">2. Eligibility</h2>
      <p>
        You must be at least <strong>18 years of age</strong> and have the
        legal capacity to enter into a binding contract to use the Site. By
        using the Site, you represent and warrant that you meet these
        requirements and that your use of the Site does not violate any law or
        regulation applicable to you.
      </p>

      <h2 id="permitted-use">3. Permitted use</h2>
      <p>
        Subject to your compliance with these Terms, we grant you a limited,
        non-exclusive, non-transferable, non-sublicensable, and revocable
        license to:
      </p>
      <ul>
        <li>
          access and read the Site&rsquo;s publicly available content for your
          personal use or internal business evaluation;
        </li>
        <li>
          submit lead-capture forms, contact forms, and booking requests in
          good faith with accurate information; and
        </li>
        <li>
          share short, attributed quotes of our content as described in
          Section 5 below.
        </li>
      </ul>
      <p>
        All other uses require our prior written permission.
      </p>

      <h2 id="prohibited-use">4. Prohibited use</h2>
      <p>You <strong>agree</strong> that you will not, and will not permit any third party to:</p>
      <ul>
        <li>
          use any scraper, robot, spider, crawler, data-mining tool, or other
          automated means to access, retrieve, copy, or index the Site or its
          content, except for standard public search-engine indexing (e.g.,
          Googlebot) acting in accordance with our robots directives;
        </li>
        <li>
          reverse engineer, decompile, disassemble, or otherwise attempt to
          derive the source code, structure, or underlying ideas of any part
          of the Site;
        </li>
        <li>
          frame, mirror, deep-link, or embed any portion of the Site within
          another site or application without our prior written permission;
        </li>
        <li>
          bypass, disable, or otherwise circumvent any security, authentication,
          or access-control measure of the Site;
        </li>
        <li>
          attempt to access non-public areas of the Site, including without
          limitation URLs under <code>/api/</code>, <code>/studio/</code>, or{' '}
          <code>/dev/</code>, or any administrative interface, staging
          environment, or internal endpoint;
        </li>
        <li>
          impersonate any person or entity, falsely state or misrepresent your
          affiliation with a person or entity, or submit any false, inaccurate,
          or misleading information through any form on the Site;
        </li>
        <li>
          harass, threaten, defame, or otherwise harm any person, or send spam,
          chain letters, or unsolicited commercial communications to or through
          the Site;
        </li>
        <li>
          upload, transmit, or distribute any virus, worm, Trojan horse,
          ransomware, time bomb, or other malicious or harmful code;
        </li>
        <li>
          infringe any patent, trademark, copyright, trade secret, publicity,
          privacy, or other proprietary right of any person;
        </li>
        <li>
          use the Site in any manner that violates any applicable local, state,
          national, or international law or regulation; or
        </li>
        <li>
          use the Site, or any content or information obtained from it, to
          develop, market, or operate a product or service that competes with
          Sale Solution.
        </li>
      </ul>

      <h2 id="intellectual-property">5. Intellectual property</h2>
      <p>
        All content, materials, and features on the Site &mdash; including text,
        articles, guides, case studies, code, software, design, layout,
        graphics, illustrations, photographs, logos, brand marks, audio, video,
        data models, schemas, and the selection, coordination, and arrangement
        of the foregoing &mdash; are owned by IT Sale Solution LLC or its
        licensors and are protected by United States and international
        copyright, trademark, trade secret, and other intellectual property
        laws.
      </p>
      <p>
        Subject to these Terms, we grant you a non-exclusive, non-transferable,
        revocable license to view Site content for your personal use or internal
        business evaluation. You may quote up to <strong>200 words</strong> of
        any single article or page on the Site for non-commercial commentary,
        criticism, or reporting, provided you include (a) clear attribution to
        Sale Solution and (b) a back-link to the original page on{' '}
        <a href="https://salesolution.net/">salesolution.net</a>. Any
        reproduction, republication, distribution, public display, or
        derivative use beyond this allowance &mdash; including bulk reproduction,
        training of machine-learning models on Site content, or commercial
        republication &mdash; requires our prior written permission.
      </p>
      <p>
        &ldquo;Sale Solution,&rdquo; &ldquo;SaleSolution,&rdquo; the Sale
        Solution logo, and related names and marks are trademarks of IT Sale
        Solution LLC. All other trademarks referenced on the Site are the
        property of their respective owners; reference to them does not imply
        endorsement.
      </p>

      <h2 id="engagement-work">6. Engagement work governed separately</h2>
      <p>
        These Terms govern only your use of the Site. <strong>All paid work</strong>{' '}
        provided by Sale Solution &mdash; including audits, engine installs,
        retainers, consulting, content production, and any other professional
        services &mdash; is governed exclusively by a separate written
        engagement letter (or master services agreement and statement of work)
        signed by both parties (each, an &ldquo;<strong>Engagement Letter</strong>&rdquo;).
      </p>
      <p>
        Where any conflict or inconsistency exists between these Terms and a
        signed Engagement Letter with respect to that paid work, the{' '}
        <strong>Engagement Letter controls</strong>. Nothing in these Terms
        creates any obligation on Sale Solution to provide professional
        services in the absence of an Engagement Letter.
      </p>
      <p>
        <strong>Refunds and cancellation.</strong> Refunds and cancellation
        terms are defined in each Engagement Letter signed by both parties.
        These Terms do not create any refund right with respect to paid work.
      </p>

      <h2 id="forms-and-lead-capture">7. Forms and lead capture</h2>
      <p>
        When you submit information through any form on the Site &mdash;
        including contact forms, audit requests, call-booking flows, and
        newsletter sign-ups &mdash; you <strong>represent and warrant</strong>{' '}
        that:
      </p>
      <ul>
        <li>
          the information you provide is true, accurate, current, and complete;
        </li>
        <li>
          you have the authority to provide that information, including any
          information about an organization on whose behalf you act; and
        </li>
        <li>
          your submission does not infringe the rights of any third party or
          violate any applicable law.
        </li>
      </ul>
      <p>
        By submitting a form, you <strong>authorize</strong> Sale Solution to
        contact you by email, phone, or other channel you provide, for the
        purpose of responding to your inquiry, delivering any resource you
        requested, or following up on a prospective engagement. Such
        communications are handled in accordance with our{' '}
        <a href="/privacy-policy/">Privacy Policy</a>. You can adjust your
        preferences at any time via our{' '}
        <a href="/communication-preferences/">communication preferences</a>{' '}
        page or by replying to any communication with an opt-out request.
      </p>

      <h2 id="third-party-tools">8. Third-party tools and links</h2>
      <p>
        The Site may embed, link to, or otherwise integrate third-party
        services &mdash; including (without limitation) calendar booking
        (e.g., Calendly), form and CRM providers (e.g., HubSpot), analytics
        providers, payment processors used for any Engagement Letter, social
        media platforms, and external articles. We do not own, operate, or
        control those services, and we are <strong>not responsible</strong>{' '}
        for their content, availability, terms of service, privacy practices,
        or any act or omission of their operators. Your use of any third-party
        service is at your own risk and subject to that service&rsquo;s own
        terms.
      </p>

      <h2 id="modifications">9. Modifications</h2>
      <p>
        We may modify the Site, its content, or these Terms at any time. When
        we change these Terms, we will update the &ldquo;Last updated&rdquo;
        date at the top of this page. For <strong>material changes</strong>,
        we will provide reasonable prior notice where practicable &mdash; for
        example, by posting an on-site banner or, where we hold your contact
        details for that purpose, by email. Your continued use of the Site
        after the effective date of any change constitutes your acceptance of
        the updated Terms. If you do not agree to the updated Terms, you must
        stop using the Site.
      </p>

      <h2 id="termination">10. Termination</h2>
      <p>
        We may suspend, restrict, or terminate your access to all or part of
        the Site at any time, with or without notice and with or without
        cause, including (without limitation) if we believe you have breached
        these Terms. Upon termination, your license under Section 3 ends
        immediately. The following provisions survive any termination or
        expiration of these Terms: Section 5 (Intellectual property), Section
        6 (Engagement work governed separately), Section 11 (Disclaimer of
        warranties), Section 12 (Limitation of liability), Section 13
        (Indemnification), Section 14 (Governing law), Section 15 (Dispute
        resolution), and Sections 18&ndash;22.
      </p>

      <h2 id="disclaimer-of-warranties">11. Disclaimer of warranties</h2>
      <p>
        <strong>
          THE SITE AND ALL CONTENT, MATERIALS, AND FEATURES MADE AVAILABLE
          THROUGH IT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE
          LAW, IT SALE SOLUTION LLC DISCLAIMS ALL WARRANTIES, INCLUDING
          WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, AND
          ANY WARRANTIES ARISING FROM COURSE OF DEALING, COURSE OF
          PERFORMANCE, OR USAGE OF TRADE.
        </strong>
      </p>
      <p>
        <strong>
          WE MAKE NO WARRANTY THAT THE SITE WILL BE ACCURATE, COMPLETE,
          RELIABLE, SECURE, UNINTERRUPTED, OR ERROR-FREE; THAT DEFECTS WILL BE
          CORRECTED; OR THAT THE SITE OR THE SERVERS THAT MAKE IT AVAILABLE
          ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. ANY OUTCOMES,
          METRICS, OR RESULTS DESCRIBED IN CASE STUDIES, ARTICLES, OR OTHER
          MATERIALS ON THE SITE REFLECT SPECIFIC ENGAGEMENTS UNDER SPECIFIC
          CONDITIONS AND ARE NOT GUARANTEED FOR ANY READER OR PROSPECTIVE
          CLIENT.
        </strong>
      </p>

      <h2 id="limitation-of-liability">12. Limitation of liability</h2>
      <p>
        <strong>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL
          IT SALE SOLUTION LLC OR ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES,
          CONTRACTORS, AGENTS, LICENSORS, OR AFFILIATES BE LIABLE TO YOU OR
          ANY THIRD PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          PUNITIVE, OR EXEMPLARY DAMAGES &mdash; INCLUDING WITHOUT LIMITATION
          LOST PROFITS, LOST REVENUE, LOST DATA, LOSS OF GOODWILL, OR BUSINESS
          INTERRUPTION &mdash; ARISING OUT OF OR RELATED TO YOUR USE OF, OR
          INABILITY TO USE, THE SITE, WHETHER BASED ON WARRANTY, CONTRACT,
          TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, STATUTE, OR ANY
          OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES.
        </strong>
      </p>
      <p>
        <strong>
          IN NO EVENT WILL THE AGGREGATE LIABILITY OF IT SALE SOLUTION LLC AND
          ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, CONTRACTORS, AGENTS,
          LICENSORS, AND AFFILIATES FOR ALL CLAIMS ARISING FROM OR RELATING TO
          YOUR USE OF THE SITE EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU
          PAID TO US, IF ANY, IN THE SIX (6) MONTHS IMMEDIATELY PRECEDING THE
          EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS
          (USD $100).
        </strong>
      </p>
      <p>
        Some jurisdictions do not allow the exclusion or limitation of certain
        damages, so some of the above limitations may not apply to you. In
        such jurisdictions, our liability is limited to the maximum extent
        permitted by law.
      </p>

      <h2 id="indemnification">13. Indemnification</h2>
      <p>
        You <strong>agree</strong> to defend, indemnify, and hold harmless IT
        Sale Solution LLC and its members, managers, officers, employees,
        contractors, agents, licensors, and affiliates from and against any
        and all claims, demands, actions, proceedings, losses, liabilities,
        damages, costs, and expenses (including reasonable attorneys&rsquo;
        fees) arising out of or relating to: (a) your use of, or activities in
        connection with, the Site; (b) your breach or alleged breach of these
        Terms; (c) your breach of any representation or warranty made under
        these Terms; (d) your violation of any law or regulation; or (e) your
        infringement or alleged infringement of any third party&rsquo;s rights.
        We reserve the right to assume the exclusive defense and control of
        any matter otherwise subject to indemnification by you, in which case
        you will cooperate with us in asserting any available defenses.
      </p>

      <h2 id="governing-law">14. Governing law</h2>
      <p>
        These Terms and any dispute arising out of or relating to them or to
        your use of the Site are governed by and construed in accordance with
        the laws of the <strong>State of Florida, USA</strong>, and applicable
        federal U.S. law, without regard to its conflict-of-law principles.
        The United Nations Convention on Contracts for the International Sale
        of Goods (CISG) does not apply to these Terms.
      </p>

      <h2 id="dispute-resolution">15. Dispute resolution</h2>

      <h3>15.1 Informal negotiation first</h3>
      <p>
        Before initiating any formal proceeding, the parties{' '}
        <strong>agree</strong> to attempt in good faith to resolve any dispute
        arising out of or relating to these Terms or the Site through informal
        negotiation. The party raising the dispute must send written notice to
        the other party describing the dispute and proposed resolution. The
        parties will then have <strong>thirty (30) days</strong> from receipt
        of that notice to attempt to resolve the dispute. Notices to Sale
        Solution must be sent to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or
        the mailing address in Section 23.
      </p>

      <h3>15.2 Binding arbitration</h3>
      <p>
        If the dispute is not resolved through informal negotiation within 30
        days, it will be resolved by <strong>binding arbitration</strong>{' '}
        administered by the <strong>American Arbitration Association (AAA)</strong>{' '}
        under its Commercial Arbitration Rules then in effect. The arbitration
        will be conducted by a <strong>single arbitrator</strong>, seated in{' '}
        <strong>Miami-Dade County, Florida, USA</strong>, in the{' '}
        <strong>English</strong> language. Judgment on the award rendered by
        the arbitrator may be entered in any court of competent jurisdiction.
        The arbitrator&rsquo;s authority is limited to deciding the dispute
        before the arbitrator and may not consolidate more than one
        person&rsquo;s claims or preside over any form of representative or
        class proceeding.
      </p>

      <h3>15.3 Class action waiver and jury trial waiver</h3>
      <p>
        You and Sale Solution each <strong>agree</strong> that any claim
        between us will be brought solely in your or our individual capacity
        and not as a plaintiff or class member in any purported class,
        collective, consolidated, or representative proceeding. You and Sale
        Solution each <strong>waive</strong>, to the maximum extent permitted
        by applicable law, any right to a <strong>trial by jury</strong> in
        any action or proceeding arising out of or relating to these Terms or
        the Site.
      </p>

      <h3>15.4 Exceptions</h3>
      <p>
        Notwithstanding Section 15.2, either party may seek (a){' '}
        <strong>injunctive or other equitable relief</strong> in any court of
        competent jurisdiction to protect its intellectual property, trade
        secrets, or privacy interests, and (b) relief in a{' '}
        <strong>small-claims court</strong> for any matter that qualifies for
        that court&rsquo;s jurisdiction, in each case without first
        proceeding to arbitration.
      </p>

      <h3>15.5 Time limit for claims</h3>
      <p>
        To the maximum extent permitted by applicable law, any claim arising
        out of or relating to these Terms or the Site must be filed within{' '}
        <strong>one (1) year</strong> after the claim accrued; otherwise, the
        claim is permanently barred.
      </p>

      <h2 id="electronic-communications">16. Electronic communications and e-signatures</h2>
      <p>
        You <strong>consent</strong> to receive communications from us in
        electronic form (including by email and by posting notices on the
        Site) and <strong>agree</strong> that all agreements, notices,
        disclosures, and other communications we provide to you electronically
        satisfy any legal requirement that such communications be in writing.
        Where you accept these Terms or any Engagement Letter electronically
        &mdash; by clicking a button, checking a box, or otherwise indicating
        assent &mdash; you <strong>agree</strong> that your electronic
        signature is the legal equivalent of your handwritten signature under
        the U.S. Electronic Signatures in Global and National Commerce Act
        (E-SIGN) and the Uniform Electronic Transactions Act (UETA), and
        equivalent laws in other jurisdictions where applicable.
      </p>

      <h2 id="california-residents">17. California residents</h2>
      <p>
        Under California Civil Code Section 1789.3, California residents are
        entitled to the following consumer-rights notice: the Complaint
        Assistance Unit of the Division of Consumer Services of the California
        Department of Consumer Affairs may be contacted in writing at{' '}
        <strong>
          1625 N. Market Blvd., Suite N 112, Sacramento, CA 95834
        </strong>
        , or by telephone at <strong>(800) 952-5210</strong>.
      </p>

      <h2 id="severability">18. Severability</h2>
      <p>
        If any provision of these Terms is held invalid, illegal, or
        unenforceable by a court or arbitrator of competent jurisdiction, that
        provision will be reformed to the minimum extent necessary to make it
        valid and enforceable, and the remaining provisions will continue in
        full force and effect.
      </p>

      <h2 id="entire-agreement">19. Entire agreement</h2>
      <p>
        These Terms, together with our{' '}
        <a href="/privacy-policy/">Privacy Policy</a>, our{' '}
        <a href="/disclaimer/">Disclaimer</a>, and any Engagement Letter
        signed by both parties, constitute the entire agreement between you
        and Sale Solution regarding your use of the Site and supersede all
        prior or contemporaneous understandings, communications, and proposals
        on the same subject matter.
      </p>

      <h2 id="no-waiver">20. No waiver</h2>
      <p>
        Our failure to enforce any right or provision of these Terms is not a
        waiver of that right or provision. Any waiver must be in writing and
        signed by an authorized representative of Sale Solution to be
        effective.
      </p>

      <h2 id="assignment">21. Assignment</h2>
      <p>
        We may assign, transfer, or delegate these Terms, in whole or in part,
        without restriction &mdash; including, without limitation, in
        connection with a merger, acquisition, reorganization, or sale of all
        or substantially all of our assets. You may <strong>not</strong>{' '}
        assign, transfer, or delegate these Terms or any of your rights or
        obligations under them without our prior written consent. Any
        attempted assignment in violation of this section is void.
      </p>

      <h2 id="notices">22. Notices</h2>
      <p>
        Notices to Sale Solution must be sent to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or
        by mail to{' '}
        <strong>
          {business.legalName}, {business.address.street},{' '}
          {business.address.city}, {business.address.region}{' '}
          {business.address.postalCode}, USA
        </strong>
        . We may provide
        notices to you by email at the address you most recently provided to
        us, by posting on the Site, or by any other means reasonably designed
        to reach you. Notices are effective when delivered (for email and
        on-site posting) or three (3) business days after posting (for mail).
      </p>

      <h2 id="contact">23. Contact</h2>
      <p>
        Questions about these Terms? Reach out to us using the details below
        or via our <a href="/contact-me/">contact page</a>.
      </p>
      <p>
        <strong>{business.legalName}</strong>
        <br />
        a Florida limited liability company, doing business as {business.dba}
        <br />
        {business.address.street}
        <br />
        {business.address.city}, {business.address.region}{' '}
        {business.address.postalCode}, USA
        <br />
        Phone: <a href="tel:+15615314339">+1 561 531 4339</a>
        <br />
        Legal, notices, and general inquiries:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Web: <a href="https://salesolution.net/">https://salesolution.net</a>
      </p>
    </LegalPageLayout>
  )
}
