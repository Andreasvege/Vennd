import { parseLines, splitStructured, type ContentLine } from './lines'

export type Contact = {
  key: string
  name: string
  /** YYYY-MM-DD. År 1900 betyr ukjent år, slik bursdagsmodulen forstår det. */
  birthday: string | null
  phone: string | null
  email: string | null
  note: string | null
}

function collapse(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

/** Navn fra N: [etternavn, fornavn, mellomnavn, tittel, suffiks] -> "fornavn mellomnavn etternavn". */
function nameFromN(raw: string): string {
  const [family, given, additional] = splitStructured(raw)
  return collapse([given, additional, family].filter(Boolean).join(' '))
}

function parseBday(raw: string): string | null {
  const v = raw.trim()
  // YYYY-MM-DD, evt. med klokkeslett (ISO): ta datodelen.
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  // YYYYMMDD
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(v)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  // --MM-DD eller --MMDD: år ukjent.
  m = /^--(\d{2})-?(\d{2})$/.exec(v)
  if (m) return `1900-${m[1]}-${m[2]}`
  return null
}

function findAll(lines: ContentLine[], name: string): ContentLine[] {
  return lines.filter((l) => l.name === name)
}

function find(lines: ContentLine[], name: string): ContentLine | undefined {
  return lines.find((l) => l.name === name)
}

function parseOne(lines: ContentLine[], key: string): Contact | null {
  const fn = find(lines, 'FN')
  const n = find(lines, 'N')
  const org = find(lines, 'ORG')
  const showAs = find(lines, 'X-ABSHOWAS')

  // Firma, ikke person: hoppes over.
  if (showAs?.value.trim().toUpperCase() === 'COMPANY') return null
  if (org && !fn && !n) return null

  const name = fn ? collapse(fn.value) : n ? nameFromN(n.raw) : ''
  if (!name) return null

  const bday = find(lines, 'BDAY')
  const birthday = bday ? parseBday(bday.value) : null

  const tel = findAll(lines, 'TEL')[0]
  const phone = tel ? tel.value.trim() || null : null

  const email = findAll(lines, 'EMAIL')[0]
  const emailValue = email ? email.value.replace(/^mailto:/i, '').trim().toLowerCase() : null

  const note = find(lines, 'NOTE')
  const noteValue = note ? note.value.trim() || null : null

  return { key, name, birthday, phone, email: emailValue || null, note: noteValue }
}

/** Parser BEGIN:VCARD..END:VCARD-blokker til Contact[]. */
export function parseVCards(text: string): Contact[] {
  const lines = parseLines(text)
  const out: Contact[] = []
  let block: ContentLine[] | null = null
  let index = 0

  for (const line of lines) {
    if (line.name === 'BEGIN' && line.value.trim().toUpperCase() === 'VCARD') {
      block = []
    } else if (line.name === 'END' && line.value.trim().toUpperCase() === 'VCARD') {
      if (block) {
        const contact = parseOne(block, `c${index}`)
        if (contact) {
          out.push(contact)
          index++
        }
      }
      block = null
    } else if (block) {
      block.push(line)
    }
  }
  return out
}
