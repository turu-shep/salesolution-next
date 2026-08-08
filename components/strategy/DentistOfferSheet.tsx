import Link from 'next/link'

import { DENTIST_OFFER, SECTIONS } from '@/lib/strategy/dentist-offer/data'
import type {
  Category as OfferCategory,
  Deliverable,
  SectionMeta,
  Stage,
  ValueRow,
  ValueTier,
} from '@/lib/strategy/dentist-offer/types'

/**
 * The dentist offer sheet at /strategy/offers/dentist/ — what the install
 * contains, category by category, with the value of each deliverable.
 *
 * Server component on purpose: anchors and sticky positioning only, no client
 * JS. Content lives in lib/strategy/dentist-offer/data.ts and is byte-preserved
 * from the markdown module this replaced — this file is presentation, so any
 * wording change belongs in the data, never here.
 *
 * Internal/gated, light-only. Same idiom as NicheBrief / OfferMirror: hairline
 * rules, numbered sections, mono labels, no card chrome for its own sake.
 */

const o = DENTIST_OFFER

// ── primitives ─────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">{children}</p>
  )
}

function Section({
  meta,
  purpose,
  children,
}: {
  meta: SectionMeta
  purpose?: string
  children: React.ReactNode
}) {
  return (
    <section id={meta.id} className="mt-12 scroll-mt-8 border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
          <span className="mr-2 font-mono text-sm text-ink-400">{meta.number}</span>
          {meta.title}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
          {meta.note}
        </span>
      </div>
      {purpose ? <p className="mt-2 text-sm leading-relaxed text-ink-500">{purpose}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function StageChip({ stage }: { stage: Stage }) {
  return (
    <span className="inline-flex items-center rounded-full border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">
      {stage}
    </span>
  )
}

/**
 * Sourcing tier, straight from the ledger's own labels. The amber family reads
 * as "not signed yet"; `directional` is quiet; `verified` is the only positive
 * signal on the page. accent-700 rather than accent-600 so the 10px chip text
 * clears 4.5:1 on its own tint.
 */
const TIER_CHIP: Record<Exclude<ValueTier, 'none'>, { label: string; tone: string }> = {
  verified: { label: 'verified', tone: 'border-transparent bg-data-up/10 text-data-up' },
  directional: { label: 'directional', tone: 'border-rule text-ink-400' },
  claimReady: {
    label: 'claim-ready · unsigned',
    tone: 'border-accent-500/40 bg-accent-500/10 text-accent-700',
  },
  reserved: { label: 'reserved', tone: 'border-dashed border-ink-300 text-ink-400' },
}

function TierChip({ tier, gated }: { tier: ValueTier; gated?: boolean }) {
  if (tier === 'none') return null
  const chip = TIER_CHIP[tier]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide ${chip.tone}`}
    >
      {gated ? 'VC-gated' : chip.label}
    </span>
  )
}

function ValueRowItem({ row }: { row: ValueRow }) {
  return (
    <li className={row.tier === 'reserved' ? 'rounded border border-dashed border-ink-300 p-2' : ''}>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
          {row.label}
        </span>
        <TierChip tier={row.tier} gated={row.gated} />
      </div>
      {row.figure ? (
        <p className="mt-1 font-mono text-sm font-medium tabular-nums text-ink-900">{row.figure}</p>
      ) : null}
      <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{row.detail}</p>
      {row.source ? (
        <p className="mt-1 text-[11px] leading-snug text-ink-400">{row.source}</p>
      ) : null}
    </li>
  )
}

/** ✕ is decoration — the surrounding heading carries the meaning. */
function Cross() {
  return (
    <span aria-hidden className="mt-px shrink-0 text-danger-500">
      ✕
    </span>
  )
}

// ── deliverables ───────────────────────────────────────────────────────────

function DeliverableRow({ deliverable: d }: { deliverable: Deliverable }) {
  return (
    <div className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_19rem]">
      <div>
        <h4 className="text-[15px] font-medium leading-snug text-ink-900">{d.name}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{d.what}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-ink-400">
          Why it matters
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{d.whyItMatters}</p>
      </div>
      <div className="rounded-lg border border-rule bg-surface p-3.5">
        <ul className="space-y-2.5">
          {d.value.map((v, i) => (
            <ValueRowItem key={i} row={v} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function CategoryBlock({ category: c }: { category: OfferCategory }) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-rule bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-900">
          {c.number.padStart(2, '0')}
        </span>
        {c.stages.map((s) => (
          <StageChip key={s} stage={s} />
        ))}
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{c.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{c.purpose}</p>
      <div className="mt-3 divide-y divide-rule border-t border-rule">
        {c.deliverables.map((d) => (
          <DeliverableRow key={d.name} deliverable={d} />
        ))}
      </div>
    </section>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export function DentistOfferSheet() {
  const p = o.pricing
  const v = o.valueStack
  const a = o.proposedAdditions
  const pricingBlocks = [p.fee, p.terms, p.month4]

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
      {/* grid-cols-1 above is load-bearing: with only an implicit `auto` track
          the column sizes to min-content, and the tier table's min-width blows
          the whole article out on mobile. */}
      <article className="min-w-0 max-w-3xl">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header>
          <Eyebrow>{o.eyebrow}</Eyebrow>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
            {o.title}
          </h1>
          <p className="mt-3 leading-relaxed text-ink-700">{o.definition}</p>
          <p className="mt-1.5 font-mono text-[11px] leading-snug text-ink-400">{o.sourceNote}</p>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule bg-rule md:grid-cols-5">
            {o.facts.map((f, i) => (
              <div
                key={f.label}
                className={`bg-surface p-3 ${i === o.facts.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
              >
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                  {f.label}
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold leading-tight text-ink-900">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* ── 01 What it is ────────────────────────────────────────────── */}
        <Section meta={SECTIONS[0]}>
          <p className="leading-relaxed text-ink-700">{o.whatItIs}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-500">{o.promiseIntro}</p>
          <blockquote className="mt-2 border-l-2 border-rule pl-4 leading-relaxed text-ink-700">
            {o.promiseQuote}
          </blockquote>

          <p className="mt-6 leading-relaxed text-ink-700">{o.stagesLine}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-500">{o.guaranteeIntro}</p>
          <div className="mt-2 rounded-r-lg border-l-2 border-accent-500 bg-accent-500/5 p-4">
            <p className="font-display text-lg font-medium leading-snug text-ink-900">
              {o.guarantee}
            </p>
            <div className="mt-3 space-y-2">
              {o.guaranteeRules.map((rule, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink-500">
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 02 Who it's for ──────────────────────────────────────────── */}
        <Section meta={SECTIONS[1]}>
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead>
                <tr className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
                  <th scope="col" className="w-[6%] py-2 pr-4 font-normal">
                    Tier
                  </th>
                  <th scope="col" className="w-[36%] py-2 pr-4 font-normal">
                    Profile
                  </th>
                  <th scope="col" className="w-[18%] py-2 pr-4 font-normal">
                    Modeled 12-mo recovery
                  </th>
                  <th scope="col" className="w-[40%] py-2 font-normal">
                    Fit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule border-t border-rule">
                {o.tiers.map((t) => (
                  <tr key={t.tier} className="align-top">
                    <th
                      scope="row"
                      className="py-2.5 pr-4 text-left font-mono text-sm font-semibold text-ink-900"
                    >
                      {t.tier}
                    </th>
                    <td className="py-2.5 pr-4 leading-relaxed text-ink-700">{t.profile}</td>
                    <td className="py-2.5 pr-4 font-mono tabular-nums text-ink-900">
                      {t.recovery}
                    </td>
                    <td className="py-2.5 leading-relaxed text-ink-700">{t.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 leading-relaxed text-ink-700">{o.whoDecides}</p>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            {o.notFitIntro}
          </p>
          <ul className="mt-3 grid gap-2.5 md:grid-cols-2">
            {o.notFit.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                <Cross />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 03 The deliverables ──────────────────────────────────────── */}
        <Section meta={SECTIONS[2]}>
          <p className="leading-relaxed text-ink-700">{o.deliverablesIntro}</p>
          <p className="mt-4 rounded-lg border border-rule bg-paper p-4 text-sm leading-relaxed text-ink-500">
            {o.valueNotes}
          </p>
          <div className="mt-10 space-y-12">
            {o.categories.map((c) => (
              <CategoryBlock key={c.number} category={c} />
            ))}
          </div>
        </Section>

        {/* ── 04 Timeline ──────────────────────────────────────────────── */}
        <Section meta={SECTIONS[3]}>
          <ol className="space-y-5 border-l border-rule pl-6">
            {o.timeline.map((s) => (
              <li key={s.when} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[28.5px] top-1.5 h-2 w-2 rounded-full ${
                    s.settles ? 'bg-accent-500' : 'bg-ink-300'
                  }`}
                />
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
                  {s.when}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-700">{s.what}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── 05 Not in the install ────────────────────────────────────── */}
        <Section meta={SECTIONS[4]}>
          <ul className="space-y-3 rounded-lg border border-rule p-4">
            {o.notInInstall.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                <Cross />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 06 Pricing and terms ─────────────────────────────────────── */}
        <Section meta={SECTIONS[5]}>
          <p className="text-sm leading-relaxed text-ink-500">{p.publicLineIntro}</p>
          <div className="mt-2 rounded-r-lg border-l-2 border-rule-strong bg-paper p-4">
            <p className="font-display text-lg font-medium leading-snug text-ink-900">
              {p.publicLine}
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">{p.publicLineNote}</p>

          <div className="mt-6 rounded-lg border border-rule bg-surface p-4">
            <p className="border-b border-rule pb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              {p.internalLabel}
            </p>
            <dl className="mt-4 space-y-5">
              {pricingBlocks.map((b) => (
                <div key={b.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                    {b.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-700">{b.body}</dd>
                </div>
              ))}

              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                  {p.optionNames.label}
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.optionNames.names.map((n) => (
                    <span
                      key={n}
                      className="rounded border border-rule bg-paper px-2 py-0.5 text-sm text-ink-700"
                    >
                      {n}
                    </span>
                  ))}
                </dd>
              </div>

              {[p.paymentTerms, p.orderRule].map((b) => (
                <div key={b.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                    {b.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-700">{b.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        {/* ── 07 The value stack ───────────────────────────────────────── */}
        <Section meta={SECTIONS[6]}>
          <p className="leading-relaxed text-ink-700">{v.proposalLine}</p>

          <div className="mt-6 space-y-4">
            {v.bars.map((b, i) => (
              <div key={b.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <span className="text-sm text-ink-700">{b.label}</span>
                  <span className="font-mono text-sm tabular-nums text-ink-900">{b.amount}</span>
                </div>
                <div className="relative mt-2 h-1.5 rounded-full bg-rule">
                  <div
                    aria-hidden
                    className={`absolute inset-y-0 rounded-full ${
                      i === 0 ? 'bg-ink-300' : 'bg-accent-500/60'
                    }`}
                    style={{
                      left: `${(b.low / v.scaleMax) * 100}%`,
                      width: `${((b.high - b.low) / v.scaleMax) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              aria-hidden
              className="flex justify-between font-mono text-[10px] tabular-nums text-ink-400"
            >
              <span>$0</span>
              <span>${Math.round(v.scaleMax / 1000)}K</span>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-ink-700">{v.corroboration}</p>
          <p className="mt-3 leading-relaxed text-ink-700">{v.honesty}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">{v.ledgerLine}</p>
        </Section>

        {/* ── 08 Proposed additions ────────────────────────────────────── */}
        <Section meta={SECTIONS[7]}>
          <div className="rounded-lg border border-accent-500/30 bg-accent-500/5 p-4">
            <span className="inline-flex items-center rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-700">
              {a.gate}
            </span>
            <p className="mt-3 leading-relaxed text-ink-700">{a.intro}</p>
            <ul className="mt-4 space-y-3">
              {a.items.map((item) => (
                <li key={item.name}>
                  <h3 className="text-[15px] font-medium leading-snug text-ink-900">{item.name}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-700">{item.what}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-snug text-ink-500">{a.signOff}</p>
          </div>
        </Section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="mt-14 border-t border-rule pt-6 text-sm leading-relaxed text-ink-500">
          <p>
            {o.footer.lead}{' '}
            <Link
              href={o.footer.outreachHref}
              className="rounded-sm text-ink-700 underline decoration-rule underline-offset-4 transition-colors hover:text-brand-600 hover:decoration-brand-600"
            >
              {o.footer.outreachHref}
            </Link>
            {o.footer.outreachTail}
          </p>
          <p className="mt-1.5">
            {o.footer.ledgerLabel}{' '}
            <span className="font-mono text-[12px] text-ink-700">{o.footer.ledgerPath}</span>
          </p>
        </footer>
      </article>

      {/* ── On this page ───────────────────────────────────────────────── */}
      <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-8 lg:block">
        <Eyebrow>On this page</Eyebrow>
        <ol className="mt-3 space-y-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex gap-2 rounded-sm font-mono text-[11px] leading-snug text-ink-400 transition-colors hover:text-ink-700"
              >
                <span>{s.number}</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
