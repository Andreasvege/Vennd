'use client'

import { useState, useTransition } from 'react'
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-aria-components'
import { CircleDot, MoreHorizontal, Orbit, Share2, SlidersHorizontal } from 'lucide-react'
import { Button, Sheet, TextField } from '@/components/ui'
import { activeCount, type MapFilter } from '@/domain/mapFilter'
import { MAP_MODES, type MapMode } from '@/domain/mapMode'
import { deleteView, renameView } from '@/server/actions/view'
import { settle } from '@/server/actions/result'
import type { MapTag } from '@/server/queries/graph'
import type { SavedView } from '@/server/queries/views'
import { t } from '@/i18n'
import { FilterPanel } from './FilterPanel'

const MODE_ICON = { nearness: Orbit, network: Share2, circles: CircleDot } as const

const segment =
  'flex min-h-11 items-center gap-1.5 px-3 text-[13px] text-ink-muted outline-none transition-colors data-[hovered]:text-ink data-[selected]:bg-ink data-[selected]:text-paper data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-pen desk:min-h-9'
const chip =
  'inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-[13px] outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:min-h-8'

type Props = {
  mode: MapMode
  onMode: (m: MapMode) => void
  filter: MapFilter
  onFilter: (f: MapFilter) => void
  tags: MapTag[]
  views: SavedView[]
  activeViewId: string | null
  onView: (v: SavedView | null) => void
}

function ViewMenu({ view }: { view: SavedView }) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(view.name)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  return (
    <>
      <MenuTrigger>
        <AriaButton
          aria-label={t.map.viewOptions(view.name)}
          className="-ml-1 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:size-8"
        >
          <MoreHorizontal aria-hidden size={15} strokeWidth={1.75} />
        </AriaButton>
        <Popover className="min-w-44 rounded-[10px] border border-rule bg-paper-raised p-1 shadow-float outline-none">
          <Menu className="outline-none">
            <MenuItem onAction={() => setRenaming(true)} className="cursor-pointer rounded-[7px] px-3 py-2 text-[15px] outline-none data-[focused]:bg-pen-wash">
              {t.map.renameView}
            </MenuItem>
            <MenuItem
              onAction={() => startTransition(async () => void (await settle(deleteView(view.id))))}
              className="cursor-pointer rounded-[7px] px-3 py-2 text-[15px] text-redpencil outline-none data-[focused]:bg-pen-wash"
            >
              {t.map.deleteView}
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      {renaming && (
        <Sheet isOpen onOpenChange={(open) => !open && setRenaming(false)} title={t.map.renameView}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              startTransition(async () => {
                const result = await settle(renameView(view.id, name))
                if (!result.ok) return setError(result.error === 'taken' ? t.map.viewNameTaken : t.errors[result.error])
                setRenaming(false)
              })
            }}
            className="flex flex-col gap-4"
          >
            <TextField label={t.map.viewName} value={name} onChange={setName} autoFocus errorMessage={error || undefined} />
            <Button variant="primary" type="submit" isDisabled={!name.trim()}>
              {t.common.save}
            </Button>
          </form>
        </Sheet>
      )}
    </>
  )
}

/**
 * Øverst på kartet: synsvalget, filteret og de lagrede visningene. Tre
 * syn over de samme dataene — valget sier bare hvilken vinkel du ser fra.
 */
export function MapControls({ mode, onMode, filter, onFilter, tags, views, activeViewId, onView }: Props) {
  const count = activeCount(filter)
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="flex max-w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <ToggleButtonGroup
          aria-label={t.map.modes}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next) onMode(next as MapMode)
          }}
          className="flex overflow-hidden rounded-[10px] border border-rule bg-paper-raised"
        >
          {MAP_MODES.map((m) => {
            const Icon = MODE_ICON[m]
            return (
              <ToggleButton key={m} id={m} aria-label={t.map.mode[m]} className={segment}>
                <Icon aria-hidden size={15} strokeWidth={1.75} />
                <span className="hidden sm:inline">{t.map.mode[m]}</span>
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>

        <DialogTrigger isOpen={filterOpen} onOpenChange={setFilterOpen}>
          <AriaButton
            aria-label={t.map.filterCount(count)}
            className="flex min-h-11 items-center gap-1.5 rounded-[10px] border border-rule bg-paper-raised px-3 text-[13px] text-ink outline-none data-[hovered]:border-ink-muted data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:min-h-9"
          >
            <SlidersHorizontal aria-hidden size={15} strokeWidth={1.75} />
            <span className="hidden sm:inline">{t.map.filter}</span>
            {count > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-semibold text-paper">
                {count}
              </span>
            )}
          </AriaButton>
          <Popover
            placement="bottom start"
            offset={6}
            className="max-h-[70dvh] overflow-y-auto rounded-[16px] border border-rule bg-paper-raised shadow-float outline-none"
          >
            <Dialog aria-label={t.map.filter} className="outline-none">
              <FilterPanel
                tags={tags}
                filter={filter}
                mode={mode}
                onChange={onFilter}
                onSaved={(v) => {
                  setFilterOpen(false)
                  onView({ ...v, mode, filter })
                }}
              />
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>

      {views.length > 0 && (
        <div role="group" aria-label={t.map.views} className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
          <AriaButton
            onPress={() => onView(null)}
            aria-pressed={activeViewId === null && count === 0}
            className={`${chip} ${activeViewId === null && count === 0 ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper-raised text-ink'}`}
          >
            {t.map.allView}
          </AriaButton>
          {views.map((v) => (
            <div key={v.id} className="flex shrink-0 items-center">
              <AriaButton
                onPress={() => onView(v)}
                aria-pressed={activeViewId === v.id}
                className={`${chip} ${activeViewId === v.id ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper-raised text-ink'}`}
              >
                {v.name}
              </AriaButton>
              <ViewMenu view={v} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
