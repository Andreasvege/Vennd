'use client'

import { useState } from 'react'
import { ComboBox, Input, ListBox, ListBoxItem, Popover } from 'react-aria-components'
import { Plus, UserPlus } from 'lucide-react'
import { fieldControl } from '@/components/ui/TextField'
import { Avatar } from '@/components/ui/Avatar'
import type { ComposerPerson } from '@/server/queries/composer'
import { t } from '@/i18n'

const CREATE_KEY = '__create__'

type Props = {
  persons: ComposerPerson[]
  selected: string[]
  onAdd: (id: string) => void
  /** Oppretter en ny person med bare navn og gir tilbake id-en. */
  onCreate: (name: string) => Promise<string | null>
}

/** Søk opp en du kjenner, eller skriv et nytt navn og legg dem til på stedet. */
export function ParticipantPicker({ persons, selected, onAdd, onCreate }: Props) {
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const query = input.trim()
  const q = query.toLocaleLowerCase('nb')

  const matches = persons.filter((p) => !selected.includes(p.id) && p.name.toLocaleLowerCase('nb').includes(q))
  const exact = persons.some((p) => p.name.toLocaleLowerCase('nb') === q)
  const items = [
    ...matches.slice(0, 8).map((p) => ({ id: p.id, person: p as ComposerPerson | null, label: p.name })),
    ...(query && !exact ? [{ id: CREATE_KEY, person: null, label: t.composer.newPerson(query) }] : []),
  ]

  const choose = async (key: string | number | null) => {
    if (key === null) return
    if (key === CREATE_KEY) {
      if (creating) return
      setCreating(true)
      const id = await onCreate(query)
      setCreating(false)
      if (id) onAdd(id)
    } else {
      onAdd(String(key))
    }
    setInput('')
  }

  return (
    <ComboBox
      aria-label={t.composer.addPerson}
      inputValue={input}
      onInputChange={setInput}
      selectedKey={null}
      onSelectionChange={choose}
      items={items}
      menuTrigger="input"
      className="min-w-40 flex-1"
    >
      <div className="relative">
        <UserPlus
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <Input
          placeholder={t.composer.addPerson}
          disabled={creating}
          className={`${fieldControl} min-h-11 pl-9 desk:min-h-9`}
        />
      </div>
      <Popover
        offset={6}
        className="w-(--trigger-width) min-w-64 rounded-[10px] border border-rule bg-paper-raised shadow-float outline-none"
      >
        <ListBox className="max-h-72 overflow-y-auto p-1 outline-none">
          {(item: (typeof items)[number]) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className="flex cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[15px] text-ink outline-none data-[focused]:bg-pen-wash"
            >
              {item.person ? (
                <Avatar name={item.person.name} tint={item.person.tint} size="sm" decorative />
              ) : (
                <span className="flex size-7 items-center justify-center">
                  <Plus aria-hidden size={16} strokeWidth={1.75} className="text-ink-muted" />
                </span>
              )}
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  )
}
