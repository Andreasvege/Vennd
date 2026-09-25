import { it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { DEFAULT_FILTER } from '@/domain/mapFilter'
import { useMapState } from './useMapState'

beforeEach(() => localStorage.clear())

const views = [
  {
    id: 'v1',
    name: 'Vis til andre',
    mode: 'network' as const,
    filter: { ...DEFAULT_FILTER, hiddenTags: ['romantisk'], hideRomanticEdges: true },
  },
]

it('starter i Nærhet uten filter', () => {
  const { result } = renderHook(() => useMapState(['romantisk'], views))
  expect(result.current.mode).toBe('nearness')
  expect(result.current.filter).toEqual(DEFAULT_FILTER)
})

it('husker syn og filter i nettleseren', () => {
  const { result } = renderHook(() => useMapState(['romantisk'], views))
  act(() => result.current.setMode('circles'))
  act(() => result.current.setFilter({ ...DEFAULT_FILTER, showDerived: false }))
  const again = renderHook(() => useMapState(['romantisk'], views)).result.current
  expect(again.mode).toBe('circles')
  expect(again.filter.showDerived).toBe(false)
})

it('en visning er aktiv til du endrer noe', () => {
  const { result } = renderHook(() => useMapState(['romantisk'], views))
  act(() => result.current.applyView(views[0]))
  expect(result.current.activeViewId).toBe('v1')
  expect(result.current.mode).toBe('network')
  act(() => result.current.setFilter({ ...result.current.filter, showDerived: false }))
  expect(result.current.activeViewId).toBeNull()
})

it('«Alle» nullstiller filteret', () => {
  const { result } = renderHook(() => useMapState(['romantisk'], views))
  act(() => result.current.applyView(views[0]))
  act(() => result.current.applyView(null))
  expect(result.current.filter).toEqual(DEFAULT_FILTER)
})
