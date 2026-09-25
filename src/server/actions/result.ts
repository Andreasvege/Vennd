// Hva en handling svarer. Feilkodene oversettes til tekst i klienten
// (t.errors), så serveren aldri bestemmer ordlyden.
export type ActionError = 'invalid' | 'not-found' | 'failed'
export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: ActionError }

export const fail = (error: ActionError) => ({ ok: false as const, error })
