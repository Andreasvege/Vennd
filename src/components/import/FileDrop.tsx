'use client'

import { useState } from 'react'
import { DropZone, FileTrigger, Text, type DropItem } from 'react-aria-components'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui'
import { t } from '@/i18n'

type Props = {
  label: string
  hint: string
  accept: string[]
  onText: (text: string) => void
}

/**
 * Slipp en fil her, eller velg den. Filen leses som tekst i nettleseren og
 * forlater aldri enheten; det er radene du velger etterpå som lagres.
 */
export function FileDrop({ label, hint, accept, onText }: Props) {
  const [error, setError] = useState('')

  const read = async (file: File | null | undefined) => {
    if (!file) return
    try {
      setError('')
      onText(await file.text())
    } catch {
      setError(t.import.readFailed)
    }
  }

  const fromDrop = async (items: DropItem[]) => {
    const item = items.find((i) => i.kind === 'file')
    if (item?.kind === 'file') await read(await item.getFile())
  }

  return (
    <div className="flex flex-col gap-3">
      <DropZone
        onDrop={(e) => fromDrop(e.items)}
        className="flex flex-col items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-rule px-6 py-10 text-center outline-none transition-colors data-[drop-target]:border-pen data-[drop-target]:bg-pen-wash data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
      >
        <Upload aria-hidden size={22} strokeWidth={1.5} className="text-ink-muted" />
        <Text slot="label" className="font-display text-[18px] italic text-ink">
          {label}
        </Text>
        <FileTrigger acceptedFileTypes={accept} onSelect={(files) => read(files?.[0])}>
          <Button variant="secondary">{t.import.choose}</Button>
        </FileTrigger>
      </DropZone>
      <p className="text-[13px] leading-relaxed text-ink-muted">{hint}</p>
      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
