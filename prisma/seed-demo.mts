// Demobruker for skjermbilder (README, GitHub). Kjøres med
//
//   node --env-file=.env.local prisma/seed-demo.mts
//
// Lager (og erstatter) bare brukeren «demo-user»: Sigrid Hagen, 31, oppvokst
// i Trondheim, bor på Løkka. Alle personene er oppdiktet. Familie, studiet,
// jobb, klatring, bokklubb og barndom, med kryssende bånd, et halvt års
// logger, åpne tråder, planer og bursdager. Datoene regnes fra i dag, så
// kartet ser levende ut uansett når det seedes. Plassene i Nettverk er
// «Rydd opp» (tidyNetwork), som i appen.
//
// Logg inn som demobrukeren med
//   node --env-file=.env.local scripts/dev-session.mts demo-user "Sigrid Hagen"
//
// Nekter å kjøre mot noe annet enn en lokal database.

import { registerHooks } from 'node:module'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Domenekoden importerer uten filendelse («./order»), som bundleren tåler,
// men ikke Node. Legg på .ts for slike importer fra .ts-filer, og si at de
// er ES-moduler (package.json har ingen «type»).
registerHooks({
  resolve(specifier, context, next) {
    const extensionless = specifier.startsWith('.') && !/\.\w+$/.test(specifier) && context.parentURL?.endsWith('.ts')
    const resolved = next(extensionless ? `${specifier}.ts` : specifier, context)
    return resolved.url.endsWith('.ts') ? { ...resolved, format: 'module-typescript' } : resolved
  },
})
const { tidyNetwork } = await import('../src/domain/layouts/tidy.ts')

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

const USER_ID = 'demo-user'

type Rel = 'FRIEND' | 'FAMILY' | 'COLLEAGUE' | 'ROMANTIC' | 'ACQUAINTANCE' | 'OTHER'
type LogType = 'MET' | 'CALLED' | 'MESSAGE' | 'DATE' | 'OTHER'

// Et datofelt lagres kl. 12:00 UTC (som fromDateInput).
const noonUtc = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12))
const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return noonUtc(d)
}
const daysAgo = (n: number) => daysFromNow(-n)
// Bursdag om n dager, for en som er født i `year`.
const birthdayIn = (n: number, year: number) => {
  const d = daysFromNow(n)
  return new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate(), 12))
}
const on = (iso: string) => new Date(`${iso}T12:00:00.000Z`)

// Miljøene, i rekkefølgen de vises.
const TAGS = [
  ['Familie', 'slate'],
  ['NTNU', 'ochre'],
  ['Jobb', 'teal'],
  ['Klatring', 'sage'],
  ['Bokklubb', 'plum'],
  ['Byåsen', 'clay'],
  ['Løkka', 'stone'],
] as const
type TagName = (typeof TAGS)[number][0]

type PersonSpec = {
  key: string
  name: string
  type: Rel
  label?: string
  cadence?: number | null
  tags: TagName[]
  birthday?: Date
  notes?: string
  facts?: [string, string][]
  // Usortert: importert, venter i Venter-bunken.
  unsorted?: boolean
}

