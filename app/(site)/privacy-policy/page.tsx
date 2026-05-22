import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'
import type { LegalTOCItem } from '@/components/sections/legal/LegalTOC'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How IT Sale Solution LLC (Sale Solution) collects, uses, shares, and protects personal information. GDPR, UK-GDPR, CCPA/CPRA, Virginia CDPA, Colorado CPA, and Florida FDBR aligned.',
  alternates: { canonical: 'https://salesolution.net/privacy-policy/' },
}

const LAST_UPDATED = 'May 21, 2026'

const TOC: LegalTOCItem[] = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'how-we-use-it', label: 'How we use it' },
  { id: 'legal-bases', label: 'Legal bases (EEA/UK)' },
  { id: 'who-we-share-with', label: 'Who we share with' },
  { id: 'cookies-and-tracking', label: 'Cookies & tracking' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'data-retention', label: 'Data retention' },
  { id: 'data-security', label: 'Data security' },
  { id: 'international-transfers', label: 'International transfers' },
  { id: 'minors', label: 'Minors' },
  { id: 'do-not-track', label: 'Do Not Track & GPC' },
  { id: 'changes-to-this-policy', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact' },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      summary="We are a B2B consultancy. We collect contact details you submit through our lead forms, basic server logs, and analytics events gated by your cookie choices. We do not sell personal information. This page explains what we collect, why, who we share it with, and the rights you can exercise."
      tocItems={TOC}
    >
      <h2 id="who-we-are">Who we are</h2>
      <p>
        This Privacy Policy is issued by <strong>IT Sale Solution LLC</strong>,
        a Florida limited liability company doing business as{' '}
        <strong>Sale Solution</strong> (also styled SaleSolution) (&ldquo;Sale
        Solution&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
        &ldquo;our&rdquo;). We are the controller of personal data processed in
        connection with{' '}
        <a href="https://salesolution.net">https://salesolution.net</a>{' '}
        (the &ldquo;Site&rdquo;).
      </p>
      <p>
        <strong>Mailing address:</strong> 200 Kings Point Dr., apt. 1208, Sunny
        Isles Beach, FL 33160, USA
        <br />
        <strong>Phone:</strong> +1 561 531 4339
        <br />
        <strong>Privacy contact:</strong>{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>
      </p>
      <p>
        The Site is an informational and lead-capture site for our B2B
        consultancy services. We do not operate an online store, we do not host
        user accounts, and we do not process consumer payments through the
        Site.
      </p>

      <h2 id="what-we-collect">What we collect</h2>
      <p>
        We limit collection to what we need to answer your inquiry, deliver
        what you asked for, and operate the Site. We collect the following
        categories of personal information.
      </p>

      <h3>Information you submit through forms</h3>
      <p>
        When you complete one of our lead forms &mdash; including{' '}
        <a href="/unlock-growth-audit/">/unlock-growth-audit/</a>,{' '}
        <a href="/contact-me/">/contact-me/</a>, or{' '}
        <a href="/book-growth-call/">/book-growth-call/</a> &mdash; we collect
        the fields you provide. Depending on the form, this typically
        includes:
      </p>
      <ul>
        <li>Full name</li>
        <li>Business email address</li>
        <li>Phone number (optional on some forms)</li>
        <li>Company name and website URL</li>
        <li>Job title or role (where requested)</li>
        <li>Annual revenue range or company size (where requested)</li>
        <li>
          Marketing platform, channel, or specific challenge you selected from
          our prompts
        </li>
        <li>Free-text message, project notes, or context you choose to share</li>
      </ul>
      <p>
        Booking a call via the <a href="/book-growth-call/">/book-growth-call/</a>{' '}
        page is handled by an embedded <strong>Calendly</strong> widget;
        Calendly collects the scheduling fields you submit (name, email,
        timeslot, any answers to its booking questions) and shares them with
        us.
      </p>

      <h3>Server logs and technical information</h3>
      <p>
        When you visit the Site, our hosting and CDN providers automatically
        record standard request data, including:
      </p>
      <ul>
        <li>IP address (truncated where used for analytics)</li>
        <li>Browser type, version, and user-agent string</li>
        <li>Operating system and device type</li>
        <li>Referring URL and the pages you request</li>
        <li>Timestamp of the request and approximate geographic region</li>
      </ul>

      <h3>Analytics and marketing events</h3>
      <p>
        Subject to your consent choices (see{' '}
        <a href="#cookies-and-tracking">Cookies &amp; tracking</a>), our
        analytics and advertising tools record pageviews, scroll depth, click
        and form-submission events, session attributes, and conversion signals.
        Where consent is denied, Google services operate in Consent Mode v2
        with default-denied behavior, transmitting only aggregated, cookieless
        pings.
      </p>
      <p>
        <strong>Hashed identifier.</strong> When you submit a form, we compute
        a SHA-256 hash of your email address (for example,{' '}
        <code>a1b2c3&hellip;</code>) and pass it to Google Analytics 4 as a
        stable <code>user_id</code>. The raw email address is never sent to
        Google. The hash lets us measure the same person across multiple
        sessions and devices without storing or transmitting personally
        identifying data to our analytics provider, and it cannot be reversed
        back into the original email.
      </p>

      <h3>Information from third parties</h3>
      <p>
        We may receive personal information about you from publicly available
        sources or business-data providers (for example, LinkedIn profiles or
        company websites) when we research a prospect who has reached out to
        us. We do not buy bulk contact lists for cold outreach.
      </p>

      <h3>Sensitive personal information</h3>
      <p>
        We do not knowingly collect sensitive personal information as defined
        under CPRA, Virginia CDPA, Colorado CPA, or Florida FDBR (for example,
        government IDs, precise geolocation, biometric data, financial account
        credentials, racial or ethnic origin, religious beliefs, health data,
        sex life or orientation, or union membership). Please do not submit
        such information through our forms.
      </p>

      <h2 id="how-we-use-it">How we use it</h2>
      <p>We use personal information for the following purposes:</p>
      <ul>
        <li>
          <strong>Respond to inquiries.</strong> Reply to messages, follow up
          on lead forms, qualify the opportunity, and schedule calls.
        </li>
        <li>
          <strong>Deliver requested resources.</strong> Send the audit,
          download, proposal, or other material you asked for.
        </li>
        <li>
          <strong>Provide services.</strong> Where we enter an engagement, use
          your contact information to deliver the work and manage the account
          relationship.
        </li>
        <li>
          <strong>Operate and secure the Site.</strong> Run hosting, detect
          abuse, prevent fraud, debug, and improve performance.
        </li>
        <li>
          <strong>Analytics and improvement.</strong> Understand which pages
          and offers perform, where users get stuck, and how to improve our
          Site and content (subject to consent).
        </li>
        <li>
          <strong>Marketing communications.</strong> Where you have asked to
          hear from us, send relevant articles, case studies, or service
          updates. You can unsubscribe at any time.
        </li>
        <li>
          <strong>Legal and compliance.</strong> Comply with applicable laws,
          respond to lawful requests, enforce our terms, and establish or
          defend legal claims.
        </li>
      </ul>
      <p>
        <strong>We do not sell personal information for money.</strong> We do
        not run brokered re-targeting campaigns against our contact list. Where
        third-party advertising cookies are loaded with your consent, certain
        US state privacy laws may treat that as &ldquo;sharing&rdquo; for
        cross-context behavioral advertising; you can opt out as described in{' '}
        <a href="#your-rights">Your rights</a> or by sending the Global Privacy
        Control signal.
      </p>

      <h2 id="legal-bases">Legal bases (EEA/UK)</h2>
      <p>
        If you are in the European Economic Area, the United Kingdom, or
        Switzerland, our processing is grounded in one or more of the
        following legal bases under the GDPR and UK-GDPR:
      </p>
      <ul>
        <li>
          <strong>Consent</strong> (Art. 6(1)(a)). Non-essential cookies,
          analytics, marketing pixels, and optional newsletter subscriptions.
          You may withdraw consent at any time without affecting the
          lawfulness of prior processing.
        </li>
        <li>
          <strong>Contract or steps prior to a contract</strong> (Art. 6(1)(b)).
          Responding to your inquiry, preparing a proposal, scheduling a call,
          and performing any engagement you sign with us.
        </li>
        <li>
          <strong>Legitimate interests</strong> (Art. 6(1)(f)). Operating and
          securing the Site, preventing fraud, basic server-log
          troubleshooting, qualifying inbound leads, and direct B2B
          communications with prospective clients. We balance these interests
          against your rights and freedoms.
        </li>
        <li>
          <strong>Legal obligation</strong> (Art. 6(1)(c)). Tax, accounting,
          and other compliance records; responding to lawful requests from
          authorities.
        </li>
      </ul>

      <h2 id="who-we-share-with">Who we share with</h2>
      <p>
        We share personal information only with the service providers
        (processors / sub-processors) we need to run the Site and follow up on
        leads. We do not sell personal information.
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> &mdash; Site hosting and edge
          infrastructure (United States).
        </li>
        <li>
          <strong>Cloudflare, Inc.</strong> &mdash; Content delivery network,
          DNS, and basic security (United States and global edge).
        </li>
        <li>
          <strong>Sanity.io</strong> &mdash; Content management system for
          editorial content (the CMS itself does not normally process visitor
          personal data).
        </li>
        <li>
          <strong>Resend</strong> &mdash; Transactional email delivery for
          lead-form notifications and the resources we send you.
        </li>
        <li>
          <strong>HubSpot, Inc.</strong> &mdash; CRM and sales engagement
          (HubSpot portal <code>244186307</code>). Lead-form submissions are
          stored in HubSpot so we can manage the relationship.
        </li>
        <li>
          <strong>Google LLC</strong> &mdash; Google Analytics 4 (property{' '}
          <code>G-F0DJT7P1RQ</code>) and Google Ads conversion measurement
          (account <code>AW-17897120027</code>), gated by Consent Mode v2.
          Google Analytics also receives a hashed (SHA-256) version of your
          email address after form submission so the same visitor can be
          reconciled across sessions. Raw email addresses are never sent.
        </li>
        <li>
          <strong>Meta Platforms, Inc.</strong> &mdash; Meta (Facebook) Pixel
          for ad measurement, loaded only when marketing consent is granted.
        </li>
        <li>
          <strong>Calendly LLC</strong> &mdash; Embedded scheduling widget on
          our booking page.
        </li>
      </ul>
      <p>
        Each provider processes data under a written data-processing agreement
        with appropriate confidentiality, security, and use-limitation
        obligations. For transfers from the EEA, the UK, or Switzerland to the
        United States or other third countries, we rely on the European
        Commission&rsquo;s Standard Contractual Clauses (SCCs), the UK
        International Data Transfer Addendum, and, where available, the EU-US
        Data Privacy Framework certification of the recipient.
      </p>
      <p>
        We may also disclose personal information: (i) to professional
        advisers (lawyers, accountants, auditors) under confidentiality;
        (ii) to a successor in interest in connection with a merger,
        acquisition, financing, or sale of assets, subject to equivalent
        privacy protections; and (iii) where required by law, court order, or
        to protect our rights, property, or safety, or that of others.
      </p>

      <h2 id="cookies-and-tracking">Cookies &amp; tracking</h2>
      <p>
        We use cookies and similar technologies (pixels, local storage,
        SDKs) to operate the Site, measure performance, and &mdash; with your
        consent &mdash; measure advertising. Cookies fall into three
        categories:
      </p>
      <ul>
        <li>
          <strong>Strictly necessary.</strong> Required for the Site to
          function (load balancing, security, your consent choice itself).
          These cannot be disabled.
        </li>
        <li>
          <strong>Analytics.</strong> Google Analytics 4 events, pageviews,
          and aggregated session attributes. Loaded only with your consent;
          otherwise GA4 runs in Consent Mode v2 with cookieless pings.
        </li>
        <li>
          <strong>Marketing.</strong> Google Ads and (when enabled) Meta Pixel
          tags used for conversion measurement and re-marketing. Loaded only
          with your marketing consent.
        </li>
      </ul>
      <p>
        Our cookie banner asks for your choices on first visit, and we default
        to deny for non-essential categories. You can change your choices at
        any time by visiting{' '}
        <a href="/opt-out-preferences/">/opt-out-preferences/</a> or by
        clearing cookies for this Site in your browser. We honor the Global
        Privacy Control (GPC) signal as a request to opt out of any sale or
        sharing of personal information.
      </p>

      <h2 id="your-rights">Your rights</h2>
      <p>
        Depending on where you live, you have specific rights over your
        personal information. To exercise any of the rights below, email{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>{' '}
        or write to the mailing address in <a href="#contact">Contact</a>. We
        will verify your identity using information already on file before
        acting on a request. We respond within <strong>45 days</strong> and
        may extend once by an additional 45 days where reasonably necessary,
        telling you why.
      </p>

      <h3>EEA, UK, and Switzerland (GDPR / UK-GDPR)</h3>
      <p>
        You have the right to (i) access your personal data; (ii) request
        rectification of inaccurate data; (iii) request erasure
        (&ldquo;right to be forgotten&rdquo;); (iv) restrict or object to
        processing; (v) data portability; (vi) withdraw consent at any time;
        and (vii) lodge a complaint with your local supervisory authority. We
        do not currently make decisions about you using solely automated
        processing that produces legal or similarly significant effects.
      </p>
      <p>
        We do not maintain an establishment in the EU. If you are an EU
        resident and prefer to address a regulator directly, you may complain
        to the data protection authority in your country of residence, place
        of work, or place of the alleged infringement.
      </p>

      <h3>California (CCPA / CPRA)</h3>
      <p>
        California residents have the right to:
      </p>
      <ul>
        <li>
          <strong>Know</strong> what categories and specific pieces of
          personal information we have collected, the sources, the purposes,
          and the categories of third parties we disclose to.
        </li>
        <li>
          <strong>Delete</strong> personal information we have collected from
          you, subject to legal exceptions.
        </li>
        <li>
          <strong>Correct</strong> inaccurate personal information.
        </li>
        <li>
          <strong>Opt out of sale or sharing</strong> for cross-context
          behavioral advertising. We do not sell personal information for
          money. Where advertising cookies are loaded under your consent and
          may count as &ldquo;sharing,&rdquo; you can opt out via{' '}
          <a href="/opt-out-preferences/">/opt-out-preferences/</a> or by
          sending the Global Privacy Control signal from your browser.
        </li>
        <li>
          <strong>Limit use of sensitive personal information.</strong> We do
          not knowingly collect sensitive PI; if we ever do, you can request
          that we limit its use to that necessary to provide the service.
        </li>
        <li>
          <strong>Non-discrimination.</strong> We will not deny services,
          charge different prices, or provide a different level of quality
          because you exercised a privacy right.
        </li>
        <li>
          <strong>Authorized agents.</strong> You may designate an authorized
          agent to make a request on your behalf by providing written,
          notarized authorization or a valid power of attorney.
        </li>
      </ul>

      <h3>Virginia (VCDPA)</h3>
      <p>
        Virginia residents have the right to confirm processing and access
        their personal data; correct inaccuracies; delete personal data;
        obtain a portable copy; and opt out of (i) targeted advertising, (ii)
        the sale of personal data, and (iii) certain profiling decisions with
        legal or similarly significant effects. We do not sell personal data
        and do not engage in such profiling.
      </p>

      <h3>Colorado (CPA)</h3>
      <p>
        Colorado residents have the right to access, correct, delete, and
        port personal data, and to opt out of targeted advertising, sale of
        personal data, and qualifying profiling. We honor universal opt-out
        mechanisms required by Colorado law, including the Global Privacy
        Control signal.
      </p>

      <h3>Florida (FDBR)</h3>
      <p>
        Florida residents may have rights under the Florida Digital Bill of
        Rights (effective July 1, 2024) where it applies to us, including
        the right to access, correct, delete, obtain a portable copy, and
        opt out of the sale of personal data, targeted advertising, and
        certain profiling. Florida residents also have the right to opt out
        of the collection or processing of sensitive data and the collection
        of personal data collected through a voice or facial recognition
        feature.
      </p>

      <h3>Appeals</h3>
      <p>
        If we decline a privacy request, you may appeal by replying to our
        decision email or writing to{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>{' '}
        with the subject line <strong>&ldquo;Privacy Appeal.&rdquo;</strong>{' '}
        We will respond to the appeal within 45 days. If the appeal is
        denied, residents of Virginia, Colorado, and Florida may contact
        their state Attorney General to submit a complaint.
      </p>

      <h2 id="data-retention">Data retention</h2>
      <p>
        We keep personal information only as long as needed for the purposes
        described in this policy or as required by law. Indicative periods:
      </p>
      <ul>
        <li>
          <strong>Lead-form submissions</strong> (HubSpot CRM): up to{' '}
          <strong>seven (7) years</strong> from the last meaningful
          interaction, to manage ongoing business relationships and to
          preserve evidence of consent and communications for the statute of
          limitations on contract and consumer-protection claims.
        </li>
        <li>
          <strong>Transactional email logs</strong> (Resend): up to{' '}
          <strong>two (2) years</strong> for deliverability auditing.
        </li>
        <li>
          <strong>Server and CDN access logs</strong> (Vercel, Cloudflare):
          rolling <strong>30 to 90 days</strong> for security and debugging.
        </li>
        <li>
          <strong>Analytics events</strong> (Google Analytics 4): retained
          per the GA4 retention setting (up to <strong>14 months</strong>{' '}
          for user- and event-level data); aggregated reports are kept
          longer.
        </li>
        <li>
          <strong>Calendly bookings</strong>: kept for the life of the
          calendar event and ordinary backup cycles thereafter.
        </li>
        <li>
          <strong>Cookie-consent records</strong>: kept for at least{' '}
          <strong>12 months</strong> to demonstrate consent.
        </li>
        <li>
          <strong>Marketing subscribers</strong>: until you unsubscribe, plus
          a short suppression record so we do not contact you again.
        </li>
      </ul>
      <p>
        We may retain information longer where required to comply with legal
        obligations, resolve disputes, or enforce our agreements. When we no
        longer need personal information, we delete it or anonymize it so it
        can no longer be associated with you.
      </p>

      <h2 id="data-security">Data security</h2>
      <p>
        We use commercially reasonable administrative, technical, and
        physical safeguards designed to protect personal information against
        unauthorized access, loss, misuse, or alteration. These include
        encryption in transit (TLS), access controls and least-privilege
        permissions, audit logging, and selection of reputable processors
        with their own security certifications.
      </p>
      <p>
        No method of transmission over the internet or method of electronic
        storage is 100% secure. While we use reasonable means to protect
        your personal information, we cannot guarantee absolute security.
        Please use a strong, unique password for any account you have with
        our processors and notify us promptly at{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>{' '}
        if you suspect unauthorized access to your information.
      </p>

      <h2 id="international-transfers">International transfers</h2>
      <p>
        We are based in the United States and our primary hosting and
        processing infrastructure is located in the United States. If you
        access the Site from outside the United States, your personal
        information will be transferred to, stored in, and processed in the
        United States and any other country where our service providers
        operate.
      </p>
      <p>
        For transfers of personal data from the European Economic Area, the
        United Kingdom, or Switzerland to the United States or other
        countries that have not received an adequacy decision, we rely on
        appropriate safeguards under Article 46 GDPR, including the
        European Commission&rsquo;s Standard Contractual Clauses (SCCs) and
        the UK International Data Transfer Addendum, supplemented by
        additional technical and organizational measures where appropriate.
        Where a processor is certified under the EU-US Data Privacy
        Framework (and its UK Extension and Swiss-US Framework), we may
        also rely on that certification. You may request a copy of the
        relevant transfer mechanism by emailing{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>.
      </p>

      <h2 id="minors">Minors</h2>
      <p>
        The Site is intended for business audiences and is not directed to
        children under <strong>13</strong> years of age. We do not knowingly
        collect personal information from children under 13. Consistent
        with the U.S. Children&rsquo;s Online Privacy Protection Act
        (COPPA), if we learn that we have inadvertently collected personal
        information from a child under 13, we will delete it as quickly as
        practicable. Parents or guardians who believe their child has
        provided personal information to us may contact{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>.
        We do not knowingly sell or share personal information of consumers
        under 16 as those terms are defined under CPRA.
      </p>

      <h2 id="do-not-track">Do Not Track &amp; GPC</h2>
      <p>
        <strong>Do Not Track (DNT).</strong> Some browsers transmit a Do
        Not Track signal. Because there is no industry- or legislative
        consensus on how to interpret DNT, our Site does not respond to DNT
        signals.
      </p>
      <p>
        <strong>Global Privacy Control (GPC).</strong> We honor the Global
        Privacy Control signal as a valid request to opt out of the sale or
        sharing of personal information for cross-context behavioral
        advertising under the California CCPA/CPRA and the Colorado CPA.
        When our Site detects a GPC signal from your browser, we treat your
        visit as one in which marketing cookies and sharing are denied. If
        you have an existing account or identifiable submission with us,
        send the request from the same browser that submitted it so we can
        link the opt-out to your record.
      </p>

      <h2 id="changes-to-this-policy">Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect
        changes in our practices, our service providers, or applicable law.
        When we make material changes, we will update the &ldquo;Last
        updated&rdquo; date at the top of this page and, where appropriate,
        provide additional notice through an in-site banner or by email to
        addresses we have on file. The current version always governs.
        Continued use of the Site after the effective date of an updated
        policy constitutes acknowledgement of the change to the extent
        permitted by law; for material changes that require consent, we
        will seek that consent before applying the change to you.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        For privacy questions or to exercise any right described above,
        contact:
      </p>
      <p>
        <strong>IT Sale Solution LLC</strong>
        <br />
        Attn: Privacy
        <br />
        200 Kings Point Dr., apt. 1208
        <br />
        Sunny Isles Beach, FL 33160, USA
        <br />
        Email:{' '}
        <a href="mailto:privacy@salesolution.net">privacy@salesolution.net</a>
        <br />
        Phone: +1 561 531 4339
      </p>
      <p>
        We aim to acknowledge privacy requests within a reasonable time and
        to respond substantively within 45 days, as described in{' '}
        <a href="#your-rights">Your rights</a>. If you are an EEA, UK, or
        Swiss resident, you may also lodge a complaint with your local data
        protection authority. If you are a U.S. state resident, you may
        contact your state Attorney General after exhausting the appeal
        process above.
      </p>
    </LegalPageLayout>
  )
}
