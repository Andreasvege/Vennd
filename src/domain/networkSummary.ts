/**
 * Hele nettverket som kompakt tekst til Claude. En gruppe der (nesten) alle
 * kjenner alle, beskrives med én linje i stedet for hundrevis av par, så et
 * stort miljø ikke koster tusenvis av tokens.
 */
export type SummaryPerson = { id: string; name: string; groupId: string | null; mine: string | null }
export type SummaryRelation = { from: string; to: string; type: string; label: string | null }
export type SummaryGroup = { id: string; name: string }

// Så tett må en gruppe være for å beskrives som «alle kjenner hverandre».
const DENSE = 0.8

export function summarizeNetwork(
  persons: SummaryPerson[],
  relations: SummaryRelation[],
  groups: SummaryGroup[],
  typeName: (type: string) => string,
): string {
  const name = new Map(persons.map((p) => [p.id, p.name]))
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)
  const covered = new Set<string>()
  const lines: string[] = []

  const describe = (r: SummaryRelation) =>
    `${name.get(r.from)} – ${name.get(r.to)}: ${typeName(r.type)}${r.label ? ` («${r.label}», ${name.get(r.from)} om ${name.get(r.to)})` : ''}`

  for (const g of [...groups, { id: null as string | null, name: 'Uten miljø' }]) {
    const members = persons.filter((p) => p.groupId === g.id)
    if (members.length === 0) continue
    const ids = new Set(members.map((m) => m.id))
    const inside = relations.filter((r) => ids.has(r.from) && ids.has(r.to))
    const possible = (members.length * (members.length - 1)) / 2
    const dense = g.id !== null && members.length >= 4 && inside.length / possible >= DENSE
    lines.push(`## ${g.name} (${members.length})`)
    lines.push(members.map((m) => (m.mine ? `${m.name} [brukerens ${m.mine}]` : m.name)).join(', '))
    if (dense) {
      lines.push('Alle i dette miljøet kjenner hverandre.')
      // Bare relasjonene som sier noe mer enn «kjenner»: type eller etikett.
      for (const r of inside) {
        covered.add(key(r.from, r.to))
        if (r.label || r.type !== 'FRIEND') lines.push(describe(r))
      }
    } else {
      for (const r of inside) {
        covered.add(key(r.from, r.to))
        lines.push(describe(r))
      }
    }
    lines.push('')
  }

  const across = relations.filter((r) => !covered.has(key(r.from, r.to)) && name.has(r.from) && name.has(r.to))
  if (across.length) {
    lines.push('## På tvers av miljøer')
    for (const r of across) lines.push(describe(r))
  }
  return lines.join('\n').trim()
}