const PEOPLE: PersonSpec[] = [
  // Familie
  { key: 'mamma', name: 'Anne Hagen', type: 'FAMILY', label: 'mamma', cadence: 1, tags: ['Familie'], birthday: on('1962-03-14'), facts: [['Bor', 'Byåsen, Trondheim'], ['Liker', 'Hagearbeid og krim']] },
  { key: 'pappa', name: 'Tor Hagen', type: 'FAMILY', label: 'pappa', cadence: 2, tags: ['Familie'], birthday: on('1960-11-02'), facts: [['Jobb', 'Pensjonert lektor'], ['Hobby', 'Surdeig, ny besettelse']] },
  { key: 'haakon', name: 'Håkon Hagen', type: 'FAMILY', label: 'storebror', cadence: 2, tags: ['Familie'], birthday: on('1991-06-21'), facts: [['Bor', 'Stavanger'], ['Jobb', 'Ingeniør i Equinor']] },
  { key: 'ida', name: 'Ida Strand', type: 'FAMILY', label: 'svigerinne', cadence: 4, tags: ['Familie'], birthday: birthdayIn(9, 1992) },
  { key: 'emma', name: 'Emma Hagen', type: 'FAMILY', label: 'niese', cadence: 4, tags: ['Familie'], birthday: on('2021-02-08'), facts: [['Elsker', 'Dinosaurer, spesielt «langhalsene»']] },
  { key: 'kari', name: 'Kari Hagen Lie', type: 'FAMILY', label: 'lillesøster', cadence: 1, tags: ['Familie'], birthday: on('1998-09-30'), facts: [['Studerer', 'Medisin i Bergen, femte år']] },
  { key: 'randi', name: 'Randi Hagen', type: 'FAMILY', label: 'farmor', cadence: 2, tags: ['Familie'], birthday: on('1936-12-12'), facts: [['Bor', 'Omsorgsboliger på Lade'], ['Obs', 'Hører dårlig i telefon, ring heller på video']] },
  { key: 'geir', name: 'Geir Hagen', type: 'FAMILY', label: 'onkel', cadence: 26, tags: ['Familie'] },
  { key: 'mari', name: 'Mari Hagen', type: 'FAMILY', label: 'kusine', cadence: 12, tags: ['Familie', 'Løkka'], birthday: on('1994-04-17'), facts: [['Bor', 'To kvartaler unna, på Birkelunden']] },

  // Kjæresten og hans
  { key: 'jonas', name: 'Jonas Berg', type: 'ROMANTIC', label: 'kjæreste', cadence: 1, tags: ['Klatring'], birthday: on('1993-08-05'), facts: [['Jobb', 'Fysioterapeut på Aker'], ['Liker', 'Kaffe fra Tim Wendelboe, lange skiturer']] },
  { key: 'thale', name: 'Thale Berg', type: 'FAMILY', label: 'Jonas sin søster', cadence: 12, tags: [], birthday: birthdayIn(23, 1996) },

  // NTNU, arkitektur 2013–2018
  { key: 'ingrid', name: 'Ingrid Aas', type: 'FRIEND', label: 'bestevenn fra studiet', cadence: 2, tags: ['NTNU', 'Bokklubb'], birthday: birthdayIn(4, 1995), facts: [['Jobb', 'Snøhetta'], ['Obs', 'Drikker ikke kaffe']] },
  { key: 'martin', name: 'Martin Nilsen', type: 'FRIEND', cadence: 4, tags: ['NTNU'], birthday: on('1994-01-19'), facts: [['Kjæreste', 'Ingrid, siden 2019']] },
  { key: 'sofie', name: 'Sofie Lund', type: 'FRIEND', cadence: 4, tags: ['NTNU', 'Bokklubb'], facts: [['Bor', 'København'], ['Jobb', 'BIG']] },
  { key: 'emil', name: 'Emil Haug', type: 'FRIEND', cadence: 12, tags: ['NTNU'], facts: [['Bor', 'Tromsø']] },
  { key: 'nora', name: 'Nora Bakke', type: 'FRIEND', cadence: 12, tags: ['NTNU'] },
  { key: 'aleksander', name: 'Aleksander Dahl', type: 'ACQUAINTANCE', cadence: 26, tags: ['NTNU'] },
  { key: 'vilde', name: 'Vilde Eriksen', type: 'FRIEND', cadence: 4, tags: ['NTNU', 'Klatring'], facts: [['Venter', 'Barn i februar']] },

  // Jobb: Arkitektkontoret Fjord
  { key: 'kristine', name: 'Kristine Aas-Johansen', type: 'COLLEAGUE', label: 'sjefen min', cadence: 4, tags: ['Jobb'] },
  { key: 'ahmed', name: 'Ahmed Rahimi', type: 'COLLEAGUE', cadence: 4, tags: ['Jobb', 'Klatring'], birthday: on('1990-05-27') },
  { key: 'lene', name: 'Lene Søreide', type: 'COLLEAGUE', cadence: 4, tags: ['Jobb'] },
  { key: 'oskar', name: 'Oskar Brekke', type: 'COLLEAGUE', label: 'ny i teamet', cadence: 4, tags: ['Jobb'] },
  { key: 'mona', name: 'Mona Thorsen', type: 'COLLEAGUE', cadence: 12, tags: ['Jobb'] },
  { key: 'eirik', name: 'Eirik Våge', type: 'ACQUAINTANCE', label: 'byggherre på Vulkan-prosjektet', cadence: 26, tags: ['Jobb'] },

  // Klatring: Klatreverket Torshov
  { key: 'thea', name: 'Thea Moen', type: 'FRIEND', cadence: 2, tags: ['Klatring'], facts: [['Klatrer', '7a på buldring, prosjekterer «Svaberget»']] },
  { key: 'sindre', name: 'Sindre Kvam', type: 'FRIEND', cadence: 4, tags: ['Klatring'] },
  { key: 'lukas', name: 'Lukas Weber', type: 'FRIEND', cadence: 4, tags: ['Klatring'], facts: [['Fra', 'Freiburg, kom for en postdoc']] },
  { key: 'frida', name: 'Frida Holm', type: 'ACQUAINTANCE', cadence: 26, tags: ['Klatring'] },

  // Bokklubb, første torsdag i måneden
  { key: 'maja', name: 'Maja Solberg', type: 'FRIEND', cadence: 4, tags: ['Bokklubb'] },
  { key: 'hanna', name: 'Hanna Rød', type: 'FRIEND', cadence: 4, tags: ['Bokklubb', 'Løkka'] },
  { key: 'silje', name: 'Silje Nygaard', type: 'FRIEND', cadence: 4, tags: ['Bokklubb'] },

  // Byåsen: barndom og videregående
  { key: 'camilla', name: 'Camilla Strøm', type: 'FRIEND', label: 'barndomsvenn', cadence: 4, tags: ['Byåsen'], birthday: birthdayIn(16, 1995), facts: [['Bor', 'Trondheim, fortsatt'], ['Har', 'Tvillinger på to år']] },
  { key: 'henrik', name: 'Henrik Lunde', type: 'FRIEND', cadence: 12, tags: ['Byåsen'] },
  { key: 'tiril', name: 'Tiril Aune', type: 'FRIEND', cadence: 12, tags: ['Byåsen'] },
  { key: 'petter', name: 'Petter Furu', type: 'ACQUAINTANCE', label: 'eks fra vgs', cadence: null, tags: ['Byåsen'] },

  // Løkka: nabolaget
  { key: 'ole', name: 'Ole Kristiansen', type: 'ACQUAINTANCE', label: 'nabo', cadence: 12, tags: ['Løkka'], notes: 'Har nøkkel til leiligheten. Vanner plantene når vi er borte.' },
  { key: 'yasmin', name: 'Yasmin Ali', type: 'ACQUAINTANCE', label: 'eier kaffebaren på hjørnet', cadence: 26, tags: ['Løkka'] },

  // Importert fra kontakter, venter på en plass
  { key: 'bjorn', name: 'Bjørn Tangen', type: 'ACQUAINTANCE', tags: [], unsorted: true },
  { key: 'elise', name: 'Elise Fosse', type: 'FRIEND', tags: [], unsorted: true },
  { key: 'tobias', name: 'Tobias Engen', type: 'ACQUAINTANCE', tags: [], unsorted: true },
]

