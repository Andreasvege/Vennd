import 'server-only'
import { prisma } from '@/lib/prisma'
import { newProximities, shortestPath } from '@/domain/paths'

type Edge = [string, string]
export type Proximity = { a: string; b: string; path: { id: string; name: string }[] }

/** Nettverket mellom andre, og hvem som er «interessante»: dem du dater, og dem som dater noen. */
export async function loadNetwork(userId: string) {
  const [persons, relationships] = await Promise.all([
    prisma.person.findMany({ where: { userId }, select: { id: true, name: true, type: true } }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId }, toPerson: { userId } },
      select: { id: true, fromPersonId: true, toPersonId: true, type: true },
    }),
  ])
  const interesting = new Set(persons.filter((p) => p.type === 'ROMANTIC').map((p) => p.id))
  for (const r of relationships) {
    if (r.type === 'ROMANTIC') {
      interesting.add(r.fromPersonId)
      interesting.add(r.toPersonId)
    }
  }
  return {
    names: new Map(persons.map((p) => [p.id, p.name])),
    // Også avsluttede relasjoner: de kjenner hverandre fortsatt.
    edges: relationships.map((r) => [r.fromPersonId, r.toPersonId] as Edge),
    edgeIds: relationships.map((r) => r.id),
    interesting,
  }
}

const named = (names: Map<string, string>, path: string[]) =>
  path.map((id) => ({ id, name: names.get(id) ?? '' }))

/** Par som en ny relasjon brakte nærmere hverandre. */
export async function proximitiesAfterNew(userId: string, newRelationshipId: string): Promise<Proximity[]> {
  const { names, edges, edgeIds, interesting } = await loadNetwork(userId)
  const before = edges.filter((_, i) => edgeIds[i] !== newRelationshipId)
  return newProximities(before, edges, interesting).map((p) => ({ a: p.a, b: p.b, path: named(names, p.path) }))
}

/**
 * «Verden er liten» på én profil: korte stier (2–3 steg) mellom personen og
 * de interessante — eller, er personen selv interessant, til alle andre
 * interessante.
 */
export async function getProximities(userId: string, personId: string): Promise<Proximity[]> {
  const { names, edges, interesting } = await loadNetwork(userId)
  const out: Proximity[] = []
  for (const other of interesting) {
    if (other === personId) continue
    const path = shortestPath(edges, personId, other, 3)
    if (path && path.length >= 3) out.push({ a: personId, b: other, path: named(names, path) })
  }
  return out.sort((x, y) => x.path.length - y.path.length)
}
