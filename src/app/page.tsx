'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Landing } from '@/components/Landing'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { TimelineStripe } from '@/components/TimelineStripe'
import { RemindersPanel } from '@/components/RemindersPanel'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { LogEntryModal } from '@/components/modals/LogEntryModal'

export default function HomePage() {
  const { data: session, status } = useSession()

  // To nøkler i stedet for én. Å logge en kontakt kan umulig endre hvem som
  // finnes på kartet eller hvordan de henger sammen, men bumpet før hentet
  // hele grafen på nytt — fire ekstra databaseturer for ingenting.
  const [graphKey, setGraphKey] = useState(0)
  const [activityKey, setActivityKey] = useState(0)

  // Nye personer og relasjoner endrer grafen, og påvirker også påminnelser.
  const refreshGraph = () => {
    setGraphKey((k) => k + 1)
    setActivityKey((k) => k + 1)
  }

  // En loggført kontakt endrer tidslinjen og kan fjerne en påminnelse.
  const refreshActivity = () => setActivityKey((k) => k + 1)

  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false)
  const [logEntryOpen, setLogEntryOpen] = useState(false)
  const [logEntryPersonId, setLogEntryPersonId] = useState<string | undefined>()

  const handleAddLog = (personId?: string) => {
    setLogEntryPersonId(personId)
    setLogEntryOpen(true)
  }

  // Ingen «Laster …»-tekst: et tomt papir i et halvt sekund er roligere
  // enn et blink av tekst som straks forsvinner.
  if (status === 'loading') return null

  if (!session) return <Landing />

  return (
    <>
      {/* Skjermen minus headeren (64 px). Tidslinjen tar det den trenger, og
          kartet fyller resten — også når tidslinjen brettes ut, så siden
          aldri scroller. */}
      <div className="flex h-[calc(100dvh-64px)] flex-col">
        <TimelineStripe refreshKey={activityKey} onAddLog={() => handleAddLog(undefined)} />
        <div className="relative flex min-h-0 flex-1">
          <VennekartCanvas
            onAddPerson={() => setAddPersonOpen(true)}
            onAddRelationship={() => setAddRelationshipOpen(true)}
            onAddLog={handleAddLog}
            refreshKey={graphKey}
          />
          <RemindersPanel refreshKey={activityKey} />
        </div>
      </div>

      <AddPersonModal
        isOpen={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
        onSuccess={refreshGraph}
      />
      <AddRelationshipModal
        isOpen={addRelationshipOpen}
        onClose={() => setAddRelationshipOpen(false)}
        onSuccess={refreshGraph}
      />
      <LogEntryModal
        isOpen={logEntryOpen}
        onClose={() => setLogEntryOpen(false)}
        onSuccess={refreshActivity}
        defaultPersonId={logEntryPersonId}
      />
    </>
  )
}
