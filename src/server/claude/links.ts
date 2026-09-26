import 'server-only'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { prisma } from '@/lib/prisma'
import { hubClusters, idByName, insightPairs, pairKey } from '@/domain/linkSuggestions'
import { summarizeNetwork } from '@/domain/networkSummary'
import { loadLinkState } from '@/server/queries/links'
import { claude, suggestModel } from './client'
import { t } from '@/i18n'

// Så mange innsikter Claude kan gi: en håndfull gode, ikke en lang liste.
const INSIGHTS = 12
// Maks én vurdering per bruker så ofte: to trykk skal ikke koste dobbelt.
const COOLDOWN_MS = 5 * 60_000
const TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const

const output = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      kind: z.enum(['group', 'hub']),
      hub: z.string().nullable(),
      members: z.array(z.string()),
      type: z.enum(TYPES),
      label: z.string().nullable(),
      groupName: z.string().nullable(),
    }),
  ),
})

const SYSTEM = `Du hjelper med Vennekart, en personlig oversikt over folk brukeren kjenner og hvordan de henger sammen. Du får hele nettverket: miljøene med medlemmer, relasjonene (type og etikett), hva enkelte er for brukeren, og grupper som enkle regler har funnet (folk som samme person kjenner, men som ikke er koblet til hverandre).

Gi maks ${INSIGHTS} innsikter, de mest verdifulle først. En innsikt er én påstand om en gruppe som dekker mange forbindelser på en gang, slik at brukeren kan svare én gang i stedet for mange:
- kind "group": alle i members kjenner hverandre. For eksempel søsken, et kull, en vennegjeng.
- kind "hub": personen i hub kjenner alle i members. For eksempel en som binder to miljøer, eller en forelder og barna.

Felt:
- title: kort og konkret, 2–5 ord, gjerne med navn: «Vege-søsknene», «Gjengen fra Danvik».
- reason: én setning på norsk om hvorfor, med navn: «Alle fire er søskenbarn av Nora og heter Vege.»
- members (og hub): fulle navn nøyaktig slik de står i nettverket. Minst to i members for "group".
- type: FAMILY, FRIEND, COLLEAGUE, ROMANTIC, ACQUAINTANCE eller OTHER.
- label: vises likt på begge personenes profil, så den må gjelde begge veier: «søsken», «søskenbarn», «kolleger», «venner». Aldri «fetter», «kusine» eller «storebror». null når ingen passer.
- groupName: hvis gruppen tydelig er et eget miljø som ikke finnes ennå, et kort navn på det (for eksempel «Danvik»). Ellers null.

Ikke foreslå forbindelser som allerede finnes. Resonner som et menneske: er Nora kusinen til fire som heter Vege, er de fire trolig søsken. Heller færre, sikre innsikter enn mange usikre. Ingen innsikter er et godt svar når grunnlaget er tynt.`

export type AssessResult = { status: 'done'; found: number } | { status: 'busy' } | { status: 'failed' }

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
    const { people, rels, candidates } = await loadLinkState(userId)
    const tags = await prisma.tag.findMany({ where: { userId }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } })
    const names = new Map(people.map((p) => [p.id, p.name]))
    const summary = summarizeNetwork(
      people.map((p) => ({ id: p.id, name: p.name, groupId: p.primaryTagId, mine: p.relationLabel })),
      rels,
      tags,
      (type) => (t.relationType as Record<string, string>)[type]?.toLowerCase() ?? type,
    )
    // Reglenes grupper som utgangspunkt; Claude kan slå sammen, dele og gi dem mening.
    const clusters = hubClusters(candidates)
      .slice(0, 30)
      .map((c) => `- Folk ${names.get(c.hub)} kjenner, som ikke er koblet: ${c.members.map((m) => names.get(m)).join(', ')}`)
      .join('\n')

    const response = await claude().messages.parse({
      model: suggestModel(),
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `# Nettverket\n\n${summary}\n\n# Grupper fra reglene\n\n${clusters || '(ingen)'}` }],
      output_config: { effort: 'low', format: zodOutputFormat(output) },
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) return { status: 'failed' }

    const find = idByName(people)
    const linked = new Set(rels.map((r) => pairKey(r.from, r.to)))
    const insights = response.parsed_output.insights.slice(0, INSIGHTS).flatMap((x) => {
      const hubId = x.kind === 'hub' && x.hub ? find(x.hub) : null
      if (x.kind === 'hub' && !hubId) return []
      const memberIds = [...new Set(x.members.map(find).filter((id): id is string => id !== null && id !== hubId))]
      // Bare det som faktisk er nytt; en innsikt uten nye forbindelser er ingen innsikt.
      const fresh = insightPairs(x.kind, hubId, memberIds).filter(([a, b]) => !linked.has(pairKey(a, b)))
      if (fresh.length === 0 || (x.kind === 'group' && memberIds.length < 2)) return []
      return [
        {
          userId,
          title: x.title.trim().slice(0, 80),
          reason: x.reason.trim().slice(0, 300),
          kind: x.kind,
          hubId,
          memberIds,
          type: x.type,
          label: x.label?.trim().slice(0, 40) || null,
          groupName: x.groupName?.trim().slice(0, 40) || null,
        },
      ]
    })

    // En ny runde erstatter de ubesvarte innsiktene fra forrige.
    await prisma.$transaction([
      prisma.linkInsight.deleteMany({ where: { userId, status: 'OPEN' } }),
      prisma.linkInsight.createMany({ data: insights }),
    ])
    return { status: 'done', found: insights.length }
  } catch (e) {
    console.error('[claude] forbindelser feilet', e)
    return { status: 'failed' }
  }
}
