'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { DEFAULT_FILTER, normalize, type MapFilter } from '@/domain/mapFilter'
import { isMapMode, type MapMode } from '@/domain/mapMode'
import type { SavedView } from '@/server/queries/views'

const KEY = 'map-state'

type Stored = { mode: MapMode; filter: MapFilter; viewId: string | null }

// localStorage er kilden; React abonnerer. Serveren og første hydrering ser
// null (standardvalget), så ingenting avviker før nettleseren tar over.
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
function write(state: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
  listeners.forEach((fn) => fn())
}

function parse(raw: string | null, tagIds: string[]): Stored {
  try {
    const obj = JSON.parse(raw ?? 'null') as Partial<Stored> | null
    return {
      mode: isMapMode(obj?.mode) ? obj.mode : 'nearness',
      filter: normalize(obj?.filter, tagIds),
      viewId: typeof obj?.viewId === 'string' ? obj.viewId : null,
    }
  } catch {
    return { mode: 'nearness', filter: DEFAULT_FILTER, viewId: null }
  }
}

/**
 * Hvilket syn og filter kartet viser. Siste valg huskes i nettleseren, så
 * kartet åpner der du slapp; lagrede visninger ligger i databasen.
 * Nærhet er standard: det svarer på «hvem glipper?».
 */
export function useMapState(tagIds: string[], views: SavedView[]) {
  const raw = useSyncExternalStore(subscribe, read, () => null)
  const tagKey = tagIds.join(',')
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tagKey er tagIds som verdi
  const state = useMemo(() => parse(raw, tagIds), [raw, tagKey])
  const update = (next: Partial<Stored>) => write({ ...state, ...next })

  // En visning er aktiv bare så lenge filteret og synet er uendret.
  const view = views.find((v) => v.id === state.viewId)
  const same = (a: MapFilter, b: MapFilter) =>
    JSON.stringify({ ...a, hiddenTags: [...a.hiddenTags].sort() }) ===
    JSON.stringify({ ...b, hiddenTags: [...b.hiddenTags].sort() })
  const activeViewId = view && view.mode === state.mode && same(view.filter, state.filter) ? view.id : null

  return {
    mode: state.mode,
    filter: state.filter,
    activeViewId,
    setMode: (mode: MapMode) => update({ mode }),
    setFilter: (filter: MapFilter) => update({ filter, viewId: null }),
    applyView: (v: SavedView | null) =>
      update(v ? { mode: v.mode, filter: v.filter, viewId: v.id } : { filter: DEFAULT_FILTER, viewId: null }),
  }
}
