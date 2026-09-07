import { getOwnedPerson } from '@/lib/person-query'
import { PersonProfile } from '@/components/person/PersonProfile'
import { PersonModalShell } from '@/components/person/PersonModalShell'

type Params = { params: Promise<{ id: string }> }

// (.)person/[id] avskjærer navigasjon fra kartet og viser profilen som
// modal. Laster du URL-en direkte, eller refresher, treffer du den fulle
// siden i stedet — samme innhold, samme komponent.
export default async function PersonModal({ params }: Params) {
  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) return null

  return (
    <PersonModalShell>
      <PersonProfile person={person} />
    </PersonModalShell>
  )
}
