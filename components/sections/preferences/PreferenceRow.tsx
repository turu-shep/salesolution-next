'use client'

import { cn } from '@/lib/cn'

/**
 * Single labeled preference row — checkbox + label + helper text, separated
 * from neighbours by a hairline rule. Hover lifts the row to surface-alt so
 * the entire band feels clickable, not just the checkbox.
 *
 * The checked state uses the editorial accent (industrial orange) per the
 * preferences design constraint — distinct from brand-blue CTAs so toggles
 * never compete with the Save button.
 *
 * If `disabled` is true the input is rendered checked + locked (used for
 * always-on functional cookies and transactional emails — the visitor needs
 * to see they exist but can't turn them off).
 */
export function PreferenceRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
  badge,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
  badge?: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex items-start gap-4 border-b border-rule py-6 transition-colors duration-150',
        disabled
          ? 'cursor-not-allowed opacity-80'
          : 'cursor-pointer hover:bg-paper',
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-[18px] w-[18px] flex-none rounded-[3px] border border-ink-300 accent-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-display text-base font-semibold text-ink-900">
            {label}
          </p>
          {badge && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
          {description}
        </p>
      </div>
    </label>
  )
}
