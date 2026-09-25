import { NextResponse, type NextRequest } from 'next/server'
import { getUserId } from '@/server/session'
import { searchAll } from '@/server/queries/search'

/** Søket bak paletten. GET, så en forespørsel som er utdatert kan avbrytes. */
export async function GET(request: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const q = request.nextUrl.searchParams.get('q') ?? ''
  return NextResponse.json(await searchAll(userId, q), { headers: { 'Cache-Control': 'no-store' } })
}
