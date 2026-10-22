// Realistiske utviklingsdata. Kjøres med `npx prisma db seed`.
//
// Lager (og erstatter) bare brukeren «dev-user» med tilhørende data, og
// nekter å kjøre mot noe annet enn en lokal database. For å logge inn som
// dev-bruker lokalt, se README (Utvikling).

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

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

const USER_ID = 'dev-user'
const DAY = 86_400_000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY)
const on = (iso: string) => new Date(`${iso}T12:00:00.000Z`)

async function main() {
  await prisma.user.deleteMany({ where: { id: USER_ID } })
  await prisma.user.create({ data: { id: USER_ID, name: 'Andreas Vege', email: 'dev@vennd.local' } })

  const tagSpecs = [
    ['Studentradio', 'ochre'],
    ['Klatring', 'sage'],
    ['Familie', 'slate'],
    ['Folkehøgskole', 'plum'],
    ['Romantisk', 'rose'],
    ['Jobb', 'teal'],
  ] as const
  const tag: Record<string, string> = {}
  for (const [i, [name, color]] of tagSpecs.entries()) {
    const created = await prisma.tag.create({ data: { userId: USER_ID, name, color, sortOrder: i } })
    tag[name] = created.id
  }

  // [navn, type, kadens, x, y, tagger (første er hovedtagg)]
  const people: [string, 'FRIEND' | 'FAMILY' | 'COLLEAGUE' | 'ROMANTIC' | 'ACQUAINTANCE', number | null, number, number, string[]][] = [
    ['Ingrid Aas', 'FRIEND', 3, 250, -140, ['Studentradio', 'Klatring']],
    ['Martin Nilsen', 'FRIEND', 4, 380, -200, ['Studentradio']],
    ['Sofie Lund', 'FRIEND', 4, 420, -60, ['Studentradio']],
    ['Emil Haug', 'FRIEND', 6, 300, 20, ['Studentradio', 'Folkehøgskole']],
    ['Nora Bakke', 'ACQUAINTANCE', 26, 430, 90, ['Studentradio']],
    ['Jonas Rud', 'FRIEND', 4, 160, 160, ['Klatring', 'Jobb']],
    ['Thea Moen', 'FRIEND', 6, 280, 240, ['Klatring']],
    ['Sindre Kvam', 'FRIEND', 8, 380, 180, ['Klatring']],
    ['Mamma', 'FAMILY', 2, -260, -150, ['Familie']],
    ['Ola Vege', 'FAMILY', 3, -150, -230, ['Familie']],
    ['Liv Vege', 'FAMILY', 12, -200, -40, ['Familie']],
    ['Maja Solberg', 'FRIEND', 8, -280, 160, ['Folkehøgskole']],
    ['Erik Lie', 'ACQUAINTANCE', 26, -160, 250, ['Folkehøgskole']],
    ['Hanna Berg', 'ROMANTIC', 1, 20, 300, ['Romantisk', 'Jobb']],
    ['Line Holm', 'ROMANTIC', null, -420, -40, ['Romantisk']],
    ['Kristine Margrethe Aas-Johansen', 'COLLEAGUE', 8, -380, 60, ['Jobb']],
  ]

  const id: Record<string, string> = {}
  for (const [name, type, cadenceWeeks, positionX, positionY, tags] of people) {
    const p = await prisma.person.create({
      data: {
        userId: USER_ID,
        name,
        type,
        cadenceWeeks,
        positionX,
        positionY,
        primaryTagId: tag[tags[0]],
        tags: { create: tags.map((t) => ({ tagId: tag[t] })) },
      },
    })
    id[name.split(' ')[0]] = p.id
  }

  const rel = (a: string, b: string, type: 'FRIEND' | 'FAMILY' | 'COLLEAGUE' | 'ROMANTIC', extra: { label?: string; since?: Date; until?: Date } = {}) =>
    prisma.relationship.create({ data: { fromPersonId: id[a], toPersonId: id[b], type, ...extra } })
  await rel('Ingrid', 'Martin', 'ROMANTIC', { since: on('2023-04-01') })
  await rel('Ingrid', 'Jonas', 'FRIEND', { label: 'klatrer sammen' })
  await rel('Hanna', 'Jonas', 'COLLEAGUE', { label: 'kolleger' })
  await rel('Martin', 'Sofie', 'FRIEND')
  await rel('Emil', 'Sofie', 'FRIEND')
  await rel('Jonas', 'Thea', 'FRIEND')
  await rel('Thea', 'Sindre', 'FRIEND')
  await rel('Mamma', 'Ola', 'FAMILY')
  await rel('Ola', 'Liv', 'FAMILY')
  await rel('Maja', 'Erik', 'FRIEND')
  await rel('Line', 'Erik', 'ROMANTIC', { since: on('2023-06-01'), until: on('2024-08-01') })

  const log = async (who: string[], type: 'MET' | 'CALLED' | 'MESSAGE' | 'DATE' | null, n: number, body?: string) =>
    prisma.logEntry.create({
      data: {
        userId: USER_ID,
        type,
        date: daysAgo(n),
        body,
        participants: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })

  const walk = await log(
    ['Ingrid'],
    'MET',
    1,
    'Tur rundt Ekebergsletta. Nervøs før andre intervjurunde i Statkraft, men gira. Hun og Martin har bydd på en toer på Løkka.',
  )
  await log(['Ingrid', 'Martin'], 'MET', 9, 'Middag på Smalhans. Martin skal på fjelltur med jobben i oktober.')
  const wine = await log(['Hanna'], 'DATE', 11, 'Vinbar på Tøyen. Snakket lenge om Bergen, og at hun hater småprat. Elsker naturvin.')
  await log(['Mamma'], 'CALLED', 4, 'Hun gleder seg til høstferien. Pappa har begynt med surdeig.')
  await log(['Jonas', 'Thea'], 'MET', 13, 'Buldring på Klatreverket.')

  const thread = (title: string, persons: string[], openedById?: string, dueDate?: Date) =>
    prisma.thread.create({
      data: {
        userId: USER_ID,
        title,
        openedById,
        dueDate,
        persons: { create: persons.map((p) => ({ personId: id[p] })) },
      },
    })
  await thread('Andre intervjurunde i Statkraft', ['Ingrid'], walk.id)
  await thread('Budet på leiligheten på Løkka', ['Ingrid', 'Martin'], walk.id)
  await thread('Bergen: har hun bestemt seg for masteren?', ['Hanna'], wine.id)
  await thread('Hvordan var fjellturen?', ['Martin'], undefined, daysAgo(-20))

  await prisma.fact.createMany({
    data: [
      { personId: id.Ingrid, label: 'Kjæreste', value: 'Martin, siden 2023' },
      { personId: id.Ingrid, label: 'Obs', value: 'Drikker ikke kaffe' },
      { personId: id.Hanna, label: 'Liker', value: 'Naturvin' },
    ],
  })

  await prisma.romanticPhaseEntry.createMany({
    data: [
      { personId: id.Hanna, phase: 'FIRST_DATE', at: on('2026-08-21') },
      { personId: id.Hanna, phase: 'SEEING', at: on('2026-09-02') },
      { personId: id.Line, phase: 'FIRST_DATE', at: on('2024-02-10') },
      { personId: id.Line, phase: 'ENDED', at: on('2024-05-01') },
    ],
  })

  // Framover: en bursdag snart, et treff i morgen, og ett som har vært.
  const inDays = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d
  }
  const soon = inDays(5)
  await prisma.person.update({
    where: { id: id.Ingrid },
    data: { birthday: new Date(Date.UTC(1997, soon.getMonth(), soon.getDate(), 12)) },
  })
  const plan = (title: string, when: Date, who: string[], type: 'MET' | 'DATE' | null = 'MET') =>
    prisma.plan.create({
      data: {
        userId: USER_ID,
        title,
        at: new Date(Date.UTC(when.getFullYear(), when.getMonth(), when.getDate(), 12)),
        type,
        persons: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })
  await plan('Middag på Smalhans', inDays(1), ['Ingrid', 'Martin'])
  await plan('Date på Territoriet', inDays(3), ['Hanna'], 'DATE')
  await plan('Kaffe med Sofie', inDays(-2), ['Sofie'])

  console.log(`Seedet ${people.length} personer for ${USER_ID}.`)
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
