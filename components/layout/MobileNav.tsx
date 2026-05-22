'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { useState } from 'react'

import { primaryCta, primaryNav } from '@/lib/navigation'

/**
 * Slide-out mobile nav. Radix Dialog gives us:
 *  - focus trap inside the panel
 *  - ESC to close
 *  - click-outside to close
 *  - body-scroll lock
 *  - accessible labels via DialogTitle
 *
 * Renders nothing on desktop (the parent positions it `md:hidden`).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-800 transition hover:bg-surface-alt md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>

          <div className="flex items-center justify-between border-b border-ink-300/20 px-5 py-4">
            <span className="font-display text-lg font-bold text-ink-900">Menu</span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-800 transition hover:bg-surface-alt"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {primaryNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 font-display text-lg font-medium text-ink-900 transition hover:bg-surface-alt"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="ml-3 mt-1 space-y-1 border-l border-ink-300/30 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-ink-700 transition hover:bg-surface-alt hover:text-brand-600"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-ink-300/20 px-5 py-4">
            <Link
              href={primaryCta.href}
              onClick={() => setOpen(false)}
              data-cta="audit__primary_nav"
              data-cta-location="header"
              className="block w-full rounded-md bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
            >
              {primaryCta.label}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