// [a, b, type, etikett?, siden?, til?]
const RELATIONS: [string, string, Rel, string?, Date?, Date?][] = [
  // Familien
  ['mamma', 'pappa', 'ROMANTIC', 'gift', on('1988-07-02')],
  ['mamma', 'haakon', 'FAMILY', 'mor og sønn'],
  ['mamma', 'kari', 'FAMILY', 'mor og datter'],
  ['pappa', 'haakon', 'FAMILY', 'far og sønn'],
  ['pappa', 'kari', 'FAMILY', 'far og datter'],
  ['pappa', 'randi', 'FAMILY', 'mor og sønn'],
  ['pappa', 'geir', 'FAMILY', 'brødre'],
  ['geir', 'mari', 'FAMILY', 'far og datter'],
  ['haakon', 'kari', 'FAMILY', 'søsken'],
  ['haakon', 'ida', 'ROMANTIC', 'samboere', on('2017-05-01')],
  ['haakon', 'emma', 'FAMILY', 'far og datter'],
  ['ida', 'emma', 'FAMILY', 'mor og datter'],
  ['randi', 'geir', 'FAMILY', 'mor og sønn'],
  ['randi', 'kari', 'FAMILY', 'farmor'],
  ['mari', 'kari', 'FAMILY', 'kusiner'],
  ['jonas', 'thale', 'FAMILY', 'søsken'],
  ['jonas', 'mamma', 'ACQUAINTANCE', 'svigermor, nesten'],
  ['jonas', 'kari', 'FRIEND'],
  ['mari', 'hanna', 'FRIEND', 'naboer'],

  // NTNU
  ['ingrid', 'martin', 'ROMANTIC', 'kjærester', on('2019-03-01')],
  ['ingrid', 'sofie', 'FRIEND'],
  ['ingrid', 'vilde', 'FRIEND'],
  ['ingrid', 'nora', 'FRIEND'],
  ['martin', 'emil', 'FRIEND', 'bodde i kollektiv'],
  ['martin', 'aleksander', 'FRIEND'],
  ['sofie', 'nora', 'FRIEND'],
  ['sofie', 'vilde', 'FRIEND'],
  ['emil', 'aleksander', 'FRIEND'],
  ['emil', 'nora', 'ROMANTIC', 'var sammen', on('2015-01-01'), on('2017-06-01')],
  ['vilde', 'martin', 'FRIEND'],

  // Jobb
  ['kristine', 'ahmed', 'COLLEAGUE'],
  ['kristine', 'lene', 'COLLEAGUE'],
  ['kristine', 'mona', 'COLLEAGUE'],
  ['kristine', 'oskar', 'COLLEAGUE'],
  ['ahmed', 'lene', 'COLLEAGUE'],
  ['ahmed', 'oskar', 'COLLEAGUE'],
  ['lene', 'mona', 'COLLEAGUE'],
  ['kristine', 'eirik', 'COLLEAGUE', 'samarbeidspartner'],
  ['lene', 'sofie', 'FRIEND', 'jobbet sammen i København'],

  // Klatring
  ['jonas', 'thea', 'FRIEND', 'klatrer sammen'],
  ['jonas', 'sindre', 'FRIEND', 'klatrer sammen'],
  ['jonas', 'lukas', 'FRIEND'],
  ['thea', 'sindre', 'ROMANTIC', 'kjærester', on('2024-10-01')],
  ['thea', 'lukas', 'FRIEND'],
  ['sindre', 'lukas', 'FRIEND'],
  ['ahmed', 'thea', 'FRIEND', 'klatrer sammen'],
  ['ahmed', 'sindre', 'FRIEND'],
  ['vilde', 'thea', 'FRIEND'],
  ['frida', 'lukas', 'FRIEND'],

  // Bokklubb
  ['ingrid', 'maja', 'FRIEND'],
  ['ingrid', 'hanna', 'FRIEND'],
  ['ingrid', 'silje', 'FRIEND'],
  ['sofie', 'maja', 'FRIEND'],
  ['maja', 'hanna', 'FRIEND'],
  ['maja', 'silje', 'FRIEND', 'søskenbarn'],
  ['hanna', 'silje', 'FRIEND'],

  // Byåsen
  ['camilla', 'henrik', 'FRIEND'],
  ['camilla', 'tiril', 'FRIEND', 'bestevenner'],
  ['henrik', 'tiril', 'FRIEND'],
  ['henrik', 'petter', 'FRIEND'],
  ['camilla', 'kari', 'ACQUAINTANCE'],
  ['tiril', 'emil', 'FRIEND', 'fra vgs'],

  // Løkka
  ['ole', 'yasmin', 'ACQUAINTANCE'],
  ['jonas', 'ole', 'ACQUAINTANCE', 'naboer'],
]

