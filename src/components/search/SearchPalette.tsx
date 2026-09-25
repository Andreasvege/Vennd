'use client'

import { useEffect, useState } from 'react'
import {
  Autocomplete,
  Dialog,
  Header,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  Modal,
  ModalOverlay,
  SearchField,
} from 'react-aria-components'
import { CalendarPlus, Circle, CircleCheck, PenLine, Search, X } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { LOG_ICON } from '@/components/log-icons'
import { useComposer } from '@/components/composer/ComposerProvider'
import { relativeDay } from '@/domain/format'
import { whenLabel } from '@/components/today/when'
import { Marked } from '@/components/Marked'
import type { SearchResults } from '@/server/queries/search'
import { t } from '@/i18n'

const DEBOUNCE_MS = 120
const LOG_LIMIT = 8

const item =
  'flex cursor-pointer items-start gap-3 rounded-[8px] px-3 py-2.5 outline-none data-[focused]:bg-pen-wash desk:py-2'
const sectionHeader = 'px-3 pb-1 pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted first:pt-2'

const names = (persons: { name: string }[]) => persons.map((p) => p.name.split(' ')[0]).join(', ')

type State = { q: string; results: SearchResults | null; failed: boolean }

/**
 * Søk på tvers av alt, fra hvor som helst (⌘K eller /). Piltastene flytter
 * i treffene mens fokus blir i feltet; Enter åpner. Et navn i søket blir
 * filter: «ingrid intervju» gir det Ingrid sa om intervjuet.
 */
