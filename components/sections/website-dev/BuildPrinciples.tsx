import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/website-development-design-services/ — How we build.
 *
 * Six engineering principles that show up in every build. These are the
 * decisions an experienced operator wants to hear before signing — what
 * gets shipped *by default*, not as an upsell phase.
 *
 * Dark band so it carries technical weight after the lighter stack picker.
 */

type Principle = {
  number: string
  title: string
  body: string
  proof: string
}

const PRINCIPLES: Principle[] = [
  {
    number: '01',
    title: 'Performance is a constraint, not a phase',
    body: 'Core Web Vitals targets live in the SOW. We do not ship a build that fails LCP under 2.0s, INP under 200ms, or CLS under 0.05 on the launch device profile.',
    proof: 'Lighthouse 95+ on mobile, baked-in image CDN, edge rendering.',
  },
  {
    number: '02',
    title: 'AIO-ready from the first commit',
    body: 'Schema.org graph (Product, Offer, FAQ, HowTo, Breadcrumb), entity disambiguation, citation-friendly headings, machine-readable answer blocks — wired in during build, not bolted on by an SEO team.',
    proof: 'Validated against Schema.org + Google Rich Results test pre-launch.',
  },
  {
    number: '03',
    title: 'Plugin-thin by policy',
    body: 'Plugins are technical debt. We write what you need in code your team can read — not a chain of 40 plugins that break on the next platform update.',
    proof: 'Average plugin count at launch: 4 (Shopify) / 14 (WooCommerce).',
  },
  {
    number: '04',
    title: 'Analytics on the same day as the homepage',
    body: 'GA4, server-side conversions, and a first-party event layer are part of the launch checklist. You do not wait for a separate analytics project to know what is converting.',
    proof: 'Server-side GA4 via Cloudflare Worker / Shopify Web Pixel.',
  },
  {
    number: '05',
    title: 'WCAG 2.2 AA, not as a checkbox',
    body: 'Keyboard paths, focus states, screen-reader labels, and color contrast tested on real assistive tech. Industrial buyers include procurement officers who require ADA compliance to purchase.',
    proof: 'axe-core CI integration + manual audit on the top 20 templates.',
  },
  {
    number: '06',
    title: 'You own the code at midnight on launch day',
    body: 'Git repo in your org, hosting in your account, all credentials handed over. We offer a maintenance retainer; you are never locked in to take it.',
    proof: 'Zero-lock-in clause in every SOW since 2021.',
  },
]

export function BuildPrinciples({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          How we build
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Six engineering principles. <span className="text-ink-400">In every SOW.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Most agencies sell the build, then upsell performance, schema,
          analytics, and accessibility as separate phases. We treat those as
          build-time constraints &mdash; or we do not ship.
        </p>
      </div>

      <ol className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <li key={p.number} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-300">
                {p.number}
              </p>
            </div>
            <div className="md:col-span-10">
              <h3 className="font-display text-xl font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-3 text-ink-300">{p.body}</p>
              <div className="mt-4 border-l-2 border-accent-500/50 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                  Default behavior
                </p>
                <p className="mt-1.5 text-sm text-ink-200">{p.proof}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