// [hvem, type, dager siden, tekst]
const LOGS: [string[], LogType | null, number, string][] = [
  // Siste uka
  [['ingrid'], 'MET', 1, 'Tur rundt Sognsvann. Hun er nervøs før andre intervjurunde i Statsbygg, men gira. Hun og Martin har bydd på en treer på Torshov.'],
  [['jonas'], 'DATE', 2, 'Middag på Hrimnir. Jonas vil til Lofoten i påsken, og jeg sa ja før jeg rakk å tenke.'],
  [['mamma'], 'CALLED', 2, 'Hun gleder seg til jul. Pappa har begynt med surdeig og snakker ikke om annet.'],
  [['thea', 'sindre', 'jonas'], 'MET', 3, 'Buldring på Klatreverket. Thea klarte endelig den gule i hjørnet.'],
  [['kristine'], 'MET', 4, 'Medarbeidersamtale. Hun vil at jeg skal lede konkurranseutkastet for Vulkan-tomta.'],
  [['kari'], 'MESSAGE', 5, 'Hun har fått turnusplass i Ålesund! Starter i februar.'],
  [['ole'], 'MET', 6, 'Traff Ole i oppgangen. Lånte ham boremaskinen.'],

  // Siste måneden
  [['ingrid', 'maja', 'hanna', 'silje', 'sofie'], 'MET', 9, 'Bokklubb hos Hanna. «Kjærlighet» av Hanne Ørstavik. Sofie var med på video fra København. Neste gang: Maja velger.'],
  [['ahmed', 'lene', 'oskar'], 'MET', 10, 'Lunsj på Mathallen. Oskar er ny og vet ikke hvem han skal spørre om noe. Ahmed tok ham under vingen.'],
  [['haakon', 'ida', 'emma'], 'CALLED', 12, 'Videosamtale. Emma viste fram en tegning av en langhals med vinger.'],
  [['randi'], 'CALLED', 13, 'Farmor er i fin form, men lei av at det regner. Vil ha besøk i høstferien.'],
  [['lukas'], 'MESSAGE', 14, 'Han lurer på om vi vil være med til Fontainebleau i mars.'],
  [['martin', 'ingrid'], 'MET', 16, 'Middag på Smalhans. Martin skal på fjelltur med jobben neste måned.'],
  [['camilla'], 'CALLED', 18, 'Lang prat mens tvillingene sov. Hun har sagt opp jobben og vil starte for seg selv.'],
  [['vilde'], 'MET', 20, 'Kaffe på Godt Brød. Hun venter barn i februar og er mest bekymret for å miste klatresesongen.'],
  [['mari'], 'MET', 22, 'Pils på Schouskjelleren. Hun har fått ny jobb i NRK.'],
  [['jonas', 'thale'], 'MET', 24, 'Søndagsmiddag hos Thale. Hun skal flytte til Bergen etter nyttår.'],
  [['pappa'], 'CALLED', 26, 'Pappa ringte for å spørre om surdeig. Igjen.'],
  [['kristine', 'eirik'], 'MET', 28, 'Første møte om Vulkan-prosjektet. Eirik er kravstor, men ryddig.'],

  // 1–3 måneder siden
  [['thea'], 'MET', 33, 'Utendørsklatring i Kolsås. Thea ledet sin første 7a.'],
  [['ingrid', 'martin', 'emil', 'nora', 'vilde', 'aleksander'], 'MET', 38, 'Ti år siden vi begynte på arkitektur. Gjensyn på Lorry. Emil kom helt fra Tromsø.'],
  [['silje'], 'MESSAGE', 41, 'Hun sendte bilde av den nye hunden. Den heter Bølle.'],
  [['jonas'], 'DATE', 44, 'Toårsdag. Hytta til foreldrene hans i Valdres.'],
  [['henrik', 'tiril', 'camilla'], 'MET', 49, 'Byåsen-gjengen i Trondheim. Henrik har kjøpt hus på Heimdal.'],
  [['mamma', 'pappa', 'kari'], 'MET', 50, 'Helg hjemme i Trondheim. Mamma har gravd opp halve hagen.'],
  [['sofie'], 'CALLED', 55, 'Hun vurderer å flytte hjem fra København. Savner fjellet.'],
  [['ahmed', 'thea'], 'MET', 58, 'Ahmed ble med på klatring for første gang. Han var overraskende god.'],
  [['maja', 'hanna', 'silje', 'ingrid'], 'MET', 63, 'Bokklubb hos Maja. «Kafka på stranden». Ingen hadde lest den ferdig.'],
  [['yasmin'], 'MET', 66, 'Yasmin har fått ny espressomaskin og ga meg en gratis cortado.'],
  [['nora'], 'MESSAGE', 72, 'Gratulerte henne med ny stilling i Oslo kommune.'],
  [['haakon'], 'CALLED', 78, 'Håkon vurderer å søke seg til Oslo. Ida er ikke helt med.'],

  // Lenger siden
  [['geir'], 'MET', 104, 'Traff onkel Geir i 70-årslaget til farmor sin søster.'],
  [['emil'], 'CALLED', 120, 'Emil har begynt å fiske. Han er mer gira enn jeg har hørt ham noen gang.'],
  [['frida'], 'MET', 130, 'Sto ved siden av Frida på Klatreverket. Hun skal reise jorda rundt i et år.'],
  [['aleksander'], 'MESSAGE', 150, 'Han spurte om jeg visste om noen ledige stillinger.'],
  [['tiril'], 'CALLED', 160, 'Hun har fått jobb som lærer på Byåsen vgs. Vår gamle skole!'],
  [['mona'], 'MET', 170, 'Avskjedskaffe før Mona gikk ut i permisjon.'],
  [['jonas'], 'DATE', 200, 'Sommerferie i Lofoten. Regn i seks dager, sol i én. Verdt det.'],
]

