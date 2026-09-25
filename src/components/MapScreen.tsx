'use client'

import { useState } from 'react'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { useComposer } from '@/components/composer/ComposerProvider'
import type { Graph } from '@/server/queries/graph'
import type { TagSummary } from '@/server/queries/tags'

/** Kartet med arkene som hører til det: ny person og ny relasjon. */
export function MapScreen({ graph, tags }: { graph: Graph; tags: TagSummary[] }) {
  const [sheet, setSheet] = useState<'person' | 'relationship' | null>(null)
  const openComposer = useComposer()
  const close = () => setSheet(null)

  return (
    <div className="relative flex h-full">
      <VennekartCanvas
        persons={graph.persons}
        relationships={graph.relationships}
        onAddPerson={() => setSheet('person')}
        onAddRelationship={() => setSheet('relationship')}
        onAddLog={(personId) => openComposer({ personIds: [personId] })}
      />
      <AddPersonModal isOpen={sheet === 'person'} onClose={close} tags={tags} />
      <AddRelationshipModal
        isOpen={sheet === 'relationship'}
        onClose={close}
        persons={graph.persons.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}
