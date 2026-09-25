'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { sheetBody, sheetModal, sheetOverlay } from '@/components/ui/sheet-styles'
import { t } from '@/i18n'

// Må matche transition-varigheten i sheet-styles. Vi venter ut
// utgangsanimasjonen før ruta avmonteres — router.push river ellers
// elementet ut momentant, og data-[exiting] rekker aldri å rendres.
const EXIT_MS = 250

/**
 * Skallet rundt alt som vises over kartet. Ligger i en layout, så det
 * overlever navigasjon mellom profil og redigering — arket blir stående
 * mens innholdet bytter.
 */
export function PersonModalShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  // Tilbake til kartet, ikke router.back(): står du på redigeringssteget ville
  // back() bare tatt deg til profilen igjen, ikke lukket arket. Kartet ligger
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
      className={sheetOverlay}
    >
      <Modal className={sheetModal('lg')}>
        <Dialog className={`${sheetBody} relative outline-none`}>
          <Heading slot="title" className="sr-only">
            {t.person.profile}
          </Heading>
          {/* På mobil er arket nesten hele skjermen; da trengs en tydelig vei ut. */}
          <Button
            variant="quiet"
            onPress={close}
            aria-label={t.common.close}
            className="absolute right-2 top-2 z-10 size-11 px-0 sm:right-3 sm:top-3"
          >
            <X aria-hidden size={20} strokeWidth={1.75} />
          </Button>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
