import 'server-only'
import { prisma } from '@/lib/prisma'
import { t } from '@/i18n'

/**
 * Det importen må vite for å finne duplikater: personene (med bursdag og
 * e-post fra faktaene), plassene deres på kartet, og logger og planer.
 */
export async function getImportContext(userId: string) {
  const [persons, logs, plans, tags] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        birthday: true,
        positionX: true,
        positionY: true,
        facts: { where: { label: t.import.emailLabel }, select: { value: true } },
      },
    }),
    prisma.logEntry.findMany({
      where: { userId },
      select: { date: true, participants: { select: { personId: true } } },
    }),
    prisma.plan.findMany({ where: { userId, status: 'PLANNED' }, select: { at: true, title: true } }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, color: true },
    }),
  ])
  return {
    persons: persons.map((p) => ({
      id: p.id,
      name: p.name,
      birthday: p.birthday,
      emails: p.facts.map((f) => f.value.toLowerCase()),
    })),
    positions: persons.map((p) => ({ x: p.positionX, y: p.positionY })),
    logs: logs.map((l) => ({ date: l.date, personIds: l.participants.map((p) => p.personId) })),
    plans,
    tags,
  }
}

export type ImportContext = Awaited<ReturnType<typeof getImportContext>>