// [tittel, hvem, åpnet av loggen nr. (indeks i LOGS), frist om n dager?]
const THREADS: [string, string[], number | null, number?][] = [
  ['Andre intervjurunde i Statsbygg', ['ingrid'], 0],
  ['Budet på leiligheten på Torshov', ['ingrid', 'martin'], 0],
  ['Lofoten i påsken: bestille hytte', ['jonas'], 1, 30],
  ['Turnus i Ålesund: trenger hun hjelp til flyttingen?', ['kari'], 5, 90],
  ['Hvordan går det med Oskar?', ['oskar'], 8, 14],
  ['Fontainebleau i mars?', ['lukas', 'jonas'], 11],
  ['Hvordan var fjellturen?', ['martin'], 12, 20],
  ['Egen bedrift: har hun fått de første kundene?', ['camilla'], 13, 45],
  ['Termin i februar: sende noe til babyen', ['vilde'], 14, 110],
  ['Flytter Sofie hjem?', ['sofie'], 25],
  ['Besøke farmor i høstferien', ['randi'], 10, -3],
]

// [tittel, om n dager, hvem, type]
const PLANS: [string, number, string[], LogType | null][] = [
  ['Middag på Smalhans', 1, ['ingrid', 'martin'], 'MET'],
  ['Klatring på Klatreverket', 2, ['thea', 'sindre', 'lukas'], 'MET'],
  ['Bokklubb hos Maja', 6, ['maja', 'hanna', 'silje', 'ingrid'], 'MET'],
  ['Ringe farmor', 3, ['randi'], 'CALLED'],
  ['Julemiddag i Trondheim', 63, ['mamma', 'pappa', 'kari', 'haakon', 'ida', 'emma', 'jonas'], 'MET'],
  // Har vært, uten logg: gir «Hvordan gikk det?»
  ['Kaffe med Hanna', -2, ['hanna'], 'MET'],
]

