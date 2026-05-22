import { clientLogos } from '@/lib/client-logos'
import { cn } from '@/lib/cn'

/**
 * Horizontal scrolling logo strip. Pure CSS animation, duplicates the list
 * to create a seamless loop. The slow scroll signals "lots of clients"
 * even with just 5 brands — perception > reality.
 *
 * Respects prefers-reduced-motion via Tailwind's motion-reduce.
 */
export function LogoMarquee({
  label = 'Engineered for',
  tone = 'paper',
}: {
  label?: string
  tone?: 'paper' | 'dark'
}) {
  const isDark = tone === 'dark'
  const items = [...clientLogos, ...clientLogos] // 2x for seamless loop

  return (
    <div
      data-section-tone={isDark ? 'dark' : 'light'}
      className={cn(
        'overflow-hidden border-y',
        isDark ? 'border-white/10 bg-surface-dark' : 'border-rule bg-paper',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-12 px-4 py-8 sm:px-6 lg:px-8">
        <span
          className={cn(
            'shrink-0 font-mono text-[11px] uppercase tracking-[0.18em]',
            isDark ? 'text-ink-300' : 'text-ink-500',
          )}
        >
          {label}
        </span>

        <div className="group relative min-w-0 flex-1 overflow-hidden">
          {/* Fade-out masks on edges so the loop doesn't pop */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent',
              isDark ? 'from-surface-dark' : 'from-paper',
            )}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent',
              isDark ? 'from-surface-dark' : 'from-paper',
            )}
          />

          <ul
            aria-label="Client brands"
            className="flex w-max items-center gap-14 will-change-transform motion-safe:animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]"
          >
            {items.map((logo, i) => (
              <li
                key={`${logo.name}-${i}`}
                className={cn(
                  'shrink-0 font-display text-xl font-semibold tracking-[-0.01em] transition-colors duration-200',
                  isDark
                    ? 'text-white/85 hover:text-accent-500'
                    : 'text-ink-800 hover:text-brand-600',
                )}
              >
                {logo.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
