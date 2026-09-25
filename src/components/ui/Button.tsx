'use client'

import { Button as AriaButton, composeRenderProps } from 'react-aria-components'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = AriaButtonProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}

// Én primærknapp per flate: blekk på papir. Resten er papir med strek
// eller rene tekstknapper, så øyet alltid vet hva hovedhandlingen er.
const base = [
  'inline-flex items-center justify-center gap-2 rounded-[10px] font-medium whitespace-nowrap',
  'transition-colors duration-150 ease-out outline-none select-none',
  'data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen',
  'data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper',
  'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
].join(' ')

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper data-[hovered]:bg-ink/88 data-[pressed]:bg-ink/78',
  secondary:
    'bg-paper-raised text-ink border border-rule data-[hovered]:border-ink-muted data-[pressed]:bg-rule/40',
  quiet: 'text-ink-muted data-[hovered]:text-ink data-[pressed]:text-ink',
  danger:
    'bg-paper-raised text-redpencil border border-redpencil/50 data-[hovered]:border-redpencil',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-5 text-[15px]',
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      // Kallstedets klasser legges sist, så de kan overstyre.
      className={composeRenderProps(className, (resolved) =>
        [base, buttonVariants[variant], buttonSizes[size], resolved].filter(Boolean).join(' '),
      )}
    />
  )
}
