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
  /** Skriv i dagbokens stemme (Fraunces). Brukes for loggtekst og notater. */
  serif?: boolean
  /** placeholder og rows ligger på Input/TextArea i react-aria, ikke på TextField. */
  placeholder?: string
  rows?: number
  className?: string
}

export const fieldLabel = 'block text-[13px] text-ink-muted mb-1.5'

export const fieldControl = [
  'w-full rounded-[10px] bg-paper-raised border border-rule px-3 py-2.5 text-[15px] text-ink',
  'placeholder:text-ink-muted outline-none transition-colors duration-150',
  'data-[hovered]:border-ink-muted/60',
  'data-[focused]:border-pen data-[focused]:ring-2 data-[focused]:ring-pen data-[focused]:ring-offset-2 data-[focused]:ring-offset-paper',
  'data-[invalid]:border-redpencil data-[disabled]:opacity-40',
].join(' ')

export function TextField({
  label,
  description,
  errorMessage,
  multiline = false,
  serif = false,
  placeholder,
  rows = 3,
  className,
  isInvalid,
  ...props
}: TextFieldProps) {
  const control = [fieldControl, serif && 'font-display text-[18px] leading-relaxed']
    .filter(Boolean)
    .join(' ')

  return (
    <AriaTextField
      {...props}
      // FieldError rendres kun når feltet er ugyldig, så en egen errorMessage
      // må også sette isInvalid. Eksplisitt isInvalid fra kallstedet vinner.
      isInvalid={isInvalid ?? Boolean(errorMessage)}
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      <Label className={fieldLabel}>{label}</Label>

      {multiline ? (
        <TextArea placeholder={placeholder} rows={rows} className={`${control} resize-none`} />
      ) : (
        <Input placeholder={placeholder} className={control} />
      )}

      {description ? (
        <Text slot="description" className="text-[13px] text-ink-muted mt-1.5">
          {description}
        </Text>
      ) : null}

      <FieldError className="text-[13px] text-redpencil mt-1.5">
        {({ validationErrors }) => errorMessage ?? validationErrors.join(' ')}
      </FieldError>
    </AriaTextField>
  )
}
