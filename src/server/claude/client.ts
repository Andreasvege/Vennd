import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

// Sonnet 5: god norsk og presist uttrekk til lav pris. Kan byttes uten
// kodeendring, f.eks. til claude-haiku-4-5 for enda lavere kostnad.
const DEFAULT_MODEL = 'claude-sonnet-5'

/** Forslag fra Claude er på bare når nøkkelen finnes. Uten den virker alt som før. */
export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export function suggestModel(): string {
  return process.env.CLAUDE_MODEL || DEFAULT_MODEL
}

let client: Anthropic | null = null

/** Én klient per serverprosess, laget først når den trengs. */
export function claude(): Anthropic {
  client ??= new Anthropic()
  return client
}
