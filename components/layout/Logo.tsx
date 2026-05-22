import Link from 'next/link'

import { cn } from '@/lib/cn'

type Tone = 'light' | 'dark'

/**
 * Wordmark — "salesolution[¹]" in display weight with a citation-style
 * superscript. The [¹] visually ties to the AI Overview mockup where
 * a client appears as the cited source: the company name itself implies
 * "engineered to be cited."
 *
 * Two tones (light for white headers, dark for dark footers/bands).
 * Sized via CSS `text-*` classes — pass `className` to override the base
 * size when used in a hero footprint vs. a 16px header.
 */
export function Logo({
  className = '',
  tone = 'light',
}: {
  className?: string
  tone?: Tone
}) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-baseline font-display font-semibold tracking-[-0.02em] transition-colors duration-200',
        tone === 'dark'
          ? 'text-white hover:text-accent-500'
          : 'text-ink-900 hover:text-brand-600',
        // default base size; overrideable via className
        'text-xl',
        className,
      )}
      aria-label="Sale Solution — Home"
    >
      <span>sale</span>
      <span
        aria-hidden
        className={cn(
          'mx-[1px] inline-block h-[6px] w-[6px] translate-y-[-2px] rounded-full',
          tone === 'dark' ? 'bg-accent-500' : 'bg-brand-600',
        )}
      />
      <span>solution</span>
      <sup
        aria-hidden
        className={cn(
          'ml-[1px] font-mono text-[0.5em] font-medium tracking-normal transition-colors duration-200',
          tone === 'dark'
            ? 'text-accent-500 group-hover:text-white'
            : 'text-accent-500 group-hover:text-brand-600',
        )}
      >
        [1]
      </sup>
    </Link>
  )
}
