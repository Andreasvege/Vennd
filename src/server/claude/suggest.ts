import 'server-only'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { prisma } from '@/lib/prisma'
import { resolveSuggestions, type ClaudeOutput, type SuggestContext } from '@/domain/suggestions'
import { claude, suggestModel } from './client'

// Skjemaet Claude svarer etter. Grensene (antall, lengde) håndheves i
// resolveSuggestions, ikke her: strukturert utdata skal bare gi formen.
const output = z.object({
  threads: z.array(z.object({ people: z.array(z.string()), title: z.string(), due: z.enum(['none', 'week', 'month']) })),
  facts: z.array(z.object({ person: z.string(), label: z.string(), value: z.string() })),
  people: z.array(z.object({ name: z.string() })),
})

const SYSTEM = `Du hjelper med Vennekart, en personlig dagbok over folk brukeren kjenner. Brukeren har nettopp skrevet en logg om et treff eller en samtale. Foreslå det brukeren ellers måtte ha registrert selv:

- threads: ting det er naturlig å spørre om eller følge opp neste gang (maks 3). Skriv tittelen kort som et tema, ikke som et spørsmål: «Andre intervjurunde i Statkraft», «Flyttingen til Bergen». people er hvem tråden gjelder, med navn slik de står i konteksten. due er «week» eller «month» når teksten sier når det blir aktuelt, ellers «none».
- facts: varige opplysninger om en person, ikke hendelser (maks 5). For eksempel jobb, bosted, partner, barn, allergi, hobby. label er kort (Jobb, Bor, Kjæreste), value er selve opplysningen.
- people: personer som er nevnt i teksten, men som ikke er med i loggen (maks 3). Bruk fullt navn når det står.

Foreslå bare det teksten faktisk sier. Ikke gjett, og ikke gjenta det som allerede er registrert. Ingenting å foreslå er et godt svar: da blir listene tomme. Skriv på norsk.`

/** Det Claude trenger å vite: hvem som var med, hva som finnes fra før, og hvem brukeren kjenner. */
async function buildContext(userId: string, logId: string) {
  const [log, persons] = await Promise.all([
    prisma.logEntry.findFirst({
      where: { id: logId, userId },
      select: {
        body: true,
        date: true,
        participants: {
          select: {
            person: {
              select: {
                id: true,
                name: true,
                facts: { select: { label: true, value: true } },
                threads: { where: { thread: { status: 'OPEN' } }, select: { thread: { select: { title: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.person.findMany({ where: { userId }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!log?.body?.trim()) return null
  const context: SuggestContext = {
    participants: log.participants.map(({ person }) => ({
      id: person.id,
      name: person.name,
      facts: person.facts,
      openThreads: person.threads.map((t) => t.thread.title),
    })),
    persons,
  }
  return { context, body: log.body, date: log.date }
}

function prompt(context: SuggestContext, body: string, date: Date) {
  const participants = context.participants
    .map((p) => {
      const facts = p.facts.map((f) => `${f.label}: ${f.value}`).join('; ')
      const threads = p.openThreads.join('; ')
      return `- ${p.name}${facts ? `. Fakta: ${facts}` : ''}${threads ? `. Åpne tråder: ${threads}` : ''}`
    })
    .join('\n')
  return [
    `Personer brukeren kjenner: ${context.persons.map((p) => p.name).join(', ')}`,
    `Med i loggen:\n${participants}`,
    `Dato: ${date.toISOString().slice(0, 10)}`,
    `Loggen:\n<logg>\n${body}\n</logg>`,
  ].join('\n\n')
}

async function askClaude(context: SuggestContext, body: string, date: Date): Promise<ClaudeOutput | null> {
  const response = await claude().messages.parse({
    model: suggestModel(),
    max_tokens: 2000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt(context, body, date) }],
    // Uttrekk, ikke resonnering: lav innsats holder, og holder kostnaden nede.
    output_config: { effort: 'low', format: zodOutputFormat(output) },
  })
  if (response.stop_reason === 'refusal') return null
  return response.parsed_output ?? null
}

/**
 * Lager forslag til en logg. Kjøres med after() når loggen er lagret, så
 * skriving aldri venter på Claude. Feil logges og gir bare ingen forslag;
 * suggestedAt settes uansett, så nettleseren slutter å vente.
 */
export async function generateSuggestions(userId: string, logId: string): Promise<void> {
  try {
    const built = await buildContext(userId, logId)
    if (built) {
      const out = await askClaude(built.context, built.body, built.date)
      const rows = out ? resolveSuggestions(built.context, out) : []
      if (rows.length) {
        await prisma.suggestion.createMany({
          data: rows.map((r) => ({ userId, logEntryId: logId, kind: r.kind, payload: r.payload })),
        })
      }
    }
  } catch (e) {
    console.error('[claude] forslag feilet', e)
  } finally {
    await prisma.logEntry.updateMany({ where: { id: logId, userId }, data: { suggestedAt: new Date() } })
  }
}
