import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CYLINDER_GROUPS } from '@/lib/revenue-engine'

import { PillarIcon } from './pillar-icons'

/**
 * "Six cylinders, one engine" — the six /services/* offerings grouped by the job
 * each fires (Bring / Convert / Retain). Each card deep-links to its service
 * page. This page names and describes the services; it does not target their
 * head keywords (those belong to /services/{slug}/).
 */
export function SixCylinders({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What fires inside it
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The cylinders.{' '}
          <span className="text-ink-900">One engine.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          The engine fires a set of services, grouped by the job each does. You
          don’t have to fire all of them. They’re built to run together, and most
          leaks live where two should hand off and don’t.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        {CYLINDER_GROUPS.map((group) => (
          <div key={group.pillar} className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-10">
            <div className="md:pt-1">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
                  <PillarIcon pillar={group.pillar} className="h-[18px] w-[18px]" />
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                  {group.pillar}
                </h3>
              </div>
              <p className="mt-2 text-base text-ink-600 md:ml-12">{group.job}.</p>
            </div>

            <div className={group.cylinders.length > 1 ? 'grid gap-4 sm:grid-cols-2 [&>*:last-child:nth-child(odd)]:sm:col-span-2' : 'grid gap-4'}>
              {group.cylinders.map((cyl) => {
                const body = (
                  <>
                    <p className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
                      {cyl.name}
                    </p>
                    <p className="mt-2 flex-1 leading-relaxed text-ink-700">{cyl.fires}</p>
                    {cyl.slug ? (
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                        See {cyl.name}
                        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    ) : (
                      <span className="mt-5 inline-flex w-fit items-center rounded-[3px] border border-rule px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-600">
                        Coming soon
                      </span>
                    )}
                  </>
                )
                return cyl.slug ? (
                  <Link
                    key={cyl.name}
                    href={`/services/${cyl.slug}/`}
                    className="group flex flex-col rounded-[4px] border border-rule bg-surface p-6 transition-colors duration-200 hover:border-ink-900"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    key={cyl.name}
                    className="flex flex-col rounded-[4px] border border-dashed border-rule bg-surface/50 p-6"
                  >
                    {body}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionRail>
  )
}
