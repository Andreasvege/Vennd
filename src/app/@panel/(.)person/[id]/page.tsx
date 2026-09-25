import { getPersonProfile } from '@/server/queries/person'
import { requireUserId } from '@/server/session'
import { PersonProfile } from '@/components/person/PersonProfile'
import { PanelSheet } from '@/components/person/PanelSheet'

type Params = { params: Promise<{ id: string }> }

// Avskjærer /person/[id] fra kartet, «I dag» eller loggen: profilen åpnes i
// panelet i stedet for å erstatte siden du står på.
export default async function PersonPanel({ params }: Params) {
  const { id } = await params
  const person = await getPersonProfile(await requireUserId(), id)
  if (!person) return null
  return (
    <PanelSheet label={person.name}>
      <PersonProfile person={person} />
    </PanelSheet>
  )
}
