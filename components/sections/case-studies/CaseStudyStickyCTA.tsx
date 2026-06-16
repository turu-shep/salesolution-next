'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Mobile-only sticky CTA for the long detail page. The mobile header collapses
 * its CTA into the hamburger, so the conversion action would otherwise be
 * buried during a long scroll. Appears once the reader is past the hero and
 * hides as they approach the footer, so it never duplicates the page's own
 * closing CTA. Hidden entirely on md+ (desktop keeps the visible header CTA).
 */
export function CaseStudyStickyCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const docH = document.documentElement.scrollHeight
        const nearBottom = docH - (y + window.innerHeight) < 560
        setShow(y > 560 && !nearBottom)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 md:hidden ${
        show ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
    >
      <div className="border-t border-rule bg-surface/95 px-4 py-3 backdrop-blur">
        <Link
          href="/unlock-growth-audit/"
          data-cta="audit__sticky"
          data-cta-location="mid_body"
          className="flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
        >
          Get your free audit
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
