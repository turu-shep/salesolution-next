import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_WEEK3_MD } from '@/lib/strategy/docs/ceo-speech-week3'

export const metadata = { title: 'Week 3 session sheets' }

export default function CeoSpeechWeek3Page() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Week 3 session sheets</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_WEEK3_MD} />
    </div>
  )
}
