import Image from 'next/image'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

type Author = {
  name: string
  role?: string
  bio?: string
  image?: { asset?: { url: string } }
  social?: { linkedin?: string; twitter?: string; website?: string }
}

/**
 * Author footer — dark editorial band.
 *
 * Same vocabulary as the homepage Operator block, scaled lighter for a
 * post footer. Two columns on desktop (portrait + credentials sidebar),
 * stacked on mobile. The sidebar plays the same role as the credentials
 * card on Operator — it gives the reader a single place to land social
 * links and a one-line stance from the author.
 */
export function PostAuthor({ author }: { author: Author }) {
  if (!author?.name) return null

  return (
    <SectionRail tone="dark" size="sm">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            About the author
          </p>

          <div className="mt-6 flex items-center gap-5">
            {author.image?.asset?.url ? (
              <Image
                src={author.image.asset.url}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10" />
            )}
            <div>
              <p className="font-display text-2xl font-semibold tracking-[-0.015em] text-white">
                {author.name}
              </p>
              {author.role && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                  {author.role}
                </p>
              )}
            </div>
          </div>

          {author.bio && (
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-300">
              {author.bio}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/book-growth-call/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
            >
              Work with {author.name.split(' ')[0]}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/category/blog/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-300 hover:text-white"
            >
              More writing
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Social / stance sidebar — only renders when there's social to show. */}
        {(author.social?.linkedin ||
          author.social?.twitter ||
          author.social?.website) && (
          <div className="md:col-span-5">
            <div className="border border-white/10 bg-black/30 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                <span>Connect</span>
                <span className="text-ink-400">{author.name}</span>
              </div>

              <ul className="divide-y divide-white/10">
                {author.social?.linkedin && (
                  <SocialRow
                    label="LinkedIn"
                    href={author.social.linkedin}
                  />
                )}
                {author.social?.twitter && (
                  <SocialRow
                    label="X / Twitter"
                    href={author.social.twitter}
                  />
                )}
                {author.social?.website && (
                  <SocialRow
                    label="Website"
                    href={author.social.website}
                  />
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </SectionRail>
  )
}

function SocialRow({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300 group-hover:text-white">
          {label}
        </span>
        <span
          aria-hidden
          className="text-ink-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent-500"
        >
          →
        </span>
      </a>
    </li>
  )
}
