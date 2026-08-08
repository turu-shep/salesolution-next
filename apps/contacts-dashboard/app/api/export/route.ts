import { NextResponse, type NextRequest } from 'next/server'

import { logExport, requireAccount } from '@/lib/auth-server'
import { countMatching, fetchPage } from '@/lib/contacts'
import type { SheetParams } from '@/lib/contacts'
import { exportFilename, exportFilter, exportRefusal, runExport } from '@/lib/csv.mjs'
import { parseSheetParams } from '@/lib/query.mjs'
import { describeError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/export — the current filter as CSV (AMENDMENT 2 D1–D4).
 *
 * The client sends filter parameters — never a column list, never rows. Rows
 * come from the same fetchPage the sheet renders from, already through the
 * toClientRow serialization boundary, so the file and the screen cannot
 * disagree. Ordering is the contract: 401 before any work, 400 before any
 * query, the 10,000-row cap before any rows, the audit row before any byte.
 */

type ExportResult =
  | { status: 413; error: string; rows: number }
  | { status: 200; rows: number; lines: AsyncIterable<string> }

export async function GET(req: NextRequest) {
  const gate = await requireAccount()
  if (gate instanceof Response) return gate

  // Raw-param admissibility. The sheet falls back so a stale URL still
  // renders; the export refuses — a request naming a column or lens that does
  // not exist is a bug or someone probing, and both deserve a line.
  const refusal = exportRefusal(req.nextUrl.searchParams)
  if (refusal) {
    console.log(`[export] account=${gate.email} ${refusal.log} at=${new Date().toISOString()}`)
    return NextResponse.json({ error: refusal.error }, { status: 400 })
  }

  const params = parseSheetParams(req.nextUrl.searchParams) as SheetParams

  // count → cap → audit, in that order, before any CSV byte exists. A failed
  // audit insert rejects here: an export that cannot be audited must not happen.
  let result: ExportResult
  try {
    result = (await runExport(params, { account: gate, countMatching, logExport, fetchPage })) as ExportResult
  } catch (err) {
    console.error('[export] refused to stream:', describeError(err))
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 })
  }

  if (result.status !== 200) {
    return NextResponse.json({ error: result.error, rows: result.rows }, { status: result.status })
  }

  // One line per successful (audited) export, with a name on it.
  console.log(
    `[export] account=${gate.email} view=${params.view} filter=${JSON.stringify(exportFilter(params))} rows=${result.rows} at=${new Date().toISOString()}`,
  )

  const lines = result.lines
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const line of lines) controller.enqueue(encoder.encode(line))
        controller.close()
      } catch (err) {
        // The connection dies mid-file rather than a short CSV closing as if
        // complete; the operator detail goes to the server log only.
        console.error('[export] stream failed mid-flight:', describeError(err))
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFilename(params.view, new Date().toISOString().slice(0, 10))}"`,
      'Cache-Control': 'no-store',
    },
  })
}
