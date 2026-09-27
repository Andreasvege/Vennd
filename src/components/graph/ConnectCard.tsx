'use client'

import { useRef, useState } from 'react'
import { Dialog, Heading, Popover } from 'react-aria-components'
import { Button, ChipGroup, TextField, Toggle, Avatar } from '@/components/ui'
import { TYPE_OPTIONS } from '@/components/person/type-options'
import { createConnectedPerson, createRelationship, updateRelationship } from '@/server/actions/relationship'
import { settle } from '@/server/actions/result'
import type { Proximity } from '@/server/queries/proximity'
import type { MapPerson, MapRelationship, MapTag } from '@/server/queries/graph'
import type { Point } from '@/domain/layouts/types'
import type { RelationshipType } from '@/types'
import { t } from '@/i18n'

/** Hva et drag på kartet ble til: mellom to personer, eller ut i tomrommet. */
export type ConnectRequest =
  | { kind: 'pair'; a: string; b: string; at: Point }
  | { kind: 'new'; from: string; at: Point; flowAt: Point | null }

type Props = {
  request: ConnectRequest
  persons: MapPerson[]
  relationships: MapRelationship[]
  tags: MapTag[]
  onClose: () => void
  onDone: (proximities: Proximity[]) => void
}

const first = (name: string) => name.split(' ')[0]
const samePair = (r: MapRelationship, a: string, b: string) =>
  (r.fromPersonId === a && r.toPersonId === b) || (r.fromPersonId === b && r.toPersonId === a)

/**
 * Kortet som dukker opp der du slapp: «Hva er Ingrid og Martin for
 * hverandre?», eller «Hvem kjenner Ingrid?» når du drar ut i tomrommet.
 * Et drag lager aldri en relasjon i det stille; du ser alltid hva som skjer.
 */
export function ConnectCard({ request, persons, relationships, tags, onClose, onDone }: Props) {
  const anchor = useRef<HTMLDivElement>(null)
  const byId = new Map(persons.map((p) => [p.id, p]))
  // Et navn som finnes fra før, gjør «ny person» om til en kobling.
  const [target, setTarget] = useState<string | null>(request.kind === 'pair' ? request.b : null)
  const source = request.kind === 'pair' ? request.a : request.from
  const existing = target ? relationships.find((r) => samePair(r, source, target)) : undefined

  const [type, setType] = useState<RelationshipType>(existing?.type ?? 'FRIEND')
  const [label, setLabel] = useState(existing?.label ?? '')
  const [name, setName] = useState('')
  const [sameGroup, setSameGroup] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const from = byId.get(source)
  const to = target ? byId.get(target) : undefined
  const group = from?.primaryTag ? tags.find((tag) => tag.id === from.primaryTag?.id) : undefined
  const q = name.trim().toLocaleLowerCase('nb')
  const matches = q
    ? persons.filter((p) => p.id !== source && p.name.toLocaleLowerCase('nb').includes(q)).slice(0, 4)
    : []

  const pick = (id: string) => {
    setTarget(id)
    const rel = relationships.find((r) => samePair(r, source, id))
    setType(rel?.type ?? 'FRIEND')
    setLabel(rel?.label ?? '')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    const clean = label.trim() || null
    let proximities: Proximity[] = []
    if (existing) {
      const res = await settle(updateRelationship(existing.id, { type, label: clean }))
      if (!res.ok) return fail(res.error)
    } else if (target) {
      const res = await settle(createRelationship({ fromPersonId: source, toPersonId: target, type, label: clean }))
      if (!res.ok) return fail(res.error)
      proximities = res.data.proximities
    } else {
      if (!name.trim()) return fail('invalid')
      const res = await settle(
        createConnectedPerson({
          name: name.trim(),
          knownPersonId: source,
          type,
          label: clean,
          sameGroup: Boolean(group) && sameGroup,
          position: request.kind === 'new' ? request.flowAt : null,
        }),
      )
      if (!res.ok) return fail(res.error)
      proximities = res.data.proximities
    }
    setSaving(false)
    onDone(proximities)
  }
  const fail = (key: keyof typeof t.errors) => {
    setSaving(false)
    setError(t.errors[key])
  }

  const title = to
    ? t.connect.pairTitle(first(from?.name ?? ''), first(to.name))
    : t.connect.newTitle(first(from?.name ?? ''))

  return (
    <>
      <div ref={anchor} aria-hidden className="pointer-events-none absolute size-px" style={{ left: request.at.x, top: request.at.y }} />
      <Popover
        triggerRef={anchor}
        isOpen
        onOpenChange={(open) => !open && onClose()}
        placement="bottom"
        offset={14}
        className="w-[min(360px,calc(100vw-32px))] rounded-[14px] border border-rule bg-paper-raised shadow-float outline-none data-[entering]:animate-in data-[entering]:fade-in"
      >
        <Dialog aria-label={title} className="p-4 outline-none">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {from && <Avatar name={from.name} tint={from.tint} src={from.photoUrl} size="sm" decorative />}
                {to && <Avatar name={to.name} tint={to.tint} src={to.photoUrl} size="sm" decorative />}
              </div>
              <Heading slot="title" level={2} className="font-display text-[18px] italic leading-tight text-ink">
                {title}
              </Heading>
            </div>

            {!to && (
              <div className="flex flex-col gap-2">
                <TextField
                  label={t.connect.name}
                  value={name}
                  onChange={setName}
                  placeholder={t.connect.namePlaceholder}
                  autoFocus
                />
                {matches.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
                    {t.connect.existing}
                    {matches.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pick(p.id)}
                        className="rounded-full border border-rule px-2.5 py-1 text-ink outline-none hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-pen"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {existing && <p className="-mt-2 text-[13px] text-ink-muted">{t.connect.already(t.relationType[existing.type].toLowerCase())}</p>}

            <ChipGroup label={t.connect.type} value={type} onChange={setType} options={TYPE_OPTIONS} />
            <TextField
              label={t.connect.how}
              value={label}
              onChange={setLabel}
              placeholder={t.connect.howPlaceholder}
              autoFocus={Boolean(to) && !existing}
            />
            {!to && group && (
              <Toggle label={t.connect.sameGroup(group.name)} isSelected={sameGroup} onChange={setSameGroup} />
            )}

            {error && (
              <p role="alert" className="text-[14px] text-redpencil">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="quiet" onPress={onClose}>
                {t.common.cancel}
              </Button>
              <Button variant="primary" type="submit" isDisabled={saving || (!to && !name.trim())}>
                {saving ? t.common.saving : existing ? t.connect.save : to ? t.connect.connect : t.connect.add}
              </Button>
            </div>
          </form>
        </Dialog>
      </Popover>
    </>
  )
}
