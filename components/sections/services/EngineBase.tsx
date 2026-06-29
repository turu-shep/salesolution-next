import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CYLINDER_GROUPS } from '@/lib/revenue-engine'

/**
 * /services/ hub — the engine as the base.
 *
 * The story beat that resolves the page's tension: a single service is a
 * commodity tool; it's worth more once it bolts onto a system. So we reveal the
 * Revenue Engine as the foundation we install (the "base"/trim), and the
 * cylinders as the parts that run on top of it — drawn as a literal stack:
 * the parts (grouped by pillar) sit on the engine block.
 *
 * Distinct from HowServicesCombine (the *argument* for coordinating) — this is
 * the *shape* of the product: base + parts. Dark so the engine reads as the
 * substantial thing you install.
 */
export function EngineBase({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The system underneath
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          One engine underneath. The parts bolt on top.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-300">
          <p>
            Every service we run plugs into one system we install for your
            business: the Revenue Engine. It answers the call, books the job,
            chases what went cold, and proves what came back. That&rsquo;s the
            base, and it takes about 90 days to put in.
          </p>
          <p>
            The cylinders are the parts we build on top: the ones we fuel,
            support, and improve over time.{' '}
            <span className="font-medium text-white">
              A part on its own is just a tool. Bolted to the engine, it
              compounds.
            </span>
          </p>
        </div>
        <Link
          href="/revenue-engine/"
          data-cta="services-engine-howitworks"
          data-cta-location="services-engine-base"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white"
        >
          See how the whole engine works
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* The stack: parts on top, the engine block underneath. */}
      <div className="mt-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          The cylinders &mdash; the parts you add
        </p>
        <div className="mt-5 grid gap-x-8 gap-y-7 sm:grid-cols-3">
          {CYLINDER_GROUPS.map((group) => {
            // Full Growth Ownership is the whole-engine tier, not a bolt-on part.
            const parts = group.cylinders.filter(
              (c) => c.slug !== 'full-growth-ownership',
            )
            if (parts.length === 0) return null
            return (
              <div key={group.pillar}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-400">
                  {group.pillar}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parts.map((c) => (
                    <span
                      key={c.name}
                      className="rounded-[3px] border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[13px] leading-snug text-ink-100"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* connector — a rail that leads the parts down onto the base */}
        <div className="mt-8 flex flex-col items-center">
          <span aria-hidden className="h-7 w-px bg-gradient-to-b from-white/5 to-white/30" />
          <span className="my-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            all of it runs on the base
          </span>
          <span aria-hidden className="h-7 w-px bg-gradient-to-b from-white/30 to-white/5" />
        </div>

        {/* the engine base block — the foundation everything bolts onto */}
        <div className="rounded-[8px] border border-brand-500/40 border-t-2 border-t-brand-500 bg-brand-600/15 p-7 shadow-[0_-1px_0_rgba(255,255,255,0.06),0_28px_56px_-20px_rgba(0,0,0,0.65)] sm:p-9">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-200">
            The base &middot; installed once, ~90 days
          </p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-white">
            The Revenue Engine
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
            Bring <span aria-hidden className="text-ink-500">&middot;</span> Convert{' '}
            <span aria-hidden className="text-ink-500">&middot;</span> Retain
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-300">
            Answer the call, book the job, recover what went cold, prove the
            revenue. The system every cylinder bolts onto.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
