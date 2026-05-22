import { cn } from '@/lib/cn'

/**
 * The recurring small uppercase brand-blue label that sits above section
 * headlines across the entire site.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.18em] text-brand-600',
        className,
      )}
    >
      {children}
    </p>
  )
}
