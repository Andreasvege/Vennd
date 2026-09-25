import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { isClaudeEnabled } from '@/server/claude/client'

/**
 * Det skriv-arket trenger for å kjenne igjen folk og vise trådene deres:
 * alle personene, og alle åpne tråder med hvem de gjelder. Hentes i
 * rot-layouten, så arket er klart på hvilken som helst side.
 */
export async function getComposerData(userId: string) {
  const [persons, threads] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, primaryTag: { select: { color: true } } },
    }),
    prisma.thread.findMany({
      where: { userId, status: 'OPEN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, persons: { select: { personId: true } } },
    }),
  ])
  return {
    persons: persons.map(({ primaryTag, ...p }) => ({ ...p, tint: personTint({ primaryTag }) })),
    threads: threads.map((th) => ({ id: th.id, title: th.title, personIds: th.persons.map((p) => p.personId) })),
    // Om Claude lager forslag etter lagring, så nettleseren vet om den skal vente på dem.
    claude: isClaudeEnabled(),
  }
}

export type ComposerData = Awaited<ReturnType<typeof getComposerData>>
export type ComposerPerson = ComposerData['persons'][number]
export type ComposerThread = ComposerData['threads'][number]
