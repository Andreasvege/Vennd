'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * false på serveren og under hydrering, true rett etter. For tekst som
 * avhenger av leserens klokke eller tidssone («i går», «lørdag 19:30»):
 * serveren skriver en nøytral form, nettleseren tegner den lokale.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false)
}
