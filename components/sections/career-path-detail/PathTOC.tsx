import { Fragment } from 'react'

import { slugifyHeading } from '@/lib/slug'

type BodyBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

/**
 * /career-paths/[slug]/ — sticky desktop TOC.
 *
 * Two modes:
 *  - module paths pass `items` (the ordered, numbered skills, each with a
 *    `group` = seniority level). The TOC renders them grouped under Entry /
 *    Mid / Senior sub-labels so the progression is visible in the nav, not just
 *    the body.
 *  - legacy essay paths fall back to parsing H2/H3 headings out of the body.
 *
 * Editorial mono-eyebrow styling; the first skill gets the accent-orange
 * "Start here" marker. No JS — anchors use native scroll.
 */
type Anchor = { text: string; id: string; group?: string }
type Entry = { text: string; id: string; group?: string; sub: boolean }

export function PathTOC({
  body,
  items,
  topAnchor,
  bottomAnchor,
  mobile = false,
}: {
  body: unknown
  /** Ordered TOC entries for module paths; `group` is the seniority level. */
  items?: Anchor[]
  topAnchor?: Anchor
  bottomAnchor?: Anchor
  /** Render as a collapsible <details> for mobile (the desktop rail is hidden). */
  mobile?: boolean
}) {
  const blocks = Array.isArray(body) ? (body as BodyBlock[]) : []

  const bodyEntries: Entry[] = items
    ? items.map((it) => ({ text: it.text, id: it.id, group: it.group, sub: false }))
    : blocks
        .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
        .map((b) => {
          const text = (b.children ?? []).map((c) => c?.text ?? '').join('')
          return { text, id: slugifyHeading(text), sub: b.style === 'h3' }
        })
        .filter((h) => h.text.trim().length > 0)

  const composed: Entry[] = [
    ...(topAnchor ? [{ text: topAnchor.text, id: topAnchor.id, sub: false }] : []),
    ...bodyEntries,
    ...(bottomAnchor ? [{ text: bottomAnchor.text, id: bottomAnchor.id, sub: false }] : []),
  ]
  if (composed.length === 0) return null

  const skillCount = items ? items.length : bodyEntries.filter((e) => !e.sub).length

  const list = (
    <>
      <ol className="mt-4 space-y-3">
        {composed.map((h, i) => {
          const isFirst = i === 0 && !h.sub
          const showGroup = !!h.group && (i === 0 || composed[i - 1].group !== h.group)
          return (
            <Fragment key={`${i}-${h.id}`}>
              {showGroup && (
                <li className="pt-4 first:pt-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                    {h.group}
                  </p>
                </li>
              )}
              <li className={h.sub ? 'border-l border-rule pl-4' : ''}>
                <a
                  href={`#${h.id}`}
                  className="group flex items-baseline gap-2 text-sm leading-snug text-ink-700 transition-colors duration-200 hover:text-brand-600"
                >
                  {isFirst && (
                    <span
                      aria-hidden
                      className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent-500"
                    />
                  )}
                  <span
                    className={
                      h.sub
                        ? 'font-mono text-[12px] tracking-[0.01em] text-ink-500 group-hover:text-brand-600'
                        : 'font-display font-semibold text-ink-800 group-hover:text-brand-600'
                    }
                  >
                    {h.text}
                  </span>
                </a>
              </li>
            </Fragment>
          )
        })}
      </ol>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {skillCount} {items ? 'skills' : 'chapters'}
      </p>
    </>
  )

  if (mobile) {
    return (
      <details className="border-y border-rule md:hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          On this path
          <span aria-hidden className="text-ink-400">▾</span>
        </summary>
        <div className="pb-6">{list}</div>
      </details>
    )
  }

  return (
    <nav aria-label="Table of contents" className="border-t border-rule pt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        On this path
      </p>
      {list}
    </nav>
  )
}
