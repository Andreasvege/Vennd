import 'server-only'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { TELL_TYPES, type ClaudeTell, type TellContext } from '@/domain/tell'
import { claude, suggestModel } from './client'

// Skjemaet Claude svarer etter. Grensene (antall, lengde, gyldige datoer)
// håndheves i resolveTell; her er bare formen.
const output = z.object({
  relationLabel: z.string().nullable(),
  birthday: z.object({ day: z.number().int(), month: z.number().int(), year: z.number().int().nullable() }).nullable(),
  groups: z.array(z.string()),
  facts: z.array(z.object({ person: z.string(), label: z.string(), value: z.string() })),
  relations: z.array(z.object({ a: z.string(), b: z.string(), type: z.enum(TELL_TYPES), label: z.string().nullable() })),
  threads: z.array(z.object({ people: z.array(z.string()), title: z.string(), due: z.enum(['none', 'week', 'month']) })),
})

const SYSTEM = `Du hjelper med Vennd, en personlig dagbok og et kart over folk brukeren kjenner. Brukeren forteller fritt om én person (subjektet). Gjør teksten om til det brukeren ellers måtte ha fylt inn selv:

- relationLabel: hva subjektet er for brukeren, med få ord («studievenn», «fetter», «sjefen min»). null om teksten ikke sier det.
- birthday: dag, måned og eventuelt år, bare om teksten sier det.
- groups: miljøer subjektet hører til («Klatring», «Studentradio»). Bruk et navn fra lista over miljøer når det passer; foreslå et nytt bare når teksten tydelig nevner en gjeng eller et sted de tilhører.
- facts: varige opplysninger om subjektet eller andre nevnte personer: jobb, bosted, studier, barn, allergi, interesser. label er kort (Jobb, Bor, Studerer, Barn, Liker), value er selve opplysningen. Ikke lag et faktum for en relasjon mellom to personer; det er relations.
- relations: hvem som kjenner hvem. a og b er navn slik de står i teksten eller i lista over personer. type er FRIEND, FAMILY, COLLEAGUE, ROMANTIC, ACQUAINTANCE eller OTHER. label er valgfritt og symmetrisk, så det gir mening fra begge sider («kjærester», «søsken», «klatrer sammen»), ikke «bror».
- threads: ting det er naturlig å spørre om eller følge opp neste gang (maks 3), skrevet som et kort tema: «Flyttingen til Bergen». due er «week» eller «month» når teksten sier når, ellers «none».

Bare det teksten faktisk sier. Ikke gjett. Ingenting å foreslå er et godt svar. Skriv på norsk.`

function prompt(ctx: TellContext, text: string) {
  const s = ctx.subject
  const facts = s.facts.map((f) => `${f.label}: ${f.value}`).join('; ')
  return [
    `Subjektet: ${s.name}${s.relationLabel ? ` (${s.relationLabel})` : ''}${facts ? `. Kjent fra før: ${facts}` : ''}`,
    `Miljøer brukeren har: ${ctx.tags.map((t) => t.name).join(', ') || 'ingen'}`,
    `Personer brukeren kjenner: ${ctx.persons.map((p) => p.name).join(', ')}`,
    `Teksten:\n<tekst>\n${text}\n</tekst>`,
  ].join('\n\n')
}

/** Ett kall, bare når brukeren ber om det. null ved avslag. */
export async function askTell(ctx: TellContext, text: string): Promise<ClaudeTell | null> {
  const response = await claude().messages.parse({
    model: suggestModel(),
    max_tokens: 4000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt(ctx, text) }],
    // Uttrekk, ikke resonnering: lav innsats holder, og holder kostnaden nede.
    output_config: { effort: 'low', format: zodOutputFormat(output) },
  })
  if (response.stop_reason === 'refusal') return null
  return response.parsed_output ?? null
}
