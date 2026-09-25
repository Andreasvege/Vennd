'use client'

import { useMemo, useState } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { X } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { fieldLabel } from '@/components/ui/TextField'
import { createPerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { ComposerPerson } from '@/server/queries/composer'
import { t } from '@/i18n'
import { ParticipantPicker } from './ParticipantPicker'

type Props = {
  label: string
  persons: ComposerPerson[]
  value: string[]
  onChange: (ids: string[]) => void
  onError: (message: string) => void
}

/**
 * Hvem som er med: valgte personer som brikker, og et felt for å legge til
 * flere, også nye personer med bare navn. Brukt av planer og loggredigering.
 */
export function PeopleField({ label, persons: known, value, onChange, onError }: Props) {
  const [extra, setExtra] = useState<ComposerPerson[]>([])
  const persons = useMemo(() => [...known, ...extra], [known, extra])
  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons])

  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((id) => {
          const p = byId.get(id)
          if (!p) return null
          return (
            <span key={id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink py-1 pl-1.5 pr-1 text-[14px] text-paper desk:min-h-9">
              <Avatar name={p.name} tint={p.tint} size="sm" decorative />
              {p.name}
              <AriaButton
                aria-label={t.composer.removePerson(p.name)}
                onPress={() => onChange(value.filter((x) => x !== id))}
                className="flex size-8 items-center justify-center rounded-full opacity-80 outline-none data-[hovered]:opacity-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-paper"
              >
                <X aria-hidden size={14} strokeWidth={2} />
              </AriaButton>
            </span>
          )
        })}
        <ParticipantPicker
          persons={persons}
          selected={value}
          onAdd={(id) => onChange(value.includes(id) ? value : [...value, id])}
          onCreate={async (name) => {
            const result = await settle(createPerson({ name, type: 'FRIEND' }))
            if (!result.ok) {
              onError(t.errors[result.error])
              return null
            }
            setExtra((prev) => [...prev, { id: result.data.id, name: name.trim(), tint: 'stone' }])
            return result.data.id
          }}
        />
      </div>
    </div>
  )
}
