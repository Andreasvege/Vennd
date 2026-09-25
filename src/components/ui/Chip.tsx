'use client'

import { Label, Radio, RadioGroup } from 'react-aria-components'
import { tagStroke, type TagColor } from '@/lib/palette'
import { fieldLabel } from './TextField'

export type ChipOption<T extends string> = { value: T; label: string; tint?: TagColor }

type Props<T extends string> = {
  label: string
  /** Skjul etiketten visuelt når konteksten allerede sier hva valget gjelder. */
  hideLabel?: boolean
  value: T
  onChange: (value: T) => void
  options: ChipOption<T>[]
  className?: string
}

export const chipBase = [
  'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] cursor-pointer',
  'transition-colors duration-150 outline-none',
  'border-rule bg-paper-raised text-ink data-[hovered]:border-ink-muted/60',
  'data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper',
  'data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper',
].join(' ')

/** Ett valg blant noen få, vist som chips. Radio-semantikk: piltaster flytter valget. */
export function ChipGroup<T extends string>({
  label,
  hideLabel,
  value,
  onChange,
  options,
  className,
}: Props<T>) {
  return (
    <RadioGroup
      value={value}
      onChange={(v) => onChange(v as T)}
      orientation="horizontal"
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      <Label className={hideLabel ? 'sr-only' : fieldLabel}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Radio key={o.value} value={o.value} className={chipBase}>
            {o.tint && (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: tagStroke(o.tint) }}
              />
            )}
            {o.label}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  )
}
