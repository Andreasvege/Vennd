import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'

/** Alt kartet trenger: personene med farge og plass, og relasjonene mellom dem. */
export async function getGraph(userId: string) {
  const [persons, relationships] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        photoUrl: true,
        positionX: true,
        positionY: true,
        primaryTag: { select: { id: true, name: true, color: true } },
      },
    }),
    // Begge ender må eies av brukeren, ellers kunne en relasjon lekke en
    // annen brukers person.
    prisma.relationship.findMany({
      where: { fromPerson: { userId }, toPerson: { userId } },
      select: { id: true, fromPersonId: true, toPersonId: true, type: true, label: true, until: true },
    }),
  ])

  return {
    persons: persons.map((p) => ({ ...p, tint: personTint(p) })),
    relationships,
  }
}

export type Graph = Awaited<ReturnType<typeof getGraph>>
export type MapPerson = Graph['persons'][number]
export type MapRelationship = Graph['relationships'][number]
