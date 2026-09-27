import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/server/session'
import { getPendingSuggestions } from '@/server/queries/suggestions'

/**
 * Er Claude ferdig med forslag til loggen? Nettleseren spør noen ganger
 * etter at du har lagret, og henter siden på nytt når svaret er ja. Når de
 * er klare, følger forslagene til loggen med, så de kan vises med en gang.
 */
export async function GET(request: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = request.nextUrl.searchParams.get('logg')?.slice(0, 64) ?? ''
  const log = id ? await prisma.logEntry.findFirst({ where: { id, userId }, select: { suggestedAt: true } }) : null
  const done = log?.suggestedAt != null
  const items = done ? await getPendingSuggestions(userId, undefined, id) : []
  return NextResponse.json({ done, items }, { headers: { 'Cache-Control': 'no-store' } })
}
