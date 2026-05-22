'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { primaryCta, primaryNav } from '@/lib/navigation'
import { cn } from '@/lib/cn'

import { Logo } from './Logo'
import { MobileNav } from './MobileNav'

/**
 * Sticky site header. Tone-aware: when the topmost visible section is
 * dark, the header inverts to dark; otherwise stays light. Detection runs
 * client-side via IntersectionObserver against `[data-section-tone]`.
 */
export function Header() {
  const [tone, setTone] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section-tone]')
    if (sections.length === 0) return

    // Re-evaluate whenever a section crosses the top of the viewport
    // (offset by the 64px header height so the moment matches the visual).
    const HEADER_PX = 64

    const update = () => {
      let chosen: 'light' | 'dark' = 'light'
      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= HEADER_PX && rect.bottom > HEADER_PX) {
          chosen = (el.dataset.sectionTone as 'light' | 'dark') ?? 'light'
        }
      }
      setTone(chosen)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const isDark = tone === 'dark'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-300',
        isDark
          ? 'border-white/10 bg-surface-dark/85'
          : 'border-rule bg-paper/90',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-4">
          <Logo tone={isDark ? 'dark' : 'light'} />
          <span
            aria-hidden
            className={cn(
              'hidden font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 lg:inline',
              isDark ? 'text-ink-300/70' : 'text-ink-400',
            )}
          >
            AI search · engineered
          </span>
        </div>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {primaryNav.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  'relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                  isDark
                    ? 'text-ink-300 hover:text-white'
                    : 'text-ink-700 hover:text-ink-900',
                )}
              >
                <span className="relative">
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-200 group-hover:w-full',
                      isDark ? 'bg-white' : 'bg-ink-900',
                    )}
                  />
                </span>
                {item.children && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50 transition-transform duration-200 group-hover:rotate-180"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </Link>

              {item.children && (
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul
                    className={cn(
                      'min-w-[260px] rounded-lg p-2 shadow-md ring-1',
                      isDark
                        ? 'bg-surface-dark text-ink-300 ring-white/10'
                        : 'bg-surface text-ink-700 ring-ink-300/15',
                    )}
                  >
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            'block rounded-md px-3 py-2 text-sm transition-colors duration-200',
                            isDark
                              ? 'hover:bg-white/5 hover:text-white'
                              : 'hover:bg-paper hover:text-ink-900',
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={primaryCta.href}
            className={cn(
              'hidden items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold transition-colors duration-200 md:inline-flex',
              isDark
                ? 'bg-white text-ink-900 hover:bg-accent-500 hover:text-white'
                : 'bg-ink-900 text-white hover:bg-brand-600',
            )}
          >
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
            </span>
            Free audit
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
