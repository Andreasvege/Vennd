'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { placeNewPerson } from '@/domain/placement'
import { fold } from '@/domain/search'
import { contactStatus, type KnownPerson } from '@/domain/import/match'
import { requireUserId } from '@/server/session'
import { NotOwnedError } from '@/server/ownership'
import { contactImport, eventImport, type ContactImport, type EventImport } from '@/server/schemas'
import { getImportContext } from '@/server/queries/import'
import { assertPersonsOwned, assertTagsOwned, fromDateInput, refreshAll } from './shared'
import { fail, type ActionResult } from './result'
import { t } from '@/i18n'

const BODY_MAX = 500
// Store importer tar tid mot en database over nettet; standardgrensen er 5 s.
const TX = { timeout: 60_000 }

export type ContactImportResult = { created: number; birthdays: number; skipped: number }

/**
 * Lager personene som ikke finnes, legger til bursdag der den mangler, og
 * hopper over resten. Duplikatsjekken gjøres på nytt her; forhåndsvisningen
 * i nettleseren er bare et forslag.
 */
export async function importContacts(raw: ContactImport): Promise<ActionResult<ContactImportResult>> {
  const userId = await requireUserId()
  const parsed = contactImport.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { contacts, tagIds, remind } = parsed.data

  try {
    await assertTagsOwned(userId, tagIds)
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const { persons, positions } = await getImportContext(userId)
  const known: KnownPerson[] = [...persons]
  const spots = [...positions]
  const created: { id: string; name: string; birthday: Date | null; notes: string | null; x: number; y: number }[] = []
  const facts: { personId: string; label: string; value: string }[] = []
  const birthdays = new Map<string, Date>()

  for (const c of contacts) {
    const status = contactStatus({ key: '', ...c }, known)
    if (status.kind === 'add-birthday' && c.birthday) {
      birthdays.set(status.personId, fromDateInput(c.birthday))
      continue
    }
    if (status.kind !== 'new') continue

    // Egne id-er, så personer, fakta og tagger kan lages med én spørring hver.
    const id = randomUUID()
    const spot = placeNewPerson(spots)
    spots.push(spot)
    const birthday = c.birthday ? fromDateInput(c.birthday) : null
    created.push({ id, name: c.name, birthday, notes: c.note, ...spot })
    if (c.phone) facts.push({ personId: id, label: t.import.phoneLabel, value: c.phone.slice(0, 200) })
    if (c.email) facts.push({ personId: id, label: t.import.emailLabel, value: c.email.slice(0, 200) })
    // Også duplikater innad i filen fanges: neste like kontakt «finnes».
    known.push({ id, name: c.name, birthday, emails: c.email ? [c.email.toLowerCase()] : [] })
  }

  await prisma.$transaction(async (tx) => {
    await tx.person.createMany({
      data: created.map((p) => ({
        id: p.id,
        userId,
        name: p.name,
        birthday: p.birthday,
        notes: p.notes,
        positionX: p.x,
        positionY: p.y,
        cadenceWeeks: remind ? 4 : null,
        primaryTagId: tagIds[0] ?? null,
      })),
    })
    await tx.fact.createMany({ data: facts })
    await tx.personTag.createMany({ data: created.flatMap((p) => tagIds.map((tagId) => ({ personId: p.id, tagId }))) })
    for (const [personId, birthday] of birthdays) {
      await tx.person.updateMany({ where: { id: personId, userId, birthday: null }, data: { birthday } })
    }
  }, TX)

  refreshAll()
  return {
    ok: true,
    data: { created: created.length, birthdays: birthdays.size, skipped: contacts.length - created.length - birthdays.size },
  }
}

export type EventImportResult = { logs: number; plans: number; skipped: number }

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))

/** Passerte hendelser blir logger («Møttes»), kommende blir planer. Duplikater hoppes over. */
export async function importEvents(raw: EventImport): Promise<ActionResult<EventImportResult>> {
  const userId = await requireUserId()
  const parsed = eventImport.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { events } = parsed.data

  try {
    await assertPersonsOwned(userId, [...new Set(events.flatMap((e) => e.personIds))])
  } catch (e) {
    if (e instanceof NotOwnedError) return fail('not-found')
    throw e
  }

  const { logs: existingLogs, plans: existingPlans } = await getImportContext(userId)
  const logs: { id: string; date: Date; body: string; personIds: string[] }[] = []
  const plans: { id: string; at: Date; hasTime: boolean; title: string; personIds: string[] }[] = []

  for (const e of events) {
    const personIds = [...new Set(e.personIds)]
    const title = e.title || t.import.untitled
    if (e.kind === 'log') {
      const date = fromDateInput(e.date)
      const all = [...existingLogs, ...logs]
      if (all.some((l) => l.date.getTime() === date.getTime() && sameSet(l.personIds, personIds))) continue
      const body = [title, e.description?.trim()].filter(Boolean).join('\n\n').slice(0, BODY_MAX)
      logs.push({ id: randomUUID(), date, body, personIds })
    } else {
      const at = e.at ? new Date(e.at) : fromDateInput(e.date)
      const all = [...existingPlans, ...plans]
      if (all.some((p) => p.at.getTime() === at.getTime() && fold(p.title) === fold(title))) continue
      plans.push({ id: randomUUID(), at, hasTime: e.at !== null, title: title.slice(0, 120), personIds })
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.logEntry.createMany({ data: logs.map((l) => ({ id: l.id, userId, date: l.date, type: 'MET' as const, body: l.body })) })
    await tx.logParticipant.createMany({
      data: logs.flatMap((l) => l.personIds.map((personId) => ({ logEntryId: l.id, personId }))),
    })
    await tx.plan.createMany({
      data: plans.map((p) => ({ id: p.id, userId, at: p.at, hasTime: p.hasTime, title: p.title })),
    })
    await tx.planPerson.createMany({
      data: plans.flatMap((p) => p.personIds.map((personId) => ({ planId: p.id, personId }))),
    })
  }, TX)

  refreshAll()
  return { ok: true, data: { logs: logs.length, plans: plans.length, skipped: events.length - logs.length - plans.length } }
}
