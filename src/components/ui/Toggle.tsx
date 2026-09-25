'use client'

import { Switch } from 'react-aria-components'
import { checkRow } from './CheckMark'

type Props = { label: string; description?: string; isSelected: boolean; onChange: (v: boolean) => void }

/** Av/på med tekst til venstre og bryteren til høyre. */
export function Toggle({ label, description, isSelected, onChange }: Props) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} className={`${checkRow} justify-between`}>
      <span className="flex flex-col">
        {label}
        {description && <span className="text-[13px] text-ink-muted">{description}</span>}
      </span>
      <span className="relative h-6 w-10 shrink-0 rounded-full bg-rule transition-colors group-data-[selected]:bg-ink group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-pen">
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-paper-raised shadow-sm transition-transform group-data-[selected]:translate-x-4" />
      </span>
    </Switch>
  )
}
