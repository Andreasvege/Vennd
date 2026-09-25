'use client'

import { useCallback, useState } from 'react'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { TimelineStripe } from '@/components/TimelineStripe'
import { RemindersPanel } from '@/components/RemindersPanel'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { LogEntryModal } from '@/components/modals/LogEntryModal'
import type { Graph } from '@/server/queries/graph'
import type { RecentLog } from '@/server/queries/log'
import type { ReminderItem } from '@/server/queries/reminders'
import type { TagSummary } from '@/server/queries/tags'

type Props = {
  graph: Graph
  reminders: ReminderItem[]
  logs: RecentLog[]
  tags: TagSummary[]
}

/**
 * Forsidens klientdel. Dataene kommer ferdig fra serveren og friskes opp
 * av handlingene selv; her ligger bare hvilket ark som er åpent.
 */
export function HomeClient({ graph, reminders, logs, tags }: Props) {
  const [sheet, setSheet] = useState<'person' | 'relationship' | 'log' | null>(null)
  const [logPersonId, setLogPersonId] = useState<string | undefined>()
  const close = () => setSheet(null)

  // Stabil identitet: kartet bygger nodene på nytt når denne endres.
  const openLog = useCallback((personId?: string) => {
    setLogPersonId(personId)
    setSheet('log')
  }, [])

  const people = graph.persons.map((p) => ({ id: p.id, name: p.name }))

  return (
    <>
      {/* Skjermen minus headeren (64 px). Tidslinjen tar det den trenger, og
          kartet fyller resten — også når tidslinjen brettes ut, så siden
          aldri scroller. */}
      <div className="flex h-[calc(100dvh-64px)] flex-col">
        <TimelineStripe logs={logs} onAddLog={() => openLog()} />
        <div className="relative flex min-h-0 flex-1">
          <VennekartCanvas
            persons={graph.persons}
            relationships={graph.relationships}
            onAddPerson={() => setSheet('person')}
            onAddRelationship={() => setSheet('relationship')}
            onAddLog={openLog}
          />
          <RemindersPanel reminders={reminders} />
        </div>
      </div>

      <AddPersonModal isOpen={sheet === 'person'} onClose={close} tags={tags} />
      <AddRelationshipModal isOpen={sheet === 'relationship'} onClose={close} persons={people} />
      <LogEntryModal isOpen={sheet === 'log'} onClose={close} persons={people} defaultPersonId={logPersonId} />
    </>
  )
}
