/**
 * 5-color composite bar — the visual signature for Full Growth Ownership.
 *
 * Per shared system reference §2.3: five equal segments, one per service
 * color. Used as:
 *  - subtle hero accent on the Full Growth Ownership page
 *  - prominent top strip on the FGO tier card across every service page
 *  - signature on case studies that involved multiple services
 *
 * Don't try to blend or gradient the five colors — that produces mud.
 * The signature is "five colors visible together," not "one new color."
 */

type Props = {
  /** Bar thickness. `card` = 4px (tier card top), `hero` = 6px, `divider` = 2px. */
  weight?: 'card' | 'hero' | 'divider'
  className?: string
}

const HEIGHT: Record<NonNullable<Props['weight']>, string> = {
  divider: 'h-[2px]',
  card: 'h-1',
  hero: 'h-1.5',
}

export function CompositeBar({ weight = 'card', className }: Props) {
  return (
    <div
      aria-hidden
      className={`flex w-full ${HEIGHT[weight]} ${className ?? ''}`}
    >
      <span className="flex-1 bg-service-search-500" />
      <span className="flex-1 bg-service-catalog-500" />
      <span className="flex-1 bg-service-editorial-500" />
      <span className="flex-1 bg-service-dev-500" />
      <span className="flex-1 bg-service-outbound-500" />
    </div>
  )
}
