'use client'

import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { ModalOverlayProps } from 'react-aria-components'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { t } from '@/i18n'
import { Button } from './Button'
import { sheetBody, sheetModal, sheetOverlay } from './sheet-styles'

export type SheetProps = Omit<ModalOverlayProps, 'children' | 'className'> & {
  title: string
  children: ReactNode
  size?: 'md' | 'lg'
}

/**
 * Et ark: bunnark på mobil, der tommelen er, og en sentrert dialog på
 * større skjermer. Fokusfelle, Escape, retur av fokus og scroll-lås
 * kommer fra react-aria.
 */
export function Sheet({ title, children, size = 'md', isDismissable = true, ...props }: SheetProps) {
  return (
    <ModalOverlay {...props} isDismissable={isDismissable} className={sheetOverlay}>
      <Modal className={sheetModal(size)}>
        <Dialog className={`${sheetBody} outline-none`}>
          {({ close }) => (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <Heading slot="title" level={2} className="font-display text-[21px] italic text-ink">
                  {title}
                </Heading>
                <Button
                  variant="quiet"
                  onPress={close}
                  aria-label={t.common.close}
                  className="-mr-2 size-11 px-0"
                >
                  <X aria-hidden size={20} strokeWidth={1.75} />
                </Button>
              </div>
              {children}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
