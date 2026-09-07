'use client'

import {
  Dialog as AriaDialog,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import type { ModalOverlayProps } from 'react-aria-components'
import type { ReactNode } from 'react'
import { Button } from './Button'

/**
 * Vi bruker isOpen + onOpenChange framfor onClose fordi det er react-aria sin
 * egen kontrakt (OverlayTriggerProps). Da kan ModalOverlay lukke seg selv ved
 * Escape og klikk utenfor uten ekstra liming, og Dialog sin `close` fungerer.
 * Focus trap, focus-restore, Escape og scroll-lock kommer fra react-aria.
 */
export type DialogProps = Omit<ModalOverlayProps, 'children' | 'className'> & {
  title: string
  children: ReactNode
}

const overlayStyles = [
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  'bg-black/60 backdrop-blur-sm',
  'transition-opacity duration-200 ease-out',
  'data-[entering]:opacity-0 data-[exiting]:opacity-0',
].join(' ')

const modalStyles = [
  'w-full max-w-md',
  'transition duration-200 ease-out',
  'data-[entering]:opacity-0 data-[entering]:scale-95',
  'data-[exiting]:opacity-0 data-[exiting]:scale-95',
].join(' ')

export function Dialog({ title, children, isDismissable = true, ...props }: DialogProps) {
  return (
    // isDismissable som standard bevarer oppførselen fra den gamle Modal.tsx:
    // klikk på bakgrunnen lukker.
    <ModalOverlay {...props} isDismissable={isDismissable} className={overlayStyles}>
      <Modal className={modalStyles}>
        <AriaDialog className="glass-card p-6 shadow-2xl outline-none">
          {({ close }) => (
            <>
              <div className="flex items-center justify-between mb-5">
                <Heading slot="title" level={2} className="text-lg font-bold text-Text">
                  {title}
                </Heading>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={close}
                  aria-label="Lukk"
                  className="-mr-2 text-xl leading-none"
                >
                  ×
                </Button>
              </div>
              {children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  )
}
