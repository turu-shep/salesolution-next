export type LegalTOCItem = {
  /** Slugged id of the matching h2 in the prose body. */
  id: string
  label: string
}

/**
 * Table of contents for legal documents with 5+ h2 sections.
 *
 * Two variants, both rendered as plain HTML — no client JS:
 *   - `mobile`: a collapsed <details> block that sits above the prose body.
 *     Lets readers see the map without it eating screen real estate.
 *   - `desktop`: a flat list in a sticky right-column. Hairline-bordered,
 *     mono section numbers, matches the editorial design language.
 *
 * The parent picks which variant to render based on viewport (hidden/block
 * utilities) so a single component owns the markup for both.
 */
export function LegalTOC({
  items,
  variant,
}: {
  items: LegalTOCItem[]
  variant: 'mobile' | 'desktop'
}) {
  if (variant === 'mobile') {
    return (
      <details className="group rounded-md border border-rule bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            On this page
          </span>
          <span
            aria-hidden
            className="text-ink-500 transition-transform duration-200 group-open:rotate-180"
          >
            ↓
          </span>
        </summary>
        <nav aria-label="Table of contents">
          <ol className="px-4 pb-4">
            {items.map((it, i) => (
              <li key={it.id} className="border-t border-rule">
                <a
                  href={`#${it.id}`}
                  className="flex items-baseline gap-3 py-2 text-sm text-ink-700 transition-colors hover:text-brand-600"
                >
                  <span className="font-mono text-[10px] text-ink-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{it.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    )
  }

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        On this page
      </p>
      <ol className="mt-4 space-y-2 border-l border-rule pl-4">
        {items.map((it, i) => (
          <li key={it.id} className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] text-ink-300">
              {String(i + 1).padStart(2, '0')}
            </span>
            <a
              href={`#${it.id}`}
              className="text-sm leading-snug text-ink-700 transition-colors hover:text-brand-600"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
