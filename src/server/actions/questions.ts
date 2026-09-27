'use server'

import { prisma } from '@/lib/prisma'
import { nextTagColor } from '@/lib/palette'
import { placeNewPerson } from '@/domain/placement'
import { questionById, tighterCadence } from '@/domain/questions'
import { missingPairs } from '@/domain/sorting'
import { fold } from '@/domain/search'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { answerQuestionInput, type AnswerQuestionInput } from '@/server/schemas'
import { t } from '@/i18n'
import { assertPersonsOwned, fromDateInput, markSorted, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

/**
 * Et besvart spørsmålskort. Nye navn blir personer på kartet (et navn du
 * alt har, blir den du har), og svaret gjør det spørsmålet lover: et miljø,
 * koblinger mellom dem, en tettere rytme eller en påminnelse om å ta kontakt.
 */
export async function answerQuestion(raw: AnswerQuestionInput): Promise<ActionResult<{ people: number }>> {
  const userId = await requireUserId()
  const parsed = answerQuestionInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { questionId, newNames, groupName, today } = parsed.data
  const question = questionById(questionId)!
  const { effect } = question
  const known = [...new Set(parsed.data.personIds)]

  try {
    await assertPersonsOwned(userId, known)
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const people = await prisma.$transaction(async (tx) => {
    // Nye navn: finnes navnet fra før (også i Venter), brukes den personen.
    const existing = await tx.person.findMany({
      where: { userId, archivedAt: null },
      select: { id: true, name: true, positionX: true, positionY: true },
    })
    const positions = existing.map((p) => ({ x: p.positionX, y: p.positionY }))
    const ids = [...known]
    for (const name of new Set(newNames.map((n) => n.trim()))) {
      const same = existing.find((p) => fold(p.name) === fold(name))
      if (same) {
        if (!ids.includes(same.id)) ids.push(same.id)
        continue
      }
      const spot = placeNewPerson(positions)
      positions.push(spot)
      const created = await tx.person.create({
        data: { userId, name, type: effect.type ?? 'FRIEND', positionX: spot.x, positionY: spot.y, sortedAt: new Date() },
        select: { id: true },
      })
      ids.push(created.id)
    }
    if (ids.length === 0) return 0
    await markSorted(userId, ids, tx)

    if (effect.cadenceWeeks !== undefined) {
      const rows = await tx.person.findMany({ where: { id: { in: ids } }, select: { id: true, cadenceWeeks: true } })
      for (const r of rows) {
        const next = tighterCadence(r.cadenceWeeks, effect.cadenceWeeks)
        if (next !== undefined) await tx.person.update({ where: { id: r.id }, data: { cadenceWeeks: next, snoozedUntil: null } })
      }
    }

    if (effect.group && groupName) {
      const tag =
        (await tx.tag.findFirst({ where: { userId, name: { equals: groupName, mode: 'insensitive' } }, select: { id: true } })) ??
        (await (async () => {
          const used = await tx.tag.findMany({ where: { userId }, select: { color: true } })
          return tx.tag.create({
            data: { userId, name: groupName, color: nextTagColor(used.map((x) => x.color)), sortOrder: used.length },
            select: { id: true },
          })
        })())
      await tx.personTag.createMany({ data: ids.map((personId) => ({ personId, tagId: tag.id })), skipDuplicates: true })
      await tx.person.updateMany({ where: { id: { in: ids }, userId, primaryTagId: null }, data: { primaryTagId: tag.id } })
    }

    if (effect.connectAll && ids.length > 1) {
      const have = await tx.relationship.findMany({
        where: { fromPersonId: { in: ids }, toPersonId: { in: ids } },
        select: { fromPersonId: true, toPersonId: true },
      })
      const pairs = missingPairs(ids, have.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]))
      await tx.relationship.createMany({
        data: pairs.map(([a, b]) => ({ fromPersonId: a, toPersonId: b, type: effect.connectAll! })),
      })
    }

    if (effect.reachOut) {
      for (const personId of ids) {
        await tx.thread.create({
          data: {
            userId,
            title: t.questions.reachOutTitle,
            dueDate: fromDateInput(today),
            persons: { create: [{ personId }] },
          },
        })
      }
    }
    return ids.length
  })

  refreshAll()
  return { ok: true, data: { people } }
}
