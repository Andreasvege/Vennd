'use server'

import { prisma } from '@/lib/prisma'
import { pairKey, withAssessments } from '@/domain/linkSuggestions'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { linkPair, linkPairs } from '@/server/schemas'
import { loadLinkState } from '@/server/queries/links'
import { assessNetwork, type AssessResult } from '@/server/claude/links'
import { isClaudeEnabled } from '@/server/claude/client'
import { assertPersonsOwned, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

const ordered = ([x, y]: [string, string]): [string, string] => (x < y ? [x, y] : [y, x])

/**
 * Legg til forslag som relasjoner: typen og etiketten Claude foreslo, ellers
 * regelens gjetning. Par som allerede er koblet, blir ikke koblet to ganger.
 */
export async function acceptLinks(raw: [string, string][]): Promise<ActionResult<{ created: number }>> {
  const userId = await requireUserId()
  const parsed = linkPairs.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const pairs = parsed.data.map(ordered)

  try {
    await assertPersonsOwned(userId, [...new Set(pairs.flat())])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const { candidates, rows } = await loadLinkState(userId)
  const views = new Map(withAssessments(candidates, rows).map((v) => [pairKey(v.a, v.b), v]))
  const created = await prisma.$transaction(async (tx) => {
    const ids = [...new Set(pairs.flat())]
    const existing = await tx.relationship.findMany({
      where: { fromPersonId: { in: ids }, toPersonId: { in: ids } },
      select: { fromPersonId: true, toPersonId: true },
    })
    const linked = new Set(existing.map((r) => pairKey(r.fromPersonId, r.toPersonId)))
    const fresh = pairs.filter(([a, b], i) => !linked.has(pairKey(a, b)) && pairs.findIndex(([x, y]) => x === a && y === b) === i)
    await tx.relationship.createMany({
      data: fresh.map(([a, b]) => {
        const v = views.get(pairKey(a, b))
        return { fromPersonId: a, toPersonId: b, type: v?.type ?? 'FRIEND', label: v?.label ?? null }
      }),
    })
    for (const [aId, bId] of pairs) {
      await tx.linkSuggestion.upsert({
        where: { userId_aId_bId: { userId, aId, bId } },
        create: { userId, aId, bId, status: 'ACCEPTED' },
        update: { status: 'ACCEPTED' },
      })
    }
    return fresh.length
  })

  refreshAll()
  return { ok: true, data: { created } }
}

/** Nei takk: paret foreslås ikke igjen. */
export async function dismissLink(raw: [string, string]): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = linkPair.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const [aId, bId] = ordered(parsed.data)
  try {
    await assertPersonsOwned(userId, [aId, bId])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }
  await prisma.linkSuggestion.upsert({
    where: { userId_aId_bId: { userId, aId, bId } },
    create: { userId, aId, bId, status: 'DISMISSED' },
    update: { status: 'DISMISSED' },
  })
  refreshAll()
  return { ok: true }
}

/**
 * «Spør Claude»: hele nettverket vurderes i ett kall. Venter på svaret, så
 * siden kan vise de nye forslagene med en gang.
 */
export async function askClaudeForLinks(): Promise<ActionResult<{ result: AssessResult }>> {
  const userId = await requireUserId()
  if (!isClaudeEnabled()) return fail('failed')
  const result = await assessNetwork(userId)
  if (result.status === 'done') refreshAll()
  return { ok: true, data: { result } }
}
