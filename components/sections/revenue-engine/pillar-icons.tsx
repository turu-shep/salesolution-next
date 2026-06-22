/**
 * The three pillar icons (Bring / Convert / Retain), shared by the FlowBlock
 * mechanism beat and the PlanByPillar group headers so the same visual marks
 * the same pillar in both places. Line icons, inherit `currentColor`.
 *
 *   Bring   = a search/magnifier — get found when they're looking
 *   Convert = a phone — answer fast, win the call
 *   Retain  = a return loop — bring them back
 */
type IconProps = { className?: string }

function Icon({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  )
}

export function BringIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

export function ConvertIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.92.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  )
}

export function RetainIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.5 2.5L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
  )
}

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  Bring: BringIcon,
  Convert: ConvertIcon,
  Retain: RetainIcon,
}

export function PillarIcon({ pillar, className }: { pillar: string; className?: string }) {
  const C = ICONS[pillar]
  return C ? <C className={className} /> : null
}
