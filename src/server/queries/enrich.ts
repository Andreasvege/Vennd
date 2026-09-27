import 'server-only'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { enrichOrder, gapsOf } from '@/domain/enrich'
import { currentPhase } from '@/domain/romance'
import { t } from '@/i18n'
import { getLastContact } from './lastContact'
import { onMap } from './visibility'

// Telefon og e-post kommer fra importen; de sier ikke noe om hvem personen er.
const IMPORTED: string[] = [t.import.phoneLabel, t.import.emailLabel]

/**
 * «Fyll inn kartet»: alle på kartet med det vi vet om dem, og stokken av
 * dem det mangler noe om. Med `only` bare de valgte (fra Innsikt eller en
 * profil), med `tagId` bare ett miljø, og med `neverLogged` bare dem uten
 * noen logget kontakt (fra I dag og Innsikt; for mange til å stå i adressen). De valgte kommer med selv om
 * ingenting mangler, så du kan fylle på likevel.
 */
export async function getEnrichData(userId: string, filter: { only?: string[]; tagId?: string; neverLogged?: boolean } = {}) {
  const [persons, tags, relationships, lastContact] = await Promise.all([
    prisma.person.findMany({
      where: { userId, ...onMap },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        type: true,
        relationLabel: true,
        cadenceWeeks: true,
        birthday: true,
        primaryTag: { select: { id: true, name: true, color: true } },
        tags: { select: { tagId: true } },
        facts: { select: { label: true, value: true }, orderBy: { createdAt: 'asc' } },
        phases: { select: { phase: true, at: true } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, color: true },
    }),
    prisma.relationship.findMany({
      where: { fromPerson: { userId }, toPerson: { userId } },
      select: { fromPersonId: true, toPersonId: true },
    }),
    getLastContact(userId),
  ])

  const degree = new Map<string, number>()
  for (const r of relationships) {
    degree.set(r.fromPersonId, (degree.get(r.fromPersonId) ?? 0) + 1)
    degree.set(r.toPersonId, (degree.get(r.toPersonId) ?? 0) + 1)
  }

  const shaped = persons.map((p) => {
    const facts = p.facts.filter((f) => !IMPORTED.includes(f.label))
    const person = {
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      tint: personTint(p),
      type: p.type,
      relationLabel: p.relationLabel,
      phase: currentPhase(p.phases),
      cadenceWeeks: p.cadenceWeeks,
      birthday: p.birthday,
      primaryTag: p.primaryTag,
      tagIds: p.tags.map((x) => x.tagId),
      facts,
      factCount: facts.length,
      relationshipCount: degree.get(p.id) ?? 0,
      lastContact: lastContact.get(p.id) ?? null,
    }
    return { ...person, gaps: gapsOf(person) }
  })

  const byId = new Map(shaped.map((p) => [p.id, p]))
  const pool = shaped.filter(
    (p) => (!filter.tagId || p.tagIds.includes(filter.tagId)) && (!filter.neverLogged || p.lastContact === null),
  )
  const deck = filter.only?.length
    ? filter.only.filter((id) => byId.has(id))
    : enrichOrder(pool)

  return {
    deck: deck.map((id) => byId.get(id)!),
    everyone: shaped.map((p) => ({ id: p.id, name: p.name, tint: p.tint, tagIds: p.tagIds })),
    tags,
    pairs: relationships.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]),
    /** Hvor mange på kartet det mangler noe om, for inngangen på Bygg kartet. */
    withGaps: shaped.filter((p) => p.gaps.length > 0).length,
  }
}

export type EnrichData = Awaited<ReturnType<typeof getEnrichData>>
export type EnrichCardPerson = EnrichData['deck'][number]