export function SearchPalette({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<State>({ q: '', results: null, failed: false })
  const openComposer = useComposer()
  const q = query.trim()

  useEffect(() => {
    if (!q) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sok?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!res.ok) throw new Error(String(res.status))
        setState({ q, results: (await res.json()) as SearchResults, failed: false })
      } catch (e) {
        if (!controller.signal.aborted) setState((s) => ({ ...s, q, failed: true }))
        void e
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q])

  const close = () => onOpenChange(false)
  // Forrige treff står til de nye kommer, så lista ikke blinker mens du skriver.
  const results = q ? state.results : null
  const settled = results !== null && state.q === q
  const empty =
    settled && !results.persons.length && !results.logs.length && !results.threads.length && !results.plans.length

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setQuery('')
      }}
      isDismissable
      className="fixed inset-0 z-50 flex items-start justify-center bg-scrim transition-opacity duration-200 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0 sm:px-6 sm:pt-[12vh]"
    >
      <Modal className="flex h-dvh w-full flex-col bg-paper shadow-float outline-none sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-[16px]">
        <Dialog aria-label={t.search.label} className="flex min-h-0 flex-1 flex-col outline-none">
          <Autocomplete inputValue={query} onInputChange={setQuery}>
            <div className="flex items-center gap-2 border-b border-rule px-4 pt-[env(safe-area-inset-top)] sm:pt-0">
              <SearchField aria-label={t.search.label} autoFocus className="flex min-w-0 flex-1 items-center gap-3">
                <Search aria-hidden size={18} strokeWidth={1.75} className="shrink-0 text-ink-muted" />
                <Input
                  placeholder={t.search.placeholder}
                  className="h-16 min-w-0 flex-1 bg-transparent font-display text-[19px] italic text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
                />
              </SearchField>
              <button
                type="button"
                onClick={close}
                aria-label={t.common.close}
                className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pen"
              >
                <X aria-hidden size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2" aria-live="polite">
              {!q && <p className="px-3 py-4 text-[14px] leading-relaxed text-ink-muted">{t.search.hint}</p>}
              {q && state.failed && <p className="px-3 py-4 text-[14px] text-redpencil">{t.search.failed}</p>}
              {empty && <p className="px-3 pb-1 pt-4 text-[14px] text-ink-muted">{t.search.noHits(q)}</p>}

              <Menu aria-label={t.search.label} onAction={close} className="outline-none">
                {results && results.persons.length > 0 && (
                  <MenuSection>
                    <Header className={sectionHeader}>{t.search.persons}</Header>
                    {results.persons.map((p) => (
                      <MenuItem key={p.id} id={`p:${p.id}`} href={`/person/${p.id}`} textValue={p.name} className={`${item} items-center`}>
                        <Avatar name={p.name} tint={p.tint} size="sm" decorative />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium text-ink">{p.name}</span>
                          {p.where && (
                            <span className="block truncate text-[13px] text-ink-muted">
                              <Marked parts={p.where} />
                            </span>
                          )}
                        </span>
                      </MenuItem>
                    ))}
                  </MenuSection>
                )}

                {results && results.logs.length > 0 && (
                  <MenuSection>
                    <Header className={sectionHeader}>{t.search.logs}</Header>
                    {results.logs.map((l) => {
                      const Icon = LOG_ICON[l.type ?? 'OTHER']
                      const who = l.participants[0]
                      return (
                        <MenuItem
                          key={l.id}
                          id={`l:${l.id}`}
                          href={who ? `/person/${who.id}#logg-${l.id}` : '/logg'}
                          textValue={`${names(l.participants)} ${l.snippet.map((s) => s.text).join('')}`}
                          className={item}
                        >
                          <Icon aria-hidden size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-muted" />
                          <span className="min-w-0">
                            <span className="block text-[13px] text-ink-muted">
                              <span className="font-medium text-ink">{names(l.participants)}</span> · {relativeDay(new Date(l.date))}
                            </span>
                            {l.snippet.length > 0 && (
                              <span className="line-clamp-2 font-display text-[15px] leading-snug text-ink">
                                <Marked parts={l.snippet} />
                              </span>
                            )}
                          </span>
                        </MenuItem>
                      )
                    })}
                    {results.logs.length === LOG_LIMIT && (
                      <MenuItem id="all-logs" href={`/logg?q=${encodeURIComponent(q)}`} className={`${item} text-[14px] text-pen`}>
                        {t.search.allInLog}
                      </MenuItem>
                    )}
                  </MenuSection>
                )}

                {results && results.threads.length > 0 && (
                  <MenuSection>
                    <Header className={sectionHeader}>{t.search.threads}</Header>
                    {results.threads.map((th) => {
                      const Icon = th.open ? Circle : CircleCheck
                      const who = th.persons[0]
                      return (
                        <MenuItem
                          key={th.id}
                          id={`t:${th.id}`}
                          href={who ? `/person/${who.id}` : '/'}
                          textValue={th.title}
                          className={item}
                        >
                          <Icon aria-hidden size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-muted" />
                          <span className="min-w-0">
                            <span className={`block text-[15px] text-ink ${th.open ? '' : 'text-ink-muted'}`}>
                              <Marked parts={th.snippet} />
                            </span>
                            <span className="block text-[13px] text-ink-muted">
                              {names(th.persons)}
                              {!th.open && ` · ${t.search.closed}`}
                            </span>
                          </span>
                        </MenuItem>
                      )
                    })}
                  </MenuSection>
                )}

                {results && results.plans.length > 0 && (
                  <MenuSection>
                    <Header className={sectionHeader}>{t.search.plans}</Header>
                    {results.plans.map((p) => {
                      const who = p.persons[0]
                      return (
                        <MenuItem
                          key={p.id}
                          id={`pl:${p.id}`}
                          href={who ? `/person/${who.id}` : '/'}
                          textValue={p.title}
                          className={item}
                        >
                          <CalendarPlus aria-hidden size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-muted" />
                          <span className="min-w-0">
                            <span className="block text-[15px] text-ink">{p.title}</span>
                            <span className="block text-[13px] text-ink-muted">
                              {whenLabel(new Date(p.at), p.hasTime)} · {names(p.persons)}
                            </span>
                          </span>
                        </MenuItem>
                      )
                    })}
                  </MenuSection>
                )}

                {empty && (
                  <MenuSection>
                    <MenuItem
                      id="write"
                      onAction={() => openComposer({ text: q })}
                      textValue={t.search.writeIt(q)}
                      className={`${item} items-center text-[15px] text-pen`}
                    >
                      <PenLine aria-hidden size={15} strokeWidth={1.75} className="shrink-0" />
                      {t.search.writeIt(q)}
                    </MenuItem>
                  </MenuSection>
                )}
              </Menu>
            </div>
          </Autocomplete>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
