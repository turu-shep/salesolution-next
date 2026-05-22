import { cn } from '@/lib/cn'

type Tone = 'paper' | 'surface' | 'dark'

const toneClass: Record<Tone, string> = {
  paper:   'bg-paper text-ink-700',
  surface: 'bg-surface text-ink-700',
  // Dark gets a subtle blue radial gradient from top-center for depth —
  // sits over the deep navy base, no extra layer needed. Matches the brand
  // accent without competing with the orange.
  dark:    "bg-surface-dark text-ink-inverse bg-[radial-gradient(ellipse_900px_500px_at_50%_0%,rgba(38,82,239,0.10),transparent_55%)]",
}

/**
 * Section primitive — no left rail, no §0X ornament. Tone + padding only.
 *
 * The page rhythm comes from light/dark alternation, not from chrome on
 * each section. Section identity is owned by the heading inside.
 *
 * Kept the `SectionRail` name + signature (number/label still accepted but
 * ignored) so existing callers don't break while we migrate.
 */
export function SectionRail({
  tone = 'paper',
  size = 'md',
  id,
  className,
  children,
}: {
  // Legacy props — accepted for backwards-compat, no longer rendered.
  number?: string
  label?: string
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  id?: string
  className?: string
  children: React.ReactNode
}) {
  const pad =
    size === 'sm' ? 'py-16 md:py-24' :
    size === 'lg' ? 'py-28 md:py-40' :
                    'py-24 md:py-32'

  return (
    <section
      id={id}
      data-section-tone={tone === 'dark' ? 'dark' : 'light'}
      className={cn('relative scroll-mt-20', toneClass[tone], pad, className)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
