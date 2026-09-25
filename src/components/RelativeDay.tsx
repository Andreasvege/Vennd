'use client'

import { useIsClient } from './useIsClient'
import { formatDate, relativeDay } from '@/domain/format'

/**
 * «i går» avhenger av hvilken dag det er der *du* er. Serveren kjører i
 * UTC, så mellom midnatt og to om natten norsk sommertid ville den sagt
 * feil dag. Serveren og hydreringen skriver derfor en fast dato; straks
 * etter hydrering tegner nettleseren den relative formen i lokal tid.
 */
export function RelativeDay({ date, className }: { date: Date | string; className?: string }) {
  const d = new Date(date)
  const onClient = useIsClient()
  return (
    <time dateTime={d.toISOString()} className={className}>
      {onClient ? relativeDay(d) : formatDate(d)}
    </time>
  )
}
