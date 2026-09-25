'use client'

import { useState, useTransition } from 'react'
import { Button as AriaButton, Input, TextField as AriaTextField } from 'react-aria-components'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { fieldControl } from '@/components/ui/TextField'
import { addFact, deleteFact, updateFact } from '@/server/actions/fact'
import { settle } from '@/server/actions/result'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'

type Fact = PersonProfileData['facts'][number]

const inline =
  'w-full rounded-[8px] border border-transparent bg-transparent px-2 py-1 outline-none transition-colors hover:border-rule focus:border-pen focus:bg-paper-raised'

/** Én opplysning som redigeres der den står: klikk, skriv, gå ut av feltet. */
function FactRow({ fact, onError }: { fact: Fact; onError: (msg: string) => void }) {
  const [label, setLabel] = useState(fact.label)
  const [value, setValue] = useState(fact.value)
  const [, startTransition] = useTransition()

  const save = () => {
    if (label.trim() === fact.label && value.trim() === fact.value) return
    startTransition(async () => {
      const result = await settle(updateFact(fact.id, { label, value }))
      if (!result.ok) {
        onError(t.errors[result.error])
        setLabel(fact.label)
        setValue(fact.value)
      }
    })
  }
  const blurOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
  }

  return (
    <div className="group relative -mx-2 flex flex-col">
      <AriaTextField aria-label={t.facts.edit(fact.label)} value={label} onChange={setLabel} onBlur={save} onKeyDown={blurOnEnter}>
        <Input className={`${inline} text-[13px] text-ink-muted`} />
      </AriaTextField>
      <AriaTextField aria-label={t.facts.edit(fact.label)} value={value} onChange={setValue} onBlur={save} onKeyDown={blurOnEnter}>
        <Input className={`${inline} text-[16px]`} />
      </AriaTextField>
      <AriaButton
        aria-label={t.facts.remove(fact.label)}
        onPress={() =>
          startTransition(async () => {
            const result = await settle(deleteFact(fact.id))
            if (!result.ok) onError(t.errors[result.error])
          })
        }
        className="absolute right-0 top-0 flex size-9 items-center justify-center rounded-full text-ink-muted opacity-100 outline-none data-[hovered]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen desk:opacity-0 desk:group-hover:opacity-100 desk:data-[focus-visible]:opacity-100"
      >
        <X aria-hidden size={14} strokeWidth={1.75} />
      </AriaButton>
    </div>
  )
}

/** «Å huske»: faste opplysninger, redigerbare på stedet. */
export function FactList({ personId, facts, labels }: { personId: string; facts: Fact[]; labels: string[] }) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  // Etiketter du har brukt før, pluss noen vanlige, uten dem personen allerede har.
  const taken = new Set(facts.map((f) => f.label.toLocaleLowerCase('nb')))
  const suggestions = [...new Set([...labels, ...t.facts.suggestions])]
    .filter((l) => !taken.has(l.toLocaleLowerCase('nb')))
    .slice(0, 6)

  const add = () =>
    startTransition(async () => {
      const result = await settle(addFact(personId, { label, value }))
      if (!result.ok) {
        setError(t.errors[result.error])
        return
      }
      setLabel('')
      setValue('')
      setAdding(false)
      setError('')
    })

  return (
    <div className="flex flex-col gap-4">
      {facts.length === 0 && !adding && <p className="text-[14px] text-ink-muted">{t.facts.empty}</p>}
      {facts.length > 0 && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {facts.map((fact) => (
            <FactRow key={`${fact.id}:${fact.label}:${fact.value}`} fact={fact} onError={setError} />
          ))}
        </div>
      )}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
          className="flex flex-col gap-3 rounded-[16px] border border-rule bg-paper-raised p-4"
        >
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setLabel(s)}
                className="min-h-9 rounded-full border border-rule px-3 text-[13px] outline-none hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-pen"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
            <AriaTextField aria-label={t.facts.label} value={label} onChange={setLabel} autoFocus>
              <Input placeholder={t.facts.labelPlaceholder} className={fieldControl} />
            </AriaTextField>
            <AriaTextField aria-label={t.facts.value} value={value} onChange={setValue}>
              <Input placeholder={t.facts.valuePlaceholder} className={fieldControl} />
            </AriaTextField>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" type="submit" isDisabled={!label.trim() || !value.trim()}>
              {t.common.save}
            </Button>
            <Button variant="quiet" onPress={() => setAdding(false)}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="quiet" onPress={() => setAdding(true)} className="-ml-2.5 self-start">
          <Plus aria-hidden size={15} strokeWidth={1.75} />
          {t.facts.add}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-[14px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
