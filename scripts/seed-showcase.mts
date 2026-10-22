// Utstillingsdata for skjermbildene i README (docs/screenshots/). Alle
// personer er oppdiktet. Datoene regnes fra i dag, så kartet, I dag og
// Innsikt ser levende ut uansett når skriptet kjøres.
//
// Lager (og erstatter) bare brukeren «showcase-user». Kun lokal database.
//
//   node --env-file=.env.local scripts/seed-showcase.mts
//
// Skriver sesjonscookien til .dev/session-token-showcase.txt (skrives ikke ut).

import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { encode } from 'next-auth/jwt'

const url = process.env.DATABASE_URL ?? ''
const host = (() => {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
})()
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error(`Nekter å seede: DATABASE_URL peker på «${host || 'ukjent'}», ikke en lokal database.`)
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: url })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const USER_ID = 'showcase-user'
const DAY = 86_400_000
// Fast frø: samme data hver gang.
let seed = 11
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)]
const daysAgo = (n: number) => {
  const d = new Date(Date.now() - n * DAY)
  d.setUTCHours(12, 0, 0, 0)
  return d
}

type Type = 'FRIEND' | 'FAMILY' | 'COLLEAGUE' | 'ROMANTIC' | 'ACQUAINTANCE'
type LogType = 'MET' | 'CALLED' | 'MESSAGE' | 'DATE'

