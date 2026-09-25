'use client'

import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatDate } from '@/domain/format'
import type { LogEntryType } from '@/types'
import { useLogEditor } from './ComposerProvider'
import { t } from '@/i18n'

type Props = { id: string; body: string | null; date: Date | string; type: LogEntryType | null; personIds: string[] }

/** Et diskret blyantikon ved en logg, som åpner redigering. Brukes i tidslinjene. */
export function EditLogButton({ id, body, date, type, personIds }: Props) {
  const edit = useLogEditor()
  const d = new Date(date)
  return (
    <Button
      variant="quiet"
      size="icon"
      aria-label={t.log.editLabel(formatDate(d))}
      // Loggdatoer lagres kl. 12:00 UTC, så UTC-datoen er dagen du valgte.
      onPress={() => edit({ id, body, date: d.toISOString().slice(0, 10), type, personIds })}
      className="-my-3 ml-auto size-11 desk:size-8"
    >
      <PenLine aria-hidden size={14} strokeWidth={1.75} />
    </Button>
  )
}
