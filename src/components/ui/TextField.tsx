'use client'

import {
  TextField as AriaTextField,
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
} from 'react-aria-components'
import type { TextFieldProps as AriaTextFieldProps } from 'react-aria-components'

export type TextFieldProps = Omit<AriaTextFieldProps, 'children' | 'className'> & {
  label: string
  description?: string
  errorMessage?: string
  multiline?: boolean
  /** placeholder og rows ligger på Input/TextArea i react-aria, ikke på TextField. */
  placeholder?: string
  rows?: number
  className?: string
}

const controlStyles = [
  'w-full bg-Glass border border-GlassBorder rounded-xl px-3 py-2 text-Text',
  'placeholder:text-Text/30 outline-none transition-colors',
  'data-[hovered]:border-Accent/30',
  'data-[focused]:border-Accent data-[focused]:ring-2 data-[focused]:ring-Accent/30',
  'data-[invalid]:border-[#ef5350]',
  'data-[disabled]:opacity-40',
].join(' ')

export function TextField({
  label,
  description,
  errorMessage,
  multiline = false,
  placeholder,
  rows = 3,
  className,
  isInvalid,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      // FieldError rendres kun når feltet er ugyldig, så en egen errorMessage
      // må også sette isInvalid. Eksplisitt isInvalid fra kallstedet vinner.
      isInvalid={isInvalid ?? Boolean(errorMessage)}
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      <Label className="block text-sm text-Text/60 mb-1.5">{label}</Label>

      {multiline ? (
        <TextArea
          placeholder={placeholder}
          rows={rows}
          className={`${controlStyles} resize-none`}
        />
      ) : (
        <Input placeholder={placeholder} className={controlStyles} />
      )}

      {description ? (
        <Text slot="description" className="text-xs text-Text/40 mt-1">
          {description}
        </Text>
      ) : null}

      <FieldError className="text-xs text-[#ef5350] mt-1">
        {({ validationErrors }) => errorMessage ?? validationErrors.join(' ')}
      </FieldError>
    </AriaTextField>
  )
}
