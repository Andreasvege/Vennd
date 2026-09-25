'use client'

import { useState } from 'react'
import { FileTrigger } from 'react-aria-components'
import { Avatar, Button } from '@/components/ui'
import type { TagColor } from '@/lib/palette'
import { removePhoto, uploadPhoto } from '@/server/actions/photo'
import { settle } from '@/server/actions/result'
import { resizePhoto } from './resizePhoto'
import { t } from '@/i18n'

type Props = { personId: string; name: string; tint: TagColor; photoUrl: string | null }

/** Bilde av personen. Lagres med en gang; resten av skjemaet lagres som før. */
export function PhotoField({ personId, name, tint, photoUrl }: Props) {
  const [url, setUrl] = useState(photoUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const choose = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('photo', new File([await resizePhoto(file)], 'photo.webp', { type: 'image/webp' }))
      const res = await settle(uploadPhoto(personId, form))
      if (res.ok) setUrl(res.data.url)
      else setError(t.errors[res.error])
    } catch {
      setError(t.person.photoUnreadable)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setError('')
    const res = await settle(removePhoto(personId))
    if (res.ok) setUrl(null)
    else setError(t.errors[res.error])
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] text-ink-muted">{t.person.photo}</span>
      <div className="flex items-center gap-4">
        <Avatar name={name} tint={tint} src={url} size="lg" decorative />
        <FileTrigger acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'image/heic']} onSelect={choose}>
          <Button variant="secondary" size="sm" isDisabled={busy}>
            {url ? t.person.changePhoto : t.person.addPhoto}
          </Button>
        </FileTrigger>
        {url && (
          <Button variant="quiet" size="sm" isDisabled={busy} onPress={remove}>
            {t.person.removePhoto}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