async function main() {
  await prisma.user.deleteMany({ where: { id: USER_ID } })
  await prisma.user.create({ data: { id: USER_ID, name: 'Andreas Vege', email: 'showcase@vennd.local' } })

  const tagSpecs = [
    ['Studentradio', 'ochre'],
    ['Klatring', 'sage'],
    ['Jobb', 'teal'],
    ['Familie', 'slate'],
    ['Lillehammer', 'clay'],
    ['Folkehøgskole', 'plum'],
    ['Romantisk', 'rose'],
  ] as const
  const tag: Record<string, string> = {}
  for (const [i, [name, color]] of tagSpecs.entries()) {
    tag[name] = (await prisma.tag.create({ data: { userId: USER_ID, name, color, sortOrder: i } })).id
  }

  // [navn, type, egen etikett, rytme i uker, miljøer (første er hovedmiljø), sortert]
  const people: [string, Type, string | null, number | null, string[], boolean?][] = [
    ['Ingrid Aas', 'FRIEND', 'bestevenn', 2, ['Studentradio', 'Klatring']],
    ['Martin Nilsen', 'FRIEND', null, 4, ['Studentradio']],
    ['Sofie Lund', 'FRIEND', null, 4, ['Studentradio']],
    ['Emil Haug', 'FRIEND', null, 6, ['Studentradio', 'Folkehøgskole']],
    ['Nora Bakke', 'ACQUAINTANCE', null, 26, ['Studentradio']],
    ['Aksel Brekke', 'FRIEND', null, 8, ['Studentradio']],
    ['Tuva Sandvik', 'FRIEND', null, 8, ['Studentradio']],
    ['Sander Myhre', 'ACQUAINTANCE', null, null, ['Studentradio']],
    ['Ida Fossum', 'FRIEND', null, 12, ['Studentradio']],
    ['Vetle Ruud', 'ACQUAINTANCE', null, null, ['Studentradio']],
    ['Hedda Løken', 'FRIEND', null, 12, ['Studentradio']],
    ['Jonas Rud', 'FRIEND', null, 2, ['Klatring', 'Jobb']],
    ['Thea Moen', 'FRIEND', null, 3, ['Klatring']],
    ['Sindre Kvam', 'FRIEND', null, 4, ['Klatring']],
    ['Oda Tangen', 'FRIEND', null, 6, ['Klatring']],
    ['Even Hagen', 'ACQUAINTANCE', null, 12, ['Klatring']],
    ['Kristine Aas-Johansen', 'COLLEAGUE', 'leder', 4, ['Jobb']],
    ['Henrik Dahl', 'COLLEAGUE', null, 4, ['Jobb']],
    ['Marte Engen', 'COLLEAGUE', null, 8, ['Jobb']],
    ['Petter Hovland', 'COLLEAGUE', 'mentor', 6, ['Jobb']],
    ['Selma Vik', 'COLLEAGUE', null, null, ['Jobb']],
    ['Fredrik Aune', 'COLLEAGUE', null, null, ['Jobb']],
    ['Mamma', 'FAMILY', 'mamma', 1, ['Familie']],
    ['Pappa', 'FAMILY', 'pappa', 1, ['Familie']],
    ['Synne', 'FAMILY', 'søster', 2, ['Familie']],
    ['Farmor', 'FAMILY', 'farmor', 4, ['Familie']],
    ['Jakob', 'FAMILY', 'fetter', 12, ['Familie']],
    ['Magnus Strand', 'FRIEND', 'barndomsvenn', 6, ['Lillehammer']],
    ['Eirik Lie', 'FRIEND', 'barndomsvenn', 8, ['Lillehammer']],
    ['Karoline Bakken', 'FRIEND', null, 12, ['Lillehammer']],
    ['Simen Nygård', 'ACQUAINTANCE', null, 26, ['Lillehammer']],
    ['Maja Solberg', 'FRIEND', null, 8, ['Folkehøgskole']],
    ['Erik Sæther', 'FRIEND', null, 12, ['Folkehøgskole']],
    ['Guro Halvorsen', 'FRIEND', null, 26, ['Folkehøgskole']],
    ['Brage Knutsen', 'ACQUAINTANCE', null, null, ['Folkehøgskole']],
    ['Hanna Berg', 'ROMANTIC', null, 1, ['Romantisk']],
    ['Line Holm', 'ROMANTIC', 'eks', null, ['Romantisk']],
    // Importert fra kontaktene, ikke sortert ennå: havner i Venter-bunken.
    ['Adrian Karlsen', 'ACQUAINTANCE', null, null, [], false],
    ['Tiril Olsen', 'ACQUAINTANCE', null, null, [], false],
    ['Leon Pedersen', 'ACQUAINTANCE', null, null, [], false],
    ['Victoria Jakobsen', 'ACQUAINTANCE', null, null, [], false],
    ['Johannes Hansen', 'ACQUAINTANCE', null, null, [], false],
  ]

  const id: Record<string, string> = {}
  for (const [name, type, relationLabel, cadenceWeeks, tags, sorted = true] of people) {
    const p = await prisma.person.create({
      data: {
        userId: USER_ID,
        name,
        type,
        relationLabel,
        cadenceWeeks,
        primaryTagId: tags[0] ? tag[tags[0]] : null,
        sortedAt: sorted ? daysAgo(40) : null,
        // Plassert for hånd, litt hulter til bulter: «Rydd opp» har noe å gjøre.
        positionX: Math.round((rnd() - 0.5) * 1800),
        positionY: Math.round((rnd() - 0.5) * 1200),
        tags: { create: tags.map((t) => ({ tagId: tag[t] })) },
      },
    })
    id[name.split(' ')[0]] = p.id
  }

  // Relasjoner: tette miljøer, noen par og noen bånd på tvers.
  const rels: { a: string; b: string; type: Type; label?: string; since?: Date; until?: Date }[] = []
  const seen = new Set<string>()
  const link = (a: string, b: string, type: Type = 'FRIEND', extra: { label?: string; since?: Date; until?: Date } = {}) => {
    const k = [a, b].sort().join('|')
    if (a === b || seen.has(k)) return
    seen.add(k)
    rels.push({ a, b, type, ...extra })
  }
  link('Ingrid', 'Martin', 'ROMANTIC', { label: 'kjærester', since: daysAgo(900) })
  link('Thea', 'Sindre', 'ROMANTIC', { label: 'kjærester', since: daysAgo(400) })
  link('Mamma', 'Pappa', 'FAMILY', { label: 'gift' })
  link('Line', 'Erik', 'ROMANTIC', { since: daysAgo(700), until: daysAgo(300) })
  const group = (names: string[], p: number, type: Type = 'FRIEND') => {
    for (const a of names) for (const b of names) if (a < b && rnd() < p) link(a, b, type)
  }
  group(['Ingrid', 'Martin', 'Sofie', 'Emil', 'Aksel', 'Tuva'], 0.9)
  group(['Nora', 'Sander', 'Ida', 'Vetle', 'Hedda', 'Sofie'], 0.6)
  group(['Ingrid', 'Jonas', 'Thea', 'Sindre', 'Oda', 'Even'], 0.7)
  group(['Kristine', 'Henrik', 'Marte', 'Petter', 'Selma', 'Fredrik', 'Jonas'], 0.6, 'COLLEAGUE')
  group(['Mamma', 'Pappa', 'Synne', 'Farmor'], 1, 'FAMILY')
  link('Jakob', 'Farmor', 'FAMILY', { label: 'barnebarn' })
  link('Magnus', 'Eirik')
  link('Karoline', 'Simen')
  group(['Maja', 'Erik', 'Guro', 'Brage', 'Emil'], 0.7)
  link('Magnus', 'Synne', 'FRIEND', { label: 'gikk i samme klasse' })
  link('Hanna', 'Kristine', 'ACQUAINTANCE')
  link('Ida', 'Oda', 'FRIEND')
  link('Martin', 'Henrik', 'FRIEND', { label: 'studerte sammen' })
  await prisma.relationship.createMany({
    data: rels.map((r) => ({ fromPersonId: id[r.a], toPersonId: id[r.b], type: r.type, label: r.label ?? null, since: r.since ?? null, until: r.until ?? null })),
  })

  const log = (who: string[], type: LogType, n: number, body: string) =>
    prisma.logEntry.create({
      data: {
        userId: USER_ID,
        type,
        date: daysAgo(n),
        body,
        participants: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })

  // Bakgrunn: et år med treff, flest med de nærmeste, så rytme og
  // tellestreker i Innsikt har noe å vise.
  const background: [string[], LogType, string][] = [
    [['Jonas', 'Thea'], 'MET', 'Buldring på Klatreverket'],
    [['Jonas'], 'MET', 'Lunsj i kantina'],
    [['Jonas'], 'MET', 'Kaffe og kodegjennomgang'],
    [['Ingrid', 'Thea'], 'MET', 'Joggetur rundt Sognsvann'],
    [['Martin'], 'MESSAGE', 'Delte en podkast om bolig'],
    [['Emil'], 'CALLED', 'Lang prat om firmaet hans'],
    [['Ingrid'], 'MET', 'Kaffe på Tim Wendelboe'],
    [['Ingrid', 'Martin'], 'MET', 'Middag hos dem'],
    [['Mamma'], 'CALLED', 'Søndagssamtale'],
    [['Pappa'], 'CALLED', 'Snakket om hytta'],
    [['Synne'], 'MESSAGE', 'Sendte bilder fra turen'],
    [['Sofie', 'Emil', 'Aksel'], 'MET', 'Quiz på Schrøder'],
    [['Thea', 'Sindre', 'Oda'], 'MET', 'Klatring i Kolsås'],
    [['Kristine'], 'MET', 'En-til-en'],
    [['Petter'], 'MET', 'Mentorlunsj'],
    [['Henrik', 'Marte'], 'MET', 'Øl etter jobb'],
    [['Magnus'], 'CALLED', 'Ringte en time'],
    [['Tuva', 'Ida'], 'MET', 'Konsert på Rockefeller'],
    [['Maja'], 'MESSAGE', 'Gratulerte med ny jobb'],
    [['Hanna'], 'DATE', 'Tur på Bygdøy'],
  ]
  for (let i = 0; i < 110; i++) {
    const [who, type, body] = pick(background)
    if (who.includes('Hanna') && i % 3) continue
    await log(who, type, 6 + Math.floor(rnd() * rnd() * 330), body)
  }
  await log(['Farmor'], 'CALLED', 20, 'Hun hadde vært på kino og likte den ikke.')
  await log(['Farmor'], 'MET', 75, 'Vaffler hos farmor')
  // Gamle minner med folk som har gått i glemmeboka.
  await log(['Eirik', 'Karoline'], 'MET', 140, 'Juleøl hjemme på Lillehammer')
  await log(['Guro', 'Erik'], 'MET', 210, 'Gjensyn med kullet fra folkehøgskolen')
  await log(['Line'], 'DATE', 330, 'Første date. Sushi og lang tur langs Akerselva.')

  // Det siste: rike logger som gir tråder, fakta og forslag.
  const walk = await log(
    ['Ingrid'],
    'MET',
    1,
    'Tur rundt Sognsvann. Hun er nervøs før andre intervjurunde i Statkraft på torsdag, men gira. Hun og Martin har bydd på en toroms på Grünerløkka, visning igjen søndag. Tuva skal visstnok flytte sammen med Aksel.',
  )
  const wine = await log(['Hanna'], 'DATE', 4, 'Vinbar på Tøyen. Snakket lenge om Bergen og om hun skal ta masteren der. Hun hater småprat og elsker naturvin. Moren hennes fyller 60 i november.')
  await log(['Mamma', 'Pappa'], 'CALLED', 3, 'Pappa har begynt med surdeig. De vil ha alle hjem til farmors 90-årsdag.')
  const climb = await log(['Jonas', 'Thea', 'Sindre'], 'MET', 6, 'Buldring på Klatreverket. Thea har fått jobb i Tromsø fra januar. Sindre vurderer å bli med.')
  const lunch = await log(['Petter'], 'MET', 9, 'Mentorlunsj. Anbefalte meg å lese «Designing Data-Intensive Applications». Skal snakke om teamleder-rollen neste gang.')
  await log(['Magnus'], 'CALLED', 12, 'Han blir pappa i februar! Ingen vet det ennå.')
  await log(['Synne'], 'MESSAGE', 2, 'Spurte om jeg vil være med til Berlin i desember.')
  const quiz = await log(['Sofie', 'Emil', 'Martin'], 'MET', 16, 'Quiz på Schrøder, vi kom på andreplass. Emil starter eget firma.')

  await prisma.logEntry.update({ where: { id: walk.id }, data: { suggestedAt: daysAgo(1) } })

  const thread = (title: string, persons: string[], openedById?: string, dueDays?: number) =>
    prisma.thread.create({
      data: {
        userId: USER_ID,
        title,
        openedById,
        dueDate: dueDays === undefined ? null : daysAgo(-dueDays),
        persons: { create: persons.map((p) => ({ personId: id[p] })) },
      },
    })
  await thread('Andre intervjurunde i Statkraft', ['Ingrid'], walk.id, 3)
  await thread('Budet på leiligheten på Grünerløkka', ['Ingrid', 'Martin'], walk.id)
  await thread('Bergen: har hun bestemt seg for masteren?', ['Hanna'], wine.id)
  await thread('Flytter til Tromsø i januar', ['Thea'], climb.id, 60)
  await thread('Teamleder-rollen', ['Petter'], lunch.id, 14)
  await thread('Hvordan går det med firmaet?', ['Emil'], quiz.id)
  await thread('Blir pappa i februar', ['Magnus'], undefined, 110)
  await prisma.thread.create({
    data: {
      userId: USER_ID,
      title: 'Søkte jobb i NRK',
      status: 'CLOSED',
      resolution: 'Fikk den! Begynner i august.',
      createdAt: daysAgo(120),
      closedAt: daysAgo(70),
      persons: { create: [{ personId: id.Sofie }] },
    },
  })

  await prisma.fact.createMany({
    data: [
      { personId: id.Ingrid, label: 'Kjæreste', value: 'Martin, siden 2024' },
      { personId: id.Ingrid, label: 'Jobb', value: 'Energianalytiker' },
      { personId: id.Ingrid, label: 'Obs', value: 'Drikker ikke kaffe' },
      { personId: id.Hanna, label: 'Liker', value: 'Naturvin, jazz og lange turer' },
      { personId: id.Hanna, label: 'Fra', value: 'Bergen' },
      { personId: id.Thea, label: 'Jobb', value: 'Lege, begynner i Tromsø' },
      { personId: id.Jonas, label: 'Jobb', value: 'Backend på samme team' },
      { personId: id.Sofie, label: 'Jobb', value: 'Journalist i NRK' },
      { personId: id.Emil, label: 'Jobb', value: 'Gründer' },
      { personId: id.Magnus, label: 'Bor', value: 'Lillehammer' },
      { personId: id.Petter, label: 'Tips', value: 'Liker konkrete spørsmål, ikke småprat' },
      { personId: id.Farmor, label: 'Bursdag', value: 'Fyller 90 i desember' },
    ],
  })

  await prisma.romanticPhaseEntry.createMany({
    data: [
      { personId: id.Hanna, phase: 'FIRST_DATE', at: daysAgo(70) },
      { personId: id.Hanna, phase: 'SEEING', at: daysAgo(45) },
      { personId: id.Line, phase: 'FIRST_DATE', at: daysAgo(330) },
      { personId: id.Line, phase: 'ENDED', at: daysAgo(250) },
    ],
  })

  // Bursdager: noen snart, resten spredt.
  const birthdayIn = (days: number, year: number) => {
    const d = new Date(Date.now() + days * DAY)
    return new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate(), 12))
  }
  await prisma.person.update({ where: { id: id.Ingrid }, data: { birthday: birthdayIn(5, 1997) } })
  await prisma.person.update({ where: { id: id.Synne }, data: { birthday: birthdayIn(12, 2000) } })
  await prisma.person.update({ where: { id: id.Jonas }, data: { birthday: birthdayIn(40, 1995) } })
  await prisma.person.update({ where: { id: id.Mamma }, data: { birthday: birthdayIn(150, 1966) } })

  const plan = (title: string, inDays: number, who: string[], type: LogType = 'MET') =>
    prisma.plan.create({
      data: {
        userId: USER_ID,
        title,
        at: daysAgo(-inDays),
        type,
        persons: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })
  await plan('Middag hos Ingrid og Martin', 1, ['Ingrid', 'Martin'])
  await plan('Date på Territoriet', 3, ['Hanna'], 'DATE')
  await plan('Klatring på Kolsås', 5, ['Jonas', 'Thea', 'Sindre'])
  await plan('Farmors 90-årsdag', 47, ['Farmor', 'Mamma', 'Pappa', 'Synne', 'Jakob'])
  // Et treff som har vært, uten logg: gir «Hvordan gikk det?».
  await plan('Kaffe med Oda', -2, ['Oda'])

  // Forslag fra Claude til den siste loggen. Lagt inn direkte, så skriptet
  // aldri kaller API-et.
  await prisma.suggestion.createMany({
    data: [
      { userId: USER_ID, logEntryId: walk.id, kind: 'THREAD', payload: { title: 'Visningen på søndag', personIds: [id.Ingrid, id.Martin], dueDate: null } },
      { userId: USER_ID, logEntryId: walk.id, kind: 'FACT', payload: { personId: id.Ingrid, label: 'Bor snart', value: 'Grünerløkka' } },
      { userId: USER_ID, logEntryId: walk.id, kind: 'RELATIONSHIP', payload: { aId: id.Tuva, bId: id.Aksel, type: 'ROMANTIC', label: 'samboere' } },
      { userId: USER_ID, logEntryId: wine.id, kind: 'FACT', payload: { personId: id.Hanna, label: 'Mor', value: 'Fyller 60 i november' } },
    ],
  })

  // Innsikter fra «Spør Claude» under Forslag til forbindelser.
  await prisma.linkInsight.createMany({
    data: [
      {
        userId: USER_ID,
        title: 'Lillehammer-gjengen',
        reason: 'Magnus, Eirik, Karoline og Simen er alle fra Lillehammer, men bare noen av dem er koblet til hverandre.',
        kind: 'group',
        memberIds: [id.Magnus, id.Eirik, id.Karoline, id.Simen],
        type: 'FRIEND',
        groupName: null,
      },
      {
        userId: USER_ID,
        title: 'Jakob kjenner hele familien',
        reason: 'Fetteren din er med på familieselskapene, men står bare koblet til farmor.',
        kind: 'hub',
        hubId: id.Jakob,
        memberIds: [id.Mamma, id.Pappa, id.Synne],
        type: 'FAMILY',
        label: null,
        groupName: null,
      },
      {
        userId: USER_ID,
        title: 'Redaksjonen',
        reason: 'Nora, Sander, Vetle og Hedda har vært i de samme loggene fra Studentradio, men er ikke koblet.',
        kind: 'group',
        memberIds: [id.Nora, id.Sander, id.Vetle, id.Hedda],
        type: 'FRIEND',
        groupName: 'Redaksjonen',
      },
    ],
  })

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET mangler. Kjør med --env-file=.env.local.')
  const token = await encode({
    secret,
    salt: 'authjs.session-token',
    token: { sub: USER_ID, id: USER_ID, name: 'Andreas Vege', email: 'showcase@vennd.local' },
    maxAge: 60 * 60 * 24 * 30,
  })
  fs.mkdirSync(new URL('../.dev/', import.meta.url), { recursive: true })
  fs.writeFileSync(new URL('../.dev/session-token-showcase.txt', import.meta.url), token)
  console.log(`${USER_ID}: ${people.length} personer, ${rels.length} relasjoner`)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
