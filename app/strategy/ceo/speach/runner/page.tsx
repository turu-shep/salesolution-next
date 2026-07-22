import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_RUNNER_MD } from '@/lib/strategy/docs/ceo-speech-runner'

export const metadata = { title: 'How a session runs' }

export default function CeoSpeechRunnerPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">How a session runs</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_RUNNER_MD} />
    </div>
  )
}
