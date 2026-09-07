'use client'

import { Button as AriaButton, composeRenderProps } from 'react-aria-components'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'

type ButtonVariant = 'accent' | 'glass' | 'ghost'
type ButtonSize = 'sm' | 'md'

export type ButtonProps = AriaButtonProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseStyles = [
  'inline-flex items-center justify-center gap-2 rounded-2xl',
  'transition-all duration-150 outline-none',
  'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-Accent',
  'data-[disabled]:opacity-40 data-[disabled]:shadow-none data-[disabled]:cursor-not-allowed',
].join(' ')

const variantStyles: Record<ButtonVariant, string> = {
  accent: [
    'bg-Accent text-Primary font-bold shadow-lg shadow-Accent/30',
    'data-[hovered]:bg-Accent/90 data-[pressed]:bg-Accent/80 data-[pressed]:scale-[0.98]',
  ].join(' '),
  glass: [
    'glass-card text-Text/80',
    'data-[hovered]:text-Text data-[hovered]:border-Accent/40 data-[pressed]:scale-[0.98]',
  ].join(' '),
  ghost: [
    'bg-transparent text-Text/40',
    'data-[hovered]:text-Text data-[pressed]:text-Text/70',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
}

export function Button({
  variant = 'accent',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      // composeRenderProps støtter både string og render-funksjon som className,
      // slik at kallstedets klasser legges sist og kan overstyre.
      className={composeRenderProps(className, (resolved) =>
        [baseStyles, variantStyles[variant], sizeStyles[size], resolved]
          .filter(Boolean)
          .join(' ')
      )}
    />
  )
}
