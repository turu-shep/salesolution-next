/**
 * Visual proof that every design token in globals.css renders correctly.
 * Used as the eyeball-test gate before building real templates.
 *
 * /_dev/styleguide — `_dev` keeps the path obvious and `noindex` keeps it
 * out of search. Will be removed (or moved behind a flag) before launch.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design system styleguide',
  robots: { index: false, follow: false },
}

const brand = [
  { name: 'brand-50', hex: '#f0f4ff' },
  { name: 'brand-100', hex: '#f3f5ff' },
  { name: 'brand-200', hex: '#edf1ff' },
  { name: 'brand-300', hex: '#c8d2ff' },
  { name: 'brand-500', hex: '#4169e1' },
  { name: 'brand-600', hex: '#2652ef' },
  { name: 'brand-700', hex: '#1e3fcc' },
  { name: 'brand-900', hex: '#050c23' },
]

const ctas = [
  { name: 'cta-green-500', hex: '#09bc8a' },
  { name: 'cta-green-600', hex: '#07a37a' },
  { name: 'cta-purple-500', hex: '#9826ef' },
  { name: 'cta-purple-600', hex: '#8419d6' },
]

const semantic = [
  { name: 'danger-50', hex: '#fef2f2' },
  { name: 'danger-100', hex: '#fff8f8' },
  { name: 'danger-500', hex: '#ff4242' },
  { name: 'warning-50', hex: '#fff8e8' },
]

const surfaces = [
  { name: 'surface', hex: '#ffffff', border: true },
  { name: 'surface-alt', hex: '#f7f7f7' },
  { name: 'surface-tint-blue', hex: '#f9f9ff' },
  { name: 'surface-tint-cool', hex: '#f5f9ff' },
  { name: 'surface-tint-warm', hex: '#fff8f8' },
  { name: 'surface-result', hex: '#f8fafc' },
  { name: 'surface-dark', hex: '#050c23' },
]

const inks = [
  { name: 'ink-900', hex: '#131415' },
  { name: 'ink-800', hex: '#1c1c1c' },
  { name: 'ink-700', hex: '#404040' },
  { name: 'ink-500', hex: '#69778b' },
  { name: 'ink-400', hex: '#737d9d' },
  { name: 'ink-300', hex: '#92979b' },
]

function Swatch({
  name,
  hex,
  border,
}: {
  name: string
  hex: string
  border?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-20 rounded-md ${border ? 'ring-1 ring-ink-300' : ''}`}
        style={{ background: hex }}
      />
      <div className="text-xs">
        <div className="font-medium text-ink-800">{name}</div>
        <div className="font-mono text-ink-500">{hex}</div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-ink-300/30 pt-10">
      <h2 className="mb-6 font-display text-2xl font-semibold text-ink-800">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-600">
          Internal · noindex
        </p>
        <h1 className="mt-2 font-display">Design system</h1>
        <p className="mt-4 max-w-2xl text-ink-500">
          Every token defined in <code className="rounded bg-surface-alt px-1.5 py-0.5 text-sm">app/globals.css</code>{' '}
          rendered visually. If anything below looks wrong, the rebuild will
          look wrong too — fix here first.
        </p>
      </header>

      <Section title="Color · brand">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {brand.map((c) => <Swatch key={c.name} {...c} />)}
        </div>
      </Section>

      <Section title="Color · alt CTAs (kept semantic per funnel — D2)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ctas.map((c) => <Swatch key={c.name} {...c} />)}
        </div>
      </Section>

      <Section title="Color · semantic">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {semantic.map((c) => <Swatch key={c.name} {...c} />)}
        </div>
      </Section>

      <Section title="Color · surfaces">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {surfaces.map((c) => <Swatch key={c.name} {...c} />)}
        </div>
      </Section>

      <Section title="Color · ink (text)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {inks.map((c) => <Swatch key={c.name} {...c} />)}
        </div>
      </Section>

      <Section title="Typography · headings (Manrope)">
        <div className="space-y-4">
          <h1>Display H1 / Manrope 700 / clamp 32–48px</h1>
          <h2>Section H2 / Manrope 600 / clamp 28–36px</h2>
          <h3>Sub H3 / Manrope 600 / clamp 22–24px</h3>
          <h4>Card H4 / Manrope 600 / 18px</h4>
        </div>
      </Section>

      <Section title="Typography · body (Inter)">
        <div className="max-w-2xl space-y-4">
          <p className="text-lg text-ink-500">
            Lede paragraph. 18px / muted ink. Used directly under H1s in heroes,
            and at the top of long-form posts and guides.
          </p>
          <p>
            Body paragraph. 16px / ink-700 default. Reading at this size and
            line-height is the default experience across every template.
          </p>
          <p className="text-sm text-ink-500">
            Small / 14px / muted. Reserved for metadata, dates, captions,
            footer columns.
          </p>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-600">
            Eyebrow · 12px uppercase · brand-600
          </p>
        </div>
      </Section>

      <Section title="Buttons · primary blue (audit funnels)">
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700">
            Get Your Free Growth Audit
          </button>
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700">
            See Content Packages
          </button>
          <button className="rounded-pill bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700">
            Send me the checklist
          </button>
        </div>
      </Section>

      <Section title="Buttons · alt green (strategy call)">
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="rounded-md px-6 py-3 text-sm font-semibold text-white transition"
            style={{ background: '#09bc8a' }}
          >
            Book My Strategy Call
          </button>
        </div>
      </Section>

      <Section title="Buttons · alt purple (packages)">
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="rounded-sm px-6 py-3 text-sm font-semibold text-white transition"
            style={{ background: '#9826ef', borderRadius: 6 }}
          >
            Book My Strategy Call
          </button>
        </div>
      </Section>

      <Section title="Buttons · secondary / ghost">
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-md border border-ink-300 px-6 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600">
            Secondary
          </button>
          <button className="rounded-md px-6 py-3 text-sm font-medium text-brand-600 transition hover:bg-brand-50">
            Ghost
          </button>
        </div>
      </Section>

      <Section title="Cards · shadow elevations">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-ink-300/20">
            <h4 className="mb-2">shadow-sm</h4>
            <p className="text-sm text-ink-500">Subtle elevation for inline cards within sections.</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h4 className="mb-2">shadow-md (default)</h4>
            <p className="text-sm text-ink-500">The dominant card shadow used 8× across the site.</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h4 className="mb-2">shadow-lg</h4>
            <p className="text-sm text-ink-500">Hover or hero card.</p>
          </div>
        </div>
      </Section>

      <Section title="Border radii">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'radius-sm', cls: 'rounded-sm', token: '6px' },
            { label: 'radius-md', cls: 'rounded-md', token: '8px' },
            { label: 'radius-lg', cls: 'rounded-lg', token: '16px' },
            { label: 'radius-xl', cls: 'rounded-xl', token: '24px' },
            { label: 'radius-pill', cls: 'rounded-pill', token: '9999px' },
          ].map((r) => (
            <div key={r.label} className="flex flex-col gap-2">
              <div className={`h-20 bg-brand-100 ${r.cls}`} />
              <div className="text-xs">
                <div className="font-medium text-ink-800">{r.label}</div>
                <div className="font-mono text-ink-500">{r.token}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Form · input + label">
        <form className="max-w-md space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink-800"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-base text-ink-900 placeholder:text-ink-300 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
          <button
            type="button"
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
          >
            Submit
          </button>
        </form>
      </Section>

      <Section title="Dark band (CTA / footer)">
        <div className="rounded-lg bg-surface-dark p-10 text-ink-inverse">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-300">
            On dark surface
          </p>
          <h3 className="mt-2 text-white">Heading on the dark band</h3>
          <p className="mt-2 max-w-xl text-ink-300">
            Used for the closing CTA on every long page, and as the footer
            background. Brand-300 reads as the eyebrow on this surface;
            ink-300 reads as the muted body.
          </p>
          <button className="mt-6 rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700">
            Get Your Free Growth Audit
          </button>
        </div>
      </Section>
    </div>
  )
}
