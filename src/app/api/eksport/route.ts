import { NextResponse } from 'next/server'
import { getUserId } from '@/server/session'
import { getExport } from '@/server/queries/export'

/** Last ned alt som JSON: dine data, i et åpent format, når du vil. */
export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const day = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(await getExport(userId), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="vennd-${day}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
