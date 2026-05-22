import Image from 'next/image'

type Author = {
  name: string
  role?: string
  bio?: string
  image?: { asset?: { url: string } }
  social?: { linkedin?: string; twitter?: string; website?: string }
}

export function AuthorBio({ author }: { author: Author }) {
  return (
    <aside className="mt-12 rounded-lg bg-surface-tint-blue p-6 ring-1 ring-ink-300/10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {author.image?.asset?.url ? (
          <Image
            src={author.image.asset.url}
            alt=""
            width={72}
            height={72}
            className="h-18 w-18 shrink-0 rounded-full object-cover ring-1 ring-ink-300/20"
          />
        ) : (
          <div className="h-18 w-18 shrink-0 rounded-full bg-brand-100" />
        )}
        <div className="flex-1">
          <p className="font-display text-lg font-semibold text-ink-900">{author.name}</p>
          {author.role && <p className="text-sm text-ink-500">{author.role}</p>}
          {author.bio && <p className="mt-3 text-sm text-ink-700">{author.bio}</p>}
          {author.social && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-500 transition hover:text-brand-600"
                >
                  LinkedIn
                </a>
              )}
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-500 transition hover:text-brand-600"
                >
                  X / Twitter
                </a>
              )}
              {author.social.website && (
                <a
                  href={author.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-500 transition hover:text-brand-600"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
