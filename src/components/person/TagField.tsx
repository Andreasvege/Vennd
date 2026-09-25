'use client'

import { useId, useState } from 'react'
import {
  Button as AriaButton,
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from 'react-aria-components'
import { Plus, Star, X } from 'lucide-react'
import { fieldControl, fieldLabel } from '@/components/ui/TextField'
import { isTagColor, tagFill, tagStroke, type TagColor } from '@/lib/palette'
import { t } from '@/i18n'

export type TagOption = { id: string; name: string; color: string }

type Props = {
  allTags: TagOption[]
  value: string[]
  primaryTagId: string | null
  onChange: (tagIds: string[], primaryTagId: string | null) => void
  /** Oppretter taggen på serveren og gir den tilbake (eller den som fantes). */
  onCreate: (name: string) => Promise<TagOption | null>
}

const CREATE_KEY = '__create__'
const colorOf = (tag: TagOption): TagColor => (isTagColor(tag.color) ? tag.color : 'stone')

/**
 * Velg tagger fra de du har, eller skriv en ny. Én av dem er hovedtaggen,
 * som gir personen farge; den første du velger blir det automatisk.
 */
export function TagField({ allTags, value, primaryTagId, onChange, onCreate }: Props) {
  const labelId = useId()
  const [input, setInput] = useState('')
  const [known, setKnown] = useState<TagOption[]>(allTags)
  const byId = new Map(known.map((tag) => [tag.id, tag]))
  const selected = value.map((id) => byId.get(id)).filter((tag): tag is TagOption => Boolean(tag))

  const query = input.trim()
  const available = known.filter(
    (tag) => !value.includes(tag.id) && tag.name.toLocaleLowerCase('nb').includes(query.toLocaleLowerCase('nb')),
  )
  const exact = known.some((tag) => tag.name.toLocaleLowerCase('nb') === query.toLocaleLowerCase('nb'))
  const items = [
    ...available.map((tag) => ({ id: tag.id, name: tag.name, tag })),
    ...(query && !exact ? [{ id: CREATE_KEY, name: t.tags.create(query), tag: null }] : []),
  ]

  const add = (id: string) => {
    const next = [...value, id]
    onChange(next, primaryTagId ?? id)
  }

  const remove = (id: string) => {
    const next = value.filter((v) => v !== id)
    onChange(next, primaryTagId === id ? (next[0] ?? null) : primaryTagId)
  }

  const choose = async (key: string | number | null) => {
    if (key === null) return
    if (key === CREATE_KEY) {
      const created = await onCreate(query)
      if (created) {
        setKnown((prev) => (prev.some((tag) => tag.id === created.id) ? prev : [...prev, created]))
        if (!value.includes(created.id)) add(created.id)
      }
    } else {
      add(String(key))
    }
    setInput('')
  }

  return (
    // Chipsene står utenfor ComboBox med vilje: knapper inne i den ville
    // arvet rollen som komboboksens egen åpneknapp.
    <div role="group" aria-labelledby={labelId} className="flex flex-col">
      <span id={labelId} className={fieldLabel}>
        {t.tags.label}
      </span>

      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {selected.map((tag) => {
            const isPrimary = tag.id === primaryTagId
            return (
              <li
                key={tag.id}
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-rule py-0.5 pl-3 pr-1 text-[13px] desk:min-h-9"
                style={{ background: tagFill(colorOf(tag)) }}
              >
                <span aria-hidden className="size-2 rounded-full" style={{ background: tagStroke(colorOf(tag)) }} />
                <span className="ml-1">{tag.name}</span>
                <AriaButton
                  aria-label={t.tags.makePrimary(tag.name)}
                  aria-pressed={isPrimary}
                  onPress={() => onChange(value, tag.id)}
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
                >
                  <Star aria-hidden size={14} strokeWidth={1.75} fill={isPrimary ? 'currentColor' : 'none'} />
                </AriaButton>
                <AriaButton
                  aria-label={t.tags.remove(tag.name)}
                  onPress={() => remove(tag.id)}
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
                >
                  <X aria-hidden size={14} strokeWidth={1.75} />
                </AriaButton>
              </li>
            )
          })}
        </ul>
      )}

      <ComboBox
        aria-label={t.tags.add}
        inputValue={input}
        onInputChange={setInput}
        selectedKey={null}
        onSelectionChange={choose}
        items={items}
        menuTrigger="focus"
        className="flex flex-col"
      >
        <Input placeholder={t.tags.add} className={fieldControl} />
        <Text slot="description" className="mt-1.5 text-[13px] text-ink-muted">
          {t.tags.hint}
        </Text>

        <Popover
          offset={6}
          className="w-(--trigger-width) rounded-[10px] border border-rule bg-paper-raised shadow-float outline-none"
        >
          <ListBox className="max-h-64 overflow-y-auto p-1 outline-none">
            {(item: (typeof items)[number]) => (
              <ListBoxItem
                id={item.id}
                textValue={item.name}
                className="flex cursor-pointer items-center gap-2.5 rounded-[7px] px-3 py-2 text-[15px] text-ink outline-none data-[focused]:bg-pen-wash"
              >
                {item.tag ? (
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ background: tagStroke(colorOf(item.tag)) }}
                  />
                ) : (
                  <Plus aria-hidden size={14} strokeWidth={1.75} className="text-ink-muted" />
                )}
                {item.name}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  )
}
