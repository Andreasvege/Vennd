'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactFlowProvider } from '@xyflow/react'
import { Link2, UserPlus } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { MapControls } from '@/components/graph/MapControls'
import { useMapModel } from '@/components/graph/useMapModel'
import { useMapState } from '@/components/graph/useMapState'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { useComposer } from '@/components/composer/ComposerProvider'
import { useProximityNotice } from '@/components/toast/useProximityNotice'
import { DEFAULT_FILTER } from '@/domain/mapFilter'
import { tagFill, tagStroke } from '@/lib/palette'
import type { Graph } from '@/server/queries/graph'
import type { TagSummary } from '@/server/queries/tags'
import type { SavedView } from '@/server/queries/views'
import { t } from '@/i18n'

type Props = { graph: Graph; tags: TagSummary[]; views: SavedView[]; highlight?: string[] }

/**
 * Kartet med alt rundt: synsvalg, filter og visninger øverst, forklaring
 * (som også er et filter) nederst til venstre, og arkene for ny person og
 * ny relasjon.
 */
export function MapScreen({ graph, tags, views, highlight = [] }: Props) {
  const pathname = usePathname()
  const openComposer = useComposer()
  const notice = useProximityNotice()
  const state = useMapState(
    graph.tags.map((tag) => tag.id),
    views,
  )
  // «Nå» for ferskheten: fast for denne visningen, så kartet ikke flytter
  // seg mens du ser på det.
  const [now] = useState(() => new Date())
  const model = useMapModel(graph, state.mode, state.filter, now)

  const [sheet, setSheet] = useState<'person' | 'relationship' | null>(null)
  const [pair, setPair] = useState<[string, string] | null>(null)
  const [error, setError] = useState('')
  const close = () => {
    setSheet(null)
    setPair(null)
  }

  // Forklaringen viser hovedtaggene (det fargene betyr); alle tagger ligger i filteret.
  const usedTags = graph.tags.filter((tag) => graph.persons.some((p) => p.primaryTag?.id === tag.id))
  const hiddenByFilter = graph.persons.length > 0 && model.visible.length === 0
  const nameOf = (id: string) => graph.persons.find((p) => p.id === id)?.name.split(' ')[0] ?? ''

  return (
    <div className="relative flex h-full">
      <div className="relative h-full flex-1">
        <ReactFlowProvider>
          <VennekartCanvas
            model={model}
            mode={state.mode}
            highlight={highlight}
            onAddLog={(personId) => openComposer({ personIds: [personId] })}
            onDerivedClick={(a, b) => {
              setPair([a, b])
              setSheet('relationship')
            }}
            onProximities={notice}
            onError={setError}
          />
        </ReactFlowProvider>

        <div className="absolute left-4 right-16 top-4 z-10 flex flex-col items-start gap-2">
          <MapControls
            mode={state.mode}
            onMode={state.setMode}
            filter={state.filter}
            onFilter={state.setFilter}
            tags={graph.tags}
            views={views}
            activeViewId={state.activeViewId}
            onView={state.applyView}
          />
          {highlight.length > 1 && (
            <div className="flex items-center gap-2 rounded-[10px] border border-redpencil/40 bg-paper-raised py-1.5 pl-3 pr-1 text-[14px]">
              <span className="text-redpencil">{t.smallWorld.pathLabel(highlight.map(nameOf).join(' → '))}</span>
              <Link
                href={pathname}
                className="rounded-[8px] px-2 py-1 text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pen"
              >
                {t.smallWorld.hidePath}
              </Link>
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-[10px] border border-rule bg-paper-raised px-3 py-2 text-[14px] text-redpencil">
              {error}
            </p>
          )}
        </div>

        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
          <Button variant="secondary" onPress={() => setSheet('relationship')}>
            <Link2 aria-hidden size={16} strokeWidth={1.75} />
            {t.map.newRelationship}
          </Button>
          <Button variant="primary" size="lg" onPress={() => setSheet('person')}>
            <UserPlus aria-hidden size={18} strokeWidth={1.75} />
            {t.map.newPerson}
          </Button>
        </div>

        {/* Forklaringen er også en snarvei til filteret: klikk skjuler taggen. */}
        {usedTags.length > 0 && (
          <ul
            aria-label={t.map.legend}
            className="absolute bottom-5 left-5 z-10 hidden max-w-52 flex-col rounded-[10px] border border-rule bg-paper-raised/90 py-1 sm:flex"
          >
            {usedTags.map((tag) => {
              const shown = !state.filter.hiddenTags.includes(tag.id)
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    aria-pressed={shown}
                    aria-label={t.map.toggleTag(tag.name)}
                    onClick={() =>
                      state.setFilter({
                        ...state.filter,
                        hiddenTags: shown
                          ? [...state.filter.hiddenTags, tag.id]
                          : state.filter.hiddenTags.filter((h) => h !== tag.id),
                      })
                    }
                    className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[12px] outline-none hover:bg-pen-wash focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pen ${shown ? 'text-ink-muted' : 'text-ink-muted/50 line-through'}`}
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full"
                      style={{
                        background: shown ? tagFill(tag.color) : 'transparent',
                        boxShadow: `inset 0 0 0 1.5px ${tagStroke(tag.color)}`,
                      }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {graph.persons.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <EmptyState
              title={t.map.emptyTitle}
              body={t.map.emptyBody}
              className="pointer-events-auto"
              action={
                <Button variant="primary" size="lg" onPress={() => setSheet('person')}>
                  <UserPlus aria-hidden size={18} strokeWidth={1.75} />
                  {t.map.newPerson}
                </Button>
              }
            />
          </div>
        )}
        {hiddenByFilter && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <EmptyState
              title={t.map.hiddenByFilter}
              className="pointer-events-auto"
              action={
                <Button variant="secondary" onPress={() => state.setFilter(DEFAULT_FILTER)}>
                  {t.map.resetFilter}
                </Button>
              }
            />
          </div>
        )}
      </div>

      <AddPersonModal isOpen={sheet === 'person'} onClose={close} tags={tags} />
      <AddRelationshipModal
        key={pair?.join('|') ?? 'none'}
        isOpen={sheet === 'relationship'}
        onClose={close}
        persons={graph.persons.map((p) => ({ id: p.id, name: p.name }))}
        defaultFrom={pair?.[0]}
        defaultTo={pair?.[1]}
      />
    </div>
  )
}
