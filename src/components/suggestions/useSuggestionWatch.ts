'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SuggestionItem } from '@/server/queries/suggestions'

const INTERVAL_MS = 2500
const ATTEMPTS = 10

/**
 * Etter at en logg er lagret, lager Claude forslag i bakgrunnen. Dette
 * spør noen ganger om de er klare, og henter siden på nytt når de er det,
 * så forslagene dukker opp uten at du må gjøre noe.
 */
export function useSuggestionWatch(enabled: boolean, onReady?: (logId: string, items: SuggestionItem[] | null) => void) {
  const router = useRouter()
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  return useCallback(
    (logId: string) => {
      if (!enabled) return
      const poll = (attempt: number) => {
        const timer = setTimeout(async () => {
          timers.current.delete(timer)
          try {
            const res = await fetch(`/api/forslag?logg=${encodeURIComponent(logId)}`)
            const { done, items } = (await res.json()) as { done?: boolean; items?: SuggestionItem[] }
            if (done) {
              onReady?.(logId, items ?? [])
              return router.refresh()
            }
          } catch {
            // Nettet er borte: forslagene kommer neste gang siden lastes.
          }
          if (attempt + 1 < ATTEMPTS) poll(attempt + 1)
          else onReady?.(logId, null)
        }, INTERVAL_MS)
        timers.current.add(timer)
      }
      poll(0)
    },
    [enabled, router, onReady],
  )
}
