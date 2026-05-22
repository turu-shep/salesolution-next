import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * Differentiates the three reasons someone lands on this page so they
 * route themselves correctly: hiring conversation, general/press, or
 * recruiting / career inquiry. Sparse — one paragraph per path, one CTA
 * link, no card chrome. Dark tone so it carries the L-D rhythm without
 * a sales feel.
 */

type Path = {
  number: string
  eyebrow: string
  heading: React.ReactNode
  body: React.ReactNode
  action: { label: string; href: string; external?: boolean }
}

const PATHS: Path[] = [
  {
    number: '01',
    eyebrow: 'Hiring conversation',
    heading: 'You want to scope an engagement.',
    body: (
      <>
        Phone or the form below are best. Bring your store URL, monthly
        revenue range, and the single biggest constraint you&rsquo;re
        trying to remove. We can usually tell within 15 minutes whether
        we&rsquo;re the right fit &mdash; honestly, either way.
      </>
    ),
    action: { label: 'Book a strategy call', href: '/book-growth-call/' },
  },
  {
    number: '02',
    eyebrow: 'General question',
    heading: 'You read something and want context.',
    body: (
      <>
        Email is fastest. Article references, framework questions, a tactic
        you saw in a guide and want to apply &mdash; that all goes to the
        general inbox. Same-day acknowledgement, full answer inside a
        business day.
      </>
    ),
    action: {
      label: `Email ${business.emails.general}`,
      href: `mailto:${business.emails.general}`,
    },
  },
  {
    number: '03',
    eyebrow: 'Press · media · partnerships',
    heading: (
      <>You&rsquo;re writing, podcasting, or proposing.</>
    ),
    body: (
      <>
        LinkedIn DM is the shortest path for podcasts, panel invites, guest
        posts, and partnership conversations. For anything that needs a
        formal response or NDA, use the general inbox with &ldquo;Press&rdquo;
        in the subject.
      </>
    ),
    action: {
      label: 'LinkedIn — Artur Shepel',
      href: business.social.linkedin,
      external: true,
    },
  },
]

export function ContactPaths() {
  return (
    <SectionRail tone="dark" id="paths">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Route yourself
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Three paths in. <span className="text-ink-400">Pick the honest one.</span>
        </h2>
        <p className="mt-6 max-w-xl text-ink-300">
          Every contact ends up in the same place &mdash; but signalling
          which conversation you want shortens the reply by hours.
        </p>
      </div>

      <ol className="mt-14 grid gap-px bg-white/10 md:mt-20 md:grid-cols-3">
        {PATHS.map((p) => (
          <li key={p.number} className="bg-surface-dark p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              {p.number} &nbsp;/&nbsp; {p.eyebrow}
            </p>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-white">
              {p.heading}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-300">
              {p.body}
            </p>

            <Link
              href={p.action.href}
              target={p.action.external ? '_blank' : undefined}
              rel={p.action.external ? 'noopener noreferrer' : undefined}
              data-cta={
                p.action.href === '/book-growth-call/'
                  ? 'book_call__contact_path'
                  : undefined
              }
              data-cta-location={
                p.action.href === '/book-growth-call/' ? 'mid_body' : undefined
              }
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
            >
              {p.action.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
