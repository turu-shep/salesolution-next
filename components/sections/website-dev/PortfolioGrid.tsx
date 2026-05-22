import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/website-development-design-services/ — Portfolio grid.
 *
 * Four anonymised case studies. Each one shows: vertical, stack, scope,
 * and the single delivery number that mattered (revenue lift, CWV, time
 * to ship, etc.). Anonymisation is by client request — we publish names
 * only where the client has explicitly signed off, and most industrial
 * distributors prefer the case study without the logo.
 */

type Case = {
  key: string
  vertical: string
  stack: string
  scope: string
  challenge: string
  delivered: string
  metric: { value: string; unit: string; label: string }
}

const CASES: Case[] = [
  {
    key: 'hydraulics',
    vertical: 'Industrial hydraulics distributor',
    stack: 'Headless · Next.js + Shopify Hydrogen',
    scope: 'Full replatform · 8,500 SKUs · 6 months',
    challenge:
      'Magento 1 EOL. Legacy schema invisible to AIO. INP 600ms+ killing add-to-cart on mobile category browsing.',
    delivered:
      'Next.js storefront, headless commerce backend, custom quote-flow + JIC/NPT spec configurators, full schema graph.',
    metric: { value: '+43', unit: '%', label: 'Qualified leads / mo · 6 months post-launch' },
  },
  {
    key: 'fasteners',
    vertical: 'Specialty fasteners · 17 brands',
    stack: 'Shopify Plus B2B',
    scope: 'Migration from WooCommerce · 12k SKUs · 10 weeks',
    challenge:
      'WooCommerce plugin sprawl (61 plugins). Net-terms + tiered pricing handled by three plugins that broke every update. CLS 0.31 on PDPs.',
    delivered:
      'Shopify Plus B2B (companies, catalogs, net terms native). 4 plugins total. Custom Liquid spec-table sections.',
    metric: { value: '0.02', unit: '', label: 'CLS at launch · down from 0.31' },
  },
  {
    key: 'lab-supply',
    vertical: 'Lab + research supply',
    stack: 'WooCommerce · WordPress',
    scope: 'Redesign + perf overhaul · 4,200 SKUs · 8 weeks',
    challenge:
      'Strong editorial / technical content earning SEO equity. Client unwilling to leave WordPress. LCP 4.8s, schema absent.',
    delivered:
      'Kept WordPress. Killed 38 plugins. Custom Gutenberg PDP blocks, server-side Cloudflare edge cache, full schema layer.',
    metric: { value: '1.2', unit: 's', label: 'LCP · down from 4.8s' },
  },
  {
    key: 'fluid-power',
    vertical: 'Fluid power · OEM channel',
    stack: 'Headless · Next.js + Saleor',
    scope: 'Greenfield build · 22k SKUs · 5 months',
    challenge:
      'Net-new commerce channel for a manufacturer. PIM (Acumatica) had to be the source of truth. Multi-currency, multi-tax-region.',
    delivered:
      'Saleor backend wired to Acumatica. Next.js storefront on Vercel Edge. AIO-ready from launch, cited in AIO inside 90 days.',
    metric: { value: '12', unit: 'wk', label: 'Time to first AIO citation post-launch' },
  },
]

export function PortfolioGrid({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Recent builds
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Four shipped builds. <span className="text-ink-400">Anonymised, not embellished.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Industrial distributors rarely co-sign a logo on a case study and
          we respect that. Stack, scope, and delivered numbers below are
          verbatim from the launch retros.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-8 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-2">
        {CASES.map((c, i) => (
          <li
            key={c.key}
            className={i % 2 === 1 ? 'md:border-l md:border-white/10 md:pl-8' : ''}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                  Case &middot; 0{i + 1}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-white">
                  {c.vertical}
                </h3>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Stack
                </dt>
                <dd className="mt-1 text-sm text-ink-200">{c.stack}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Scope
                </dt>
                <dd className="mt-1 text-sm text-ink-200">{c.scope}</dd>
              </div>
            </dl>

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Challenge.{' '}
                </span>
                <span className="text-ink-300">{c.challenge}</span>
              </p>
              <p>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                  Delivered.{' '}
                </span>
                <span className="text-ink-200">{c.delivered}</span>
              </p>
            </div>

            {/* Headline metric */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="font-display text-4xl font-semibold leading-[0.95] tabular-nums tracking-[-0.02em] text-white sm:text-5xl">
                <span className="text-accent-500">{c.metric.value.startsWith('+') || c.metric.value.startsWith('−') ? c.metric.value.charAt(0) : ''}</span>
                {c.metric.value.replace(/^[+−]/, '')}
                <span className="text-ink-400">{c.metric.unit}</span>
              </p>
              <p className="mt-2 text-sm text-ink-300">{c.metric.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
