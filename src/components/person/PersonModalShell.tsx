'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { ReactNode } from 'react'

// Må matche transition-varigheten under. Vi venter ut utgangsanimasjonen før
// ruta avmonteres — router.back() river ellers elementet ut momentant, og
// data-[exiting] rekker aldri å rendres.
const EXIT_MS = 200

/**
 * Skallet rundt alt som vises over kartet. Ligger i en layout, så det
 * overlever navigasjon mellom profil og redigering — modalen blir stående
 * mens innholdet bytter.
 */
export function PersonModalShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  // Tilbake til kartet, ikke router.back(): står du på redigeringssteget ville
  // back() bare tatt deg til profilen igjen, ikke lukket modalen. Kartet ligger
  // allerede montert under, så dette er en myk navigasjon.
  const close = () => {
    setIsOpen(false)
    setTimeout(() => router.push('/'), EXIT_MS)
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      isDismissable
      onOpenChange={(open) => {
        if (!open) close()
      }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0"
    >
      <Modal className="w-full max-w-2xl my-auto transition duration-200 ease-out data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:translate-y-3 data-[exiting]:opacity-0 data-[exiting]:scale-95 data-[exiting]:translate-y-3">
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
