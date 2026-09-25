import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/server/session'

/**
 * Er Claude ferdig med forslag til loggen? Nettleseren spør noen ganger
 * etter at du har lagret, og henter siden på nytt når svaret er ja.
 */
export async function GET(request: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = request.nextUrl.searchParams.get('logg')?.slice(0, 64) ?? ''
  const log = id ? await prisma.logEntry.findFirst({ where: { id, userId }, select: { suggestedAt: true } }) : null
  return NextResponse.json({ done: log?.suggestedAt != null }, { headers: { 'Cache-Control': 'no-store' } })
}
