'use client'

import { Button as AriaButton, composeRenderProps } from 'react-aria-components'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-styles'

export type ButtonProps = AriaButtonProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      // Kallstedets klasser legges sist, så de kan overstyre.
      className={composeRenderProps(className, (resolved) =>
        [buttonClass(variant, size), resolved].filter(Boolean).join(' '),
      )}
    />
  )
}
