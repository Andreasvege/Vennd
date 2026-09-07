'use client'

import { useRouter } from 'next/navigation'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { ReactNode } from 'react'

/**
 * Profilen vist over kartet. Lukking går via router.back() slik at
 * avskjæringen forsvinner og du står igjen på kartet der du var — med
 * scrollposisjon og grafutsnitt intakt.
 */
export function PersonModalShell({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0"
    >
      <Modal className="w-full max-w-2xl my-auto transition duration-200 ease-out data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:translate-y-2 data-[exiting]:opacity-0 data-[exiting]:scale-95">
        <Dialog className="outline-none">
          <Heading slot="title" className="sr-only">
            Profil
          </Heading>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
