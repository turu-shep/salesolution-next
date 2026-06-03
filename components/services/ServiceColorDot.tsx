import { CompositeBar } from './CompositeBar'
import { SERVICE_CLASSES, type ServiceKey } from './service-colors'

/**
 * Inline color dot used to mark cross-service links. Shared system §2.2 —
 * "See the [Service] page →" callouts get a small dot in the destination's
 * color so the reader can visually thread the link.
 *
 * The `composite` variant renders as a tiny 5-segment bar instead of a dot
 * because a single Full Growth Ownership color doesn't exist.
 */

type Props = {
  service: ServiceKey
  className?: string
}

export function ServiceColorDot({ service, className }: Props) {
  if (service === 'composite') {
    return (
      <span
        aria-hidden
        className={`inline-flex h-2 w-5 overflow-hidden rounded-[1px] align-middle ${className ?? ''}`}
      >
        <CompositeBar weight="card" />
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full align-middle ${SERVICE_CLASSES[service].dot} ${className ?? ''}`}
    />
  )
}
