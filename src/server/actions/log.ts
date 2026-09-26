'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { assertAllOwned, NotOwnedError } from '@/server/ownership'
import { logEdit, logInput, type LogEdit, type LogInput } from '@/server/schemas'
import { assertPersonsOwned, fromDateInput, parseId, refreshAll, markSorted } from './shared'
import { fail, type ActionResult } from './result'
import { after } from 'next/server'
import { isClaudeEnabled } from '@/server/claude/client'
import { generateSuggestions } from '@/server/claude/suggest'

export type LogSaved = { id: string; closed: number; opened: number }

/**
 * Lagre en logg — og i samme slengen lukke trådene den følger opp og åpne
 * nye. Alt i én transaksjon: enten står hele samtalen, eller ingenting.
 */
export async function createLog(raw: LogInput): Promise<ActionResult<LogSaved>> {
  const userId = await requireUserId()
  const parsed = logInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { personIds, date, type, body, closeThreads = [], newThreads = [], planId } = parsed.data
  const unique = [...new Set(personIds)]
  const closeIds = [...new Set(closeThreads.map((c) => c.id))]

  try {
    await assertPersonsOwned(userId, unique)
    const open = await prisma.thread.findMany({
      where: { id: { in: closeIds }, userId, status: 'OPEN' },
      select: { id: true },
    })
    assertAllOwned(closeIds, open)
    if (planId) {
      const plan = await prisma.plan.findFirst({ where: { id: planId, userId, status: 'PLANNED' }, select: { id: true } })
      if (!plan) throw new NotOwnedError()
    }
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const resolutions = new Map(closeThreads.map((c) => [c.id, c.resolution?.trim() || null]))
  const now = new Date()

  let entry: { id: string }
  try {
    entry = await prisma.$transaction(async (tx) => {
    const created = await tx.logEntry.create({
      data: {
        userId,
        date: fromDateInput(date),
        type: type ?? null,
        body: body?.trim() || null,
        participants: { create: unique.map((personId) => ({ personId })) },
      },
      select: { id: true },
    })
    await markSorted(userId, unique, tx)
    for (const threadId of closeIds) {
      // Vakten gjentas her: ble tråden lukket et annet sted i mellomtiden,
      // rulles hele loggen tilbake i stedet for å skrive over den.
      const { count } = await tx.thread.updateMany({
        where: { id: threadId, userId, status: 'OPEN' },
        data: { status: 'CLOSED', closedAt: now, closedById: created.id, resolution: resolutions.get(threadId) },
      })
      if (count !== 1) throw new NotOwnedError()
    }
    if (planId) {
      // Planen er fulgt opp: loggen er det som faktisk skjedde.
      const { count } = await tx.plan.updateMany({
        where: { id: planId, userId, status: 'PLANNED' },
        data: { status: 'DONE', logEntryId: created.id },
      })
      if (count !== 1) throw new NotOwnedError()
    }
    for (const th of newThreads) {
      await tx.thread.create({
        data: {
          userId,
          title: th.title,
          dueDate: th.dueDate ? fromDateInput(th.dueDate) : null,
          openedById: created.id,
          persons: { create: [...new Set(th.personIds)].map((personId) => ({ personId })) },
        },
      })
    }
    return created
    })
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  refreshAll()
  // Loggen er lagret og svaret går ut nå; Claude foreslår tråder, fakta og
  // personer etterpå, så skrivingen aldri venter.
  if (isClaudeEnabled()) after(() => generateSuggestions(userId, entry.id))
  return { ok: true, data: { id: entry.id, closed: closeIds.length, opened: newThreads.length } }
}

/** Rett en logg: tekst, dag, type og hvem som var med. Trådene står urørt. */
export async function updateLog(rawId: string, raw: LogEdit): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const parsed = logEdit.safeParse(raw)
  if (!id || !parsed.success) return fail('invalid')
  const { personIds, date, type, body } = parsed.data
  const unique = [...new Set(personIds)]

  try {
    await assertPersonsOwned(userId, unique)
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.logEntry.updateMany({
        where: { id, userId },
        data: { date: fromDateInput(date), type, body: body.trim() || null },
      })
      if (count !== 1) throw new NotOwnedError()
      await tx.logParticipant.deleteMany({ where: { logEntryId: id, personId: { notIn: unique } } })
      await tx.logParticipant.createMany({ data: unique.map((personId) => ({ logEntryId: id, personId })), skipDuplicates: true })
      await markSorted(userId, unique, tx)
    })
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }
  refreshAll()
  return { ok: true }
}

export async function deleteLog(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const count = await prisma.$transaction(async (tx) => {
    // Loggen som avsluttet en plan: planen venter igjen på «hvordan gikk
    // det?», i stedet for å bli stående som gjort uten noe å vise til.
    await tx.plan.updateMany({ where: { logEntryId: id, userId }, data: { status: 'PLANNED', logEntryId: null } })
    const { count } = await tx.logEntry.deleteMany({ where: { id, userId } })
    return count
  })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
