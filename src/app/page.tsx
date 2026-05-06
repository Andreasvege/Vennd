'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { TimelineStripe } from '@/components/TimelineStripe'
import { RemindersSidebar } from '@/components/RemindersSidebar'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { LogEntryModal } from '@/components/modals/LogEntryModal'

export default function HomePage() {
  const { data: session, status } = useSession()

  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false)
  const [logEntryOpen, setLogEntryOpen] = useState(false)
  const [logEntryPersonId, setLogEntryPersonId] = useState<string | undefined>()

  const handleAddLog = (personId?: string) => {
    setLogEntryPersonId(personId)
    setLogEntryOpen(true)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-Text/40">Laster...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center px-4">
        <h1 className="text-5xl font-bold text-Accent">Vennekart</h1>
        <p className="text-Text/60 max-w-sm">
          Din personlige sosiale relasjonsdagbok. Hold oversikt over vennene dine, logg kontakt og få påminnelser.
        </p>
        <button
          onClick={() => signIn('google')}
          className="bg-Accent text-Primary font-bold px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-Accent/30"
        >
          Kom i gang med Google
        </button>
      </div>
    )
  }

  return (
    <>
      <TimelineStripe
        refreshKey={refreshKey}
        onAddLog={() => handleAddLog(undefined)}
      />

      <div className="flex mx-4 mt-2 gap-0" style={{ height: 'calc(100vh - 140px)' }}>
        <VennekartCanvas
          onAddPerson={() => setAddPersonOpen(true)}
          onAddRelationship={() => setAddRelationshipOpen(true)}
          onAddLog={handleAddLog}
          refreshKey={refreshKey}
        />
        <RemindersSidebar refreshKey={refreshKey} />
      </div>

      <AddPersonModal
        isOpen={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
        onSuccess={refresh}
      />
      <AddRelationshipModal
        isOpen={addRelationshipOpen}
        onClose={() => setAddRelationshipOpen(false)}
        onSuccess={refresh}
      />
      <LogEntryModal
        isOpen={logEntryOpen}
        onClose={() => setLogEntryOpen(false)}
        onSuccess={refresh}
        defaultPersonId={logEntryPersonId}
      />
    </>
  )
}
