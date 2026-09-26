'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactFlowProvider } from '@xyflow/react'
import { Layers, Link2, Sparkles, Undo2, UserPlus } from 'lucide-react'
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
import { buttonClass } from '@/components/ui/button-styles'
import { tidyNetwork } from '@/domain/layouts/tidy'
import { movePersons } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { PositionList } from '@/server/schemas'
import { Button as AriaButton } from 'react-aria-components'

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
  // «Rydd opp» i Nettverk: plasseringene fra før, så «Angre» kan sette dem tilbake.
  const [before, setBefore] = useState<PositionList | null>(null)
  const [refit, setRefit] = useState(0)
  const [tidying, startTidy] = useTransition()

  const tidy = () =>
    startTidy(async () => {
      setError('')
      const prior = graph.persons.map((p) => ({ id: p.id, x: p.positionX, y: p.positionY }))
      const layout = tidyNetwork(
        graph.persons.map((p) => ({ id: p.id, name: p.name, groupId: p.primaryTag?.id ?? p.tagIds[0] ?? null })),
        graph.tags.map((tag) => ({ id: tag.id, name: tag.name })),
        graph.relationships.map((r) => [r.fromPersonId, r.toPersonId] as [string, string]),
      )
      const res = await settle(movePersons([...layout].map(([id, p]) => ({ id, ...p }))))
      if (!res.ok) return setError(t.errors[res.error])
      setBefore(prior)
      setRefit((n) => n + 1)
    })
  const undoTidy = () =>
    startTidy(async () => {
      if (!before) return
      const res = await settle(movePersons(before))
      if (!res.ok) return setError(t.errors[res.error])
      setBefore(null)
      setRefit((n) => n + 1)
    })
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
            refit={refit}
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
            actions={
              state.mode === 'network' &&
              graph.persons.length > 1 && (
                <>
                  <AriaButton
                    onPress={tidy}
                    isDisabled={tidying}
                    className="flex min-h-11 items-center gap-1.5 rounded-[10px] border border-rule bg-paper-raised px-3 text-[13px] text-ink outline-none data-[hovered]:border-ink-muted data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:min-h-9"
                  >
                    <Sparkles aria-hidden size={15} strokeWidth={1.75} />
                    {t.map.tidy}
                  </AriaButton>
                  {before && (
                    <AriaButton
                      onPress={undoTidy}
                      isDisabled={tidying}
                      className="flex min-h-11 items-center gap-1.5 rounded-[10px] px-2 text-[13px] text-ink-muted outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:min-h-9"
                    >
                      <Undo2 aria-hidden size={14} strokeWidth={1.75} />
                      {t.map.tidyUndo}
                    </AriaButton>
                  )}
                </>
              )
            }
          />
          {graph.unsorted > 0 && (
            <Link
              href="/sorter"
              className="flex min-h-9 items-center gap-2 rounded-full border border-ink bg-ink px-3.5 text-[13px] text-paper shadow-float outline-none transition-colors hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-pen focus-visible:ring-offset-2"
            >
              <Layers aria-hidden size={14} strokeWidth={1.75} />
              {t.sort.chip(graph.unsorted)}
            </Link>
          )}
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
            {/* Tomt kart, men folk i bunken: begynn der, ikke med å legge til én og én. */}
            {graph.unsorted > 0 ? (
              <EmptyState
                title={t.sort.title}
                body={t.sort.waiting(graph.unsorted)}
                className="pointer-events-auto"
                action={
                  <Link href="/sorter/kort" className={buttonClass('primary', 'lg')}>
                    <Layers aria-hidden size={18} strokeWidth={1.75} />
                    {t.sort.begin}
                  </Link>
                }
              />
            ) : (
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
            )}
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
