import { cn } from '@/lib/cn'

type Tone = 'paper' | 'surface' | 'dark'
type Glow = 'default' | 'strong' | 'quiet' | 'none'

const toneClass: Record<Tone, string> = {
  paper:   'bg-paper text-ink-700',
  surface: 'bg-surface text-ink-700',
  dark:    'bg-surface-dark text-ink-inverse',
}

// Dark bands carry a blue radial glow for depth over the navy base. The
// intensity is tunable so adjacent dark sections (e.g. a featured proof band
// and a closing CTA) read as distinct moments rather than one repeated slab:
// `strong` anchors the halo toward the right (behind a proof column), `quiet`
// keeps a closing band calm.
const glowClass: Record<Glow, string> = {
  default: 'bg-[radial-gradient(ellipse_900px_500px_at_50%_0%,rgba(38,82,239,0.10),transparent_55%)]',
  strong:  'bg-[radial-gradient(ellipse_900px_560px_at_72%_-5%,rgba(38,82,239,0.20),transparent_58%)]',
  quiet:   'bg-[radial-gradient(ellipse_800px_440px_at_50%_0%,rgba(38,82,239,0.06),transparent_55%)]',
  none:    '',
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
  glow = 'default',
  id,
  className,
  children,
}: {
  // Legacy props — accepted for backwards-compat, no longer rendered.
  number?: string
  label?: string
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  /** Intensity of the dark-band radial glow. Ignored on light tones. */
  glow?: Glow
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
      className={cn(
        'relative scroll-mt-20',
        toneClass[tone],
        tone === 'dark' && glowClass[glow],
        pad,
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
