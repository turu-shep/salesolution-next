import { cn } from '@/lib/cn'

type Tone = 'default' | 'alt' | 'tint-blue' | 'tint-cool' | 'dark'

const toneClass: Record<Tone, string> = {
  default:     'bg-surface',
  alt:         'bg-surface-alt',
  'tint-blue': 'bg-surface-tint-blue',
  'tint-cool': 'bg-surface-tint-cool',
  dark:        'bg-surface-dark text-ink-inverse',
}

/**
 * Vertical-rhythm wrapper. Every marketing section sits inside one.
 * - `tone` switches the background.
 * - `size` swaps padding (sm = 48px, md = 80px, lg = 112px).
 */
export function Section({
  tone = 'default',
  size = 'md',
  className,
  children,
}: {
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}) {
  const pad =
    size === 'sm' ? 'py-12 md:py-16' :
    size === 'lg' ? 'py-20 md:py-28' :
                    'py-16 md:py-24'
  return (
    <section className={cn(toneClass[tone], pad, className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
