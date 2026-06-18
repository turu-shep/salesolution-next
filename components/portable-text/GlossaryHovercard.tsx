'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Inline glossary-term reference with an in-page preview.
 *
 * SEO is carried by the real, server-rendered `<a href="/glossary/<slug>/">` —
 * crawlers and no-JS readers see a normal internal link. The preview is a
 * progressive enhancement layered on top:
 *  - Pointer with hover (desktop): hover/focus shows a floating definition card;
 *    clicking the term navigates as usual.
 *  - No-hover (touch): the first tap opens a bottom sheet with the definition +
 *    an explicit "Open term page" action, so the reader isn't yanked off the
 *    page they're reading. A second tap on that action navigates.
 *
 * Only the `shortDefinition` is shown — never the full body — so the canonical
 * definition (and its DefinedTerm schema) stays on the term page and isn't
 * duplicated across every page that mentions the term. Visually it mirrors the
 * site's "emphasis panel" idiom (brand-blue edge + faint blue tint).
 */
type Props = {
  slug?: string
  term?: string
  shortDefinition?: string
  children: React.ReactNode
}

type Pos = { top: number; left: number; placement: 'top' | 'bottom' }

const CARD_W = 330
const CARD_MAX_H = 190
// Keep the desktop card clear of bottom page furniture (consent bar, etc.).
const BOTTOM_RESERVE = 104

export function GlossaryHovercard({ slug, term, shortDefinition, children }: Props) {
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const sheetActionRef = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const [coarse, setCoarse] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const panelId = useId()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && window.matchMedia) {
      setCoarse(window.matchMedia('(hover: none)').matches)
    }
  }, [])

  const computePos = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const margin = 8
    const roomBelow = window.innerHeight - BOTTOM_RESERVE - (r.bottom + margin)
    const placement: Pos['placement'] =
      roomBelow < CARD_MAX_H && r.top > CARD_MAX_H ? 'top' : 'bottom'
    let left = r.left
    if (left + CARD_W > window.innerWidth - 12) left = window.innerWidth - 12 - CARD_W
    if (left < 12) left = 12
    const top = placement === 'bottom' ? r.bottom + margin : r.top - margin
    setPos({ top, left, placement })
  }, [])

  const openDesktop = useCallback(() => {
    computePos()
    setOpen(true)
  }, [computePos])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    let onScroll: (() => void) | undefined
    if (!coarse) {
      onScroll = () => setOpen(false)
      window.addEventListener('scroll', onScroll, true)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      if (onScroll) window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, coarse])

  // Move focus into the sheet on mobile open (a11y).
  useEffect(() => {
    if (open && coarse) sheetActionRef.current?.focus()
  }, [open, coarse])

  const href = slug ? `/glossary/${slug}/` : '#'
  const hasPreview = Boolean(slug && shortDefinition)

  // No resolved target (e.g. unpublished term) → plain text, no dead link.
  if (!slug) return <>{children}</>
  // Resolved link but no definition → plain crawlable link, no preview.
  if (!hasPreview) {
    return (
      <Link href={href} className="gloss-term">
        {children}
      </Link>
    )
  }

  const onClick = (e: React.MouseEvent) => {
    // Touch / no-hover: first tap previews instead of navigating away.
    if (coarse && !open) {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
      <Link
        ref={triggerRef}
        href={href}
        className="gloss-term"
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={coarse ? undefined : openDesktop}
        onMouseLeave={coarse ? undefined : close}
        onFocus={coarse ? undefined : openDesktop}
        onBlur={coarse ? undefined : close}
        onClick={onClick}
      >
        {children}
      </Link>

      {/* Mobile / no-hover: bottom sheet */}
      {mounted &&
        open &&
        coarse &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] motion-safe:animate-[fade-in_0.12s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-t`}
          >
            <button
              type="button"
              aria-label="Close definition"
              className="absolute inset-0 bg-ink-900/50"
              onClick={close}
            />
            <div
              id={panelId}
              className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t-2 border-brand-600 bg-surface-tint-blue px-5 pt-4 shadow-xl"
              style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-brand-300" />
              <div className="flex items-start justify-between gap-4">
                <p
                  id={`${panelId}-t`}
                  className="font-display text-base font-semibold tracking-[-0.01em] text-ink-900"
                >
                  {term}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none text-ink-500 hover:bg-ink-900/5"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{shortDefinition}</p>
              {/* Left-aligned (not full-width) so it clears any bottom-right
                  floating widget — e.g. the site chat FAB. */}
              <Link
                ref={sheetActionRef}
                href={href}
                className="mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Open term page →
              </Link>
            </div>
          </div>,
          document.body,
        )}

      {/* Desktop: floating preview card */}
      {mounted &&
        open &&
        !coarse &&
        pos &&
        createPortal(
          <div
            id={panelId}
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.left,
              width: CARD_W,
              ...(pos.placement === 'bottom'
                ? { top: pos.top }
                : { bottom: window.innerHeight - pos.top }),
            }}
            className="z-[70] max-w-[calc(100vw-24px)] rounded-lg border-l-2 border-brand-600 bg-surface-tint-blue p-4 shadow-xl ring-1 ring-ink-300/15 motion-safe:animate-[fade-in_0.12s_ease-out]"
          >
            <p className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
              {term}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{shortDefinition}</p>
            <span className="mt-3 block text-xs font-semibold text-brand-600">Open term page →</span>
          </div>,
          document.body,
        )}
    </>
  )
}
