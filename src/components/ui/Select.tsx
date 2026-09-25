'use client'

import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components'
import { ChevronDown } from 'lucide-react'
import { fieldControl, fieldLabel } from './TextField'

export type SelectOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  value: T | null
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  isRequired?: boolean
  autoFocus?: boolean
  className?: string
}

/**
 * Erstatter native <select>: den kan ikke styles i mørk modus på alle
 * plattformer, og valglista ble hvit-på-hvit i Firefox.
 */
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  isRequired,
  autoFocus,
  className,
}: Props<T>) {
  return (
    <AriaSelect
      selectedKey={value}
      onSelectionChange={(key) => {
        if (key !== null) onChange(key as T)
      }}
      placeholder={placeholder}
      isRequired={isRequired}
      autoFocus={autoFocus}
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      <Label className={fieldLabel}>{label}</Label>
      <AriaButton
        className={`${fieldControl} flex items-center justify-between gap-2 text-left data-[focus-visible]:border-pen data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper`}
      >
        <SelectValue className="truncate data-[placeholder]:text-ink-muted" />
        <ChevronDown aria-hidden size={16} strokeWidth={1.75} className="shrink-0 text-ink-muted" />
      </AriaButton>
      <Popover
        offset={6}
        className="w-(--trigger-width) rounded-[10px] border border-rule bg-paper-raised shadow-float outline-none data-[entering]:opacity-0 transition-opacity duration-150"
      >
        <ListBox className="max-h-72 overflow-y-auto p-1 outline-none">
          {options.map((o) => (
            <ListBoxItem
              key={o.value}
              id={o.value}
              textValue={o.label}
              className="cursor-pointer rounded-[7px] px-3 py-2 text-[15px] text-ink outline-none data-[focused]:bg-pen-wash data-[selected]:font-medium"
            >
              {o.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
