// Felles linjeparsing for vCard og iCalendar: begge formatene er
// "content lines" med navn, parametre og verdi, brettet over flere
// fysiske linjer. RFC 6350 / RFC 5545 er like nok her til å dele koden.

export type ContentLine = { name: string; params: Record<string, string>; value: string; raw: string }

/** Fjerner ett nivå med escaping: \n og \N blir linjeskift, \, \; \\ blir seg selv. */
function unescapeValue(s: string): string {
  return s.replace(/\\(n|N|,|;|\\)/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c))
}

/** Splitter en RÅ (fortsatt escapet) verdi på ";" som ikke er escapet, og unescaper hver del. */
export function splitStructured(raw: string): string[] {
  const parts: string[] = []
  let current = ''
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (c === '\\' && i + 1 < raw.length) {
      current += c + raw[i + 1]
      i++
    } else if (c === ';') {
      parts.push(unescapeValue(current))
      current = ''
    } else {
      current += c
    }
  }
  parts.push(unescapeValue(current))
  return parts
}

// item1.TEL, item2.EMAIL osv: iPhone/iCloud grupperer noen felt for å
// kunne henge en X-ABLabel på dem. Gruppeprefikset er ikke del av navnet.
const ITEM_GROUP = /^item\d+\./i

function parseParamValue(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') return trimmed.slice(1, -1)
  return trimmed
}

function parseOneLine(line: string): ContentLine | null {
  const colon = line.indexOf(':')
  if (colon < 0) return null
  let head = line.slice(0, colon)
  const rawValue = line.slice(colon + 1)

  head = head.replace(ITEM_GROUP, '')
  const segments = head.split(';')
  const name = segments[0].trim().toUpperCase()
  if (!name) return null

  const params: Record<string, string> = {}
  for (const seg of segments.slice(1)) {
    const eq = seg.indexOf('=')
    if (eq < 0) continue
    const key = seg.slice(0, eq).trim().toUpperCase()
    if (!key) continue
    // Et parameter kan ha flere verdier adskilt av komma (TYPE=WORK,VOICE);
    // vi tar hele strengen, ubehov for import-bruket her.
    params[key] = parseParamValue(seg.slice(eq + 1))
  }

  return { name, params, value: unescapeValue(rawValue), raw: rawValue }
}

/**
 * Parser rå vCard/iCalendar-tekst til content lines: bretter fortsettelses-
 * linjer (linjer som starter med mellomrom eller tab) sammen med forrige
 * linje, og hopper over blanke eller ugyldige linjer.
 */
export function parseLines(text: string): ContentLine[] {
  const physical = text.split(/\r\n|\r|\n/)
  const unfolded: string[] = []
  for (const line of physical) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1)
    } else {
      unfolded.push(line)
    }
  }

  const out: ContentLine[] = []
  for (const line of unfolded) {
    if (!line.trim()) continue
    const parsed = parseOneLine(line)
    if (parsed) out.push(parsed)
  }
  return out
}
