'use client'

import { useState, useTransition } from 'react'
import { Checkbox } from 'react-aria-components'
import { Sparkles } from 'lucide-react'
import { Button, CheckMark, checkRow, Sheet, TextField } from '@/components/ui'
import { useToast } from '@/components/toast/ToastProvider'
import { formatDate } from '@/domain/format'
import type { TellProposal } from '@/domain/tell'
import { applyTell, tellAbout } from '@/server/actions/tell'
import { settle } from '@/server/actions/result'
import { t } from '@/i18n'

type Props = {
  person: { id: string; name: string }
  isOpen: boolean
  onClose: () => void
  /** Etter at forslagene er lagt inn (f.eks. neste kort i «Fyll inn»). */
  onApplied?: () => void
}

const first = (name: string) => name.split(' ')[0]

/** Ett forslag som en lesbar linje: «Jobb: Equinor», «Ingrid og Jonas: kjærester». */
function describe(p: TellProposal, subjectId: string): { text: string; note?: string } {
  switch (p.kind) {
    case 'LABEL':
      return { text: t.tell.label(p.label) }
    case 'BIRTHDAY': {
      const d = new Date(`${p.date}T12:00:00Z`)
      return {
        text: t.tell.birthday(
          d.getUTCFullYear() === 1900
            ? d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', timeZone: 'UTC' })
            : formatDate(d),
        ),
      }
    }
    case 'GROUP':
      return { text: t.tell.group(p.name), note: p.tagId ? undefined : t.tell.newGroup }
    case 'FACT':
      return { text: `${p.label}: ${p.value}`, note: p.personId === subjectId ? undefined : first(p.name) }
    case 'RELATION': {
      const fresh = [p.a, p.b].filter((r) => r.id === null).map((r) => r.name)
      return {
        text: `${first(p.a.name)} og ${first(p.b.name)}: ${p.label ?? t.relationType[p.type].toLowerCase()}`,
        note: fresh.length ? t.tell.newPerson(fresh.join(', ')) : undefined,
      }
    }
    case 'THREAD':
      return { text: t.thread.askAbout(p.title) }
  }
}

/**
 * «Fortell om Ingrid»: skriv fritt, som til en venn. Claude foreslår hva
 * det betyr for kartet (hvem hun er for deg, fakta, hvem hun kjenner, hva
 * du bør spørre om), og du krysser av det som skal inn. Ett kall per
 * «Les», aldri automatisk.
 */
export function TellSheet({ person, isOpen, onClose, onApplied }: Props) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [proposals, setProposals] = useState<TellProposal[] | null>(null)
  const [chosen, setChosen] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [reading, startReading] = useTransition()
  const [saving, startSaving] = useTransition()

  const reset = () => {
    setText('')
    setProposals(null)
    setChosen(new Set())
    setError('')
  }
  const close = () => {
    reset()
    onClose()
  }

  const read = () => {
    setError('')
    startReading(async () => {
      const res = await settle(tellAbout({ personId: person.id, text }))
      if (!res.ok) return setError(res.error === 'failed' ? t.tell.failed : t.errors[res.error])
      setProposals(res.data.proposals)
      setChosen(new Set(res.data.proposals.map((_, i) => i)))
    })
  }

  const apply = () => {
    if (!proposals) return
    setError('')
    startSaving(async () => {
      const picked = proposals.filter((_, i) => chosen.has(i))
      const res = await settle(applyTell({ personId: person.id, proposals: picked }))
      if (!res.ok) return setError(t.errors[res.error])
      toast(t.tell.added(res.data.added, first(person.name)))
      close()
      onApplied?.()
    })
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={(open) => !open && close()} title={t.tell.title(first(person.name))}>
      <div className="flex flex-col gap-5">
        {proposals === null ? (
          <>
            <TextField
              label={t.tell.prompt(first(person.name))}
              description={t.tell.hint}
              multiline
              serif
              rows={5}
              value={text}
              onChange={setText}
              placeholder={t.tell.placeholder}
              autoFocus
            />
            <p className="-mt-2 text-[12px] text-ink-muted">{t.tell.privacy}</p>
          </>
        ) : proposals.length === 0 ? (
          <p className="text-[15px] text-ink-muted">{t.tell.nothing}</p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="mb-1 text-[13px] text-ink-muted">{t.tell.review}</p>
            <ul className="flex flex-col">
              {proposals.map((p, i) => {
                const { text: line, note } = describe(p, person.id)
                return (
                  <li key={i}>
                    <Checkbox
                      isSelected={chosen.has(i)}
                      onChange={(on) =>
                        setChosen((prev) => {
                          const next = new Set(prev)
                          if (on) next.add(i)
                          else next.delete(i)
                          return next
                        })
                      }
                      className={`${checkRow} py-1`}
                    >
                      <CheckMark shape={p.kind === 'THREAD' ? 'round' : 'square'} />
                      <span className="min-w-0 flex-1">
                        {line}
                        {note && <span className="ml-2 text-[13px] text-ink-muted">{note}</span>}
                      </span>
                    </Checkbox>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {error && (
          <p role="alert" className="text-[14px] text-redpencil">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {proposals !== null && (
            <Button variant="quiet" onPress={() => setProposals(null)} isDisabled={saving}>
              {t.tell.edit}
            </Button>
          )}
          {proposals === null ? (
            <Button variant="primary" onPress={read} isDisabled={reading || text.trim().length < 3}>
              <Sparkles aria-hidden size={16} strokeWidth={1.75} />
              {reading ? t.tell.reading : t.tell.read}
            </Button>
          ) : proposals.length > 0 ? (
            <Button variant="primary" onPress={apply} isDisabled={saving || chosen.size === 0}>
              {saving ? t.common.saving : t.tell.apply(chosen.size)}
            </Button>
          ) : (
            <Button variant="primary" onPress={close}>
              {t.common.close}
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
