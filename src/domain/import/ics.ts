import { parseLines, type ContentLine } from './lines'

export type CalEvent = {
  key: string
  uid: string | null
  title: string
  description: string | null
  start: Date
  allDay: boolean
  attendees: { name: string | null; email: string | null }[]
  recurring: boolean
}

function find(lines: ContentLine[], name: string): ContentLine | undefined {
  return lines.find((l) => l.name === name)
}

function findAll(lines: ContentLine[], name: string): ContentLine[] {
  return lines.filter((l) => l.name === name)
}

/**
 * Tolker DTSTART. Heldag (VALUE=DATE eller 8 siffer) lagres kl. 12:00 UTC,
 * som resten av appen. "Z" er UTC. TZID eller ingen sone tolkes som lokal
 * tid i nettleseren: brukeren bor i tidssonen kalenderen ble laget i.
 */
function parseDtstart(dt: ContentLine): { start: Date; allDay: boolean } | null {
  const v = dt.value.trim()
  const isDateOnly = dt.params.VALUE?.toUpperCase() === 'DATE' || /^\d{8}$/.test(v)

  if (isDateOnly) {
    const m = /^(\d{4})(\d{2})(\d{2})/.exec(v)
    if (!m) return null
    const [, y, mo, d] = m
    return { start: new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12)), allDay: true }
  }

  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(v)
  if (!m) return null
  const [, y, mo, d, h, mi, s, z] = m
  const [year, month, day, hour, min, sec] = [y, mo, d, h, mi, s].map(Number)
  const start = z
    ? new Date(Date.UTC(year, month - 1, day, hour, min, sec))
    : new Date(year, month - 1, day, hour, min, sec)
  return { start, allDay: false }
}

function parseAttendee(line: ContentLine): { name: string | null; email: string | null } {
  const name = line.params.CN?.trim() || null
  const email = line.value.replace(/^mailto:/i, '').trim().toLowerCase() || null
  return { name, email: email || null }
}

function parseOne(lines: ContentLine[], key: string): CalEvent | null {
  const dtstart = find(lines, 'DTSTART')
  if (!dtstart) return null
  const parsed = parseDtstart(dtstart)
  if (!parsed) return null

  const uid = find(lines, 'UID')?.value.trim() || null
  const summary = find(lines, 'SUMMARY')
  const title = summary ? summary.value.trim() : ''
  const description = find(lines, 'DESCRIPTION')?.value.trim() || null
  const attendees = findAll(lines, 'ATTENDEE').map(parseAttendee)
  const recurring = findAll(lines, 'RRULE').length > 0 || findAll(lines, 'RDATE').length > 0

  return {
    key,
    uid,
    title,
    description: description || null,
    start: parsed.start,
    allDay: parsed.allDay,
    attendees,
    recurring,
  }
}

/**
 * Parser BEGIN:VEVENT..END:VEVENT-blokker til CalEvent[]. Andre blokker
 * (VTIMEZONE, VALARM) hoppes over, og deres felt lekker ikke inn i
 * hendelsen – VALARM ligger nøstet inni VEVENT og må derfor sjaltes ut.
 */
export function parseEvents(text: string): CalEvent[] {
  const lines = parseLines(text)
  const out: CalEvent[] = []
  let depth = 0 // 0 = utenfor alt, 1 = i VEVENT, >1 = i en nøstet blokk (VALARM) inni VEVENT
  let block: ContentLine[] | null = null
  let index = 0

  for (const line of lines) {
    const beginOf = line.name === 'BEGIN' ? line.value.trim().toUpperCase() : null
    const endOf = line.name === 'END' ? line.value.trim().toUpperCase() : null

    if (beginOf) {
      if (beginOf === 'VEVENT' && depth === 0) {
        block = []
        depth = 1
      } else if (depth >= 1) {
        depth++
      }
      continue
    }
    if (endOf) {
      if (depth >= 1) depth--
      if (endOf === 'VEVENT' && depth === 0) {
        if (block) {
          const event = parseOne(block, `e${index}`)
          if (event) {
            out.push(event)
            index++
          }
        }
        block = null
      }
      continue
    }

    // Bare felt direkte i VEVENT (depth === 1) tas med; VALARM sitt innhold (depth > 1) skal ikke lekke inn.
    if (block && depth === 1) block.push(line)
  }
  return out
}
