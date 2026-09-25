// Hva en handling svarer. Feilkodene oversettes til tekst i klienten
// (t.errors), så serveren aldri bestemmer ordlyden.
export type ActionError = 'invalid' | 'not-found' | 'taken' | 'failed'
export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: ActionError }

export const fail = (error: ActionError) => ({ ok: false as const, error })

/**
 * For kall fra klienten: et nettverksbrudd kaster i stedet for å svare.
 * Da blir det en vanlig feil, ikke en krasj i nærmeste feilgrense.
 */
export function settle<T>(call: Promise<T>): Promise<T | { ok: false; error: 'failed' }> {
  return call.catch(() => ({ ok: false as const, error: 'failed' as const }))
}
