import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, personId } from '@/lib/schema'

/**
 * /about/ — the founder entity's home. This is where the sitewide Person
 * (defined in lib/schema.ts globalGraph, referenced by Organization.founder and
 * every Article author via @id) is primarily described, so AI engines and Google
 * have one canonical place to attribute and trust the author. Hardcoded like the
 * other marketing pages; copy mirrors the homepage Operator block.
 */

const ABOUT_URL = `${business.url}/about/`

export const metadata: Metadata = {
  title: 'About Artur Shepel',
  description:
    'Artur Shepel — founder of Sale Solution and AI-growth strategist. 14 years building AI-search, catalog, and content systems for technical B2B, industrial e-commerce, home services, and dental.',
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    type: 'profile',
    url: ABOUT_URL,
    title: 'About Artur Shepel · Sale Solution',
    description:
      'Founder of Sale Solution. 14 years operating growth across industrial distribution, home services, and dental — AI search, catalog, and content systems.',
  },
}

const CREDENTIALS = [
  { label: 'Years operating', value: '14', unit: 'yrs' },
  { label: 'Verticals shipped', value: '8', unit: '' },
  { label: 'Engagements active', value: '6', unit: '' },
]

const PROFILES = [
  { label: 'LinkedIn', href: business.founder.profiles.linkedin },
  { label: 'YouTube', href: business.founder.profiles.youtube },
  { label: 'Instagram', href: business.founder.profiles.instagram },
  { label: 'X', href: business.founder.profiles.twitter },
]

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'About', url: ABOUT_URL },
        ])}
      />
      {/* ProfilePage wraps the sitewide Person entity (full node lives in
          globalGraph) by @id — this page is its primary description. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': ABOUT_URL,
          url: ABOUT_URL,
          name: 'About Artur Shepel',
          mainEntity: { '@id': personId },
        }}
      />

      <ServicesHero
        eyebrow="About · the operator"
        title="One operator."
        titleAccent="No agency layer."
        lede={
          <>
            I&rsquo;m {business.founder.name} &mdash; the person who builds the
            systems and tells you which constraint to fix first. Fourteen years
            running growth across industrial distribution, home services, and
            dental, now focused on getting technical B2B and e&#8209;commerce
            sites cited by AI search.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{
          label: 'Connect on LinkedIn',
          href: business.founder.profiles.linkedin,
        }}
      />

      <SectionRail tone="dark">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Background &amp; track record
            </p>

            <div className="mt-6 max-w-xl space-y-5 text-ink-300">
              <p>
                Fourteen years running growth across industrial distribution,
                home services, and dental: catalog rewrites for distributors, an
                AI receptionist for the contractor stuck on a roof, recovered
                revenue for the practice missing calls at chair time.
              </p>
              <p>
                Sale Solution is small on purpose. No account managers, no decks
                from a junior analyst, no &ldquo;we&rsquo;ll get back to you next
                quarter.&rdquo; You work with the person whose name is on the
                proposal &mdash; the one who builds the engine, runs it, and
                proves it pays.
              </p>
              <p>
                The work now centers on AI search: product and category schema,
                citation engineering, and the content that gets a site quoted
                inside AI Overviews, ChatGPT, and Perplexity instead of buried
                under the manufacturer.
              </p>
            </div>

            {/* Profiles — same set as the Person entity's sameAs. */}
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Find me
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {PROFILES.map((p) => (
                  <li key={p.label}>
                    <Link
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
                    >
                      {p.label}
                      <span aria-hidden>↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Portrait + credentials column. */}
          <div className="md:col-span-5">
            <div className="relative mb-6 aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image
                // WebP at native res — ~33% lighter than the JPG. The JPG stays
                // the Person.image source (business.founder.image) for schema.
                src="/artur-shepel.webp"
                alt={`${business.founder.name}, ${business.founder.role}`}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-cover object-top"
              />
            </div>

            <div className="border border-white/10 bg-black/30 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                <span>{business.founder.name}</span>
                <span className="text-ink-400">{business.founder.role}</span>
              </div>

              <dl className="divide-y divide-white/10">
                {CREDENTIALS.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-baseline justify-between px-5 py-4"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                      {c.label}
                    </dt>
                    <dd className="font-display text-3xl font-semibold tabular-nums leading-none text-white">
                      {c.value}
                      {c.unit && (
                        <span className="ml-1 text-base font-normal text-ink-400">
                          {c.unit}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-white/10 px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                  Operator stance
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-200">
                  &ldquo;Build the engine, run the engine, prove it pays. A
                  9-field schema for a fitting or a 24/7 receptionist for a roofer
                  &mdash; the operator stance doesn&rsquo;t change.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionRail>

      <FinalCTARail />
    </>
  )
}