async function main() {
  await prisma.user.deleteMany({ where: { id: USER_ID } })
  await prisma.user.create({ data: { id: USER_ID, name: 'Sigrid Hagen', email: 'demo@vennekart.local' } })

  const tagId = {} as Record<TagName, string>
  for (const [i, [name, color]] of TAGS.entries()) {
    const tag = await prisma.tag.create({ data: { userId: USER_ID, name, color, sortOrder: i } })
    tagId[name] = tag.id
  }

  const id: Record<string, string> = {}
  const sortedAt = daysAgo(30)
  for (const p of PEOPLE) {
    const created = await prisma.person.create({
      data: {
        userId: USER_ID,
        name: p.name,
        type: p.type,
        relationLabel: p.label,
        cadenceWeeks: p.cadence === undefined ? 4 : p.cadence,
        birthday: p.birthday,
        notes: p.notes,
        sortedAt: p.unsorted ? null : sortedAt,
        primaryTagId: p.tags[0] ? tagId[p.tags[0]] : null,
        tags: { create: p.tags.map((t) => ({ tagId: tagId[t] })) },
        facts: { create: (p.facts ?? []).map(([label, value]) => ({ label, value })) },
      },
    })
    id[p.key] = created.id
  }

  for (const [a, b, type, label, since, until] of RELATIONS) {
    await prisma.relationship.create({
      data: { fromPersonId: id[a], toPersonId: id[b], type, label, since, until },
    })
  }

  // Fasene med Jonas, og en avsluttet date i fjor.
  await prisma.romanticPhaseEntry.createMany({
    data: [
      { personId: id.jonas, phase: 'FIRST_DATE', at: daysAgo(44 + 730) },
      { personId: id.jonas, phase: 'SEEING', at: daysAgo(44 + 700) },
      { personId: id.jonas, phase: 'EXCLUSIVE', at: daysAgo(44 + 640) },
      { personId: id.jonas, phase: 'PARTNER', at: daysAgo(44 + 500) },
      { personId: id.petter, phase: 'PARTNER', at: on('2011-09-01') },
      { personId: id.petter, phase: 'ENDED', at: on('2013-06-20') },
    ],
  })

  const logIds: string[] = []
  for (const [who, type, n, body] of LOGS) {
    const date = daysAgo(n)
    const log = await prisma.logEntry.create({
      data: {
        userId: USER_ID,
        type,
        date,
        body,
        createdAt: date,
        // Ingen Claude-forslag for demologgene.
        suggestedAt: date,
        participants: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })
    logIds.push(log.id)
  }

  for (const [title, who, openedBy, dueIn] of THREADS) {
    await prisma.thread.create({
      data: {
        userId: USER_ID,
        title,
        openedById: openedBy === null ? undefined : logIds[openedBy],
        dueDate: dueIn === undefined ? undefined : daysFromNow(dueIn),
        persons: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })
  }
  // En tråd som er fulgt opp og lukket.
  await prisma.thread.create({
    data: {
      userId: USER_ID,
      title: 'Ny jobb i NRK?',
      status: 'CLOSED',
      resolution: 'Fikk den! Starter i januar.',
      closedById: logIds[LOGS.findIndex(([, , n]) => n === 22)],
      closedAt: daysAgo(22),
      persons: { create: [{ personId: id.mari }] },
    },
  })

  for (const [title, inDays, who, type] of PLANS) {
    await prisma.plan.create({
      data: {
        userId: USER_ID,
        title,
        at: daysFromNow(inDays),
        type,
        persons: { create: who.map((w) => ({ personId: id[w] })) },
      },
    })
  }

  // Lagrede visninger av kartet. Filteret skrur av miljøer, som kalendere.
  const allBut = (...keep: TagName[]) => TAGS.map(([name]) => name).filter((n) => !keep.includes(n)).map((n) => tagId[n])
  await prisma.mapView.createMany({
    data: [
      { userId: USER_ID, name: 'Familien', mode: 'network', filter: { hiddenTags: allBut('Familie'), showUntagged: true }, sortOrder: 0 },
      { userId: USER_ID, name: 'Oslo-livet', mode: 'circles', filter: { hiddenTags: allBut('Jobb', 'Klatring', 'Bokklubb', 'Løkka'), showUntagged: false }, sortOrder: 1 },
    ],
  })

  // Nettverk: «Rydd opp», som i appen.
  const sorted = PEOPLE.filter((p) => !p.unsorted)
  const layout = tidyNetwork(
    sorted.map((p) => ({ id: id[p.key], name: p.name, groupId: p.tags[0] ? tagId[p.tags[0]] : null })),
    TAGS.map(([name]) => ({ id: tagId[name], name })),
    RELATIONS.map(([a, b]) => [id[a], id[b]] as [string, string]),
  )
  for (const [personId, { x, y }] of layout) {
    await prisma.person.update({ where: { id: personId }, data: { positionX: x, positionY: y } })
  }

  console.log(`Seedet ${PEOPLE.length} personer, ${RELATIONS.length} forbindelser og ${LOGS.length} logger for ${USER_ID}.`)
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
