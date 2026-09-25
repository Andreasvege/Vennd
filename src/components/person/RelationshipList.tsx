'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Plus } from 'lucide-react'
import { Button, ChipGroup, Select, Sheet, TextField } from '@/components/ui'
import { formatDate, todayISO } from '@/domain/format'
import { createRelationship, deleteRelationship, updateRelationship } from '@/server/actions/relationship'
import { settle } from '@/server/actions/result'
import { useProximityNotice } from '@/components/toast/useProximityNotice'
import type { PersonProfileData } from '@/server/queries/person'
import type { RelationshipType } from '@/types'
import { t } from '@/i18n'
import { TYPE_OPTIONS } from './type-options'

type Relationship = PersonProfileData['relationships'][number]

const isoOf = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '')

type SheetState = { mode: 'add' } | { mode: 'edit'; rel: Relationship } | null

function RelationshipSheet({
  state,
  personId,
  people,
  onClose,
}: {
  state: NonNullable<SheetState>
  personId: string
  people: PersonProfileData['people']
  onClose: () => void
}) {
  const rel = state.mode === 'edit' ? state.rel : null
  const [other, setOther] = useState<string | null>(rel?.other.id ?? null)
  const [type, setType] = useState<RelationshipType>(rel?.type ?? 'FRIEND')
  const [label, setLabel] = useState(rel?.label ?? '')
  const [since, setSince] = useState(isoOf(rel?.since ?? null))
  const [until, setUntil] = useState(isoOf(rel?.until ?? null))
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const notice = useProximityNotice()

  const save = () =>
    startTransition(async () => {
      const fields = { type, label: label || null, since: since || null, until: until || null }
      if (rel) {
        const result = await settle(updateRelationship(rel.id, fields))
        if (!result.ok) return setError(t.errors[result.error])
      } else {
        if (!other) return setError(t.errors.invalid)
        const result = await settle(createRelationship({ fromPersonId: personId, toPersonId: other, ...fields }))
        if (!result.ok) return setError(t.errors[result.error])
        notice(result.data.proximities)
      }
      onClose()
    })

  const remove = () =>
    startTransition(async () => {
      if (!rel) return
      const result = await settle(deleteRelationship(rel.id))
      if (!result.ok) setError(t.errors[result.error])
      else onClose()
    })

  return (
    <Sheet
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={rel ? t.relations.edit(rel.other.name) : t.relations.add}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex flex-col gap-5"
      >
        {!rel && (
          <Select
            label={t.relations.person}
            value={other}
            onChange={setOther}
            options={people.map((p) => ({ value: p.id, label: p.name }))}
            placeholder={t.common.choosePerson}
            autoFocus
          />
        )}
        <ChipGroup label={t.relations.type} value={type} onChange={setType} options={TYPE_OPTIONS} />
        <TextField
          label={t.relations.label}
          description={t.common.optional}
          value={label}
          onChange={setLabel}
          placeholder={t.relations.labelPlaceholder}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField label={t.relations.since} description={t.common.optional} type="date" value={since} onChange={setSince} />
          <TextField label={t.relations.until} description={t.common.optional} type="date" value={until} onChange={setUntil} />
        </div>

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-5">
          <Button variant="primary" type="submit" isDisabled={pending || (!rel && !other)}>
            {pending ? t.common.saving : t.common.save}
          </Button>
          {rel && !rel.until && (
            <Button variant="secondary" onPress={() => setUntil(todayISO())}>
              {t.relations.end}
            </Button>
          )}
          <div className="flex-1" />
          {rel && (
            <Button variant="quiet" onPress={remove} isDisabled={pending}>
              {t.relations.remove}
            </Button>
          )}
        </div>
      </form>
    </Sheet>
  )
}

/** Hvem personen står i forhold til, og hvordan. Avsluttede står sist, dempet. */
export function RelationshipList({
  personId,
  relationships,
  people,
}: {
  personId: string
  relationships: Relationship[]
  people: PersonProfileData['people']
}) {
  const [sheet, setSheet] = useState<SheetState>(null)

  return (
    <div className="flex flex-col gap-3">
      {relationships.length === 0 ? (
        <p className="text-[14px] text-ink-muted">{t.relations.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-rule">
          {relationships.map((rel) => (
            <li key={rel.id} className={`flex items-center gap-3 py-2.5 ${rel.until ? 'text-ink-muted' : ''}`}>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px]">
                  <Link href={`/person/${rel.other.id}`} className="font-medium hover:underline">
                    {rel.other.name}
                  </Link>
                  <span className="text-ink-muted"> · {t.relationType[rel.type]}</span>
                </span>
                <span className="text-[13px] text-ink-muted">
                  {[
                    rel.label && <em key="l" className="font-display">{rel.label}</em>,
                    rel.since && t.relations.since_(formatDate(new Date(rel.since))),
                    rel.until && t.relations.ended(formatDate(new Date(rel.until))),
                  ]
                    .filter(Boolean)
                    .map((part, i) => (
                      <span key={i}>
                        {i > 0 && ' · '}
                        {part}
                      </span>
                    ))}
                </span>
              </div>
              <Button
                variant="quiet"
                aria-label={t.relations.edit(rel.other.name)}
                onPress={() => setSheet({ mode: 'edit', rel })}
                className="size-11 shrink-0 px-0"
              >
                <Pencil aria-hidden size={15} strokeWidth={1.75} />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="quiet" onPress={() => setSheet({ mode: 'add' })} className="-ml-2.5 self-start">
        <Plus aria-hidden size={15} strokeWidth={1.75} />
        {t.relations.add}
      </Button>
      {sheet && <RelationshipSheet state={sheet} personId={personId} people={people} onClose={() => setSheet(null)} />}
    </div>
  )
}
