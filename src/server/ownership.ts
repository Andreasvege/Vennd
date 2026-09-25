export class NotOwnedError extends Error {
  constructor() {
    super('Én eller flere av ressursene finnes ikke eller tilhører en annen bruker')
    this.name = 'NotOwnedError'
  }
}

/**
 * Kast hvis ikke hver forespurt id ble funnet blant brukerens egne rader.
 * `found` skal komme fra en spørring scopet på userId; da betyr et
 * manglende treff enten at raden ikke finnes, eller at den er en annens.
 */
export function assertAllOwned(requested: string[], found: { id: string }[]): void {
  const wanted = new Set(requested)
  const have = new Set(found.map((f) => f.id))
  if (wanted.size !== have.size || [...wanted].some((id) => !have.has(id))) {
    throw new NotOwnedError()
  }
}
