import 'server-only'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { prisma } from '@/lib/prisma'
import { idByName, pairKey, resolveAssessments } from '@/domain/linkSuggestions'
import { summarizeNetwork } from '@/domain/networkSummary'
import { loadLinkState } from '@/server/queries/links'
import { claude, suggestModel } from './client'
import { t } from '@/i18n'

// Regelforslagene Claude får vurdere, og hvor mange egne forslag det kan gi.
const CANDIDATES = 40
const EXTRAS = 25
// Maks én vurdering per bruker så ofte: to trykk skal ikke koste dobbelt.
const COOLDOWN_MS = 5 * 60_000
const TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const

const output = z.object({
  candidates: z.array(
    z.object({ n: z.number(), keep: z.boolean(), type: z.enum(TYPES), label: z.string().nullable(), reason: z.string() }),
  ),
  extra: z.array(
    z.object({ a: z.string(), b: z.string(), type: z.enum(TYPES), label: z.string().nullable(), reason: z.string() }),
  ),
})

const SYSTEM = `Du hjelper med Vennekart, en personlig oversikt over folk brukeren kjenner og hvordan de henger sammen. Du får hele nettverket: miljøene med medlemmer, relasjonene mellom folk (med type og etikett), og hva enkelte er for brukeren. Du får også kandidater som enkle regler har funnet (par med felles bekjente, samme etternavn eller samme miljø).

Oppgaven:
1. candidates: vurder hver kandidat (n er nummeret). keep: true hvis forbindelsen er sannsynlig, false hvis den bare er tilfeldig. Gi type, en etikett og én setning om hvorfor.
2. extra: foreslå forbindelser reglene ikke fant, men som nettverket tydelig peker på (for eksempel familie med samme etternavn, eller et kull der mange kjenner hverandre). Bruk fulle navn nøyaktig slik de står. Bare par som ikke allerede er koblet. Maks ${EXTRAS}, de sikreste først. Ingen forslag er et godt svar når grunnlaget er tynt.

Etiketten vises likt på begge personenes profil, så den må gjelde begge veier: «søsken», «søskenbarn», «kolleger», «kjærester», «venner», «klassekamerater». Aldri «fetter», «kusine», «storebror» eller lignende som bare gjelder én av dem. null når ingen etikett er treffende. type er FAMILY, FRIEND, COLLEAGUE, ROMANTIC, ACQUAINTANCE eller OTHER. Begrunnelsen er én kort setning på norsk, med navn. Resonner som et menneske: er Nora kusinen til fire som heter Vege, er de fire trolig søsken. Foreslå heller «kjenner hverandre» (FRIEND uten etikett) enn å gjette et familieforhold uten grunnlag.`

export type AssessResult = { status: 'done'; assessed: number; found: number } | { status: 'busy' } | { status: 'failed' }

/**
 * Claude leser hele nettverket én gang og gir et samlet sett forslag: en
 * vurdering av regelforslagene og nye forbindelser reglene ikke så. Kjøres
 * når du ber om det, ikke etter hver endring, så det er ett kall, ikke mange.
 */
export async function assessNetwork(userId: string): Promise<AssessResult> {
  const { count } = await prisma.user.updateMany({
    where: { id: userId, OR: [{ linksAssessedAt: null }, { linksAssessedAt: { lt: new Date(Date.now() - COOLDOWN_MS) } }] },
    data: { linksAssessedAt: new Date() },
  })
  if (count === 0) return { status: 'busy' }

  try {
    const { people, rels, rows, candidates } = await loadLinkState(userId)
    const tags = await prisma.tag.findMany({ where: { userId }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } })
    const names = new Map(people.map((p) => [p.id, p.name]))
    const summary = summarizeNetwork(
      people.map((p) => ({ id: p.id, name: p.name, groupId: p.primaryTagId, mine: p.relationLabel })),
      rels,
      tags,
      (type) => (t.relationType as Record<string, string>)[type]?.toLowerCase() ?? type,
    )
    const answered = new Set(rows.filter((r) => r.status !== 'OPEN').map((r) => pairKey(r.aId, r.bId)))
    const list = candidates.slice(0, CANDIDATES)
    const listed = list
      .map((c, i) => {
        const shared = c.shared.slice(0, 4).map((id) => names.get(id))
        const more = c.shared.length > 4 ? ` og ${c.shared.length - 4} til` : ''
        return `#${i + 1}: ${names.get(c.a)} og ${names.get(c.b)}${shared.length ? ` (felles: ${shared.join(', ')}${more})` : ''}`
      })
      .join('\n')

    const response = await claude().messages.parse({
      model: suggestModel(),
      max_tokens: 6000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `# Nettverket\n\n${summary}\n\n# Kandidater fra reglene\n\n${listed || '(ingen)'}` }],
      output_config: { effort: 'low', format: zodOutputFormat(output) },
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) return { status: 'failed' }

    const assessed = resolveAssessments(list, response.parsed_output.candidates)
    const find = idByName(people)
    const linked = new Set(rels.map((r) => pairKey(r.from, r.to)))
    const fromRules = new Set(list.map((c) => pairKey(c.a, c.b)))
    const extras = response.parsed_output.extra.slice(0, EXTRAS).flatMap((x) => {
      const a = find(x.a)
      const b = find(x.b)
      if (!a || !b || a === b) return []
      const key = pairKey(a, b)
      if (linked.has(key) || answered.has(key) || fromRules.has(key)) return []
      const [aId, bId] = a < b ? [a, b] : [b, a]
      return [{ aId, bId, keep: true, type: x.type, label: x.label?.trim().slice(0, 40) || null, reason: x.reason.trim().slice(0, 200) || null }]
    })

    await prisma.$transaction(
      [...assessed, ...extras].map((r) =>
        prisma.linkSuggestion.upsert({
          where: { userId_aId_bId: { userId, aId: r.aId, bId: r.bId } },
          create: { userId, ...r, assessed: true },
          update: { keep: r.keep, type: r.type, label: r.label, reason: r.reason, assessed: true },
        }),
      ),
    )
    return { status: 'done', assessed: assessed.length, found: extras.length }
  } catch (e) {
    console.error('[claude] forbindelser feilet', e)
    return { status: 'failed' }
  }
}
