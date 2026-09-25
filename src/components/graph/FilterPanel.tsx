'use client'

import { useState, useTransition } from 'react'
import { Checkbox } from 'react-aria-components'
import { Button, CheckMark, checkRow, TextField, Toggle } from '@/components/ui'
import { DEFAULT_FILTER, type MapFilter } from '@/domain/mapFilter'
import type { MapMode } from '@/domain/mapMode'
import { tagStroke } from '@/lib/palette'
import { saveView } from '@/server/actions/view'
import { settle } from '@/server/actions/result'
import type { MapTag } from '@/server/queries/graph'
import { t } from '@/i18n'


type Props = {
  tags: MapTag[]
  filter: MapFilter
  mode: MapMode
  onChange: (f: MapFilter) => void
  /** Den nye visningen blir aktiv med én gang. */
  onSaved: (view: { id: string; name: string }) => void
}

/**
 * Hva kartet viser: tagger som kalendere du skrur av og på, og hvilke
 * slags relasjoner som tegnes. Kombinasjonen kan lagres som en visning.
 */
export function FilterPanel({ tags, filter, mode, onChange, onSaved }: Props) {
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const setTag = (id: string, shown: boolean) =>
    onChange({
      ...filter,
      hiddenTags: shown ? filter.hiddenTags.filter((h) => h !== id) : [...filter.hiddenTags, id],
    })

  const save = () =>
    startTransition(async () => {
      const result = await settle(saveView({ name, mode, filter }))
      if (!result.ok) return setError(result.error === 'taken' ? t.map.viewNameTaken : t.errors[result.error])
      setNaming(false)
      setName('')
      setError('')
      onSaved({ id: result.data.id, name: name.trim() })
    })

  return (
    <div className="flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-5 p-4">
      <fieldset className="flex flex-col">
        <legend className="mb-1 text-[13px] text-ink-muted">{t.map.filterTags}</legend>
        {tags.map((tag) => (
          <Checkbox key={tag.id} isSelected={!filter.hiddenTags.includes(tag.id)} onChange={(v) => setTag(tag.id, v)} className={checkRow}>
            <CheckMark />
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: tagStroke(tag.color) }} />
            {tag.name}
          </Checkbox>
        ))}
        <Checkbox
          isSelected={filter.showUntagged}
          onChange={(v) => onChange({ ...filter, showUntagged: v })}
          className={checkRow}
        >
          <CheckMark />
          <span aria-hidden className="size-2.5 rounded-full border border-ink-muted" />
          {t.map.showUntagged}
        </Checkbox>
      </fieldset>

      <fieldset className="flex flex-col border-t border-rule pt-3">
        <legend className="sr-only">{t.map.filterEdges}</legend>
        <Toggle
          label={t.map.showRomantic}
          isSelected={!filter.hideRomanticEdges}
          onChange={(v) => onChange({ ...filter, hideRomanticEdges: !v })}
        />
        <Toggle
          label={t.map.showHistorical}
          isSelected={filter.showHistorical}
          onChange={(v) => onChange({ ...filter, showHistorical: v })}
        />
        <Toggle label={t.map.showDerived} isSelected={filter.showDerived} onChange={(v) => onChange({ ...filter, showDerived: v })} />
      </fieldset>

      {naming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="flex flex-col gap-3 border-t border-rule pt-4"
        >
          <TextField
            label={t.map.viewName}
            value={name}
            onChange={setName}
            placeholder={t.map.viewNamePlaceholder}
            autoFocus
            errorMessage={error || undefined}
          />
          <div className="flex gap-2">
            <Button variant="primary" type="submit" isDisabled={pending || !name.trim()}>
              {t.common.save}
            </Button>
            <Button variant="quiet" onPress={() => setNaming(false)}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
          <Button variant="secondary" size="sm" onPress={() => setNaming(true)}>
            {t.map.saveView}
          </Button>
          <Button variant="quiet" size="sm" onPress={() => onChange(DEFAULT_FILTER)}>
            {t.map.reset}
          </Button>
        </div>
      )}
    </div>
  )
}
