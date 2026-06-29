import Link from 'next/link'

import { LANDING_PAGES, type NicheBrief, type VerifyStatus } from '@/lib/strategy/niches/types'

/**
 * Renders one per-industry copy-angle brief (the output of the
 * revenue-engine-niche-copy-briefs workflow) section-by-section, mapped to the
 * live Revenue Engine landing-page sections so the copy can be dropped in.
 * Internal/gated — readability over polish.
 */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">{children}</p>
  )
}

function Section({
  n,
  title,
  maps,
  children,
}: {
  n: string
  title: string
  maps?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
          <span className="mr-2 font-mono text-sm text-ink-300">{n}</span>
          {title}
        </h2>
        {maps ? (
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
            → {maps}
          </span>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function PillarChip({ pillar }: { pillar: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-600">
      {pillar}
    </span>
  )
}

function Stat({ stat, source }: { stat: string; source?: string }) {
  return (
    <p className="mt-2 border-l-2 border-accent-500/40 pl-3 text-sm text-ink-500">
      {stat}
      {source ? <span className="mt-0.5 block text-[11px] text-ink-400">{source}</span> : null}
    </p>
  )
}

function WordList({ label, words, tone }: { label: string; words: string[]; tone: 'use' | 'avoid' | 'their' }) {
  const chip =
    tone === 'avoid'
      ? 'border-danger-500/30 bg-danger-500/5 text-ink-700'
      : tone === 'use'
        ? 'border-accent-500/30 bg-accent-500/5 text-ink-700'
        : 'border-rule bg-surface text-ink-700'
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <span key={i} className={`rounded border px-2 py-0.5 text-sm ${chip}`}>
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}

const VERDICT_STYLE: Record<string, string> = {
  solid: 'bg-accent-500/10 text-accent-700',
  'mostly-solid': 'bg-brand-100 text-brand-700',
  risky: 'bg-danger-500/10 text-danger-500',
}
const STATUS_STYLE: Record<VerifyStatus, string> = {
  confirmed: 'text-accent-700',
  plausible: 'text-ink-500',
  unsupported: 'text-danger-500',
  wrong: 'text-danger-500',
}

export function NicheBriefView({ brief }: { brief: NicheBrief }) {
  const lp = LANDING_PAGES.find((l) => l.key === brief.landingPage)
  const v = brief._verify

  return (
    <article className="max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Link href="/strategy/niche" className="text-ink-400 hover:text-ink-700">
          Niches
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">{brief.slug}</span>
      </div>

      <Eyebrow>Copy-angle brief</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
        {brief.industry}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-700">{brief.oneLine}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {lp ? (
          <span className="rounded-full border border-rule bg-surface px-3 py-1 text-xs text-ink-500">
            Live page:{' '}
            <Link href={lp.href} className="font-medium text-brand-600 hover:underline">
              {lp.label}
            </Link>
          </span>
        ) : null}
        {v ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${VERDICT_STYLE[v.verdict] ?? 'bg-surface text-ink-500'}`}
          >
            Stats: {v.verdict}
          </span>
        ) : null}
      </div>

      <div className="mt-10 space-y-10">
        {/* 1 — Heading */}
        <Section n="01" title="Heading" maps="hero title / accent / lede">
          <Eyebrow>{brief.heading.eyebrow}</Eyebrow>
          <ol className="mt-3 space-y-4">
            {brief.heading.options.map((o, i) => (
              <li key={i} className="rounded-md border border-rule bg-surface p-4">
                <p className="font-display text-xl font-semibold leading-tight text-ink-900">
                  {o.title} {o.accent}
                </p>
                <p className="mt-2 text-sm text-ink-500">{o.why}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 leading-relaxed text-ink-700">{brief.heading.lede}</p>
        </Section>

        {/* 2 — The leak */}
        <Section n="02" title="The leak" maps="“three places you lose…” evidence">
          <p className="font-display text-2xl font-semibold leading-tight text-ink-900">
            {brief.leak.headlineA} {brief.leak.headlineB}
          </p>
          <p className="mt-3 leading-relaxed text-ink-700">{brief.leak.intro}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {brief.leak.points.map((p, i) => (
              <div key={i} className="rounded-md border border-rule bg-surface p-4">
                <PillarChip pillar={p.pillar} />
                <p className="mt-2 font-semibold text-ink-900">{p.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{p.copy}</p>
                <Stat stat={p.stat} source={p.source} />
              </div>
            ))}
          </div>
          {brief.leak.closer ? (
            <p className="mt-4 text-ink-800">{brief.leak.closer}</p>
          ) : null}
        </Section>

        {/* 3 — The plan */}
        <Section n="03" title="The plan" maps="Bring / Convert / Retain steps">
          <p className="text-sm text-ink-500">
            Lead with <span className="font-semibold text-ink-900">{brief.plan.leadPillar}</span>.
            {brief.plan.note ? ` ${brief.plan.note}` : ''}
          </p>
          <div className="mt-4 space-y-4">
            {brief.plan.pillars.map((pil, i) => (
              <div key={i} className="rounded-md border border-rule bg-surface p-4">
                <div className="flex items-baseline gap-3">
                  <PillarChip pillar={pil.pillar} />
                  <span className="text-sm text-ink-500">{pil.outcome}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {pil.steps.map((s, j) => (
                    <li key={j} className="text-sm">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-accent-600">
                        {s.key}
                      </span>
                      <span className="text-ink-700"> — {s.what}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-400">→ {s.metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-md border-l-2 border-ink-900 bg-surface px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-500">Prove</span>
              <span className="text-ink-700"> — {brief.plan.prove.what}</span>
              <span className="mt-0.5 block text-[12px] text-ink-400">→ {brief.plan.prove.metric}</span>
            </div>
          </div>
        </Section>

        {/* 4 — The difference */}
        <Section n="04" title="The difference" maps="“same lead, two endings”">
          <p className="font-display text-2xl font-semibold leading-tight text-ink-900">
            {brief.difference.headlineA}{' '}
            {brief.difference.headlineB}
          </p>
          {brief.difference.intro ? (
            <p className="mt-3 leading-relaxed text-ink-700">{brief.difference.intro}</p>
          ) : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-danger-500/30 bg-danger-500/5 p-4">
              <Eyebrow>Without the engine</Eyebrow>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                {brief.difference.lost.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-4">
              <Eyebrow>With it</Eyebrow>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                {brief.difference.won.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* 5 — Reassurance */}
        <Section n="05" title={brief.reassurance.sectionTitle} maps={`reassurance · ${brief.reassurance.kind}`}>
          {brief.reassurance.intro ? (
            <p className="leading-relaxed text-ink-700">{brief.reassurance.intro}</p>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {brief.reassurance.bullets.map((b, i) => (
              <div key={i} className="rounded-md border border-rule bg-surface p-4">
                <p className="font-semibold text-ink-900">{b.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{b.copy}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 6 — FAQ */}
        <Section n="06" title="FAQ" maps="objections, in their words">
          <dl className="space-y-4">
            {brief.faq.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-ink-900">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-700">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* 7 — Language pack */}
        <Section n="07" title="Language pack" maps="words to use across the page">
          <div className="space-y-4">
            <WordList label="Their words" words={brief.language.theirWords} tone="their" />
            <WordList label="Use" words={brief.language.wordsToUse} tone="use" />
            <WordList label="Avoid" words={brief.language.wordsToAvoid} tone="avoid" />
          </div>
        </Section>

        {/* 8 — Key stats + sources */}
        <Section n="08" title="Key stats & sources">
          <ul className="space-y-2">
            {brief.keyStats.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold text-ink-900">{s.value}</span>{' '}
                <span className="text-ink-700">— {s.label}</span>
                <span className="mt-0.5 block text-[11px] text-ink-400">{s.source}</span>
              </li>
            ))}
          </ul>
          {brief.sources.length ? (
            <details className="mt-5 text-sm">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wide text-ink-400">
                All sources ({brief.sources.length})
              </summary>
              <ul className="mt-2 space-y-1 text-[12px] text-ink-500">
                {brief.sources.map((s, i) => (
                  <li key={i} className="break-words">{s}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </Section>

        {/* 9 — Data confidence */}
        {v ? (
          <Section n="09" title="Data confidence" maps="adversarial stat check">
            <p className="leading-relaxed text-ink-700">{v.summary}</p>
            {v.checked.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {v.checked.map((c, i) => (
                  <li key={i}>
                    <span className={`font-mono text-[11px] uppercase tracking-wide ${STATUS_STYLE[c.status] ?? 'text-ink-500'}`}>
                      {c.status}
                    </span>{' '}
                    <span className="text-ink-700">{c.stat}</span>
                    {c.correction ? (
                      <span className="mt-0.5 block text-[12px] text-danger-500">fix: {c.correction}</span>
                    ) : c.note ? (
                      <span className="mt-0.5 block text-[12px] text-ink-400">{c.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        ) : null}
      </div>
    </article>
  )
}
