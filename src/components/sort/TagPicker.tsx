'use client'

import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Plus } from 'lucide-react'
import { Button, TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { isTagColor, tagStroke } from '@/lib/palette'
import { createTag } from '@/server/actions/tag'
import { settle } from '@/server/actions/result'
import { t } from '@/i18n'

export type PickerTag = { id: string; name: string; color: string }

type Props = {
  label: string
  tags: PickerTag[]
  value: string[]
  onChange: (ids: string[]) => void
  /** Et nytt miljø er laget; forelderen legger det i lista si. */
  onCreated: (tag: PickerTag) => void
  selectionMode?: 'single' | 'multiple'
}

/** Miljøene som brikker, med «+ Nytt miljø» på stedet. */
export function TagPicker({ label, tags, value, onChange, onCreated, selectionMode = 'multiple' }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const create = async () => {
    if (!name.trim()) return
    const res = await settle(createTag(name))
    if (!res.ok) return setError(t.errors[res.error])
    onCreated(res.data)
    onChange(selectionMode === 'single' ? [res.data.id] : [...value, res.data.id])
    setName('')
    setAdding(false)
    setError('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {tags.length > 0 && (
          <ToggleButtonGroup
            aria-label={label}
            selectionMode={selectionMode}
            selectedKeys={value}
            onSelectionChange={(keys) => onChange([...keys].map(String))}
            className="contents"
          >
            {tags.map((tag) => (
              <ToggleButton key={tag.id} id={tag.id} className={chipBase}>
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: tagStroke(isTagColor(tag.color) ? tag.color : 'stone') }}
                />
                {tag.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {!adding && (
          <Button variant="quiet" size="sm" onPress={() => setAdding(true)}>
            <Plus aria-hidden size={14} strokeWidth={1.75} />
            {t.sort.newGroup}
          </Button>
        )}
      </div>
      {adding && (
        <div
          className="flex items-end gap-2"
          onKeyDown={(e) => {
            // Enter lager miljøet her, i stedet for å sende inn noe rundt.
            if (e.key === 'Enter') {
              e.preventDefault()
              void create()
            }
            if (e.key === 'Escape') setAdding(false)
          }}
        >
          <TextField label={t.sort.newGroup} value={name} onChange={setName} placeholder={t.sort.newGroupPlaceholder} autoFocus className="w-56" />
          <Button variant="secondary" onPress={create} isDisabled={!name.trim()}>
            {t.common.add}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
