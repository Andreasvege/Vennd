import 'server-only'
import { after } from 'next/server'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { prisma } from '@/lib/prisma'
import { resolveAssessments, type LinkCandidate } from '@/domain/linkSuggestions'
import { loadLinkState } from '@/server/queries/links'
import { claude, isClaudeEnabled, suggestModel } from './client'
import { t } from '@/i18n'

// Nok til å dekke det du nettopp tegnet, uten å sende hele nettverket hver gang.
const PER_CALL = 20
// Maks felles bekjente som beskrives per par; flere sier ikke Claude mer.
const SHARED_SHOWN = 4
// Én vurdering om gangen: en ny starter tidligst så lenge etter forrige.
const COOLDOWN_MS = 60_000
const TYPES = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'ROMANTIC', 'ACQUAINTANCE', 'OTHER'] as const

const output = z.object({
  assessments: z.array(
    z.object({ n: z.number(), keep: z.boolean(), type: z.enum(TYPES), label: z.string().nullable(), reason: z.string() }),
  ),
})

const SYSTEM = `Du hjelper med Vennekart, en personlig oversikt over folk brukeren kjenner og hvordan de henger sammen. Du får par av personer som ikke er koblet sammen ennå, men som har felles bekjente, samme etternavn eller samme miljø. For hvert par, vurder om de sannsynligvis kjenner hverandre, og i så fall hva forbindelsen er.

- keep: true hvis forbindelsen er sannsynlig ut fra relasjonene, etternavnene og miljøene. false hvis det bare er tilfeldig (for eksempel to som hver for seg kjenner samme person fra helt forskjellige sammenhenger).
- type: FAMILY, FRIEND, COLLEAGUE, ROMANTIC, ACQUAINTANCE eller OTHER.
- label: kort og norsk, og den må gjelde begge veier, fordi den vises likt på begge personenes profil: «søsken», «søskenbarn», «kolleger», «kjærester», «venner», «klassekamerater». Aldri ord som bare gjelder én av dem, som «fetter», «kusine», «storebror» eller «mor»: skriv «søskenbarn» eller «søsken» i stedet. null når ingen etikett er treffende.
- reason: én kort setning på norsk som forklarer hvorfor, med navn. For eksempel «Begge er søskenbarn av Nora og heter Vege.»

Resonner som et menneske ville: er Nora kusinen til fire personer som har samme etternavn, er de fire trolig søsken. Har de ulike etternavn, kan de være søskenbarn av hverandre. Etikettene på de eksisterende relasjonene er skrevet av brukeren og kan beskrive rollen til én av dem («Nora → Håvard: kusine» betyr at Nora er kusinen til Håvard). Vær forsiktig: foreslå heller «kjenner hverandre» (FRIEND uten etikett) enn å gjette et familieforhold du ikke har grunnlag for.`

const TYPE_NAME: Record<string, string> = t.relationType

function describe(
  n: number,
  c: LinkCandidate,
  names: Map<string, string>,
  mine: Map<string, string>,
  tagNames: Map<string, string>,
  rels: { from: string; to: string; type: string; label: string | null }[],
) {
  const rel = (x: string, y: string) => {
    const r = rels.find((q) => (q.from === x && q.to === y) || (q.from === y && q.to === x))
    if (!r) return null
    return `${names.get(r.from)} → ${names.get(r.to)}: ${TYPE_NAME[r.type] ?? r.type}${r.label ? `, «${r.label}»` : ''}`
  }
  const via = c.shared.slice(0, SHARED_SHOWN).flatMap((h) => [rel(h, c.a), rel(h, c.b)]).filter(Boolean)
  const more = c.shared.length - SHARED_SHOWN
  const tags = c.sharedTags.map((id) => tagNames.get(id)).filter(Boolean)
  // Hva de er for brukeren («fetter»): ofte det sterkeste hintet om familie.
  const me = [c.a, c.b].flatMap((id) => (mine.has(id) ? [`${names.get(id)} er brukerens ${mine.get(id)}`] : []))
  return [
    `#${n}: ${names.get(c.a)} og ${names.get(c.b)}`,
    ...me.map((m) => `  ${m}`),
    ...via.map((v) => `  ${v}`),
    more > 0 ? `  … og ${more} felles bekjente til` : null,
    tags.length ? `  Felles miljø: ${tags.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Lar Claude vurdere nye kandidater: hva forbindelsen er, og om den gir
 * mening. Bare par som ikke er vurdert før, så hvert kall er lite. Feil gir
 * bare ingen vurdering; regelforslaget står.
 */
export async function assessLinks(userId: string): Promise<void> {
  // Ta «stafettpinnen»: bare én vurdering per bruker innenfor pausen. To kort
  // på rad ville ellers sendt de samme parene til Claude to ganger. Det som
  // ikke blir vurdert nå, tas neste gang noe endrer seg eller siden åpnes.
  const { count } = await prisma.user.updateMany({
    where: { id: userId, OR: [{ linksAssessedAt: null }, { linksAssessedAt: { lt: new Date(Date.now() - COOLDOWN_MS) } }] },
    data: { linksAssessedAt: new Date() },
  })
  if (count === 0) return
  try {
    const { people, rels, rows, candidates } = await loadLinkState(userId)
    const assessed = new Set(rows.filter((r) => r.assessed).map((r) => `${r.aId}|${r.bId}`))
    const fresh = candidates.filter((c) => !assessed.has(`${c.a}|${c.b}`)).slice(0, PER_CALL)
    if (fresh.length === 0) return

    const names = new Map(people.map((p) => [p.id, p.name]))
    const mine = new Map(
      people.map((p) => [p.id, p.relationLabel ?? (p.type === 'FRIEND' ? '' : TYPE_NAME[p.type].toLowerCase())] as const).filter(([, v]) => v),
    )
    const tags = await prisma.tag.findMany({ where: { userId }, select: { id: true, name: true } })
    const tagNames = new Map(tags.map((x) => [x.id, x.name]))
    const prompt = fresh.map((c, i) => describe(i + 1, c, names, mine, tagNames, rels)).join('\n\n')

    const response = await claude().messages.parse({
      model: suggestModel(),
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
      output_config: { effort: 'low', format: zodOutputFormat(output) },
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) return

    for (const r of resolveAssessments(fresh, response.parsed_output.assessments)) {
      await prisma.linkSuggestion.upsert({
        where: { userId_aId_bId: { userId, aId: r.aId, bId: r.bId } },
        create: { userId, ...r, assessed: true },
        update: { keep: r.keep, type: r.type, label: r.label, reason: r.reason, assessed: true },
      })
    }
  } catch (e) {
    console.error('[claude] forbindelser feilet', e)
  }
}

/** Etter en endring i nettverket: la Claude se på nye kandidater, uten at svaret venter. */
export function scheduleLinkAssessment(userId: string) {
  if (isClaudeEnabled()) after(() => assessLinks(userId))
}
