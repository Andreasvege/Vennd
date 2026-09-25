// «Se stien»: id-ene i ?sti=, bare de som faktisk er brukerens personer.
export function parsePath(raw: string | undefined, known: { id: string }[]): string[] {
  const ids = new Set(known.map((p) => p.id))
  return raw?.split(',').filter((id) => ids.has(id)) ?? []
}

export const pathHref = (ids: string[]) => `/kart?sti=${ids.join(',')}`
